import {IInputBoundary} from "./IInputBoundary";
import {IRequestModel} from "../Gateway/Request/IRequestModel";
import {IResponseModel} from "../Gateway/Response/IResponseModel";
import {JSONResponse} from "../Gateway/Response/JSONResponse";
import { ConfigurationSection } from "../Entity/Configuration/ConfigurationSection";
import {Configuration} from "../Entity/Configuration/Configuration";
import {ConfigurationOption} from "../Entity/Configuration/ConfigurationOption";
import ConfigUpdater from "../Utility/ConfigManager";
import { valid } from "node-html-parser";

export class SettingsInteractor implements IInputBoundary {
    requestModel: IRequestModel;
    responseModel: IResponseModel;

    async post(requestModel: IRequestModel): Promise<IResponseModel> {   
        const configUpdater = new ConfigUpdater();
        const env = configUpdater.getEnv();
        const config = configUpdater.getConfig();

        const configurations = requestModel.request.configurations;

        //for the same value being used across different API gateways
        var previouslySetValues:any = [];

        window.console.log(configurations);

        for(var configuration of Object.values(configurations) as any[]) { 
            if(configuration.hasValue === true && configuration.valueIsKey === true && !previouslySetValues.includes(configuration.valueName)) {
                if(env[configuration.valueName] !== configuration.value) {
                    env[configuration.valueName] = configuration.value;
                    previouslySetValues.push(configuration.valueName);
                }   
            }
            
            if(configuration.name === configuration.valueName) {
                config[configuration.setting][configuration.name] = isNaN(Number(String(configuration.value).trim())) ? configuration.value : Number(String(configuration.value).trim());;
            } else {
                config[configuration.setting] = configuration.name;
            }
        }
        
        const configSaved = configUpdater.saveConfig(config);
        const envSaved = configUpdater.saveEnv(env);

        var status = null;

        if(config && envSaved) {
            status = 200;
        } else {
            status = 400;
        }

        const data = {
            response: {
                status: status,
                results: [
                    {configSaved: configSaved},
                    {envSaved: envSaved}
                ] 
            }
        };

        const response = new JSONResponse(JSON.stringify(data));

        return response.response;
    }
    
