export interface ITokenizer {
    key?: string;
    encodingName: string;
    modelName: string;
    encode(message : string) : any;
    decode(encoding : any) : any;
}