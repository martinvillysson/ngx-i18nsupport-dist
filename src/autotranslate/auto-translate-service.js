"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AutoTranslateService = void 0;
const util_1 = require("util");
const request = require("request");
const rxjs_1 = require("rxjs");
const rxjs_2 = require("rxjs");
const operators_1 = require("rxjs/operators");
const MAX_SEGMENTS = 128;
class AutoTranslateService {
    constructor(apiKey) {
        this._request = request;
        this._apiKey = apiKey;
        this._rootUrl = 'https://translation.googleapis.com/';
    }
    /**
     * Strip region code and convert to lower
     * @param lang lang
     * @return lang without region code and in lower case.
     */
    static stripRegioncode(lang) {
        const langLower = lang.toLowerCase();
        for (let i = 0; i < langLower.length; i++) {
            const c = langLower.charAt(i);
            if (c < 'a' || c > 'z') {
                return langLower.substring(0, i);
            }
        }
        return langLower;
    }
    /**
     * Change API key (just for tests).
     * @param apikey apikey
     */
    setApiKey(apikey) {
        this._apiKey = apikey;
    }
    /**
     * Translate an array of messages at once.
     * @param messages the messages to be translated
     * @param from source language code
     * @param to target language code
     * @return Observable with translated messages or error
     */
    translateMultipleStrings(messages, from, to) {
        // empty array needs no translation and always works ... (#78)
        if (messages.length === 0) {
            return rxjs_2.of([]);
        }
        if (!this._apiKey) {
            return rxjs_2.throwError('cannot autotranslate: no api key');
        }
        if (!from || !to) {
            return rxjs_2.throwError('cannot autotranslate: source and target language must be set');
        }
        from = AutoTranslateService.stripRegioncode(from);
        to = AutoTranslateService.stripRegioncode(to);
        const allRequests = this.splitMessagesToGoogleLimit(messages).map((partialMessages) => {
            return this.limitedTranslateMultipleStrings(partialMessages, from, to);
        });
        return rxjs_2.forkJoin(allRequests).pipe(operators_1.map((allTranslations) => {
            let all = [];
            for (let i = 0; i < allTranslations.length; i++) {
                all = all.concat(allTranslations[i]);
            }
            return all;
        }));
    }
    splitMessagesToGoogleLimit(messages) {
        if (messages.length <= MAX_SEGMENTS) {
            return [messages];
        }
        const result = [];
        let currentPackage = [];
        let packageSize = 0;
        for (let i = 0; i < messages.length; i++) {
            currentPackage.push(messages[i]);
            packageSize++;
            if (packageSize >= MAX_SEGMENTS) {
                result.push(currentPackage);
                currentPackage = [];
                packageSize = 0;
            }
        }
        if (currentPackage.length > 0) {
            result.push(currentPackage);
        }
        return result;
    }
    /**
     * Return translation request, but messages must be limited to google limits.
     * Not more that 128 single messages.
     * @param messages messages
     * @param from from
     * @param to to
     * @return the translated strings
     */
    limitedTranslateMultipleStrings(messages, from, to) {
        const realUrl = this._rootUrl + 'language/translate/v2' + '?key=' + this._apiKey;
        const translateRequest = {
            q: messages,
            target: to,
            source: from,
        };
        const options = {
            url: realUrl,
            body: translateRequest,
            json: true,
        };
        return this.post(realUrl, options).pipe(operators_1.map((data) => {
            const body = data.body;
            if (!body) {
                throw new Error('no result received');
            }
            if (body.error) {
                if (body.error.code === 400) {
                    if (body.error.message === 'Invalid Value') {
                        throw new Error(util_1.format('Translation from "%s" to "%s" not supported', from, to));
                    }
                    throw new Error(util_1.format('Invalid request: %s', body.error.message));
                }
                else {
                    throw new Error(util_1.format('Error %s: %s', body.error.code, body.error.message));
                }
            }
            const result = body.data;
            return result.translations.map((translation) => {
                return translation.translatedText;
            });
        }));
    }
    /**
     * Function to do a POST HTTP request
     *
     * @param uri uri
     * @param options options
     *
     * @return response
     */
    post(uri, options) {
        return this._call.apply(this, [].concat('post', uri, Object.assign({}, options || {})));
    }
    /**
     * Function to do a HTTP request for given method
     *
     * @param method method
     * @param uri uri
     * @param options options
     *
     * @return response
     *
     */
    _call(method, uri, options) {
        return rxjs_1.Observable.create((observer) => {
            // build params array
            const params = [].concat(uri, Object.assign({}, options || {}), (error, response, body) => {
                if (error) {
                    return observer.error(error);
                }
                observer.next(Object.assign({}, {
                    response: response,
                    body: body
                }));
                observer.complete();
            });
            // _call request method
            try {
                this._request[method].apply(this._request, params);
            }
            catch (error) {
                observer.error(error);
            }
        });
    }
}
exports.AutoTranslateService = AutoTranslateService;
//# sourceMappingURL=auto-translate-service.js.map