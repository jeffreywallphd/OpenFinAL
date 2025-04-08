class ConfigUpdater {
    configFile:string = './config/default.json';
    envFile:string = './.env';
    stockApi:string;
    newsApi:string;
    stockApiKey:string;
    newsApiKey:string;
    reportsApi:string;
    reportsApiKey:string;
    ratioApi:string;
    ratioApiKey:string;
    openAIKey:string;
    
    constructor(args:any={stockApi: null, stockApiKey:null, newsApi:null, newsApiKey:null, reportApi:null, reportApiKey:null, ratioApi:null, ratioApiKey:null}) {
        this.stockApi = args["stockApi"];
        this.newsApi = args["newsApi"];
        this.stockApiKey = args["stockApiKey"];
        this.newsApiKey = args["newsApiKey"];
        this.reportsApi = args["reportsApi"];
        this.reportsApiKey = args["reportsApiKey"];
        this.ratioApi = args["ratioApi"];
        this.ratioApiKey = args["ratioApiKey"];
    }

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
                    STOCK_API_KEY: "",
                    NEWS_API_KEY: "",
                    RATIO_API_KEY: "",
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
                ChatbotModel: "OpenAIModel"
            };

            fs.writeFileSync(this.configFile, JSON.stringify(defaultConfig, null, 4));
        }
    }

    updateConfigFile() {
        try {
            // Access fs module from the preload script
            const fs = window.fs.fs;
            
            let configData = fs.readFileSync(this.configFile, 'utf8');
            let config = JSON.parse(configData);
            
            // Update the specific API endpoint based on the selected API
            if (this.stockApi === 'AlphaVantageStockGateway') {
                config.StockGateway = 'AlphaVantageStockGateway';
            } else if (this.stockApi === 'FinancialModelingPrepGateway') {
                config.StockGateway = 'FinancialModelingPrepGateway';
            } else if (this.stockApi === 'YFinanceStockGateway') {
                config.StockGateway = 'YFinanceStockGateway';
            } else {
                config.StockGateway = 'AlphaVantageStockGateway';
            }

            if (this.newsApi === "AlphaVantageNewsGateway") {
                config.NewsGateway = 'AlphaVantageNewsGateway';
            } else {
                config.NewsGateway = 'AlphaVantageNewsGateway';
            }

            if (this.reportsApi === "SecReportGateway") {
                config.ReportGateway = 'SecAPIGateway';
            } else {
                config.ReportGateway = 'SecAPIGateway';
            }

            if (this.ratioApi === "AlphaVantageRatioGateway") {
                config.RatioGateway = "AlphaVantageRatioGateway";
            } else {
                config.RatioGateway = "AlphaVantageRatioGateway";
            }
            
            fs.writeFileSync(this.configFile, JSON.stringify(config, null, 4));
            return true;
        } catch (err) {
            console.error('Error updating configuration:', err);
            return false;
        }
    }
    
    // Function to update .env file with new API key
    updateEnvFile() {
        // Access fs module from the preload script
        const fs = window.fs.fs;
    
        try {
            let envData = fs.readFileSync(this.envFile, 'utf8');
            let envConfig = JSON.parse(envData);
            
            // Update the stock API key based on the selected API
            if (this.stockApi === 'AlphaVantageStockGateway') {
                envConfig.ALPHAVANTAGE_API_KEY = this.stockApiKey;
                envConfig.STOCK_API_KEY = this.stockApiKey;
            } else if (this.stockApi === 'FinancialModelingPrepGateway') {
                envConfig.FMP_API_KEY = this.stockApiKey;
                envConfig.STOCK_API_KEY = this.stockApiKey;
            } 
            
            // Update the news API key based on the selected API
            if (this.newsApi === 'AlphaVantageNewsGateway') {
                envConfig.NEWS_API_KEY = this.newsApiKey;
            }

            // If a future report API requires a key, add here

            // Update the ratio API key based on the selected API
            if (this.ratioApi === 'AlphaVantageRatioGateway') {
                envConfig.RATIO_API_KEY = this.ratioApiKey;
            }
            
            fs.writeFileSync(this.envFile, JSON.stringify(envConfig, null, 4));
            return true;
        } catch (err) {
            console.error('Error updating .env file:', err);
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