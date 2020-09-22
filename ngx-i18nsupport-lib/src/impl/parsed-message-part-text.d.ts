import { ParsedMessagePart } from './parsed-message-part';
/**
 * Created by martin on 05.05.2017.
 * A message part consisting of just simple text.
 */
export declare class ParsedMessagePartText extends ParsedMessagePart {
    private text;
    constructor(text: string);
    asDisplayString(format?: string): string;
}
