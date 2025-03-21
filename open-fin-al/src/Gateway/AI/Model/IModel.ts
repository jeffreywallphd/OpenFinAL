export interface IModel {
    key?: any;
    create(model: string, messages: any[]) : Promise<any>;
}