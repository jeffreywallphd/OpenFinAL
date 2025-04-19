import {IEntity} from "../../Entity/IEntity";
import {IDataGateway} from "../Data/IDataGateway";

export class AlphaVantageRatioGateway implements IDataGateway {
    baseURL: string = "https://www.alphavantage.co/query";
    key: string;
    sourceName: string = "AlphaVantage Fundamental Data API";

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
        var url;
        if (action === "overview"){
            url = this.getOverviewUrl(entity);
        } else if (action === "balance") {
            url = this.getBalanceUrl(entity);
        } else {
            throw Error("Either no action was sent in the request or an incorrect action was used.");
        }     

        const response = await window.exApi.fetch(url);
        const data = response;

        if("Information" in data) {
            throw Error("The API key used for Alpha Vantage has reached its daily limit");
        }

        var entities;

        if(action === "overview") {
            entities = this.formatOverviewResponse(data, entity);
        } else {
            entities = this.formatReportResponse(data, entity);
        }
        
        return entities;
    }

    private getOverviewUrl(entity: IEntity) {
        return `${this.baseURL}?function=OVERVIEW&symbol=${entity.getFieldValue("ticker")}&apikey=${entity.getFieldValue("key")}&datatype=json`;
    }

    private getBalanceUrl(entity: IEntity) {
        return `${this.baseURL}?function=BALANCE_SHEET&symbol=${entity.getFieldValue("ticker")}&apikey=${entity.getFieldValue("key")}&datatype=json`;
    }

    private formatReportResponse(data: { [key: string]: any }, entity:IEntity) {
        var array: Array<IEntity> = [];
        
        if(data.hasOwnProperty("annualReports")) {
            const annualReports = data["annualReports"];

            const formattedData: Array<{ [key: string]: any }> = [];
            for(var report of annualReports) {
                formattedData.push(report);
            }

            entity.setFieldValue("data", formattedData);

            array.push(entity);
        }

        return array;
    }

    private formatOverviewResponse(data: { [key: string]: any }, entity:IEntity) {
        var array: Array<IEntity> = [];

        entity.setFieldValue("data", data);

        array.push(entity);

        return array
    }

    update(entity: IEntity, action: string): Promise<number> {
        throw new Error("This gateway does not have the ability to update content");
    }

    delete(entity: IEntity, action: string): Promise<number> {
        throw new Error("This gateway does not have the ability to delete content");
    }   
}