# Chatbot Feature

## Feature Objectives:
The chatbot feature intends to provide users with a simple interface to ask finance-related questions to enhance use of the software, direct users to appropriate tools in the software, and appropriate use of those tools.

## Current Capabilities:
- **Popup Button**: Introduced a popup circle button that serves as an interactive icon to show and hide the chatbot.
- **Popup Chatbot Window**: A chatbot popup window was added to display chatbot messages and interactions.
- **ModelGateway Interfaces and Adapters**: Interfaces were created for language model connections, including `IModelGateway`, `IModelKeylessGateway`, and `IModelKeyedGateway`. A Factory class was also created for the model gateways to choose from specific model interface implementations using the config file.
- **OpenAI Integration (Working)**: The chatbot is now fully functional with a keyed gateway to OpenAI's `chat/completions` API. The gateway successfully authenticates using the provided API key and submits requests with user messages to receive model-generated responses.
- **Single and Multi-Message Interactions**: The chatbot now supports sending multiple user and assistant messages (i.e. conversation history) to the model via the `messages` array. This enables contextual and coherent responses.
- **Modular Model Gateway System**: The model gateway architecture is modular and extensible, allowing support for additional models or providers with minimal integration changes.
- **Controlled Model Parameters**: Currently, model gateways support `model`, `messages`, and a hardcoded `max_tokens` setting. The chatbot uses `gpt-3.5-turbo` by default, but other model names can be configured via the settings file.

## Future Capability Ideas:
- **Extended Model Parameters**: Add support for more OpenAI parameters like `temperature`, `top_p`, `frequency_penalty`, and `presence_penalty` to allow finer control over model behavior.
- **UI for Model Settings**: Integrate a settings menu (either in the main config panel or directly within the chatbot popup) to allow users to choose model providers, set API keys, adjust model parameters, and toggle between models.
- **More Model Implementations**: Extend the factory to support additional platforms like Gemini, Anthropic Claude, Hugging Face models, or local LLMs (e.g., Ollama or Llama.cpp). This would diversify chatbot behavior and offline capabilities.
- **Advanced Memory Handling**: Implement in-session or persistent memory to allow the chatbot to recall past sessions, reference previous questions, or use short-term memory buffers for advanced interaction logic.
- **Tool Integration via Natural Language**: Enable the chatbot to perform software-specific actions (like retrieving stocks, charts, or news) based on user queries — turning it into a smart assistant rather than just an LLM wrapper.

## Major Refactoring:
- **Removed Voiceflow Bot**: Removed the previous Voiceflow bot implementation to streamline the system and integrate new chatbot features. The Voiceflow bot required configurations on Voiceflow that were not possible, because it wasn't created on a shared account.
- **Replaced with Custom Gateway System**: The new implementation is fully local and extensible, improving maintainability and future development flexibility.
