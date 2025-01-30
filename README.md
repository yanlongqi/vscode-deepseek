<p align="center">
<h1 align="center">DeepSeek Agent for Github Copilot Chat Extension</h1>
</p>
<p align="center">
<img src="deepseek.png" alt="DeepSeek" width="200"/>
</p>


This extension allows you to interact with the DeepSeek models for Github Copilot Chat, fully locally and offline. It uses Ollama under the hood to provide a seamless experience.

## How to use

1. Install the extension
2. Open Github Copilot Chat panel
3. In the chat, type `@deepseek` followed by your prompt

> [!NOTE] 
> During the first run, the extension will download the model. This may take a few minutes.

## Settings

You can configure the extension by opening the settings panel (or `settings.json`) and editing the following settings:

```json

{
    "deepseek.model.name": "deepseek-coder:1.3b",
}
```

> [!NOTE] 
> You can find a list of available DeepSeek models at [ollama.com](https://ollama.com/search?q=deepseek).


## Requirements

This extension requires the Ollama model to be installed. You can install it by following the instructions from [ollama.com](https://ollama.com/).

