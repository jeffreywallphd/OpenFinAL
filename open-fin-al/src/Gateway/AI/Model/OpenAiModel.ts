import {IKeyedModel} from "./IKeyedModel";
import OpenAI from "openai";
import ChatCompletionCreateParamsNonStreaming from "openai"
import ChatCompletionCreateParamsStreaming from "openai"
import ChatCompletionCreateParamsBase from "openai"



export class OpenAiModel implements IKeyedModel{
    key: any;
    async create(model: string, messages: any[]): Promise<any> {
        let api_key;
        try {
            const client = new OpenAI(api_key = this.key);
            const completion = await client.chat.completions.create({
                model: model,
                messages: messages,
            });
            return completion;
        } catch (e) {

        }
    }
    constructor(key: string) {
        this.key = key;
    }
}