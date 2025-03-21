export interface ITokenizer {
    key?: any;
    encodingName: string;
    modelName: string;
    encode(message : string) : any;
    decode(encoding : any) : any;
}