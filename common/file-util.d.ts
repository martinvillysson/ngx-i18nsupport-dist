/**
 * Created by martin on 17.02.2017.
 * Some (a few) simple utils for file operations.
 * Just for convenience.
 */
export declare class FileUtil {
    /**
     * Check for existence.
     * @param filename filename
     * @return wether file exists
     */
    static exists(filename: string): boolean;
    /**
     * Read a file.
     * @param filename filename
     * @param encoding encoding
     * @return content of file
     */
    static read(filename: string, encoding: string): string;
    /**
     * Write a file with given content.
     * @param filename filename
     * @param newContent newContent
     * @param encoding encoding
     */
    static replaceContent(filename: string, newContent: string, encoding: string): void;
    static copy(srcFile: string, destFile: string): void;
    /**
     * Delete the folder and all of its content (rm -rf).
     * @param path path
     */
    static deleteFolderRecursive(path: string): void;
    /**
     * Delete folders content recursively, but do not delete folder.
     * Folder is left empty at the end.
     * @param path path
     */
    static deleteFolderContentRecursive(path: string): void;
    /**
     * Delete a file.
     * @param path path
     */
    static deleteFile(path: string): void;
}
