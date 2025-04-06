import {IModelGateway} from "./IModelGateway";

export interface IKeylessModelGateway extends IModelGateway {
    create(model: string, messages: any[]) : Promise<any>;
}