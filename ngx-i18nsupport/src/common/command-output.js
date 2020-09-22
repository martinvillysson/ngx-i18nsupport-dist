"use strict";
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.CommandOutput = void 0;
const chalk_1 = require("chalk");
const util_1 = require("util");
var LogLevel;
(function (LogLevel) {
    LogLevel[LogLevel["ERROR"] = 0] = "ERROR";
    LogLevel[LogLevel["WARN"] = 1] = "WARN";
    LogLevel[LogLevel["INFO"] = 2] = "INFO";
    LogLevel[LogLevel["DEBUG"] = 3] = "DEBUG";
})(LogLevel || (LogLevel = {}));
class CommandOutput {
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
                coloredMessage = chalk_1.default.red('ERROR: ' + msg);
                break;
            case LogLevel.WARN:
                coloredMessage = chalk_1.default.magenta('WARNING: ' + msg);
                break;
            default:
                coloredMessage = chalk_1.default.gray('* ' + msg);
                break;
        }
        const outMsg = util_1.format(coloredMessage, ...params);
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
exports.CommandOutput = CommandOutput;
//# sourceMappingURL=command-output.js.map