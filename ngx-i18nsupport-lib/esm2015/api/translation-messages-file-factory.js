import { XliffFile } from '../impl/xliff-file';
import { XmbFile } from '../impl/xmb-file';
import { format } from 'util';
import { Xliff2File } from '../impl/xliff2-file';
import { FORMAT_XLIFF12, FORMAT_XLIFF20, FORMAT_XMB, FORMAT_XTB } from './constants';
import { XtbFile } from '../impl/xtb-file';
/**
 * Helper class to read translation files depending on format.
 * This is part of the public api
 */
export class TranslationMessagesFileFactory {
    /**
     * Read file function, result depends on format, either XliffFile or XmbFile.
     * @param i18nFormat currently 'xlf' or 'xlf2' or 'xmb' or 'xtb' are supported
     * @param xmlContent the file content
     * @param path the path of the file (only used to remember it)
     * @param encoding utf-8, ... used to parse XML.
     * This is read from the file, but if you know it before, you can avoid reading the file twice.
     * @param optionalMaster in case of xmb the master file, that contains the original texts.
     * (this is used to support state infos, that are based on comparing original with translated version)
     * Ignored for other formats.
     * @return either XliffFile or XmbFile
     */
    static fromFileContent(i18nFormat, xmlContent, path, encoding, optionalMaster) {
        return new TranslationMessagesFileFactory().createFileFromFileContent(i18nFormat, xmlContent, path, encoding, optionalMaster);
    }
    /**
     * Read file function for any file with unknown format.
     * This functions tries to guess the format based on the filename and the content of the file.
     * Result depends on detected format, either XliffFile or XmbFile.
     * @param xmlContent the file content
     * @param path the path of the file (only used to remember it)
     * @param encoding utf-8, ... used to parse XML.
     * This is read from the file, but if you know it before, you can avoid reading the file twice.
     * @param optionalMaster in case of xmb the master file, that contains the original texts.
     * (this is used to support state infos, that are based on comparing original with translated version)
     * Ignored for other formats.
     * @return either XliffFile or XmbFile
     */
    static fromUnknownFormatFileContent(xmlContent, path, encoding, optionalMaster) {
        return new TranslationMessagesFileFactory().createFileFromUnknownFormatFileContent(xmlContent, path, encoding, optionalMaster);
    }
    /**
     * Read file function, result depends on format, either XliffFile or XmbFile.
     * @param i18nFormat currently 'xlf' or 'xlf2' or 'xmb' or 'xtb' are supported
     * @param xmlContent the file content
     * @param path the path of the file (only used to remember it)
     * @param encoding utf-8, ... used to parse XML.
     * This is read from the file, but if you know it before, you can avoid reading the file twice.
     * @param optionalMaster in case of xmb the master file, that contains the original texts.
     * (this is used to support state infos, that are based on comparing original with translated version)
     * Ignored for other formats.
     * @return either XliffFile or XmbFile
     */
    createFileFromFileContent(i18nFormat, xmlContent, path, encoding, optionalMaster) {
        if (i18nFormat === FORMAT_XLIFF12) {
            return new XliffFile(xmlContent, path, encoding);
        }
        if (i18nFormat === FORMAT_XLIFF20) {
            return new Xliff2File(xmlContent, path, encoding);
        }
        if (i18nFormat === FORMAT_XMB) {
            return new XmbFile(this, xmlContent, path, encoding);
        }
        if (i18nFormat === FORMAT_XTB) {
            return new XtbFile(this, xmlContent, path, encoding, optionalMaster);
        }
        throw new Error(format('oops, unsupported format "%s"', i18nFormat));
    }
    /**
     * Read file function for any file with unknown format.
     * This functions tries to guess the format based on the filename and the content of the file.
     * Result depends on detected format, either XliffFile or XmbFile.
     * @param xmlContent the file content
     * @param path the path of the file (only used to remember it)
     * @param encoding utf-8, ... used to parse XML.
     * This is read from the file, but if you know it before, you can avoid reading the file twice.
     * @param optionalMaster in case of xmb the master file, that contains the original texts.
     * (this is used to support state infos, that are based on comparing original with translated version)
     * Ignored for other formats.
     * @return either XliffFile or XmbFile
     */
    createFileFromUnknownFormatFileContent(xmlContent, path, encoding, optionalMaster) {
        let formatCandidates = [FORMAT_XLIFF12, FORMAT_XLIFF20, FORMAT_XMB, FORMAT_XTB];
        if (path && path.endsWith('xmb')) {
            formatCandidates = [FORMAT_XMB, FORMAT_XTB, FORMAT_XLIFF12, FORMAT_XLIFF20];
        }
        if (path && path.endsWith('xtb')) {
            formatCandidates = [FORMAT_XTB, FORMAT_XMB, FORMAT_XLIFF12, FORMAT_XLIFF20];
        }
        // try all candidate formats to get the right one
        for (let i = 0; i < formatCandidates.length; i++) {
            const formatCandidate = formatCandidates[i];
            try {
                const translationFile = TranslationMessagesFileFactory.fromFileContent(formatCandidate, xmlContent, path, encoding, optionalMaster);
                if (translationFile) {
                    return translationFile;
                }
            }
            catch (e) {
                // seams to be the wrong format
            }
        }
        throw new Error(format('could not identify file format, it is neiter XLIFF (1.2 or 2.0) nor XMB/XTB'));
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidHJhbnNsYXRpb24tbWVzc2FnZXMtZmlsZS1mYWN0b3J5LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vcHJvamVjdHMvbmd4LWkxOG5zdXBwb3J0LWxpYi9zcmMvYXBpL3RyYW5zbGF0aW9uLW1lc3NhZ2VzLWZpbGUtZmFjdG9yeS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFJQSxPQUFPLEVBQUMsU0FBUyxFQUFDLE1BQU0sb0JBQW9CLENBQUM7QUFDN0MsT0FBTyxFQUFDLE9BQU8sRUFBQyxNQUFNLGtCQUFrQixDQUFDO0FBQ3pDLE9BQU8sRUFBQyxNQUFNLEVBQUMsTUFBTSxNQUFNLENBQUM7QUFDNUIsT0FBTyxFQUFDLFVBQVUsRUFBQyxNQUFNLHFCQUFxQixDQUFDO0FBQy9DLE9BQU8sRUFBQyxjQUFjLEVBQUUsY0FBYyxFQUFFLFVBQVUsRUFBRSxVQUFVLEVBQUMsTUFBTSxhQUFhLENBQUM7QUFDbkYsT0FBTyxFQUFDLE9BQU8sRUFBQyxNQUFNLGtCQUFrQixDQUFDO0FBR3pDOzs7R0FHRztBQUNILE1BQU0sT0FBTyw4QkFBOEI7SUFFdkM7Ozs7Ozs7Ozs7O09BV0c7SUFDSSxNQUFNLENBQUMsZUFBZSxDQUFDLFVBQWtCLEVBQ2xCLFVBQWtCLEVBQ2xCLElBQVksRUFDWixRQUFnQixFQUNoQixjQUFxRTtRQUMvRixPQUFPLElBQUksOEJBQThCLEVBQUUsQ0FBQyx5QkFBeUIsQ0FBQyxVQUFVLEVBQUUsVUFBVSxFQUFFLElBQUksRUFBRSxRQUFRLEVBQUUsY0FBYyxDQUFDLENBQUM7SUFDbEksQ0FBQztJQUVEOzs7Ozs7Ozs7Ozs7T0FZRztJQUNJLE1BQU0sQ0FBQyw0QkFBNEIsQ0FBQyxVQUFrQixFQUMvQixJQUFZLEVBQ1osUUFBZ0IsRUFDaEIsY0FBcUU7UUFDL0YsT0FBTyxJQUFJLDhCQUE4QixFQUFFLENBQUMsc0NBQXNDLENBQUMsVUFBVSxFQUFFLElBQUksRUFBRSxRQUFRLEVBQUUsY0FBYyxDQUFDLENBQUM7SUFDbkksQ0FBQztJQUVEOzs7Ozs7Ozs7OztPQVdHO0lBQ0gseUJBQXlCLENBQUMsVUFBa0IsRUFDbEIsVUFBa0IsRUFDbEIsSUFBWSxFQUNaLFFBQWdCLEVBQ2hCLGNBQXVFO1FBQzdGLElBQUksVUFBVSxLQUFLLGNBQWMsRUFBRTtZQUMvQixPQUFPLElBQUksU0FBUyxDQUFDLFVBQVUsRUFBRSxJQUFJLEVBQUUsUUFBUSxDQUFDLENBQUM7U0FDcEQ7UUFDRCxJQUFJLFVBQVUsS0FBSyxjQUFjLEVBQUU7WUFDL0IsT0FBTyxJQUFJLFVBQVUsQ0FBQyxVQUFVLEVBQUUsSUFBSSxFQUFFLFFBQVEsQ0FBQyxDQUFDO1NBQ3JEO1FBQ0QsSUFBSSxVQUFVLEtBQUssVUFBVSxFQUFFO1lBQzNCLE9BQU8sSUFBSSxPQUFPLENBQUMsSUFBSSxFQUFFLFVBQVUsRUFBRSxJQUFJLEVBQUUsUUFBUSxDQUFDLENBQUM7U0FDeEQ7UUFDRCxJQUFJLFVBQVUsS0FBSyxVQUFVLEVBQUU7WUFDM0IsT0FBTyxJQUFJLE9BQU8sQ0FBQyxJQUFJLEVBQUUsVUFBVSxFQUFFLElBQUksRUFBRSxRQUFRLEVBQUUsY0FBYyxDQUFDLENBQUM7U0FDeEU7UUFDRCxNQUFNLElBQUksS0FBSyxDQUFDLE1BQU0sQ0FBQywrQkFBK0IsRUFBRSxVQUFVLENBQUMsQ0FBQyxDQUFDO0lBRXpFLENBQUM7SUFFRDs7Ozs7Ozs7Ozs7O09BWUc7SUFDSCxzQ0FBc0MsQ0FBQyxVQUFrQixFQUNsQixJQUFZLEVBQ1osUUFBZ0IsRUFDaEIsY0FBdUU7UUFFMUcsSUFBSSxnQkFBZ0IsR0FBRyxDQUFDLGNBQWMsRUFBRSxjQUFjLEVBQUUsVUFBVSxFQUFFLFVBQVUsQ0FBQyxDQUFDO1FBQ2hGLElBQUksSUFBSSxJQUFJLElBQUksQ0FBQyxRQUFRLENBQUMsS0FBSyxDQUFDLEVBQUU7WUFDOUIsZ0JBQWdCLEdBQUcsQ0FBQyxVQUFVLEVBQUUsVUFBVSxFQUFFLGNBQWMsRUFBRSxjQUFjLENBQUMsQ0FBQztTQUMvRTtRQUNELElBQUksSUFBSSxJQUFJLElBQUksQ0FBQyxRQUFRLENBQUMsS0FBSyxDQUFDLEVBQUU7WUFDOUIsZ0JBQWdCLEdBQUcsQ0FBQyxVQUFVLEVBQUUsVUFBVSxFQUFFLGNBQWMsRUFBRSxjQUFjLENBQUMsQ0FBQztTQUMvRTtRQUNELGlEQUFpRDtRQUNqRCxLQUFLLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsZ0JBQWdCLENBQUMsTUFBTSxFQUFFLENBQUMsRUFBRSxFQUFFO1lBQzlDLE1BQU0sZUFBZSxHQUFHLGdCQUFnQixDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQzVDLElBQUk7Z0JBQ0EsTUFBTSxlQUFlLEdBQUcsOEJBQThCLENBQUMsZUFBZSxDQUNsRSxlQUFlLEVBQUUsVUFBVSxFQUFFLElBQUksRUFBRSxRQUFRLEVBQUUsY0FBYyxDQUFDLENBQUM7Z0JBQ2pFLElBQUksZUFBZSxFQUFFO29CQUNqQixPQUFPLGVBQWUsQ0FBQztpQkFDMUI7YUFDSjtZQUFDLE9BQU8sQ0FBQyxFQUFFO2dCQUNSLCtCQUErQjthQUNsQztTQUNKO1FBQ0QsTUFBTSxJQUFJLEtBQUssQ0FBQyxNQUFNLENBQUMsNkVBQTZFLENBQUMsQ0FBQyxDQUFDO0lBQzNHLENBQUM7Q0FFSiIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxyXG4gKiBDcmVhdGVkIGJ5IHJvb2JtIG9uIDIxLjAzLjIwMTcuXHJcbiAqL1xyXG5pbXBvcnQge0lUcmFuc2xhdGlvbk1lc3NhZ2VzRmlsZX0gZnJvbSAnLi9pLXRyYW5zbGF0aW9uLW1lc3NhZ2VzLWZpbGUnO1xyXG5pbXBvcnQge1hsaWZmRmlsZX0gZnJvbSAnLi4vaW1wbC94bGlmZi1maWxlJztcclxuaW1wb3J0IHtYbWJGaWxlfSBmcm9tICcuLi9pbXBsL3htYi1maWxlJztcclxuaW1wb3J0IHtmb3JtYXR9IGZyb20gJ3V0aWwnO1xyXG5pbXBvcnQge1hsaWZmMkZpbGV9IGZyb20gJy4uL2ltcGwveGxpZmYyLWZpbGUnO1xyXG5pbXBvcnQge0ZPUk1BVF9YTElGRjEyLCBGT1JNQVRfWExJRkYyMCwgRk9STUFUX1hNQiwgRk9STUFUX1hUQn0gZnJvbSAnLi9jb25zdGFudHMnO1xyXG5pbXBvcnQge1h0YkZpbGV9IGZyb20gJy4uL2ltcGwveHRiLWZpbGUnO1xyXG5pbXBvcnQge0lUcmFuc2xhdGlvbk1lc3NhZ2VzRmlsZUZhY3Rvcnl9IGZyb20gJy4vaS10cmFuc2xhdGlvbi1tZXNzYWdlcy1maWxlLWZhY3RvcnknO1xyXG5cclxuLyoqXHJcbiAqIEhlbHBlciBjbGFzcyB0byByZWFkIHRyYW5zbGF0aW9uIGZpbGVzIGRlcGVuZGluZyBvbiBmb3JtYXQuXHJcbiAqIFRoaXMgaXMgcGFydCBvZiB0aGUgcHVibGljIGFwaVxyXG4gKi9cclxuZXhwb3J0IGNsYXNzIFRyYW5zbGF0aW9uTWVzc2FnZXNGaWxlRmFjdG9yeSBpbXBsZW1lbnRzIElUcmFuc2xhdGlvbk1lc3NhZ2VzRmlsZUZhY3Rvcnkge1xyXG5cclxuICAgIC8qKlxyXG4gICAgICogUmVhZCBmaWxlIGZ1bmN0aW9uLCByZXN1bHQgZGVwZW5kcyBvbiBmb3JtYXQsIGVpdGhlciBYbGlmZkZpbGUgb3IgWG1iRmlsZS5cclxuICAgICAqIEBwYXJhbSBpMThuRm9ybWF0IGN1cnJlbnRseSAneGxmJyBvciAneGxmMicgb3IgJ3htYicgb3IgJ3h0YicgYXJlIHN1cHBvcnRlZFxyXG4gICAgICogQHBhcmFtIHhtbENvbnRlbnQgdGhlIGZpbGUgY29udGVudFxyXG4gICAgICogQHBhcmFtIHBhdGggdGhlIHBhdGggb2YgdGhlIGZpbGUgKG9ubHkgdXNlZCB0byByZW1lbWJlciBpdClcclxuICAgICAqIEBwYXJhbSBlbmNvZGluZyB1dGYtOCwgLi4uIHVzZWQgdG8gcGFyc2UgWE1MLlxyXG4gICAgICogVGhpcyBpcyByZWFkIGZyb20gdGhlIGZpbGUsIGJ1dCBpZiB5b3Uga25vdyBpdCBiZWZvcmUsIHlvdSBjYW4gYXZvaWQgcmVhZGluZyB0aGUgZmlsZSB0d2ljZS5cclxuICAgICAqIEBwYXJhbSBvcHRpb25hbE1hc3RlciBpbiBjYXNlIG9mIHhtYiB0aGUgbWFzdGVyIGZpbGUsIHRoYXQgY29udGFpbnMgdGhlIG9yaWdpbmFsIHRleHRzLlxyXG4gICAgICogKHRoaXMgaXMgdXNlZCB0byBzdXBwb3J0IHN0YXRlIGluZm9zLCB0aGF0IGFyZSBiYXNlZCBvbiBjb21wYXJpbmcgb3JpZ2luYWwgd2l0aCB0cmFuc2xhdGVkIHZlcnNpb24pXHJcbiAgICAgKiBJZ25vcmVkIGZvciBvdGhlciBmb3JtYXRzLlxyXG4gICAgICogQHJldHVybiBlaXRoZXIgWGxpZmZGaWxlIG9yIFhtYkZpbGVcclxuICAgICAqL1xyXG4gICAgcHVibGljIHN0YXRpYyBmcm9tRmlsZUNvbnRlbnQoaTE4bkZvcm1hdDogc3RyaW5nLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgeG1sQ29udGVudDogc3RyaW5nLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcGF0aDogc3RyaW5nLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZW5jb2Rpbmc6IHN0cmluZyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG9wdGlvbmFsTWFzdGVyPzoge3htbENvbnRlbnQ6IHN0cmluZywgcGF0aDogc3RyaW5nLCBlbmNvZGluZzogc3RyaW5nfSk6IElUcmFuc2xhdGlvbk1lc3NhZ2VzRmlsZSB7XHJcbiAgICAgICAgcmV0dXJuIG5ldyBUcmFuc2xhdGlvbk1lc3NhZ2VzRmlsZUZhY3RvcnkoKS5jcmVhdGVGaWxlRnJvbUZpbGVDb250ZW50KGkxOG5Gb3JtYXQsIHhtbENvbnRlbnQsIHBhdGgsIGVuY29kaW5nLCBvcHRpb25hbE1hc3Rlcik7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBSZWFkIGZpbGUgZnVuY3Rpb24gZm9yIGFueSBmaWxlIHdpdGggdW5rbm93biBmb3JtYXQuXHJcbiAgICAgKiBUaGlzIGZ1bmN0aW9ucyB0cmllcyB0byBndWVzcyB0aGUgZm9ybWF0IGJhc2VkIG9uIHRoZSBmaWxlbmFtZSBhbmQgdGhlIGNvbnRlbnQgb2YgdGhlIGZpbGUuXHJcbiAgICAgKiBSZXN1bHQgZGVwZW5kcyBvbiBkZXRlY3RlZCBmb3JtYXQsIGVpdGhlciBYbGlmZkZpbGUgb3IgWG1iRmlsZS5cclxuICAgICAqIEBwYXJhbSB4bWxDb250ZW50IHRoZSBmaWxlIGNvbnRlbnRcclxuICAgICAqIEBwYXJhbSBwYXRoIHRoZSBwYXRoIG9mIHRoZSBmaWxlIChvbmx5IHVzZWQgdG8gcmVtZW1iZXIgaXQpXHJcbiAgICAgKiBAcGFyYW0gZW5jb2RpbmcgdXRmLTgsIC4uLiB1c2VkIHRvIHBhcnNlIFhNTC5cclxuICAgICAqIFRoaXMgaXMgcmVhZCBmcm9tIHRoZSBmaWxlLCBidXQgaWYgeW91IGtub3cgaXQgYmVmb3JlLCB5b3UgY2FuIGF2b2lkIHJlYWRpbmcgdGhlIGZpbGUgdHdpY2UuXHJcbiAgICAgKiBAcGFyYW0gb3B0aW9uYWxNYXN0ZXIgaW4gY2FzZSBvZiB4bWIgdGhlIG1hc3RlciBmaWxlLCB0aGF0IGNvbnRhaW5zIHRoZSBvcmlnaW5hbCB0ZXh0cy5cclxuICAgICAqICh0aGlzIGlzIHVzZWQgdG8gc3VwcG9ydCBzdGF0ZSBpbmZvcywgdGhhdCBhcmUgYmFzZWQgb24gY29tcGFyaW5nIG9yaWdpbmFsIHdpdGggdHJhbnNsYXRlZCB2ZXJzaW9uKVxyXG4gICAgICogSWdub3JlZCBmb3Igb3RoZXIgZm9ybWF0cy5cclxuICAgICAqIEByZXR1cm4gZWl0aGVyIFhsaWZmRmlsZSBvciBYbWJGaWxlXHJcbiAgICAgKi9cclxuICAgIHB1YmxpYyBzdGF0aWMgZnJvbVVua25vd25Gb3JtYXRGaWxlQ29udGVudCh4bWxDb250ZW50OiBzdHJpbmcsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBwYXRoOiBzdHJpbmcsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBlbmNvZGluZzogc3RyaW5nLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgb3B0aW9uYWxNYXN0ZXI/OiB7eG1sQ29udGVudDogc3RyaW5nLCBwYXRoOiBzdHJpbmcsIGVuY29kaW5nOiBzdHJpbmd9KTogSVRyYW5zbGF0aW9uTWVzc2FnZXNGaWxlIHtcclxuICAgICAgICByZXR1cm4gbmV3IFRyYW5zbGF0aW9uTWVzc2FnZXNGaWxlRmFjdG9yeSgpLmNyZWF0ZUZpbGVGcm9tVW5rbm93bkZvcm1hdEZpbGVDb250ZW50KHhtbENvbnRlbnQsIHBhdGgsIGVuY29kaW5nLCBvcHRpb25hbE1hc3Rlcik7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBSZWFkIGZpbGUgZnVuY3Rpb24sIHJlc3VsdCBkZXBlbmRzIG9uIGZvcm1hdCwgZWl0aGVyIFhsaWZmRmlsZSBvciBYbWJGaWxlLlxyXG4gICAgICogQHBhcmFtIGkxOG5Gb3JtYXQgY3VycmVudGx5ICd4bGYnIG9yICd4bGYyJyBvciAneG1iJyBvciAneHRiJyBhcmUgc3VwcG9ydGVkXHJcbiAgICAgKiBAcGFyYW0geG1sQ29udGVudCB0aGUgZmlsZSBjb250ZW50XHJcbiAgICAgKiBAcGFyYW0gcGF0aCB0aGUgcGF0aCBvZiB0aGUgZmlsZSAob25seSB1c2VkIHRvIHJlbWVtYmVyIGl0KVxyXG4gICAgICogQHBhcmFtIGVuY29kaW5nIHV0Zi04LCAuLi4gdXNlZCB0byBwYXJzZSBYTUwuXHJcbiAgICAgKiBUaGlzIGlzIHJlYWQgZnJvbSB0aGUgZmlsZSwgYnV0IGlmIHlvdSBrbm93IGl0IGJlZm9yZSwgeW91IGNhbiBhdm9pZCByZWFkaW5nIHRoZSBmaWxlIHR3aWNlLlxyXG4gICAgICogQHBhcmFtIG9wdGlvbmFsTWFzdGVyIGluIGNhc2Ugb2YgeG1iIHRoZSBtYXN0ZXIgZmlsZSwgdGhhdCBjb250YWlucyB0aGUgb3JpZ2luYWwgdGV4dHMuXHJcbiAgICAgKiAodGhpcyBpcyB1c2VkIHRvIHN1cHBvcnQgc3RhdGUgaW5mb3MsIHRoYXQgYXJlIGJhc2VkIG9uIGNvbXBhcmluZyBvcmlnaW5hbCB3aXRoIHRyYW5zbGF0ZWQgdmVyc2lvbilcclxuICAgICAqIElnbm9yZWQgZm9yIG90aGVyIGZvcm1hdHMuXHJcbiAgICAgKiBAcmV0dXJuIGVpdGhlciBYbGlmZkZpbGUgb3IgWG1iRmlsZVxyXG4gICAgICovXHJcbiAgICBjcmVhdGVGaWxlRnJvbUZpbGVDb250ZW50KGkxOG5Gb3JtYXQ6IHN0cmluZyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgeG1sQ29udGVudDogc3RyaW5nLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICBwYXRoOiBzdHJpbmcsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGVuY29kaW5nOiBzdHJpbmcsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG9wdGlvbmFsTWFzdGVyPzogeyB4bWxDb250ZW50OiBzdHJpbmcsIHBhdGg6IHN0cmluZywgZW5jb2Rpbmc6IHN0cmluZyB9KTogSVRyYW5zbGF0aW9uTWVzc2FnZXNGaWxlIHtcclxuICAgICAgICBpZiAoaTE4bkZvcm1hdCA9PT0gRk9STUFUX1hMSUZGMTIpIHtcclxuICAgICAgICAgICAgcmV0dXJuIG5ldyBYbGlmZkZpbGUoeG1sQ29udGVudCwgcGF0aCwgZW5jb2RpbmcpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAoaTE4bkZvcm1hdCA9PT0gRk9STUFUX1hMSUZGMjApIHtcclxuICAgICAgICAgICAgcmV0dXJuIG5ldyBYbGlmZjJGaWxlKHhtbENvbnRlbnQsIHBhdGgsIGVuY29kaW5nKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKGkxOG5Gb3JtYXQgPT09IEZPUk1BVF9YTUIpIHtcclxuICAgICAgICAgICAgcmV0dXJuIG5ldyBYbWJGaWxlKHRoaXMsIHhtbENvbnRlbnQsIHBhdGgsIGVuY29kaW5nKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKGkxOG5Gb3JtYXQgPT09IEZPUk1BVF9YVEIpIHtcclxuICAgICAgICAgICAgcmV0dXJuIG5ldyBYdGJGaWxlKHRoaXMsIHhtbENvbnRlbnQsIHBhdGgsIGVuY29kaW5nLCBvcHRpb25hbE1hc3Rlcik7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHRocm93IG5ldyBFcnJvcihmb3JtYXQoJ29vcHMsIHVuc3VwcG9ydGVkIGZvcm1hdCBcIiVzXCInLCBpMThuRm9ybWF0KSk7XHJcblxyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogUmVhZCBmaWxlIGZ1bmN0aW9uIGZvciBhbnkgZmlsZSB3aXRoIHVua25vd24gZm9ybWF0LlxyXG4gICAgICogVGhpcyBmdW5jdGlvbnMgdHJpZXMgdG8gZ3Vlc3MgdGhlIGZvcm1hdCBiYXNlZCBvbiB0aGUgZmlsZW5hbWUgYW5kIHRoZSBjb250ZW50IG9mIHRoZSBmaWxlLlxyXG4gICAgICogUmVzdWx0IGRlcGVuZHMgb24gZGV0ZWN0ZWQgZm9ybWF0LCBlaXRoZXIgWGxpZmZGaWxlIG9yIFhtYkZpbGUuXHJcbiAgICAgKiBAcGFyYW0geG1sQ29udGVudCB0aGUgZmlsZSBjb250ZW50XHJcbiAgICAgKiBAcGFyYW0gcGF0aCB0aGUgcGF0aCBvZiB0aGUgZmlsZSAob25seSB1c2VkIHRvIHJlbWVtYmVyIGl0KVxyXG4gICAgICogQHBhcmFtIGVuY29kaW5nIHV0Zi04LCAuLi4gdXNlZCB0byBwYXJzZSBYTUwuXHJcbiAgICAgKiBUaGlzIGlzIHJlYWQgZnJvbSB0aGUgZmlsZSwgYnV0IGlmIHlvdSBrbm93IGl0IGJlZm9yZSwgeW91IGNhbiBhdm9pZCByZWFkaW5nIHRoZSBmaWxlIHR3aWNlLlxyXG4gICAgICogQHBhcmFtIG9wdGlvbmFsTWFzdGVyIGluIGNhc2Ugb2YgeG1iIHRoZSBtYXN0ZXIgZmlsZSwgdGhhdCBjb250YWlucyB0aGUgb3JpZ2luYWwgdGV4dHMuXHJcbiAgICAgKiAodGhpcyBpcyB1c2VkIHRvIHN1cHBvcnQgc3RhdGUgaW5mb3MsIHRoYXQgYXJlIGJhc2VkIG9uIGNvbXBhcmluZyBvcmlnaW5hbCB3aXRoIHRyYW5zbGF0ZWQgdmVyc2lvbilcclxuICAgICAqIElnbm9yZWQgZm9yIG90aGVyIGZvcm1hdHMuXHJcbiAgICAgKiBAcmV0dXJuIGVpdGhlciBYbGlmZkZpbGUgb3IgWG1iRmlsZVxyXG4gICAgICovXHJcbiAgICBjcmVhdGVGaWxlRnJvbVVua25vd25Gb3JtYXRGaWxlQ29udGVudCh4bWxDb250ZW50OiBzdHJpbmcsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBwYXRoOiBzdHJpbmcsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBlbmNvZGluZzogc3RyaW5nLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgb3B0aW9uYWxNYXN0ZXI/OiB7IHhtbENvbnRlbnQ6IHN0cmluZywgcGF0aDogc3RyaW5nLCBlbmNvZGluZzogc3RyaW5nIH0pXHJcbiAgICAgICAgOiBJVHJhbnNsYXRpb25NZXNzYWdlc0ZpbGUge1xyXG4gICAgICAgIGxldCBmb3JtYXRDYW5kaWRhdGVzID0gW0ZPUk1BVF9YTElGRjEyLCBGT1JNQVRfWExJRkYyMCwgRk9STUFUX1hNQiwgRk9STUFUX1hUQl07XHJcbiAgICAgICAgaWYgKHBhdGggJiYgcGF0aC5lbmRzV2l0aCgneG1iJykpIHtcclxuICAgICAgICAgICAgZm9ybWF0Q2FuZGlkYXRlcyA9IFtGT1JNQVRfWE1CLCBGT1JNQVRfWFRCLCBGT1JNQVRfWExJRkYxMiwgRk9STUFUX1hMSUZGMjBdO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAocGF0aCAmJiBwYXRoLmVuZHNXaXRoKCd4dGInKSkge1xyXG4gICAgICAgICAgICBmb3JtYXRDYW5kaWRhdGVzID0gW0ZPUk1BVF9YVEIsIEZPUk1BVF9YTUIsIEZPUk1BVF9YTElGRjEyLCBGT1JNQVRfWExJRkYyMF07XHJcbiAgICAgICAgfVxyXG4gICAgICAgIC8vIHRyeSBhbGwgY2FuZGlkYXRlIGZvcm1hdHMgdG8gZ2V0IHRoZSByaWdodCBvbmVcclxuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IGZvcm1hdENhbmRpZGF0ZXMubGVuZ3RoOyBpKyspIHtcclxuICAgICAgICAgICAgY29uc3QgZm9ybWF0Q2FuZGlkYXRlID0gZm9ybWF0Q2FuZGlkYXRlc1tpXTtcclxuICAgICAgICAgICAgdHJ5IHtcclxuICAgICAgICAgICAgICAgIGNvbnN0IHRyYW5zbGF0aW9uRmlsZSA9IFRyYW5zbGF0aW9uTWVzc2FnZXNGaWxlRmFjdG9yeS5mcm9tRmlsZUNvbnRlbnQoXHJcbiAgICAgICAgICAgICAgICAgICAgZm9ybWF0Q2FuZGlkYXRlLCB4bWxDb250ZW50LCBwYXRoLCBlbmNvZGluZywgb3B0aW9uYWxNYXN0ZXIpO1xyXG4gICAgICAgICAgICAgICAgaWYgKHRyYW5zbGF0aW9uRmlsZSkge1xyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB0cmFuc2xhdGlvbkZpbGU7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0gY2F0Y2ggKGUpIHtcclxuICAgICAgICAgICAgICAgIC8vIHNlYW1zIHRvIGJlIHRoZSB3cm9uZyBmb3JtYXRcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoZm9ybWF0KCdjb3VsZCBub3QgaWRlbnRpZnkgZmlsZSBmb3JtYXQsIGl0IGlzIG5laXRlciBYTElGRiAoMS4yIG9yIDIuMCkgbm9yIFhNQi9YVEInKSk7XHJcbiAgICB9XHJcblxyXG59XHJcblxyXG4iXX0=