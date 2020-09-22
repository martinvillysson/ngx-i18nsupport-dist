import { AutoTranslateResult } from './auto-translate-result';
import { ITransUnit } from '@ngx-i18nsupport/ngx-i18nsupport-lib';
/**
 * A report about a run of Google Translate over all untranslated unit.
 * * Created by martin on 29.06.2017.
 */
export declare class AutoTranslateSummaryReport {
    private _error;
    private _from;
    private _to;
    private _total;
    private _ignored;
    private _success;
    private _failed;
    constructor(from: string, to: string);
    /**
     * Set error if total call failed (e.g. "invalid api key" or "no connection" ...)
     * @param error error
     * @param total total
     */
    setError(error: string, total: number): void;
    error(): string;
    setIgnored(ignored: number): void;
    /**
     * Add a single result to the summary.
     * @param tu tu
     * @param result result
     */
    addSingleResult(tu: ITransUnit, result: AutoTranslateResult): void;
    /**
     * Merge another summary into this one.
     * @param anotherSummary anotherSummary
     */
    merge(anotherSummary: AutoTranslateSummaryReport): void;
    total(): number;
    ignored(): number;
    success(): number;
    failed(): number;
    /**
     * Human readable version of report
     */
    content(): string;
}
