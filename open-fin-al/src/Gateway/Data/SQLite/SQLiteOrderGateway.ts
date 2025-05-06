import {IEntity} from "@Entity/IEntity";
import {ISqlDataGateway} from "../ISqlDataGateway";
import { Order } from "../../../Entity/Order";

export class SQLiteOrderGateway implements ISqlDataGateway {
    connection: any = null;
    sourceName: string = "SQLite Database";

    async connect(): Promise<void> {
        throw new Error("Due to the nature of this gateway's dependencies, connections are not handled through this method");
    }

    disconnect(): void {
        throw new Error("Due to the nature of this gateway's dependencies, connections and disconnections are not handled through this method");
    }

    // used to create and periodically refresh the cache
    async create(entity: IEntity, action: string): Promise<Boolean> {
        try {
            const query = "INSERT INTO AssetOrder (assetId, portfolioId, orderType, orderMethod, quantity, lastPrice, lastPriceDate, limitPrice, stopPrice, fulfilled, fulfilledDate) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
            const args  = [
                entity.getFieldValue("assetId"), 
                entity.getFieldValue("portfolioId"), 
                entity.getFieldValue("orderType"),
                entity.getFieldValue("orderMethod"),
                entity.getFieldValue("quantity"),
                entity.getFieldValue("lastPrice"),
                entity.getFieldValue("lastPriceDate"),
                entity.getFieldValue("limitPrice"),
                entity.getFieldValue("stopPrice"),
                entity.getFieldValue("fulfilled"),
                entity.getFieldValue("fulfilledDate")
            ];
            const result = await window.database.SQLiteInsert({ query: query, parameters: args });
            return result;
        } catch(error) {
            return false;
        }
    }
    
    async read(entity: IEntity, action:string = "selectByPortfolio"): Promise<IEntity[]> {
        var query:string = "";
        var transactionQuery:string = "";
        var data;
        var transactionData;
        var entities: Array<IEntity> = [];

        try {
            const id = entity.getFieldValue("id");
            const portfolioId = entity.getFieldValue("portfolioId");

            // an array to contain the parameters for the parameterized query
            const parameterArray:any[] = [];
            var hasWhereCondition:boolean = false;

            if(action==="selectByPortfolio") {
                query = "SELECT *";
                query += " FROM Order WHERE";
                hasWhereCondition = false;
                query = this.appendWhere(query, " portfolioId=?", hasWhereCondition, "AND");
                parameterArray.push(portfolioId);
            }

            data = await window.database.SQLiteQuery({ query: query, parameters: parameterArray });
        } catch(error) {
            return entities;
        }

        for(var order of data) {
            var entity = new Order();
            entity.setFieldValue("id", order.id);
            entity.setFieldValue("portfolioId", order.portfolioId);
            entity.setFieldValue("assetId", order.assetId);
            entity.setFieldValue("orderType", order.orderType);
            entity.setFieldValue("orderMethod", order.orderMethod);
            entity.setFieldValue("quantity", order.quantity);
            entity.setFieldValue("orderDate", order.orderDate);
            entity.setFieldValue("lastPrice", order.lastPrice);
            entity.setFieldValue("lastPriceDate", order.lastPriceDate);
            entity.setFieldValue("limitPrice", order.limitPrice);
            entity.setFieldValue("stopPrice", order.stopPrice);
            entity.setFieldValue("fulfilled", order.fulfilled);
            entity.setFieldValue("fulfilledDate", order.fulfilledDate);
        
            entities.push(entity);
        }

        return entities;
    }

    private appendWhere(query:string, condition:string, hasWhereCondition:boolean, whereOperator:string = "OR") {
        if(!hasWhereCondition) {
            query += condition;
        } else {
            // currently using OR to match any of the conditions
            query += ` ${whereOperator}` + condition;
        }

        return query;
    }

    update(entity: IEntity, action: string): Promise<number> {
        throw new Error("This gateway does not have the ability to update content. Updates are handled by periodically deleting and re-entering data");
    }

    // purge the database of entries for a periodic refresh of the data
    async delete(entity: IEntity, action: string): Promise<number> {
        throw new Error("This gateway does not have the ability to delete content.");
    }

    //check to see if the database table exists
    async checkTableExists() {
        const query = "SELECT name FROM sqlite_master WHERE type='table' AND name='Portfolio';"
        const args:any[]  = [];
        const rows = await window.database.SQLiteQuery({ query: query, parameters: args });
        
        if(rows !== null && rows[0].name) {
            return true;
        }

        return false;
    }

    //for database tables that act as cache, check for the last time a table was updated
    async checkLastTableUpdate():Promise<any> {
        throw new Error("This gateway does not have the ability to check last table update.");
    }

    async refreshTableCache(entity: IEntity):Promise<Boolean> {
        throw new Error("This gateway does not have the ability to refresh table cache.");
        return false;
    }
}