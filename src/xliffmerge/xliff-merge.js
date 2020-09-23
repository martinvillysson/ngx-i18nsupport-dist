"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.XliffMerge = void 0;
const command_output_1 = require("../common/command-output");
const xliff_merge_parameters_1 = require("./xliff-merge-parameters");
const xliff_merge_error_1 = require("./xliff-merge-error");
const file_util_1 = require("../common/file-util");
const version_1 = require("./version");
const util_1 = require("util");
const util_2 = require("../common/util");
const ngx_i18nsupport_lib_1 = require("@ngx-i18nsupport/ngx-i18nsupport-lib");
const ngx_translate_extractor_1 = require("./ngx-translate-extractor");
const translation_messages_file_reader_1 = require("./translation-messages-file-reader");
const rxjs_1 = require("rxjs");
const operators_1 = require("rxjs/operators");
const xliff_merge_auto_translate_service_1 = require("../autotranslate/xliff-merge-auto-translate-service");
const auto_translate_summary_report_1 = require("../autotranslate/auto-translate-summary-report");
/**
 * Created by martin on 17.02.2017.
 * XliffMerge - read xliff or xmb file and put untranslated parts in language specific xliff or xmb files.
 *
 */
class XliffMerge {
    constructor(commandOutput, options) {
        this.commandOutput = commandOutput;
        this.options = options;
        this.parameters = null;
    }
    static main(argv) {
        const options = XliffMerge.parseArgs(argv);
        if (options) {
            new XliffMerge(new command_output_1.CommandOutput(process.stdout), options).run((result) => {
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
                console.log('xliffmerge ' + version_1.VERSION);
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
        instance.parameters = xliff_merge_parameters_1.XliffMergeParameters.createFromOptions(options, profileContent);
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
            if (!util_2.isNullOrUndefined(callbackFunction)) {
                callbackFunction(retcode);
            }
        }, (error) => {
            if (!util_2.isNullOrUndefined(errorFunction)) {
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
            this.parameters = xliff_merge_parameters_1.XliffMergeParameters.createFromOptions(this.options);
        }
        this.commandOutput.info('xliffmerge version %s', version_1.VERSION);
        if (this.parameters.verbose()) {
            this.parameters.showAllParameters(this.commandOutput);
        }
        if (this.parameters.errorsFound.length > 0) {
            for (const err of this.parameters.errorsFound) {
                this.commandOutput.error(err.message);
            }
            return rxjs_1.of(-1);
        }
        if (this.parameters.warningsFound.length > 0) {
            for (const warn of this.parameters.warningsFound) {
                this.commandOutput.warn(warn);
            }
        }
        this.readMaster();
        if (this.parameters.autotranslate()) {
            this.autoTranslateService = new xliff_merge_auto_translate_service_1.XliffMergeAutoTranslateService(this.parameters.apikey());
        }
        const executionForAllLanguages = [];
        this.parameters.languages().forEach((lang) => {
            executionForAllLanguages.push(this.processLanguage(lang));
        });
        return rxjs_1.forkJoin(executionForAllLanguages).pipe(operators_1.map((retcodes) => this.totalRetcode(retcodes)));
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
            this.master = translation_messages_file_reader_1.TranslationMessagesFileReader.fromFile(this.parameters.i18nFormat(), this.parameters.i18nFile(), this.parameters.encoding());
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
                translation_messages_file_reader_1.TranslationMessagesFileReader.save(this.master, this.parameters.beautifyOutput());
                this.commandOutput.warn('changed master source-language="%s" to "%s"', sourceLang, this.parameters.defaultLanguage());
            }
        }
        catch (err) {
            if (err instanceof xliff_merge_error_1.XliffMergeError) {
                this.commandOutput.error(err.message);
                return rxjs_1.of(-1);
            }
            else {
                // unhandled
                const currentFilename = this.parameters.i18nFile();
                const filenameString = (currentFilename) ? util_1.format('file "%s", ', currentFilename) : '';
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
        if (!file_util_1.FileUtil.exists(languageXliffFile)) {
            result = this.createUntranslatedXliff(lang, languageXliffFile);
        }
        else {
            result = this.mergeMasterTo(lang, languageXliffFile);
        }
        return result
            .pipe(operators_1.map(() => {
            if (this.parameters.supportNgxTranslate()) {
                const languageSpecificMessagesFile = translation_messages_file_reader_1.TranslationMessagesFileReader.fromFile(this.translationFormat(this.parameters.i18nFormat()), languageXliffFile, this.parameters.encoding(), this.master.filename());
                ngx_translate_extractor_1.NgxTranslateExtractor.extract(languageSpecificMessagesFile, this.parameters.ngxTranslateExtractionPattern(), this.parameters.generatedNgxTranslateFile(lang));
            }
            return 0;
        }), operators_1.catchError((err) => {
            if (err instanceof xliff_merge_error_1.XliffMergeError) {
                this.commandOutput.error(err.message);
                return rxjs_1.of(-1);
            }
            else {
                // unhandled
                const filenameString = (currentFilename) ? util_1.format('file "%s", ', currentFilename) : '';
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
        if (this.parameters.optionalMasterFilePath(lang)) {
            optionalMaster = translation_messages_file_reader_1.TranslationMessagesFileReader.masterFileContent(this.parameters.optionalMasterFilePath(lang), this.parameters.encoding());
        }
        const languageSpecificMessagesFile = this.master.createTranslationFileForLang(lang, languageXliffFilePath, isDefaultLang, this.parameters.useSourceAsTarget(), optionalMaster);
        return this.autoTranslate(this.master.sourceLanguage(), lang, languageSpecificMessagesFile).pipe(operators_1.map(( /* summary */) => {
            // write it to file
            translation_messages_file_reader_1.TranslationMessagesFileReader.save(languageSpecificMessagesFile, this.parameters.beautifyOutput());
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
        if (i18nFormat === ngx_i18nsupport_lib_1.FORMAT_XMB) {
            return ngx_i18nsupport_lib_1.FORMAT_XTB;
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
        // read lang specific file
        const languageSpecificMessagesFile = translation_messages_file_reader_1.TranslationMessagesFileReader.fromFile(this.translationFormat(this.parameters.i18nFormat()), languageXliffFilePath, this.parameters.encoding(), this.parameters.optionalMasterFilePath(lang));
        const isDefaultLang = (lang === this.parameters.defaultLanguage());
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
                        transUnit.setTargetState(ngx_i18nsupport_lib_1.STATE_FINAL);
                    }
                    else {
                        if (transUnit.targetState() === ngx_i18nsupport_lib_1.STATE_FINAL) {
                            // source is changed, so translation has to be checked again
                            transUnit.setTargetState(ngx_i18nsupport_lib_1.STATE_TRANSLATED);
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
            const existsInMaster = !util_2.isNullOrUndefined(this.master.transUnitWithId(transUnit.id));
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
            return rxjs_1.of(null);
        }
        else {
            return this.autoTranslate(this.master.sourceLanguage(), lang, languageSpecificMessagesFile)
                .pipe(operators_1.map(() => {
                // write it to file
                translation_messages_file_reader_1.TranslationMessagesFileReader.save(languageSpecificMessagesFile, this.parameters.beautifyOutput());
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
            mergedTransUnit.setTargetState(ngx_i18nsupport_lib_1.STATE_TRANSLATED);
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
        const s1Normalized = tu1Normalized.asDisplayString(ngx_i18nsupport_lib_1.NORMALIZATION_FORMAT_DEFAULT).trim();
        const s2Normalized = tu2Normalized.asDisplayString(ngx_i18nsupport_lib_1.NORMALIZATION_FORMAT_DEFAULT).trim();
        return s1Normalized === s2Normalized;
    }
    areSourceReferencesEqual(ref1, ref2) {
        if ((util_2.isNullOrUndefined(ref1) && !util_2.isNullOrUndefined(ref2)) || (util_2.isNullOrUndefined(ref2) && !util_2.isNullOrUndefined(ref1))) {
            return false;
        }
        if (util_2.isNullOrUndefined(ref1) && util_2.isNullOrUndefined(ref2)) {
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
            serviceCall = rxjs_1.of(new auto_translate_summary_report_1.AutoTranslateSummaryReport(from, to));
        }
        return serviceCall.pipe(operators_1.map((summary) => {
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
exports.XliffMerge = XliffMerge;
//# sourceMappingURL=xliff-merge.js.map