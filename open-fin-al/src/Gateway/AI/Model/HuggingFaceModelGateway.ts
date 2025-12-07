import {IKeyedModelGateway} from "./IKeyedModelGateway";
import ConfigUpdater from "../../../Utility/ConfigManager";
import {pipeline} from "@xenova/transformers";
import { env } from '@xenova/transformers';
env.allowLocalModels = false;
env.localModelPath = '/models'; // resolves to http://localhost:3000/models

// allow the transformers contextBridge to be used in TypeScript
declare global {
    interface Window { transformers: any }
}

type ChatMessage = { role: "system" | "user" | "assistant"; content: string };
type HFGen = { generated_text: string } | { generated_text: string }[];

export class HuggingFaceModelGateway implements IKeyedModelGateway{
    key: any;
    purpose: string;

    constructor(key: string, purpose: string = "ChatbotModel") {
        this.key = key;
        this.purpose = purpose;
    }

    async create(model: string, messages: any[]): Promise<any> {
        window.console.log(model);
        const message = { role: "assistant", content: "" as string };

        try {
            const configManager = new ConfigUpdater();
            const config:any = configManager.getConfig();

            let maxTokens = config.ChatbotModelSettings?.maxOutputTokens ?? 256;
            let temperature = config.ChatbotModelSettings?.temperature ?? 0.7;
            let topP = config.ChatbotModelSettings?.topP ?? 0.9;

            if (this.purpose === "NewsSummaryModel") {
                maxTokens = config.NewsSummaryModelSettings?.maxOutputTokens ?? maxTokens;
                temperature = config.NewsSummaryModelSettings?.temperature ?? temperature;
                topP = config.NewsSummaryModelSettings?.topP ?? topP;
            }

            const params: Record<string, any> = {
                max_new_tokens: maxTokens,
                temperature,
                top_p: topP,
                // repetition_penalty: 1.05,
                // do_sample: temperature > 0,
            };

            // 3) Build a simple prompt inline (no separate helper)
            //    Format: optional System, then alternating User/Assistant turns, end with "Assistant:" cue.
            const sys = (messages as ChatMessage[])
                .filter(m => m.role === "system")
                .map(m => m.content?.trim())
                .filter(Boolean)
                .join("\n");
            const convo = (messages as ChatMessage[])
                .filter(m => m.role !== "system")
                .map(m => `${m.role === "user" ? "User" : "Assistant"}: ${m.content?.trim() ?? ""}`)
                .join("\n");
            const prompt = `${sys ? `System: ${sys}\n\n` : ""}${convo}\nAssistant:`;
            window.console.log(prompt);
            const pipe = await pipeline("text-generation", model); 
            const result = (await pipe(prompt, params)) as HFGen;

            // 5) Extract text and strip echoed prompt if present
            const generated = Array.isArray(result)
                ? result[0]?.generated_text ?? ""
                : (result as any)?.generated_text ?? "";
            let completion = generated.startsWith(prompt) ? generated.slice(prompt.length) : generated;
            completion = completion.replace(/^\s+/, ""); // trim leading whitespace

            window.console.log(completion);

            message.content = completion || "(no content)";
            return message; 

        } catch (e) {
            window.console.error(e);
        }
    }
    
}