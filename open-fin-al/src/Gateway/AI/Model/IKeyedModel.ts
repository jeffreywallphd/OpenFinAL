import {IModel} from "./IModel";

export interface IKeyedModel extends IModel{
    key: string;
    modelName: string;
    create(message : any) : object;

    // @ts-ignore
    constructor(key: string);
}