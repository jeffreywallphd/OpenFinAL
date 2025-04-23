import {IEntity} from "../../Entity/IEntity";
import { IDataGateway } from "./IDataGateway";

export interface ISqlDataGateway extends IDataGateway {
    key?: string;
    sourceName: string;
    connect(): void;
    disconnect(): void;
    create(entity: IEntity, action: string): Promise<Boolean>;
    read(entity: IEntity, action: string): Promise<Array<IEntity>>;
    update(entity: IEntity, action: string): Promise<number>;
    delete(entity: IEntity, action: string): Promise<number>;
    checkTableExists(): Promise<Boolean>;
    checkLastTableUpdate() : Promise<Date>;
    refreshTableCache(entity: IEntity): Promise<Boolean>;
}