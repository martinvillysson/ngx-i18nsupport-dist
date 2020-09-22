"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ParsedMessagePartEndTag = void 0;
const parsed_message_part_1 = require("./parsed-message-part");
/**
 * Created by martin on 05.05.2017.
 * A message part consisting of a closing tag like </b> or </strange>.
 */
class ParsedMessagePartEndTag extends parsed_message_part_1.ParsedMessagePart {
    constructor(tagname) {
        super(parsed_message_part_1.ParsedMessagePartType.END_TAG);
        this._tagname = tagname;
    }
    asDisplayString(format) {
        return '</' + this._tagname + '>';
    }
    tagName() {
        return this._tagname;
    }
}
exports.ParsedMessagePartEndTag = ParsedMessagePartEndTag;
//# sourceMappingURL=parsed-message-part-end-tag.js.map