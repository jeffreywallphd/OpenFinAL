import {IModelGateway} from "./IModelGateway";
import {OpenAIModelGateway} from "./OpenAIModelGateway";
import { HuggingFaceModelGateway } from "./HuggingFaceModelGateway";

export class ChatbotModelGatewayFactory {
    async createGateway(config: any): Promise<IModelGateway> {

        // For OpenAI API
        if(config["ChatbotModel"] === "OpenAIModel") {
            const key = await window.vault.getSecret("OPENAI_API_KEY");
            return new OpenAIModelGateway(key);
        } else if(config["ChatbotModel"] === "HuggingFaceModel") {
            const key = await window.vault.getSecret("HUGGINGFACE_API_KEY");
            return new HuggingFaceModelGateway(key);
        } else {
            //default will be OpenAi for now
            const key = await window.vault.getSecret("OPENAI_API_KEY");
            return new OpenAIModelGateway(key);
        }
    }
}