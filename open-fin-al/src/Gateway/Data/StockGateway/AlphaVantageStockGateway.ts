import {StockRequest} from "../../../Entity/StockRequest";
import {IEntity} from "../../../Entity/IEntity";
import {IKeyedDataGateway} from "../IKeyedDataGateway";
import { APIEndpoint } from "../../../Entity/APIEndpoint";
import { JSONRequest } from "../../Request/JSONRequest";

export class AlphaVantageStockGateway implements IKeyedDataGateway {
    baseURL: string = "https://www.alphavantage.co/query";
    key: string;
    sourceName: string = "AlphaVantage Stock API";

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
        throw new Error("This gateway does not have the ability to post content");
    }

    async read(entity: IEntity, action: string): Promise<Array<IEntity>> {
        try {
            var url;
            if (action === "lookup") {
                url = this.getSymbolLookupUrl(entity);    
            } else if (action === "intraday") {
                url = this.getIntradayUrl(entity);
            } else if (action === "interday") {
                url = this.getInterdayUrl(entity);
            } else if (action === "quote") {
                url = this.getQuoteUrl(entity);
            } else {
                throw Error("Either no action was sent in the request or an incorrect action was used.");
            }     

            const urlObject = new URL(url);

            var endpointRequest = new JSONRequest(JSON.stringify({
                request: {
                    endpoint: {
                        key: entity.getFieldValue("key"),
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
                throw Error("The API key used for Alpha Vantage has reached its daily limit");
            }

            var entities;
            if (action === "lookup") {
                entities = this.formatLookupResponse(data);
            } else if(action === "quote") {
                entities = this.formatQuoteResponse(data);
            } else {
                entities = this.formatDataResponse(data, entity, action);
            }

            return entities;
        } catch(error) {
            return null;
        }
    }

    private getSymbolLookupUrl(entity: IEntity) {
        return `${this.baseURL}?function=SYMBOL_SEARCH&keywords=${entity.getFieldValue("keyword")}&apikey=${entity.getFieldValue("key")}&datatype=json`;
    }

    private getIntradayUrl(entity: IEntity) {
        return `${this.baseURL}?function=TIME_SERIES_INTRADAY&symbol=${entity.getFieldValue("ticker")}&interval=1min&apikey=${entity.getFieldValue("key")}&extended_hours=false&outputsize=full&datatype=json`;
    }

    private getInterdayUrl(entity: IEntity) {
        return `${this.baseURL}?function=TIME_SERIES_DAILY&symbol=${entity.getFieldValue("ticker")}&apikey=${entity.getFieldValue("key")}&outputsize=full&datatype=json`;
    }

    private getQuoteUrl(entity: IEntity) {
        return `${this.baseURL}?function=GLOBAL_QUOTE&symbol=${entity.getFieldValue("ticker")}&apikey=${entity.getFieldValue("key")}&datatype=json`;
    }

    private formatLookupResponse(data: { [key: string]: any }) {
        var array: Array<IEntity> = [];
        
        const bestMatches = data["bestMatches"];

        for (const match of bestMatches) {           
            var entity = new StockRequest();
            
            entity.setFieldValue("ticker", match["1. symbol"]);
            entity.setFieldValue("companyName", match["2. name"]);
            
            array.push(entity);
        }

        return array;
    }

    private formatQuoteResponse(data: { [key: string]: any }) {
        var array: Array<IEntity> = [];

        const quote = data["Global Quote"];
         
        var entity = new StockRequest();
        
        entity.setFieldValue("ticker", quote["01. symbol"]);
        entity.setFieldValue("quotePrice", quote["05. price"]);
        entity.setFieldValue("startDate", quote["07. latest trading day"]);
        entity.setFieldValue("endDate", quote["07. latest trading day"]);
        
        array.push(entity);

        return array;
    }

    private formatDataResponse(data: { [key: string]: any }, entity:IEntity, action:string) {
        var array: Array<IEntity> = [];
        
        var timeSeries;
        if(action === "interday") { 
            timeSeries = data["Time Series (Daily)"];
        } else {
            timeSeries = data["Time Series (1min)"];    
        }

        if(!timeSeries) {
            throw Error("No time series data is available for this stock.");
        }

        const mostRecentDate = new Date(Object.keys(timeSeries)[0]);
        
        //calculate the pate date based on the interval specified by the user
        //currently, intervals are 5 day, 1 month, 6 months, 1 year, 5 years, and max
        var pastDate:Date;
        if(entity.getFieldValue("interval") === "5D") {
            pastDate = new Date(mostRecentDate.getTime() - (5 * 24 * 60 * 60 * 1000));
        } else if(entity.getFieldValue("interval") === "1M") {
            pastDate = new Date(mostRecentDate.getTime() - (30 * 24 * 60 * 60 * 1000));
        } else if(entity.getFieldValue("interval") === "6M") {
            pastDate = new Date(mostRecentDate.getTime() - (6 * 30 * 24 * 60 * 60 * 1000));
        } else if(entity.getFieldValue("interval") === "1Y") {
            pastDate = new Date(mostRecentDate.getTime() - (365 * 24 * 60 * 60 * 1000));
        } else if(entity.getFieldValue("interval") === "5Y") {
            pastDate = new Date(mostRecentDate.getTime() - (5 * 365 * 24 * 60 * 60 * 1000));
        } else if(entity.getFieldValue("interval") === "Max") {
            pastDate = null;
        } else {
            //default to 5D interval
            pastDate = new Date(mostRecentDate.getTime() - (5 * 24 * 60 * 60 * 1000));
        }
        
        const formattedData: Array<{ [key: string]: any }> = [];
        for (var key in timeSeries) {
            var date = new Date(key);           
            var item;

            if(action === "interday") {
                item = this.createDataItem(date, timeSeries[key]);
                formattedData.push(item);
                if(date !== null && date < pastDate) {
                    //stop the loop at the designated interval for the interday data
                    break;
                }
            } else {
                if(mostRecentDate.getDate() === date.getDate()) {
                    item = this.createDataItem(date, timeSeries[key]);
                    formattedData.push(item);
                } else {
                    //stop the loop for intraday data once the date is less than the most recent date
                    break;
                }
            }
        }

        entity.setFieldValue("data", formattedData.reverse());

        array.push(entity);

        return array;
    }

    private createDataItem(date: Date, timeSeries: any) {
        const item = {
            date: date.toLocaleDateString(),
            time: date.toLocaleTimeString(),
            price: timeSeries["4. close"],
            volume: timeSeries["5. volume"],
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