"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ParsedMessagePartEmptyTag = void 0;
const parsed_message_part_1 = require("./parsed-message-part");
/**
 * Created by martin on 14.06.2017.
 * A message part consisting of an empty tag like <br/>.
 */
class ParsedMessagePartEmptyTag extends parsed_message_part_1.ParsedMessagePart {
    constructor(tagname, idcounter) {
        super(parsed_message_part_1.ParsedMessagePartType.EMPTY_TAG);
        this._tagname = tagname;
        this._idcounter = idcounter;
    }
    asDisplayString(format) {
        if (this._idcounter === 0) {
            return '<' + this._tagname + '>';
        }
        else {
            return '<' + this._tagname + ' id="' + this._idcounter.toString() + '">';
        }
    }
    tagName() {
        return this._tagname;
    }
    idCounter() {
        return this._idcounter;
    }
}
exports.ParsedMessagePartEmptyTag = ParsedMessagePartEmptyTag;
//# sourceMappingURL=parsed-message-part-empty-tag.js.map