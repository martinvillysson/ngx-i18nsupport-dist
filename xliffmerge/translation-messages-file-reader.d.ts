/**
 * Created by roobm on 21.03.2017.
 */
import { ITranslationMessagesFile } from '@ngx-i18nsupport/ngx-i18nsupport-lib';
/**
 * Helper class to read translation files depending on format.
 */
export declare class TranslationMessagesFileReader {
    /**
     * Read file function, result depends on format, either XliffFile or XmbFile.
     * @param i18nFormat format
     * @param path path
     * @param encoding encoding
     * @param optionalMasterFilePath optionalMasterFilePath
     * @return XliffFile
     */
    static fromFile(i18nFormat: string, path: string, encoding: string, optionalMasterFilePath?: string): ITranslationMessagesFile;
    /**
     * Read file function, result depends on format, either XliffFile or XmbFile.
     * @param path path
     * @param encoding encoding
     * @param optionalMasterFilePath optionalMasterFilePath
     * @return XliffFile
     */
    static fromUnknownFormatFile(path: string, encoding: string, optionalMasterFilePath?: string): ITranslationMessagesFile;
    /**
     * Read master xmb file
     * @param optionalMasterFilePath optionalMasterFilePath
     * @param encoding encoding
     * @return content and encoding of file
     */
    private static masterFileContent;
    /**
     * Save edited file.
     * @param messagesFile messagesFile
     * @param beautifyOutput Flag whether to use pretty-data to format the output.
     * XMLSerializer produces some correct but strangely formatted output, which pretty-data can correct.
     * See issue #64 for details.
     * Default is false.
     */
    static save(messagesFile: ITranslationMessagesFile, beautifyOutput?: boolean): void;
}
