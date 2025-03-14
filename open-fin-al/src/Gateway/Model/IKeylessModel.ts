import {IModel} from "./IModel";

export interface IKeylessModel extends IModel {
    modelName: string;
    create(message : string) : string;
    checkTableExists?(): Promise<Boolean>;
    checkLastTableUpdate?(): Promise<Date>;
}