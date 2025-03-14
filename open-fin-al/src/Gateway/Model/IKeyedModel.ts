import {IModel} from "./IModel";

export interface IKeyedModel extends IModel{
    key: string;
    modelName: string;
    checkTableExists?(): Promise<Boolean>;
    checkLastTableUpdate?(): Promise<Date>;
}