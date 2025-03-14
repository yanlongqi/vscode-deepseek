import OpenAI from "openai";
import * as vscode from "vscode";

const AGENT_PARTICIPANT_ID = "dev.yanlongqi.agents.openai";
const BASE_PROMPT = `作为一个专业的编程助手，我将帮助你解决各种开发问题，提供技术建议和代码指导。我会使用中文回答，确保沟通清晰且富有帮助。`;
const MODEL = "gpt-3.5-turbo";
const API_BASE_URL = "https://api.openai.com/v1";
const HIDDEN_ERROR_MESSAGE_PLACEHOLDER = "&nbsp;";

interface IAgentChatResult extends vscode.ChatResult {
  metadata: {
    command: string;
  };
}

const logger = vscode.env.createTelemetryLogger({
  sendEventData(eventName, data) {
    // Capture event telemetry
    console.log(`Event: ${eventName}`);
    console.log(`Data: ${JSON.stringify(data)}`);
  },
  sendErrorData(error, data) {
    // Capture error telemetry
    console.error(`Error: ${error}`);
    console.error(`Data: ${JSON.stringify(data)}`);
  },
});

type Message = OpenAI.Chat.ChatCompletionMessageParam;

function readModelFromConfig() {
  const workbenchConfig = vscode.workspace.getConfiguration("openai");
  return (workbenchConfig.get("chat.model") ?? MODEL) as string;
}

function readBaseUrlFromConfig() {
  const workbenchConfig = vscode.workspace.getConfiguration("openai");
  return (workbenchConfig.get("api.baseUrl") ?? API_BASE_URL) as string;
}

function readApiKeyFromConfig() {
  const workbenchConfig = vscode.workspace.getConfiguration("openai");
  const apiKey = workbenchConfig.get("api.key") as string;
  if (!apiKey) {
    throw new Error("请在设置中配置 OpenAI API Key (openai.api.key)");
  }
  return apiKey;
}

export async function assertApiRunning(client: OpenAI, stream: vscode.ChatResponseStream) {
  try {
    await client.models.list();
  } catch (error) {
    throw new Error("API 服务未运行或密钥无效");
  }
}

async function assertModelAvailable(
  client: OpenAI,
  model: string,
  stream: vscode.ChatResponseStream
) {
  const models = await client.models.list();
  if (!models.data.find(m => m.id === model)) {
    stream.progress(`未找到模型 ${model}\n`);
    throw new Error(`模型 ${model} 不可用`);
  }
}

// To talk to an LLM in your subcommand handler implementation, your
// extension can use VS Code's `requestChatAccess` API to access the Copilot API.
// The GitHub Copilot Chat extension implements this provider.
async function agentHandler(
  request: vscode.ChatRequest,
  context: vscode.ChatContext,
  stream: vscode.ChatResponseStream
): Promise<IAgentChatResult> {
  try {
    const tools = await getTools();
    const model = readModelFromConfig();
    const client = new OpenAI({
      apiKey: readApiKeyFromConfig(),
      baseURL: readBaseUrlFromConfig()
    });

    const messages: Message[] = [
      {
        role: "system",
        content: BASE_PROMPT,
      },
      ...appendAssistantHistory(context),
      {
        role: "user",
        content: request.prompt,
      },
    ];

    const chatResponse = await streamResponse(client, model, messages, tools);
    for await (const chunk of chatResponse) {
      if (chunk.choices[0]?.delta?.content) {
        stream.markdown(chunk.choices[0].delta.content);
      }
    }
  } catch (err) {
    handleError(logger, err, stream);
  }

  return { metadata: { command: "" } };
}

function handleError(
  logger: vscode.TelemetryLogger,
  err: any,
  stream: vscode.ChatResponseStream
): void {
  logger.logError(err);
  console.log({err});

  if (err.code === "ERR_INVALID_URL" || err.cause?.code === "ECONNREFUSED") {
    const baseUrl = readBaseUrlFromConfig();
    stream.markdown(
      vscode.l10n.t(
        HIDDEN_ERROR_MESSAGE_PLACEHOLDER+
        "OpenAI API 连接失败\n\n"+
        "请检查以下内容：\n\n"+
        "- 是否正确配置了 OpenAI API Key\n"+
        `- API 服务器 [${baseUrl}](${baseUrl}) 是否可访问\n`+
        "- 配置文件 [settings.json](https://code.visualstudio.com/docs/getstarted/settings) 中的设置是否正确\n\n"+
        `错误信息：\`${err.message} (错误代码：${(err.code || err.cause?.code) || '未知'})\``
      )
    );
  }
  else {
    stream.markdown(
      vscode.l10n.t(
        "抱歉，我遇到了一些问题。需要帮助吗？"
      )
    );
  }
}

function appendAssistantHistory(context: vscode.ChatContext) {
  const messages: any[] = [];
  // add the previous messages to the messages array
  context.history.forEach((m) => {
    let fullMessage = "";

    if (m instanceof vscode.ChatResponseTurn) {
      m.response.forEach((r) => {
        const mdPart = r as vscode.ChatResponseMarkdownPart;
        const {value} = mdPart.value;

        // skip error messages
        if (!value.startsWith(HIDDEN_ERROR_MESSAGE_PLACEHOLDER)) {
          fullMessage += value;
        }
      });

      if (fullMessage) {
        messages.push({
          role: "assistant",
          content: fullMessage,
        });
      }
    } else if (m instanceof vscode.ChatRequestTurn) {
      messages.push({
        role: "user",
        content: m.prompt,
      });
    }
  });

  return messages;
}

async function* streamResponse(
  client: OpenAI,
  model: string,
  messages: Message[],
  tools: any
) {
  try {
    console.log("Using model:", model);
    console.log({ messages });

    const stream = await client.chat.completions.create({
      model,
      messages,
      stream: true,
    });

    for await (const chunk of stream) {
      yield chunk;
    }
  } catch (err: any) {
    console.error(err.message);
  }
}

async function registerParticipant(context: vscode.ExtensionContext) {
  const agent = vscode.chat.createChatParticipant(
    AGENT_PARTICIPANT_ID,
    agentHandler
  );
  agent.iconPath = vscode.Uri.joinPath(context.extensionUri, "openai.png");

  context.subscriptions.push(
    agent.onDidReceiveFeedback((feedback: vscode.ChatResultFeedback) => {
      logger.logUsage("chatResultFeedback", {
        kind: feedback.kind,
      });
    })
  );
}

async function getTools() {
  const tools = vscode.lm.tools.map(
    (tool: vscode.LanguageModelToolInformation) => {
      return {
        type: "function",
        function: {
          name: tool.name,
          description: tool.description,
          parameters: tool.inputSchema,
        },
      };
    }
  );
  return tools;
}

export function activate(context: vscode.ExtensionContext) {
  registerParticipant(context);
}

// This method is called when your extension is deactivated
export function deactivate() {}
