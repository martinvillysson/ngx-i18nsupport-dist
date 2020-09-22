"use strict";
/**
 * Created by roobm on 08.05.2017.
 * Some constant values used in the API.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.NORMALIZATION_FORMAT_NGXTRANSLATE = exports.NORMALIZATION_FORMAT_DEFAULT = exports.STATE_FINAL = exports.STATE_TRANSLATED = exports.STATE_NEW = exports.FILETYPE_XTB = exports.FILETYPE_XMB = exports.FILETYPE_XLIFF20 = exports.FILETYPE_XLIFF12 = exports.FORMAT_XTB = exports.FORMAT_XMB = exports.FORMAT_XLIFF20 = exports.FORMAT_XLIFF12 = void 0;
/**
 * supported file formats
 */
exports.FORMAT_XLIFF12 = 'xlf';
exports.FORMAT_XLIFF20 = 'xlf2';
exports.FORMAT_XMB = 'xmb';
exports.FORMAT_XTB = 'xtb';
/**
 * File types
 * (returned by fileType() method)
 */
exports.FILETYPE_XLIFF12 = 'XLIFF 1.2';
exports.FILETYPE_XLIFF20 = 'XLIFF 2.0';
exports.FILETYPE_XMB = 'XMB';
exports.FILETYPE_XTB = 'XTB';
/**
 * abstract state value.
 * There are only 3 supported state values.
 */
/**
 * State NEW.
 * Signals an untranslated unit.
 */
exports.STATE_NEW = 'new';
/**
 * State TRANSLATED.
 * Signals a translated unit, that is not reviewed until now.
 */
exports.STATE_TRANSLATED = 'translated';
/**
 * State FINAL.
 * Signals a translated unit, that is reviewed and ready for use.
 */
exports.STATE_FINAL = 'final';
/**
 * Normalizaton message formats.
 */
/**
 * Default format, contains placeholders, html markup.
 */
exports.NORMALIZATION_FORMAT_DEFAULT = 'default';
/**
 * Format for usage in ngxtranslate messages.
 * Placeholder are in the form {{n}}, no html markup.
 */
exports.NORMALIZATION_FORMAT_NGXTRANSLATE = 'ngxtranslate';
//# sourceMappingURL=constants.js.map