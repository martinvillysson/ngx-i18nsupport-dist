"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WriterToString = void 0;
const stream_1 = require("stream");
const util_1 = require("./util");
/**
 * Created by martin on 20.02.2017.
 * A helper class for testing.
 * Can be used as a WritableStream and writes everything (synchronously) into a string,
 * that can easily be read by the tests.
 */
class WriterToString extends stream_1.Writable {
    constructor() {
        super();
        this.resultString = '';
    }
    _write(chunk, encoding, callback) {
        let chunkString;
        if (util_1.isString(chunk)) {
            chunkString = chunk;
        }
        else if (chunk instanceof Buffer) {
            chunkString = chunk.toString();
        }
        else {
            chunkString = Buffer.alloc(chunk).toString(encoding);
        }
        this.resultString = this.resultString + chunkString;
        callback();
    }
    /**
     * Returns a string of everything, that was written to the stream so far.
     * @return written data
     */
    writtenData() {
        return this.resultString;
    }
}
exports.WriterToString = WriterToString;
//# sourceMappingURL=writer-to-string.js.map