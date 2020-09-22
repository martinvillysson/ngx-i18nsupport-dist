import { CommandOutput } from '../common/command-output';
import { ProgramOptions, IConfigFile } from './i-xliff-merge-options';
import { Observable } from 'rxjs';
/**
 * Created by martin on 17.02.2017.
 * XliffMerge - read xliff or xmb file and put untranslated parts in language specific xliff or xmb files.
 *
 */
export declare class XliffMerge {
    private readonly commandOutput;
    private readonly options;
    private parameters;
    /**
     * The read master xlf file.
     */
    private master;
    private autoTranslateService;
    static main(argv: string[]): void;
    static parseArgs(argv: string[]): ProgramOptions;
    static showUsage(): void;
    /**
     * For Tests, create instance with given profile
     * @param commandOutput commandOutput
     * @param options options
     * @param profileContent profileContent
     */
    static createFromOptions(commandOutput: CommandOutput, options: ProgramOptions, profileContent?: IConfigFile): XliffMerge;
    constructor(commandOutput: CommandOutput, options: ProgramOptions);
    /**
     * Run the command.
     * This runs async.
     * @param callbackFunction when command is executed, called with the return code (0 for ok), if given.
     * @param errorFunction callbackFunction for error handling
     */
    run(callbackFunction?: ((retcode: number) => any), errorFunction?: ((error: any) => any)): void;
    /**
     * Execute merge-Process.
     * @return Async operation, on completion returns retcode 0=ok, other = error.
     */
    runAsync(): Observable<number>;
    /**
     * Give an array of retcodes for the different languages, return the total retcode.
     * If all are 0, it is 0, otherwise the first non zero.
     * @param retcodes retcodes
     * @return number
     */
    private totalRetcode;
    /**
     * Return the name of the generated file for given lang.
     * @param lang language
     * @return name of generated file
     */
    generatedI18nFile(lang: string): string;
    /**
     * Return the name of the generated ngx-translation file for given lang.
     * @param lang language
     * @return name of translate file
     */
    generatedNgxTranslateFile(lang: string): string;
    /**
     * Warnings found during the run.
     * @return warnings
     */
    warnings(): string[];
    private readMaster;
    /**
     * Process the given language.
     * Async operation.
     * @param lang language
     * @return on completion 0 for ok, other for error
     */
    private processLanguage;
    /**
     * create a new file for the language, which contains no translations, but all keys.
     * in principle, this is just a copy of the master with target-language set.
     * @param lang language
     * @param languageXliffFilePath name of file
     */
    private createUntranslatedXliff;
    /**
     * Map the input format to the format of the translation.
     * Normally they are the same but for xmb the translation format is xtb.
     * @param i18nFormat format
     */
    private translationFormat;
    /**
     * Merge all
     * @param lang language
     * @param languageXliffFilePath filename
     */
    private mergeMasterTo;
    /**
     * Handle the case of changed id due to small white space changes.
     * @param masterTransUnit unit in master file
     * @param languageSpecificMessagesFile translation file
     * @param lastProcessedUnit Unit before the one processed here. New unit will be inserted after this one.
     * @return processed unit, if done, null if no changed unit found
     */
    private processChangedIdUnit;
    /**
     * test wether the sources of 2 trans units are equal ignoring white spaces.
     * @param tu1 tu1
     * @param tu2 tu2
     */
    private areSourcesNearlyEqual;
    private areSourceReferencesEqual;
    /**
     * Auto translate file via Google Translate.
     * Will translate all new units in file.
     * @param from from
     * @param to to
     * @param languageSpecificMessagesFile languageSpecificMessagesFile
     * @return a promise with the execution result as a summary report.
     */
    private autoTranslate;
}
