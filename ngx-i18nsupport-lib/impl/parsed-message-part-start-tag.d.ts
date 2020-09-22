import { ParsedMessagePart } from './parsed-message-part';
/**
 * Created by martin on 05.05.2017.
 * A message part consisting of an opening tag like <b> or <strange>.
 */
export declare class ParsedMessagePartStartTag extends ParsedMessagePart {
    private _tagname;
    private _idcounter;
    constructor(tagname: string, idcounter: number);
    asDisplayString(format?: string): string;
    tagName(): string;
    idCounter(): number;
}
