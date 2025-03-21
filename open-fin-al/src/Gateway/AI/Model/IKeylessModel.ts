import {IModel} from "./IModel";

export interface IKeylessModel extends IModel {
    create(model: string, messages: any[]) : Promise<any>;
}