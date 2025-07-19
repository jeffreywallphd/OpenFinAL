import {IModelGateway} from "./IModelGateway";
import {OpenAIModelGateway} from "./OpenAIModelGateway";

export class NewsSummaryModelGatewayFactory {
    async createGateway(config: any): Promise<IModelGateway> {

        // For OpenAI API
        if(config["NewsSummaryModel"] === "OpenAIModel") {
            const key = await window.vault.getSecret("OPENAI_API_KEY");
            return new OpenAIModelGateway(key);
        }
        else {
            //default will be OpenAi for now
            const key = await window.vault.getSecret("OPENAI_API_KEY");
            return new OpenAIModelGateway(key);
        }
    }
}