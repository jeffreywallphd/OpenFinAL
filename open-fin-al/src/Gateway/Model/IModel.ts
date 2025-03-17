export interface IModel {
    key?: string;
    modelName: string;
    sendAndRecieve(message : string) : string;
    checkTableExists?(): Promise<Boolean>;
    checkLastTableUpdate?(): Promise<Date>;
}