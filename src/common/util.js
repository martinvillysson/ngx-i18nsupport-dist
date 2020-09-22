"use strict";
/**
 * Collection of utility functions that are deprecated in nodes util.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.isArray = exports.isNumber = exports.isBoolean = exports.isString = exports.isNullOrUndefined = void 0;
/**
 * Replaces node isNullOrUndefined.
 */
function isNullOrUndefined(value) {
    return value === undefined || value === null;
}
exports.isNullOrUndefined = isNullOrUndefined;
/**
 * Replaces node isString.
 */
function isString(value) {
    return typeof value === 'string';
}
exports.isString = isString;
/**
 * Replaces node isBoolean.
 */
function isBoolean(value) {
    return typeof value === 'boolean';
}
exports.isBoolean = isBoolean;
/**
 * Replaces node isNumber.
 */
function isNumber(value) {
    return typeof value === 'number';
}
exports.isNumber = isNumber;
/**
 * Replaces node isArray.
 */
function isArray(value) {
    return Array.isArray(value);
}
exports.isArray = isArray;
//# sourceMappingURL=util.js.map