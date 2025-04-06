export interface IModelGateway {
    key?: any;
    create(model: string, messages: any[]) : Promise<any>;
}