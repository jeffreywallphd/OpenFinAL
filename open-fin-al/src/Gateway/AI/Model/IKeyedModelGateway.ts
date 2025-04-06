import {IModelGateway} from "./IModelGateway";

export interface IKeyedModelGateway extends IModelGateway{
    key: any;
    create(model: string, messages: any[]) : Promise<any>;
    //Implementation should include constructor that accepts a key.
}