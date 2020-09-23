import { CommandOutput } from '../common/command-output';
import { XliffMergeParameters } from './xliff-merge-parameters';
import { XliffMergeError } from './xliff-merge-error';
import { FileUtil } from '../common/file-util';
import { VERSION } from './version';
import { format } from 'util';
import { isNullOrUndefined } from '../common/util';
import { FORMAT_XMB, FORMAT_XTB, NORMALIZATION_FORMAT_DEFAULT, STATE_FINAL, STATE_TRANSLATED } from '@ngx-i18nsupport/ngx-i18nsupport-lib';
import { NgxTranslateExtractor } from './ngx-translate-extractor';
import { TranslationMessagesFileReader } from './translation-messages-file-reader';
import { of, forkJoin } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { XliffMergeAutoTranslateService } from '../autotranslate/xliff-merge-auto-translate-service';
import { AutoTranslateSummaryReport } from '../autotranslate/auto-translate-summary-report';
/**
 * Created by martin on 17.02.2017.
 * XliffMerge - read xliff or xmb file and put untranslated parts in language specific xliff or xmb files.
 *
 */
export class XliffMerge {
    constructor(commandOutput, options) {
        this.commandOutput = commandOutput;
        this.options = options;
        this.parameters = null;
    }
    static main(argv) {
        const options = XliffMerge.parseArgs(argv);
        if (options) {
            new XliffMerge(new CommandOutput(process.stdout), options).run((result) => {
                process.exit(result);
            });
        }
    }
    static parseArgs(argv) {
        const options = {
            languages: []
        };
        for (let i = 1; i < argv.length; i++) {
            const arg = argv[i];
            if (arg === '--version' || arg === '-version') {
                console.log('xliffmerge ' + VERSION);
            }
            else if (arg === '--verbose' || arg === '-v') {
                options.verbose = true;
            }
            else if (arg === '--profile' || arg === '-p') {
                i++;
                if (i >= argv.length) {
                    console.log('missing config file');
                    XliffMerge.showUsage();
                    return null;
                }
                else {
                    options.profilePath = argv[i];
                }
            }
            else if (arg === '--quiet' || arg === '-q') {
                options.quiet = true;
            }
            else if (arg === '--language' || arg === '-l') {
                i++;
                if (i >= argv.length) {
                    console.log('missing language');
                    return null;
                }
                else {
                    if (argv[i].indexOf(',') !== -1) {
                        const newLocal = argv[i].split(',');
                        options.languages.push(...newLocal);
                    }
                    else {
                        options.languages.push(argv[i]);
                    }
                }
            }
            else if (arg === '--help' || arg === '-help' || arg === '-h') {
                XliffMerge.showUsage();
            }
            else if (arg.length > 0 && arg.charAt(0) === '-') {
                console.log('unknown option');
                return null;
            }
            else {
                //options.languages.push(arg);
            }
        }
        return options;
    }
    static showUsage() {
        console.log('usage: xliffmerge <option>* <language>*');
        console.log('Options');
        console.log('\t-p|--profile a json configuration file containing all relevant parameters.');
        console.log('\t\tfor details please consult the home page https://github.com/martinroob/ngx-i18nsupport');
        console.log('\t-v|--verbose show some output for debugging purposes');
        console.log('\t-q|--quiet only show errors, nothing else');
        console.log('\t-version|--version show version string');
        console.log('');
        console.log('\t<language> has to be a valid language short string, e,g. "en", "de", "de-ch"');
    }
    /**
     * For Tests, create instance with given profile
     * @param commandOutput commandOutput
     * @param options options
     * @param profileContent profileContent
     */
    static createFromOptions(commandOutput, options, profileContent) {
        const instance = new XliffMerge(commandOutput, options);
        instance.parameters = XliffMergeParameters.createFromOptions(options, profileContent);
        return instance;
    }
    /**
     * Run the command.
     * This runs async.
     * @param callbackFunction when command is executed, called with the return code (0 for ok), if given.
     * @param errorFunction callbackFunction for error handling
     */
    run(callbackFunction, errorFunction) {
        this.runAsync()
            .subscribe((retcode) => {
            if (!isNullOrUndefined(callbackFunction)) {
                callbackFunction(retcode);
            }
        }, (error) => {
            if (!isNullOrUndefined(errorFunction)) {
                errorFunction(error);
            }
        });
    }
    /**
     * Execute merge-Process.
     * @return Async operation, on completion returns retcode 0=ok, other = error.
     */
    runAsync() {
        if (this.options && this.options.quiet) {
            this.commandOutput.setQuiet();
        }
        if (this.options && this.options.verbose) {
            this.commandOutput.setVerbose();
        }
        if (!this.parameters) {
            this.parameters = XliffMergeParameters.createFromOptions(this.options);
        }
        this.commandOutput.info('xliffmerge version %s', VERSION);
        if (this.parameters.verbose()) {
            this.parameters.showAllParameters(this.commandOutput);
        }
        if (this.parameters.errorsFound.length > 0) {
            for (const err of this.parameters.errorsFound) {
                this.commandOutput.error(err.message);
            }
            return of(-1);
        }
        if (this.parameters.warningsFound.length > 0) {
            for (const warn of this.parameters.warningsFound) {
                this.commandOutput.warn(warn);
            }
        }
        this.readMaster();
        if (this.parameters.autotranslate()) {
            this.autoTranslateService = new XliffMergeAutoTranslateService(this.parameters.apikey());
        }
        const executionForAllLanguages = [];
        this.parameters.languages().forEach((lang) => {
            executionForAllLanguages.push(this.processLanguage(lang));
        });
        return forkJoin(executionForAllLanguages).pipe(map((retcodes) => this.totalRetcode(retcodes)));
    }
    /**
     * Give an array of retcodes for the different languages, return the total retcode.
     * If all are 0, it is 0, otherwise the first non zero.
     * @param retcodes retcodes
     * @return number
     */
    totalRetcode(retcodes) {
        for (let i = 0; i < retcodes.length; i++) {
            if (retcodes[i] !== 0) {
                return retcodes[i];
            }
        }
        return 0;
    }
    /**
     * Return the name of the generated file for given lang.
     * @param lang language
     * @return name of generated file
     */
    generatedI18nFile(lang) {
        return this.parameters.generatedI18nFile(lang);
    }
    /**
     * Return the name of the generated ngx-translation file for given lang.
     * @param lang language
     * @return name of translate file
     */
    generatedNgxTranslateFile(lang) {
        return this.parameters.generatedNgxTranslateFile(lang);
    }
    /**
     * Warnings found during the run.
     * @return warnings
     */
    warnings() {
        return this.parameters.warningsFound;
    }
    readMaster() {
        try {
            this.master = TranslationMessagesFileReader.fromFile(this.parameters.i18nFormat(), this.parameters.i18nFile(), this.parameters.encoding());
            this.master.warnings().forEach((warning) => {
                this.commandOutput.warn(warning);
            });
            const count = this.master.numberOfTransUnits();
            const missingIdCount = this.master.numberOfTransUnitsWithMissingId();
            this.commandOutput.info('master contains %s trans-units', count);
            if (missingIdCount > 0) {
                this.commandOutput.warn('master contains %s trans-units, but there are %s without id', count, missingIdCount);
            }
            const sourceLang = this.master.sourceLanguage();
            if (sourceLang && sourceLang !== this.parameters.defaultLanguage()) {
                this.commandOutput.warn('master says to have source-language="%s", should be "%s" (your defaultLanguage)', sourceLang, this.parameters.defaultLanguage());
                this.master.setSourceLanguage(this.parameters.defaultLanguage());
                TranslationMessagesFileReader.save(this.master, this.parameters.beautifyOutput());
                this.commandOutput.warn('changed master source-language="%s" to "%s"', sourceLang, this.parameters.defaultLanguage());
            }
        }
        catch (err) {
            if (err instanceof XliffMergeError) {
                this.commandOutput.error(err.message);
                return of(-1);
            }
            else {
                // unhandled
                const currentFilename = this.parameters.i18nFile();
                const filenameString = (currentFilename) ? format('file "%s", ', currentFilename) : '';
                this.commandOutput.error(filenameString + 'oops ' + err);
                throw err;
            }
        }
    }
    /**
     * Process the given language.
     * Async operation.
     * @param lang language
     * @return on completion 0 for ok, other for error
     */
    processLanguage(lang) {
        this.commandOutput.debug('processing language %s', lang);
        const languageXliffFile = this.parameters.generatedI18nFile(lang);
        const currentFilename = languageXliffFile;
        let result;
        if (!FileUtil.exists(languageXliffFile)) {
            result = this.createUntranslatedXliff(lang, languageXliffFile);
        }
        else {
            result = this.mergeMasterTo(lang, languageXliffFile);
        }
        return result
            .pipe(map(() => {
            if (this.parameters.supportNgxTranslate()) {
                const languageSpecificMessagesFile = TranslationMessagesFileReader.fromFile(this.translationFormat(this.parameters.i18nFormat()), languageXliffFile, this.parameters.encoding(), this.master.filename());
                NgxTranslateExtractor.extract(languageSpecificMessagesFile, this.parameters.ngxTranslateExtractionPattern(), this.parameters.generatedNgxTranslateFile(lang));
            }
            return 0;
        }), catchError((err) => {
            if (err instanceof XliffMergeError) {
                this.commandOutput.error(err.message);
                return of(-1);
            }
            else {
                // unhandled
                const filenameString = (currentFilename) ? format('file "%s", ', currentFilename) : '';
                this.commandOutput.error(filenameString + 'oops ' + err);
                throw err;
            }
        }));
    }
    /**
     * create a new file for the language, which contains no translations, but all keys.
     * in principle, this is just a copy of the master with target-language set.
     * @param lang language
     * @param languageXliffFilePath name of file
     */
    createUntranslatedXliff(lang, languageXliffFilePath) {
        // copy master ...
        // and set target-language
        // and copy source to target if necessary
        const isDefaultLang = (lang === this.parameters.defaultLanguage());
        this.master.setNewTransUnitTargetPraefix(this.parameters.targetPraefix());
        this.master.setNewTransUnitTargetSuffix(this.parameters.targetSuffix());
        let optionalMaster;
        const optionalMasterFilePath = isDefaultLang ? this.parameters.optionalMasterFilePath() : this.parameters.optionalMasterFilePath(lang);
        if (optionalMasterFilePath) {
            optionalMaster = TranslationMessagesFileReader.masterFileContent(optionalMasterFilePath, this.parameters.encoding());
        }
        const languageSpecificMessagesFile = this.master.createTranslationFileForLang(lang, languageXliffFilePath, isDefaultLang, this.parameters.useSourceAsTarget(), optionalMaster);
        return this.autoTranslate(this.master.sourceLanguage(), lang, languageSpecificMessagesFile).pipe(map(( /* summary */) => {
            // write it to file
            TranslationMessagesFileReader.save(languageSpecificMessagesFile, this.parameters.beautifyOutput());
            this.commandOutput.info('created new file "%s" for target-language="%s"', languageXliffFilePath, lang);
            if (!isDefaultLang) {
                this.commandOutput.warn('please translate file "%s" to target-language="%s"', languageXliffFilePath, lang);
            }
            return null;
        }));
    }
    /**
     * Map the input format to the format of the translation.
     * Normally they are the same but for xmb the translation format is xtb.
     * @param i18nFormat format
     */
    translationFormat(i18nFormat) {
        if (i18nFormat === FORMAT_XMB) {
            return FORMAT_XTB;
        }
        else {
            return i18nFormat;
        }
    }
    /**
     * Merge all
     * @param lang language
     * @param languageXliffFilePath filename
     */
    mergeMasterTo(lang, languageXliffFilePath) {
        const isDefaultLang = (lang === this.parameters.defaultLanguage());
        const optionalMasterFilePath = isDefaultLang ? this.parameters.optionalMasterFilePath() : this.parameters.optionalMasterFilePath(lang);
        // read lang specific file
        const languageSpecificMessagesFile = TranslationMessagesFileReader.fromFile(this.translationFormat(this.parameters.i18nFormat()), languageXliffFilePath, this.parameters.encoding(), optionalMasterFilePath);
        let newCount = 0;
        let correctSourceContentCount = 0;
        let correctSourceRefCount = 0;
        let correctDescriptionOrMeaningCount = 0;
        let idChangedCount = 0;
        languageSpecificMessagesFile.setNewTransUnitTargetPraefix(this.parameters.targetPraefix());
        languageSpecificMessagesFile.setNewTransUnitTargetSuffix(this.parameters.targetSuffix());
        let lastProcessedUnit = null;
        this.master.forEachTransUnit((masterTransUnit) => {
            let transUnit = languageSpecificMessagesFile.transUnitWithId(masterTransUnit.id);
            const optionalTransUnit = languageSpecificMessagesFile.optionalMasterTransUnitWithId(masterTransUnit.id);
            if (!transUnit && optionalTransUnit) {
                // If we dont have a transunit in the language file but there is one in the language master file we use the language master one instead.
                transUnit = optionalTransUnit;
            }
            if (!transUnit) {
                // oops, no translation, must be a new key, so add it
                let newUnit;
                if (this.parameters.allowIdChange()
                    && (newUnit = this.processChangedIdUnit(masterTransUnit, languageSpecificMessagesFile, lastProcessedUnit))) {
                    lastProcessedUnit = newUnit;
                    idChangedCount++;
                }
                else {
                    lastProcessedUnit = languageSpecificMessagesFile.importNewTransUnit(masterTransUnit, isDefaultLang, this.parameters.useSourceAsTarget(), (this.parameters.preserveOrder()) ? lastProcessedUnit : undefined);
                    newCount++;
                }
            }
            else {
                // check for changed source content and change it if needed
                // (can only happen if ID is explicitely set, otherwise ID would change if source content is changed.
                if (transUnit.supportsSetSourceContent() && !this.areSourcesNearlyEqual(masterTransUnit, transUnit)) {
                    transUnit.setSourceContent(masterTransUnit.sourceContent());
                    if (isDefaultLang) {
                        // #81 changed source must be copied to target for default lang
                        transUnit.translate(masterTransUnit.sourceContent());
                        transUnit.setTargetState(STATE_FINAL);
                    }
                    else {
                        if (transUnit.targetState() === STATE_FINAL) {
                            // source is changed, so translation has to be checked again
                            transUnit.setTargetState(STATE_TRANSLATED);
                        }
                    }
                    correctSourceContentCount++;
                }
                // check for missing or changed source ref and add it if needed
                if (transUnit.supportsSetSourceReferences()
                    && !this.areSourceReferencesEqual(masterTransUnit.sourceReferences(), transUnit.sourceReferences())) {
                    transUnit.setSourceReferences(masterTransUnit.sourceReferences());
                    correctSourceRefCount++;
                }
                // check for changed description or meaning
                if (transUnit.supportsSetDescriptionAndMeaning()) {
                    let changed = false;
                    if (transUnit.description() !== masterTransUnit.description()) {
                        transUnit.setDescription(masterTransUnit.description());
                        changed = true;
                    }
                    if (transUnit.meaning() !== masterTransUnit.meaning()) {
                        transUnit.setMeaning(masterTransUnit.meaning());
                        changed = true;
                    }
                    if (changed) {
                        correctDescriptionOrMeaningCount++;
                    }
                }
                lastProcessedUnit = transUnit;
            }
        });
        if (newCount > 0) {
            this.commandOutput.warn('merged %s trans-units from master to "%s"', newCount, lang);
        }
        if (correctSourceContentCount > 0) {
            this.commandOutput.warn('transferred %s changed source content from master to "%s"', correctSourceContentCount, lang);
        }
        if (correctSourceRefCount > 0) {
            this.commandOutput.warn('transferred %s source references from master to "%s"', correctSourceRefCount, lang);
        }
        if (idChangedCount > 0) {
            this.commandOutput.warn('found %s changed id\'s in "%s"', idChangedCount, lang);
        }
        if (correctDescriptionOrMeaningCount > 0) {
            this.commandOutput.warn('transferred %s changed descriptions/meanings from master to "%s"', correctDescriptionOrMeaningCount, lang);
        }
        // remove all elements that are no longer used
        let removeCount = 0;
        languageSpecificMessagesFile.forEachTransUnit((transUnit) => {
            const existsInMaster = !isNullOrUndefined(this.master.transUnitWithId(transUnit.id));
            if (!existsInMaster) {
                if (this.parameters.removeUnusedIds()) {
                    languageSpecificMessagesFile.removeTransUnitWithId(transUnit.id);
                }
                removeCount++;
            }
        });
        if (removeCount > 0) {
            if (this.parameters.removeUnusedIds()) {
                this.commandOutput.warn('removed %s unused trans-units in "%s"', removeCount, lang);
            }
            else {
                this.commandOutput.warn('keeping %s unused trans-units in "%s", because removeUnused is disabled', removeCount, lang);
            }
        }
        if (newCount === 0 && removeCount === 0 && correctSourceContentCount === 0
            && correctSourceRefCount === 0 && correctDescriptionOrMeaningCount === 0) {
            this.commandOutput.info('file for "%s" was up to date', lang);
            return of(null);
        }
        else {
            return this.autoTranslate(this.master.sourceLanguage(), lang, languageSpecificMessagesFile)
                .pipe(map(() => {
                // write it to file
                TranslationMessagesFileReader.save(languageSpecificMessagesFile, this.parameters.beautifyOutput());
                this.commandOutput.info('updated file "%s" for target-language="%s"', languageXliffFilePath, lang);
                if (newCount > 0 && !isDefaultLang) {
                    this.commandOutput.warn('please translate file "%s" to target-language="%s"', languageXliffFilePath, lang);
                }
                return null;
            }));
        }
    }
    /**
     * Handle the case of changed id due to small white space changes.
     * @param masterTransUnit unit in master file
     * @param languageSpecificMessagesFile translation file
     * @param lastProcessedUnit Unit before the one processed here. New unit will be inserted after this one.
     * @return processed unit, if done, null if no changed unit found
     */
    processChangedIdUnit(masterTransUnit, languageSpecificMessagesFile, lastProcessedUnit) {
        let changedTransUnit = null;
        languageSpecificMessagesFile.forEachTransUnit((languageTransUnit) => {
            if (this.areSourcesNearlyEqual(languageTransUnit, masterTransUnit)) {
                changedTransUnit = languageTransUnit;
            }
        });
        if (!changedTransUnit) {
            return null;
        }
        const mergedTransUnit = languageSpecificMessagesFile.importNewTransUnit(masterTransUnit, false, false, (this.parameters.preserveOrder()) ? lastProcessedUnit : undefined);
        const translatedContent = changedTransUnit.targetContent();
        if (translatedContent) { // issue #68 set translated only, if it is really translated
            mergedTransUnit.translate(translatedContent);
            mergedTransUnit.setTargetState(STATE_TRANSLATED);
        }
        return mergedTransUnit;
    }
    /**
     * test wether the sources of 2 trans units are equal ignoring white spaces.
     * @param tu1 tu1
     * @param tu2 tu2
     */
    areSourcesNearlyEqual(tu1, tu2) {
        if ((tu1 && !tu2) || (tu2 && !tu1)) {
            return false;
        }
        const tu1Normalized = tu1.sourceContentNormalized();
        const tu2Normalized = tu2.sourceContentNormalized();
        if (tu1Normalized.isICUMessage()) {
            if (tu2Normalized.isICUMessage()) {
                const icu1Normalized = tu1Normalized.getICUMessage().asNativeString().trim();
                const icu2Normalized = tu2Normalized.getICUMessage().asNativeString().trim();
                return icu1Normalized === icu2Normalized;
            }
            else {
                return false;
            }
        }
        if (tu1Normalized.containsICUMessageRef()) {
            const icuref1Normalized = tu1Normalized.asNativeString().trim();
            const icuref2Normalized = tu2Normalized.asNativeString().trim();
            return icuref1Normalized === icuref2Normalized;
        }
        const s1Normalized = tu1Normalized.asDisplayString(NORMALIZATION_FORMAT_DEFAULT).trim();
        const s2Normalized = tu2Normalized.asDisplayString(NORMALIZATION_FORMAT_DEFAULT).trim();
        return s1Normalized === s2Normalized;
    }
    areSourceReferencesEqual(ref1, ref2) {
        if ((isNullOrUndefined(ref1) && !isNullOrUndefined(ref2)) || (isNullOrUndefined(ref2) && !isNullOrUndefined(ref1))) {
            return false;
        }
        if (isNullOrUndefined(ref1) && isNullOrUndefined(ref2)) {
            return true;
        }
        // bot refs are set now, convert to set to compare them
        const set1 = new Set();
        ref1.forEach((ref) => { set1.add(ref.sourcefile + ':' + ref.linenumber); });
        const set2 = new Set();
        ref2.forEach((ref) => { set2.add(ref.sourcefile + ':' + ref.linenumber); });
        if (set1.size !== set2.size) {
            return false;
        }
        let match = true;
        set2.forEach((ref) => {
            if (!set1.has(ref)) {
                match = false;
            }
        });
        return match;
    }
    /**
     * Auto translate file via Google Translate.
     * Will translate all new units in file.
     * @param from from
     * @param to to
     * @param languageSpecificMessagesFile languageSpecificMessagesFile
     * @return a promise with the execution result as a summary report.
     */
    autoTranslate(from, to, languageSpecificMessagesFile) {
        let serviceCall;
        const autotranslateEnabled = this.parameters.autotranslateLanguage(to);
        if (autotranslateEnabled) {
            serviceCall = this.autoTranslateService.autoTranslate(from, to, languageSpecificMessagesFile);
        }
        else {
            serviceCall = of(new AutoTranslateSummaryReport(from, to));
        }
        return serviceCall.pipe(map((summary) => {
            if (autotranslateEnabled) {
                if (summary.error() || summary.failed() > 0) {
                    this.commandOutput.error(summary.content());
                }
                else {
                    this.commandOutput.warn(summary.content());
                }
            }
            return summary;
        }));
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoieGxpZmYtbWVyZ2UuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi9wcm9qZWN0cy94bGlmZm1lcmdlL3NyYy94bGlmZm1lcmdlL3hsaWZmLW1lcmdlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sRUFBRSxhQUFhLEVBQUUsTUFBTSwwQkFBMEIsQ0FBQztBQUN6RCxPQUFPLEVBQUUsb0JBQW9CLEVBQUUsTUFBTSwwQkFBMEIsQ0FBQztBQUNoRSxPQUFPLEVBQUUsZUFBZSxFQUFFLE1BQU0scUJBQXFCLENBQUM7QUFDdEQsT0FBTyxFQUFFLFFBQVEsRUFBRSxNQUFNLHFCQUFxQixDQUFDO0FBQy9DLE9BQU8sRUFBRSxPQUFPLEVBQUUsTUFBTSxXQUFXLENBQUM7QUFDcEMsT0FBTyxFQUFFLE1BQU0sRUFBRSxNQUFNLE1BQU0sQ0FBQztBQUM5QixPQUFPLEVBQUUsaUJBQWlCLEVBQUUsTUFBTSxnQkFBZ0IsQ0FBQztBQUNuRCxPQUFPLEVBRUgsVUFBVSxFQUFFLFVBQVUsRUFDdEIsNEJBQTRCLEVBQUUsV0FBVyxFQUFFLGdCQUFnQixFQUM5RCxNQUFNLHNDQUFzQyxDQUFDO0FBRTlDLE9BQU8sRUFBRSxxQkFBcUIsRUFBRSxNQUFNLDJCQUEyQixDQUFDO0FBQ2xFLE9BQU8sRUFBRSw2QkFBNkIsRUFBRSxNQUFNLG9DQUFvQyxDQUFDO0FBQ25GLE9BQU8sRUFBYyxFQUFFLEVBQUUsUUFBUSxFQUFFLE1BQU0sTUFBTSxDQUFDO0FBQ2hELE9BQU8sRUFBRSxHQUFHLEVBQUUsVUFBVSxFQUFFLE1BQU0sZ0JBQWdCLENBQUM7QUFDakQsT0FBTyxFQUFFLDhCQUE4QixFQUFFLE1BQU0scURBQXFELENBQUM7QUFDckcsT0FBTyxFQUFFLDBCQUEwQixFQUFFLE1BQU0sZ0RBQWdELENBQUM7QUFFNUY7Ozs7R0FJRztBQUVILE1BQU0sT0FBTyxVQUFVO0lBOEZuQixZQUFZLGFBQTRCLEVBQUUsT0FBdUI7UUFDN0QsSUFBSSxD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QzlDO2FBQ0o7WUFDRCxPQUFPLE9BQU8sQ0FBQztRQUNuQixDQUFDLENBQUMsQ0FBQyxDQUFDO0lBQ1IsQ0FBQztDQUVKIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgQ29tbWFuZE91dHB1dCB9IGZyb20gJy4uL2NvbW1vbi9jb21tYW5kLW91dHB1dCc7XHJcbmltcG9ydCB7IFhsaWZmTWVyZ2VQYXJhbWV0ZXJzIH0gZnJvbSAnLi94bGlmZi1tZXJnZS1wYXJhbWV0ZXJzJztcclxuaW1wb3J0IHsgWGxpZmZNZXJnZUVycm9yIH0gZnJvbSAnLi94bGlmZi1tZXJnZS1lcnJvcic7XHJcbmltcG9ydCB7IEZpbGVVdGlsIH0gZnJvbSAnLi4vY29tbW9uL2ZpbGUtdXRpbCc7XHJcbmltcG9ydCB7IFZFUlNJT04gfSBmcm9tICcuL3ZlcnNpb24nO1xyXG5pbXBvcnQgeyBmb3JtYXQgfSBmcm9tICd1dGlsJztcclxuaW1wb3J0IHsgaXNOdWxsT3JVbmRlZmluZWQgfSBmcm9tICcuLi9jb21tb24vdXRpbCc7XHJcbmltcG9ydCB7XHJcbiAgICBJVHJhbnNsYXRpb25NZXNzYWdlc0ZpbGUsIElUcmFuc1VuaXQsXHJcbiAgICBGT1JNQVRfWE1CLCBGT1JNQVRfWFRCLFxyXG4gICAgTk9STUFMSVpBVElPTl9GT1JNQVRfREVGQVVMVCwgU1RBVEVfRklOQUwsIFNUQVRFX1RSQU5TTEFURURcclxufSBmcm9tICdAbmd4LWkxOG5zdXBwb3J0L25neC1pMThuc3VwcG9ydC1saWInO1xyXG5pbXBvcnQgeyBQcm9ncmFtT3B0aW9ucywgSUNvbmZpZ0ZpbGUgfSBmcm9tICcuL2kteGxpZmYtbWVyZ2Utb3B0aW9ucyc7XHJcbmltcG9ydCB7IE5neFRyYW5zbGF0ZUV4dHJhY3RvciB9IGZyb20gJy4vbmd4LXRyYW5zbGF0ZS1leHRyYWN0b3InO1xyXG5pbXBvcnQgeyBUcmFuc2xhdGlvbk1lc3NhZ2VzRmlsZVJlYWRlciB9IGZyb20gJy4vdHJhbnNsYXRpb24tbWVzc2FnZXMtZmlsZS1yZWFkZXInO1xyXG5pbXBvcnQgeyBPYnNlcnZhYmxlLCBvZiwgZm9ya0pvaW4gfSBmcm9tICdyeGpzJztcclxuaW1wb3J0IHsgbWFwLCBjYXRjaEVycm9yIH0gZnJvbSAncnhqcy9vcGVyYXRvcnMnO1xyXG5pbXBvcnQgeyBYbGlmZk1lcmdlQXV0b1RyYW5zbGF0ZVNlcnZpY2UgfSBmcm9tICcuLi9hdXRvdHJhbnNsYXRlL3hsaWZmLW1lcmdlLWF1dG8tdHJhbnNsYXRlLXNlcnZpY2UnO1xyXG5pbXBvcnQgeyBBdXRvVHJhbnNsYXRlU3VtbWFyeVJlcG9ydCB9IGZyb20gJy4uL2F1dG90cmFuc2xhdGUvYXV0by10cmFuc2xhdGUtc3VtbWFyeS1yZXBvcnQnO1xyXG5cclxuLyoqXHJcbiAqIENyZWF0ZWQgYnkgbWFydGluIG9uIDE3LjAyLjIwMTcuXHJcbiAqIFhsaWZmTWVyZ2UgLSByZWFkIHhsaWZmIG9yIHhtYiBmaWxlIGFuZCBwdXQgdW50cmFuc2xhdGVkIHBhcnRzIGluIGxhbmd1YWdlIHNwZWNpZmljIHhsaWZmIG9yIHhtYiBmaWxlcy5cclxuICpcclxuICovXHJcblxyXG5leHBvcnQgY2xhc3MgWGxpZmZNZXJnZSB7XHJcblxyXG4gICAgcHJpdmF0ZSByZWFkb25seSBjb21tYW5kT3V0cHV0OiBDb21tYW5kT3V0cHV0O1xyXG5cclxuICAgIHByaXZhdGUgcmVhZG9ubHkgb3B0aW9uczogUHJvZ3JhbU9wdGlvbnM7XHJcblxyXG4gICAgcHJpdmF0ZSBwYXJhbWV0ZXJzOiBYbGlmZk1lcmdlUGFyYW1ldGVycztcclxuXHJcbiAgICAvKipcclxuICAgICAqIFRoZSByZWFkIG1hc3RlciB4bGYgZmlsZS5cclxuICAgICAqL1xyXG4gICAgcHJpdmF0ZSBtYXN0ZXI6IElUcmFuc2xhdGlvbk1lc3NhZ2VzRmlsZTsgLy8gWGxpZmZGaWxlIG9yIFhsaWZmMkZpbGUgb3IgWG1iRmlsZVxyXG5cclxuICAgIHByaXZhdGUgYXV0b1RyYW5zbGF0ZVNlcnZpY2U6IFhsaWZmTWVyZ2VBdXRvVHJhbnNsYXRlU2VydmljZTtcclxuXHJcbiAgICBzdGF0aWMgbWFpbihhcmd2OiBzdHJpbmdbXSkge1xyXG4gICAgICAgIGNvbnN0IG9wdGlvbnMgPSBYbGlmZk1lcmdlLnBhcnNlQXJncyhhcmd2KTtcclxuICAgICAgICBpZiAob3B0aW9ucykge1xyXG4gICAgICAgICAgICBuZXcgWGxpZmZNZXJnZShuZXcgQ29tbWFuZE91dHB1dChwcm9jZXNzLnN0ZG91dCksIG9wdGlvbnMpLnJ1bigocmVzdWx0KSA9PiB7XHJcbiAgICAgICAgICAgICAgICBwcm9jZXNzLmV4aXQocmVzdWx0KTtcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIHN0YXRpYyBwYXJzZUFyZ3MoYXJndjogc3RyaW5nW10pOiBQcm9ncmFtT3B0aW9ucyB7XHJcbiAgICAgICAgY29uc3Qgb3B0aW9uczogUHJvZ3JhbU9wdGlvbnMgPSB7XHJcbiAgICAgICAgICAgIGxhbmd1YWdlczogW11cclxuICAgICAgICB9O1xyXG4gICAgICAgIGZvciAobGV0IGkgPSAxOyBpIDwgYXJndi5sZW5ndGg7IGkrKykge1xyXG4gICAgICAgICAgICBjb25zdCBhcmcgPSBhcmd2W2ldO1xyXG4gICAgICAgICAgICBpZiAoYXJnID09PSAnLS12ZXJzaW9uJyB8fCBhcmcgPT09ICctdmVyc2lvbicpIHtcclxuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKCd4bGlmZm1lcmdlICcgKyBWRVJTSU9OKTtcclxuICAgICAgICAgICAgfSBlbHNlIGlmIChhcmcgPT09ICctLXZlcmJvc2UnIHx8IGFyZyA9PT0gJy12Jykge1xyXG4gICAgICAgICAgICAgICAgb3B0aW9ucy52ZXJib3NlID0gdHJ1ZTtcclxuICAgICAgICAgICAgfSBlbHNlIGlmIChhcmcgPT09ICctLXByb2ZpbGUnIHx8IGFyZyA9PT0gJy1wJykge1xyXG4gICAgICAgICAgICAgICAgaSsrO1xyXG4gICAgICAgICAgICAgICAgaWYgKGkgPj0gYXJndi5sZW5ndGgpIHtcclxuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZygnbWlzc2luZyBjb25maWcgZmlsZScpO1xyXG4gICAgICAgICAgICAgICAgICAgIFhsaWZmTWVyZ2Uuc2hvd1VzYWdlKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIG51bGw7XHJcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgIG9wdGlvbnMucHJvZmlsZVBhdGggPSBhcmd2W2ldO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9IGVsc2UgaWYgKGFyZyA9PT0gJy0tcXVpZXQnIHx8IGFyZyA9PT0gJy1xJykge1xyXG4gICAgICAgICAgICAgICAgb3B0aW9ucy5xdWlldCA9IHRydWU7XHJcbiAgICAgICAgICAgIH0gZWxzZSBpZiAoYXJnID09PSAnLS1sYW5ndWFnZScgfHwgYXJnID09PSAnLWwnKSB7XHJcbiAgICAgICAgICAgICAgICBpKys7XHJcbiAgICAgICAgICAgICAgICBpZiAoaSA+PSBhcmd2Lmxlbmd0aCkge1xyXG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKCdtaXNzaW5nIGxhbmd1YWdlJyk7XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIG51bGw7XHJcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgIGlmIChhcmd2W2ldLmluZGV4T2YoJywnKSAhPT0gLTEpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgbmV3TG9jYWwgPSBhcmd2W2ldLnNwbGl0KCcsJyk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIG9wdGlvbnMubGFuZ3VhZ2VzLnB1c2goLi4ubmV3TG9jYWwpO1xyXG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIG9wdGlvbnMubGFuZ3VhZ2VzLnB1c2goYXJndltpXSk7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9IGVsc2UgaWYgKGFyZyA9PT0gJy0taGVscCcgfHwgYXJnID09PSAnLWhlbHAnIHx8IGFyZyA9PT0gJy1oJykge1xyXG4gICAgICAgICAgICAgICAgWGxpZmZNZXJnZS5zaG93VXNhZ2UoKTtcclxuICAgICAgICAgICAgfSBlbHNlIGlmIChhcmcubGVuZ3RoID4gMCAmJiBhcmcuY2hhckF0KDApID09PSAnLScpIHtcclxuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKCd1bmtub3duIG9wdGlvbicpO1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIG51bGw7XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAvL29wdGlvbnMubGFuZ3VhZ2VzLnB1c2goYXJnKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gb3B0aW9ucztcclxuICAgIH1cclxuXHJcbiAgICBzdGF0aWMgc2hvd1VzYWdlKCkge1xyXG4gICAgICAgIGNvbnNvbGUubG9nKCd1c2FnZTogeGxpZmZtZXJnZSA8b3B0aW9uPiogPGxhbmd1YWdlPionKTtcclxuICAgICAgICBjb25zb2xlLmxvZygnT3B0aW9ucycpO1xyXG4gICAgICAgIGNvbnNvbGUubG9nKCdcXHQtcHwtLXByb2ZpbGUgYSBqc29uIGNvbmZpZ3VyYXRpb24gZmlsZSBjb250YWluaW5nIGFsbCByZWxldmFudCBwYXJhbWV0ZXJzLicpO1xyXG4gICAgICAgIGNvbnNvbGUubG9nKCdcXHRcXHRmb3IgZGV0YWlscyBwbGVhc2UgY29uc3VsdCB0aGUgaG9tZSBwYWdlIGh0dHBzOi8vZ2l0aHViLmNvbS9tYXJ0aW5yb29iL25neC1pMThuc3VwcG9ydCcpO1xyXG4gICAgICAgIGNvbnNvbGUubG9nKCdcXHQtdnwtLXZlcmJvc2Ugc2hvdyBzb21lIG91dHB1dCBmb3IgZGVidWdnaW5nIHB1cnBvc2VzJyk7XHJcbiAgICAgICAgY29uc29sZS5sb2coJ1xcdC1xfC0tcXVpZXQgb25seSBzaG93IGVycm9ycywgbm90aGluZyBlbHNlJyk7XHJcbiAgICAgICAgY29uc29sZS5sb2coJ1xcdC12ZXJzaW9ufC0tdmVyc2lvbiBzaG93IHZlcnNpb24gc3RyaW5nJyk7XHJcbiAgICAgICAgY29uc29sZS5sb2coJycpO1xyXG4gICAgICAgIGNvbnNvbGUubG9nKCdcXHQ8bGFuZ3VhZ2U+IGhhcyB0byBiZSBhIHZhbGlkIGxhbmd1YWdlIHNob3J0IHN0cmluZywgZSxnLiBcImVuXCIsIFwiZGVcIiwgXCJkZS1jaFwiJyk7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBGb3IgVGVzdHMsIGNyZWF0ZSBpbnN0YW5jZSB3aXRoIGdpdmVuIHByb2ZpbGVcclxuICAgICAqIEBwYXJhbSBjb21tYW5kT3V0cHV0IGNvbW1hbmRPdXRwdXRcclxuICAgICAqIEBwYXJhbSBvcHRpb25zIG9wdGlvbnNcclxuICAgICAqIEBwYXJhbSBwcm9maWxlQ29udGVudCBwcm9maWxlQ29udGVudFxyXG4gICAgICovXHJcbiAgICBwdWJsaWMgc3RhdGljIGNyZWF0ZUZyb21PcHRpb25zKGNvbW1hbmRPdXRwdXQ6IENvbW1hbmRPdXRwdXQsIG9wdGlvbnM6IFByb2dyYW1PcHRpb25zLCBwcm9maWxlQ29udGVudD86IElDb25maWdGaWxlKSB7XHJcbiAgICAgICAgY29uc3QgaW5zdGFuY2UgPSBuZXcgWGxpZmZNZXJnZShjb21tYW5kT3V0cHV0LCBvcHRpb25zKTtcclxuICAgICAgICBpbnN0YW5jZS5wYXJhbWV0ZXJzID0gWGxpZmZNZXJnZVBhcmFtZXRlcnMuY3JlYXRlRnJvbU9wdGlvbnMob3B0aW9ucywgcHJvZmlsZUNvbnRlbnQpO1xyXG4gICAgICAgIHJldHVybiBpbnN0YW5jZTtcclxuICAgIH1cclxuXHJcbiAgICBjb25zdHJ1Y3Rvcihjb21tYW5kT3V0cHV0OiBDb21tYW5kT3V0cHV0LCBvcHRpb25zOiBQcm9ncmFtT3B0aW9ucykge1xyXG4gICAgICAgIHRoaXMuY29tbWFuZE91dHB1dCA9IGNvbW1hbmRPdXRwdXQ7XHJcbiAgICAgICAgdGhpcy5vcHRpb25zID0gb3B0aW9ucztcclxuICAgICAgICB0aGlzLnBhcmFtZXRlcnMgPSBudWxsO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogUnVuIHRoZSBjb21tYW5kLlxyXG4gICAgICogVGhpcyBydW5zIGFzeW5jLlxyXG4gICAgICogQHBhcmFtIGNhbGxiYWNrRnVuY3Rpb24gd2hlbiBjb21tYW5kIGlzIGV4ZWN1dGVkLCBjYWxsZWQgd2l0aCB0aGUgcmV0dXJuIGNvZGUgKDAgZm9yIG9rKSwgaWYgZ2l2ZW4uXHJcbiAgICAgKiBAcGFyYW0gZXJyb3JGdW5jdGlvbiBjYWxsYmFja0Z1bmN0aW9uIGZvciBlcnJvciBoYW5kbGluZ1xyXG4gICAgICovXHJcbiAgICBwdWJsaWMgcnVuKGNhbGxiYWNrRnVuY3Rpb24/OiAoKHJldGNvZGU6IG51bWJlcikgPT4gYW55KSwgZXJyb3JGdW5jdGlvbj86ICgoZXJyb3I6IGFueSkgPT4gYW55KSkge1xyXG4gICAgICAgIHRoaXMucnVuQXN5bmMoKVxyXG4gICAgICAgICAgICAuc3Vic2NyaWJlKChyZXRjb2RlOiBudW1iZXIpID0+IHtcclxuICAgICAgICAgICAgICAgIGlmICghaXNOdWxsT3JVbmRlZmluZWQoY2FsbGJhY2tGdW5jdGlvbikpIHtcclxuICAgICAgICAgICAgICAgICAgICBjYWxsYmFja0Z1bmN0aW9uKHJldGNvZGUpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9LCAoZXJyb3IpID0+IHtcclxuICAgICAgICAgICAgICAgIGlmICghaXNOdWxsT3JVbmRlZmluZWQoZXJyb3JGdW5jdGlvbikpIHtcclxuICAgICAgICAgICAgICAgICAgICBlcnJvckZ1bmN0aW9uKGVycm9yKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSk7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBFeGVjdXRlIG1lcmdlLVByb2Nlc3MuXHJcbiAgICAgKiBAcmV0dXJuIEFzeW5jIG9wZXJhdGlvbiwgb24gY29tcGxldGlvbiByZXR1cm5zIHJldGNvZGUgMD1vaywgb3RoZXIgPSBlcnJvci5cclxuICAgICAqL1xyXG4gICAgcHVibGljIHJ1bkFzeW5jKCk6IE9ic2VydmFibGU8bnVtYmVyPiB7XHJcbiAgICAgICAgaWYgKHRoaXMub3B0aW9ucyAmJiB0aGlzLm9wdGlvbnMucXVpZXQpIHtcclxuICAgICAgICAgICAgdGhpcy5jb21tYW5kT3V0cHV0LnNldFF1aWV0KCk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmICh0aGlzLm9wdGlvbnMgJiYgdGhpcy5vcHRpb25zLnZlcmJvc2UpIHtcclxuICAgICAgICAgICAgdGhpcy5jb21tYW5kT3V0cHV0LnNldFZlcmJvc2UoKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKCF0aGlzLnBhcmFtZXRlcnMpIHtcclxuICAgICAgICAgICAgdGhpcy5wYXJhbWV0ZXJzID0gWGxpZmZNZXJnZVBhcmFtZXRlcnMuY3JlYXRlRnJvbU9wdGlvbnModGhpcy5vcHRpb25zKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgdGhpcy5jb21tYW5kT3V0cHV0LmluZm8oJ3hsaWZmbWVyZ2UgdmVyc2lvbiAlcycsIFZFUlNJT04pO1xyXG4gICAgICAgIGlmICh0aGlzLnBhcmFtZXRlcnMudmVyYm9zZSgpKSB7XHJcbiAgICAgICAgICAgIHRoaXMucGFyYW1ldGVycy5zaG93QWxsUGFyYW1ldGVycyh0aGlzLmNvbW1hbmRPdXRwdXQpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAodGhpcy5wYXJhbWV0ZXJzLmVycm9yc0ZvdW5kLmxlbmd0aCA+IDApIHtcclxuICAgICAgICAgICAgZm9yIChjb25zdCBlcnIgb2YgdGhpcy5wYXJhbWV0ZXJzLmVycm9yc0ZvdW5kKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmNvbW1hbmRPdXRwdXQuZXJyb3IoZXJyLm1lc3NhZ2UpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHJldHVybiBvZigtMSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmICh0aGlzLnBhcmFtZXRlcnMud2FybmluZ3NGb3VuZC5sZW5ndGggPiAwKSB7XHJcbiAgICAgICAgICAgIGZvciAoY29uc3Qgd2FybiBvZiB0aGlzLnBhcmFtZXRlcnMud2FybmluZ3NGb3VuZCkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5jb21tYW5kT3V0cHV0Lndhcm4od2Fybik7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgdGhpcy5yZWFkTWFzdGVyKCk7XHJcbiAgICAgICAgaWYgKHRoaXMucGFyYW1ldGVycy5hdXRvdHJhbnNsYXRlKCkpIHtcclxuICAgICAgICAgICAgdGhpcy5hdXRvVHJhbnNsYXRlU2VydmljZSA9IG5ldyBYbGlmZk1lcmdlQXV0b1RyYW5zbGF0ZVNlcnZpY2UodGhpcy5wYXJhbWV0ZXJzLmFwaWtleSgpKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgY29uc3QgZXhlY3V0aW9uRm9yQWxsTGFuZ3VhZ2VzOiBPYnNlcnZhYmxlPG51bWJlcj5bXSA9IFtdO1xyXG4gICAgICAgIHRoaXMucGFyYW1ldGVycy5sYW5ndWFnZXMoKS5mb3JFYWNoKChsYW5nOiBzdHJpbmcpID0+IHtcclxuICAgICAgICAgICAgZXhlY3V0aW9uRm9yQWxsTGFuZ3VhZ2VzLnB1c2godGhpcy5wcm9jZXNzTGFuZ3VhZ2UobGFuZykpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIHJldHVybiBmb3JrSm9pbihleGVjdXRpb25Gb3JBbGxMYW5ndWFnZXMpLnBpcGUoXHJcbiAgICAgICAgICAgIG1hcCgocmV0Y29kZXM6IG51bWJlcltdKSA9PiB0aGlzLnRvdGFsUmV0Y29kZShyZXRjb2RlcykpKTtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIEdpdmUgYW4gYXJyYXkgb2YgcmV0Y29kZXMgZm9yIHRoZSBkaWZmZXJlbnQgbGFuZ3VhZ2VzLCByZXR1cm4gdGhlIHRvdGFsIHJldGNvZGUuXHJcbiAgICAgKiBJZiBhbGwgYXJlIDAsIGl0IGlzIDAsIG90aGVyd2lzZSB0aGUgZmlyc3Qgbm9uIHplcm8uXHJcbiAgICAgKiBAcGFyYW0gcmV0Y29kZXMgcmV0Y29kZXNcclxuICAgICAqIEByZXR1cm4gbnVtYmVyXHJcbiAgICAgKi9cclxuICAgIHByaXZhdGUgdG90YWxSZXRjb2RlKHJldGNvZGVzOiBudW1iZXJbXSk6IG51bWJlciB7XHJcbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCByZXRjb2Rlcy5sZW5ndGg7IGkrKykge1xyXG4gICAgICAgICAgICBpZiAocmV0Y29kZXNbaV0gIT09IDApIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiByZXRjb2Rlc1tpXTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gMDtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIFJldHVybiB0aGUgbmFtZSBvZiB0aGUgZ2VuZXJhdGVkIGZpbGUgZm9yIGdpdmVuIGxhbmcuXHJcbiAgICAgKiBAcGFyYW0gbGFuZyBsYW5ndWFnZVxyXG4gICAgICogQHJldHVybiBuYW1lIG9mIGdlbmVyYXRlZCBmaWxlXHJcbiAgICAgKi9cclxuICAgIHB1YmxpYyBnZW5lcmF0ZWRJMThuRmlsZShsYW5nOiBzdHJpbmcpOiBzdHJpbmcge1xyXG4gICAgICAgIHJldHVybiB0aGlzLnBhcmFtZXRlcnMuZ2VuZXJhdGVkSTE4bkZpbGUobGFuZyk7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBSZXR1cm4gdGhlIG5hbWUgb2YgdGhlIGdlbmVyYXRlZCBuZ3gtdHJhbnNsYXRpb24gZmlsZSBmb3IgZ2l2ZW4gbGFuZy5cclxuICAgICAqIEBwYXJhbSBsYW5nIGxhbmd1YWdlXHJcbiAgICAgKiBAcmV0dXJuIG5hbWUgb2YgdHJhbnNsYXRlIGZpbGVcclxuICAgICAqL1xyXG4gICAgcHVibGljIGdlbmVyYXRlZE5neFRyYW5zbGF0ZUZpbGUobGFuZzogc3RyaW5nKTogc3RyaW5nIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5wYXJhbWV0ZXJzLmdlbmVyYXRlZE5neFRyYW5zbGF0ZUZpbGUobGFuZyk7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBXYXJuaW5ncyBmb3VuZCBkdXJpbmcgdGhlIHJ1bi5cclxuICAgICAqIEByZXR1cm4gd2FybmluZ3NcclxuICAgICAqL1xyXG4gICAgcHVibGljIHdhcm5pbmdzKCk6IHN0cmluZ1tdIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5wYXJhbWV0ZXJzLndhcm5pbmdzRm91bmQ7XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSByZWFkTWFzdGVyKCkge1xyXG4gICAgICAgIHRyeSB7XHJcbiAgICAgICAgICAgIHRoaXMubWFzdGVyID0gVHJhbnNsYXRpb25NZXNzYWdlc0ZpbGVSZWFkZXIuZnJvbUZpbGUoXHJcbiAgICAgICAgICAgICAgICB0aGlzLnBhcmFtZXRlcnMuaTE4bkZvcm1hdCgpLFxyXG4gICAgICAgICAgICAgICAgdGhpcy5wYXJhbWV0ZXJzLmkxOG5GaWxlKCksXHJcbiAgICAgICAgICAgICAgICB0aGlzLnBhcmFtZXRlcnMuZW5jb2RpbmcoKSk7XHJcbiAgICAgICAgICAgIHRoaXMubWFzdGVyLndhcm5pbmdzKCkuZm9yRWFjaCgod2FybmluZzogc3RyaW5nKSA9PiB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmNvbW1hbmRPdXRwdXQud2Fybih3YXJuaW5nKTtcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIGNvbnN0IGNvdW50ID0gdGhpcy5tYXN0ZXIubnVtYmVyT2ZUcmFuc1VuaXRzKCk7XHJcbiAgICAgICAgICAgIGNvbnN0IG1pc3NpbmdJZENvdW50ID0gdGhpcy5tYXN0ZXIubnVtYmVyT2ZUcmFuc1VuaXRzV2l0aE1pc3NpbmdJZCgpO1xyXG4gICAgICAgICAgICB0aGlzLmNvbW1hbmRPdXRwdXQuaW5mbygnbWFzdGVyIGNvbnRhaW5zICVzIHRyYW5zLXVuaXRzJywgY291bnQpO1xyXG4gICAgICAgICAgICBpZiAobWlzc2luZ0lkQ291bnQgPiAwKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmNvbW1hbmRPdXRwdXQud2FybignbWFzdGVyIGNvbnRhaW5zICVzIHRyYW5zLXVuaXRzLCBidXQgdGhlcmUgYXJlICVzIHdpdGhvdXQgaWQnLCBjb3VudCwgbWlzc2luZ0lkQ291bnQpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGNvbnN0IHNvdXJjZUxhbmc6IHN0cmluZyA9IHRoaXMubWFzdGVyLnNvdXJjZUxhbmd1YWdlKCk7XHJcbiAgICAgICAgICAgIGlmIChzb3VyY2VMYW5nICYmIHNvdXJjZUxhbmcgIT09IHRoaXMucGFyYW1ldGVycy5kZWZhdWx0TGFuZ3VhZ2UoKSkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5jb21tYW5kT3V0cHV0Lndhcm4oXHJcbiAgICAgICAgICAgICAgICAgICAgJ21hc3RlciBzYXlzIHRvIGhhdmUgc291cmNlLWxhbmd1YWdlPVwiJXNcIiwgc2hvdWxkIGJlIFwiJXNcIiAoeW91ciBkZWZhdWx0TGFuZ3VhZ2UpJyxcclxuICAgICAgICAgICAgICAgICAgICBzb3VyY2VMYW5nLFxyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMucGFyYW1ldGVycy5kZWZhdWx0TGFuZ3VhZ2UoKSk7XHJcbiAgICAgICAgICAgICAgICB0aGlzLm1hc3Rlci5zZXRTb3VyY2VMYW5ndWFnZSh0aGlzLnBhcmFtZXRlcnMuZGVmYXVsdExhbmd1YWdlKCkpO1xyXG4gICAgICAgICAgICAgICAgVHJhbnNsYXRpb25NZXNzYWdlc0ZpbGVSZWFkZXIuc2F2ZSh0aGlzLm1hc3RlciwgdGhpcy5wYXJhbWV0ZXJzLmJlYXV0aWZ5T3V0cHV0KCkpO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5jb21tYW5kT3V0cHV0Lndhcm4oJ2NoYW5nZWQgbWFzdGVyIHNvdXJjZS1sYW5ndWFnZT1cIiVzXCIgdG8gXCIlc1wiJywgc291cmNlTGFuZywgdGhpcy5wYXJhbWV0ZXJzLmRlZmF1bHRMYW5ndWFnZSgpKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0gY2F0Y2ggKGVycikge1xyXG4gICAgICAgICAgICBpZiAoZXJyIGluc3RhbmNlb2YgWGxpZmZNZXJnZUVycm9yKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmNvbW1hbmRPdXRwdXQuZXJyb3IoZXJyLm1lc3NhZ2UpO1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIG9mKC0xKTtcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIC8vIHVuaGFuZGxlZFxyXG4gICAgICAgICAgICAgICAgY29uc3QgY3VycmVudEZpbGVuYW1lID0gdGhpcy5wYXJhbWV0ZXJzLmkxOG5GaWxlKCk7XHJcbiAgICAgICAgICAgICAgICBjb25zdCBmaWxlbmFtZVN0cmluZyA9IChjdXJyZW50RmlsZW5hbWUpID8gZm9ybWF0KCdmaWxlIFwiJXNcIiwgJywgY3VycmVudEZpbGVuYW1lKSA6ICcnO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5jb21tYW5kT3V0cHV0LmVycm9yKGZpbGVuYW1lU3RyaW5nICsgJ29vcHMgJyArIGVycik7XHJcbiAgICAgICAgICAgICAgICB0aHJvdyBlcnI7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBQcm9jZXNzIHRoZSBnaXZlbiBsYW5ndWFnZS5cclxuICAgICAqIEFzeW5jIG9wZXJhdGlvbi5cclxuICAgICAqIEBwYXJhbSBsYW5nIGxhbmd1YWdlXHJcbiAgICAgKiBAcmV0dXJuIG9uIGNvbXBsZXRpb24gMCBmb3Igb2ssIG90aGVyIGZvciBlcnJvclxyXG4gICAgICovXHJcbiAgICBwcml2YXRlIHByb2Nlc3NMYW5ndWFnZShsYW5nOiBzdHJpbmcpOiBPYnNlcnZhYmxlPG51bWJlcj4ge1xyXG4gICAgICAgIHRoaXMuY29tbWFuZE91dHB1dC5kZWJ1ZygncHJvY2Vzc2luZyBsYW5ndWFnZSAlcycsIGxhbmcpO1xyXG4gICAgICAgIGNvbnN0IGxhbmd1YWdlWGxpZmZGaWxlID0gdGhpcy5wYXJhbWV0ZXJzLmdlbmVyYXRlZEkxOG5GaWxlKGxhbmcpO1xyXG4gICAgICAgIGNvbnN0IGN1cnJlbnRGaWxlbmFtZSA9IGxhbmd1YWdlWGxpZmZGaWxlO1xyXG4gICAgICAgIGxldCByZXN1bHQ6IE9ic2VydmFibGU8dm9pZD47XHJcbiAgICAgICAgaWYgKCFGaWxlVXRpbC5leGlzdHMobGFuZ3VhZ2VYbGlmZkZpbGUpKSB7XHJcbiAgICAgICAgICAgIHJlc3VsdCA9IHRoaXMuY3JlYXRlVW50cmFuc2xhdGVkWGxpZmYobGFuZywgbGFuZ3VhZ2VYbGlmZkZpbGUpO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIHJlc3VsdCA9IHRoaXMubWVyZ2VNYXN0ZXJUbyhsYW5nLCBsYW5ndWFnZVhsaWZmRmlsZSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiByZXN1bHRcclxuICAgICAgICAgICAgLnBpcGUobWFwKCgpID0+IHtcclxuICAgICAgICAgICAgICAgIGlmICh0aGlzLnBhcmFtZXRlcnMuc3VwcG9ydE5neFRyYW5zbGF0ZSgpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgbGFuZ3VhZ2VTcGVjaWZpY01lc3NhZ2VzRmlsZTogSVRyYW5zbGF0aW9uTWVzc2FnZXNGaWxlID1cclxuICAgICAgICAgICAgICAgICAgICAgICAgVHJhbnNsYXRpb25NZXNzYWdlc0ZpbGVSZWFkZXIuZnJvbUZpbGUoXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnRyYW5zbGF0aW9uRm9ybWF0KHRoaXMucGFyYW1ldGVycy5pMThuRm9ybWF0KCkpLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbGFuZ3VhZ2VYbGlmZkZpbGUsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnBhcmFtZXRlcnMuZW5jb2RpbmcoKSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMubWFzdGVyLmZpbGVuYW1lKCkpO1xyXG4gICAgICAgICAgICAgICAgICAgIE5neFRyYW5zbGF0ZUV4dHJhY3Rvci5leHRyYWN0KFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBsYW5ndWFnZVNwZWNpZmljTWVzc2FnZXNGaWxlLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnBhcmFtZXRlcnMubmd4VHJhbnNsYXRlRXh0cmFjdGlvblBhdHRlcm4oKSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5wYXJhbWV0ZXJzLmdlbmVyYXRlZE5neFRyYW5zbGF0ZUZpbGUobGFuZykpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgcmV0dXJuIDA7XHJcbiAgICAgICAgICAgIH0pLCBjYXRjaEVycm9yKChlcnIpID0+IHtcclxuICAgICAgICAgICAgICAgIGlmIChlcnIgaW5zdGFuY2VvZiBYbGlmZk1lcmdlRXJyb3IpIHtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLmNvbW1hbmRPdXRwdXQuZXJyb3IoZXJyLm1lc3NhZ2UpO1xyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBvZigtMSk7XHJcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgIC8vIHVuaGFuZGxlZFxyXG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IGZpbGVuYW1lU3RyaW5nID0gKGN1cnJlbnRGaWxlbmFtZSkgPyBmb3JtYXQoJ2ZpbGUgXCIlc1wiLCAnLCBjdXJyZW50RmlsZW5hbWUpIDogJyc7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5jb21tYW5kT3V0cHV0LmVycm9yKGZpbGVuYW1lU3RyaW5nICsgJ29vcHMgJyArIGVycik7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhyb3cgZXJyO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9KSk7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBjcmVhdGUgYSBuZXcgZmlsZSBmb3IgdGhlIGxhbmd1YWdlLCB3aGljaCBjb250YWlucyBubyB0cmFuc2xhdGlvbnMsIGJ1dCBhbGwga2V5cy5cclxuICAgICAqIGluIHByaW5jaXBsZSwgdGhpcyBpcyBqdXN0IGEgY29weSBvZiB0aGUgbWFzdGVyIHdpdGggdGFyZ2V0LWxhbmd1YWdlIHNldC5cclxuICAgICAqIEBwYXJhbSBsYW5nIGxhbmd1YWdlXHJcbiAgICAgKiBAcGFyYW0gbGFuZ3VhZ2VYbGlmZkZpbGVQYXRoIG5hbWUgb2YgZmlsZVxyXG4gICAgICovXHJcbiAgICBwcml2YXRlIGNyZWF0ZVVudHJhbnNsYXRlZFhsaWZmKGxhbmc6IHN0cmluZywgbGFuZ3VhZ2VYbGlmZkZpbGVQYXRoOiBzdHJpbmcpOiBPYnNlcnZhYmxlPHZvaWQ+IHtcclxuICAgICAgICAvLyBjb3B5IG1hc3RlciAuLi5cclxuICAgICAgICAvLyBhbmQgc2V0IHRhcmdldC1sYW5ndWFnZVxyXG4gICAgICAgIC8vIGFuZCBjb3B5IHNvdXJjZSB0byB0YXJnZXQgaWYgbmVjZXNzYXJ5XHJcbiAgICAgICAgY29uc3QgaXNEZWZhdWx0TGFuZzogYm9vbGVhbiA9IChsYW5nID09PSB0aGlzLnBhcmFtZXRlcnMuZGVmYXVsdExhbmd1YWdlKCkpO1xyXG4gICAgICAgIHRoaXMubWFzdGVyLnNldE5ld1RyYW5zVW5pdFRhcmdldFByYWVmaXgodGhpcy5wYXJhbWV0ZXJzLnRhcmdldFByYWVmaXgoKSk7XHJcbiAgICAgICAgdGhpcy5tYXN0ZXIuc2V0TmV3VHJhbnNVbml0VGFyZ2V0U3VmZml4KHRoaXMucGFyYW1ldGVycy50YXJnZXRTdWZmaXgoKSk7XHJcbiAgICAgICAgbGV0IG9wdGlvbmFsTWFzdGVyO1xyXG4gICAgICAgIGNvbnN0IG9wdGlvbmFsTWFzdGVyRmlsZVBhdGggPSBpc0RlZmF1bHRMYW5nID8gdGhpcy5wYXJhbWV0ZXJzLm9wdGlvbmFsTWFzdGVyRmlsZVBhdGgoKSA6IHRoaXMucGFyYW1ldGVycy5vcHRpb25hbE1hc3RlckZpbGVQYXRoKGxhbmcpO1xyXG4gICAgICAgIGlmIChvcHRpb25hbE1hc3RlckZpbGVQYXRoKSB7XHJcbiAgICAgICAgICAgIG9wdGlvbmFsTWFzdGVyID0gVHJhbnNsYXRpb25NZXNzYWdlc0ZpbGVSZWFkZXIubWFzdGVyRmlsZUNvbnRlbnQob3B0aW9uYWxNYXN0ZXJGaWxlUGF0aCwgdGhpcy5wYXJhbWV0ZXJzLmVuY29kaW5nKCkpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBjb25zdCBsYW5ndWFnZVNwZWNpZmljTWVzc2FnZXNGaWxlOiBJVHJhbnNsYXRpb25NZXNzYWdlc0ZpbGUgPVxyXG4gICAgICAgICAgICB0aGlzLm1hc3Rlci5jcmVhdGVUcmFuc2xhdGlvbkZpbGVGb3JMYW5nKGxhbmcsIGxhbmd1YWdlWGxpZmZGaWxlUGF0aCwgaXNEZWZhdWx0TGFuZywgdGhpcy5wYXJhbWV0ZXJzLnVzZVNvdXJjZUFzVGFyZ2V0KCksIG9wdGlvbmFsTWFzdGVyKTtcclxuICAgICAgICByZXR1cm4gdGhpcy5hdXRvVHJhbnNsYXRlKHRoaXMubWFzdGVyLnNvdXJjZUxhbmd1YWdlKCksIGxhbmcsIGxhbmd1YWdlU3BlY2lmaWNNZXNzYWdlc0ZpbGUpLnBpcGUoXHJcbiAgICAgICAgICAgIG1hcCgoLyogc3VtbWFyeSAqLykgPT4ge1xyXG4gICAgICAgICAgICAgICAgLy8gd3JpdGUgaXQgdG8gZmlsZVxyXG4gICAgICAgICAgICAgICAgVHJhbnNsYXRpb25NZXNzYWdlc0ZpbGVSZWFkZXIuc2F2ZShsYW5ndWFnZVNwZWNpZmljTWVzc2FnZXNGaWxlLCB0aGlzLnBhcmFtZXRlcnMuYmVhdXRpZnlPdXRwdXQoKSk7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmNvbW1hbmRPdXRwdXQuaW5mbygnY3JlYXRlZCBuZXcgZmlsZSBcIiVzXCIgZm9yIHRhcmdldC1sYW5ndWFnZT1cIiVzXCInLCBsYW5ndWFnZVhsaWZmRmlsZVBhdGgsIGxhbmcpO1xyXG4gICAgICAgICAgICAgICAgaWYgKCFpc0RlZmF1bHRMYW5nKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5jb21tYW5kT3V0cHV0Lndhcm4oJ3BsZWFzZSB0cmFuc2xhdGUgZmlsZSBcIiVzXCIgdG8gdGFyZ2V0LWxhbmd1YWdlPVwiJXNcIicsIGxhbmd1YWdlWGxpZmZGaWxlUGF0aCwgbGFuZyk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gbnVsbDtcclxuICAgICAgICAgICAgfSkpO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogTWFwIHRoZSBpbnB1dCBmb3JtYXQgdG8gdGhlIGZvcm1hdCBvZiB0aGUgdHJhbnNsYXRpb24uXHJcbiAgICAgKiBOb3JtYWxseSB0aGV5IGFyZSB0aGUgc2FtZSBidXQgZm9yIHhtYiB0aGUgdHJhbnNsYXRpb24gZm9ybWF0IGlzIHh0Yi5cclxuICAgICAqIEBwYXJhbSBpMThuRm9ybWF0IGZvcm1hdFxyXG4gICAgICovXHJcbiAgICBwcml2YXRlIHRyYW5zbGF0aW9uRm9ybWF0KGkxOG5Gb3JtYXQ6IHN0cmluZyk6IHN0cmluZyB7XHJcbiAgICAgICAgaWYgKGkxOG5Gb3JtYXQgPT09IEZPUk1BVF9YTUIpIHtcclxuICAgICAgICAgICAgcmV0dXJuIEZPUk1BVF9YVEI7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgcmV0dXJuIGkxOG5Gb3JtYXQ7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogTWVyZ2UgYWxsXHJcbiAgICAgKiBAcGFyYW0gbGFuZyBsYW5ndWFnZVxyXG4gICAgICogQHBhcmFtIGxhbmd1YWdlWGxpZmZGaWxlUGF0aCBmaWxlbmFtZVxyXG4gICAgICovXHJcbiAgICBwcml2YXRlIG1lcmdlTWFzdGVyVG8obGFuZzogc3RyaW5nLCBsYW5ndWFnZVhsaWZmRmlsZVBhdGg6IHN0cmluZyk6IE9ic2VydmFibGU8dm9pZD4ge1xyXG4gICAgICAgIGNvbnN0IGlzRGVmYXVsdExhbmc6IGJvb2xlYW4gPSAobGFuZyA9PT0gdGhpcy5wYXJhbWV0ZXJzLmRlZmF1bHRMYW5ndWFnZSgpKTtcclxuICAgICAgICBjb25zdCBvcHRpb25hbE1hc3RlckZpbGVQYXRoID0gaXNEZWZhdWx0TGFuZyA/IHRoaXMucGFyYW1ldGVycy5vcHRpb25hbE1hc3RlckZpbGVQYXRoKCkgOiB0aGlzLnBhcmFtZXRlcnMub3B0aW9uYWxNYXN0ZXJGaWxlUGF0aChsYW5nKTtcclxuICAgICAgICAvLyByZWFkIGxhbmcgc3BlY2lmaWMgZmlsZVxyXG4gICAgICAgIGNvbnN0IGxhbmd1YWdlU3BlY2lmaWNNZXNzYWdlc0ZpbGU6IElUcmFuc2xhdGlvbk1lc3NhZ2VzRmlsZSA9XHJcbiAgICAgICAgICAgIFRyYW5zbGF0aW9uTWVzc2FnZXNGaWxlUmVhZGVyLmZyb21GaWxlKFxyXG4gICAgICAgICAgICAgICAgdGhpcy50cmFuc2xhdGlvbkZvcm1hdCh0aGlzLnBhcmFtZXRlcnMuaTE4bkZvcm1hdCgpKSxcclxuICAgICAgICAgICAgICAgIGxhbmd1YWdlWGxpZmZGaWxlUGF0aCxcclxuICAgICAgICAgICAgICAgIHRoaXMucGFyYW1ldGVycy5lbmNvZGluZygpLFxyXG4gICAgICAgICAgICAgICAgb3B0aW9uYWxNYXN0ZXJGaWxlUGF0aCk7XHJcbiAgICAgICAgbGV0IG5ld0NvdW50ID0gMDtcclxuICAgICAgICBsZXQgY29ycmVjdFNvdXJjZUNvbnRlbnRDb3VudCA9IDA7XHJcbiAgICAgICAgbGV0IGNvcnJlY3RTb3VyY2VSZWZDb3VudCA9IDA7XHJcbiAgICAgICAgbGV0IGNvcnJlY3REZXNjcmlwdGlvbk9yTWVhbmluZ0NvdW50ID0gMDtcclxuICAgICAgICBsZXQgaWRDaGFuZ2VkQ291bnQgPSAwO1xyXG4gICAgICAgIGxhbmd1YWdlU3BlY2lmaWNNZXNzYWdlc0ZpbGUuc2V0TmV3VHJhbnNVbml0VGFyZ2V0UHJhZWZpeCh0aGlzLnBhcmFtZXRlcnMudGFyZ2V0UHJhZWZpeCgpKTtcclxuICAgICAgICBsYW5ndWFnZVNwZWNpZmljTWVzc2FnZXNGaWxlLnNldE5ld1RyYW5zVW5pdFRhcmdldFN1ZmZpeCh0aGlzLnBhcmFtZXRlcnMudGFyZ2V0U3VmZml4KCkpO1xyXG4gICAgICAgIGxldCBsYXN0UHJvY2Vzc2VkVW5pdDogSVRyYW5zVW5pdCA9IG51bGw7XHJcbiAgICAgICAgdGhpcy5tYXN0ZXIuZm9yRWFjaFRyYW5zVW5pdCgobWFzdGVyVHJhbnNVbml0KSA9PiB7XHJcbiAgICAgICAgICAgIGxldCB0cmFuc1VuaXQ6IElUcmFuc1VuaXQgPSBsYW5ndWFnZVNwZWNpZmljTWVzc2FnZXNGaWxlLnRyYW5zVW5pdFdpdGhJZChtYXN0ZXJUcmFuc1VuaXQuaWQpO1xyXG4gICAgICAgICAgICBjb25zdCBvcHRpb25hbFRyYW5zVW5pdDogSVRyYW5zVW5pdCA9IGxhbmd1YWdlU3BlY2lmaWNNZXNzYWdlc0ZpbGUub3B0aW9uYWxNYXN0ZXJUcmFuc1VuaXRXaXRoSWQobWFzdGVyVHJhbnNVbml0LmlkKTtcclxuICAgICAgICAgICAgaWYgKCF0cmFuc1VuaXQgJiYgb3B0aW9uYWxUcmFuc1VuaXQpIHtcclxuICAgICAgICAgICAgICAgIC8vIElmIHdlIGRvbnQgaGF2ZSBhIHRyYW5zdW5pdCBpbiB0aGUgbGFuZ3VhZ2UgZmlsZSBidXQgdGhlcmUgaXMgb25lIGluIHRoZSBsYW5ndWFnZSBtYXN0ZXIgZmlsZSB3ZSB1c2UgdGhlIGxhbmd1YWdlIG1hc3RlciBvbmUgaW5zdGVhZC5cclxuICAgICAgICAgICAgICAgIHRyYW5zVW5pdCA9IG9wdGlvbmFsVHJhbnNVbml0O1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBpZiAoIXRyYW5zVW5pdCkge1xyXG4gICAgICAgICAgICAgICAgLy8gb29wcywgbm8gdHJhbnNsYXRpb24sIG11c3QgYmUgYSBuZXcga2V5LCBzbyBhZGQgaXRcclxuICAgICAgICAgICAgICAgIGxldCBuZXdVbml0O1xyXG4gICAgICAgICAgICAgICAgaWYgKHRoaXMucGFyYW1ldGVycy5hbGxvd0lkQ2hhbmdlKClcclxuICAgICAgICAgICAgICAgICAgICAmJiAobmV3VW5pdCA9IHRoaXMucHJvY2Vzc0NoYW5nZWRJZFVuaXQobWFzdGVyVHJhbnNVbml0LCBsYW5ndWFnZVNwZWNpZmljTWVzc2FnZXNGaWxlLCBsYXN0UHJvY2Vzc2VkVW5pdCkpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgbGFzdFByb2Nlc3NlZFVuaXQgPSBuZXdVbml0O1xyXG4gICAgICAgICAgICAgICAgICAgIGlkQ2hhbmdlZENvdW50Kys7XHJcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgIGxhc3RQcm9jZXNzZWRVbml0ID0gbGFuZ3VhZ2VTcGVjaWZpY01lc3NhZ2VzRmlsZS5pbXBvcnROZXdUcmFuc1VuaXQoXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIG1hc3RlclRyYW5zVW5pdCxcclxuICAgICAgICAgICAgICAgICAgICAgICAgaXNEZWZhdWx0TGFuZyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5wYXJhbWV0ZXJzLnVzZVNvdXJjZUFzVGFyZ2V0KCksXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICh0aGlzLnBhcmFtZXRlcnMucHJlc2VydmVPcmRlcigpKSA/IGxhc3RQcm9jZXNzZWRVbml0IDogdW5kZWZpbmVkKTtcclxuICAgICAgICAgICAgICAgICAgICBuZXdDb3VudCsrO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgLy8gY2hlY2sgZm9yIGNoYW5nZWQgc291cmNlIGNvbnRlbnQgYW5kIGNoYW5nZSBpdCBpZiBuZWVkZWRcclxuICAgICAgICAgICAgICAgIC8vIChjYW4gb25seSBoYXBwZW4gaWYgSUQgaXMgZXhwbGljaXRlbHkgc2V0LCBvdGhlcndpc2UgSUQgd291bGQgY2hhbmdlIGlmIHNvdXJjZSBjb250ZW50IGlzIGNoYW5nZWQuXHJcbiAgICAgICAgICAgICAgICBpZiAodHJhbnNVbml0LnN1cHBvcnRzU2V0U291cmNlQ29udGVudCgpICYmICF0aGlzLmFyZVNvdXJjZXNOZWFybHlFcXVhbChtYXN0ZXJUcmFuc1VuaXQsIHRyYW5zVW5pdCkpIHtcclxuICAgICAgICAgICAgICAgICAgICB0cmFuc1VuaXQuc2V0U291cmNlQ29udGVudChtYXN0ZXJUcmFuc1VuaXQuc291cmNlQ29udGVudCgpKTtcclxuICAgICAgICAgICAgICAgICAgICBpZiAoaXNEZWZhdWx0TGFuZykge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAvLyAjODEgY2hhbmdlZCBzb3VyY2UgbXVzdCBiZSBjb3BpZWQgdG8gdGFyZ2V0IGZvciBkZWZhdWx0IGxhbmdcclxuICAgICAgICAgICAgICAgICAgICAgICAgdHJhbnNVbml0LnRyYW5zbGF0ZShtYXN0ZXJUcmFuc1VuaXQuc291cmNlQ29udGVudCgpKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdHJhbnNVbml0LnNldFRhcmdldFN0YXRlKFNUQVRFX0ZJTkFMKTtcclxuICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAodHJhbnNVbml0LnRhcmdldFN0YXRlKCkgPT09IFNUQVRFX0ZJTkFMKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBzb3VyY2UgaXMgY2hhbmdlZCwgc28gdHJhbnNsYXRpb24gaGFzIHRvIGJlIGNoZWNrZWQgYWdhaW5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRyYW5zVW5pdC5zZXRUYXJnZXRTdGF0ZShTVEFURV9UUkFOU0xBVEVEKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICBjb3JyZWN0U291cmNlQ29udGVudENvdW50Kys7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAvLyBjaGVjayBmb3IgbWlzc2luZyBvciBjaGFuZ2VkIHNvdXJjZSByZWYgYW5kIGFkZCBpdCBpZiBuZWVkZWRcclxuICAgICAgICAgICAgICAgIGlmICh0cmFuc1VuaXQuc3VwcG9ydHNTZXRTb3VyY2VSZWZlcmVuY2VzKClcclxuICAgICAgICAgICAgICAgICAgICAmJiAhdGhpcy5hcmVTb3VyY2VSZWZlcmVuY2VzRXF1YWwobWFzdGVyVHJhbnNVbml0LnNvdXJjZVJlZmVyZW5jZXMoKSwgdHJhbnNVbml0LnNvdXJjZVJlZmVyZW5jZXMoKSkpIHtcclxuICAgICAgICAgICAgICAgICAgICB0cmFuc1VuaXQuc2V0U291cmNlUmVmZXJlbmNlcyhtYXN0ZXJUcmFuc1VuaXQuc291cmNlUmVmZXJlbmNlcygpKTtcclxuICAgICAgICAgICAgICAgICAgICBjb3JyZWN0U291cmNlUmVmQ291bnQrKztcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIC8vIGNoZWNrIGZvciBjaGFuZ2VkIGRlc2NyaXB0aW9uIG9yIG1lYW5pbmdcclxuICAgICAgICAgICAgICAgIGlmICh0cmFuc1VuaXQuc3VwcG9ydHNTZXREZXNjcmlwdGlvbkFuZE1lYW5pbmcoKSkge1xyXG4gICAgICAgICAgICAgICAgICAgIGxldCBjaGFuZ2VkID0gZmFsc2U7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKHRyYW5zVW5pdC5kZXNjcmlwdGlvbigpICE9PSBtYXN0ZXJUcmFuc1VuaXQuZGVzY3JpcHRpb24oKSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB0cmFuc1VuaXQuc2V0RGVzY3JpcHRpb24obWFzdGVyVHJhbnNVbml0LmRlc2NyaXB0aW9uKCkpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBjaGFuZ2VkID0gdHJ1ZTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKHRyYW5zVW5pdC5tZWFuaW5nKCkgIT09IG1hc3RlclRyYW5zVW5pdC5tZWFuaW5nKCkpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdHJhbnNVbml0LnNldE1lYW5pbmcobWFzdGVyVHJhbnNVbml0Lm1lYW5pbmcoKSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNoYW5nZWQgPSB0cnVlO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICBpZiAoY2hhbmdlZCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBjb3JyZWN0RGVzY3JpcHRpb25Pck1lYW5pbmdDb3VudCsrO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGxhc3RQcm9jZXNzZWRVbml0ID0gdHJhbnNVbml0O1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgaWYgKG5ld0NvdW50ID4gMCkge1xyXG4gICAgICAgICAgICB0aGlzLmNvbW1hbmRPdXRwdXQud2FybignbWVyZ2VkICVzIHRyYW5zLXVuaXRzIGZyb20gbWFzdGVyIHRvIFwiJXNcIicsIG5ld0NvdW50LCBsYW5nKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKGNvcnJlY3RTb3VyY2VDb250ZW50Q291bnQgPiAwKSB7XHJcbiAgICAgICAgICAgIHRoaXMuY29tbWFuZE91dHB1dC53YXJuKCd0cmFuc2ZlcnJlZCAlcyBjaGFuZ2VkIHNvdXJjZSBjb250ZW50IGZyb20gbWFzdGVyIHRvIFwiJXNcIicsIGNvcnJlY3RTb3VyY2VDb250ZW50Q291bnQsIGxhbmcpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAoY29ycmVjdFNvdXJjZVJlZkNvdW50ID4gMCkge1xyXG4gICAgICAgICAgICB0aGlzLmNvbW1hbmRPdXRwdXQud2FybigndHJhbnNmZXJyZWQgJXMgc291cmNlIHJlZmVyZW5jZXMgZnJvbSBtYXN0ZXIgdG8gXCIlc1wiJywgY29ycmVjdFNvdXJjZVJlZkNvdW50LCBsYW5nKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKGlkQ2hhbmdlZENvdW50ID4gMCkge1xyXG4gICAgICAgICAgICB0aGlzLmNvbW1hbmRPdXRwdXQud2FybignZm91bmQgJXMgY2hhbmdlZCBpZFxcJ3MgaW4gXCIlc1wiJywgaWRDaGFuZ2VkQ291bnQsIGxhbmcpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAoY29ycmVjdERlc2NyaXB0aW9uT3JNZWFuaW5nQ291bnQgPiAwKSB7XHJcbiAgICAgICAgICAgIHRoaXMuY29tbWFuZE91dHB1dC53YXJuKFxyXG4gICAgICAgICAgICAgICAgJ3RyYW5zZmVycmVkICVzIGNoYW5nZWQgZGVzY3JpcHRpb25zL21lYW5pbmdzIGZyb20gbWFzdGVyIHRvIFwiJXNcIicsIGNvcnJlY3REZXNjcmlwdGlvbk9yTWVhbmluZ0NvdW50LCBsYW5nKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8vIHJlbW92ZSBhbGwgZWxlbWVudHMgdGhhdCBhcmUgbm8gbG9uZ2VyIHVzZWRcclxuICAgICAgICBsZXQgcmVtb3ZlQ291bnQgPSAwO1xyXG4gICAgICAgIGxhbmd1YWdlU3BlY2lmaWNNZXNzYWdlc0ZpbGUuZm9yRWFjaFRyYW5zVW5pdCgodHJhbnNVbml0OiBJVHJhbnNVbml0KSA9PiB7XHJcbiAgICAgICAgICAgIGNvbnN0IGV4aXN0c0luTWFzdGVyID0gIWlzTnVsbE9yVW5kZWZpbmVkKHRoaXMubWFzdGVyLnRyYW5zVW5pdFdpdGhJZCh0cmFuc1VuaXQuaWQpKTtcclxuICAgICAgICAgICAgaWYgKCFleGlzdHNJbk1hc3Rlcikge1xyXG4gICAgICAgICAgICAgICAgaWYgKHRoaXMucGFyYW1ldGVycy5yZW1vdmVVbnVzZWRJZHMoKSkge1xyXG4gICAgICAgICAgICAgICAgICAgIGxhbmd1YWdlU3BlY2lmaWNNZXNzYWdlc0ZpbGUucmVtb3ZlVHJhbnNVbml0V2l0aElkKHRyYW5zVW5pdC5pZCk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICByZW1vdmVDb3VudCsrO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgaWYgKHJlbW92ZUNvdW50ID4gMCkge1xyXG4gICAgICAgICAgICBpZiAodGhpcy5wYXJhbWV0ZXJzLnJlbW92ZVVudXNlZElkcygpKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmNvbW1hbmRPdXRwdXQud2FybigncmVtb3ZlZCAlcyB1bnVzZWQgdHJhbnMtdW5pdHMgaW4gXCIlc1wiJywgcmVtb3ZlQ291bnQsIGxhbmcpO1xyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5jb21tYW5kT3V0cHV0Lndhcm4oJ2tlZXBpbmcgJXMgdW51c2VkIHRyYW5zLXVuaXRzIGluIFwiJXNcIiwgYmVjYXVzZSByZW1vdmVVbnVzZWQgaXMgZGlzYWJsZWQnLCByZW1vdmVDb3VudCwgbGFuZyk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmIChuZXdDb3VudCA9PT0gMCAmJiByZW1vdmVDb3VudCA9PT0gMCAmJiBjb3JyZWN0U291cmNlQ29udGVudENvdW50ID09PSAwXHJcbiAgICAgICAgICAgICYmIGNvcnJlY3RTb3VyY2VSZWZDb3VudCA9PT0gMCAmJiBjb3JyZWN0RGVzY3JpcHRpb25Pck1lYW5pbmdDb3VudCA9PT0gMCkge1xyXG4gICAgICAgICAgICB0aGlzLmNvbW1hbmRPdXRwdXQuaW5mbygnZmlsZSBmb3IgXCIlc1wiIHdhcyB1cCB0byBkYXRlJywgbGFuZyk7XHJcbiAgICAgICAgICAgIHJldHVybiBvZihudWxsKTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICByZXR1cm4gdGhpcy5hdXRvVHJhbnNsYXRlKHRoaXMubWFzdGVyLnNvdXJjZUxhbmd1YWdlKCksIGxhbmcsIGxhbmd1YWdlU3BlY2lmaWNNZXNzYWdlc0ZpbGUpXHJcbiAgICAgICAgICAgICAgICAucGlwZShtYXAoKCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgIC8vIHdyaXRlIGl0IHRvIGZpbGVcclxuICAgICAgICAgICAgICAgICAgICBUcmFuc2xhdGlvbk1lc3NhZ2VzRmlsZVJlYWRlci5zYXZlKGxhbmd1YWdlU3BlY2lmaWNNZXNzYWdlc0ZpbGUsIHRoaXMucGFyYW1ldGVycy5iZWF1dGlmeU91dHB1dCgpKTtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLmNvbW1hbmRPdXRwdXQuaW5mbygndXBkYXRlZCBmaWxlIFwiJXNcIiBmb3IgdGFyZ2V0LWxhbmd1YWdlPVwiJXNcIicsIGxhbmd1YWdlWGxpZmZGaWxlUGF0aCwgbGFuZyk7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKG5ld0NvdW50ID4gMCAmJiAhaXNEZWZhdWx0TGFuZykge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmNvbW1hbmRPdXRwdXQud2FybigncGxlYXNlIHRyYW5zbGF0ZSBmaWxlIFwiJXNcIiB0byB0YXJnZXQtbGFuZ3VhZ2U9XCIlc1wiJywgbGFuZ3VhZ2VYbGlmZkZpbGVQYXRoLCBsYW5nKTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIG51bGw7XHJcbiAgICAgICAgICAgICAgICB9KSk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogSGFuZGxlIHRoZSBjYXNlIG9mIGNoYW5nZWQgaWQgZHVlIHRvIHNtYWxsIHdoaXRlIHNwYWNlIGNoYW5nZXMuXHJcbiAgICAgKiBAcGFyYW0gbWFzdGVyVHJhbnNVbml0IHVuaXQgaW4gbWFzdGVyIGZpbGVcclxuICAgICAqIEBwYXJhbSBsYW5ndWFnZVNwZWNpZmljTWVzc2FnZXNGaWxlIHRyYW5zbGF0aW9uIGZpbGVcclxuICAgICAqIEBwYXJhbSBsYXN0UHJvY2Vzc2VkVW5pdCBVbml0IGJlZm9yZSB0aGUgb25lIHByb2Nlc3NlZCBoZXJlLiBOZXcgdW5pdCB3aWxsIGJlIGluc2VydGVkIGFmdGVyIHRoaXMgb25lLlxyXG4gICAgICogQHJldHVybiBwcm9jZXNzZWQgdW5pdCwgaWYgZG9uZSwgbnVsbCBpZiBubyBjaGFuZ2VkIHVuaXQgZm91bmRcclxuICAgICAqL1xyXG4gICAgcHJpdmF0ZSBwcm9jZXNzQ2hhbmdlZElkVW5pdChcclxuICAgICAgICBtYXN0ZXJUcmFuc1VuaXQ6IElUcmFuc1VuaXQsXHJcbiAgICAgICAgbGFuZ3VhZ2VTcGVjaWZpY01lc3NhZ2VzRmlsZTogSVRyYW5zbGF0aW9uTWVzc2FnZXNGaWxlLFxyXG4gICAgICAgIGxhc3RQcm9jZXNzZWRVbml0OiBJVHJhbnNVbml0KTogSVRyYW5zVW5pdCB7XHJcblxyXG4gICAgICAgIGxldCBjaGFuZ2VkVHJhbnNVbml0OiBJVHJhbnNVbml0ID0gbnVsbDtcclxuICAgICAgICBsYW5ndWFnZVNwZWNpZmljTWVzc2FnZXNGaWxlLmZvckVhY2hUcmFuc1VuaXQoKGxhbmd1YWdlVHJhbnNVbml0KSA9PiB7XHJcbiAgICAgICAgICAgIGlmICh0aGlzLmFyZVNvdXJjZXNOZWFybHlFcXVhbChsYW5ndWFnZVRyYW5zVW5pdCwgbWFzdGVyVHJhbnNVbml0KSkge1xyXG4gICAgICAgICAgICAgICAgY2hhbmdlZFRyYW5zVW5pdCA9IGxhbmd1YWdlVHJhbnNVbml0O1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgaWYgKCFjaGFuZ2VkVHJhbnNVbml0KSB7XHJcbiAgICAgICAgICAgIHJldHVybiBudWxsO1xyXG4gICAgICAgIH1cclxuICAgICAgICBjb25zdCBtZXJnZWRUcmFuc1VuaXQgPSBsYW5ndWFnZVNwZWNpZmljTWVzc2FnZXNGaWxlLmltcG9ydE5ld1RyYW5zVW5pdChcclxuICAgICAgICAgICAgbWFzdGVyVHJhbnNVbml0LFxyXG4gICAgICAgICAgICBmYWxzZSxcclxuICAgICAgICAgICAgZmFsc2UsXHJcbiAgICAgICAgICAgICh0aGlzLnBhcmFtZXRlcnMucHJlc2VydmVPcmRlcigpKSA/IGxhc3RQcm9jZXNzZWRVbml0IDogdW5kZWZpbmVkKTtcclxuICAgICAgICBjb25zdCB0cmFuc2xhdGVkQ29udGVudCA9IGNoYW5nZWRUcmFuc1VuaXQudGFyZ2V0Q29udGVudCgpO1xyXG4gICAgICAgIGlmICh0cmFuc2xhdGVkQ29udGVudCkgeyAvLyBpc3N1ZSAjNjggc2V0IHRyYW5zbGF0ZWQgb25seSwgaWYgaXQgaXMgcmVhbGx5IHRyYW5zbGF0ZWRcclxuICAgICAgICAgICAgbWVyZ2VkVHJhbnNVbml0LnRyYW5zbGF0ZSh0cmFuc2xhdGVkQ29udGVudCk7XHJcbiAgICAgICAgICAgIG1lcmdlZFRyYW5zVW5pdC5zZXRUYXJnZXRTdGF0ZShTVEFURV9UUkFOU0xBVEVEKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIG1lcmdlZFRyYW5zVW5pdDtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIHRlc3Qgd2V0aGVyIHRoZSBzb3VyY2VzIG9mIDIgdHJhbnMgdW5pdHMgYXJlIGVxdWFsIGlnbm9yaW5nIHdoaXRlIHNwYWNlcy5cclxuICAgICAqIEBwYXJhbSB0dTEgdHUxXHJcbiAgICAgKiBAcGFyYW0gdHUyIHR1MlxyXG4gICAgICovXHJcbiAgICBwcml2YXRlIGFyZVNvdXJjZXNOZWFybHlFcXVhbCh0dTE6IElUcmFuc1VuaXQsIHR1MjogSVRyYW5zVW5pdCk6IGJvb2xlYW4ge1xyXG4gICAgICAgIGlmICgodHUxICYmICF0dTIpIHx8ICh0dTIgJiYgIXR1MSkpIHtcclxuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICAgIH1cclxuICAgICAgICBjb25zdCB0dTFOb3JtYWxpemVkID0gdHUxLnNvdXJjZUNvbnRlbnROb3JtYWxpemVkKCk7XHJcbiAgICAgICAgY29uc3QgdHUyTm9ybWFsaXplZCA9IHR1Mi5zb3VyY2VDb250ZW50Tm9ybWFsaXplZCgpO1xyXG4gICAgICAgIGlmICh0dTFOb3JtYWxpemVkLmlzSUNVTWVzc2FnZSgpKSB7XHJcbiAgICAgICAgICAgIGlmICh0dTJOb3JtYWxpemVkLmlzSUNVTWVzc2FnZSgpKSB7XHJcbiAgICAgICAgICAgICAgICBjb25zdCBpY3UxTm9ybWFsaXplZCA9IHR1MU5vcm1hbGl6ZWQuZ2V0SUNVTWVzc2FnZSgpLmFzTmF0aXZlU3RyaW5nKCkudHJpbSgpO1xyXG4gICAgICAgICAgICAgICAgY29uc3QgaWN1Mk5vcm1hbGl6ZWQgPSB0dTJOb3JtYWxpemVkLmdldElDVU1lc3NhZ2UoKS5hc05hdGl2ZVN0cmluZygpLnRyaW0oKTtcclxuICAgICAgICAgICAgICAgIHJldHVybiBpY3UxTm9ybWFsaXplZCA9PT0gaWN1Mk5vcm1hbGl6ZWQ7XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKHR1MU5vcm1hbGl6ZWQuY29udGFpbnNJQ1VNZXNzYWdlUmVmKCkpIHtcclxuICAgICAgICAgICAgY29uc3QgaWN1cmVmMU5vcm1hbGl6ZWQgPSB0dTFOb3JtYWxpemVkLmFzTmF0aXZlU3RyaW5nKCkudHJpbSgpO1xyXG4gICAgICAgICAgICBjb25zdCBpY3VyZWYyTm9ybWFsaXplZCA9IHR1Mk5vcm1hbGl6ZWQuYXNOYXRpdmVTdHJpbmcoKS50cmltKCk7XHJcbiAgICAgICAgICAgIHJldHVybiBpY3VyZWYxTm9ybWFsaXplZCA9PT0gaWN1cmVmMk5vcm1hbGl6ZWQ7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGNvbnN0IHMxTm9ybWFsaXplZCA9IHR1MU5vcm1hbGl6ZWQuYXNEaXNwbGF5U3RyaW5nKE5PUk1BTElaQVRJT05fRk9STUFUX0RFRkFVTFQpLnRyaW0oKTtcclxuICAgICAgICBjb25zdCBzMk5vcm1hbGl6ZWQgPSB0dTJOb3JtYWxpemVkLmFzRGlzcGxheVN0cmluZyhOT1JNQUxJWkFUSU9OX0ZPUk1BVF9ERUZBVUxUKS50cmltKCk7XHJcbiAgICAgICAgcmV0dXJuIHMxTm9ybWFsaXplZCA9PT0gczJOb3JtYWxpemVkO1xyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgYXJlU291cmNlUmVmZXJlbmNlc0VxdWFsKFxyXG4gICAgICAgIHJlZjE6IHsgc291cmNlZmlsZTogc3RyaW5nOyBsaW5lbnVtYmVyOiBudW1iZXI7IH1bXSxcclxuICAgICAgICByZWYyOiB7IHNvdXJjZWZpbGU6IHN0cmluZzsgbGluZW51bWJlcjogbnVtYmVyOyB9W10pOiBib29sZWFuIHtcclxuXHJcbiAgICAgICAgaWYgKChpc051bGxPclVuZGVmaW5lZChyZWYxKSAmJiAhaXNOdWxsT3JVbmRlZmluZWQocmVmMikpIHx8IChpc051bGxPclVuZGVmaW5lZChyZWYyKSAmJiAhaXNOdWxsT3JVbmRlZmluZWQocmVmMSkpKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKGlzTnVsbE9yVW5kZWZpbmVkKHJlZjEpICYmIGlzTnVsbE9yVW5kZWZpbmVkKHJlZjIpKSB7XHJcbiAgICAgICAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgICAgIH1cclxuICAgICAgICAvLyBib3QgcmVmcyBhcmUgc2V0IG5vdywgY29udmVydCB0byBzZXQgdG8gY29tcGFyZSB0aGVtXHJcbiAgICAgICAgY29uc3Qgc2V0MTogU2V0PHN0cmluZz4gPSBuZXcgU2V0PHN0cmluZz4oKTtcclxuICAgICAgICByZWYxLmZvckVhY2goKHJlZikgPT4geyBzZXQxLmFkZChyZWYuc291cmNlZmlsZSArICc6JyArIHJlZi5saW5lbnVtYmVyKTsgfSk7XHJcbiAgICAgICAgY29uc3Qgc2V0MjogU2V0PHN0cmluZz4gPSBuZXcgU2V0PHN0cmluZz4oKTtcclxuICAgICAgICByZWYyLmZvckVhY2goKHJlZikgPT4geyBzZXQyLmFkZChyZWYuc291cmNlZmlsZSArICc6JyArIHJlZi5saW5lbnVtYmVyKTsgfSk7XHJcbiAgICAgICAgaWYgKHNldDEuc2l6ZSAhPT0gc2V0Mi5zaXplKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgICB9XHJcbiAgICAgICAgbGV0IG1hdGNoID0gdHJ1ZTtcclxuICAgICAgICBzZXQyLmZvckVhY2goKHJlZikgPT4ge1xyXG4gICAgICAgICAgICBpZiAoIXNldDEuaGFzKHJlZikpIHtcclxuICAgICAgICAgICAgICAgIG1hdGNoID0gZmFsc2U7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KTtcclxuICAgICAgICByZXR1cm4gbWF0Y2g7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBBdXRvIHRyYW5zbGF0ZSBmaWxlIHZpYSBHb29nbGUgVHJhbnNsYXRlLlxyXG4gICAgICogV2lsbCB0cmFuc2xhdGUgYWxsIG5ldyB1bml0cyBpbiBmaWxlLlxyXG4gICAgICogQHBhcmFtIGZyb20gZnJvbVxyXG4gICAgICogQHBhcmFtIHRvIHRvXHJcbiAgICAgKiBAcGFyYW0gbGFuZ3VhZ2VTcGVjaWZpY01lc3NhZ2VzRmlsZSBsYW5ndWFnZVNwZWNpZmljTWVzc2FnZXNGaWxlXHJcbiAgICAgKiBAcmV0dXJuIGEgcHJvbWlzZSB3aXRoIHRoZSBleGVjdXRpb24gcmVzdWx0IGFzIGEgc3VtbWFyeSByZXBvcnQuXHJcbiAgICAgKi9cclxuICAgIHByaXZhdGUgYXV0b1RyYW5zbGF0ZShcclxuICAgICAgICBmcm9tOiBzdHJpbmcsXHJcbiAgICAgICAgdG86IHN0cmluZyxcclxuICAgICAgICBsYW5ndWFnZVNwZWNpZmljTWVzc2FnZXNGaWxlOiBJVHJhbnNsYXRpb25NZXNzYWdlc0ZpbGUpOiBPYnNlcnZhYmxlPEF1dG9UcmFuc2xhdGVTdW1tYXJ5UmVwb3J0PiB7XHJcblxyXG4gICAgICAgIGxldCBzZXJ2aWNlQ2FsbDogT2JzZXJ2YWJsZTxBdXRvVHJhbnNsYXRlU3VtbWFyeVJlcG9ydD47XHJcbiAgICAgICAgY29uc3QgYXV0b3RyYW5zbGF0ZUVuYWJsZWQ6IGJvb2xlYW4gPSB0aGlzLnBhcmFtZXRlcnMuYXV0b3RyYW5zbGF0ZUxhbmd1YWdlKHRvKTtcclxuICAgICAgICBpZiAoYXV0b3RyYW5zbGF0ZUVuYWJsZWQpIHtcclxuICAgICAgICAgICAgc2VydmljZUNhbGwgPSB0aGlzLmF1dG9UcmFuc2xhdGVTZXJ2aWNlLmF1dG9UcmFuc2xhdGUoZnJvbSwgdG8sIGxhbmd1YWdlU3BlY2lmaWNNZXNzYWdlc0ZpbGUpO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIHNlcnZpY2VDYWxsID0gb2YobmV3IEF1dG9UcmFuc2xhdGVTdW1tYXJ5UmVwb3J0KGZyb20sIHRvKSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiBzZXJ2aWNlQ2FsbC5waXBlKG1hcCgoc3VtbWFyeSkgPT4ge1xyXG4gICAgICAgICAgICBpZiAoYXV0b3RyYW5zbGF0ZUVuYWJsZWQpIHtcclxuICAgICAgICAgICAgICAgIGlmIChzdW1tYXJ5LmVycm9yKCkgfHwgc3VtbWFyeS5mYWlsZWQoKSA+IDApIHtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLmNvbW1hbmRPdXRwdXQuZXJyb3Ioc3VtbWFyeS5jb250ZW50KCkpO1xyXG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLmNvbW1hbmRPdXRwdXQud2FybihzdW1tYXJ5LmNvbnRlbnQoKSk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgcmV0dXJuIHN1bW1hcnk7XHJcbiAgICAgICAgfSkpO1xyXG4gICAgfVxyXG5cclxufVxyXG4iXX0=