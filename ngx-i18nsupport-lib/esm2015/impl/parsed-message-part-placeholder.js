import { ParsedMessagePart, ParsedMessagePartType } from './parsed-message-part';
import { NORMALIZATION_FORMAT_NGXTRANSLATE } from '../api/constants';
/**
 * Created by martin on 05.05.2017.
 * A message part consisting of a placeholder.
 * Placeholders are numbered from 0 to n.
 */
export class ParsedMessagePartPlaceholder extends ParsedMessagePart {
    constructor(index, disp) {
        super(ParsedMessagePartType.PLACEHOLDER);
        this._index = index;
        this._disp = disp;
    }
    asDisplayString(format) {
        if (format === NORMALIZATION_FORMAT_NGXTRANSLATE) {
            return '{{' + this._index + '}}';
        }
        return '{{' + this._index + '}}';
    }
    index() {
        return this._index;
    }
    disp() {
        return this._disp;
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicGFyc2VkLW1lc3NhZ2UtcGFydC1wbGFjZWhvbGRlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3Byb2plY3RzL25neC1pMThuc3VwcG9ydC1saWIvc3JjL2ltcGwvcGFyc2VkLW1lc3NhZ2UtcGFydC1wbGFjZWhvbGRlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLEVBQUMsaUJBQWlCLEVBQUUscUJBQXFCLEVBQUMsTUFBTSx1QkFBdUIsQ0FBQztBQUMvRSxPQUFPLEVBQUMsaUNBQWlDLEVBQUMsTUFBTSxrQkFBa0IsQ0FBQztBQUNuRTs7OztHQUlHO0FBRUgsTUFBTSxPQUFPLDRCQUE2QixTQUFRLGlCQUFpQjtJQU8vRCxZQUFZLEtBQWEsRUFBRSxJQUFZO1FBQ25DLEtBQUssQ0FBQyxxQkFBcUIsQ0FBQyxXQUFXLENBQUMsQ0FBQztRQUN6QyxJQUFJLENBQUMsTUFBTSxHQUFHLEtBQUssQ0FBQztRQUNwQixJQUFJLENBQUMsS0FBSyxHQUFHLElBQUksQ0FBQztJQUN0QixDQUFDO0lBRU0sZUFBZSxDQUFDLE1BQWU7UUFDbEMsSUFBSSxNQUFNLEtBQUssaUNBQWlDLEVBQUU7WUFDOUMsT0FBTyxJQUFJLEdBQUcsSUFBSSxDQUFDLE1BQU0sR0FBRyxJQUFJLENBQUM7U0FDcEM7UUFDRCxPQUFPLElBQUksR0FBRyxJQUFJLENBQUMsTUFBTSxHQUFHLElBQUksQ0FBQztJQUNyQyxDQUFDO0lBQ00sS0FBSztRQUNSLE9BQU8sSUFBSSxDQUFDLE1BQU0sQ0FBQztJQUN2QixDQUFDO0lBRU0sSUFBSTtRQUNQLE9BQU8sSUFBSSxDQUFDLEtBQUssQ0FBQztJQUN0QixDQUFDO0NBQ0oiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQge1BhcnNlZE1lc3NhZ2VQYXJ0LCBQYXJzZWRNZXNzYWdlUGFydFR5cGV9IGZyb20gJy4vcGFyc2VkLW1lc3NhZ2UtcGFydCc7XHJcbmltcG9ydCB7Tk9STUFMSVpBVElPTl9GT1JNQVRfTkdYVFJBTlNMQVRFfSBmcm9tICcuLi9hcGkvY29uc3RhbnRzJztcclxuLyoqXHJcbiAqIENyZWF0ZWQgYnkgbWFydGluIG9uIDA1LjA1LjIwMTcuXHJcbiAqIEEgbWVzc2FnZSBwYXJ0IGNvbnNpc3Rpbmcgb2YgYSBwbGFjZWhvbGRlci5cclxuICogUGxhY2Vob2xkZXJzIGFyZSBudW1iZXJlZCBmcm9tIDAgdG8gbi5cclxuICovXHJcblxyXG5leHBvcnQgY2xhc3MgUGFyc2VkTWVzc2FnZVBhcnRQbGFjZWhvbGRlciBleHRlbmRzIFBhcnNlZE1lc3NhZ2VQYXJ0IHtcclxuXHJcbiAgICAvLyBpbmRleCAwIC4uIG5cclxuICAgIHByaXZhdGUgX2luZGV4OiBudW1iZXI7XHJcbiAgICAvLyBvcHRpb25hbCBkaXNwLUF0dHJpYnV0ZSB2YWx1ZSwgY29udGFpbnMgdGhlIG9yaWdpbmFsIGV4cHJlc3Npb24uXHJcbiAgICBwcml2YXRlIF9kaXNwPzogc3RyaW5nO1xyXG5cclxuICAgIGNvbnN0cnVjdG9yKGluZGV4OiBudW1iZXIsIGRpc3A6IHN0cmluZykge1xyXG4gICAgICAgIHN1cGVyKFBhcnNlZE1lc3NhZ2VQYXJ0VHlwZS5QTEFDRUhPTERFUik7XHJcbiAgICAgICAgdGhpcy5faW5kZXggPSBpbmRleDtcclxuICAgICAgICB0aGlzLl9kaXNwID0gZGlzcDtcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgYXNEaXNwbGF5U3RyaW5nKGZvcm1hdD86IHN0cmluZykge1xyXG4gICAgICAgIGlmIChmb3JtYXQgPT09IE5PUk1BTElaQVRJT05fRk9STUFUX05HWFRSQU5TTEFURSkge1xyXG4gICAgICAgICAgICByZXR1cm4gJ3t7JyArIHRoaXMuX2luZGV4ICsgJ319JztcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuICd7eycgKyB0aGlzLl9pbmRleCArICd9fSc7XHJcbiAgICB9XHJcbiAgICBwdWJsaWMgaW5kZXgoKTogbnVtYmVyIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5faW5kZXg7XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIGRpc3AoKTogc3RyaW5nIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5fZGlzcDtcclxuICAgIH1cclxufVxyXG4iXX0=