import { format } from 'util';
/**
 * A report about a run of Google Translate over all untranslated unit.
 * * Created by martin on 29.06.2017.
 */
export class AutoTranslateSummaryReport {
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
            result = format('Auto translation from "%s" to "%s" failed: "%s", failed units: %s', this._from, this._to, this._error, this._failed);
        }
        else {
            result = format('Auto translation from "%s" to "%s", total auto translated units: %s, ignored: %s, succesful: %s, failed: %s', this._from, this._to, this._total, this._ignored, this._success, this._failed);
        }
        return result;
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXV0by10cmFuc2xhdGUtc3VtbWFyeS1yZXBvcnQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi9wcm9qZWN0cy94bGlmZm1lcmdlL3NyYy9hdXRvdHJhbnNsYXRlL2F1dG8tdHJhbnNsYXRlLXN1bW1hcnktcmVwb3J0LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUNBLE9BQU8sRUFBQyxNQUFNLEVBQUMsTUFBTSxNQUFNLENBQUM7QUFHNUI7OztHQUdHO0FBRUgsTUFBTSxPQUFPLDBCQUEwQjtJQVVyQyxZQUFZLElBQVksRUFBRSxFQUFVO1FBQ2xDLElBQUksQ0FBQyxLQUFLLEdBQUcsSUFBSSxDQUFDO1FBQ2xCLElBQUksQ0FBQyxHQUFHLEdBQUcsRUFBRSxDQUFDO1FBQ2QsSUFBSSxDQUFDLE1BQU0sR0FBRyxDQUFDLENBQUM7UUFDaEIsSUFBSSxDQUFDLFFBQVEsR0FBRyxDQUFDLENBQUM7UUFDbEIsSUFBSSxDQUFDLFFBQVEsR0FBRyxDQUFDLENBQUM7UUFDbEIsSUFBSSxDQUFDLE9BQU8sR0FBRyxDQUFDLENBQUM7SUFDbkIsQ0FBQztJQUVEOzs7O09BSUc7SUFDSSxRQUFRLENBQUMsS0FBYSxFQUFFLEtBQWE7UUFDMUMsSUFBSSxDQUFDLE1BQU0sR0FBRyxLQUFLLENBQUM7UUFDcEIsSUFBSSxDQUFDLE1BQU0sR0FBRyxLQUFLLENBQUM7UUFDcEIsSUFBSSxDQUFDLE9BQU8sR0FBRyxLQUFLLENBQUM7SUFDdkIsQ0FBQztJQUVNLEtBQUs7UUFDVixPQUFPLElBQUksQ0FBQyxNQUFNLENBQUM7SUFDckIsQ0FBQztJQUVNLFVBQVUsQ0FBQyxPQUFlO1FBQy9CLElBQUksQ0FBQyxNQUFNLElBQUksT0FBTyxDQUFDO1FBQ3ZCLElBQUksQ0FBQyxRQUFRLEdBQUcsT0FBTyxDQUFDO0lBQzFCLENBQUM7SUFFRDs7OztPQUlHO0lBQ0ksZUFBZSxDQUFDLEVBQWMsRUFBRSxNQUEyQjtRQUNoRSxJQUFJLENBQUMsTUFBTSxFQUFFLENBQUM7UUFDZCxJQUFJLE1BQU0sQ0FBQyxPQUFPLEVBQUUsRUFBRTtZQUNwQixJQUFJLENBQUMsUUFBUSxFQUFFLENBQUM7U0FDakI7YUFBTTtZQUNMLElBQUksQ0FBQyxPQUFPLEVBQUUsQ0FBQztTQUNoQjtJQUNILENBQUM7SUFFRDs7O09BR0c7SUFDSSxLQUFLLENBQUMsY0FBMEM7UUFDckQsSUFBSSxDQUFDLElBQUksQ0FBQyxNQUFNLEVBQUU7WUFDaEIsSUFBSSxDQUFDLE1BQU0sR0FBRyxjQUFjLENBQUMsTUFBTSxDQUFDO1NBQ3JDO1FBQ0QsSUFBSSxDQUFDLE1BQU0sSUFBSSxjQUFjLENBQUMsS0FBSyxFQUFFLENBQUM7UUFDdEMsSUFBSSxDQUFDLFFBQVEsSUFBSSxjQUFjLENBQUMsT0FBTyxFQUFFLENBQUM7UUFDMUMsSUFBSSxDQUFDLFFBQVEsSUFBSSxjQUFjLENBQUMsT0FBTyxFQUFFLENBQUM7UUFDMUMsSUFBSSxDQUFDLE9BQU8sSUFBSSxjQUFjLENBQUMsTUFBTSxFQUFFLENBQUM7SUFDMUMsQ0FBQztJQUVNLEtBQUs7UUFDVixPQUFPLElBQUksQ0FBQyxNQUFNLENBQUM7SUFDckIsQ0FBQztJQUVNLE9BQU87UUFDWixPQUFPLElBQUksQ0FBQyxRQUFRLENBQUM7SUFDdkIsQ0FBQztJQUVNLE9BQU87UUFDWixPQUFPLElBQUksQ0FBQyxRQUFRLENBQUM7SUFDdkIsQ0FBQztJQUVNLE1BQU07UUFDWCxPQUFPLElBQUksQ0FBQyxPQUFPLENBQUM7SUFDdEIsQ0FBQztJQUVEOztPQUVHO0lBQ0ksT0FBTztRQUNaLElBQUksTUFBTSxDQUFDO1FBQ1gsSUFBSSxJQUFJLENBQUMsTUFBTSxFQUFFO1lBQ2YsTUFBTSxHQUFHLE1BQU0sQ0FBQyxtRUFBbUUsRUFBRSxJQUFJLENBQUMsS0FBSyxFQUFFLElBQUksQ0FBQyxHQUFHLEVBQUUsSUFBSSxDQUFDLE1BQU0sRUFBRSxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUM7U0FDdkk7YUFBTTtZQUNMLE1BQU0sR0FBRyxNQUFNLENBQUMsNkdBQTZHLEVBQ3pILElBQUksQ0FBQyxLQUFLLEVBQUUsSUFBSSxDQUFDLEdBQUcsRUFBRSxJQUFJLENBQUMsTUFBTSxFQUFFLElBQUksQ0FBQyxRQUFRLEVBQUUsSUFBSSxDQUFDLFFBQVEsRUFBRSxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUM7U0FDcEY7UUFDRCxPQUFPLE1BQU0sQ0FBQztJQUNoQixDQUFDO0NBQ0YiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQge0F1dG9UcmFuc2xhdGVSZXN1bHR9IGZyb20gJy4vYXV0by10cmFuc2xhdGUtcmVzdWx0JztcclxuaW1wb3J0IHtmb3JtYXR9IGZyb20gJ3V0aWwnO1xyXG5pbXBvcnQge0lUcmFuc1VuaXR9IGZyb20gJ0BuZ3gtaTE4bnN1cHBvcnQvbmd4LWkxOG5zdXBwb3J0LWxpYic7XHJcblxyXG4vKipcclxuICogQSByZXBvcnQgYWJvdXQgYSBydW4gb2YgR29vZ2xlIFRyYW5zbGF0ZSBvdmVyIGFsbCB1bnRyYW5zbGF0ZWQgdW5pdC5cclxuICogKiBDcmVhdGVkIGJ5IG1hcnRpbiBvbiAyOS4wNi4yMDE3LlxyXG4gKi9cclxuXHJcbmV4cG9ydCBjbGFzcyBBdXRvVHJhbnNsYXRlU3VtbWFyeVJlcG9ydCB7XHJcblxyXG4gIHByaXZhdGUgX2Vycm9yOiBzdHJpbmc7XHJcbiAgcHJpdmF0ZSBfZnJvbTogc3RyaW5nO1xyXG4gIHByaXZhdGUgX3RvOiBzdHJpbmc7XHJcbiAgcHJpdmF0ZSBfdG90YWw6IG51bWJlcjtcclxuICBwcml2YXRlIF9pZ25vcmVkOiBudW1iZXI7XHJcbiAgcHJpdmF0ZSBfc3VjY2VzczogbnVtYmVyO1xyXG4gIHByaXZhdGUgX2ZhaWxlZDogbnVtYmVyO1xyXG5cclxuICBjb25zdHJ1Y3Rvcihmcm9tOiBzdHJpbmcsIHRvOiBzdHJpbmcpIHtcclxuICAgIHRoaXMuX2Zyb20gPSBmcm9tO1xyXG4gICAgdGhpcy5fdG8gPSB0bztcclxuICAgIHRoaXMuX3RvdGFsID0gMDtcclxuICAgIHRoaXMuX2lnbm9yZWQgPSAwO1xyXG4gICAgdGhpcy5fc3VjY2VzcyA9IDA7XHJcbiAgICB0aGlzLl9mYWlsZWQgPSAwO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogU2V0IGVycm9yIGlmIHRvdGFsIGNhbGwgZmFpbGVkIChlLmcuIFwiaW52YWxpZCBhcGkga2V5XCIgb3IgXCJubyBjb25uZWN0aW9uXCIgLi4uKVxyXG4gICAqIEBwYXJhbSBlcnJvciBlcnJvclxyXG4gICAqIEBwYXJhbSB0b3RhbCB0b3RhbFxyXG4gICAqL1xyXG4gIHB1YmxpYyBzZXRFcnJvcihlcnJvcjogc3RyaW5nLCB0b3RhbDogbnVtYmVyKSB7XHJcbiAgICB0aGlzLl9lcnJvciA9IGVycm9yO1xyXG4gICAgdGhpcy5fdG90YWwgPSB0b3RhbDtcclxuICAgIHRoaXMuX2ZhaWxlZCA9IHRvdGFsO1xyXG4gIH1cclxuXHJcbiAgcHVibGljIGVycm9yKCk6IHN0cmluZyB7XHJcbiAgICByZXR1cm4gdGhpcy5fZXJyb3I7XHJcbiAgfVxyXG5cclxuICBwdWJsaWMgc2V0SWdub3JlZChpZ25vcmVkOiBudW1iZXIpIHtcclxuICAgIHRoaXMuX3RvdGFsICs9IGlnbm9yZWQ7XHJcbiAgICB0aGlzLl9pZ25vcmVkID0gaWdub3JlZDtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEFkZCBhIHNpbmdsZSByZXN1bHQgdG8gdGhlIHN1bW1hcnkuXHJcbiAgICogQHBhcmFtIHR1IHR1XHJcbiAgICogQHBhcmFtIHJlc3VsdCByZXN1bHRcclxuICAgKi9cclxuICBwdWJsaWMgYWRkU2luZ2xlUmVzdWx0KHR1OiBJVHJhbnNVbml0LCByZXN1bHQ6IEF1dG9UcmFuc2xhdGVSZXN1bHQpIHtcclxuICAgIHRoaXMuX3RvdGFsKys7XHJcbiAgICBpZiAocmVzdWx0LnN1Y2Nlc3MoKSkge1xyXG4gICAgICB0aGlzLl9zdWNjZXNzKys7XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICB0aGlzLl9mYWlsZWQrKztcclxuICAgIH1cclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIE1lcmdlIGFub3RoZXIgc3VtbWFyeSBpbnRvIHRoaXMgb25lLlxyXG4gICAqIEBwYXJhbSBhbm90aGVyU3VtbWFyeSBhbm90aGVyU3VtbWFyeVxyXG4gICAqL1xyXG4gIHB1YmxpYyBtZXJnZShhbm90aGVyU3VtbWFyeTogQXV0b1RyYW5zbGF0ZVN1bW1hcnlSZXBvcnQpIHtcclxuICAgIGlmICghdGhpcy5fZXJyb3IpIHtcclxuICAgICAgdGhpcy5fZXJyb3IgPSBhbm90aGVyU3VtbWFyeS5fZXJyb3I7XHJcbiAgICB9XHJcbiAgICB0aGlzLl90b3RhbCArPSBhbm90aGVyU3VtbWFyeS50b3RhbCgpO1xyXG4gICAgdGhpcy5faWdub3JlZCArPSBhbm90aGVyU3VtbWFyeS5pZ25vcmVkKCk7XHJcbiAgICB0aGlzLl9zdWNjZXNzICs9IGFub3RoZXJTdW1tYXJ5LnN1Y2Nlc3MoKTtcclxuICAgIHRoaXMuX2ZhaWxlZCArPSBhbm90aGVyU3VtbWFyeS5mYWlsZWQoKTtcclxuICB9XHJcblxyXG4gIHB1YmxpYyB0b3RhbCgpOiBudW1iZXIge1xyXG4gICAgcmV0dXJuIHRoaXMuX3RvdGFsO1xyXG4gIH1cclxuXHJcbiAgcHVibGljIGlnbm9yZWQoKTogbnVtYmVyIHtcclxuICAgIHJldHVybiB0aGlzLl9pZ25vcmVkO1xyXG4gIH1cclxuXHJcbiAgcHVibGljIHN1Y2Nlc3MoKTogbnVtYmVyIHtcclxuICAgIHJldHVybiB0aGlzLl9zdWNjZXNzO1xyXG4gIH1cclxuXHJcbiAgcHVibGljIGZhaWxlZCgpOiBudW1iZXIge1xyXG4gICAgcmV0dXJuIHRoaXMuX2ZhaWxlZDtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEh1bWFuIHJlYWRhYmxlIHZlcnNpb24gb2YgcmVwb3J0XHJcbiAgICovXHJcbiAgcHVibGljIGNvbnRlbnQoKTogc3RyaW5nIHtcclxuICAgIGxldCByZXN1bHQ7XHJcbiAgICBpZiAodGhpcy5fZXJyb3IpIHtcclxuICAgICAgcmVzdWx0ID0gZm9ybWF0KCdBdXRvIHRyYW5zbGF0aW9uIGZyb20gXCIlc1wiIHRvIFwiJXNcIiBmYWlsZWQ6IFwiJXNcIiwgZmFpbGVkIHVuaXRzOiAlcycsIHRoaXMuX2Zyb20sIHRoaXMuX3RvLCB0aGlzLl9lcnJvciwgdGhpcy5fZmFpbGVkKTtcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIHJlc3VsdCA9IGZvcm1hdCgnQXV0byB0cmFuc2xhdGlvbiBmcm9tIFwiJXNcIiB0byBcIiVzXCIsIHRvdGFsIGF1dG8gdHJhbnNsYXRlZCB1bml0czogJXMsIGlnbm9yZWQ6ICVzLCBzdWNjZXNmdWw6ICVzLCBmYWlsZWQ6ICVzJyxcclxuICAgICAgICAgIHRoaXMuX2Zyb20sIHRoaXMuX3RvLCB0aGlzLl90b3RhbCwgdGhpcy5faWdub3JlZCwgdGhpcy5fc3VjY2VzcywgdGhpcy5fZmFpbGVkKTtcclxuICAgIH1cclxuICAgIHJldHVybiByZXN1bHQ7XHJcbiAgfVxyXG59XHJcbiJdfQ==