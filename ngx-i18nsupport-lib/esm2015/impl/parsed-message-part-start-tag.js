import { ParsedMessagePart, ParsedMessagePartType } from './parsed-message-part';
/**
 * Created by martin on 05.05.2017.
 * A message part consisting of an opening tag like <b> or <strange>.
 */
export class ParsedMessagePartStartTag extends ParsedMessagePart {
    constructor(tagname, idcounter) {
        super(ParsedMessagePartType.START_TAG);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicGFyc2VkLW1lc3NhZ2UtcGFydC1zdGFydC10YWcuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi9wcm9qZWN0cy9uZ3gtaTE4bnN1cHBvcnQtbGliL3NyYy9pbXBsL3BhcnNlZC1tZXNzYWdlLXBhcnQtc3RhcnQtdGFnLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sRUFBQyxpQkFBaUIsRUFBRSxxQkFBcUIsRUFBQyxNQUFNLHVCQUF1QixDQUFDO0FBQy9FOzs7R0FHRztBQUVILE1BQU0sT0FBTyx5QkFBMEIsU0FBUSxpQkFBaUI7SUFLNUQsWUFBWSxPQUFlLEVBQUUsU0FBaUI7UUFDMUMsS0FBSyxDQUFDLHFCQUFxQixDQUFDLFNBQVMsQ0FBQyxDQUFDO1FBQ3ZDLElBQUksQ0FBQyxRQUFRLEdBQUcsT0FBTyxDQUFDO1FBQ3hCLElBQUksQ0FBQyxVQUFVLEdBQUcsU0FBUyxDQUFDO0lBQ2hDLENBQUM7SUFFTSxlQUFlLENBQUMsTUFBZTtRQUNsQyxJQUFJLElBQUksQ0FBQyxVQUFVLEtBQUssQ0FBQyxFQUFFO1lBQ3ZCLE9BQU8sR0FBRyxHQUFHLElBQUksQ0FBQyxRQUFRLEdBQUcsR0FBRyxDQUFDO1NBQ3BDO2FBQU07WUFDSCxPQUFPLEdBQUcsR0FBRyxJQUFJLENBQUMsUUFBUSxHQUFHLE9BQU8sR0FBRyxJQUFJLENBQUMsVUFBVSxDQUFDLFFBQVEsRUFBRSxHQUFHLElBQUksQ0FBQztTQUM1RTtJQUNMLENBQUM7SUFFTSxPQUFPO1FBQ1YsT0FBTyxJQUFJLENBQUMsUUFBUSxDQUFDO0lBQ3pCLENBQUM7SUFFTSxTQUFTO1FBQ1osT0FBTyxJQUFJLENBQUMsVUFBVSxDQUFDO0lBQzNCLENBQUM7Q0FDSiIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7UGFyc2VkTWVzc2FnZVBhcnQsIFBhcnNlZE1lc3NhZ2VQYXJ0VHlwZX0gZnJvbSAnLi9wYXJzZWQtbWVzc2FnZS1wYXJ0JztcclxuLyoqXHJcbiAqIENyZWF0ZWQgYnkgbWFydGluIG9uIDA1LjA1LjIwMTcuXHJcbiAqIEEgbWVzc2FnZSBwYXJ0IGNvbnNpc3Rpbmcgb2YgYW4gb3BlbmluZyB0YWcgbGlrZSA8Yj4gb3IgPHN0cmFuZ2U+LlxyXG4gKi9cclxuXHJcbmV4cG9ydCBjbGFzcyBQYXJzZWRNZXNzYWdlUGFydFN0YXJ0VGFnIGV4dGVuZHMgUGFyc2VkTWVzc2FnZVBhcnQge1xyXG5cclxuICAgIHByaXZhdGUgX3RhZ25hbWU6IHN0cmluZztcclxuICAgIHByaXZhdGUgX2lkY291bnRlcjogbnVtYmVyO1xyXG5cclxuICAgIGNvbnN0cnVjdG9yKHRhZ25hbWU6IHN0cmluZywgaWRjb3VudGVyOiBudW1iZXIpIHtcclxuICAgICAgICBzdXBlcihQYXJzZWRNZXNzYWdlUGFydFR5cGUuU1RBUlRfVEFHKTtcclxuICAgICAgICB0aGlzLl90YWduYW1lID0gdGFnbmFtZTtcclxuICAgICAgICB0aGlzLl9pZGNvdW50ZXIgPSBpZGNvdW50ZXI7XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIGFzRGlzcGxheVN0cmluZyhmb3JtYXQ/OiBzdHJpbmcpIHtcclxuICAgICAgICBpZiAodGhpcy5faWRjb3VudGVyID09PSAwKSB7XHJcbiAgICAgICAgICAgIHJldHVybiAnPCcgKyB0aGlzLl90YWduYW1lICsgJz4nO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIHJldHVybiAnPCcgKyB0aGlzLl90YWduYW1lICsgJyBpZD1cIicgKyB0aGlzLl9pZGNvdW50ZXIudG9TdHJpbmcoKSArICdcIj4nO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgdGFnTmFtZSgpOiBzdHJpbmcge1xyXG4gICAgICAgIHJldHVybiB0aGlzLl90YWduYW1lO1xyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyBpZENvdW50ZXIoKTogbnVtYmVyIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5faWRjb3VudGVyO1xyXG4gICAgfVxyXG59XHJcbiJdfQ==