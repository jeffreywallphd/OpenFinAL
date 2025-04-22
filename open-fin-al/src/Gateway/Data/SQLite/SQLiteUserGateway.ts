import {IEntity} from "@Entity/IEntity";
import {ISqlDataGateway} from "../ISqlDataGateway";
import { User } from "../../../Entity/User";

export class SQLiteUserGateway implements ISqlDataGateway {
    connection: any = null;
    sourceName: string = "SQLite Database";

    async connect(): Promise<void> {
        throw new Error("Due to the nature of this gateway's dependencies, connections are not handled through this method");
    }

    disconnect(): void {
        throw new Error("Due to the nature of this gateway's dependencies, connections and disconnections are not handled through this method");
    }

    // used to create and periodically refresh the cache
    async create(entity: IEntity): Promise<Boolean> {
        try {
            const query = "INSERT INTO User (firstName, lastName, email, username) VALUES (?, ?, ?, ?)";
            const args  = [entity.getFieldValue("firstName"), entity.getFieldValue("lastName"), entity.getFieldValue("email"), entity.getFieldValue("username")];
            const result = await window.database.SQLiteInsert({ query: query, parameters: args });
            return result;
        } catch(error) {
            return false;
        }
    }
    
    async read(entity: IEntity): Promise<IEntity[]> {
        var query:string = "";
        var data;
        var entities: Array<IEntity> = [];

        try {
            const firstName = entity.getFieldValue("firstName");
            const lastName = entity.getFieldValue("lastName");
            const email = entity.getFieldValue("email");
            const username = entity.getFieldValue("username");

            if(username === null) {
                return entities;
            }
            
            query = "SELECT *";

            // an array to contain the parameters for the parameterized query
            const parameterArray:any[] = [];

            query += " FROM User WHERE";

            var hasWhereCondition:boolean = false;

            query = this.appendWhere(query, " username=?", hasWhereCondition, "AND");
            parameterArray.push(username);
            
            data = await window.database.SQLiteQuery({ query: query, parameters: parameterArray });      
        } catch(error) {
            window.console.error(error);
            return entities;
        }

        for(var user of data) {
            var entity = new User();
            entity.setFieldValue("firstName", user.firstName);
            entity.setFieldValue("lastName", user.lastName);
            entity.setFieldValue("email", user.email);
            entity.setFieldValue("username", user.username);
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
        const query = "SELECT name FROM sqlite_master WHERE type='table' AND name='User';"
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

    async refreshTableCache(entity: IEntity) {
        throw new Error("This gateway does not have the ability to refresh table cache.");
    }
}