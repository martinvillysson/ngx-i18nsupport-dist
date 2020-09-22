import { ParsedMessagePart, ParsedMessagePartType } from './parsed-message-part';
/**
 * Created by martin on 14.06.2017.
 * A message part consisting of an empty tag like <br/>.
 */
export class ParsedMessagePartEmptyTag extends ParsedMessagePart {
    constructor(tagname, idcounter) {
        super(ParsedMessagePartType.EMPTY_TAG);
        this._tagname = tagname;
        this._idcounter = idcounter;
    }
    asDisplayString(format) {
        if (this._idcounter === 0) {
            return '<' + this._tagname + '>';
        }
        else {
            return '<' + this._tagname + ' id="' + this._idcounter.toString() + '">';
        }
    }
    tagName() {
        return this._tagname;
    }
    idCounter() {
        return this._idcounter;
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicGFyc2VkLW1lc3NhZ2UtcGFydC1lbXB0eS10YWcuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi9wcm9qZWN0cy9uZ3gtaTE4bnN1cHBvcnQtbGliL3NyYy9pbXBsL3BhcnNlZC1tZXNzYWdlLXBhcnQtZW1wdHktdGFnLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sRUFBQyxpQkFBaUIsRUFBRSxxQkFBcUIsRUFBQyxNQUFNLHVCQUF1QixDQUFDO0FBQy9FOzs7R0FHRztBQUVILE1BQU0sT0FBTyx5QkFBMEIsU0FBUSxpQkFBaUI7SUFLNUQsWUFBWSxPQUFlLEVBQUUsU0FBaUI7UUFDMUMsS0FBSyxDQUFDLHFCQUFxQixDQUFDLFNBQVMsQ0FBQyxDQUFDO1FBQ3ZDLElBQUksQ0FBQyxRQUFRLEdBQUcsT0FBTyxDQUFDO1FBQ3hCLElBQUksQ0FBQyxVQUFVLEdBQUcsU0FBUyxDQUFDO0lBQ2hDLENBQUM7SUFFTSxlQUFlLENBQUMsTUFBZTtRQUNsQyxJQUFJLElBQUksQ0FBQyxVQUFVLEtBQUssQ0FBQyxFQUFFO1lBQ3ZCLE9BQU8sR0FBRyxHQUFHLElBQUksQ0FBQyxRQUFRLEdBQUcsR0FBRyxDQUFDO1NBQ3BDO2FBQU07WUFDSCxPQUFPLEdBQUcsR0FBRyxJQUFJLENBQUMsUUFBUSxHQUFHLE9BQU8sR0FBRyxJQUFJLENBQUMsVUFBVSxDQUFDLFFBQVEsRUFBRSxHQUFHLElBQUksQ0FBQztTQUM1RTtJQUNMLENBQUM7SUFFTSxPQUFPO1FBQ1YsT0FBTyxJQUFJLENBQUMsUUFBUSxDQUFDO0lBQ3pCLENBQUM7SUFFTSxTQUFTO1FBQ1osT0FBTyxJQUFJLENBQUMsVUFBVSxDQUFDO0lBQzNCLENBQUM7Q0FDSiIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7UGFyc2VkTWVzc2FnZVBhcnQsIFBhcnNlZE1lc3NhZ2VQYXJ0VHlwZX0gZnJvbSAnLi9wYXJzZWQtbWVzc2FnZS1wYXJ0JztcclxuLyoqXHJcbiAqIENyZWF0ZWQgYnkgbWFydGluIG9uIDE0LjA2LjIwMTcuXHJcbiAqIEEgbWVzc2FnZSBwYXJ0IGNvbnNpc3Rpbmcgb2YgYW4gZW1wdHkgdGFnIGxpa2UgPGJyLz4uXHJcbiAqL1xyXG5cclxuZXhwb3J0IGNsYXNzIFBhcnNlZE1lc3NhZ2VQYXJ0RW1wdHlUYWcgZXh0ZW5kcyBQYXJzZWRNZXNzYWdlUGFydCB7XHJcblxyXG4gICAgcHJpdmF0ZSBfdGFnbmFtZTogc3RyaW5nO1xyXG4gICAgcHJpdmF0ZSBfaWRjb3VudGVyOiBudW1iZXI7XHJcblxyXG4gICAgY29uc3RydWN0b3IodGFnbmFtZTogc3RyaW5nLCBpZGNvdW50ZXI6IG51bWJlcikge1xyXG4gICAgICAgIHN1cGVyKFBhcnNlZE1lc3NhZ2VQYXJ0VHlwZS5FTVBUWV9UQUcpO1xyXG4gICAgICAgIHRoaXMuX3RhZ25hbWUgPSB0YWduYW1lO1xyXG4gICAgICAgIHRoaXMuX2lkY291bnRlciA9IGlkY291bnRlcjtcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgYXNEaXNwbGF5U3RyaW5nKGZvcm1hdD86IHN0cmluZykge1xyXG4gICAgICAgIGlmICh0aGlzLl9pZGNvdW50ZXIgPT09IDApIHtcclxuICAgICAgICAgICAgcmV0dXJuICc8JyArIHRoaXMuX3RhZ25hbWUgKyAnPic7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgcmV0dXJuICc8JyArIHRoaXMuX3RhZ25hbWUgKyAnIGlkPVwiJyArIHRoaXMuX2lkY291bnRlci50b1N0cmluZygpICsgJ1wiPic7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyB0YWdOYW1lKCk6IHN0cmluZyB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuX3RhZ25hbWU7XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIGlkQ291bnRlcigpOiBudW1iZXIge1xyXG4gICAgICAgIHJldHVybiB0aGlzLl9pZGNvdW50ZXI7XHJcbiAgICB9XHJcbn1cclxuIl19