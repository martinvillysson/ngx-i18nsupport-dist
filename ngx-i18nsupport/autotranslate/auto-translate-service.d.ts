import * as request from 'request';
import { Observable } from 'rxjs';
interface InternalRequestResponse {
    response: request.RequestResponse;
    body: any;
}
export declare class AutoTranslateService {
    private _request;
    _rootUrl: string;
    _apiKey: string;
    /**
     * Strip region code and convert to lower
     * @param lang lang
     * @return lang without region code and in lower case.
     */
    static stripRegioncode(lang: string): string;
    constructor(apiKey: string);
    /**
     * Change API key (just for tests).
     * @param apikey apikey
     */
    setApiKey(apikey: string): void;
    /**
     * Translate an array of messages at once.
     * @param messages the messages to be translated
     * @param from source language code
     * @param to target language code
     * @return Observable with translated messages or error
     */
    translateMultipleStrings(messages: string[], from: string, to: string): Observable<string[]>;
    private splitMessagesToGoogleLimit;
    /**
     * Return translation request, but messages must be limited to google limits.
     * Not more that 128 single messages.
     * @param messages messages
     * @param from from
     * @param to to
     * @return the translated strings
     */
    private limitedTranslateMultipleStrings;
    /**
     * Function to do a POST HTTP request
     *
     * @param uri uri
     * @param options options
     *
     * @return response
     */
    post(uri: string, options?: request.CoreOptions): Observable<InternalRequestResponse>;
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
    private _call;
}
export {};
