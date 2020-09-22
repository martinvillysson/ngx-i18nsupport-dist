"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AutoTranslateSummaryReport = void 0;
const util_1 = require("util");
/**
 * A report about a run of Google Translate over all untranslated unit.
 * * Created by martin on 29.06.2017.
 */
class AutoTranslateSummaryReport {
    constructor(from, to) {
        this._from = from;
        this._to = to;
        this._total = 0;
        this._ignored = 0;
        this._success = 0;
        this._failed = 0;
    }
    /**
     * Set error if total call failed (e.g. "invalid api key" or "no connection" ...)
     * @param error error
     * @param total total
     */
    setError(error, total) {
        this._error = error;
        this._total = total;
        this._failed = total;
    }
    error() {
        return this._error;
    }
    setIgnored(ignored) {
        this._total += ignored;
        this._ignored = ignored;
    }
    /**
     * Add a single result to the summary.
     * @param tu tu
     * @param result result
     */
    addSingleResult(tu, result) {
        this._total++;
        if (result.success()) {
            this._success++;
        }
        else {
            this._failed++;
        }
    }
    /**
     * Merge another summary into this one.
     * @param anotherSummary anotherSummary
     */
    merge(anotherSummary) {
        if (!this._error) {
            this._error = anotherSummary._error;
        }
        this._total += anotherSummary.total();
        this._ignored += anotherSummary.ignored();
        this._success += anotherSummary.success();
        this._failed += anotherSummary.failed();
    }
    total() {
        return this._total;
    }
    ignored() {
        return this._ignored;
    }
    success() {
        return this._success;
    }
    failed() {
        return this._failed;
    }
    /**
     * Human readable version of report
     */
    content() {
        let result;
        if (this._error) {
            result = util_1.format('Auto translation from "%s" to "%s" failed: "%s", failed units: %s', this._from, this._to, this._error, this._failed);
        }
        else {
            result = util_1.format('Auto translation from "%s" to "%s", total auto translated units: %s, ignored: %s, succesful: %s, failed: %s', this._from, this._to, this._total, this._ignored, this._success, this._failed);
        }
        return result;
    }
}
exports.AutoTranslateSummaryReport = AutoTranslateSummaryReport;
//# sourceMappingURL=auto-translate-summary-report.js.map