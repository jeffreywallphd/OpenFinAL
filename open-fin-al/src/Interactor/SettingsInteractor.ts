import {IInputBoundary} from "./IInputBoundary";
import {IRequestModel} from "../Gateway/Request/IRequestModel";
import {IResponseModel} from "../Gateway/Response/IResponseModel";
import {JSONResponse} from "../Gateway/Response/JSONResponse";
import { ConfigurationSection } from "../Entity/Configuration/ConfigurationSection";
import {Configuration} from "../Entity/Configuration/Configuration";
import {ConfigurationOption} from "../Entity/Configuration/ConfigurationOption";
import ConfigUpdater from "../Utility/ConfigManager";

export class SettingsInteractor implements IInputBoundary {
    requestModel: IRequestModel;
    responseModel: IResponseModel;

    async post(requestModel: IRequestModel): Promise<IResponseModel> {   
        const configUpdater = new ConfigUpdater();
        const env = configUpdater.getEnv();
        const config = configUpdater.getConfig();

        const configurations = requestModel.request.configurations;

        for(var [configName, configuration] of Object.entries(configurations) as any[]) { 
            if(configuration.hasKey === true) {
                env[configuration.keyName] = configuration.key;
            }
            
            config[configName] = configuration.value;
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
        AlphaVantageStockGateway.setFieldValue("name", "Alpha Vantage Stock API");
        AlphaVantageStockGateway.setFieldValue("value", "AlphaVantageStockGateway");
        AlphaVantageStockGateway.setFieldValue("hasKey", true);
        AlphaVantageStockGateway.setFieldValue("keyName", "ALPHAVANTAGE_API_KEY");
        AlphaVantageStockGateway.setFieldValue("key", env["ALPHAVANTAGE_API_KEY"]);
        AlphaVantageStockGateway.setFieldValue("isActive", config.StockGateway === "AlphaVantageStockGateway" ? true : false);

        currentStockGateway = config.StockGateway === "AlphaVantageStockGateway" ? AlphaVantageStockGateway : currentStockGateway;

        var FMPStockGateway = new ConfigurationOption();
        FMPStockGateway.setFieldValue("id", this.generateId());
        FMPStockGateway.setFieldValue("name", "Financial Modeling Prep Stock API");
        FMPStockGateway.setFieldValue("value", "FinancialModelingPrepGateway");
        FMPStockGateway.setFieldValue("hasKey", true);
        FMPStockGateway.setFieldValue("keyName", "FMP_API_KEY");
        FMPStockGateway.setFieldValue("key", env["FMP_API_KEY"]);
        FMPStockGateway.setFieldValue("isActive", config.StockGateway === "FinancialModelingPrepGateway" ? true : false);

        currentStockGateway = config.StockGateway === "FinancialModelingPrepGateway" ? FMPStockGateway : currentStockGateway;

        var YFinanceStockGateway = new ConfigurationOption();
        YFinanceStockGateway.setFieldValue("id", this.generateId());
        YFinanceStockGateway.setFieldValue("name", "Yahoo Finance Stock API (Unofficial Community Version)");
        YFinanceStockGateway.setFieldValue("value", "YFinanceStockGateway");
        YFinanceStockGateway.setFieldValue("hasKey", false);
        YFinanceStockGateway.setFieldValue("isActive", config.StockGateway === "YFinanceStockGateway" ? true : false);
        
        currentStockGateway = config.StockGateway === "YFinanceStockGateway" ? YFinanceStockGateway : currentStockGateway;

        const stockGateways = [AlphaVantageStockGateway, FMPStockGateway, YFinanceStockGateway];
        
        var stockGatewayConfiguration = new Configuration();
        stockGatewayConfiguration.setFieldValue("id", this.generateId());
        stockGatewayConfiguration.setFieldValue("name", "StockGateway");
        stockGatewayConfiguration.setFieldValue("options", stockGateways);
        
        //create NewsGateway Configurations
        var currentNewsGateway = null;

        var AlphaVantageNewsGateway = new ConfigurationOption();
        AlphaVantageNewsGateway.setFieldValue("id", this.generateId());
        AlphaVantageNewsGateway.setFieldValue("name", "Alpha Vantage News API");
        AlphaVantageNewsGateway.setFieldValue("value", "AlphaVantageNewsGateway");
        AlphaVantageNewsGateway.setFieldValue("hasKey", true);
        AlphaVantageNewsGateway.setFieldValue("keyName", "ALPHAVANTAGE_API_KEY");
        AlphaVantageNewsGateway.setFieldValue("key", env["ALPHAVANTAGE_API_KEY"]);
        AlphaVantageNewsGateway.setFieldValue("isActive", config.NewsGateway === "AlphaVantageNewsGateway" ? true : false);

        currentNewsGateway = config.NewsGateway === "AlphaVantageNewsGateway" ? AlphaVantageNewsGateway : currentNewsGateway;

        const newsGateways = [AlphaVantageNewsGateway];
        
        var newsGatewayConfiguration = new Configuration();
        newsGatewayConfiguration.setFieldValue("id", this.generateId());
        newsGatewayConfiguration.setFieldValue("name", "NewsGateway");
        newsGatewayConfiguration.setFieldValue("options", newsGateways);

        //create ReportGateway Configurations
        var currentReportGateway = null;

        var SecReportGateway = new ConfigurationOption();
        SecReportGateway.setFieldValue("id", this.generateId());
        SecReportGateway.setFieldValue("name", "SEC Financial Report Gateway");
        SecReportGateway.setFieldValue("value", "SecAPIGateway");
        SecReportGateway.setFieldValue("hasKey", false);
        SecReportGateway.setFieldValue("isActive", config.ReportGateway === "SecAPIGateway" ? true : false);

        currentReportGateway = config.ReportGateway === "SecAPIGateway" ? SecReportGateway : currentReportGateway;

        const reportGateways = [SecReportGateway];
        
        var reportGatewayConfiguration = new Configuration();
        reportGatewayConfiguration.setFieldValue("id", this.generateId());
        reportGatewayConfiguration.setFieldValue("name", "ReportGateway");
        reportGatewayConfiguration.setFieldValue("options", reportGateways);

        //create RatioGateway Configurations
        var currentRatioGateway = null;

        var RatioGateway = new ConfigurationOption();
        RatioGateway.setFieldValue("id", this.generateId());
        RatioGateway.setFieldValue("name", "Alpha Vantage Ratio API Gateway");
        RatioGateway.setFieldValue("value", "AlphaVantageRatioGateway");
        RatioGateway.setFieldValue("hasKey", true);
        RatioGateway.setFieldValue("keyName", "ALPHAVANTAGE_API_KEY");
        RatioGateway.setFieldValue("key", env["ALPHAVANTAGE_API_KEY"]);
        RatioGateway.setFieldValue("isActive", config.RatioGateway === "AlphaVantageRatioGateway" ? true : false);

        currentRatioGateway = config.RatioGateway === "AlphaVantageRatioGateway" ? RatioGateway : currentReportGateway;

        const ratioGateways = [RatioGateway];
        
        var ratioGatewayConfiguration = new Configuration();
        ratioGatewayConfiguration.setFieldValue("id", this.generateId());
        ratioGatewayConfiguration.setFieldValue("name", "RatioGateway");
        ratioGatewayConfiguration.setFieldValue("options", ratioGateways);

        //create Chatbot Model Configurations
        var currentAIModel = null;

        var OpenAIModelGateway = new ConfigurationOption();
        OpenAIModelGateway.setFieldValue("id", this.generateId());
        OpenAIModelGateway.setFieldValue("name", "OpenAI Model API Gateway");
        OpenAIModelGateway.setFieldValue("value", "OpenAIModel");
        OpenAIModelGateway.setFieldValue("hasKey", true);
        OpenAIModelGateway.setFieldValue("keyName", "OPENAI_API_KEY");
        OpenAIModelGateway.setFieldValue("key", env["OPENAI_API_KEY"]);
        OpenAIModelGateway.setFieldValue("isActive", config.ChatbotModel === "OpenAIModel" ? true : false);

        currentAIModel = config.ChatbotModel === "OpenAIModel" ? OpenAIModelGateway : currentAIModel;

        const chatbotGateways = [OpenAIModelGateway];
        
        var chatbotModelGatewayConfiguration = new Configuration();
        chatbotModelGatewayConfiguration.setFieldValue("id", this.generateId());
        chatbotModelGatewayConfiguration.setFieldValue("name", "ChatbotModel");
        chatbotModelGatewayConfiguration.setFieldValue("options", chatbotGateways);

        //Configuration Sections
        const dataConfigSection = new ConfigurationSection();
        dataConfigSection.setFieldValue("id", this.generateId());
        dataConfigSection.setFieldValue("label", "Financial Data API Configurations");
        dataConfigSection.setFieldValue("configurations", [stockGatewayConfiguration, newsGatewayConfiguration, reportGatewayConfiguration, ratioGatewayConfiguration]);

        const modelConfigSection = new ConfigurationSection();
        modelConfigSection.setFieldValue("id", this.generateId());
        modelConfigSection.setFieldValue("label", "AI Model Configurations");
        modelConfigSection.setFieldValue("configurations", [chatbotModelGatewayConfiguration]);

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
                            ChatbotModel: currentAIModel.toObject()
                        }
                    ]
            }};
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