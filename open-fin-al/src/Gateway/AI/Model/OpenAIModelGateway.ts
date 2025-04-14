import {IKeyedModelGateway} from "./IKeyedModelGateway";
import ChatCompletionCreateParamsNonStreaming from "openai"
import ChatCompletionCreateParamsStreaming from "openai"
import ChatCompletionCreateParamsBase from "openai"

declare global {
    interface Window { chatbot: any; }
}

export class OpenAIModelGateway implements IKeyedModelGateway{
    key: any;

    constructor(key: string) {
        this.key = key;
    }

    async create(model: string, messages: any[]): Promise<any> {
        window.console.log("The key is: " + this.key);
        window.console.log(JSON.stringify({
            model: model,
            message: messages,
            max_tokens: 20,
        }));
        try {
            const response = await fetch("https://api.openai.com/v1/chat/completions", {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${this.key}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    model: model,
                    messages: messages,
                    max_tokens: 20,
                }),
            });
            
            const data = await response.json();

            return data.choices[0].message;
        } catch (e) {
            window.console.error(e);
        }
    }
    
}