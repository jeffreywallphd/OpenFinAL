import {ITokenizer} from "./ITokenizer";

export interface IKeyedTokenizer extends ITokenizer {
    key: string;
    encodingName: string;
    modelName: string;
    encode(message : string) : any;
    decode(encoding : any) : any;
}