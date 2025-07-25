import { JSONRequest } from "../../Request/JSONRequest";
import {IEntity} from "../../../Entity/IEntity";
import {IKeylessDataGateway} from "../IKeylessDataGateway";
import { APIEndpoint } from "../../../Entity/APIEndpoint";

export class SecAPIGateway implements IKeylessDataGateway {
    baseURL: string = "https://data.sec.gov/";
    sourceName: string = "SEC's API";
    userAgent: string = "";

    constructor(params:any={userAgent:null}) {
        if(params.userAgent) {
            this.userAgent = params.userAgent;
        }
    }

    connect(): void {
        //no connection needed for this data gateway
        throw new Error("This gateway requries no special connection");
    }

    disconnect(): void {
        //no disconnection needed for this data gateway
        throw new Error("This gateway requries no special connection, so no disconnection is necessary");
    }

    create(entity: IEntity, action: string): Promise<Boolean> {
        throw new Error("This gateway does not have the ability to post content");
    }

    async read(entity: IEntity, action: string): Promise<Array<IEntity>> { 
        var url;
        if (action === "companyLookup") {
            url = this.getCompanyLookupUrl(entity);    
        } else if (action === "conceptLookup") {
            url = this.getConceptLookupUrl(entity);
        } else if (action === "submissionsLookup") {
            url = this.getSubmissionsLookupUrl(entity);
        } else {
            throw Error("Either no action was sent in the request or an incorrect action was used.");
        }   

        //request data from API
        const userEmail = await window.vault.getSecret("Email");
        
        const urlObject = new URL(url);

        var endpointRequest = new JSONRequest(JSON.stringify({
            request: {
                endpoint: {
                    method: "GET",
                    protocol: "https",
                    hostname: "data.sec.gov",
                    pathname: urlObject.pathname ? urlObject.pathname : null,
                    search: urlObject.search ? urlObject.search : null,
                    searchParams: urlObject.searchParams ? urlObject.searchParams : null,
                    headers: {
                        "User-Agent": `Investor ${userEmail}`
                    },               
                }
            }
        }));

        var endpoint = new APIEndpoint();
        endpoint.fillWithRequest(endpointRequest);

        const data = await window.exApi.fetch(url, endpoint.toObject());   
        entity.setFieldValue("data", data);

        const entities = [entity];
        return entities;
    }

    private getSubmissionsLookupUrl(entity: IEntity) {
        return `${this.baseURL}/submissions/CIK${entity.getFieldValue("cik")}.json`;
    }

    private getConceptLookupUrl(entity: IEntity) {
        return `${this.baseURL}api/xbrl/companyconcept/CIK${entity.getFieldValue("cik")}/${entity.getFieldValue("accountingStandard")}/${entity.getFieldValue("concept")}.json`;
    }

    private getCompanyLookupUrl(entity: IEntity) {
        return `${this.baseURL}api/xbrl/companyfacts/CIK${entity.getFieldValue("cik")}.json`;
    }

    update(entity: IEntity, action: string): Promise<number> {
        throw new Error("This gateway does not have the ability to update content");
    }

    delete(entity: IEntity, action: string): Promise<number> {
        throw new Error("This gateway does not have the ability to delete content");
    }   
}