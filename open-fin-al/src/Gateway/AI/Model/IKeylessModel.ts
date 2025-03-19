import {IModel} from "./IModel";

export interface IKeylessModel extends IModel {
    modelName: string;
    create(message : any) : object;
}