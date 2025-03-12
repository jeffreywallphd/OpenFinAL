export interface IModel {
    key?: string;
    modelName: string;
    checkTableExists?(): Promise<Boolean>;
    checkLastTableUpdate?(): Promise<Date>;
}