"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ParsedMessagePartText = void 0;
const parsed_message_part_1 = require("./parsed-message-part");
/**
 * Created by martin on 05.05.2017.
 * A message part consisting of just simple text.
 */
class ParsedMessagePartText extends parsed_message_part_1.ParsedMessagePart {
    constructor(text) {
        super(parsed_message_part_1.ParsedMessagePartType.TEXT);
        this.text = text;
    }
    asDisplayString(format) {
        return this.text;
    }
}
exports.ParsedMessagePartText = ParsedMessagePartText;
//# sourceMappingURL=parsed-message-part-text.js.map