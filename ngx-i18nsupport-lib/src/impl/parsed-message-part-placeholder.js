"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ParsedMessagePartPlaceholder = void 0;
const parsed_message_part_1 = require("./parsed-message-part");
const constants_1 = require("../api/constants");
/**
 * Created by martin on 05.05.2017.
 * A message part consisting of a placeholder.
 * Placeholders are numbered from 0 to n.
 */
class ParsedMessagePartPlaceholder extends parsed_message_part_1.ParsedMessagePart {
    constructor(index, disp) {
        super(parsed_message_part_1.ParsedMessagePartType.PLACEHOLDER);
        this._index = index;
        this._disp = disp;
    }
    asDisplayString(format) {
        if (format === constants_1.NORMALIZATION_FORMAT_NGXTRANSLATE) {
            return '{{' + this._index + '}}';
        }
        return '{{' + this._index + '}}';
    }
    index() {
        return this._index;
    }
    disp() {
        return this._disp;
    }
}
exports.ParsedMessagePartPlaceholder = ParsedMessagePartPlaceholder;
//# sourceMappingURL=parsed-message-part-placeholder.js.map