import { JSONRequest } from "../../Request/JSONRequest";
import {IEntity} from "../../../Entity/IEntity";
import {IKeyedDataGateway} from "../IKeyedDataGateway";
import { APIEndpoint } from "../../../Entity/APIEndpoint";

export class AlphaVantageNewsGateway implements IKeyedDataGateway {
    baseURL: string = "https://www.alphavantage.co/query";
    key: string;
    sourceName: string = "AlphaVantage News API";

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
        var url = `${this.baseURL}?function=NEWS_SENTIMENT&apikey=${entity.getFieldValue("key")}`;
        
        if(entity.getFieldValue("ticker") !== null) {
            url = url + "&tickers=" + entity.getFieldValue("ticker");
        }

        if(entity.getFieldValue("topic") !== null) {
            url = url + "&topics=" + entity.getFieldValue("topic");
        }

        if(entity.getFieldValue("keyword") !== null) {
            url = url + "&topics=" + entity.getFieldValue("keyword");
        }

        if(entity.getFieldValue("startDate") !== null) {
            url = url + "&time_from=" + entity.getFieldValue("startDate");
        }

        if(entity.getFieldValue("endDate") !== null) {
            url = url + "&time_to=" + entity.getFieldValue("endDate");
        }

        if(entity.getFieldValue("limit") !== null) {
            url = url + "&limit=" + entity.getFieldValue("limit");
        }

        if(entity.getFieldValue("sort") !== null) {
            url = url + "&sort=" + entity.getFieldValue("sort");
        }

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
        
        if("Invalid inputs" in data) {
            window.console.log("There is no news data for the company you requested.");
            return entities;
        }

        if("Information" in data) {
            window.console.log("Your AlphaVantage key has reached its daily limit");
            return entities;
        }

        var entities = this.formatDataResponse(data, entity, action);

        return entities;
    }

    private formatDataResponse(data: { [key: string]: any }, entity:IEntity, action:string) {
        var array: Array<IEntity> = [];
        
        var newsFeed = data["feed"];
                
        const formattedData: Array<{ [key: string]: any }> = [];

        for (var key in newsFeed) {           
            var item = this.createDataItem(newsFeed[key]);
            formattedData.push(item);
        }

        entity.setFieldValue("data", formattedData.reverse());

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