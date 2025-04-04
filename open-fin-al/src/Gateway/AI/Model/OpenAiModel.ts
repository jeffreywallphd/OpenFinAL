import {IKeyedModel} from "./IKeyedModel";
import ChatCompletionCreateParamsNonStreaming from "openai"
import ChatCompletionCreateParamsStreaming from "openai"
import ChatCompletionCreateParamsBase from "openai"

declare global {
    interface Window { chatbot: any; }
}

export class OpenAiModel implements IKeyedModel{
    key: any;
    async create(model: string, messages: any[]): Promise<any> {
        let api_key;
        try {
            const response = await fetch("https://api.openai.com/v1/completions", {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${this.key}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    model: model,
                    message: messages,
                    max_tokens: 20,
                }),
            });
            // TODO: Change model and message parameters to be a single parameter that accepts a JSON structure
            const data = await response.json();
            let output = data.choices[0].text.trim();
            window.console.log(output);
        } catch (e) {
            window.console.error(e);
        }
    }
    constructor(key: string) {
        this.key = key;
    }
}