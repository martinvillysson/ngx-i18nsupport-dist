"use strict";
/**
 * Created by martin on 05.05.2017.
 * A part of a parsed message.
 * Can be a text, a placeholder, a tag
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.ParsedMessagePart = exports.ParsedMessagePartType = void 0;
var ParsedMessagePartType;
(function (ParsedMessagePartType) {
    ParsedMessagePartType[ParsedMessagePartType["TEXT"] = 0] = "TEXT";
    ParsedMessagePartType[ParsedMessagePartType["PLACEHOLDER"] = 1] = "PLACEHOLDER";
    ParsedMessagePartType[ParsedMessagePartType["START_TAG"] = 2] = "START_TAG";
    ParsedMessagePartType[ParsedMessagePartType["END_TAG"] = 3] = "END_TAG";
    ParsedMessagePartType[ParsedMessagePartType["EMPTY_TAG"] = 4] = "EMPTY_TAG";
    ParsedMessagePartType[ParsedMessagePartType["ICU_MESSAGE"] = 5] = "ICU_MESSAGE";
    ParsedMessagePartType[ParsedMessagePartType["ICU_MESSAGE_REF"] = 6] = "ICU_MESSAGE_REF";
})(ParsedMessagePartType = exports.ParsedMessagePartType || (exports.ParsedMessagePartType = {}));
class ParsedMessagePart {
    constructor(type) {
        this.type = type;
    }
}
exports.ParsedMessagePart = ParsedMessagePart;
//# sourceMappingURL=parsed-message-part.js.map