import {IModelGateway} from "./IModelGateway";
import {OpenAIModelGateway} from "./OpenAIModelGateway";
import { HuggingFaceModelGateway } from "./HuggingFaceModelGateway";
import {EnvVariableExtractor} from "../../../Utility/EnvVariableExtractor";

export class ChatbotModelGatewayFactory {
    async createGateway(config: any): Promise<IModelGateway> {
        const extractor = new EnvVariableExtractor();

        // For OpenAI API
        if(config["ChatbotModel"] === "OpenAIModel") {
            const key = await extractor.extract("OPENAI_API_KEY");
            return new OpenAIModelGateway(key);
        } else if(config["ChatbotModel"] === "HuggingFaceModel") {
            const key = await extractor.extract("HUGGINGFACE_API_KEY");
            return new HuggingFaceModelGateway(key);
        } else {
            //default will be OpenAi for now
            const key = await extractor.extract("OPENAI_API_KEY");
            return new OpenAIModelGateway(key);
        }
    }
}