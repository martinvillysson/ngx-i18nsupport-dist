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
/// <reference types="node" />
import WritableStream = NodeJS.WritableStream;
export declare class CommandOutput {
    /**
     * verbose enables output of everything.
     */
    _verbose: boolean;
    /**
     * quiet disables output of everything but errors.
     */
    _quiet: boolean;
    private outputStream;
    constructor(stdout?: WritableStream);
    setVerbose(): void;
    setQuiet(): void;
    /**
     * Test, wether verbose is enabled.
     * @return wether verbose is enabled.
     */
    verbose(): boolean;
    /**
     * Test, wether quiet is enabled.
     * @return wether quiet is enabled.
     */
    quiet(): boolean;
    error(msg: any, ...params: any[]): void;
    warn(msg: any, ...params: any[]): void;
    info(msg: any, ...params: any[]): void;
    debug(msg: any, ...params: any[]): void;
    private log;
    private isOutputEnabled;
}
