import {IModelGateway} from "./IModelGateway";
import {OpenAIModelGateway} from "./OpenAIModelGateway";
import {EnvVariableExtractor} from "../../../Utility/EnvVariableExtractor";

export class NewsSummaryModelGatewayFactory {
    async createGateway(config: any): Promise<IModelGateway> {
        const extractor = new EnvVariableExtractor();

        // For OpenAI API
        if(config["NewsSummaryModel"] === "OpenAIModel") {
            const key = await extractor.extract("OPENAI_API_KEY");
            return new OpenAIModelGateway(key);
        }
        else {
            //default will be OpenAi for now
            const key = await extractor.extract("OPENAI_API_KEY");
            return new OpenAIModelGateway(key);
        }
    }
}