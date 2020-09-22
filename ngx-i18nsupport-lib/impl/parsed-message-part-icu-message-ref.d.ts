import { ParsedMessagePart } from './parsed-message-part';
/**
 * Created by martin on 05.05.2017.
 * A reference to an ICU message
 * icu references are numbered from 0 to n.
 */
export declare class ParsedMessagePartICUMessageRef extends ParsedMessagePart {
    private _index;
    private _disp?;
    constructor(index: number, disp: string);
    asDisplayString(format?: string): string;
    index(): number;
    disp(): string;
}
