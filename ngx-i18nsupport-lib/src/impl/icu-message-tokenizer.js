"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ICUMessageTokenizer = exports.SELECT = exports.PLURAL = exports.COMMA = exports.CURLY_BRACE_CLOSE = exports.CURLY_BRACE_OPEN = exports.TEXT = void 0;
const Tokenizr = require("tokenizr");
/**
 * Created by martin on 04.06.2017.
 * A tokenizer for ICU messages.
 */
// Tokens
exports.TEXT = 'TEXT';
exports.CURLY_BRACE_OPEN = 'CURLY_BRACE_OPEN';
exports.CURLY_BRACE_CLOSE = 'CURLY_BRACE_CLOSE';
exports.COMMA = 'COMMA';
exports.PLURAL = 'PLURAL';
exports.SELECT = 'SELECT';
// states: default normal in_message
const STATE_DEFAULT = 'default';
const STATE_NORMAL = 'normal';
const STATE_IN_MESSAGE = 'in_message';
class ICUMessageTokenizer {
    getLexer() {
        const lexer = new Tokenizr();
        let plaintext = '';
        let openedCurlyBracesInTextCounter = 0;
        lexer.before((ctx, match, rule) => {
            if (rule.name !== exports.TEXT) {
                if (this.containsNonWhiteSpace(plaintext)) {
                    ctx.accept(exports.TEXT, plaintext);
                    plaintext = '';
                }
                else {
                    ctx.ignore();
                }
            }
        });
        lexer.finish((ctx) => {
            if (this.containsNonWhiteSpace(plaintext)) {
                ctx.accept(exports.TEXT, plaintext);
            }
        });
        // curly brace
        lexer.rule(STATE_DEFAULT, /{/, (ctx, match) => {
            ctx.accept(exports.CURLY_BRACE_OPEN, match[0]);
            ctx.push(STATE_NORMAL);
        }, exports.CURLY_BRACE_OPEN);
        lexer.rule(STATE_NORMAL, /{/, (ctx, match) => {
            ctx.accept(exports.CURLY_BRACE_OPEN, match[0]);
            ctx.push(STATE_IN_MESSAGE);
        }, exports.CURLY_BRACE_OPEN);
        lexer.rule(STATE_NORMAL, /}/, (ctx, match) => {
            ctx.pop();
            ctx.accept(exports.CURLY_BRACE_CLOSE, match[0]);
        }, exports.CURLY_BRACE_CLOSE);
        // masked ' { and }
        lexer.rule(STATE_IN_MESSAGE, /'[{}]?'/, (ctx, match) => {
            if (match[0] === '\'\'') {
                plaintext += '\'';
            }
            else if (match[0] === '\'{\'') {
                plaintext += '{';
            }
            else if (match[0] === '\'}\'') {
                plaintext += '}';
            }
            ctx.ignore();
        }, exports.TEXT);
        lexer.rule(STATE_IN_MESSAGE, /./, (ctx, match) => {
            const char = match[0];
            if (char === '{') {
                openedCurlyBracesInTextCounter++;
                plaintext += match[0];
                ctx.ignore();
            }
            else if (char === '}') {
                if (openedCurlyBracesInTextCounter > 0) {
                    openedCurlyBracesInTextCounter--;
                    plaintext += match[0];
                    ctx.ignore();
                }
                else {
                    ctx.pop();
                    ctx.accept(exports.TEXT, plaintext);
                    plaintext = '';
                    ctx.accept(exports.CURLY_BRACE_CLOSE, match[0]);
                }
            }
            else {
                plaintext += match[0];
                ctx.ignore();
            }
        }, exports.TEXT);
        // comma
        lexer.rule(STATE_NORMAL, /,/, (ctx, match) => {
            ctx.accept(exports.COMMA, match[0]);
        }, exports.COMMA);
        // keywords plural and select
        lexer.rule(STATE_NORMAL, /plural/, (ctx, match) => {
            ctx.accept(exports.PLURAL, match[0]);
        }, exports.PLURAL);
        lexer.rule(STATE_NORMAL, /select/, (ctx, match) => {
            ctx.accept(exports.SELECT, match[0]);
        }, exports.SELECT);
        // text
        lexer.rule(/./, (ctx, match) => {
            plaintext += match[0];
            ctx.ignore();
        }, exports.TEXT);
        lexer.rule(/[\s]+/, (ctx, match) => {
            plaintext += match[0];
            ctx.ignore();
        }, exports.TEXT);
        return lexer;
    }
    containsNonWhiteSpace(text) {
        for (let i = 0; i < text.length; i++) {
            if (!/\s/.test(text.charAt(i))) {
                return true;
            }
        }
        return false;
    }
    tokenize(normalizedMessage) {
        const lexer = this.getLexer();
        lexer.input(normalizedMessage);
        return lexer.tokens();
    }
    input(normalizedMessage) {
        this.lexer = this.getLexer();
        this.lexer.input(normalizedMessage);
    }
    next() {
        return this.lexer.token();
    }
    peek() {
        return this.lexer.peek();
    }
}
exports.ICUMessageTokenizer = ICUMessageTokenizer;
//# sourceMappingURL=icu-message-tokenizer.js.map