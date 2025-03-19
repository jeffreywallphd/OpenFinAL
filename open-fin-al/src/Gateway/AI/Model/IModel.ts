export interface IModel {
    key?: string;
    modelName: string;
    create(message : any) : object;
}