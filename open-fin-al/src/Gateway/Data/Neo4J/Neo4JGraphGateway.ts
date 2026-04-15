import neo4j, {Record, Node} from "neo4j-driver";
import {IEntity} from "../../../Entity/IEntity";
import {ICredentialedDataGateway} from "../ICredentialedDataGateway";

declare global {
    interface Window { 
        neo4j: any
    }
}

export class Neo4JGraphGateway implements ICredentialedDataGateway {
    user: string = "";
    key: string = "";
    sourceName: string = "Neo4j Local Database";

    async connect(): Promise<boolean> {
        try {
            return await window.neo4j.start();
        } catch (error) {
            console.error("Error connecting to Neo4j server:", error);
            return false;
        }
    }

    async disconnect(): Promise<boolean> {
        try {
            return await window.neo4j.stop();
        } catch (error) {
            console.error("Error disconnecting from Neo4j server:", error);
            return false;
        }
    }

    create(entity: IEntity, action: string): Promise<Boolean> {
        //at the moment, users will not be permitted to create new graphs
        throw new Error("Method not implemented.");
    }

    async read(entity: IEntity, action: string): Promise<IEntity[]> {      
        const id:any = null;
        try {
            const query = 
                `
                MATCH (u:User { id: $id })
                RETURN u
                `
            ;

            const results = await window.neo4j.executeQuery(query, {id: id});
            return results;
        } catch (error) {
            window.console.error("Error reading from Neo4j server:", error);
            return null;
        }
    } 

    update(entity: IEntity, action: string): Promise<number> {
        //at the moment, users will not be permitted to update graphs;
        throw new Error("Method not implemented.");
    }

    delete(entity: IEntity, action: string): Promise<number> {
        //at the moment, users will not be permitted to delete graphs
        throw new Error("Method not implemented.");
    }
}