/// <reference types="node" />
import { Writable } from 'stream';
/**
 * Created by martin on 20.02.2017.
 * A helper class for testing.
 * Can be used as a WritableStream and writes everything (synchronously) into a string,
 * that can easily be read by the tests.
 */
export declare class WriterToString extends Writable {
    private resultString;
    constructor();
    _write(chunk: any, encoding: string, callback: Function): void;
    /**
     * Returns a string of everything, that was written to the stream so far.
     * @return written data
     */
    writtenData(): string;
}
