/**
 * Created by martin on 17.02.2017.
 * Collection of all parameters used by the tool.
 * The parameters are read form the profile or defaults are used.
 */
import * as fs from 'fs';
import { XliffMergeError } from './xliff-merge-error';
import { format } from 'util';
import { isArray, isNullOrUndefined } from '../common/util';
import { FileUtil } from '../common/file-util';
import { NgxTranslateExtractor } from './ngx-translate-extractor';
import { dirname, isAbsolute, join } from 'path';
const PROFILE_CANDIDATES = ['package.json', '.angular-cli.json'];
export class XliffMergeParameters {
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
            this.errorsFound.push(new XliffMergeError('could not read profile "' + profilePath + '"'));
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
        if (!pathToAdjust || isAbsolute(pathToAdjust)) {
            return pathToAdjust;
        }
        return join(dirname(profilePath), pathToAdjust).replace(/\\/g, '/');
    }
    initializeFromConfig(profileContent) {
        if (!profileContent) {
            return;
        }
        const profile = profileContent.xliffmergeOptions;
        if (profile) {
            if (!isNullOrUndefined(profile.quiet)) {
                this._quiet = profile.quiet;
            }
            if (!isNullOrUndefined(profile.verbose)) {
                this._verbose = profile.verbose;
            }
            if (!isNullOrUndefined(profile.allowIdChange)) {
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
            if (!isNullOrUndefined(profile.removeUnusedIds)) {
                this._removeUnusedIds = profile.removeUnusedIds;
            }
            if (!isNullOrUndefined(profile.supportNgxTranslate)) {
                this._supportNgxTranslate = profile.supportNgxTranslate;
            }
            if (!isNullOrUndefined(profile.ngxTranslateExtractionPattern)) {
                this._ngxTranslateExtractionPattern = profile.ngxTranslateExtractionPattern;
            }
            if (!isNullOrUndefined(profile.useSourceAsTarget)) {
                this._useSourceAsTarget = profile.useSourceAsTarget;
            }
            if (!isNullOrUndefined(profile.targetPraefix)) {
                this._targetPraefix = profile.targetPraefix;
            }
            if (!isNullOrUndefined(profile.targetSuffix)) {
                this._targetSuffix = profile.targetSuffix;
            }
            if (!isNullOrUndefined(profile.autotranslate)) {
                this._autotranslate = profile.autotranslate;
            }
            if (!isNullOrUndefined(profile.beautifyOutput)) {
                this._beautifyOutput = profile.beautifyOutput;
            }
            if (!isNullOrUndefined(profile.preserveOrder)) {
                this._preserveOrder = profile.preserveOrder;
            }
            if (!isNullOrUndefined(profile.apikey)) {
                this._apikey = profile.apikey;
            }
            if (!isNullOrUndefined(profile.apikeyfile)) {
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
            this.errorsFound.push(new XliffMergeError('no languages specified'));
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
            this.errorsFound.push(new XliffMergeError('srcDir "' + this.srcDir() + '" is not a directory'));
        }
        // genDir should exists
        try {
            stats = fs.statSync(this.genDir());
        }
        catch (e) {
            err = e;
        }
        if (!!err || !stats.isDirectory()) {
            this.errorsFound.push(new XliffMergeError('genDir "' + this.genDir() + '" is not a directory'));
        }
        // master file MUST exist
        try {
            fs.accessSync(this.i18nFile(), fs.constants.R_OK);
        }
        catch (err) {
            this.errorsFound.push(new XliffMergeError('i18nFile "' + this.i18nFile() + '" is not readable'));
        }
        // i18nFormat must be xlf xlf2 or xmb
        if (!(this.i18nFormat() === 'xlf' || this.i18nFormat() === 'xlf2' || this.i18nFormat() === 'xmb')) {
            this.errorsFound.push(new XliffMergeError('i18nFormat "' + this.i18nFormat() + '" invalid, must be "xlf" or "xlf2" or "xmb"'));
        }
        // autotranslate requires api key
        if (this.autotranslate() && !this.apikey()) {
            this.errorsFound.push(new XliffMergeError('autotranslate requires an API key, please set one'));
        }
        // autotranslated languages must be in list of all languages
        this.autotranslatedLanguages().forEach((lang) => {
            if (this.languages().indexOf(lang) < 0) {
                this.errorsFound.push(new XliffMergeError('autotranslate language "' + lang + '" is not in list of languages'));
            }
            if (lang === this.defaultLanguage()) {
                this.errorsFound.push(new XliffMergeError('autotranslate language "' + lang + '" cannot be translated, because it is the source language'));
            }
        });
        // ngx translate pattern check
        if (this.supportNgxTranslate()) {
            const checkResult = NgxTranslateExtractor.checkPattern(this.ngxTranslateExtractionPattern());
            if (!isNullOrUndefined(checkResult)) {
                this.errorsFound.push(new XliffMergeError('ngxTranslateExtractionPattern "' + this.ngxTranslateExtractionPattern() + '": ' + checkResult));
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
            this.errorsFound.push(new XliffMergeError('language "' + lang + '" is not valid'));
        }
    }
    allowIdChange() {
        return (isNullOrUndefined(this._allowIdChange)) ? false : this._allowIdChange;
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
        return (isNullOrUndefined(this._verbose)) ? false : this._verbose;
    }
    quiet() {
        return (isNullOrUndefined(this._quiet)) ? false : this._quiet;
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
        return join(this.srcDir(), (this._i18nFile ? this._i18nFile : this.i18nBaseFile() + '.' + this.suffixForGeneratedI18nFile())).replace(/\\/g, '/');
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
        return join(this.genDir(), this.i18nBaseFile() + '.' + lang + '.' + this.suffixForGeneratedI18nFile()).replace(/\\/g, '/');
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
        return join(this.genDir(), this.i18nBaseFile() + '.' + lang + '.' + 'json').replace(/\\/g, '/');
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
        return (isNullOrUndefined(this._removeUnusedIds)) ? true : this._removeUnusedIds;
    }
    supportNgxTranslate() {
        return (isNullOrUndefined(this._supportNgxTranslate)) ? false : this._supportNgxTranslate;
    }
    ngxTranslateExtractionPattern() {
        return (isNullOrUndefined(this._ngxTranslateExtractionPattern)) ?
            NgxTranslateExtractor.DefaultExtractionPattern : this._ngxTranslateExtractionPattern;
    }
    /**
     * Whether source must be used as target for new trans-units
     * Default is true
     */
    useSourceAsTarget() {
        return (isNullOrUndefined(this._useSourceAsTarget)) ? true : this._useSourceAsTarget;
    }
    /**
     * Praefix used for target when copying new trans-units
     * Default is ""
     */
    targetPraefix() {
        return (isNullOrUndefined(this._targetPraefix)) ? '' : this._targetPraefix;
    }
    /**
     * Suffix used for target when copying new trans-units
     * Default is ""
     */
    targetSuffix() {
        return (isNullOrUndefined(this._targetSuffix)) ? '' : this._targetSuffix;
    }
    /**
     * If set, run xml result through beautifier (pretty-data).
     */
    beautifyOutput() {
        return (isNullOrUndefined(this._beautifyOutput)) ? false : this._beautifyOutput;
    }
    /**
     * If set, order of new trans units will be as in master.
     * Otherwise they are added at the end.
     */
    preserveOrder() {
        return (isNullOrUndefined(this._preserveOrder)) ? true : this._preserveOrder;
    }
    /**
     * Whether to use autotranslate for new trans-units
     * Default is false
     */
    autotranslate() {
        if (isNullOrUndefined(this._autotranslate)) {
            return false;
        }
        if (isArray(this._autotranslate)) {
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
        if (isNullOrUndefined(this._autotranslate) || this._autotranslate === false) {
            return [];
        }
        if (isArray(this._autotranslate)) {
            return this._autotranslate;
        }
        return this.languages().slice(1); // first is source language
    }
    /**
     * API key to be used for Google Translate
     * @return api key
     */
    apikey() {
        if (!isNullOrUndefined(this._apikey)) {
            return this._apikey;
        }
        else {
            const apikeyPath = this.apikeyfile();
            if (this.apikeyfile()) {
                if (fs.existsSync(apikeyPath)) {
                    return FileUtil.read(apikeyPath, 'utf-8');
                }
                else {
                    throw new Error(format('api key file not found: API_KEY_FILE=%s', apikeyPath));
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoieGxpZmYtbWVyZ2UtcGFyYW1ldGVycy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3Byb2plY3RzL3hsaWZmbWVyZ2Uvc3JjL3hsaWZmbWVyZ2UveGxpZmYtbWVyZ2UtcGFyYW1ldGVycy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7OztHQUlHO0FBRUgsT0FBTyxLQUFLLEVBQUUsTUFBTSxJQUFJLENBQUM7QUFDekIsT0FBTyxFQUFFLGVBQWUsRUFBRSxNQUFNLHFCQUFxQixDQUFDO0FBR3RELE9BQU8sRUFBRSxNQUFNLEVBQUUsTUFBTSxNQUFNLENBQUM7QUFDOUIsT0FBTyxFQUFFLE9BQU8sRUFBRSxpQkFBaUIsRUFBRSxNQUFNLGdCQUFnQixDQUFDO0FBRTVELE9BQU8sRUFBRSxRQUFRLEVBQUUsTUFBTSxxQkFBcUIsQ0FBQztBQUMvQyxPQUFPLEVBQUUscUJBQXFCLEVBQUUsTUFBTSwyQkFBMkIsQ0FBQztBQUNsRSxPQUFPLEVBQUUsT0FBTyxFQUFFLFVBQVUsRUFBRSxJQUFJLEVBQWEsTUFBTSxNQUFNLENBQUM7QUFFNUQsTUFBTSxrQkFBa0IsR0FBRyxDQUFDLGNBQWMsRUFBRSxtQkFBbUIsQ0FBQyxDQUFDO0FBRWpFLE1BQU0sT0FBTyxvQkFBb0I7SUF5QzdCO1FBQ0ksSUFBSSxDQUFDLFdBQVcsR0FBRyxFQUFFLENBQUM7UUFDdEIsSUFBSSxDQUFDLGFBQWEsR0FBRyxFQUFFLENBQUM7SUFDNUIsQ0FBQztJQWREOzs7O09BSUc7SUFDSSxNQUFNLENBQUMsaUJBQWlCLENBQUMsT0FBdUIsRUFBRSxjQUE0QjtRQUNqRixNQUFNLFVBQVUsR0FBRyxJQUFJLG9CQUFvQixFQUFFLENBQUM7UUFDOUMsVUFBVSxDQUFDLFNBQVMsQ0FBQyxPQUFPLEVBQUUsY0FBYyxDQUFDLENBQUM7UUFDOUMsT0FBTyxVQUFVLENBQUM7SUFDdEIsQ0FBQztJQU9EOzs7OztPQUtHO0lBQ0ssTUFBTSxDQUFDLG9CQUFvQixDQUFD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QUFPLElBQUksQ0FBQzthQUNmO1NBQ0o7SUFDTCxDQUFDO0lBRUQ7Ozs7T0FJRztJQUNJLFVBQVU7UUFDYixJQUFJLElBQUksQ0FBQyxXQUFXLEVBQUU7WUFDbEIsT0FBTyxJQUFJLENBQUMsV0FBVyxDQUFDO1NBQzNCO2FBQU0sSUFBSSxPQUFPLENBQUMsR0FBRyxDQUFDLFlBQVksRUFBRTtZQUNqQyxPQUFPLE9BQU8sQ0FBQyxHQUFHLENBQUMsWUFBWSxDQUFDO1NBQ25DO2FBQU07WUFDSCxPQUFPLElBQUksQ0FBQztTQUNmO0lBQ0wsQ0FBQztDQUNKIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXHJcbiAqIENyZWF0ZWQgYnkgbWFydGluIG9uIDE3LjAyLjIwMTcuXHJcbiAqIENvbGxlY3Rpb24gb2YgYWxsIHBhcmFtZXRlcnMgdXNlZCBieSB0aGUgdG9vbC5cclxuICogVGhlIHBhcmFtZXRlcnMgYXJlIHJlYWQgZm9ybSB0aGUgcHJvZmlsZSBvciBkZWZhdWx0cyBhcmUgdXNlZC5cclxuICovXHJcblxyXG5pbXBvcnQgKiBhcyBmcyBmcm9tICdmcyc7XHJcbmltcG9ydCB7IFhsaWZmTWVyZ2VFcnJvciB9IGZyb20gJy4veGxpZmYtbWVyZ2UtZXJyb3InO1xyXG5pbXBvcnQgeyBTdGF0cyB9IGZyb20gJ2ZzJztcclxuaW1wb3J0IHsgQ29tbWFuZE91dHB1dCB9IGZyb20gJy4uL2NvbW1vbi9jb21tYW5kLW91dHB1dCc7XHJcbmltcG9ydCB7IGZvcm1hdCB9IGZyb20gJ3V0aWwnO1xyXG5pbXBvcnQgeyBpc0FycmF5LCBpc051bGxPclVuZGVmaW5lZCB9IGZyb20gJy4uL2NvbW1vbi91dGlsJztcclxuaW1wb3J0IHsgUHJvZ3JhbU9wdGlvbnMsIElDb25maWdGaWxlIH0gZnJvbSAnLi9pLXhsaWZmLW1lcmdlLW9wdGlvbnMnO1xyXG5pbXBvcnQgeyBGaWxlVXRpbCB9IGZyb20gJy4uL2NvbW1vbi9maWxlLXV0aWwnO1xyXG5pbXBvcnQgeyBOZ3hUcmFuc2xhdGVFeHRyYWN0b3IgfSBmcm9tICcuL25neC10cmFuc2xhdGUtZXh0cmFjdG9yJztcclxuaW1wb3J0IHsgZGlybmFtZSwgaXNBYnNvbHV0ZSwgam9pbiwgbm9ybWFsaXplIH0gZnJvbSAncGF0aCc7XHJcblxyXG5jb25zdCBQUk9GSUxFX0NBTkRJREFURVMgPSBbJ3BhY2thZ2UuanNvbicsICcuYW5ndWxhci1jbGkuanNvbiddO1xyXG5cclxuZXhwb3J0IGNsYXNzIFhsaWZmTWVyZ2VQYXJhbWV0ZXJzIHtcclxuXHJcbiAgICBwcml2YXRlIHVzZWRQcm9maWxlUGF0aDogc3RyaW5nO1xyXG4gICAgcHJpdmF0ZSBfcXVpZXQ6IGJvb2xlYW47XHJcbiAgICBwcml2YXRlIF92ZXJib3NlOiBib29sZWFuO1xyXG4gICAgcHJpdmF0ZSBfYWxsb3dJZENoYW5nZTogYm9vbGVhbjtcclxuICAgIHByaXZhdGUgX2RlZmF1bHRMYW5ndWFnZTogc3RyaW5nO1xyXG4gICAgcHJpdmF0ZSBfc3JjRGlyOiBzdHJpbmc7XHJcbiAgICBwcml2YXRlIF9pMThuQmFzZUZpbGU6IHN0cmluZztcclxuICAgIHByaXZhdGUgX2kxOG5GaWxlOiBzdHJpbmc7XHJcbiAgICBwcml2YXRlIF9pMThuRm9ybWF0OiBzdHJpbmc7XHJcbiAgICBwcml2YXRlIF9lbmNvZGluZzogc3RyaW5nO1xyXG4gICAgcHJpdmF0ZSBfb3B0aW9uYWxNYXN0ZXJGaWxlUGF0aDogc3RyaW5nO1xyXG4gICAgcHJpdmF0ZSBfZ2VuRGlyOiBzdHJpbmc7XHJcbiAgICBwcml2YXRlIF9sYW5ndWFnZXM6IHN0cmluZ1tdO1xyXG4gICAgcHJpdmF0ZSBfcmVtb3ZlVW51c2VkSWRzOiBib29sZWFuO1xyXG4gICAgcHJpdmF0ZSBfc3VwcG9ydE5neFRyYW5zbGF0ZTogYm9vbGVhbjtcclxuICAgIHByaXZhdGUgX25neFRyYW5zbGF0ZUV4dHJhY3Rpb25QYXR0ZXJuOiBzdHJpbmc7XHJcbiAgICBwcml2YXRlIF91c2VTb3VyY2VBc1RhcmdldDogYm9vbGVhbjtcclxuICAgIHByaXZhdGUgX3RhcmdldFByYWVmaXg6IHN0cmluZztcclxuICAgIHByaXZhdGUgX3RhcmdldFN1ZmZpeDogc3RyaW5nO1xyXG4gICAgcHJpdmF0ZSBfYmVhdXRpZnlPdXRwdXQ6IGJvb2xlYW47XHJcbiAgICBwcml2YXRlIF9wcmVzZXJ2ZU9yZGVyOiBib29sZWFuO1xyXG4gICAgcHJpdmF0ZSBfYXV0b3RyYW5zbGF0ZTogYm9vbGVhbiB8IHN0cmluZ1tdO1xyXG4gICAgcHJpdmF0ZSBfYXBpa2V5OiBzdHJpbmc7XHJcbiAgICBwcml2YXRlIF9hcGlrZXlmaWxlOiBzdHJpbmc7XHJcblxyXG4gICAgcHVibGljIGVycm9yc0ZvdW5kOiBYbGlmZk1lcmdlRXJyb3JbXTtcclxuICAgIHB1YmxpYyB3YXJuaW5nc0ZvdW5kOiBzdHJpbmdbXTtcclxuXHJcbiAgICAvKipcclxuICAgICAqIENyZWF0ZSBQYXJhbWV0ZXJzLlxyXG4gICAgICogQHBhcmFtIG9wdGlvbnMgY29tbWFuZCBvcHRpb25zXHJcbiAgICAgKiBAcGFyYW0gcHJvZmlsZUNvbnRlbnQgZ2l2ZW4gcHJvZmlsZSAoaWYgbm90LCBpdCBpcyByZWFkIGZyb20gdGhlIHByb2ZpbGUgcGF0aCBmcm9tIG9wdGlvbnMpLlxyXG4gICAgICovXHJcbiAgICBwdWJsaWMgc3RhdGljIGNyZWF0ZUZyb21PcHRpb25zKG9wdGlvbnM6IFByb2dyYW1PcHRpb25zLCBwcm9maWxlQ29udGVudD86IElDb25maWdGaWxlKSB7XHJcbiAgICAgICAgY29uc3QgcGFyYW1ldGVycyA9IG5ldyBYbGlmZk1lcmdlUGFyYW1ldGVycygpO1xyXG4gICAgICAgIHBhcmFtZXRlcnMuY29uZmlndXJlKG9wdGlvbnMsIHByb2ZpbGVDb250ZW50KTtcclxuICAgICAgICByZXR1cm4gcGFyYW1ldGVycztcclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIGNvbnN0cnVjdG9yKCkge1xyXG4gICAgICAgIHRoaXMuZXJyb3JzRm91bmQgPSBbXTtcclxuICAgICAgICB0aGlzLndhcm5pbmdzRm91bmQgPSBbXTtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIFJlYWQgcG90ZW50aWFsIHByb2ZpbGUuXHJcbiAgICAgKiBUbyBiZSBhIGNhbmRpZGF0ZSwgZmlsZSBtdXN0IGV4aXN0IGFuZCBjb250YWluIHByb3BlcnR5IFwieGxpZmZtZXJnZU9wdGlvbnNcIi5cclxuICAgICAqIEBwYXJhbSBwcm9maWxlUGF0aCBwYXRoIG9mIHByb2ZpbGVcclxuICAgICAqIEByZXR1cm4gcGFyc2VkIGNvbnRlbnQgb2YgZmlsZSBvciBudWxsLCBpZiBmaWxlIGRvZXMgbm90IGV4aXN0IG9yIGlzIG5vdCBhIHByb2ZpbGUgY2FuZGlkYXRlLlxyXG4gICAgICovXHJcbiAgICBwcml2YXRlIHN0YXRpYyByZWFkUHJvZmlsZUNhbmRpZGF0ZShwcm9maWxlUGF0aDogc3RyaW5nKTogSUNvbmZpZ0ZpbGUge1xyXG4gICAgICAgIGxldCBjb250ZW50OiBzdHJpbmc7XHJcbiAgICAgICAgdHJ5IHtcclxuICAgICAgICAgICAgY29udGVudCA9IGZzLnJlYWRGaWxlU3luYyhwcm9maWxlUGF0aCwgJ1VURi04Jyk7XHJcbiAgICAgICAgfSBjYXRjaCAoZXJyKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBudWxsO1xyXG4gICAgICAgIH1cclxuICAgICAgICBjb25zdCBwYXJzZWRDb250ZW50OiBJQ29uZmlnRmlsZSA9IEpTT04ucGFyc2UoY29udGVudCk7XHJcbiAgICAgICAgaWYgKHBhcnNlZENvbnRlbnQgJiYgcGFyc2VkQ29udGVudC54bGlmZm1lcmdlT3B0aW9ucykge1xyXG4gICAgICAgICAgICByZXR1cm4gcGFyc2VkQ29udGVudDtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICByZXR1cm4gbnVsbDtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBJbml0aWFsaXplIG1lIGZyb20gdGhlIHByb2ZpbGUgY29udGVudC5cclxuICAgICAqIChwdWJsaWMgb25seSBmb3IgdGVzdCB1c2FnZSkuXHJcbiAgICAgKiBAcGFyYW0gb3B0aW9ucyBvcHRpb25zIGdpdmVuIGF0IHJ1bnRpbWUgdmlhIGNvbW1hbmQgbGluZVxyXG4gICAgICogQHBhcmFtIHByb2ZpbGVDb250ZW50IGlmIG51bGwsIHJlYWQgaXQgZnJvbSBwcm9maWxlLlxyXG4gICAgICovXHJcbiAgICBwcml2YXRlIGNvbmZpZ3VyZShvcHRpb25zOiBQcm9ncmFtT3B0aW9ucywgcHJvZmlsZUNvbnRlbnQ/OiBJQ29uZmlnRmlsZSkge1xyXG4gICAgICAgIHRoaXMuZXJyb3JzRm91bmQgPSBbXTtcclxuICAgICAgICB0aGlzLndhcm5pbmdzRm91bmQgPSBbXTtcclxuICAgICAgICBpZiAoIXByb2ZpbGVDb250ZW50KSB7XHJcbiAgICAgICAgICAgIHByb2ZpbGVDb250ZW50ID0gdGhpcy5yZWFkUHJvZmlsZShvcHRpb25zKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgY29uc3QgdmFsaWRQcm9maWxlOiBib29sZWFuID0gKCEhcHJvZmlsZUNvbnRlbnQpO1xyXG4gICAgICAgIGlmIChvcHRpb25zLnF1aWV0KSB7XHJcbiAgICAgICAgICAgIHRoaXMuX3F1aWV0ID0gb3B0aW9ucy5xdWlldDtcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKG9wdGlvbnMudmVyYm9zZSkge1xyXG4gICAgICAgICAgICB0aGlzLl92ZXJib3NlID0gb3B0aW9ucy52ZXJib3NlO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAodmFsaWRQcm9maWxlKSB7XHJcbiAgICAgICAgICAgIHRoaXMuaW5pdGlhbGl6ZUZyb21Db25maWcocHJvZmlsZUNvbnRlbnQpO1xyXG4gICAgICAgICAgICAvLyBpZiBsYW5ndWFnZXMgYXJlIGdpdmVuIGFzIHBhcmFtZXRlcnMsIHRoZXkgb3Z2ZXJpZGUgZXZlcnl0aGluZyBzYWlkIGluIHByb2ZpbGVcclxuICAgICAgICAgICAgaWYgKCEhb3B0aW9ucy5sYW5ndWFnZXMgJiYgb3B0aW9ucy5sYW5ndWFnZXMubGVuZ3RoID4gMCkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5fbGFuZ3VhZ2VzID0gb3B0aW9ucy5sYW5ndWFnZXM7XHJcbiAgICAgICAgICAgICAgICBpZiAoIXRoaXMuX2RlZmF1bHRMYW5ndWFnZSkge1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuX2RlZmF1bHRMYW5ndWFnZSA9IHRoaXMuX2xhbmd1YWdlc1swXTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB0aGlzLmNoZWNrUGFyYW1ldGVycygpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIFJlYWQgcHJvZmlsZS5cclxuICAgICAqIEBwYXJhbSBvcHRpb25zIHByb2dyYW0gb3B0aW9uc1xyXG4gICAgICogQHJldHVybiB0aGUgcmVhZCBwcm9maWxlIChlbXB0eSwgaWYgbm9uZSwgbnVsbCBpZiBlcnJvcnMpXHJcbiAgICAgKi9cclxuICAgIHByaXZhdGUgcmVhZFByb2ZpbGUob3B0aW9uczogUHJvZ3JhbU9wdGlvbnMpOiBJQ29uZmlnRmlsZSB7XHJcbiAgICAgICAgY29uc3QgcHJvZmlsZVBhdGg6IHN0cmluZyA9IG9wdGlvbnMucHJvZmlsZVBhdGg7XHJcbiAgICAgICAgaWYgKCFwcm9maWxlUGF0aCkge1xyXG4gICAgICAgICAgICBmb3IgKGNvbnN0IGNvbmZpZ2ZpbGVuYW1lIG9mIFBST0ZJTEVfQ0FORElEQVRFUykge1xyXG4gICAgICAgICAgICAgICAgY29uc3QgcHJvZmlsZSA9IFhsaWZmTWVyZ2VQYXJhbWV0ZXJzLnJlYWRQcm9maWxlQ2FuZGlkYXRlKGNvbmZpZ2ZpbGVuYW1lKTtcclxuICAgICAgICAgICAgICAgIGlmIChwcm9maWxlKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy51c2VkUHJvZmlsZVBhdGggPSBjb25maWdmaWxlbmFtZTtcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gcHJvZmlsZTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICByZXR1cm4ge307XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGxldCBjb250ZW50OiBzdHJpbmc7XHJcbiAgICAgICAgdHJ5IHtcclxuICAgICAgICAgICAgY29udGVudCA9IGZzLnJlYWRGaWxlU3luYyhwcm9maWxlUGF0aCwgJ1VURi04Jyk7XHJcbiAgICAgICAgfSBjYXRjaCAoZXJyKSB7XHJcbiAgICAgICAgICAgIHRoaXMuZXJyb3JzRm91bmQucHVzaChuZXcgWGxpZmZNZXJnZUVycm9yKCdjb3VsZCBub3QgcmVhZCBwcm9maWxlIFwiJyArIHByb2ZpbGVQYXRoICsgJ1wiJykpO1xyXG4gICAgICAgICAgICByZXR1cm4gbnVsbDtcclxuICAgICAgICB9XHJcbiAgICAgICAgdGhpcy51c2VkUHJvZmlsZVBhdGggPSBwcm9maWxlUGF0aDtcclxuICAgICAgICBjb25zdCBwcm9maWxlQ29udGVudDogSUNvbmZpZ0ZpbGUgPSBKU09OLnBhcnNlKGNvbnRlbnQpO1xyXG4gICAgICAgIC8vIHJlcGxhY2UgYWxsIHBhdGhlcyBpbiBvcHRpb25zIGJ5IGFic29sdXRlIHBhdGhzXHJcbiAgICAgICAgY29uc3QgeGxpZmZtZXJnZU9wdGlvbnMgPSBwcm9maWxlQ29udGVudC54bGlmZm1lcmdlT3B0aW9ucztcclxuICAgICAgICB4bGlmZm1lcmdlT3B0aW9ucy5zcmNEaXIgPSB0aGlzLmFkanVzdFBhdGhUb1Byb2ZpbGVQYXRoKHByb2ZpbGVQYXRoLCB4bGlmZm1lcmdlT3B0aW9ucy5zcmNEaXIpO1xyXG4gICAgICAgIHhsaWZmbWVyZ2VPcHRpb25zLmdlbkRpciA9IHRoaXMuYWRqdXN0UGF0aFRvUHJvZmlsZVBhdGgocHJvZmlsZVBhdGgsIHhsaWZmbWVyZ2VPcHRpb25zLmdlbkRpcik7XHJcbiAgICAgICAgaWYgKHhsaWZmbWVyZ2VPcHRpb25zLm9wdGlvbmFsTWFzdGVyRmlsZVBhdGgpIHtcclxuICAgICAgICAgICAgeGxpZmZtZXJnZU9wdGlvbnMub3B0aW9uYWxNYXN0ZXJGaWxlUGF0aCA9IHRoaXMuYWRqdXN0UGF0aFRvUHJvZmlsZVBhdGgocHJvZmlsZVBhdGgsIHhsaWZmbWVyZ2VPcHRpb25zLm9wdGlvbmFsTWFzdGVyRmlsZVBhdGgpO1xyXG4gICAgICAgIH1cclxuICAgICAgICB4bGlmZm1lcmdlT3B0aW9ucy5hcGlrZXlmaWxlID0gdGhpcy5hZGp1c3RQYXRoVG9Qcm9maWxlUGF0aChwcm9maWxlUGF0aCwgeGxpZmZtZXJnZU9wdGlvbnMuYXBpa2V5ZmlsZSk7XHJcbiAgICAgICAgcmV0dXJuIHByb2ZpbGVDb250ZW50O1xyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgYWRqdXN0UGF0aFRvUHJvZmlsZVBhdGgocHJvZmlsZVBhdGg6IHN0cmluZywgcGF0aFRvQWRqdXN0OiBzdHJpbmcgfCB1bmRlZmluZWQpOiBzdHJpbmcgfCB1bmRlZmluZWQge1xyXG4gICAgICAgIGlmICghcGF0aFRvQWRqdXN0IHx8IGlzQWJzb2x1dGUocGF0aFRvQWRqdXN0KSkge1xyXG4gICAgICAgICAgICByZXR1cm4gcGF0aFRvQWRqdXN0O1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gam9pbihkaXJuYW1lKHByb2ZpbGVQYXRoKSwgcGF0aFRvQWRqdXN0KS5yZXBsYWNlKC9cXFxcL2csICcvJyk7XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSBpbml0aWFsaXplRnJvbUNvbmZpZyhwcm9maWxlQ29udGVudDogSUNvbmZpZ0ZpbGUpIHtcclxuICAgICAgICBpZiAoIXByb2ZpbGVDb250ZW50KSB7XHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcbiAgICAgICAgY29uc3QgcHJvZmlsZSA9IHByb2ZpbGVDb250ZW50LnhsaWZmbWVyZ2VPcHRpb25zO1xyXG4gICAgICAgIGlmIChwcm9maWxlKSB7XHJcbiAgICAgICAgICAgIGlmICghaXNOdWxsT3JVbmRlZmluZWQocHJvZmlsZS5xdWlldCkpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuX3F1aWV0ID0gcHJvZmlsZS5xdWlldDtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBpZiAoIWlzTnVsbE9yVW5kZWZpbmVkKHByb2ZpbGUudmVyYm9zZSkpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuX3ZlcmJvc2UgPSBwcm9maWxlLnZlcmJvc2U7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgaWYgKCFpc051bGxPclVuZGVmaW5lZChwcm9maWxlLmFsbG93SWRDaGFuZ2UpKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLl9hbGxvd0lkQ2hhbmdlID0gcHJvZmlsZS5hbGxvd0lkQ2hhbmdlO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGlmIChwcm9maWxlLmRlZmF1bHRMYW5ndWFnZSkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5fZGVmYXVsdExhbmd1YWdlID0gcHJvZmlsZS5kZWZhdWx0TGFuZ3VhZ2U7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgaWYgKHByb2ZpbGUubGFuZ3VhZ2VzKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLl9sYW5ndWFnZXMgPSBwcm9maWxlLmxhbmd1YWdlcztcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBpZiAocHJvZmlsZS5zcmNEaXIpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuX3NyY0RpciA9IHByb2ZpbGUuc3JjRGlyO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGlmIChwcm9maWxlLmFuZ3VsYXJDb21waWxlck9wdGlvbnMpIHtcclxuICAgICAgICAgICAgICAgIGlmIChwcm9maWxlLmFuZ3VsYXJDb21waWxlck9wdGlvbnMuZ2VuRGlyKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5fZ2VuRGlyID0gcHJvZmlsZS5hbmd1bGFyQ29tcGlsZXJPcHRpb25zLmdlbkRpcjtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBpZiAocHJvZmlsZS5nZW5EaXIpIHtcclxuICAgICAgICAgICAgICAgIC8vIHRoaXMgbXVzdCBiZSBhZnRlciBhbmd1bGFyQ29tcGlsZXJPcHRpb25zIHRvIGJlIHByZWZlcnJlZFxyXG4gICAgICAgICAgICAgICAgdGhpcy5fZ2VuRGlyID0gcHJvZmlsZS5nZW5EaXI7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgaWYgKHByb2ZpbGUub3B0aW9uYWxNYXN0ZXJGaWxlUGF0aCkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5fb3B0aW9uYWxNYXN0ZXJGaWxlUGF0aCA9IHByb2ZpbGUub3B0aW9uYWxNYXN0ZXJGaWxlUGF0aDtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBpZiAocHJvZmlsZS5pMThuQmFzZUZpbGUpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuX2kxOG5CYXNlRmlsZSA9IHByb2ZpbGUuaTE4bkJhc2VGaWxlO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGlmIChwcm9maWxlLmkxOG5GaWxlKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLl9pMThuRmlsZSA9IHByb2ZpbGUuaTE4bkZpbGU7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgaWYgKHByb2ZpbGUuaTE4bkZvcm1hdCkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5faTE4bkZvcm1hdCA9IHByb2ZpbGUuaTE4bkZvcm1hdDtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBpZiAocHJvZmlsZS5lbmNvZGluZykge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5fZW5jb2RpbmcgPSBwcm9maWxlLmVuY29kaW5nO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGlmICghaXNOdWxsT3JVbmRlZmluZWQocHJvZmlsZS5yZW1vdmVVbnVzZWRJZHMpKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLl9yZW1vdmVVbnVzZWRJZHMgPSBwcm9maWxlLnJlbW92ZVVudXNlZElkcztcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBpZiAoIWlzTnVsbE9yVW5kZWZpbmVkKHByb2ZpbGUuc3VwcG9ydE5neFRyYW5zbGF0ZSkpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuX3N1cHBvcnROZ3hUcmFuc2xhdGUgPSBwcm9maWxlLnN1cHBvcnROZ3hUcmFuc2xhdGU7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgaWYgKCFpc051bGxPclVuZGVmaW5lZChwcm9maWxlLm5neFRyYW5zbGF0ZUV4dHJhY3Rpb25QYXR0ZXJuKSkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5fbmd4VHJhbnNsYXRlRXh0cmFjdGlvblBhdHRlcm4gPSBwcm9maWxlLm5neFRyYW5zbGF0ZUV4dHJhY3Rpb25QYXR0ZXJuO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGlmICghaXNOdWxsT3JVbmRlZmluZWQocHJvZmlsZS51c2VTb3VyY2VBc1RhcmdldCkpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuX3VzZVNvdXJjZUFzVGFyZ2V0ID0gcHJvZmlsZS51c2VTb3VyY2VBc1RhcmdldDtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBpZiAoIWlzTnVsbE9yVW5kZWZpbmVkKHByb2ZpbGUudGFyZ2V0UHJhZWZpeCkpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuX3RhcmdldFByYWVmaXggPSBwcm9maWxlLnRhcmdldFByYWVmaXg7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgaWYgKCFpc051bGxPclVuZGVmaW5lZChwcm9maWxlLnRhcmdldFN1ZmZpeCkpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuX3RhcmdldFN1ZmZpeCA9IHByb2ZpbGUudGFyZ2V0U3VmZml4O1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGlmICghaXNOdWxsT3JVbmRlZmluZWQocHJvZmlsZS5hdXRvdHJhbnNsYXRlKSkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5fYXV0b3RyYW5zbGF0ZSA9IHByb2ZpbGUuYXV0b3RyYW5zbGF0ZTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBpZiAoIWlzTnVsbE9yVW5kZWZpbmVkKHByb2ZpbGUuYmVhdXRpZnlPdXRwdXQpKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLl9iZWF1dGlmeU91dHB1dCA9IHByb2ZpbGUuYmVhdXRpZnlPdXRwdXQ7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgaWYgKCFpc051bGxPclVuZGVmaW5lZChwcm9maWxlLnByZXNlcnZlT3JkZXIpKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLl9wcmVzZXJ2ZU9yZGVyID0gcHJvZmlsZS5wcmVzZXJ2ZU9yZGVyO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGlmICghaXNOdWxsT3JVbmRlZmluZWQocHJvZmlsZS5hcGlrZXkpKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLl9hcGlrZXkgPSBwcm9maWxlLmFwaWtleTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBpZiAoIWlzTnVsbE9yVW5kZWZpbmVkKHByb2ZpbGUuYXBpa2V5ZmlsZSkpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuX2FwaWtleWZpbGUgPSBwcm9maWxlLmFwaWtleWZpbGU7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICB0aGlzLndhcm5pbmdzRm91bmQucHVzaCgnZGlkIG5vdCBmaW5kIFwieGxpZmZtZXJnZU9wdGlvbnNcIiBpbiBwcm9maWxlLCB1c2luZyBkZWZhdWx0cycpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIENoZWNrIGFsbCBQYXJhbWV0ZXJzLCB3ZXRoZXIgdGhleSBhcmUgY29tcGxldGUgYW5kIGNvbnNpc3RlbnQuXHJcbiAgICAgKiBpZiBzb21ldGhpbmcgaXMgd3Jvbmcgd2l0aCB0aGUgcGFyYW1ldGVycywgaXQgaXMgY29sbGVjdGVkIGluIGVycm9yc0ZvdW5kLlxyXG4gICAgICovXHJcbiAgICBwcml2YXRlIGNoZWNrUGFyYW1ldGVycygpOiB2b2lkIHtcclxuICAgICAgICB0aGlzLmNoZWNrTGFuZ3VhZ2VTeW50YXgodGhpcy5kZWZhdWx0TGFuZ3VhZ2UoKSk7XHJcbiAgICAgICAgaWYgKHRoaXMubGFuZ3VhZ2VzKCkubGVuZ3RoID09PSAwKSB7XHJcbiAgICAgICAgICAgIHRoaXMuZXJyb3JzRm91bmQucHVzaChuZXcgWGxpZmZNZXJnZUVycm9yKCdubyBsYW5ndWFnZXMgc3BlY2lmaWVkJykpO1xyXG4gICAgICAgIH1cclxuICAgICAgICB0aGlzLmxhbmd1YWdlcygpLmZvckVhY2goKGxhbmcpID0+IHtcclxuICAgICAgICAgICAgdGhpcy5jaGVja0xhbmd1YWdlU3ludGF4KGxhbmcpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIGxldCBzdGF0czogU3RhdHM7XHJcbiAgICAgICAgbGV0IGVycjogYW55O1xyXG4gICAgICAgIC8vIHNyY0RpciBzaG91bGQgZXhpc3RzXHJcbiAgICAgICAgdHJ5IHtcclxuICAgICAgICAgICAgc3RhdHMgPSBmcy5zdGF0U3luYyh0aGlzLnNyY0RpcigpKTtcclxuICAgICAgICB9IGNhdGNoIChlKSB7XHJcbiAgICAgICAgICAgIGVyciA9IGU7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmICghIWVyciB8fCAhc3RhdHMuaXNEaXJlY3RvcnkoKSkge1xyXG4gICAgICAgICAgICB0aGlzLmVycm9yc0ZvdW5kLnB1c2gobmV3IFhsaWZmTWVyZ2VFcnJvcignc3JjRGlyIFwiJyArIHRoaXMuc3JjRGlyKCkgKyAnXCIgaXMgbm90IGEgZGlyZWN0b3J5JykpO1xyXG4gICAgICAgIH1cclxuICAgICAgICAvLyBnZW5EaXIgc2hvdWxkIGV4aXN0c1xyXG4gICAgICAgIHRyeSB7XHJcbiAgICAgICAgICAgIHN0YXRzID0gZnMuc3RhdFN5bmModGhpcy5nZW5EaXIoKSk7XHJcbiAgICAgICAgfSBjYXRjaCAoZSkge1xyXG4gICAgICAgICAgICBlcnIgPSBlO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAoISFlcnIgfHwgIXN0YXRzLmlzRGlyZWN0b3J5KCkpIHtcclxuICAgICAgICAgICAgdGhpcy5lcnJvcnNGb3VuZC5wdXNoKG5ldyBYbGlmZk1lcmdlRXJyb3IoJ2dlbkRpciBcIicgKyB0aGlzLmdlbkRpcigpICsgJ1wiIGlzIG5vdCBhIGRpcmVjdG9yeScpKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgLy8gbWFzdGVyIGZpbGUgTVVTVCBleGlzdFxyXG4gICAgICAgIHRyeSB7XHJcbiAgICAgICAgICAgIGZzLmFjY2Vzc1N5bmModGhpcy5pMThuRmlsZSgpLCBmcy5jb25zdGFudHMuUl9PSyk7XHJcbiAgICAgICAgfSBjYXRjaCAoZXJyKSB7XHJcbiAgICAgICAgICAgIHRoaXMuZXJyb3JzRm91bmQucHVzaChuZXcgWGxpZmZNZXJnZUVycm9yKCdpMThuRmlsZSBcIicgKyB0aGlzLmkxOG5GaWxlKCkgKyAnXCIgaXMgbm90IHJlYWRhYmxlJykpO1xyXG4gICAgICAgIH1cclxuICAgICAgICAvLyBpMThuRm9ybWF0IG11c3QgYmUgeGxmIHhsZjIgb3IgeG1iXHJcbiAgICAgICAgaWYgKCEodGhpcy5pMThuRm9ybWF0KCkgPT09ICd4bGYnIHx8IHRoaXMuaTE4bkZvcm1hdCgpID09PSAneGxmMicgfHwgdGhpcy5pMThuRm9ybWF0KCkgPT09ICd4bWInKSkge1xyXG4gICAgICAgICAgICB0aGlzLmVycm9yc0ZvdW5kLnB1c2gobmV3IFhsaWZmTWVyZ2VFcnJvcignaTE4bkZvcm1hdCBcIicgKyB0aGlzLmkxOG5Gb3JtYXQoKSArICdcIiBpbnZhbGlkLCBtdXN0IGJlIFwieGxmXCIgb3IgXCJ4bGYyXCIgb3IgXCJ4bWJcIicpKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgLy8gYXV0b3RyYW5zbGF0ZSByZXF1aXJlcyBhcGkga2V5XHJcbiAgICAgICAgaWYgKHRoaXMuYXV0b3RyYW5zbGF0ZSgpICYmICF0aGlzLmFwaWtleSgpKSB7XHJcbiAgICAgICAgICAgIHRoaXMuZXJyb3JzRm91bmQucHVzaChuZXcgWGxpZmZNZXJnZUVycm9yKCdhdXRvdHJhbnNsYXRlIHJlcXVpcmVzIGFuIEFQSSBrZXksIHBsZWFzZSBzZXQgb25lJykpO1xyXG4gICAgICAgIH1cclxuICAgICAgICAvLyBhdXRvdHJhbnNsYXRlZCBsYW5ndWFnZXMgbXVzdCBiZSBpbiBsaXN0IG9mIGFsbCBsYW5ndWFnZXNcclxuICAgICAgICB0aGlzLmF1dG90cmFuc2xhdGVkTGFuZ3VhZ2VzKCkuZm9yRWFjaCgobGFuZykgPT4ge1xyXG4gICAgICAgICAgICBpZiAodGhpcy5sYW5ndWFnZXMoKS5pbmRleE9mKGxhbmcpIDwgMCkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5lcnJvcnNGb3VuZC5wdXNoKG5ldyBYbGlmZk1lcmdlRXJyb3IoJ2F1dG90cmFuc2xhdGUgbGFuZ3VhZ2UgXCInICsgbGFuZyArICdcIiBpcyBub3QgaW4gbGlzdCBvZiBsYW5ndWFnZXMnKSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgaWYgKGxhbmcgPT09IHRoaXMuZGVmYXVsdExhbmd1YWdlKCkpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuZXJyb3JzRm91bmQucHVzaChcclxuICAgICAgICAgICAgICAgICAgICBuZXcgWGxpZmZNZXJnZUVycm9yKCdhdXRvdHJhbnNsYXRlIGxhbmd1YWdlIFwiJyArIGxhbmcgKyAnXCIgY2Fubm90IGJlIHRyYW5zbGF0ZWQsIGJlY2F1c2UgaXQgaXMgdGhlIHNvdXJjZSBsYW5ndWFnZScpKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIC8vIG5neCB0cmFuc2xhdGUgcGF0dGVybiBjaGVja1xyXG4gICAgICAgIGlmICh0aGlzLnN1cHBvcnROZ3hUcmFuc2xhdGUoKSkge1xyXG4gICAgICAgICAgICBjb25zdCBjaGVja1Jlc3VsdCA9IE5neFRyYW5zbGF0ZUV4dHJhY3Rvci5jaGVja1BhdHRlcm4odGhpcy5uZ3hUcmFuc2xhdGVFeHRyYWN0aW9uUGF0dGVybigpKTtcclxuICAgICAgICAgICAgaWYgKCFpc051bGxPclVuZGVmaW5lZChjaGVja1Jlc3VsdCkpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuZXJyb3JzRm91bmQucHVzaChcclxuICAgICAgICAgICAgICAgICAgICBuZXcgWGxpZmZNZXJnZUVycm9yKCduZ3hUcmFuc2xhdGVFeHRyYWN0aW9uUGF0dGVybiBcIicgKyB0aGlzLm5neFRyYW5zbGF0ZUV4dHJhY3Rpb25QYXR0ZXJuKCkgKyAnXCI6ICcgKyBjaGVja1Jlc3VsdCkpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIC8vIHRhcmdldFByYWVmaXggYW5kIHRhcmdldFN1ZmZpeCBjaGVja1xyXG4gICAgICAgIGlmICghdGhpcy51c2VTb3VyY2VBc1RhcmdldCgpKSB7XHJcbiAgICAgICAgICAgIGlmICh0aGlzLnRhcmdldFByYWVmaXgoKS5sZW5ndGggPiAwKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLndhcm5pbmdzRm91bmQucHVzaChcclxuICAgICAgICAgICAgICAgICAgICAnY29uZmlndXJlZCB0YXJnZXRQcmFlZml4IFwiJyArIHRoaXMudGFyZ2V0UHJhZWZpeCgpICsgJ1wiIHdpbGwgbm90IGJlIHVzZWQgYmVjYXVzZSBcInVzZVNvdXJjZUFzVGFyZ2V0XCIgaXMgZGlzYWJsZWRcIicpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGlmICh0aGlzLnRhcmdldFN1ZmZpeCgpLmxlbmd0aCA+IDApIHtcclxuICAgICAgICAgICAgICAgIHRoaXMud2FybmluZ3NGb3VuZC5wdXNoKFxyXG4gICAgICAgICAgICAgICAgICAgICdjb25maWd1cmVkIHRhcmdldFN1ZmZpeCBcIicgKyB0aGlzLnRhcmdldFN1ZmZpeCgpICsgJ1wiIHdpbGwgbm90IGJlIHVzZWQgYmVjYXVzZSBcInVzZVNvdXJjZUFzVGFyZ2V0XCIgaXMgZGlzYWJsZWRcIicpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogQ2hlY2sgc3ludGF4IG9mIGxhbmd1YWdlLlxyXG4gICAgICogTXVzdCBiZSBjb21wYXRpYmxlIHdpdGggWE1MIFNjaGVtYSB0eXBlIHhzZDpsYW5ndWFnZS5cclxuICAgICAqIFBhdHRlcm46IFthLXpBLVpdezEsOH0oKC18XylbYS16QS1aMC05XXsxLDh9KSpcclxuICAgICAqIEBwYXJhbSBsYW5nIGxhbmd1YWdlIHRvIGNoZWNrXHJcbiAgICAgKi9cclxuICAgIHByaXZhdGUgY2hlY2tMYW5ndWFnZVN5bnRheChsYW5nOiBzdHJpbmcpIHtcclxuICAgICAgICBjb25zdCBwYXR0ZXJuID0gL15bYS16QS1aXXsxLDh9KFstX11bYS16QS1aMC05XXsxLDh9KSokLztcclxuICAgICAgICBpZiAoIXBhdHRlcm4udGVzdChsYW5nKSkge1xyXG4gICAgICAgICAgICB0aGlzLmVycm9yc0ZvdW5kLnB1c2gobmV3IFhsaWZmTWVyZ2VFcnJvcignbGFuZ3VhZ2UgXCInICsgbGFuZyArICdcIiBpcyBub3QgdmFsaWQnKSk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyBhbGxvd0lkQ2hhbmdlKCk6IGJvb2xlYW4ge1xyXG4gICAgICAgIHJldHVybiAoaXNOdWxsT3JVbmRlZmluZWQodGhpcy5fYWxsb3dJZENoYW5nZSkpID8gZmFsc2UgOiB0aGlzLl9hbGxvd0lkQ2hhbmdlO1xyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyBvcHRpb25hbE1hc3RlckZpbGVQYXRoKGxhbmc/OiBzdHJpbmcpOiBzdHJpbmcge1xyXG4gICAgICAgIGlmIChsYW5nKSB7XHJcbiAgICAgICAgICAgIGlmICh0aGlzLl9vcHRpb25hbE1hc3RlckZpbGVQYXRoKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5fb3B0aW9uYWxNYXN0ZXJGaWxlUGF0aC5yZXBsYWNlKGAuJHt0aGlzLmkxOG5Gb3JtYXQoKX1gLCBgLiR7bGFuZ30uJHt0aGlzLmkxOG5Gb3JtYXQoKX1gKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICByZXR1cm4gbnVsbDtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICByZXR1cm4gdGhpcy5fb3B0aW9uYWxNYXN0ZXJGaWxlUGF0aDtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIHZlcmJvc2UoKTogYm9vbGVhbiB7XHJcbiAgICAgICAgcmV0dXJuIChpc051bGxPclVuZGVmaW5lZCh0aGlzLl92ZXJib3NlKSkgPyBmYWxzZSA6IHRoaXMuX3ZlcmJvc2U7XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIHF1aWV0KCk6IGJvb2xlYW4ge1xyXG4gICAgICAgIHJldHVybiAoaXNOdWxsT3JVbmRlZmluZWQodGhpcy5fcXVpZXQpKSA/IGZhbHNlIDogdGhpcy5fcXVpZXQ7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBEZWJ1ZyBvdXRwdXQgYWxsIHBhcmFtZXRlcnMgdG8gY29tbWFuZE91dHB1dC5cclxuICAgICAqL1xyXG4gICAgcHVibGljIHNob3dBbGxQYXJhbWV0ZXJzKGNvbW1hbmRPdXRwdXQ6IENvbW1hbmRPdXRwdXQpOiB2b2lkIHtcclxuICAgICAgICBjb21tYW5kT3V0cHV0LmRlYnVnKCd4bGlmZm1lcmdlIFVzZWQgUGFyYW1ldGVyczonKTtcclxuICAgICAgICBjb21tYW5kT3V0cHV0LmRlYnVnKCd1c2VkUHJvZmlsZVBhdGg6XFx0XCIlc1wiJywgdGhpcy51c2VkUHJvZmlsZVBhdGgpO1xyXG4gICAgICAgIGNvbW1hbmRPdXRwdXQuZGVidWcoJ2RlZmF1bHRMYW5ndWFnZTpcXHRcIiVzXCInLCB0aGlzLmRlZmF1bHRMYW5ndWFnZSgpKTtcclxuICAgICAgICBjb21tYW5kT3V0cHV0LmRlYnVnKCdzcmNEaXI6XFx0XCIlc1wiJywgdGhpcy5zcmNEaXIoKSk7XHJcbiAgICAgICAgY29tbWFuZE91dHB1dC5kZWJ1ZygnZ2VuRGlyOlxcdFwiJXNcIicsIHRoaXMuZ2VuRGlyKCkpO1xyXG4gICAgICAgIGNvbW1hbmRPdXRwdXQuZGVidWcoJ29wdGlvbmFsTWFzdGVyRmlsZVBhdGg6XFx0XCIlc1wiJywgdGhpcy5vcHRpb25hbE1hc3RlckZpbGVQYXRoKCkpO1xyXG4gICAgICAgIGNvbW1hbmRPdXRwdXQuZGVidWcoJ2kxOG5CYXNlRmlsZTpcXHRcIiVzXCInLCB0aGlzLmkxOG5CYXNlRmlsZSgpKTtcclxuICAgICAgICBjb21tYW5kT3V0cHV0LmRlYnVnKCdpMThuRmlsZTpcXHRcIiVzXCInLCB0aGlzLmkxOG5GaWxlKCkpO1xyXG4gICAgICAgIGNvbW1hbmRPdXRwdXQuZGVidWcoJ2xhbmd1YWdlczpcXHQlcycsIHRoaXMubGFuZ3VhZ2VzKCkpO1xyXG4gICAgICAgIGZvciAoY29uc3QgbGFuZ3VhZ2Ugb2YgdGhpcy5sYW5ndWFnZXMoKSkge1xyXG4gICAgICAgICAgICBjb21tYW5kT3V0cHV0LmRlYnVnKCdvdXRwdXRGaWxlWyVzXTpcXHQlcycsIGxhbmd1YWdlLCB0aGlzLmdlbmVyYXRlZEkxOG5GaWxlKGxhbmd1YWdlKSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGNvbW1hbmRPdXRwdXQuZGVidWcoJ3JlbW92ZVVudXNlZElkczpcXHQlcycsIHRoaXMucmVtb3ZlVW51c2VkSWRzKCkpO1xyXG4gICAgICAgIGNvbW1hbmRPdXRwdXQuZGVidWcoJ3N1cHBvcnROZ3hUcmFuc2xhdGU6XFx0JXMnLCB0aGlzLnN1cHBvcnROZ3hUcmFuc2xhdGUoKSk7XHJcbiAgICAgICAgaWYgKHRoaXMuc3VwcG9ydE5neFRyYW5zbGF0ZSgpKSB7XHJcbiAgICAgICAgICAgIGNvbW1hbmRPdXRwdXQuZGVidWcoJ25neFRyYW5zbGF0ZUV4dHJhY3Rpb25QYXR0ZXJuOlxcdCVzJywgdGhpcy5uZ3hUcmFuc2xhdGVFeHRyYWN0aW9uUGF0dGVybigpKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgY29tbWFuZE91dHB1dC5kZWJ1ZygndXNlU291cmNlQXNUYXJnZXQ6XFx0JXMnLCB0aGlzLnVzZVNvdXJjZUFzVGFyZ2V0KCkpO1xyXG4gICAgICAgIGlmICh0aGlzLnVzZVNvdXJjZUFzVGFyZ2V0KCkpIHtcclxuICAgICAgICAgICAgY29tbWFuZE91dHB1dC5kZWJ1ZygndGFyZ2V0UHJhZWZpeDpcXHRcIiVzXCInLCB0aGlzLnRhcmdldFByYWVmaXgoKSk7XHJcbiAgICAgICAgICAgIGNvbW1hbmRPdXRwdXQuZGVidWcoJ3RhcmdldFN1ZmZpeDpcXHRcIiVzXCInLCB0aGlzLnRhcmdldFN1ZmZpeCgpKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgY29tbWFuZE91dHB1dC5kZWJ1ZygnYWxsb3dJZENoYW5nZTpcXHQlcycsIHRoaXMuYWxsb3dJZENoYW5nZSgpKTtcclxuICAgICAgICBjb21tYW5kT3V0cHV0LmRlYnVnKCdiZWF1dGlmeU91dHB1dDpcXHQlcycsIHRoaXMuYmVhdXRpZnlPdXRwdXQoKSk7XHJcbiAgICAgICAgY29tbWFuZE91dHB1dC5kZWJ1ZygncHJlc2VydmVPcmRlcjpcXHQlcycsIHRoaXMucHJlc2VydmVPcmRlcigpKTtcclxuICAgICAgICBjb21tYW5kT3V0cHV0LmRlYnVnKCdhdXRvdHJhbnNsYXRlOlxcdCVzJywgdGhpcy5hdXRvdHJhbnNsYXRlKCkpO1xyXG4gICAgICAgIGlmICh0aGlzLmF1dG90cmFuc2xhdGUoKSkge1xyXG4gICAgICAgICAgICBjb21tYW5kT3V0cHV0LmRlYnVnKCdhdXRvdHJhbnNsYXRlZCBsYW5ndWFnZXM6XFx0JXMnLCB0aGlzLmF1dG90cmFuc2xhdGVkTGFuZ3VhZ2VzKCkpO1xyXG4gICAgICAgICAgICBjb21tYW5kT3V0cHV0LmRlYnVnKCdhcGlrZXk6XFx0JXMnLCB0aGlzLmFwaWtleSgpID8gJyoqKionIDogJ05PVCBTRVQnKTtcclxuICAgICAgICAgICAgY29tbWFuZE91dHB1dC5kZWJ1ZygnYXBpa2V5ZmlsZTpcXHQlcycsIHRoaXMuYXBpa2V5ZmlsZSgpKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBEZWZhdWx0LUxhbmd1YWdlLCBkZWZhdWx0IGVuLlxyXG4gICAgICogQHJldHVybiBkZWZhdWx0IGxhbmd1YWdlXHJcbiAgICAgKi9cclxuICAgIHB1YmxpYyBkZWZhdWx0TGFuZ3VhZ2UoKTogc3RyaW5nIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5fZGVmYXVsdExhbmd1YWdlID8gdGhpcy5fZGVmYXVsdExhbmd1YWdlIDogJ2VuJztcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIExpc3RlIGRlciB6dSBiZWFyYmVpdGVuZGVuIFNwcmFjaGVuLlxyXG4gICAgICogQHJldHVybiBsYW5ndWFnZXNcclxuICAgICAqL1xyXG4gICAgcHVibGljIGxhbmd1YWdlcygpOiBzdHJpbmdbXSB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuX2xhbmd1YWdlcyA/IHRoaXMuX2xhbmd1YWdlcyA6IFtdO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogc3JjIGRpcmVjdG9yeSwgd2hlcmUgdGhlIG1hc3RlciB4bGlmIGlzIGxvY2F0ZWQuXHJcbiAgICAgKiBAcmV0dXJuIHNyY0RpclxyXG4gICAgICovXHJcbiAgICBwdWJsaWMgc3JjRGlyKCk6IHN0cmluZyB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuX3NyY0RpciA/IHRoaXMuX3NyY0RpciA6ICcuJztcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIFRoZSBiYXNlIGZpbGUgbmFtZSBvZiB0aGUgeGxpZiBmaWxlIGZvciBpbnB1dCBhbmQgb3V0cHV0LlxyXG4gICAgICogRGVmYXVsdCBpcyBtZXNzYWdlc1xyXG4gICAgICogQHJldHVybiBiYXNlIGZpbGVcclxuICAgICAqL1xyXG4gICAgcHVibGljIGkxOG5CYXNlRmlsZSgpOiBzdHJpbmcge1xyXG4gICAgICAgIHJldHVybiB0aGlzLl9pMThuQmFzZUZpbGUgPyB0aGlzLl9pMThuQmFzZUZpbGUgOiAnbWVzc2FnZXMnO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogVGhlIG1hc3RlciB4bGlmIGZpbGUgKHRoZSBvbmUgZ2VuZXJhdGVkIGJ5IG5nLXhpMThuKS5cclxuICAgICAqIERlZmF1bHQgaXMgPHNyY0Rpcj4vPGkxOG5CYXNlRmlsZT4ueGxmLlxyXG4gICAgICogQHJldHVybiBtYXN0ZXIgZmlsZVxyXG4gICAgICovXHJcbiAgICBwdWJsaWMgaTE4bkZpbGUoKTogc3RyaW5nIHtcclxuICAgICAgICByZXR1cm4gam9pbih0aGlzLnNyY0RpcigpLFxyXG4gICAgICAgICAgICAodGhpcy5faTE4bkZpbGUgPyB0aGlzLl9pMThuRmlsZSA6IHRoaXMuaTE4bkJhc2VGaWxlKCkgKyAnLicgKyB0aGlzLnN1ZmZpeEZvckdlbmVyYXRlZEkxOG5GaWxlKCkpXHJcbiAgICAgICAgKS5yZXBsYWNlKC9cXFxcL2csICcvJyk7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBGb3JtYXQgb2YgdGhlIG1hc3RlciB4bGlmIGZpbGUuXHJcbiAgICAgKiBEZWZhdWx0IGlzIFwieGxmXCIsIHBvc3NpYmxlIGFyZSBcInhsZlwiIG9yIFwieGxmMlwiIG9yIFwieG1iXCIuXHJcbiAgICAgKiBAcmV0dXJuIGZvcm1hdFxyXG4gICAgICovXHJcbiAgICBwdWJsaWMgaTE4bkZvcm1hdCgpOiBzdHJpbmcge1xyXG4gICAgICAgIHJldHVybiAodGhpcy5faTE4bkZvcm1hdCA/IHRoaXMuX2kxOG5Gb3JtYXQgOiAneGxmJyk7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBwb3RlbnRpYWxseSB0byBiZSBnZW5lcmF0ZWQgSTE4bi1GaWxlIHdpdGggdGhlIHRyYW5zbGF0aW9ucyBmb3Igb25lIGxhbmd1YWdlLlxyXG4gICAgICogQHBhcmFtIGxhbmcgbGFuZ3VhZ2Ugc2hvcnRjdXRcclxuICAgICAqIEByZXR1cm4gUGF0aCBvZiBmaWxlXHJcbiAgICAgKi9cclxuICAgIHB1YmxpYyBnZW5lcmF0ZWRJMThuRmlsZShsYW5nOiBzdHJpbmcpOiBzdHJpbmcge1xyXG4gICAgICAgIHJldHVybiBqb2luKHRoaXMuZ2VuRGlyKCksIHRoaXMuaTE4bkJhc2VGaWxlKCkgKyAnLicgKyBsYW5nICsgJy4nICsgdGhpcy5zdWZmaXhGb3JHZW5lcmF0ZWRJMThuRmlsZSgpKS5yZXBsYWNlKC9cXFxcL2csICcvJyk7XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSBzdWZmaXhGb3JHZW5lcmF0ZWRJMThuRmlsZSgpOiBzdHJpbmcge1xyXG4gICAgICAgIHN3aXRjaCAodGhpcy5pMThuRm9ybWF0KCkpIHtcclxuICAgICAgICAgICAgY2FzZSAneGxmJzpcclxuICAgICAgICAgICAgICAgIHJldHVybiAneGxmJztcclxuICAgICAgICAgICAgY2FzZSAneGxmMic6XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gJ3hsZic7XHJcbiAgICAgICAgICAgIGNhc2UgJ3htYic6XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gJ3h0Yic7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogcG90ZW50aWFsbHkgdG8gYmUgZ2VuZXJhdGVkIHRyYW5zbGF0ZS1GaWxlIGZvciBuZ3gtdHJhbnNsYXRlIHdpdGggdGhlIHRyYW5zbGF0aW9ucyBmb3Igb25lIGxhbmd1YWdlLlxyXG4gICAgICogQHBhcmFtIGxhbmcgbGFuZ3VhZ2Ugc2hvcnRjdXRcclxuICAgICAqIEByZXR1cm4gUGF0aCBvZiBmaWxlXHJcbiAgICAgKi9cclxuICAgIHB1YmxpYyBnZW5lcmF0ZWROZ3hUcmFuc2xhdGVGaWxlKGxhbmc6IHN0cmluZyk6IHN0cmluZyB7XHJcbiAgICAgICAgcmV0dXJuIGpvaW4odGhpcy5nZW5EaXIoKSwgdGhpcy5pMThuQmFzZUZpbGUoKSArICcuJyArIGxhbmcgKyAnLicgKyAnanNvbicpLnJlcGxhY2UoL1xcXFwvZywgJy8nKTtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIFRoZSBlbmNvZGluZyB1c2VkIHRvIHdyaXRlIG5ldyBYTElGRi1maWxlcy5cclxuICAgICAqIEByZXR1cm4gZW5jb2RpbmdcclxuICAgICAqL1xyXG4gICAgcHVibGljIGVuY29kaW5nKCk6IHN0cmluZyB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuX2VuY29kaW5nID8gdGhpcy5fZW5jb2RpbmcgOiAnVVRGLTgnO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogT3V0cHV0LURpcmVjdG9yeSwgd2hlcmUgdGhlIG91dHB1dCBpcyB3cml0dGVuIHRvLlxyXG4gICAgICogRGVmYXVsdCBpcyA8c3JjRGlyPi5cclxuICAgICovXHJcbiAgICBwdWJsaWMgZ2VuRGlyKCk6IHN0cmluZyB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuX2dlbkRpciA/IHRoaXMuX2dlbkRpciA6IHRoaXMuc3JjRGlyKCk7XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIHJlbW92ZVVudXNlZElkcygpOiBib29sZWFuIHtcclxuICAgICAgICByZXR1cm4gKGlzTnVsbE9yVW5kZWZpbmVkKHRoaXMuX3JlbW92ZVVudXNlZElkcykpID8gdHJ1ZSA6IHRoaXMuX3JlbW92ZVVudXNlZElkcztcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgc3VwcG9ydE5neFRyYW5zbGF0ZSgpOiBib29sZWFuIHtcclxuICAgICAgICByZXR1cm4gKGlzTnVsbE9yVW5kZWZpbmVkKHRoaXMuX3N1cHBvcnROZ3hUcmFuc2xhdGUpKSA/IGZhbHNlIDogdGhpcy5fc3VwcG9ydE5neFRyYW5zbGF0ZTtcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgbmd4VHJhbnNsYXRlRXh0cmFjdGlvblBhdHRlcm4oKTogc3RyaW5nIHtcclxuICAgICAgICByZXR1cm4gKGlzTnVsbE9yVW5kZWZpbmVkKHRoaXMuX25neFRyYW5zbGF0ZUV4dHJhY3Rpb25QYXR0ZXJuKSkgP1xyXG4gICAgICAgICAgICBOZ3hUcmFuc2xhdGVFeHRyYWN0b3IuRGVmYXVsdEV4dHJhY3Rpb25QYXR0ZXJuIDogdGhpcy5fbmd4VHJhbnNsYXRlRXh0cmFjdGlvblBhdHRlcm47XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBXaGV0aGVyIHNvdXJjZSBtdXN0IGJlIHVzZWQgYXMgdGFyZ2V0IGZvciBuZXcgdHJhbnMtdW5pdHNcclxuICAgICAqIERlZmF1bHQgaXMgdHJ1ZVxyXG4gICAgICovXHJcbiAgICBwdWJsaWMgdXNlU291cmNlQXNUYXJnZXQoKTogYm9vbGVhbiB7XHJcbiAgICAgICAgcmV0dXJuIChpc051bGxPclVuZGVmaW5lZCh0aGlzLl91c2VTb3VyY2VBc1RhcmdldCkpID8gdHJ1ZSA6IHRoaXMuX3VzZVNvdXJjZUFzVGFyZ2V0O1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogUHJhZWZpeCB1c2VkIGZvciB0YXJnZXQgd2hlbiBjb3B5aW5nIG5ldyB0cmFucy11bml0c1xyXG4gICAgICogRGVmYXVsdCBpcyBcIlwiXHJcbiAgICAgKi9cclxuICAgIHB1YmxpYyB0YXJnZXRQcmFlZml4KCk6IHN0cmluZyB7XHJcbiAgICAgICAgcmV0dXJuIChpc051bGxPclVuZGVmaW5lZCh0aGlzLl90YXJnZXRQcmFlZml4KSkgPyAnJyA6IHRoaXMuX3RhcmdldFByYWVmaXg7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBTdWZmaXggdXNlZCBmb3IgdGFyZ2V0IHdoZW4gY29weWluZyBuZXcgdHJhbnMtdW5pdHNcclxuICAgICAqIERlZmF1bHQgaXMgXCJcIlxyXG4gICAgICovXHJcbiAgICBwdWJsaWMgdGFyZ2V0U3VmZml4KCk6IHN0cmluZyB7XHJcbiAgICAgICAgcmV0dXJuIChpc051bGxPclVuZGVmaW5lZCh0aGlzLl90YXJnZXRTdWZmaXgpKSA/ICcnIDogdGhpcy5fdGFyZ2V0U3VmZml4O1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogSWYgc2V0LCBydW4geG1sIHJlc3VsdCB0aHJvdWdoIGJlYXV0aWZpZXIgKHByZXR0eS1kYXRhKS5cclxuICAgICAqL1xyXG4gICAgcHVibGljIGJlYXV0aWZ5T3V0cHV0KCk6IGJvb2xlYW4ge1xyXG4gICAgICAgIHJldHVybiAoaXNOdWxsT3JVbmRlZmluZWQodGhpcy5fYmVhdXRpZnlPdXRwdXQpKSA/IGZhbHNlIDogdGhpcy5fYmVhdXRpZnlPdXRwdXQ7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBJZiBzZXQsIG9yZGVyIG9mIG5ldyB0cmFucyB1bml0cyB3aWxsIGJlIGFzIGluIG1hc3Rlci5cclxuICAgICAqIE90aGVyd2lzZSB0aGV5IGFyZSBhZGRlZCBhdCB0aGUgZW5kLlxyXG4gICAgICovXHJcbiAgICBwdWJsaWMgcHJlc2VydmVPcmRlcigpOiBib29sZWFuIHtcclxuICAgICAgICByZXR1cm4gKGlzTnVsbE9yVW5kZWZpbmVkKHRoaXMuX3ByZXNlcnZlT3JkZXIpKSA/IHRydWUgOiB0aGlzLl9wcmVzZXJ2ZU9yZGVyO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogV2hldGhlciB0byB1c2UgYXV0b3RyYW5zbGF0ZSBmb3IgbmV3IHRyYW5zLXVuaXRzXHJcbiAgICAgKiBEZWZhdWx0IGlzIGZhbHNlXHJcbiAgICAgKi9cclxuICAgIHB1YmxpYyBhdXRvdHJhbnNsYXRlKCk6IGJvb2xlYW4ge1xyXG4gICAgICAgIGlmIChpc051bGxPclVuZGVmaW5lZCh0aGlzLl9hdXRvdHJhbnNsYXRlKSkge1xyXG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmIChpc0FycmF5KHRoaXMuX2F1dG90cmFuc2xhdGUpKSB7XHJcbiAgICAgICAgICAgIHJldHVybiAoPHN0cmluZ1tdPnRoaXMuX2F1dG90cmFuc2xhdGUpLmxlbmd0aCA+IDA7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiA8Ym9vbGVhbj50aGlzLl9hdXRvdHJhbnNsYXRlO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogV2hldGhlciB0byB1c2UgYXV0b3RyYW5zbGF0ZSBmb3IgYSBnaXZlbiBsYW5ndWFnZS5cclxuICAgICAqIEBwYXJhbSBsYW5nIGxhbmd1YWdlIGNvZGUuXHJcbiAgICAgKi9cclxuICAgIHB1YmxpYyBhdXRvdHJhbnNsYXRlTGFuZ3VhZ2UobGFuZzogc3RyaW5nKTogYm9vbGVhbiB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuYXV0b3RyYW5zbGF0ZWRMYW5ndWFnZXMoKS5pbmRleE9mKGxhbmcpID49IDA7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBSZXR1cm4gYSBsaXN0IG9mIGxhbmd1YWdlcyB0byBiZSBhdXRvdHJhbnNsYXRlZC5cclxuICAgICAqL1xyXG4gICAgcHVibGljIGF1dG90cmFuc2xhdGVkTGFuZ3VhZ2VzKCk6IHN0cmluZ1tdIHtcclxuICAgICAgICBpZiAoaXNOdWxsT3JVbmRlZmluZWQodGhpcy5fYXV0b3RyYW5zbGF0ZSkgfHwgdGhpcy5fYXV0b3RyYW5zbGF0ZSA9PT0gZmFsc2UpIHtcclxuICAgICAgICAgICAgcmV0dXJuIFtdO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAoaXNBcnJheSh0aGlzLl9hdXRvdHJhbnNsYXRlKSkge1xyXG4gICAgICAgICAgICByZXR1cm4gKDxzdHJpbmdbXT50aGlzLl9hdXRvdHJhbnNsYXRlKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIHRoaXMubGFuZ3VhZ2VzKCkuc2xpY2UoMSk7IC8vIGZpcnN0IGlzIHNvdXJjZSBsYW5ndWFnZVxyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogQVBJIGtleSB0byBiZSB1c2VkIGZvciBHb29nbGUgVHJhbnNsYXRlXHJcbiAgICAgKiBAcmV0dXJuIGFwaSBrZXlcclxuICAgICAqL1xyXG4gICAgcHVibGljIGFwaWtleSgpOiBzdHJpbmcge1xyXG4gICAgICAgIGlmICghaXNOdWxsT3JVbmRlZmluZWQodGhpcy5fYXBpa2V5KSkge1xyXG4gICAgICAgICAgICByZXR1cm4gdGhpcy5fYXBpa2V5O1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIGNvbnN0IGFwaWtleVBhdGggPSB0aGlzLmFwaWtleWZpbGUoKTtcclxuICAgICAgICAgICAgaWYgKHRoaXMuYXBpa2V5ZmlsZSgpKSB7XHJcbiAgICAgICAgICAgICAgICBpZiAoZnMuZXhpc3RzU3luYyhhcGlrZXlQYXRoKSkge1xyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBGaWxlVXRpbC5yZWFkKGFwaWtleVBhdGgsICd1dGYtOCcpO1xyXG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoZm9ybWF0KCdhcGkga2V5IGZpbGUgbm90IGZvdW5kOiBBUElfS0VZX0ZJTEU9JXMnLCBhcGlrZXlQYXRoKSk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gbnVsbDtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIGZpbGUgbmFtZSBmb3IgQVBJIGtleSB0byBiZSB1c2VkIGZvciBHb29nbGUgVHJhbnNsYXRlLlxyXG4gICAgICogRXhwbGljaXRseSBzZXQgb3IgcmVhZCBmcm9tIGVudiB2YXIgQVBJX0tFWV9GSUxFLlxyXG4gICAgICogQHJldHVybiBmaWxlIG9mIGFwaSBrZXlcclxuICAgICAqL1xyXG4gICAgcHVibGljIGFwaWtleWZpbGUoKTogc3RyaW5nIHtcclxuICAgICAgICBpZiAodGhpcy5fYXBpa2V5ZmlsZSkge1xyXG4gICAgICAgICAgICByZXR1cm4gdGhpcy5fYXBpa2V5ZmlsZTtcclxuICAgICAgICB9IGVsc2UgaWYgKHByb2Nlc3MuZW52LkFQSV9LRVlfRklMRSkge1xyXG4gICAgICAgICAgICByZXR1cm4gcHJvY2Vzcy5lbnYuQVBJX0tFWV9GSUxFO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIHJldHVybiBudWxsO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxufVxyXG4iXX0=