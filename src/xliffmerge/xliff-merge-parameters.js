"use strict";
/**
 * Created by martin on 17.02.2017.
 * Collection of all parameters used by the tool.
 * The parameters are read form the profile or defaults are used.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.XliffMergeParameters = void 0;
const fs = require("fs");
const xliff_merge_error_1 = require("./xliff-merge-error");
const util_1 = require("util");
const util_2 = require("../common/util");
const file_util_1 = require("../common/file-util");
const ngx_translate_extractor_1 = require("./ngx-translate-extractor");
const path_1 = require("path");
const PROFILE_CANDIDATES = ['package.json', '.angular-cli.json'];
class XliffMergeParameters {
    constructor() {
        this.errorsFound = [];
        this.warningsFound = [];
    }
    /**
     * Create Parameters.
     * @param options command options
     * @param profileContent given profile (if not, it is read from the profile path from options).
     */
    static createFromOptions(options, profileContent) {
        const parameters = new XliffMergeParameters();
        parameters.configure(options, profileContent);
        return parameters;
    }
    /**
     * Read potential profile.
     * To be a candidate, file must exist and contain property "xliffmergeOptions".
     * @param profilePath path of profile
     * @return parsed content of file or null, if file does not exist or is not a profile candidate.
     */
    static readProfileCandidate(profilePath) {
        let content;
        try {
            content = fs.readFileSync(profilePath, 'UTF-8');
        }
        catch (err) {
            return null;
        }
        const parsedContent = JSON.parse(content);
        if (parsedContent && parsedContent.xliffmergeOptions) {
            return parsedContent;
        }
        else {
            return null;
        }
    }
    /**
     * Initialize me from the profile content.
     * (public only for test usage).
     * @param options options given at runtime via command line
     * @param profileContent if null, read it from profile.
     */
    configure(options, profileContent) {
        this.errorsFound = [];
        this.warningsFound = [];
        if (!profileContent) {
            profileContent = this.readProfile(options);
        }
        const validProfile = (!!profileContent);
        if (options.quiet) {
            this._quiet = options.quiet;
        }
        if (options.verbose) {
            this._verbose = options.verbose;
        }
        if (validProfile) {
            this.initializeFromConfig(profileContent);
            // if languages are given as parameters, they ovveride everything said in profile
            if (!!options.languages && options.languages.length > 0) {
                this._languages = options.languages;
                if (!this._defaultLanguage) {
                    this._defaultLanguage = this._languages[0];
                }
            }
            this.checkParameters();
        }
    }
    /**
     * Read profile.
     * @param options program options
     * @return the read profile (empty, if none, null if errors)
     */
    readProfile(options) {
        const profilePath = options.profilePath;
        if (!profilePath) {
            for (const configfilename of PROFILE_CANDIDATES) {
                const profile = XliffMergeParameters.readProfileCandidate(configfilename);
                if (profile) {
                    this.usedProfilePath = configfilename;
                    return profile;
                }
            }
            return {};
        }
        let content;
        try {
            content = fs.readFileSync(profilePath, 'UTF-8');
        }
        catch (err) {
            this.errorsFound.push(new xliff_merge_error_1.XliffMergeError('could not read profile "' + profilePath + '"'));
            return null;
        }
        this.usedProfilePath = profilePath;
        const profileContent = JSON.parse(content);
        // replace all pathes in options by absolute paths
        const xliffmergeOptions = profileContent.xliffmergeOptions;
        xliffmergeOptions.srcDir = this.adjustPathToProfilePath(profilePath, xliffmergeOptions.srcDir);
        xliffmergeOptions.genDir = this.adjustPathToProfilePath(profilePath, xliffmergeOptions.genDir);
        if (xliffmergeOptions.optionalMasterFilePath) {
            xliffmergeOptions.optionalMasterFilePath = this.adjustPathToProfilePath(profilePath, xliffmergeOptions.optionalMasterFilePath);
        }
        xliffmergeOptions.apikeyfile = this.adjustPathToProfilePath(profilePath, xliffmergeOptions.apikeyfile);
        return profileContent;
    }
    adjustPathToProfilePath(profilePath, pathToAdjust) {
        if (!pathToAdjust || path_1.isAbsolute(pathToAdjust)) {
            return pathToAdjust;
        }
        return path_1.join(path_1.dirname(profilePath), pathToAdjust).replace(/\\/g, '/');
    }
    initializeFromConfig(profileContent) {
        if (!profileContent) {
            return;
        }
        const profile = profileContent.xliffmergeOptions;
        if (profile) {
            if (!util_2.isNullOrUndefined(profile.quiet)) {
                this._quiet = profile.quiet;
            }
            if (!util_2.isNullOrUndefined(profile.verbose)) {
                this._verbose = profile.verbose;
            }
            if (!util_2.isNullOrUndefined(profile.allowIdChange)) {
                this._allowIdChange = profile.allowIdChange;
            }
            if (profile.defaultLanguage) {
                this._defaultLanguage = profile.defaultLanguage;
            }
            if (profile.languages) {
                this._languages = profile.languages;
            }
            if (profile.srcDir) {
                this._srcDir = profile.srcDir;
            }
            if (profile.angularCompilerOptions) {
                if (profile.angularCompilerOptions.genDir) {
                    this._genDir = profile.angularCompilerOptions.genDir;
                }
            }
            if (profile.genDir) {
                // this must be after angularCompilerOptions to be preferred
                this._genDir = profile.genDir;
            }
            if (profile.optionalMasterFilePath) {
                this._optionalMasterFilePath = profile.optionalMasterFilePath;
            }
            if (profile.i18nBaseFile) {
                this._i18nBaseFile = profile.i18nBaseFile;
            }
            if (profile.i18nFile) {
                this._i18nFile = profile.i18nFile;
            }
            if (profile.i18nFormat) {
                this._i18nFormat = profile.i18nFormat;
            }
            if (profile.encoding) {
                this._encoding = profile.encoding;
            }
            if (!util_2.isNullOrUndefined(profile.removeUnusedIds)) {
                this._removeUnusedIds = profile.removeUnusedIds;
            }
            if (!util_2.isNullOrUndefined(profile.supportNgxTranslate)) {
                this._supportNgxTranslate = profile.supportNgxTranslate;
            }
            if (!util_2.isNullOrUndefined(profile.ngxTranslateExtractionPattern)) {
                this._ngxTranslateExtractionPattern = profile.ngxTranslateExtractionPattern;
            }
            if (!util_2.isNullOrUndefined(profile.useSourceAsTarget)) {
                this._useSourceAsTarget = profile.useSourceAsTarget;
            }
            if (!util_2.isNullOrUndefined(profile.targetPraefix)) {
                this._targetPraefix = profile.targetPraefix;
            }
            if (!util_2.isNullOrUndefined(profile.targetSuffix)) {
                this._targetSuffix = profile.targetSuffix;
            }
            if (!util_2.isNullOrUndefined(profile.autotranslate)) {
                this._autotranslate = profile.autotranslate;
            }
            if (!util_2.isNullOrUndefined(profile.beautifyOutput)) {
                this._beautifyOutput = profile.beautifyOutput;
            }
            if (!util_2.isNullOrUndefined(profile.preserveOrder)) {
                this._preserveOrder = profile.preserveOrder;
            }
            if (!util_2.isNullOrUndefined(profile.apikey)) {
                this._apikey = profile.apikey;
            }
            if (!util_2.isNullOrUndefined(profile.apikeyfile)) {
                this._apikeyfile = profile.apikeyfile;
            }
        }
        else {
            this.warningsFound.push('did not find "xliffmergeOptions" in profile, using defaults');
        }
    }
    /**
     * Check all Parameters, wether they are complete and consistent.
     * if something is wrong with the parameters, it is collected in errorsFound.
     */
    checkParameters() {
        this.checkLanguageSyntax(this.defaultLanguage());
        if (this.languages().length === 0) {
            this.errorsFound.push(new xliff_merge_error_1.XliffMergeError('no languages specified'));
        }
        this.languages().forEach((lang) => {
            this.checkLanguageSyntax(lang);
        });
        let stats;
        let err;
        // srcDir should exists
        try {
            stats = fs.statSync(this.srcDir());
        }
        catch (e) {
            err = e;
        }
        if (!!err || !stats.isDirectory()) {
            this.errorsFound.push(new xliff_merge_error_1.XliffMergeError('srcDir "' + this.srcDir() + '" is not a directory'));
        }
        // genDir should exists
        try {
            stats = fs.statSync(this.genDir());
        }
        catch (e) {
            err = e;
        }
        if (!!err || !stats.isDirectory()) {
            this.errorsFound.push(new xliff_merge_error_1.XliffMergeError('genDir "' + this.genDir() + '" is not a directory'));
        }
        // master file MUST exist
        try {
            fs.accessSync(this.i18nFile(), fs.constants.R_OK);
        }
        catch (err) {
            this.errorsFound.push(new xliff_merge_error_1.XliffMergeError('i18nFile "' + this.i18nFile() + '" is not readable'));
        }
        // i18nFormat must be xlf xlf2 or xmb
        if (!(this.i18nFormat() === 'xlf' || this.i18nFormat() === 'xlf2' || this.i18nFormat() === 'xmb')) {
            this.errorsFound.push(new xliff_merge_error_1.XliffMergeError('i18nFormat "' + this.i18nFormat() + '" invalid, must be "xlf" or "xlf2" or "xmb"'));
        }
        // autotranslate requires api key
        if (this.autotranslate() && !this.apikey()) {
            this.errorsFound.push(new xliff_merge_error_1.XliffMergeError('autotranslate requires an API key, please set one'));
        }
        // autotranslated languages must be in list of all languages
        this.autotranslatedLanguages().forEach((lang) => {
            if (this.languages().indexOf(lang) < 0) {
                this.errorsFound.push(new xliff_merge_error_1.XliffMergeError('autotranslate language "' + lang + '" is not in list of languages'));
            }
            if (lang === this.defaultLanguage()) {
                this.errorsFound.push(new xliff_merge_error_1.XliffMergeError('autotranslate language "' + lang + '" cannot be translated, because it is the source language'));
            }
        });
        // ngx translate pattern check
        if (this.supportNgxTranslate()) {
            const checkResult = ngx_translate_extractor_1.NgxTranslateExtractor.checkPattern(this.ngxTranslateExtractionPattern());
            if (!util_2.isNullOrUndefined(checkResult)) {
                this.errorsFound.push(new xliff_merge_error_1.XliffMergeError('ngxTranslateExtractionPattern "' + this.ngxTranslateExtractionPattern() + '": ' + checkResult));
            }
        }
        // targetPraefix and targetSuffix check
        if (!this.useSourceAsTarget()) {
            if (this.targetPraefix().length > 0) {
                this.warningsFound.push('configured targetPraefix "' + this.targetPraefix() + '" will not be used because "useSourceAsTarget" is disabled"');
            }
            if (this.targetSuffix().length > 0) {
                this.warningsFound.push('configured targetSuffix "' + this.targetSuffix() + '" will not be used because "useSourceAsTarget" is disabled"');
            }
        }
    }
    /**
     * Check syntax of language.
     * Must be compatible with XML Schema type xsd:language.
     * Pattern: [a-zA-Z]{1,8}((-|_)[a-zA-Z0-9]{1,8})*
     * @param lang language to check
     */
    checkLanguageSyntax(lang) {
        const pattern = /^[a-zA-Z]{1,8}([-_][a-zA-Z0-9]{1,8})*$/;
        if (!pattern.test(lang)) {
            this.errorsFound.push(new xliff_merge_error_1.XliffMergeError('language "' + lang + '" is not valid'));
        }
    }
    allowIdChange() {
        return (util_2.isNullOrUndefined(this._allowIdChange)) ? false : this._allowIdChange;
    }
    optionalMasterFilePath(lang) {
        if (lang) {
            if (this._optionalMasterFilePath) {
                return this._optionalMasterFilePath.replace(`.${this.i18nFormat()}`, `.${lang}.${this.i18nFormat()}`);
            }
            return null;
        }
        else {
            return this._optionalMasterFilePath;
        }
    }
    verbose() {
        return (util_2.isNullOrUndefined(this._verbose)) ? false : this._verbose;
    }
    quiet() {
        return (util_2.isNullOrUndefined(this._quiet)) ? false : this._quiet;
    }
    /**
     * Debug output all parameters to commandOutput.
     */
    showAllParameters(commandOutput) {
        commandOutput.debug('xliffmerge Used Parameters:');
        commandOutput.debug('usedProfilePath:\t"%s"', this.usedProfilePath);
        commandOutput.debug('defaultLanguage:\t"%s"', this.defaultLanguage());
        commandOutput.debug('srcDir:\t"%s"', this.srcDir());
        commandOutput.debug('genDir:\t"%s"', this.genDir());
        commandOutput.debug('optionalMasterFilePath:\t"%s"', this.optionalMasterFilePath());
        commandOutput.debug('i18nBaseFile:\t"%s"', this.i18nBaseFile());
        commandOutput.debug('i18nFile:\t"%s"', this.i18nFile());
        commandOutput.debug('languages:\t%s', this.languages());
        for (const language of this.languages()) {
            commandOutput.debug('outputFile[%s]:\t%s', language, this.generatedI18nFile(language));
        }
        commandOutput.debug('removeUnusedIds:\t%s', this.removeUnusedIds());
        commandOutput.debug('supportNgxTranslate:\t%s', this.supportNgxTranslate());
        if (this.supportNgxTranslate()) {
            commandOutput.debug('ngxTranslateExtractionPattern:\t%s', this.ngxTranslateExtractionPattern());
        }
        commandOutput.debug('useSourceAsTarget:\t%s', this.useSourceAsTarget());
        if (this.useSourceAsTarget()) {
            commandOutput.debug('targetPraefix:\t"%s"', this.targetPraefix());
            commandOutput.debug('targetSuffix:\t"%s"', this.targetSuffix());
        }
        commandOutput.debug('allowIdChange:\t%s', this.allowIdChange());
        commandOutput.debug('beautifyOutput:\t%s', this.beautifyOutput());
        commandOutput.debug('preserveOrder:\t%s', this.preserveOrder());
        commandOutput.debug('autotranslate:\t%s', this.autotranslate());
        if (this.autotranslate()) {
            commandOutput.debug('autotranslated languages:\t%s', this.autotranslatedLanguages());
            commandOutput.debug('apikey:\t%s', this.apikey() ? '****' : 'NOT SET');
            commandOutput.debug('apikeyfile:\t%s', this.apikeyfile());
        }
    }
    /**
     * Default-Language, default en.
     * @return default language
     */
    defaultLanguage() {
        return this._defaultLanguage ? this._defaultLanguage : 'en';
    }
    /**
     * Liste der zu bearbeitenden Sprachen.
     * @return languages
     */
    languages() {
        return this._languages ? this._languages : [];
    }
    /**
     * src directory, where the master xlif is located.
     * @return srcDir
     */
    srcDir() {
        return this._srcDir ? this._srcDir : '.';
    }
    /**
     * The base file name of the xlif file for input and output.
     * Default is messages
     * @return base file
     */
    i18nBaseFile() {
        return this._i18nBaseFile ? this._i18nBaseFile : 'messages';
    }
    /**
     * The master xlif file (the one generated by ng-xi18n).
     * Default is <srcDir>/<i18nBaseFile>.xlf.
     * @return master file
     */
    i18nFile() {
        return path_1.join(this.srcDir(), (this._i18nFile ? this._i18nFile : this.i18nBaseFile() + '.' + this.suffixForGeneratedI18nFile())).replace(/\\/g, '/');
    }
    /**
     * Format of the master xlif file.
     * Default is "xlf", possible are "xlf" or "xlf2" or "xmb".
     * @return format
     */
    i18nFormat() {
        return (this._i18nFormat ? this._i18nFormat : 'xlf');
    }
    /**
     * potentially to be generated I18n-File with the translations for one language.
     * @param lang language shortcut
     * @return Path of file
     */
    generatedI18nFile(lang) {
        return path_1.join(this.genDir(), this.i18nBaseFile() + '.' + lang + '.' + this.suffixForGeneratedI18nFile()).replace(/\\/g, '/');
    }
    suffixForGeneratedI18nFile() {
        switch (this.i18nFormat()) {
            case 'xlf':
                return 'xlf';
            case 'xlf2':
                return 'xlf';
            case 'xmb':
                return 'xtb';
        }
    }
    /**
     * potentially to be generated translate-File for ngx-translate with the translations for one language.
     * @param lang language shortcut
     * @return Path of file
     */
    generatedNgxTranslateFile(lang) {
        return path_1.join(this.genDir(), this.i18nBaseFile() + '.' + lang + '.' + 'json').replace(/\\/g, '/');
    }
    /**
     * The encoding used to write new XLIFF-files.
     * @return encoding
     */
    encoding() {
        return this._encoding ? this._encoding : 'UTF-8';
    }
    /**
     * Output-Directory, where the output is written to.
     * Default is <srcDir>.
    */
    genDir() {
        return this._genDir ? this._genDir : this.srcDir();
    }
    removeUnusedIds() {
        return (util_2.isNullOrUndefined(this._removeUnusedIds)) ? true : this._removeUnusedIds;
    }
    supportNgxTranslate() {
        return (util_2.isNullOrUndefined(this._supportNgxTranslate)) ? false : this._supportNgxTranslate;
    }
    ngxTranslateExtractionPattern() {
        return (util_2.isNullOrUndefined(this._ngxTranslateExtractionPattern)) ?
            ngx_translate_extractor_1.NgxTranslateExtractor.DefaultExtractionPattern : this._ngxTranslateExtractionPattern;
    }
    /**
     * Whether source must be used as target for new trans-units
     * Default is true
     */
    useSourceAsTarget() {
        return (util_2.isNullOrUndefined(this._useSourceAsTarget)) ? true : this._useSourceAsTarget;
    }
    /**
     * Praefix used for target when copying new trans-units
     * Default is ""
     */
    targetPraefix() {
        return (util_2.isNullOrUndefined(this._targetPraefix)) ? '' : this._targetPraefix;
    }
    /**
     * Suffix used for target when copying new trans-units
     * Default is ""
     */
    targetSuffix() {
        return (util_2.isNullOrUndefined(this._targetSuffix)) ? '' : this._targetSuffix;
    }
    /**
     * If set, run xml result through beautifier (pretty-data).
     */
    beautifyOutput() {
        return (util_2.isNullOrUndefined(this._beautifyOutput)) ? false : this._beautifyOutput;
    }
    /**
     * If set, order of new trans units will be as in master.
     * Otherwise they are added at the end.
     */
    preserveOrder() {
        return (util_2.isNullOrUndefined(this._preserveOrder)) ? true : this._preserveOrder;
    }
    /**
     * Whether to use autotranslate for new trans-units
     * Default is false
     */
    autotranslate() {
        if (util_2.isNullOrUndefined(this._autotranslate)) {
            return false;
        }
        if (util_2.isArray(this._autotranslate)) {
            return this._autotranslate.length > 0;
        }
        return this._autotranslate;
    }
    /**
     * Whether to use autotranslate for a given language.
     * @param lang language code.
     */
    autotranslateLanguage(lang) {
        return this.autotranslatedLanguages().indexOf(lang) >= 0;
    }
    /**
     * Return a list of languages to be autotranslated.
     */
    autotranslatedLanguages() {
        if (util_2.isNullOrUndefined(this._autotranslate) || this._autotranslate === false) {
            return [];
        }
        if (util_2.isArray(this._autotranslate)) {
            return this._autotranslate;
        }
        return this.languages().slice(1); // first is source language
    }
    /**
     * API key to be used for Google Translate
     * @return api key
     */
    apikey() {
        if (!util_2.isNullOrUndefined(this._apikey)) {
            return this._apikey;
        }
        else {
            const apikeyPath = this.apikeyfile();
            if (this.apikeyfile()) {
                if (fs.existsSync(apikeyPath)) {
                    return file_util_1.FileUtil.read(apikeyPath, 'utf-8');
                }
                else {
                    throw new Error(util_1.format('api key file not found: API_KEY_FILE=%s', apikeyPath));
                }
            }
            else {
                return null;
            }
        }
    }
    /**
     * file name for API key to be used for Google Translate.
     * Explicitly set or read from env var API_KEY_FILE.
     * @return file of api key
     */
    apikeyfile() {
        if (this._apikeyfile) {
            return this._apikeyfile;
        }
        else if (process.env.API_KEY_FILE) {
            return process.env.API_KEY_FILE;
        }
        else {
            return null;
        }
    }
}
exports.XliffMergeParameters = XliffMergeParameters;
//# sourceMappingURL=xliff-merge-parameters.js.map