import {IInputBoundary} from "./IInputBoundary";
import {IRequestModel} from "../Gateway/Request/IRequestModel";
import {IResponseModel} from "../Gateway/Response/IResponseModel";
import {JSONResponse} from "../Gateway/Response/JSONResponse";
import { SQLiteTableCreationGateway } from "../Gateway/Data/SQLite/SQLiteTableCreationGateway";
import ConfigUpdater from "../Utility/ConfigManager";
import { StockInteractor } from "./StockInteractor";
import { JSONRequest } from "../Gateway/Request/JSONRequest";
import { UserInteractor } from "./UserInteractor";
import { SQLiteUserGateway } from "../Gateway/Data/SQLite/SQLiteUserGateway";
import { SQLiteCompanyLookupGateway } from "../Gateway/Data/SQLite/SQLiteCompanyLookupGateway";
import { SettingsInteractor } from "./SettingsInteractor";
import { SQLiteAssetGateway } from "../Gateway/Data/SQLite/SQLiteAssetGateway";

export class InitializationInteractor implements IInputBoundary {
    requestModel: IRequestModel;
    responseModel: IResponseModel;
    trustedHosts: string[] = ["api.openai.com", "data.sec.gov", "en.wikipedia.org", "www.alphavantage.co", "www.sec.gov"];

    async post(requestModel: IRequestModel, action:string=null): Promise<IResponseModel> {
        var response;
        const configManager = new ConfigUpdater();
        var configCreated;

        if(action === "createConfig") {
            try {
                //create the SQLite database    
                const gateway = new SQLiteTableCreationGateway();
                const tablesCreated = await gateway.create();

                //secretsCreated = await configManager.createEnvIfNotExists();
                configCreated = await configManager.createConfigIfNotExists();

                if(configCreated && tablesCreated) {
                    response = new JSONResponse(JSON.stringify({status: 200, ok: true}));
                } else {
                    response = new JSONResponse(JSON.stringify({
                        status: 400, 
                        data: {
                            error: `The application configuration failed. Configurations created: ${configCreated}. Data tables created: ${tablesCreated}.}`
                    }}));
                }

                return response;
            } catch(error) {
                response = new JSONResponse(JSON.stringify({
                    status: 500, 
                    data: {
                        error: `An unknown erorr occurred while setting up the system configurations.}`
                }}));
                
                return response;
            }
        } else if (action === "initializeData") {
            var publicCompaniesResponse;
            var userResponse;
            var response;

            //load the table with company data after database init
            try {
                var interactor = new StockInteractor();
                var requestObj = new JSONRequest(`{ 
                    "request": { 
                        "stock": {
                            "action": "downloadPublicCompanies"
                        }
                    }
                }`);
                publicCompaniesResponse = await interactor.get(requestObj);
            } catch(error) {
                response = new JSONResponse(JSON.stringify({
                    status: 500, 
                    data: {
                        error: `An unkown error occured while insert company lookup data.`
                }}));
                return response;
            }
            
            //load the user table with the OS username
            try {
                const username = await window.config.getUsername();
                var firstName;
                var lastName;
                var email = window.vault.getSecret("Email") || null;

                if(window.config.exists()) {
                    const config = await window.config.load();
                    firstName = config.UserSettings.FirstName;
                    lastName = config.UserSettings.LastName;
                }

                var userInteractor = new UserInteractor();
                var userRequestObj = new JSONRequest(JSON.stringify({ 
                    request: { 
                        user: {
                            username: username,
                            firstName: firstName,
                            lastName: lastName,
                            email: email 
                        }
                    }
                }));
                userResponse = await userInteractor.post(userRequestObj);
            } catch(error) {
                response = new JSONResponse(JSON.stringify({
                    status: 500, 
                    data: {
                        error: `An unkown error occured while created the application user.`
                }}));
                return response;
            }

            //return the response based on the outcomes of initialization
            if(publicCompaniesResponse.response.ok && userResponse.response.ok) {
                response = new JSONResponse(JSON.stringify({status: 200, ok: true}));
            } else {
                response = new JSONResponse(JSON.stringify({
                    status: 400, 
                    data: {
                        error: `The app data table initialization failed. Company lookup data loaded: ${publicCompaniesResponse.response.ok}. User data loaded: ${userResponse.response.ok}.`
                }}));
            }

            return response;
        } else if(action==="refreshPinnedCertificates") {
            for(var host of this.trustedHosts) {
                await window.vault.refreshCert(host);
            }

            response = new JSONResponse(JSON.stringify({status: 200, ok: true}));
            return response;
        }
    }
    
