import { ParsedMessagePart } from './parsed-message-part';
/**
 * Created by martin on 14.06.2017.
 * A message part consisting of an empty tag like <br/>.
 */
export declare class ParsedMessagePartEmptyTag extends ParsedMessagePart {
    private _tagname;
    private _idcounter;
    constructor(tagname: string, idcounter: number);
    asDisplayString(format?: string): string;
    tagName(): string;
    idCounter(): number;
}
