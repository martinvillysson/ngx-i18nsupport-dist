import { ParsedMessagePart } from './parsed-message-part';
/**
 * Created by martin on 05.05.2017.
 * A message part consisting of a closing tag like </b> or </strange>.
 */
export declare class ParsedMessagePartEndTag extends ParsedMessagePart {
    private _tagname;
    constructor(tagname: string);
    asDisplayString(format?: string): string;
    tagName(): string;
}
