// allow the transformers contextBridge to be used in TypeScript
declare global {
    interface Window { vault: any }
}

declare global {
    interface Window { config: any }
}

class ConfigUpdater {
    vault:any;
    keys = ["ALPHAVANTAGE_API_KEY","FMP_API_KEY","OPENAI_API_KEY","HUGGINGFACE_API_KEY"];
    
    constructor() {
        this.vault = window.vault;
    }

    async createEnvIfNotExists() {
        var created = true;
        for (let key of this.keys) {
            if(!await this.vault.getSecret("OpenFinAL", key)) {   
                try {
                    await this.vault.setSecret("OpenFinAL", key, "");
                } catch(error) {
                    created = false;
                    continue;
                }
            }
        }

        return created;
    }

    async createConfigIfNotExists() {
        try {
            if(!await window.config.exists()) {
                const defaultConfig = {
                    DarkMode: false,
                    StockGateway: "AlphaVantageStockGateway",
                    NewsGateway: "AlphaVantageNewsGateway",
                    ReportGateway: "SecAPIGateway",
                    RatioGateway: "AlphaVantageRatioGateway",
                    ChatbotModel: "OpenAIModel",
                    UserSettings: {
                        FirstName: "",
                        LastName: ""
                    },
                    ChatbotModelSettings: {
                        ChatbotModelName: "gpt-4",
                        ChatbotModelMaxOutputTokens: 100,
                        ChatbotModelTemperature: 0.5,
                        ChatbotModelTopP: 1
                    },
                    NewsSummaryModel: "OpenAIModel",
                    NewsSummaryModelSettings: {
                        NewsSummaryModelName: "gpt-4",
                        NewsSummaryModelMaxOutputTokens: 200,
                        NewsSummaryModelTemperature: 0.2,
                        NewsSummaryModelTopP: 0.2
                    }
                }

                const result = await window.config.save(defaultConfig);
                return result;
            }
        } catch(e) {
            console.error("Unable to save the configuration file: ", e);
            return false;
        }
    }

    async saveConfig(config:object) {
        try {
            window.config.save(config);
            return true;
        } catch(error) {
            console.error("Unable to save the configuration file: ", error);
            return false;
        }
    }

    async getSecret(key:string) {
        return await this.vault.getSecret(key);
    }

    async setSecret(key:string, value:string) {
        await this.vault.setSecret(key, value);
    }

    async getConfig() {
        try {
            let config;
            if(config = window.config.load()) {
                return config;
            } else {
                throw new Error("");
            }
        } catch(e) {
            console.error("Unable to load the configuration file: ", e);
            return null;
        }
    }
}

export default ConfigUpdater;