import * as fs from 'fs';
/**
 * Created by martin on 17.02.2017.
 * Some (a few) simple utils for file operations.
 * Just for convenience.
 */
export class FileUtil {
    /**
     * Check for existence.
     * @param filename filename
     * @return wether file exists
     */
    static exists(filename) {
        return fs.existsSync(filename);
    }
    /**
     * Read a file.
     * @param filename filename
     * @param encoding encoding
     * @return content of file
     */
    static read(filename, encoding) {
        return fs.readFileSync(filename, encoding);
    }
    /**
     * Write a file with given content.
     * @param filename filename
     * @param newContent newContent
     * @param encoding encoding
     */
    static replaceContent(filename, newContent, encoding) {
        fs.writeFileSync(filename, newContent, { encoding: encoding });
    }
    static copy(srcFile, destFile) {
        const BUF_LENGTH = 64 * 1024;
        const buff = Buffer.alloc(BUF_LENGTH);
        const fdr = fs.openSync(srcFile, 'r');
        const fdw = fs.openSync(destFile, 'w');
        let bytesRead = 1;
        let pos = 0;
        while (bytesRead > 0) {
            bytesRead = fs.readSync(fdr, buff, 0, BUF_LENGTH, pos);
            fs.writeSync(fdw, buff, 0, bytesRead);
            pos += bytesRead;
        }
        fs.closeSync(fdr);
        fs.closeSync(fdw);
    }
    /**
     * Delete the folder and all of its content (rm -rf).
     * @param path path
     */
    static deleteFolderRecursive(path) {
        let files = [];
        if (fs.existsSync(path)) {
            files = fs.readdirSync(path);
            files.forEach(function (file) {
                const curPath = path + '/' + file;
                if (fs.lstatSync(curPath).isDirectory()) { // recurse
                    FileUtil.deleteFolderRecursive(curPath);
                }
                else { // delete file
                    fs.unlinkSync(curPath);
                }
            });
            fs.rmdirSync(path);
        }
    }
    /**
     * Delete folders content recursively, but do not delete folder.
     * Folder is left empty at the end.
     * @param path path
     */
    static deleteFolderContentRecursive(path) {
        let files = [];
        if (fs.existsSync(path)) {
            files = fs.readdirSync(path);
            files.forEach(function (file) {
                const curPath = path + '/' + file;
                if (fs.lstatSync(curPath).isDirectory()) { // recurse
                    FileUtil.deleteFolderRecursive(curPath);
                }
                else { // delete file
                    fs.unlinkSync(curPath);
                }
            });
        }
    }
    /**
     * Delete a file.
     * @param path path
     */
    static deleteFile(path) {
        fs.unlinkSync(path);
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZmlsZS11dGlsLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vcHJvamVjdHMveGxpZmZtZXJnZS9zcmMvY29tbW9uL2ZpbGUtdXRpbC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLEtBQUssRUFBRSxNQUFNLElBQUksQ0FBQztBQUV6Qjs7OztHQUlHO0FBRUgsTUFBTSxPQUFPLFFBQVE7SUFFakI7Ozs7T0FJRztJQUNJLE1BQU0sQ0FBQyxNQUFNLENBQUMsUUFBZ0I7UUFDakMsT0FBTyxFQUFFLENBQUMsVUFBVSxDQUFDLFFBQVEsQ0FBQyxDQUFDO0lBQ25DLENBQUM7SUFFRDs7Ozs7T0FLRztJQUNJLE1BQU0sQ0FBQyxJQUFJLENBQUMsUUFBZ0IsRUFBRSxRQUFnQjtRQUNqRCxPQUFPLEVBQUUsQ0FBQyxZQUFZLENBQUMsUUFBUSxFQUFFLFFBQVEsQ0FBQyxDQUFDO0lBQy9DLENBQUM7SUFFRDs7Ozs7T0FLRztJQUNJLE1BQU0sQ0FBQyxjQUFjLENBQUMsUUFBZ0IsRUFBRSxVQUFrQixFQUFFLFFBQWdCO1FBQy9FLEVBQUUsQ0FBQyxhQUFhLENBQUMsUUFBUSxFQUFFLFVBQVUsRUFBRSxFQUFDLFFBQVEsRUFBRSxRQUFRLEVBQUMsQ0FBQyxDQUFDO0lBQ2pFLENBQUM7SUFFTSxNQUFNLENBQUMsSUFBSSxDQUFDLE9BQWUsRUFBRSxRQUFnQjtRQUNoRCxNQUFNLFVBQVUsR0FBRyxFQUFFLEdBQUcsSUFBSSxDQUFDO1FBQzdCLE1BQU0sSUFBSSxHQUFHLE1BQU0sQ0FBQyxLQUFLLENBQUMsVUFBVSxDQUFDLENBQUM7UUFDdEMsTUFBTSxHQUFHLEdBQUcsRUFBRSxDQUFDLFFBQVEsQ0FBQyxPQUFPLEVBQUUsR0FBRyxDQUFDLENBQUM7UUFDdEMsTUFBTSxHQUFHLEdBQUcsRUFBRSxDQUFDLFFBQVEsQ0FBQyxRQUFRLEVBQUUsR0FBRyxDQUFDLENBQUM7UUFDdkMsSUFBSSxTQUFTLEdBQUcsQ0FBQyxDQUFDO1FBQ2xCLElBQUksR0FBRyxHQUFHLENBQUMsQ0FBQztRQUNaLE9BQU8sU0FBUyxHQUFHLENBQUMsRUFBRTtZQUNsQixTQUFTLEdBQUcsRUFBRSxDQUFDLFFBQVEsQ0FBQyxHQUFHLEVBQUUsSUFBSSxFQUFFLENBQUMsRUFBRSxVQUFVLEVBQUUsR0FBRyxDQUFDLENBQUM7WUFDdkQsRUFBRSxDQUFDLFNBQVMsQ0FBQyxHQUFHLEVBQUUsSUFBSSxFQUFFLENBQUMsRUFBRSxTQUFTLENBQUMsQ0FBQztZQUN0QyxHQUFHLElBQUksU0FBUyxDQUFDO1NBQ3BCO1FBQ0QsRUFBRSxDQUFDLFNBQVMsQ0FBQyxHQUFHLENBQUMsQ0FBQztRQUNsQixFQUFFLENBQUMsU0FBUyxDQUFDLEdBQUcsQ0FBQyxDQUFDO0lBQ3RCLENBQUM7SUFFRDs7O09BR0c7SUFDSSxNQUFNLENBQUMscUJBQXFCLENBQUMsSUFBWTtRQUM1QyxJQUFJLEtBQUssR0FBRyxFQUFFLENBQUM7UUFDZixJQUFJLEVBQUUsQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFDLEVBQUc7WUFDdEIsS0FBSyxHQUFHLEVBQUUsQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFDLENBQUM7WUFDN0IsS0FBSyxDQUFDLE9BQU8sQ0FBQyxVQUFTLElBQUk7Z0JBQ3ZCLE1BQU0sT0FBTyxHQUFHLElBQUksR0FBRyxHQUFHLEdBQUcsSUFBSSxDQUFDO2dCQUNsQyxJQUFJLEVBQUUsQ0FBQyxTQUFTLENBQUMsT0FBTyxDQUFDLENBQUMsV0FBVyxFQUFFLEVBQUUsRUFBRSxVQUFVO29CQUNqRCxRQUFRLENBQUMscUJBQXFCLENBQUMsT0FBTyxDQUFDLENBQUM7aUJBQzNDO3FCQUFNLEVBQUUsY0FBYztvQkFDbkIsRUFBRSxDQUFDLFVBQVUsQ0FBQyxPQUFPLENBQUMsQ0FBQztpQkFDMUI7WUFDTCxDQUFDLENBQUMsQ0FBQztZQUNILEVBQUUsQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLENBQUM7U0FDdEI7SUFDTCxDQUFDO0lBRUQ7Ozs7T0FJRztJQUNJLE1BQU0sQ0FBQyw0QkFBNEIsQ0FBQyxJQUFZO1FBQ25ELElBQUksS0FBSyxHQUFHLEVBQUUsQ0FBQztRQUNmLElBQUksRUFBRSxDQUFDLFVBQVUsQ0FBQyxJQUFJLENBQUMsRUFBRztZQUN0QixLQUFLLEdBQUcsRUFBRSxDQUFDLFdBQVcsQ0FBQyxJQUFJLENBQUMsQ0FBQztZQUM3QixLQUFLLENBQUMsT0FBTyxDQUFDLFVBQVMsSUFBSTtnQkFDdkIsTUFBTSxPQUFPLEdBQUcsSUFBSSxHQUFHLEdBQUcsR0FBRyxJQUFJLENBQUM7Z0JBQ2xDLElBQUksRUFBRSxDQUFDLFNBQVMsQ0FBQyxPQUFPLENBQUMsQ0FBQyxXQUFXLEVBQUUsRUFBRSxFQUFFLFVBQVU7b0JBQ2pELFFBQVEsQ0FBQyxxQkFBcUIsQ0FBQyxPQUFPLENBQUMsQ0FBQztpQkFDM0M7cUJBQU0sRUFBRSxjQUFjO29CQUNuQixFQUFFLENBQUMsVUFBVSxDQUFDLE9BQU8sQ0FBQyxDQUFDO2lCQUMxQjtZQUNMLENBQUMsQ0FBQyxDQUFDO1NBQ047SUFDTCxDQUFDO0lBRUQ7OztPQUdHO0lBQ0ksTUFBTSxDQUFDLFVBQVUsQ0FBQyxJQUFZO1FBQ2pDLEVBQUUsQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFDLENBQUM7SUFDeEIsQ0FBQztDQUNKIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0ICogYXMgZnMgZnJvbSAnZnMnO1xyXG5cclxuLyoqXHJcbiAqIENyZWF0ZWQgYnkgbWFydGluIG9uIDE3LjAyLjIwMTcuXHJcbiAqIFNvbWUgKGEgZmV3KSBzaW1wbGUgdXRpbHMgZm9yIGZpbGUgb3BlcmF0aW9ucy5cclxuICogSnVzdCBmb3IgY29udmVuaWVuY2UuXHJcbiAqL1xyXG5cclxuZXhwb3J0IGNsYXNzIEZpbGVVdGlsIHtcclxuXHJcbiAgICAvKipcclxuICAgICAqIENoZWNrIGZvciBleGlzdGVuY2UuXHJcbiAgICAgKiBAcGFyYW0gZmlsZW5hbWUgZmlsZW5hbWVcclxuICAgICAqIEByZXR1cm4gd2V0aGVyIGZpbGUgZXhpc3RzXHJcbiAgICAgKi9cclxuICAgIHB1YmxpYyBzdGF0aWMgZXhpc3RzKGZpbGVuYW1lOiBzdHJpbmcpIHtcclxuICAgICAgICByZXR1cm4gZnMuZXhpc3RzU3luYyhmaWxlbmFtZSk7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBSZWFkIGEgZmlsZS5cclxuICAgICAqIEBwYXJhbSBmaWxlbmFtZSBmaWxlbmFtZVxyXG4gICAgICogQHBhcmFtIGVuY29kaW5nIGVuY29kaW5nXHJcbiAgICAgKiBAcmV0dXJuIGNvbnRlbnQgb2YgZmlsZVxyXG4gICAgICovXHJcbiAgICBwdWJsaWMgc3RhdGljIHJlYWQoZmlsZW5hbWU6IHN0cmluZywgZW5jb2Rpbmc6IHN0cmluZykge1xyXG4gICAgICAgIHJldHVybiBmcy5yZWFkRmlsZVN5bmMoZmlsZW5hbWUsIGVuY29kaW5nKTtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIFdyaXRlIGEgZmlsZSB3aXRoIGdpdmVuIGNvbnRlbnQuXHJcbiAgICAgKiBAcGFyYW0gZmlsZW5hbWUgZmlsZW5hbWVcclxuICAgICAqIEBwYXJhbSBuZXdDb250ZW50IG5ld0NvbnRlbnRcclxuICAgICAqIEBwYXJhbSBlbmNvZGluZyBlbmNvZGluZ1xyXG4gICAgICovXHJcbiAgICBwdWJsaWMgc3RhdGljIHJlcGxhY2VDb250ZW50KGZpbGVuYW1lOiBzdHJpbmcsIG5ld0NvbnRlbnQ6IHN0cmluZywgZW5jb2Rpbmc6IHN0cmluZykge1xyXG4gICAgICAgIGZzLndyaXRlRmlsZVN5bmMoZmlsZW5hbWUsIG5ld0NvbnRlbnQsIHtlbmNvZGluZzogZW5jb2Rpbmd9KTtcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgc3RhdGljIGNvcHkoc3JjRmlsZTogc3RyaW5nLCBkZXN0RmlsZTogc3RyaW5nKSB7XHJcbiAgICAgICAgY29uc3QgQlVGX0xFTkdUSCA9IDY0ICogMTAyNDtcclxuICAgICAgICBjb25zdCBidWZmID0gQnVmZmVyLmFsbG9jKEJVRl9MRU5HVEgpO1xyXG4gICAgICAgIGNvbnN0IGZkciA9IGZzLm9wZW5TeW5jKHNyY0ZpbGUsICdyJyk7XHJcbiAgICAgICAgY29uc3QgZmR3ID0gZnMub3BlblN5bmMoZGVzdEZpbGUsICd3Jyk7XHJcbiAgICAgICAgbGV0IGJ5dGVzUmVhZCA9IDE7XHJcbiAgICAgICAgbGV0IHBvcyA9IDA7XHJcbiAgICAgICAgd2hpbGUgKGJ5dGVzUmVhZCA+IDApIHtcclxuICAgICAgICAgICAgYnl0ZXNSZWFkID0gZnMucmVhZFN5bmMoZmRyLCBidWZmLCAwLCBCVUZfTEVOR1RILCBwb3MpO1xyXG4gICAgICAgICAgICBmcy53cml0ZVN5bmMoZmR3LCBidWZmLCAwLCBieXRlc1JlYWQpO1xyXG4gICAgICAgICAgICBwb3MgKz0gYnl0ZXNSZWFkO1xyXG4gICAgICAgIH1cclxuICAgICAgICBmcy5jbG9zZVN5bmMoZmRyKTtcclxuICAgICAgICBmcy5jbG9zZVN5bmMoZmR3KTtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIERlbGV0ZSB0aGUgZm9sZGVyIGFuZCBhbGwgb2YgaXRzIGNvbnRlbnQgKHJtIC1yZikuXHJcbiAgICAgKiBAcGFyYW0gcGF0aCBwYXRoXHJcbiAgICAgKi9cclxuICAgIHB1YmxpYyBzdGF0aWMgZGVsZXRlRm9sZGVyUmVjdXJzaXZlKHBhdGg6IHN0cmluZykge1xyXG4gICAgICAgIGxldCBmaWxlcyA9IFtdO1xyXG4gICAgICAgIGlmIChmcy5leGlzdHNTeW5jKHBhdGgpICkge1xyXG4gICAgICAgICAgICBmaWxlcyA9IGZzLnJlYWRkaXJTeW5jKHBhdGgpO1xyXG4gICAgICAgICAgICBmaWxlcy5mb3JFYWNoKGZ1bmN0aW9uKGZpbGUpIHtcclxuICAgICAgICAgICAgICAgIGNvbnN0IGN1clBhdGggPSBwYXRoICsgJy8nICsgZmlsZTtcclxuICAgICAgICAgICAgICAgIGlmIChmcy5sc3RhdFN5bmMoY3VyUGF0aCkuaXNEaXJlY3RvcnkoKSkgeyAvLyByZWN1cnNlXHJcbiAgICAgICAgICAgICAgICAgICAgRmlsZVV0aWwuZGVsZXRlRm9sZGVyUmVjdXJzaXZlKGN1clBhdGgpO1xyXG4gICAgICAgICAgICAgICAgfSBlbHNlIHsgLy8gZGVsZXRlIGZpbGVcclxuICAgICAgICAgICAgICAgICAgICBmcy51bmxpbmtTeW5jKGN1clBhdGgpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgZnMucm1kaXJTeW5jKHBhdGgpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIERlbGV0ZSBmb2xkZXJzIGNvbnRlbnQgcmVjdXJzaXZlbHksIGJ1dCBkbyBub3QgZGVsZXRlIGZvbGRlci5cclxuICAgICAqIEZvbGRlciBpcyBsZWZ0IGVtcHR5IGF0IHRoZSBlbmQuXHJcbiAgICAgKiBAcGFyYW0gcGF0aCBwYXRoXHJcbiAgICAgKi9cclxuICAgIHB1YmxpYyBzdGF0aWMgZGVsZXRlRm9sZGVyQ29udGVudFJlY3Vyc2l2ZShwYXRoOiBzdHJpbmcpIHtcclxuICAgICAgICBsZXQgZmlsZXMgPSBbXTtcclxuICAgICAgICBpZiAoZnMuZXhpc3RzU3luYyhwYXRoKSApIHtcclxuICAgICAgICAgICAgZmlsZXMgPSBmcy5yZWFkZGlyU3luYyhwYXRoKTtcclxuICAgICAgICAgICAgZmlsZXMuZm9yRWFjaChmdW5jdGlvbihmaWxlKSB7XHJcbiAgICAgICAgICAgICAgICBjb25zdCBjdXJQYXRoID0gcGF0aCArICcvJyArIGZpbGU7XHJcbiAgICAgICAgICAgICAgICBpZiAoZnMubHN0YXRTeW5jKGN1clBhdGgpLmlzRGlyZWN0b3J5KCkpIHsgLy8gcmVjdXJzZVxyXG4gICAgICAgICAgICAgICAgICAgIEZpbGVVdGlsLmRlbGV0ZUZvbGRlclJlY3Vyc2l2ZShjdXJQYXRoKTtcclxuICAgICAgICAgICAgICAgIH0gZWxzZSB7IC8vIGRlbGV0ZSBmaWxlXHJcbiAgICAgICAgICAgICAgICAgICAgZnMudW5saW5rU3luYyhjdXJQYXRoKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogRGVsZXRlIGEgZmlsZS5cclxuICAgICAqIEBwYXJhbSBwYXRoIHBhdGhcclxuICAgICAqL1xyXG4gICAgcHVibGljIHN0YXRpYyBkZWxldGVGaWxlKHBhdGg6IHN0cmluZykge1xyXG4gICAgICAgIGZzLnVubGlua1N5bmMocGF0aCk7XHJcbiAgICB9XHJcbn1cclxuIl19