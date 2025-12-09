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
                repetition_penalty: 1.15,
                // do_sample: temperature > 0,
            };

            // Build a simple prompt inline (no separate helper)
            // Format: optional System, then alternating User/Assistant turns, end with "Assistant:" cue.
            // Choose a default system prompt if none provided
            let defaultSystemPrompt = "You are a helpful, concise AI assistant.";
            
            if (this.purpose === "NewsSummaryModel") {
                defaultSystemPrompt =
                "You summarize news articles in simple, neutral language. Focus on the key facts and avoid speculation.";
            } else if (this.purpose === "ChatbotModel") {
                defaultSystemPrompt =
                "You are a friendly financial chatbot. Respond to the user in plain language.";
            }

            const sys = (messages as ChatMessage[])
                .filter(m => m.role === "system")
                .map(m => m.content?.trim())
                .filter(Boolean)
                .join("\n");

            const systemText = sys.length > 0 ? sys : defaultSystemPrompt;

            const convo = (messages as ChatMessage[])
                .filter(m => m.role !== "system")
                .map(m => `${m.role === "user" ? "User" : "Assistant"}: ${m.content?.trim() ?? ""}`)
                .join("\n");

            const prompt = `${systemText ? `System: ${systemText}\n\n` : ""}${convo}\nAssistant:`;
            window.console.log(prompt);
            
            // moved pipeline to main.js to allow for larger models
            // renderer process has limited memory and cannot load large models
            const result = await window.transformers.runTextGeneration(model, prompt, params) as HFGen;

            // Extract text and strip echoed prompt if present
            const generated = Array.isArray(result)
                ? result[0]?.generated_text ?? ""
                : (result as any)?.generated_text ?? "";
            
            let completion = generated.startsWith(prompt) ? generated.slice(prompt.length) : generated;
            completion = completion.replace(/^\s+/, ""); // trim leading whitespace

            window.console.log(completion);

            message.content = completion || "Failed to generate a response";
            return message; 

        } catch (e) {
            window.console.error("HuggingFaceModelGateway error:", e);
            if (e?.cause) {
                window.console.error("Inner cause:", e.cause);
            }
            message.content = "Sorry, there was a problem running the local model.";
            return message;
        }
    }
    
}