"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ParsedMesageTokenizer = exports.ICU_MESSAGE = exports.ICU_MESSAGE_REF = exports.PLACEHOLDER = exports.EMPTY_TAG = exports.END_TAG = exports.START_TAG = exports.TEXT = void 0;
const Tokenizr = require("tokenizr");
const util_1 = require("util");
/**
 * Created by martin on 14.05.2017.
 * A tokenizer for normalized messages.
 */
// Tokens
exports.TEXT = 'TEXT';
exports.START_TAG = 'START_TAG';
exports.END_TAG = 'END_TAG';
exports.EMPTY_TAG = 'EMPTY_TAG';
exports.PLACEHOLDER = 'PLACEHOLDER';
exports.ICU_MESSAGE_REF = 'ICU_MESSAGE_REF';
exports.ICU_MESSAGE = 'ICU_MESSAGE';
class ParsedMesageTokenizer {
    getLexer() {
        const lexer = new Tokenizr();
        let plaintext = '';
        lexer.before((ctx, match, rule) => {
            if (rule.name !== exports.TEXT && plaintext !== '') {
                ctx.accept(exports.TEXT, { text: plaintext });
                plaintext = '';
            }
        });
        lexer.finish((ctx) => {
            if (plaintext !== '') {
                ctx.accept(exports.TEXT, { text: plaintext });
            }
        });
        // empty tag, there are only a few allowed (see tag-mappings): ['BR', 'HR', 'IMG', 'AREA', 'LINK', 'WBR']
        // format is <name id="nr">, nr ist optional, z.B. <img> oder <img id="2">
        lexer.rule(/<(br|hr|img|area|link|wbr)( id="([0-9])*")?\>/, (ctx, match) => {
            const idcount = util_1.isNullOrUndefined(match[3]) ? 0 : parseInt(match[3], 10);
            ctx.accept(exports.EMPTY_TAG, { name: match[1], idcounter: idcount });
        }, exports.EMPTY_TAG);
        // start tag, Format <name id="nr">, nr ist optional, z.B. <mytag> oder <mytag id="2">
        lexer.rule(/<([a-zA-Z][a-zA-Z-0-9]*)( id="([0-9]*)")?>/, (ctx, match) => {
            const idcount = util_1.isNullOrUndefined(match[3]) ? 0 : parseInt(match[3], 10);
            ctx.accept(exports.START_TAG, { name: match[1], idcounter: idcount });
        }, exports.START_TAG);
        // end tag
        lexer.rule(/<\/([a-zA-Z][a-zA-Z-0-9]*)>/, (ctx, match) => {
            ctx.accept(exports.END_TAG, { name: match[1] });
        }, exports.END_TAG);
        // placeholder
        lexer.rule(/{{([0-9]+)}}/, (ctx, match) => {
            ctx.accept(exports.PLACEHOLDER, { idcounter: parseInt(match[1], 10) });
        }, exports.PLACEHOLDER);
        // icu message ref
        lexer.rule(/<ICU-Message-Ref_([0-9]+)\/>/, (ctx, match) => {
            ctx.accept(exports.ICU_MESSAGE_REF, { idcounter: parseInt(match[1], 10) });
        }, exports.ICU_MESSAGE_REF);
        // icu message
        lexer.rule(/<ICU-Message\/>/, (ctx, match) => {
            ctx.accept(exports.ICU_MESSAGE, { message: match[0] });
        }, exports.ICU_MESSAGE);
        // text
        lexer.rule(/./, (ctx, match) => {
            plaintext += match[0];
            ctx.ignore();
        }, exports.TEXT);
        lexer.rule(/[\t\r\n]+/, (ctx, match) => {
            plaintext += match[0];
            ctx.ignore();
        }, exports.TEXT);
        return lexer;
    }
    tokenize(normalizedMessage) {
        const lexer = this.getLexer();
        lexer.reset();
        lexer.input(normalizedMessage);
        return lexer.tokens();
    }
}
exports.ParsedMesageTokenizer = ParsedMesageTokenizer;
//# sourceMappingURL=parsed-message-tokenizer.js.map