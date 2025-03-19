import {IKeyedModel} from "./IKeyedModel";
import OpenAI from "openai";
import ChatCompletionCreateParamsNonStreaming from "openai"
import ChatCompletionCreateParamsStreaming from "openai"
import ChatCompletionCreateParamsBase from "openai"



export class OpenAiModel implements IKeyedModel{
    key: string;
    modelName: string;
    async create(message: ChatCompletionCreateParamsNonStreaming): object {
        try{
            const client = new OpenAI(api_key=this.key);
            const completion = await client.chat.completions.create(message);
            return completion;
        } catch (e) {

        }
    }
    constructor(key: string) {
        this.key = key;
    }
}