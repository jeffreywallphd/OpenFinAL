# Chatbot Feature

## Feature Objectives:
The chatbot feature intends to provide users with a simple interface to ask finance-related questions to enhance use of the software, direct users to appropriate tools in the software, and appropriate use of those tools. 

## Current Capabilities:
- **Popup Button**: Introduced a popup circle button that serves as an interactive icon to show and hide the chatbot.
- **Popup Chatbot Window**: A chatbot popup window was added to display chatbot messages and interactions.
- **ModelGateway Interfaces and Adapters**: Interfaces were created for language model connections, including IModelGateway, IModelKeylessGateway, and IModelKeyedGateway. A Factory class was also created for the model gateways to choose from specific model interface implementations using the config file. Currently, the chatbot has a keyed gateway to OpenAI's models.
- **Single Message Interactions**: At the moment, the OpenAI model gateway is limited to sending single user messages. However, the entire conversation context could be passed to the model.
- **Limited Model Parameters**: At the moment, model gateways only allow for setting the model name and the messages. For testing, the max_tokens parameter was set to a small number, which is hard coded in the OpenAI gateway file. 

## Future Capability Ideas:
- **More Model Parameters**: As an easy starting point, more important parameters, such as max_tokens, temperature, top_p, and top_k could be included in the IModelGateways and their implementations.
- **Multi-Message Tracking**: The context of the conversation could be included in all submissions to the language model by adding the full conversation context to the messages parameter of the create() method of the IModelGateway implementations. The multiple messages are currently tracked in the user interface, the full list of messages would simply need to be passed to the model gateway.
- **More Model Implementations**: Other proprietary and local and open-source models could be added to the IModelGateway implementation list. For example, IModelGateway implementations could be created for Gemini, Anthropic, HuggingFace with multiple open-source models, etc.
- **Model Configuration**: Currently, the OpenAI API key must be configured manually in the .env file. The Settings area needs to be updated to include configuration options for which model to use, model parameters, and API keys. It could be possible to have a separate chatbot configuration gear on the chatbot itself. Consider the value of a separate configuration as compared to the main configuration area. May need to start creating sections for the configuration area.

## Major Refactoring:
- **Removed Voiceflow Bot**: Removed the previous Voiceflow bot implementation to streamline the system and integrate new chatbot features. The Voiceflow bot required configurations on Voiceflow that were not possible, because it wasn't created on a shared account.

