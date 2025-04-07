import {ITokenizer} from "./ITokenizer";

export interface IKeyedTokenizer extends ITokenizer {
    key: any;
    encodingName: string;
    modelName: string;
    encode(message : string) : any;
    decode(encoding : any) : any;
}