class ConfigUpdater {
    configFile:string = './config/default.json';
    envFile:string = './.env';
    
    constructor() {}

    createEnvIfNotExists() {
        const fs = window.fs.fs;

        try {
            const envExists = fs.statSync("./.env");     
        } catch(error) {
            // .env file didn't exist throws error. Try to create .env
            try {
                fs.openSync("./.env", "w");
                
                var envJson = {
                    ALPHAVANTAGE_API_KEY: "",
                    FMP_API_KEY: "",
                    OPENAI_API_KEY: ""
                }

                fs.writeFileSync("./.env", JSON.stringify(envJson, null, 4));
            } catch(error2) {
                console.error(error2);
            }
        }
    }

    createConfigIfNotExists() {
        const fs = window.fs.fs;

        try {
            const config = fs.statSync("./config");     
        } catch(error) { 
            console.error(error);

            try {
                fs.mkdirSync("./config", { recursive: true }); 
            } catch(error2) {
                console.error(error2);
                return false;
            }
        }

        try {
            fs.statSync(this.configFile)
        } catch(error3) {
            fs.openSync(this.configFile, "w");

            const defaultConfig = {
                StockGateway: "AlphaVantageStockGateway",
                NewsGateway: "AlphaVantageNewsGateway",
                ReportGateway: "SecAPIGateway",
                RatioGateway: "AlphaVantageRatioGateway",
                ChatbotModel: "OpenAIModel",
                ChatbotModelSettings: {
                    modelName: "gpt-4",
                    maxOutputTokens: 100,
                    temperature: 0.5,
                    topP: 1
                }
            };

            fs.writeFileSync(this.configFile, JSON.stringify(defaultConfig, null, 4));
        }
    }

    saveEnv(env:object) {
        try {
            const fs = window.fs.fs;
            fs.openSync(this.envFile, "w");
            fs.writeFileSync(this.envFile, JSON.stringify(env, null, 4));

            return true;
        } catch(error) {
            console.error(error);
            return false;
        }
    }

    saveConfig(config:object) {
        try {
            const fs = window.fs.fs;
            fs.openSync(this.configFile, "w");
            fs.writeFileSync(this.configFile, JSON.stringify(config, null, 4));

            return true;
        } catch(error) {
            console.error(error);
            return false;
        }
    }

    getEnv() {
        const fs = window.fs.fs;
    
        try {
            let envData = fs.readFileSync(this.envFile, 'utf8');
            let envConfig = JSON.parse(envData);
    
            return envConfig;
        } catch (err) {
            console.error('Error updating .env file:', err);
            return null;
        }
    }

    getConfig() {
        const fs = window.fs.fs;

        try {
            // Access fs module from the preload script
            const fs = window.fs.fs;
            
            let configData = fs.readFileSync(this.configFile, 'utf8');
            let config = JSON.parse(configData);
            
            return config;
        } catch (err) {
            console.error('Error updating configuration:', err);
            return null;
        }
    }
}

export default ConfigUpdater;