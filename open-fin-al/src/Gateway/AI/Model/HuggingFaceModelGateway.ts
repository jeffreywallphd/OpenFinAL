import {IKeyedModelGateway} from "./IKeyedModelGateway";
import ConfigUpdater from "../../../Utility/ConfigManager";
import {pipeline} from "@xenova/transformers";

// allow the transformers contextBridge to be used in TypeScript
declare global {
    interface Window { transformers: any }
}

export class HuggingFaceModelGateway implements IKeyedModelGateway{
    key: any;
    purpose: string;

    constructor(key: string, purpose: string = "ChatbotModel") {
        this.key = key;
        this.purpose = purpose;
    }

    async create(model: string, messages: any[]): Promise<any> {
        try {
            const configManager = new ConfigUpdater();
            const config:any = configManager.getConfig();

            var params = {
                max_new_tokens: config.ChatbotModelSettings.ChatbotModelMaxOutputTokens,
                temperature: config.ChatbotModelSettings.ChatbotModelTemperature,
                top_p: config.ChatbotModelSettings.ChatbotModelTopP,
            };

            if(this.purpose === "NewsSummaryModel") {
                var params = {
                    max_new_tokens: config.NewsSummaryModelSettings.NewsSummaryModelMaxOutputTokens,
                    temperature: config.NewsSummaryModelSettings.NewsSummaryModelTemperature,
                    top_p: config.NewsSummaryModelSettings.NewsSummaryModelTopP,
                };
            }

            const pipe = await pipeline("text-generation", model); 
            const output = await pipe(messages, params);

            //const output = await window.transformers.generate(model, "text-generation", params, messages);
            window.console.log(output);
            //const data = await output.json();
            //window.console.log(data);

            var message = {
                role: "assistant",
                content: ""
            };

        } catch (e) {
            window.console.error(e);
        }
    }
    
}