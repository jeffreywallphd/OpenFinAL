import {IEntity} from "../../Entity/IEntity";
import { IDataGateway } from "./IDataGateway";

export interface INeo4JGraphGateway extends IDataGateway {
    user: string;
    key: string;
    sourceName: string;
    connect(): Promise<boolean>;
    disconnect(): Promise<boolean>;
    create(entity: IEntity, action?: string): Promise<Boolean>;
    read(entity: IEntity, action?: string): Promise<Array<IEntity>>;
    update(entity: IEntity, action?: string): Promise<number>;
    delete(entity: IEntity, action?: string): Promise<number>;
    checkGraphConnected(): Promise<Boolean>;
    checkGraphExists(): Promise<Boolean>;
    checkLastGraphUpdate() : Promise<Date>;
}