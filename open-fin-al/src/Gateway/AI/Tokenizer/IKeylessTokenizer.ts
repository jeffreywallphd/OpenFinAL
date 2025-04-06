import {ITokenizer} from "./ITokenizer";

export interface IKeylessTokenizer extends ITokenizer{
    encodingName: string;
    modelName: string;
    encode(message : string) : any;
    decode(encoding : any) : any;
}