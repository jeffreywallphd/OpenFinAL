import {Record, Node} from "neo4j-driver";
import {IEntity} from "../../../Entity/IEntity";
import {IKeylessDataGateway} from "../IKeylessDataGateway";

declare global {
    interface Window { 
        neo4j: any
    }
}

export class Neo4JGraphGateway implements IKeylessDataGateway {
    sourceName: string = "Neo4j Local Database";
    driver: any = null;

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

        const neo4j = window.neo4j.core();
        
        this.driver = await window.neo4j.driver();
        const session = this.driver.session({
            defaultAccessMode: neo4j.session.READ,
        });

        try {
            const result = await session.run(
                `
                MATCH (u:User { id: $id })
                RETURN u
                `,
                { id }
            );

            // Extract nodes from records
            return null;
        } finally {
            await session.close();
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