    async get(requestModel: IRequestModel): Promise<IResponseModel> {
        var json = requestModel.request;

        const configUpdater = new ConfigUpdater();
        const env = configUpdater.getEnv();
        const config = configUpdater.getConfig();

        //create StockGateway Configurations
        var currentStockGateway = null;

        var AlphaVantageStockGateway = new ConfigurationOption();
        AlphaVantageStockGateway.setFieldValue("id", this.generateId());
        AlphaVantageStockGateway.setFieldValue("setting", "StockGateway");
        AlphaVantageStockGateway.setFieldValue("label", "Alpha Vantage Stock API");
        AlphaVantageStockGateway.setFieldValue("name", "AlphaVantageStockGateway");
        AlphaVantageStockGateway.setFieldValue("hasValue", true);
        AlphaVantageStockGateway.setFieldValue("valueName", "ALPHAVANTAGE_API_KEY");
        AlphaVantageStockGateway.setFieldValue("valueSite", "https://www.alphavantage.co/support/#api-key");
        AlphaVantageStockGateway.setFieldValue("value", env["ALPHAVANTAGE_API_KEY"]);
        AlphaVantageStockGateway.setFieldValue("isActive", config.StockGateway === "AlphaVantageStockGateway" ? true : false);
        AlphaVantageStockGateway.setFieldValue("valueIsKey", true);

        currentStockGateway = config.StockGateway === "AlphaVantageStockGateway" ? AlphaVantageStockGateway : currentStockGateway;

        var FMPStockGateway = new ConfigurationOption();
        FMPStockGateway.setFieldValue("id", this.generateId());
        FMPStockGateway.setFieldValue("setting", "StockGateway");
        FMPStockGateway.setFieldValue("label", "Financial Modeling Prep Stock API");
        FMPStockGateway.setFieldValue("name", "FinancialModelingPrepGateway");
        FMPStockGateway.setFieldValue("hasValue", true);
        FMPStockGateway.setFieldValue("valueName", "FMP_API_KEY");
        FMPStockGateway.setFieldValue("valueSite", "https://site.financialmodelingprep.com/pricing-plans");
        FMPStockGateway.setFieldValue("value", env["FMP_API_KEY"]);
        FMPStockGateway.setFieldValue("isActive", config.StockGateway === "FinancialModelingPrepGateway" ? true : false);
        FMPStockGateway.setFieldValue("valueIsKey", true);

        currentStockGateway = config.StockGateway === "FinancialModelingPrepGateway" ? FMPStockGateway : currentStockGateway;

        var YFinanceStockGateway = new ConfigurationOption();
        YFinanceStockGateway.setFieldValue("id", this.generateId());
        YFinanceStockGateway.setFieldValue("setting", "StockGateway");
        YFinanceStockGateway.setFieldValue("label", "Yahoo Finance Stock API (Unofficial Community Version)");
        YFinanceStockGateway.setFieldValue("name", "YFinanceStockGateway");
        YFinanceStockGateway.setFieldValue("hasValue", false);
        YFinanceStockGateway.setFieldValue("isActive", config.StockGateway === "YFinanceStockGateway" ? true : false);
        
        currentStockGateway = config.StockGateway === "YFinanceStockGateway" ? YFinanceStockGateway : currentStockGateway;

        const stockGateways = [AlphaVantageStockGateway, FMPStockGateway, YFinanceStockGateway];
        
        var stockGatewayConfiguration = new Configuration();
        stockGatewayConfiguration.setFieldValue("id", this.generateId());
        stockGatewayConfiguration.setFieldValue("name", "StockGateway");
        stockGatewayConfiguration.setFieldValue("type", "select");
        stockGatewayConfiguration.setFieldValue("purpose", "A stock API will allow you to view price and volume data for stocks");
        stockGatewayConfiguration.setFieldValue("options", stockGateways);
        
        //create NewsGateway Configurations
        var currentNewsGateway = null;

        var AlphaVantageNewsGateway = new ConfigurationOption();
        AlphaVantageNewsGateway.setFieldValue("id", this.generateId());
        AlphaVantageNewsGateway.setFieldValue("setting", "NewsGateway");
        AlphaVantageNewsGateway.setFieldValue("label", "Alpha Vantage News API");
        AlphaVantageNewsGateway.setFieldValue("name", "AlphaVantageNewsGateway");
        AlphaVantageNewsGateway.setFieldValue("hasValue", true);
        AlphaVantageNewsGateway.setFieldValue("valueName", "ALPHAVANTAGE_API_KEY");
        AlphaVantageNewsGateway.setFieldValue("valueSite", "https://www.alphavantage.co/support/#api-key");
        AlphaVantageNewsGateway.setFieldValue("value", env["ALPHAVANTAGE_API_KEY"]);
        AlphaVantageNewsGateway.setFieldValue("isActive", config.NewsGateway === "AlphaVantageNewsGateway" ? true : false);
        AlphaVantageNewsGateway.setFieldValue("valueIsKey", true);

        currentNewsGateway = config.NewsGateway === "AlphaVantageNewsGateway" ? AlphaVantageNewsGateway : currentNewsGateway;

        const newsGateways = [AlphaVantageNewsGateway];
        
        var newsGatewayConfiguration = new Configuration();
        newsGatewayConfiguration.setFieldValue("id", this.generateId());
        newsGatewayConfiguration.setFieldValue("name", "NewsGateway");
        newsGatewayConfiguration.setFieldValue("type", "select");
        newsGatewayConfiguration.setFieldValue("purpose", "A news API will allow you to search for investment news");
        newsGatewayConfiguration.setFieldValue("options", newsGateways);

        //create ReportGateway Configurations
        var currentReportGateway = null;

        var SecReportGateway = new ConfigurationOption();
        SecReportGateway.setFieldValue("id", this.generateId());
        SecReportGateway.setFieldValue("setting", "ReportGateway");
        SecReportGateway.setFieldValue("label", "SEC Financial Report Gateway");
        SecReportGateway.setFieldValue("name", "SecAPIGateway");
        SecReportGateway.setFieldValue("hasValue", false);
        SecReportGateway.setFieldValue("isActive", config.ReportGateway === "SecAPIGateway" ? true : false);

        currentReportGateway = config.ReportGateway === "SecAPIGateway" ? SecReportGateway : currentReportGateway;

        const reportGateways = [SecReportGateway];
        
        var reportGatewayConfiguration = new Configuration();
        reportGatewayConfiguration.setFieldValue("id", this.generateId());
        reportGatewayConfiguration.setFieldValue("name", "ReportGateway");
        reportGatewayConfiguration.setFieldValue("type", "select");
        reportGatewayConfiguration.setFieldValue("purpose", "A report API will allow you to retrieve 10-Q and 10-K reports");
        reportGatewayConfiguration.setFieldValue("options", reportGateways);

        //create RatioGateway Configurations
        var currentRatioGateway = null;

        var RatioGateway = new ConfigurationOption();
        RatioGateway.setFieldValue("id", this.generateId());
        RatioGateway.setFieldValue("setting", "RatioGateway");
        RatioGateway.setFieldValue("label", "Alpha Vantage Ratio API Gateway");
        RatioGateway.setFieldValue("name", "AlphaVantageRatioGateway");
        RatioGateway.setFieldValue("hasValue", true);
        RatioGateway.setFieldValue("valueName", "ALPHAVANTAGE_API_KEY");
        RatioGateway.setFieldValue("valueSite", "https://www.alphavantage.co/support/#api-key");
        RatioGateway.setFieldValue("value", env["ALPHAVANTAGE_API_KEY"]);
        RatioGateway.setFieldValue("isActive", config.RatioGateway === "AlphaVantageRatioGateway" ? true : false);
        RatioGateway.setFieldValue("valueIsKey", true);

        currentRatioGateway = config.RatioGateway === "AlphaVantageRatioGateway" ? RatioGateway : currentReportGateway;

        const ratioGateways = [RatioGateway];
        
        var ratioGatewayConfiguration = new Configuration();
        ratioGatewayConfiguration.setFieldValue("id", this.generateId());
        ratioGatewayConfiguration.setFieldValue("name", "RatioGateway");
        ratioGatewayConfiguration.setFieldValue("type", "select");
        ratioGatewayConfiguration.setFieldValue("purpose", "A stock ratio API will allow you to view important financial ratios");
        ratioGatewayConfiguration.setFieldValue("options", ratioGateways);

        //create Chatbot Model Configurations
        var currentAIModel = null;

        var OpenAIModelGateway = new ConfigurationOption();
        OpenAIModelGateway.setFieldValue("id", this.generateId());
        OpenAIModelGateway.setFieldValue("setting", "ChatbotModel");
        OpenAIModelGateway.setFieldValue("label", "OpenAI Model API Gateway");
        OpenAIModelGateway.setFieldValue("name", "OpenAIModel");
        OpenAIModelGateway.setFieldValue("hasValue", true);
        OpenAIModelGateway.setFieldValue("valueName", "OPENAI_API_KEY");
        OpenAIModelGateway.setFieldValue("valueSite", "https://platform.openai.com/api-keys");
        OpenAIModelGateway.setFieldValue("value", env["OPENAI_API_KEY"]);
        OpenAIModelGateway.setFieldValue("isActive", config.ChatbotModel === "OpenAIModel" ? true : false);
        OpenAIModelGateway.setFieldValue("valueIsKey", true);

        currentAIModel = config.ChatbotModel === "OpenAIModel" ? OpenAIModelGateway : currentAIModel;

        const chatbotGateways = [OpenAIModelGateway];
        
        var chatbotModelGatewayConfiguration = new Configuration();
        chatbotModelGatewayConfiguration.setFieldValue("id", this.generateId());
        chatbotModelGatewayConfiguration.setFieldValue("name", "ChatbotModel");
        chatbotModelGatewayConfiguration.setFieldValue("type", "select");
        chatbotModelGatewayConfiguration.setFieldValue("purpose", "An AI API that will allow you to ask questions to the financial chatbot");
        chatbotModelGatewayConfiguration.setFieldValue("options", chatbotGateways);

        //create Chatbot Name Parameter Configuration
        var chatbotModelName = new ConfigurationOption();
        chatbotModelName.setFieldValue("id", this.generateId());
        chatbotModelName.setFieldValue("setting", "ChatbotModelSettings");
        chatbotModelName.setFieldValue("label", "Model Name");
        chatbotModelName.setFieldValue("name", "modelName");
        chatbotModelName.setFieldValue("hasValue", true);
        chatbotModelName.setFieldValue("valueName", "modelName");
        chatbotModelName.setFieldValue("value", config.ChatbotModelSettings.modelName);

        var chatbotModelNameConfiguration = new Configuration();
        chatbotModelNameConfiguration.setFieldValue("id", this.generateId());
        chatbotModelNameConfiguration.setFieldValue("name", "modelName");
        chatbotModelNameConfiguration.setFieldValue("type", "AIModel");
        chatbotModelNameConfiguration.setFieldValue("purpose", "The name of the language model you plan to use");
        chatbotModelNameConfiguration.setFieldValue("options", [chatbotModelName]);
        
        //create Chatbot Max Tokens Parameter Configuration
        var chatbotMaxTokens = new ConfigurationOption();
        chatbotMaxTokens.setFieldValue("id", this.generateId());
        chatbotMaxTokens.setFieldValue("setting", "ChatbotModelSettings");
        chatbotMaxTokens.setFieldValue("label", "Max Output Tokens");
        chatbotMaxTokens.setFieldValue("name", "maxOutputTokens");
        chatbotMaxTokens.setFieldValue("hasValue", true);
        chatbotMaxTokens.setFieldValue("valueName", "maxOutputTokens");
        chatbotMaxTokens.setFieldValue("value", config.ChatbotModelSettings.maxOutputTokens);

        var chatbotMaxTokensConfiguration = new Configuration();
        chatbotMaxTokensConfiguration.setFieldValue("id", this.generateId());
        chatbotMaxTokensConfiguration.setFieldValue("name", "maxOutputTokens");
        chatbotMaxTokensConfiguration.setFieldValue("type", "AIModel");
        chatbotMaxTokensConfiguration.setFieldValue("purpose", 'The maximum number of "words" the model is allowed to output');
        chatbotMaxTokensConfiguration.setFieldValue("options", [chatbotMaxTokens]);

        //create Chatbot Temperature Parameter Configuration
        var chatbotTemperature = new ConfigurationOption();
        chatbotTemperature.setFieldValue("id", this.generateId());
        chatbotTemperature.setFieldValue("setting", "ChatbotModelSettings");
        chatbotTemperature.setFieldValue("label", "Temperature");
        chatbotTemperature.setFieldValue("name", "temperature");
        chatbotTemperature.setFieldValue("hasValue", true);
        chatbotTemperature.setFieldValue("valueName", "temperature");
        chatbotTemperature.setFieldValue("value", config.ChatbotModelSettings.temperature);

        var chatbotTemperatureConfiguration = new Configuration();
        chatbotTemperatureConfiguration.setFieldValue("id", this.generateId());
        chatbotTemperatureConfiguration.setFieldValue("name", "temperature");
        chatbotTemperatureConfiguration.setFieldValue("type", "AIModel");
        chatbotTemperatureConfiguration.setFieldValue("purpose", 'Temperature values range between 0 and 1 with larger values representing greater randomness');
        chatbotTemperatureConfiguration.setFieldValue("options", [chatbotTemperature]);
        
        //create Chatbot TopP Parameter Configuration
        var chatbotTopP = new ConfigurationOption();
        chatbotTopP.setFieldValue("id", this.generateId());
        chatbotTopP.setFieldValue("setting", "ChatbotModelSettings");
        chatbotTopP.setFieldValue("label", "Top-p");
        chatbotTopP.setFieldValue("name", "topP");
        chatbotTopP.setFieldValue("hasValue", true);
        chatbotTopP.setFieldValue("valueName", "topP");
        chatbotTopP.setFieldValue("value", config.ChatbotModelSettings.topP);

        var chatbotTopPConfiguration = new Configuration();
        chatbotTopPConfiguration.setFieldValue("id", this.generateId());
        chatbotTopPConfiguration.setFieldValue("name", "topP");
        chatbotTopPConfiguration.setFieldValue("type", "AIModel");
        chatbotTopPConfiguration.setFieldValue("purpose", 'Top-p values range between 0 and 1 with smaller values limiting output predictions');
        chatbotTopPConfiguration.setFieldValue("options", [chatbotTopP]);        

        //Configuration Sections
        const dataConfigSection = new ConfigurationSection();
        dataConfigSection.setFieldValue("id", this.generateId());
        dataConfigSection.setFieldValue("label", "Financial Data API Configurations");
        dataConfigSection.setFieldValue("configurations", [stockGatewayConfiguration, newsGatewayConfiguration, reportGatewayConfiguration, ratioGatewayConfiguration]);

        const modelConfigSection = new ConfigurationSection();
        modelConfigSection.setFieldValue("id", this.generateId());
        modelConfigSection.setFieldValue("label", "Chatbot Configurations");
        modelConfigSection.setFieldValue("configurations", [chatbotModelGatewayConfiguration, chatbotModelNameConfiguration, chatbotMaxTokensConfiguration, chatbotTemperatureConfiguration, chatbotTopPConfiguration]);

        var data = {};

        if(json.action && json.action == "getCurrent") {  
            data = {
                response: {   
                    results: [
                        {
                            StockGateway: currentStockGateway.toObject(),
                            NewsGateway: currentNewsGateway.toObject(),
                            ReportGateway: currentReportGateway.toObject(),
                            RatioGateway: currentRatioGateway.toObject(),
                            ChatbotModel: currentAIModel.toObject(),
                            modelName: chatbotModelName.toObject(),
                            maxOutputTokens: chatbotMaxTokens.toObject(),
                            temperature: chatbotTemperature.toObject(),
                            topP: chatbotTopP.toObject()
                        }
                    ]
            }};
        } else if(json.action && json.action == "isConfigured") {
            var validCount = 0;

            const currentConfigurations = [
                currentStockGateway.toObject(), 
                currentNewsGateway.toObject(), 
                currentReportGateway.toObject(), 
                currentRatioGateway.toObject(), 
                currentAIModel.toObject()
            ];

            for(var configuration of currentConfigurations as any) {
                if(configuration.hasValue && env[configuration.valueName].length > 1) {
                    validCount++;
                } else if(!configuration.hasValue) {
                    validCount++;
                }
            }

            if(validCount == currentConfigurations.length) {    
                data = {
                    response: {
                        status: 200
                    }
                };
            } else {
                data = {
                    response: {
                        status: 400
                    }
                };
            }
        } else {
            data = {
                response: {   
                    results: [
                        dataConfigSection.toObject(),
                        modelConfigSection.toObject()
                    ]
            }};
        }

        const response = new JSONResponse(JSON.stringify(data));
        return response.response;
    }
    
    async put(requestModel: IRequestModel): Promise<IResponseModel> {
        return this.post(requestModel);
    }
    
    async delete(requestModel: IRequestModel): Promise<IResponseModel> {
        throw new Error("Configurations cannot be deleted.");
    }

    generateId(length = 10) {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        return Array.from({ length }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
    }
}