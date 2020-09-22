import { Writable } from 'stream';
import { isString } from './util';
/**
 * Created by martin on 20.02.2017.
 * A helper class for testing.
 * Can be used as a WritableStream and writes everything (synchronously) into a string,
 * that can easily be read by the tests.
 */
export class WriterToString extends Writable {
    constructor() {
        super();
        this.resultString = '';
    }
    _write(chunk, encoding, callback) {
        let chunkString;
        if (isString(chunk)) {
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoid3JpdGVyLXRvLXN0cmluZy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3Byb2plY3RzL3hsaWZmbWVyZ2Uvc3JjL2NvbW1vbi93cml0ZXItdG8tc3RyaW5nLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sRUFBQyxRQUFRLEVBQUMsTUFBTSxRQUFRLENBQUM7QUFDaEMsT0FBTyxFQUFDLFFBQVEsRUFBQyxNQUFNLFFBQVEsQ0FBQztBQUNoQzs7Ozs7R0FLRztBQUVILE1BQU0sT0FBTyxjQUFlLFNBQVEsUUFBUTtJQUl4QztRQUNJLEtBQUssRUFBRSxDQUFDO1FBQ1IsSUFBSSxDQUFDLFlBQVksR0FBRyxFQUFFLENBQUM7SUFDM0IsQ0FBQztJQUVNLE1BQU0sQ0FBQyxLQUFVLEVBQUUsUUFBZ0IsRUFBRSxRQUFrQjtRQUMxRCxJQUFJLFdBQVcsQ0FBQztRQUNoQixJQUFJLFFBQVEsQ0FBQyxLQUFLLENBQUMsRUFBRTtZQUNqQixXQUFXLEdBQUcsS0FBSyxDQUFDO1NBQ3ZCO2FBQU0sSUFBSSxLQUFLLFlBQVksTUFBTSxFQUFFO1lBQ2hDLFdBQVcsR0FBRyxLQUFLLENBQUMsUUFBUSxFQUFFLENBQUM7U0FDbEM7YUFBTTtZQUNILFdBQVcsR0FBRyxNQUFNLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQyxDQUFDLFFBQVEsQ0FBQyxRQUFRLENBQUMsQ0FBQztTQUN4RDtRQUNELElBQUksQ0FBQyxZQUFZLEdBQUcsSUFBSSxDQUFDLFlBQVksR0FBRyxXQUFXLENBQUM7UUFDcEQsUUFBUSxFQUFFLENBQUM7SUFDZixDQUFDO0lBRUQ7OztPQUdHO0lBQ0ksV0FBVztRQUNkLE9BQU8sSUFBSSxDQUFDLFlBQVksQ0FBQztJQUM3QixDQUFDO0NBQ0oiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQge1dyaXRhYmxlfSBmcm9tICdzdHJlYW0nO1xyXG5pbXBvcnQge2lzU3RyaW5nfSBmcm9tICcuL3V0aWwnO1xyXG4vKipcclxuICogQ3JlYXRlZCBieSBtYXJ0aW4gb24gMjAuMDIuMjAxNy5cclxuICogQSBoZWxwZXIgY2xhc3MgZm9yIHRlc3RpbmcuXHJcbiAqIENhbiBiZSB1c2VkIGFzIGEgV3JpdGFibGVTdHJlYW0gYW5kIHdyaXRlcyBldmVyeXRoaW5nIChzeW5jaHJvbm91c2x5KSBpbnRvIGEgc3RyaW5nLFxyXG4gKiB0aGF0IGNhbiBlYXNpbHkgYmUgcmVhZCBieSB0aGUgdGVzdHMuXHJcbiAqL1xyXG5cclxuZXhwb3J0IGNsYXNzIFdyaXRlclRvU3RyaW5nIGV4dGVuZHMgV3JpdGFibGUge1xyXG5cclxuICAgIHByaXZhdGUgcmVzdWx0U3RyaW5nOiBzdHJpbmc7XHJcblxyXG4gICAgY29uc3RydWN0b3IoKSB7XHJcbiAgICAgICAgc3VwZXIoKTtcclxuICAgICAgICB0aGlzLnJlc3VsdFN0cmluZyA9ICcnO1xyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyBfd3JpdGUoY2h1bms6IGFueSwgZW5jb2Rpbmc6IHN0cmluZywgY2FsbGJhY2s6IEZ1bmN0aW9uKTogdm9pZCB7XHJcbiAgICAgICAgbGV0IGNodW5rU3RyaW5nO1xyXG4gICAgICAgIGlmIChpc1N0cmluZyhjaHVuaykpIHtcclxuICAgICAgICAgICAgY2h1bmtTdHJpbmcgPSBjaHVuaztcclxuICAgICAgICB9IGVsc2UgaWYgKGNodW5rIGluc3RhbmNlb2YgQnVmZmVyKSB7XHJcbiAgICAgICAgICAgIGNodW5rU3RyaW5nID0gY2h1bmsudG9TdHJpbmcoKTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICBjaHVua1N0cmluZyA9IEJ1ZmZlci5hbGxvYyhjaHVuaykudG9TdHJpbmcoZW5jb2RpbmcpO1xyXG4gICAgICAgIH1cclxuICAgICAgICB0aGlzLnJlc3VsdFN0cmluZyA9IHRoaXMucmVzdWx0U3RyaW5nICsgY2h1bmtTdHJpbmc7XHJcbiAgICAgICAgY2FsbGJhY2soKTtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIFJldHVybnMgYSBzdHJpbmcgb2YgZXZlcnl0aGluZywgdGhhdCB3YXMgd3JpdHRlbiB0byB0aGUgc3RyZWFtIHNvIGZhci5cclxuICAgICAqIEByZXR1cm4gd3JpdHRlbiBkYXRhXHJcbiAgICAgKi9cclxuICAgIHB1YmxpYyB3cml0dGVuRGF0YSgpOiBzdHJpbmcge1xyXG4gICAgICAgIHJldHVybiB0aGlzLnJlc3VsdFN0cmluZztcclxuICAgIH1cclxufVxyXG4iXX0=