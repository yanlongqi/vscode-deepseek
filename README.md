<h1 align="center">OpenAI Copilot 编程助手</h1>

<h3 align="center">
    <a href="https://marketplace.visualstudio.com/items?itemName=yanlongqi.vscode-openai-copilot" alt="商店版本">
        <img src="https://img.shields.io/visual-studio-marketplace/v/yanlongqi.vscode-openai-copilot?label=VS%20Code%20商店&style=flat-square" />
    </a>
    <img alt="开源协议" src="https://img.shields.io/github/license/yanlongqi/vscode-openai-chat?style=flat-square"/>
    <img alt="版本" src="https://img.shields.io/badge/版本-预览版-pink?style=flat-square"/>
</h3>

# OpenAI Copilot Chat Assistant

VS Code 的智能编程助手，基于 OpenAI 强大的语言模型，为开发者提供全方位的编程支持。

## ✨ 特性

- 🤖 支持 GPT-3.5/4.0 等多个模型
- 💬 支持流式响应，实时对话
- 🛠️ 完全可配置的 API 设置
- 🌐 支持自定义 API 代理
- 📝 中文优化，更好的编程体验
- 🔧 深度集成 VS Code，支持代码相关操作

## 📋 前提条件

- VS Code 1.85.0 或更高版本
- OpenAI API 密钥
- 稳定的网络连接

## 🚀 安装

1. 在 VS Code 中打开扩展面板 (Ctrl+Shift+X)
2. 搜索 "OpenAI for Copilot Chat"
3. 点击安装

## ⚙️ 配置

在 VS Code 的设置中配置以下选项：

- `openai.chat.model`: 选择要使用的模型（默认：gpt-3.5-turbo）
- `openai.api.baseUrl`: API 服务器地址（默认：https://api.openai.com/v1）
- `openai.api.key`: 你的 OpenAI API 密钥

你可以通过以下方式配置：

1. 打开命令面板 (Ctrl+Shift+P)
2. 输入 "settings"
3. 选择 "Preferences: Open Settings (JSON)"
4. 添加配置：

```json
{
    "openai.chat.model": "gpt-3.5-turbo",
    "openai.api.baseUrl": "https://api.openai.com/v1",
    "openai.api.key": "你的API密钥"
}
```

## 🎯 使用方法

1. 打开命令面板 (Ctrl+Shift+P)
2. 输入 "Open Chat View"
3. 选择 "编程助手" 作为对话对象
4. 开始聊天！

## 💡 提示

- 插件默认使用中文回复
- 支持代码补全和解释
- 可以询问编程相关的任何问题

## ❓ 常见问题

**Q: 为什么连接不上 API？**  
A: 请检查：
- API 密钥是否正确配置
- 网络连接是否正常
- API 地址是否可访问

**Q: 如何更换模型？**  
A: 在设置中修改 `openai.chat.model` 的值即可。

**Q: 支持哪些模型？**  
A: 支持所有 OpenAI 的聊天模型，如：
- gpt-3.5-turbo
- gpt-4（需要相应权限）

## 📜 许可证

MIT License

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

