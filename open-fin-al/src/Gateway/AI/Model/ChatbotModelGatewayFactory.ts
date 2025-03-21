import {IModel} from "./IModel";
import {OpenAiModel} from "./OpenAiModel";
import {EnvVariableExtractor} from "../../../Utility/EnvVariableExtractor";

export class ChatbotModelGatewayFactory {
    async createGateway(config: any): Promise<IModel> {
        const extractor = new EnvVariableExtractor();

        // For OpenAI API
        if(config["ChatbotModel"] === "OpenAiModel") {
            const key = await extractor.extract("OPENAI_API_KEY");
            return new OpenAiModel(key);
        }
        else {
            //default will be OpenAi for now
            const key = await extractor.extract("OPENAI_API_KEY");
            return new OpenAiModel(key);
        }
    }
}