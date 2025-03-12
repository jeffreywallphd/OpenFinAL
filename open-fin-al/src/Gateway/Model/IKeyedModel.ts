import {IModel} from "./IModel";

export interface IKeyedModel extends IModel{
    key: string;
    modelName: string;
    sendAndRecieve(message : string) : string;
    checkTableExists?(): Promise<Boolean>;
    checkLastTableUpdate?(): Promise<Date>;
}