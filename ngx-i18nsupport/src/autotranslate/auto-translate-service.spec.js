"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getApiKey = void 0;
const fs = require("fs");
const file_util_1 = require("../common/file-util");
const util_1 = require("util");
const auto_translate_service_1 = require("./auto-translate-service");
/**
 * Created by roobm on 06.07.2017.
 * Testcases for the autotranslate service.
 */
/**
 * Get google Translate API key from file.
 * Which file is read, is determined by env var API_KEY_FILE.
 * @return a (hopefully) valid API key or null
 */
function getApiKey() {
    const apikeyPath = process.env.API_KEY_FILE;
    if (apikeyPath) {
        if (fs.existsSync(apikeyPath)) {
            return file_util_1.FileUtil.read(apikeyPath, 'utf-8');
        }
        else {
            throw new Error(util_1.format('api key file not found: API_KEY_FILE=%s', apikeyPath));
        }
    }
    else {
        return null;
    }
}
exports.getApiKey = getApiKey;
describe('Autotranslate tests', () => {
    let apikey;
    let service;
    beforeEach(() => {
        apikey = getApiKey();
        if (apikey) {
            service = new auto_translate_service_1.AutoTranslateService(apikey);
        }
        else {
            service = null;
        }
    });
    it('should detect wrong api key', (done) => {
        if (!service) {
            done();
            return;
        }
        service.setApiKey('lmaa');
        service.translateMultipleStrings(['a', 'b'], 'en', 'de').subscribe(() => {
            expect('should not be called').toBe('');
            done();
        }, (err) => {
            expect(err.message).toContain('API key not valid');
            done();
        });
    });
    it('should detect unsupported language', (done) => {
        if (!service) {
            done();
            return;
        }
        service.translateMultipleStrings(['a', 'b'], 'en', 'klingon').subscribe(() => {
            expect('should not be called').toBe('');
            done();
        }, (err) => {
            expect(err.message).toBe('Translation from "en" to "klingon" not supported');
            done();
        });
    });
    it('should translate simple words from en to de', (done) => {
        if (!service) {
            done();
            return;
        }
        service.translateMultipleStrings(['Hello', 'world'], 'en', 'de').subscribe((translations) => {
            expect(translations).toBeTruthy();
            expect(translations.length).toBe(2);
            expect(translations[0]).toBe('Hallo');
            expect(translations[1]).toBe('Welt');
            done();
        }, (err) => {
            expect(err.message).toBe(''); // should not be invoked
            done();
        });
    });
    it('should translate empty string from en to de', (done) => {
        if (!service) {
            done();
            return;
        }
        service.translateMultipleStrings(['', 'world'], 'en', 'de').subscribe((translations) => {
            expect(translations).toBeTruthy();
            expect(translations.length).toBe(2);
            expect(translations[0]).toBe('');
            expect(translations[1]).toBe('Welt');
            done();
        }, (err) => {
            expect(err.message).toBe(''); // should not be invoked
            done();
        });
    });
    it('should accept empty array of translations', (done) => {
        if (!service) {
            done();
            return;
        }
        service.translateMultipleStrings([], 'en', 'de').subscribe((translations) => {
            expect(translations).toBeTruthy();
            expect(translations.length).toBe(0);
            done();
        }, (err) => {
            expect(err.message).toBe(''); // should not be invoked
            done();
        });
    });
    it('should ignore region codes', (done) => {
        if (!service) {
            done();
            return;
        }
        service.translateMultipleStrings(['Hello', 'world'], 'en-uk', 'de-ch').subscribe((translations) => {
            expect(translations).toBeTruthy();
            expect(translations.length).toBe(2);
            expect(translations[0]).toBe('Hallo');
            expect(translations[1]).toBe('Welt');
            done();
        }, (err) => {
            expect(err.message).toBe(''); // should not be invoked
            done();
        });
    });
    it('should translate very large number of messages', (done) => {
        if (!service) {
            done();
            return;
        }
        const NUM = 1000; // internal google limit is 128, so service has to split it...
        const manyMessages = [];
        for (let i = 0; i < NUM; i++) {
            manyMessages.push('Hello world!');
        }
        service.translateMultipleStrings(manyMessages, 'en', 'de').subscribe((translations) => {
            expect(translations).toBeTruthy();
            expect(translations.length).toBe(NUM);
            done();
        }, (err) => {
            expect(err.message).toBe(''); // should not be invoked
            done();
        });
    });
    it('should translate very long messages that exceeds google size limit of 5000 chars ', (done) => {
        if (!service) {
            done();
            return;
        }
        const longString = 'abcdefghijklmnopqrstuvwabcdefghijklmnopqrstuvwabcdefghijklmnopqrstuvwabcdefghijklmnopqrstuvwabcdefghijklmn' +
            'opqrstuvwabcdefghijklmnopqrstuvwabcdefghijklmnopqrstuvwabcdefghijklmnopqrstuvwabcdefghijklmnopqrstuvwabcdefghijklmnopqrstuvw';
        const longMessages = [];
        const NUM = 30; // 30 * 260char = 5200
        for (let i = 0; i < NUM; i++) {
            longMessages.push(longString);
        }
        service.translateMultipleStrings(longMessages, 'en', 'de').subscribe((translations) => {
            expect(translations).toBeTruthy();
            expect(translations.length).toBe(NUM);
            done();
        }, (err) => {
            expect(err.message).toBe(''); // should not be invoked
            done();
        });
    });
    it('should translate to french apostrophes (#94)', (done) => {
        if (!service) {
            done();
            return;
        }
        service.translateMultipleStrings(['Operator Logs'], 'en', 'fr').subscribe((translations) => {
            expect(translations).toBeTruthy();
            expect(translations.length).toBe(1);
            expect(translations[0]).toBe('Journaux d&#39;opérateur');
            done();
        }, (err) => {
            expect(err.message).toBe(''); // should not be invoked
            done();
        });
    });
    it('should translate to german umlaut (#94)', (done) => {
        if (!service) {
            done();
            return;
        }
        service.translateMultipleStrings(['green doors'], 'en', 'de').subscribe((translations) => {
            expect(translations).toBeTruthy();
            expect(translations.length).toBe(1);
            expect(translations[0]).toBe('grüne Türen');
            done();
        }, (err) => {
            expect(err.message).toBe(''); // should not be invoked
            done();
        });
    });
});
//# sourceMappingURL=auto-translate-service.spec.js.map