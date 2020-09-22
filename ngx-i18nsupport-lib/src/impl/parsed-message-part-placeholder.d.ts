import { ParsedMessagePart } from './parsed-message-part';
/**
 * Created by martin on 05.05.2017.
 * A message part consisting of a placeholder.
 * Placeholders are numbered from 0 to n.
 */
export declare class ParsedMessagePartPlaceholder extends ParsedMessagePart {
    private _index;
    private _disp?;
    constructor(index: number, disp: string);
    asDisplayString(format?: string): string;
    index(): number;
    disp(): string;
}
