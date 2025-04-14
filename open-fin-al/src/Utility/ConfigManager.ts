// allow the transformers contextBridge to be used in TypeScript
declare global {
    interface Window { fs: any }
}

declare global {
    interface Window { vault: any }
}

declare global {
    interface Window { config: any }
}

class ConfigUpdater {
    configFile:string = '../config/default.json';
    envFile:string = '../.env';
    vault:any;
    keys = ["ALPHAVANTAGE_API_KEY","FMP_API_KEY","OPENAI_API_KEY","HUGGINGFACE_API_KEY"];
    
    constructor() {
        console.log(window.vault);
        this.vault = window.vault;
    }

    async createEnvIfNotExists() {
        for (let key of this.keys) {
            if(!await this.vault.getSecret("OpenFinAL", key)) {   
                this.vault.setSecret("OpenFinAL", key, "");
            }
        }
        
        /*const fs = window.fs.fs;

        try {
            const envExists = await fs.stat(this.envFile);     
        } catch(error) {
            // .env file didn't exist throws error. Try to create .env
            try {
                await fs.open(this.envFile, "w");
                
                var envJson = {
                    ALPHAVANTAGE_API_KEY: "",
                    FMP_API_KEY: "",
                    OPENAI_API_KEY: ""
                }

                await fs.writeFile(this.envFile, JSON.stringify(envJson, null, 4));
            } catch(error2) {
                console.error(error2);
            }
        }*/
    }

    async createConfigIfNotExists() {
        //const fs = window.fs.fs;

        try {
            window.console.log("DOES THE CONFIG EXIST: ", await window.config.exists());
            if(!await window.config.exists()) {
                const defaultConfig = {
                    StockGateway: "AlphaVantageStockGateway",
                    NewsGateway: "AlphaVantageNewsGateway",
                    ReportGateway: "SecAPIGateway",
                    RatioGateway: "AlphaVantageRatioGateway",
                    ChatbotModel: "OpenAIModel",
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

                await window.config.save(defaultConfig);
            }
        } catch(e) {
            console.error("Unable to save the configuration file: ", e);
        }
    }

    async saveEnv(env:object) {
        /*try {
            const fs = window.fs.fs;
            await fs.open(this.envFile, "w");
            await fs.writeFile(this.envFile, JSON.stringify(env, null, 4));

            return true;
        } catch(error) {
            console.error(error);
            return false;
        }*/
    }

    async saveConfig(config:object) {
        try {
            window.config.save(config);
            return true;
        } catch(error) {
            console.error("Unable to save the configuration file: ", error);
            return false;
        }
        /*try {
            const fs = window.fs.fs;
            await fs.open(this.configFile, "w");
            await fs.writeFile(this.configFile, JSON.stringify(config, null, 4));

            return true;
        } catch(error) {
            console.error(error);
            return false;
        }*/
    }

    async getSecret(key:string) {
        return await this.vault.getSecret("OpenFinAL", key);
    }

    async setSecret(key:string, value:string) {
        await this.vault.setSecret("OpenFinAL", key, value);
    }

    async getEnv() {

        /*const fs = window.fs.fs;
    
        try {
            try {
                let envData = await fs.readFile(this.envFile, 'utf8');

                envData = fs.readFile(this.envFile, 'utf8', (err:any, data:any) => {
                    if (err) {
                      console.log('An error occurred:', err);
                      return;
                    }
                    console.log('File content:', data);
                  });

                let envConfig = JSON.parse(envData.toString());
                return envConfig;
            } catch(error) {
                console.log("Error reading .env file:",error);
                return null;
            }    
        } catch (err) {
            console.error('Error updating .env file:', err);
            return null;
        }*/
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
        /*const fs = window.fs.fs;

        try {
            let configData = await fs.readFile(this.configFile, 'utf8');
            let config = JSON.parse(configData.toString());
            
            return config;
        } catch (err) {
            console.error('Error updating configuration:', err);
            return null;
        }*/
    }
}

export default ConfigUpdater;