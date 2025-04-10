import {IKeyedModelGateway} from "./IKeyedModelGateway";
import ConfigUpdater from "../../../Utility/ConfigManager";

declare global {
    interface Window { chatbot: any; }
}

export class OpenAIModelGateway implements IKeyedModelGateway{
    key: any;

    constructor(key: string) {
        this.key = key;
    }

    async create(model: string, messages: any[]): Promise<any> {
        try {
            const configManager = new ConfigUpdater();
            const config = configManager.getConfig();

            const response = await fetch("https://api.openai.com/v1/chat/completions", {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${this.key}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    model: model,
                    messages: messages,
                    max_tokens: config.ChatbotModelSettings.maxOutputTokens,
                    temperature: config.ChatbotModelSettings.temperature,
                    top_p: config.ChatbotModelSettings.topP
                }),
            });
            
            const data = await response.json();
            window.console.log(data);

            if(response.ok && data.choices) {
                return data.choices[0].message;
            }

            var message = {
                role: "assistant",
                content: ""
            };

            if(response.status === 403) {
                if(data.error.code === "model_not_found") {
                    message.content = `The OpenAI key you provided does not grant you access to the ${model} model. Please update the OpenFinAL chatbot settings to utilize an appropriate model or change the settings of your OpenAI account to support the ${model} model.`;
                    return message;
                } else {
                    message.content = "Your OpenFinAL OpenAI settings don't appear to grant you access to the requested model";
                    return message;
                }
            } 
            
            if(response.status === 401) {
                if(data.error.code === "invalid_api_key") {
                    message.content = `The OpenAI key you provided is not a valid key for the configured account. Please retrieve a valid key from your OpenAI account and add it to the OpenFinAL chatbot settings.`;
                    return message;
                } else {
                    message.content = "You are not authorized to use the configured OpenAI model";
                    return message;
                }
            } else {
                message.content = `An unknown error occurred. We cannot fulfill your request at this time.`;
                return message;
            }            
        } catch (e) {
            window.console.error(e);
        }
    }
    
}