    async get(requestModel: IRequestModel, action:string=null): Promise<IResponseModel> {
        var response;
        try {
            if(action==="isInitialized") {
                //check if SQLite database has been created
                const gateway = new SQLiteTableCreationGateway();
                const databaseExist = await gateway.checkTableExists();

                if(!databaseExist) {
                    response = new JSONResponse(JSON.stringify({
                        status: 404, 
                        data: {
                            error: `The app is not initilized. The database was not created.`
                    }}));
                    return response;
                }

                //check if User table has data
                const userGateway = new SQLiteUserGateway();
                const userTableExists = await userGateway.checkTableExists();

                if(!userTableExists) {
                    response = new JSONResponse(JSON.stringify({
                        status: 404, 
                        data: {
                            error: `The app is not initilized. The user was not created.`
                    }}));
                    return response;
                }

                //check if PublicCompany table has data
                //const companyGateway = new SQLiteCompanyLookupGateway();
                const companyGateway = new SQLiteAssetGateway();
                const companyCount = await companyGateway.count();

                const acceptableCompanyThreshold = 8000; // the list of publicly traded companies based on SEC
                if(companyCount.count < acceptableCompanyThreshold) {
                    response = new JSONResponse(JSON.stringify({
                        status: 404, 
                        data: {
                            error: `The app is not initilized. The company lookup data is missing or incomplete.`
                    }}));
                    return response;
                }

                //check if the configuration file has been created
                const configManager = new ConfigUpdater();
                const configExists = await configManager.getConfig();

                if(!configExists) {
                    response = new JSONResponse(JSON.stringify({
                        status: 404, 
                        data: {
                            error: `The app is not configured. The system configuration was not set up correctly.`
                    }}));
                    return response;
                }

                //return success if other tests passed
                response = new JSONResponse(JSON.stringify({status: 200, ok: true}));
                return response;
            }
        } catch(error) {
            response = new JSONResponse(JSON.stringify({
                status: 500, 
                data: {
                    error: `An unkonwn error occured while checking the system initialization.`
            }}));
            return response;
        }
        
        try {
            if(action==="isConfigured") {
                //check if SQLite database has been created
                const gateway = new SQLiteTableCreationGateway();
                const databaseExist = await gateway.checkTableExists();

                if(!databaseExist) {
                    response = new JSONResponse(JSON.stringify({
                        status: 404, 
                        data: {
                            error: `The app is not configured. The database was not created.`
                    }}));
                    return response;
                }

                //check if the configuration file has been created
                const configManager = new ConfigUpdater();
                const configExists = await configManager.getConfig();

                if(!configExists) {
                    response = new JSONResponse(JSON.stringify({
                        status: 404, 
                        data: {
                            error: `The app is not configured. The system configuration was not set up correctly.`
                    }}));
                    return response;
                }

                const settingsInteractor = new SettingsInteractor();
                var settingsRequestObj = new JSONRequest(JSON.stringify({
                        action: "isConfigured"
                })); 

                const settingsResponse = await settingsInteractor.get(settingsRequestObj);

                if(!settingsResponse.response.ok) {
                    response = new JSONResponse(JSON.stringify({
                        status: 404, 
                        data: {
                            error: `The app is not configured. Required settings are not yet configured.`
                    }}));
                    return response;
                }

                //return success if other tests passed
                response = new JSONResponse(JSON.stringify({status: 200, ok: true}));
                return response;
            }
        } catch(error) {
            response = new JSONResponse(JSON.stringify({
                status: 500, 
                data: {
                    error: `An unkonwn error occured while checking the system configurations.`
            }}));
            return response;
        }

        response = new JSONResponse(JSON.stringify({
            status: 400, 
            data: {
                error: `The requested action doe not exist.`
        }}));
        return response;
    }
    
    async put(requestModel: IRequestModel): Promise<IResponseModel> {
        return this.post(requestModel);
    }
    
    async delete(requestModel: IRequestModel): Promise<IResponseModel> {
        return this.post(requestModel);
    }
}