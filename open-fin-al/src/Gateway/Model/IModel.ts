export interface IModel {
    key?: string;
    modelName: string;
    create(request : string) : string;
    checkTableExists?(): Promise<Boolean>;
    checkLastTableUpdate?(): Promise<Date>;
}