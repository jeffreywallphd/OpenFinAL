import {IModel} from "./IModel";

export interface IKeyedModel extends IModel{
    key: any;
    create(model: string, messages: any[]) : Promise<any>;
    //Implementation should include constructor that accepts a key.
}