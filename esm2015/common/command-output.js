/**
 * Created by martin on 17.02.2017.
 * Very simple class to control the output of a command.
 * Output can be errors, warnings, infos and debug-Outputs.
 * The output can be controlled via 2 flags, quiet and verbose.
 * If quit is enabled only error messages are shown.
 * If verbose is enabled, everything is shown.
 * If both are not enabled (the default) errors, warnings and infos are shown.
 * If not are enabled (strange), we assumed the default.
 */
import chalk from 'chalk';
import { format } from 'util';
var LogLevel;
(function (LogLevel) {
    LogLevel[LogLevel["ERROR"] = 0] = "ERROR";
    LogLevel[LogLevel["WARN"] = 1] = "WARN";
    LogLevel[LogLevel["INFO"] = 2] = "INFO";
    LogLevel[LogLevel["DEBUG"] = 3] = "DEBUG";
})(LogLevel || (LogLevel = {}));
export class CommandOutput {
    constructor(stdout) {
        this._quiet = false;
        this._verbose = false;
        if (stdout) {
            this.outputStream = stdout;
        }
        else {
            this.outputStream = process.stdout;
        }
    }
    setVerbose() {
        this._verbose = true;
    }
    setQuiet() {
        this._quiet = true;
    }
    /**
     * Test, wether verbose is enabled.
     * @return wether verbose is enabled.
     */
    verbose() {
        return this._verbose;
    }
    /**
     * Test, wether quiet is enabled.
     * @return wether quiet is enabled.
     */
    quiet() {
        return this._quiet;
    }
    error(msg, ...params) {
        this.log(LogLevel.ERROR, msg, params);
    }
    warn(msg, ...params) {
        this.log(LogLevel.WARN, msg, params);
    }
    info(msg, ...params) {
        this.log(LogLevel.INFO, msg, params);
    }
    debug(msg, ...params) {
        this.log(LogLevel.DEBUG, msg, params);
    }
    log(level, msg, params) {
        if (!this.isOutputEnabled(level)) {
            return;
        }
        let coloredMessage;
        switch (level) {
            case LogLevel.ERROR:
                coloredMessage = chalk.red('ERROR: ' + msg);
                break;
            case LogLevel.WARN:
                coloredMessage = chalk.magenta('WARNING: ' + msg);
                break;
            default:
                coloredMessage = chalk.gray('* ' + msg);
                break;
        }
        const outMsg = format(coloredMessage, ...params);
        this.outputStream.write(outMsg + '\n');
    }
    isOutputEnabled(level) {
        let quietEnabled, verboseEnabled;
        if (this._quiet && this._verbose) {
            quietEnabled = false;
            verboseEnabled = false;
        }
        else {
            quietEnabled = this._quiet;
            verboseEnabled = this._verbose;
        }
        switch (level) {
            case LogLevel.ERROR:
                return true; // always output errors
            case LogLevel.WARN:
                return (!quietEnabled);
            case LogLevel.INFO:
                return (verboseEnabled && !quietEnabled);
            case LogLevel.DEBUG:
                return verboseEnabled;
            default:
                return true;
        }
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29tbWFuZC1vdXRwdXQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi9wcm9qZWN0cy94bGlmZm1lcmdlL3NyYy9jb21tb24vY29tbWFuZC1vdXRwdXQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7Ozs7OztHQVNHO0FBRUgsT0FBTyxLQUFLLE1BQU0sT0FBTyxDQUFDO0FBRTFCLE9BQU8sRUFBQyxNQUFNLEVBQUMsTUFBTSxNQUFNLENBQUM7QUFFNUIsSUFBSyxRQUtKO0FBTEQsV0FBSyxRQUFRO0lBQ1QseUNBQU8sQ0FBQTtJQUNQLHVDQUFNLENBQUE7SUFDTix1Q0FBTSxDQUFBO0lBQ04seUNBQU8sQ0FBQTtBQUNYLENBQUMsRUFMSSxRQUFRLEtBQVIsUUFBUSxRQUtaO0FBRUQsTUFBTSxPQUFPLGFBQWE7SUFjdEIsWUFBWSxNQUF1QjtRQUMvQixJQUFJLENBQUMsTUFBTSxHQUFHLEtBQUssQ0FBQztRQUNwQixJQUFJLENBQUMsUUFBUSxHQUFHLEtBQUssQ0FBQztRQUN0QixJQUFJLE1BQU0sRUFBRTtZQUNSLElBQUksQ0FBQyxZQUFZLEdBQUcsTUFBTSxDQUFDO1NBQzlCO2FBQU07WUFDSCxJQUFJLENBQUMsWUFBWSxHQUFHLE9BQU8sQ0FBQyxNQUFNLENBQUM7U0FDdEM7SUFDTCxDQUFDO0lBRU0sVUFBVTtRQUNiLElBQUksQ0FBQyxRQUFRLEdBQUcsSUFBSSxDQUFDO0lBQ3pCLENBQUM7SUFFTSxRQUFRO1FBQ1gsSUFBSSxDQUFDLE1BQU0sR0FBRyxJQUFJLENBQUM7SUFDdkIsQ0FBQztJQUVEOzs7T0FHRztJQUNJLE9BQU87UUFDVixPQUFPLElBQUksQ0FBQyxRQUFRLENBQUM7SUFDekIsQ0FBQztJQUVEOzs7T0FHRztJQUNJLEtBQUs7UUFDUixPQUFPLElBQUksQ0FBQyxNQUFNLENBQUM7SUFDdkIsQ0FBQztJQUVNLEtBQUssQ0FBQyxHQUFHLEVBQUUsR0FBRyxNQUFhO1FBQzlCLElBQUksQ0FBQyxHQUFHLENBQUMsUUFBUSxDQUFDLEtBQUssRUFBRSxHQUFHLEVBQUUsTUFBTSxDQUFDLENBQUM7SUFDMUMsQ0FBQztJQUVNLElBQUksQ0FBQyxHQUFHLEVBQUUsR0FBRyxNQUFhO1FBQzdCLElBQUksQ0FBQyxHQUFHLENBQUMsUUFBUSxDQUFDLElBQUksRUFBRSxHQUFHLEVBQUUsTUFBTSxDQUFDLENBQUM7SUFDekMsQ0FBQztJQUVNLElBQUksQ0FBQyxHQUFHLEVBQUUsR0FBRyxNQUFhO1FBQzdCLElBQUksQ0FBQyxHQUFHLENBQUMsUUFBUSxDQUFDLElBQUksRUFBRSxHQUFHLEVBQUUsTUFBTSxDQUFDLENBQUM7SUFDekMsQ0FBQztJQUVNLEtBQUssQ0FBQyxHQUFHLEVBQUUsR0FBRyxNQUFhO1FBQzlCLElBQUksQ0FBQyxHQUFHLENBQUMsUUFBUSxDQUFDLEtBQUssRUFBRSxHQUFHLEVBQUUsTUFBTSxDQUFDLENBQUM7SUFDMUMsQ0FBQztJQUVPLEdBQUcsQ0FBQyxLQUFlLEVBQUUsR0FBRyxFQUFFLE1BQWE7UUFDM0MsSUFBSSxDQUFDLElBQUksQ0FBQyxlQUFlLENBQUMsS0FBSyxDQUFDLEVBQUU7WUFDOUIsT0FBTztTQUNWO1FBQ0QsSUFBSSxjQUFjLENBQUM7UUFDbkIsUUFBUSxLQUFLLEVBQUU7WUFDWCxLQUFLLFFBQVEsQ0FBQyxLQUFLO2dCQUNmLGNBQWMsR0FBRyxLQUFLLENBQUMsR0FBRyxDQUFDLFNBQVMsR0FBRyxHQUFHLENBQUMsQ0FBQztnQkFDNUMsTUFBTTtZQUNWLEtBQUssUUFBUSxDQUFDLElBQUk7Z0JBQ2QsY0FBYyxHQUFHLEtBQUssQ0FBQyxPQUFPLENBQUMsV0FBVyxHQUFHLEdBQUcsQ0FBQyxDQUFDO2dCQUNsRCxNQUFNO1lBQ1Y7Z0JBQ0ksY0FBYyxHQUFHLEtBQUssQ0FBQyxJQUFJLENBQUMsSUFBSSxHQUFHLEdBQUcsQ0FBQyxDQUFDO2dCQUN4QyxNQUFNO1NBQ2I7UUFDRCxNQUFNLE1BQU0sR0FBRyxNQUFNLENBQUMsY0FBYyxFQUFFLEdBQUcsTUFBTSxDQUFDLENBQUM7UUFDakQsSUFBSSxDQUFDLFlBQVksQ0FBQyxLQUFLLENBQUMsTUFBTSxHQUFHLElBQUksQ0FBQyxDQUFDO0lBQzNDLENBQUM7SUFFTyxlQUFlLENBQUMsS0FBZTtRQUNuQyxJQUFJLFlBQVksRUFBRSxjQUF1QixDQUFDO1FBQzFDLElBQUksSUFBSSxDQUFDLE1BQU0sSUFBSSxJQUFJLENBQUMsUUFBUSxFQUFFO1lBQzlCLFlBQVksR0FBRyxLQUFLLENBQUM7WUFDckIsY0FBYyxHQUFHLEtBQUssQ0FBQztTQUMxQjthQUFNO1lBQ0gsWUFBWSxHQUFHLElBQUksQ0FBQyxNQUFNLENBQUM7WUFDM0IsY0FBYyxHQUFHLElBQUksQ0FBQyxRQUFRLENBQUM7U0FDbEM7UUFDRCxRQUFRLEtBQUssRUFBRTtZQUNYLEtBQUssUUFBUSxDQUFDLEtBQUs7Z0JBQ2YsT0FBTyxJQUFJLENBQUMsQ0FBSSx1QkFBdUI7WUFDM0MsS0FBSyxRQUFRLENBQUMsSUFBSTtnQkFDZCxPQUFPLENBQUMsQ0FBQyxZQUFZLENBQUMsQ0FBQztZQUMzQixLQUFLLFFBQVEsQ0FBQyxJQUFJO2dCQUNkLE9BQU8sQ0FBQyxjQUFjLElBQUksQ0FBQyxZQUFZLENBQUMsQ0FBQztZQUM3QyxLQUFLLFFBQVEsQ0FBQyxLQUFLO2dCQUNmLE9BQU8sY0FBYyxDQUFDO1lBQzFCO2dCQUNJLE9BQU8sSUFBSSxDQUFDO1NBQ25CO0lBQ0wsQ0FBQztDQUNKIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXHJcbiAqIENyZWF0ZWQgYnkgbWFydGluIG9uIDE3LjAyLjIwMTcuXHJcbiAqIFZlcnkgc2ltcGxlIGNsYXNzIHRvIGNvbnRyb2wgdGhlIG91dHB1dCBvZiBhIGNvbW1hbmQuXHJcbiAqIE91dHB1dCBjYW4gYmUgZXJyb3JzLCB3YXJuaW5ncywgaW5mb3MgYW5kIGRlYnVnLU91dHB1dHMuXHJcbiAqIFRoZSBvdXRwdXQgY2FuIGJlIGNvbnRyb2xsZWQgdmlhIDIgZmxhZ3MsIHF1aWV0IGFuZCB2ZXJib3NlLlxyXG4gKiBJZiBxdWl0IGlzIGVuYWJsZWQgb25seSBlcnJvciBtZXNzYWdlcyBhcmUgc2hvd24uXHJcbiAqIElmIHZlcmJvc2UgaXMgZW5hYmxlZCwgZXZlcnl0aGluZyBpcyBzaG93bi5cclxuICogSWYgYm90aCBhcmUgbm90IGVuYWJsZWQgKHRoZSBkZWZhdWx0KSBlcnJvcnMsIHdhcm5pbmdzIGFuZCBpbmZvcyBhcmUgc2hvd24uXHJcbiAqIElmIG5vdCBhcmUgZW5hYmxlZCAoc3RyYW5nZSksIHdlIGFzc3VtZWQgdGhlIGRlZmF1bHQuXHJcbiAqL1xyXG5cclxuaW1wb3J0IGNoYWxrIGZyb20gJ2NoYWxrJztcclxuaW1wb3J0IFdyaXRhYmxlU3RyZWFtID0gTm9kZUpTLldyaXRhYmxlU3RyZWFtO1xyXG5pbXBvcnQge2Zvcm1hdH0gZnJvbSAndXRpbCc7XHJcblxyXG5lbnVtIExvZ0xldmVsIHtcclxuICAgICdFUlJPUicsXHJcbiAgICAnV0FSTicsXHJcbiAgICAnSU5GTycsXHJcbiAgICAnREVCVUcnXHJcbn1cclxuXHJcbmV4cG9ydCBjbGFzcyBDb21tYW5kT3V0cHV0IHtcclxuXHJcbiAgICAvKipcclxuICAgICAqIHZlcmJvc2UgZW5hYmxlcyBvdXRwdXQgb2YgZXZlcnl0aGluZy5cclxuICAgICAqL1xyXG4gICAgcHVibGljIF92ZXJib3NlOiBib29sZWFuO1xyXG5cclxuICAgIC8qKlxyXG4gICAgICogcXVpZXQgZGlzYWJsZXMgb3V0cHV0IG9mIGV2ZXJ5dGhpbmcgYnV0IGVycm9ycy5cclxuICAgICAqL1xyXG4gICAgcHVibGljIF9xdWlldDogYm9vbGVhbjtcclxuXHJcbiAgICBwcml2YXRlIG91dHB1dFN0cmVhbTogV3JpdGFibGVTdHJlYW07XHJcblxyXG4gICAgY29uc3RydWN0b3Ioc3Rkb3V0PzogV3JpdGFibGVTdHJlYW0pIHtcclxuICAgICAgICB0aGlzLl9xdWlldCA9IGZhbHNlO1xyXG4gICAgICAgIHRoaXMuX3ZlcmJvc2UgPSBmYWxzZTtcclxuICAgICAgICBpZiAoc3Rkb3V0KSB7XHJcbiAgICAgICAgICAgIHRoaXMub3V0cHV0U3RyZWFtID0gc3Rkb3V0O1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIHRoaXMub3V0cHV0U3RyZWFtID0gcHJvY2Vzcy5zdGRvdXQ7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyBzZXRWZXJib3NlKCkge1xyXG4gICAgICAgIHRoaXMuX3ZlcmJvc2UgPSB0cnVlO1xyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyBzZXRRdWlldCgpIHtcclxuICAgICAgICB0aGlzLl9xdWlldCA9IHRydWU7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBUZXN0LCB3ZXRoZXIgdmVyYm9zZSBpcyBlbmFibGVkLlxyXG4gICAgICogQHJldHVybiB3ZXRoZXIgdmVyYm9zZSBpcyBlbmFibGVkLlxyXG4gICAgICovXHJcbiAgICBwdWJsaWMgdmVyYm9zZSgpOiBib29sZWFuIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5fdmVyYm9zZTtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIFRlc3QsIHdldGhlciBxdWlldCBpcyBlbmFibGVkLlxyXG4gICAgICogQHJldHVybiB3ZXRoZXIgcXVpZXQgaXMgZW5hYmxlZC5cclxuICAgICAqL1xyXG4gICAgcHVibGljIHF1aWV0KCk6IGJvb2xlYW4ge1xyXG4gICAgICAgIHJldHVybiB0aGlzLl9xdWlldDtcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgZXJyb3IobXNnLCAuLi5wYXJhbXM6IGFueVtdKSB7XHJcbiAgICAgICAgdGhpcy5sb2coTG9nTGV2ZWwuRVJST1IsIG1zZywgcGFyYW1zKTtcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgd2Fybihtc2csIC4uLnBhcmFtczogYW55W10pIHtcclxuICAgICAgICB0aGlzLmxvZyhMb2dMZXZlbC5XQVJOLCBtc2csIHBhcmFtcyk7XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIGluZm8obXNnLCAuLi5wYXJhbXM6IGFueVtdKSB7XHJcbiAgICAgICAgdGhpcy5sb2coTG9nTGV2ZWwuSU5GTywgbXNnLCBwYXJhbXMpO1xyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyBkZWJ1Zyhtc2csIC4uLnBhcmFtczogYW55W10pIHtcclxuICAgICAgICB0aGlzLmxvZyhMb2dMZXZlbC5ERUJVRywgbXNnLCBwYXJhbXMpO1xyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgbG9nKGxldmVsOiBMb2dMZXZlbCwgbXNnLCBwYXJhbXM6IGFueVtdKSB7XHJcbiAgICAgICAgaWYgKCF0aGlzLmlzT3V0cHV0RW5hYmxlZChsZXZlbCkpIHtcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuICAgICAgICBsZXQgY29sb3JlZE1lc3NhZ2U7XHJcbiAgICAgICAgc3dpdGNoIChsZXZlbCkge1xyXG4gICAgICAgICAgICBjYXNlIExvZ0xldmVsLkVSUk9SOlxyXG4gICAgICAgICAgICAgICAgY29sb3JlZE1lc3NhZ2UgPSBjaGFsay5yZWQoJ0VSUk9SOiAnICsgbXNnKTtcclxuICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICBjYXNlIExvZ0xldmVsLldBUk46XHJcbiAgICAgICAgICAgICAgICBjb2xvcmVkTWVzc2FnZSA9IGNoYWxrLm1hZ2VudGEoJ1dBUk5JTkc6ICcgKyBtc2cpO1xyXG4gICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgIGRlZmF1bHQ6XHJcbiAgICAgICAgICAgICAgICBjb2xvcmVkTWVzc2FnZSA9IGNoYWxrLmdyYXkoJyogJyArIG1zZyk7XHJcbiAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICB9XHJcbiAgICAgICAgY29uc3Qgb3V0TXNnID0gZm9ybWF0KGNvbG9yZWRNZXNzYWdlLCAuLi5wYXJhbXMpO1xyXG4gICAgICAgIHRoaXMub3V0cHV0U3RyZWFtLndyaXRlKG91dE1zZyArICdcXG4nKTtcclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIGlzT3V0cHV0RW5hYmxlZChsZXZlbDogTG9nTGV2ZWwpOiBib29sZWFuIHtcclxuICAgICAgICBsZXQgcXVpZXRFbmFibGVkLCB2ZXJib3NlRW5hYmxlZDogYm9vbGVhbjtcclxuICAgICAgICBpZiAodGhpcy5fcXVpZXQgJiYgdGhpcy5fdmVyYm9zZSkge1xyXG4gICAgICAgICAgICBxdWlldEVuYWJsZWQgPSBmYWxzZTtcclxuICAgICAgICAgICAgdmVyYm9zZUVuYWJsZWQgPSBmYWxzZTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICBxdWlldEVuYWJsZWQgPSB0aGlzLl9xdWlldDtcclxuICAgICAgICAgICAgdmVyYm9zZUVuYWJsZWQgPSB0aGlzLl92ZXJib3NlO1xyXG4gICAgICAgIH1cclxuICAgICAgICBzd2l0Y2ggKGxldmVsKSB7XHJcbiAgICAgICAgICAgIGNhc2UgTG9nTGV2ZWwuRVJST1I6XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZTsgICAgLy8gYWx3YXlzIG91dHB1dCBlcnJvcnNcclxuICAgICAgICAgICAgY2FzZSBMb2dMZXZlbC5XQVJOOlxyXG4gICAgICAgICAgICAgICAgcmV0dXJuICghcXVpZXRFbmFibGVkKTtcclxuICAgICAgICAgICAgY2FzZSBMb2dMZXZlbC5JTkZPOlxyXG4gICAgICAgICAgICAgICAgcmV0dXJuICh2ZXJib3NlRW5hYmxlZCAmJiAhcXVpZXRFbmFibGVkKTtcclxuICAgICAgICAgICAgY2FzZSBMb2dMZXZlbC5ERUJVRzpcclxuICAgICAgICAgICAgICAgIHJldHVybiB2ZXJib3NlRW5hYmxlZDtcclxuICAgICAgICAgICAgZGVmYXVsdDpcclxuICAgICAgICAgICAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxufVxyXG4iXX0=