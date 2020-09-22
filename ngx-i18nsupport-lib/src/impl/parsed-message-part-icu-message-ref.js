"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ParsedMessagePartICUMessageRef = void 0;
const parsed_message_part_1 = require("./parsed-message-part");
/**
 * Created by martin on 05.05.2017.
 * A reference to an ICU message
 * icu references are numbered from 0 to n.
 */
class ParsedMessagePartICUMessageRef extends parsed_message_part_1.ParsedMessagePart {
    constructor(index, disp) {
        super(parsed_message_part_1.ParsedMessagePartType.ICU_MESSAGE_REF);
        this._index = index;
        this._disp = disp;
    }
    asDisplayString(format) {
        return '<ICU-Message-Ref_' + this._index + '/>';
    }
    index() {
        return this._index;
    }
    disp() {
        return this._disp;
    }
}
exports.ParsedMessagePartICUMessageRef = ParsedMessagePartICUMessageRef;
//# sourceMappingURL=parsed-message-part-icu-message-ref.js.map