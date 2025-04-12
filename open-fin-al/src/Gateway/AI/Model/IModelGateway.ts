export interface IModelGateway {
    key?: any;
    purpose: string;
    create(model: string, messages: any[]) : Promise<any>;
}