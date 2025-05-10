import { JSONRequest } from "../../Request/JSONRequest";
import {IEntity} from "../../../Entity/IEntity";
import {IKeyedDataGateway} from "../IKeyedDataGateway";
import { APIEndpoint } from "../../../Entity/APIEndpoint";

export class AlphaVantageEconomicGateway implements IKeyedDataGateway {
    baseURL: string = "https://www.alphavantage.co/query";
    key: string;
    sourceName: string = "AlphaVantage Economic Indicator API";

    constructor(key: string) {
        this.key = key;
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
        //This API has no post capabilities
        throw new Error("This gateway does not have the ability to post content");
    }

    async read(entity: IEntity, action: string): Promise<Array<IEntity>> { 
        var url = `${this.baseURL}?`;

        if(action==="getGDP") {
            url = url + "function=REAL_GDP";
            entity.setFieldValue("name", "Real Gross Domestic Product (GDP)");
        } else if(action==="getGDPPerCapita") {
            url = url + "function=REAL_GDP_PER_CAPITA";
        } else if(action==="getTreasuryYield") {
            url = url + "function=TREASURY_YIELD";
        } else if(action==="getFedRate") {
            url = url + "function=FEDERAL_FUNDS_RATE";
        } else if(action==="getCPI") {
            url = url + "function=CPI";
        } else if(action==="getInflation") {
            url = url + "function=INFLATION";
        } else if(action==="getRetailSales") {
            url = url + "function=RETAIL_SALES";
        } else if(action==="getDurableGoods") {
            url = url + "function=DURABLES";
        } else if(action==="getUnemployment") {
            url = url + "function=UNEMPLOYMENT";
        } else if(action==="getTotalNonFarmPayroll") {
            url = url + "function=NONFARM_PAYROLL";
        }

        if(entity.getFieldValue("interval") !== null) {
            url = url + "&interval=" + entity.getFieldValue("interval");
        }

        if(entity.getFieldValue("maturity") !== null) {
            url = url + "&maturity=" + entity.getFieldValue("maturity");
        }

        url = url + `&datatype=json&apikey=${entity.getFieldValue("key")}`;

        const urlObject = new URL(url);
        
        var endpointRequest = new JSONRequest(JSON.stringify({
            request: {
                endpoint: {
                    method: "GET",
                    protocol: "https",
                    hostname: urlObject.hostname ? urlObject.hostname : null,
                    pathname: urlObject.pathname ? urlObject.pathname : null,
                    search: urlObject.search ? urlObject.search : null,
                    searchParams: urlObject.searchParams ? urlObject.searchParams : null,           
                }
            }
        }));
        
        var endpoint = new APIEndpoint();
        endpoint.fillWithRequest(endpointRequest);

        const data = await window.exApi.fetch(this.baseURL, endpoint.toObject());

        if("Information" in data) {
            window.console.log("Your AlphaVantage key has reached its daily limit");
            return entities;
        }

        var entities = this.formatDataResponse(data, entity, action);

        return entities;
    }

    private formatDataResponse(data: { [key: string]: any }, entity:IEntity, action:string) {
        var array: Array<IEntity> = [];
        window.console.log(data);
        var indicatorData = data["data"].reverse();
                
        entity.setFieldValue("data", indicatorData);

        if(data["unit"]) {
            entity.setFieldValue("unit", data["unit"]);
        }

        array.push(entity);
        return array;
    }

    private createDataItem(newsFeed: any) {
        const item = {
            date: newsFeed["time_published"].split("T")[0],
            time: newsFeed["time_published"].split("T")[1],
            title: newsFeed["title"],
            url: newsFeed["url"],
            authors: newsFeed["authors"].join(", "),
            summary: newsFeed["summary"],
            thumbnail: newsFeed["banner_image"],
            source: newsFeed["source"]
        };

        return item;
    }

    update(entity: IEntity, action: string): Promise<number> {
        throw new Error("This gateway does not have the ability to update content");
    }

    delete(entity: IEntity, action: string): Promise<number> {
        throw new Error("This gateway does not have the ability to delete content");
    }    
}