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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoieGxpZmYtbWVyZ2UtcGFyYW1ldGVycy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3Byb2plY3RzL3hsaWZmbWVyZ2Uvc3JjL3hsaWZmbWVyZ2UveGxpZmYtbWVyZ2UtcGFyYW1ldGVycy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7OztHQUlHO0FBRUgsT0FBTyxLQUFLLEVBQUUsTUFBTSxJQUFJLENBQUM7QUFDekIsT0FBTyxFQUFDLGVBQWUsRUFBQyxNQUFNLHFCQUFxQixDQUFDO0FBR3BELE9BQU8sRUFBQyxNQUFNLEVBQUMsTUFBTSxNQUFNLENBQUM7QUFDNUIsT0FBTyxFQUFDLE9BQU8sRUFBRSxpQkFBaUIsRUFBQyxNQUFNLGdCQUFnQixDQUFDO0FBRTFELE9BQU8sRUFBQyxRQUFRLEVBQUMsTUFBTSxxQkFBcUIsQ0FBQztBQUM3QyxPQUFPLEVBQUMscUJBQXFCLEVBQUMsTUFBTSwyQkFBMkIsQ0FBQztBQUNoRSxPQUFPLEVBQUMsT0FBTyxFQUFFLFVBQVUsRUFBRSxJQUFJLEVBQVksTUFBTSxNQUFNLENBQUM7QUFFMUQsTUFBTSxrQkFBa0IsR0FBRyxDQUFDLGNBQWMsRUFBRSxtQkFBbUIsQ0FBQyxDQUFDO0FBRWpFLE1BQU0sT0FBTyxvQkFBb0I7SUF3QzdCO1FBQ0ksSUFBSSxDQUFDLFdBQVcsR0FBRyxFQUFFLENBQUM7UUFDdEIsSUFBSSxDQUFDLGFBQWEsR0FBRyxFQUFFLENBQUM7SUFDNUIsQ0FBQztJQWREOzs7O09BSUc7SUFDSSxNQUFNLENBQUMsaUJBQWlCLENBQUMsT0FBdUIsRUFBRSxjQUE0QjtRQUNqRixNQUFNLFVBQVUsR0FBRyxJQUFJLG9CQUFvQixFQUFFLENBQUM7UUFDOUMsVUFBVSxDQUFDLFNBQVMsQ0FBQyxPQUFPLEVBQUUsY0FBYyxDQUFDLENBQUM7UUFDOUMsT0FBTyxVQUFVLENBQUM7SUFDdEIsQ0FBQztJQU9EOzs7OztPQUtHO0lBQ0ssTUFBTSxDQUFDLG9CQUFvQixDQUFD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SUFBSSxDQUFDLE9BQU8sQ0FBQztTQUN2QjthQUFNO1lBQ0gsTUFBTSxVQUFVLEdBQUcsSUFBSSxDQUFDLFVBQVUsRUFBRSxDQUFDO1lBQ3JDLElBQUksSUFBSSxDQUFDLFVBQVUsRUFBRSxFQUFFO2dCQUNuQixJQUFJLEVBQUUsQ0FBQyxVQUFVLENBQUMsVUFBVSxDQUFDLEVBQUU7b0JBQzNCLE9BQU8sUUFBUSxDQUFDLElBQUksQ0FBQyxVQUFVLEVBQUUsT0FBTyxDQUFDLENBQUM7aUJBQzdDO3FCQUFNO29CQUNILE1BQU0sSUFBSSxLQUFLLENBQUMsTUFBTSxDQUFDLHlDQUF5QyxFQUFFLFVBQVUsQ0FBQyxDQUFDLENBQUM7aUJBQ2xGO2FBQ0o7aUJBQU07Z0JBQ0gsT0FBTyxJQUFJLENBQUM7YUFDZjtTQUNKO0lBQ0wsQ0FBQztJQUVEOzs7O09BSUc7SUFDSSxVQUFVO1FBQ2IsSUFBSSxJQUFJLENBQUMsV0FBVyxFQUFFO1lBQ2xCLE9BQU8sSUFBSSxDQUFDLFdBQVcsQ0FBQztTQUMzQjthQUFNLElBQUksT0FBTyxDQUFDLEdBQUcsQ0FBQyxZQUFZLEVBQUU7WUFDakMsT0FBTyxPQUFPLENBQUMsR0FBRyxDQUFDLFlBQVksQ0FBQztTQUNuQzthQUFNO1lBQ0gsT0FBTyxJQUFJLENBQUM7U0FDZjtJQUNMLENBQUM7Q0FDSiIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxyXG4gKiBDcmVhdGVkIGJ5IG1hcnRpbiBvbiAxNy4wMi4yMDE3LlxyXG4gKiBDb2xsZWN0aW9uIG9mIGFsbCBwYXJhbWV0ZXJzIHVzZWQgYnkgdGhlIHRvb2wuXHJcbiAqIFRoZSBwYXJhbWV0ZXJzIGFyZSByZWFkIGZvcm0gdGhlIHByb2ZpbGUgb3IgZGVmYXVsdHMgYXJlIHVzZWQuXHJcbiAqL1xyXG5cclxuaW1wb3J0ICogYXMgZnMgZnJvbSAnZnMnO1xyXG5pbXBvcnQge1hsaWZmTWVyZ2VFcnJvcn0gZnJvbSAnLi94bGlmZi1tZXJnZS1lcnJvcic7XHJcbmltcG9ydCB7U3RhdHN9IGZyb20gJ2ZzJztcclxuaW1wb3J0IHtDb21tYW5kT3V0cHV0fSBmcm9tICcuLi9jb21tb24vY29tbWFuZC1vdXRwdXQnO1xyXG5pbXBvcnQge2Zvcm1hdH0gZnJvbSAndXRpbCc7XHJcbmltcG9ydCB7aXNBcnJheSwgaXNOdWxsT3JVbmRlZmluZWR9IGZyb20gJy4uL2NvbW1vbi91dGlsJztcclxuaW1wb3J0IHtQcm9ncmFtT3B0aW9ucywgSUNvbmZpZ0ZpbGV9IGZyb20gJy4vaS14bGlmZi1tZXJnZS1vcHRpb25zJztcclxuaW1wb3J0IHtGaWxlVXRpbH0gZnJvbSAnLi4vY29tbW9uL2ZpbGUtdXRpbCc7XHJcbmltcG9ydCB7Tmd4VHJhbnNsYXRlRXh0cmFjdG9yfSBmcm9tICcuL25neC10cmFuc2xhdGUtZXh0cmFjdG9yJztcclxuaW1wb3J0IHtkaXJuYW1lLCBpc0Fic29sdXRlLCBqb2luLCBub3JtYWxpemV9IGZyb20gJ3BhdGgnO1xyXG5cclxuY29uc3QgUFJPRklMRV9DQU5ESURBVEVTID0gWydwYWNrYWdlLmpzb24nLCAnLmFuZ3VsYXItY2xpLmpzb24nXTtcclxuXHJcbmV4cG9ydCBjbGFzcyBYbGlmZk1lcmdlUGFyYW1ldGVycyB7XHJcblxyXG4gICAgcHJpdmF0ZSB1c2VkUHJvZmlsZVBhdGg6IHN0cmluZztcclxuICAgIHByaXZhdGUgX3F1aWV0OiBib29sZWFuO1xyXG4gICAgcHJpdmF0ZSBfdmVyYm9zZTogYm9vbGVhbjtcclxuICAgIHByaXZhdGUgX2FsbG93SWRDaGFuZ2U6IGJvb2xlYW47XHJcbiAgICBwcml2YXRlIF9kZWZhdWx0TGFuZ3VhZ2U6IHN0cmluZztcclxuICAgIHByaXZhdGUgX3NyY0Rpcjogc3RyaW5nO1xyXG4gICAgcHJpdmF0ZSBfaTE4bkJhc2VGaWxlOiBzdHJpbmc7XHJcbiAgICBwcml2YXRlIF9pMThuRmlsZTogc3RyaW5nO1xyXG4gICAgcHJpdmF0ZSBfaTE4bkZvcm1hdDogc3RyaW5nO1xyXG4gICAgcHJpdmF0ZSBfZW5jb2Rpbmc6IHN0cmluZztcclxuICAgIHByaXZhdGUgX2dlbkRpcjogc3RyaW5nO1xyXG4gICAgcHJpdmF0ZSBfbGFuZ3VhZ2VzOiBzdHJpbmdbXTtcclxuICAgIHByaXZhdGUgX3JlbW92ZVVudXNlZElkczogYm9vbGVhbjtcclxuICAgIHByaXZhdGUgX3N1cHBvcnROZ3hUcmFuc2xhdGU6IGJvb2xlYW47XHJcbiAgICBwcml2YXRlIF9uZ3hUcmFuc2xhdGVFeHRyYWN0aW9uUGF0dGVybjogc3RyaW5nO1xyXG4gICAgcHJpdmF0ZSBfdXNlU291cmNlQXNUYXJnZXQ6IGJvb2xlYW47XHJcbiAgICBwcml2YXRlIF90YXJnZXRQcmFlZml4OiBzdHJpbmc7XHJcbiAgICBwcml2YXRlIF90YXJnZXRTdWZmaXg6IHN0cmluZztcclxuICAgIHByaXZhdGUgX2JlYXV0aWZ5T3V0cHV0OiBib29sZWFuO1xyXG4gICAgcHJpdmF0ZSBfcHJlc2VydmVPcmRlcjogYm9vbGVhbjtcclxuICAgIHByaXZhdGUgX2F1dG90cmFuc2xhdGU6IGJvb2xlYW58c3RyaW5nW107XHJcbiAgICBwcml2YXRlIF9hcGlrZXk6IHN0cmluZztcclxuICAgIHByaXZhdGUgX2FwaWtleWZpbGU6IHN0cmluZztcclxuXHJcbiAgICBwdWJsaWMgZXJyb3JzRm91bmQ6IFhsaWZmTWVyZ2VFcnJvcltdO1xyXG4gICAgcHVibGljIHdhcm5pbmdzRm91bmQ6IHN0cmluZ1tdO1xyXG5cclxuICAgIC8qKlxyXG4gICAgICogQ3JlYXRlIFBhcmFtZXRlcnMuXHJcbiAgICAgKiBAcGFyYW0gb3B0aW9ucyBjb21tYW5kIG9wdGlvbnNcclxuICAgICAqIEBwYXJhbSBwcm9maWxlQ29udGVudCBnaXZlbiBwcm9maWxlIChpZiBub3QsIGl0IGlzIHJlYWQgZnJvbSB0aGUgcHJvZmlsZSBwYXRoIGZyb20gb3B0aW9ucykuXHJcbiAgICAgKi9cclxuICAgIHB1YmxpYyBzdGF0aWMgY3JlYXRlRnJvbU9wdGlvbnMob3B0aW9uczogUHJvZ3JhbU9wdGlvbnMsIHByb2ZpbGVDb250ZW50PzogSUNvbmZpZ0ZpbGUpIHtcclxuICAgICAgICBjb25zdCBwYXJhbWV0ZXJzID0gbmV3IFhsaWZmTWVyZ2VQYXJhbWV0ZXJzKCk7XHJcbiAgICAgICAgcGFyYW1ldGVycy5jb25maWd1cmUob3B0aW9ucywgcHJvZmlsZUNvbnRlbnQpO1xyXG4gICAgICAgIHJldHVybiBwYXJhbWV0ZXJzO1xyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgY29uc3RydWN0b3IoKSB7XHJcbiAgICAgICAgdGhpcy5lcnJvcnNGb3VuZCA9IFtdO1xyXG4gICAgICAgIHRoaXMud2FybmluZ3NGb3VuZCA9IFtdO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogUmVhZCBwb3RlbnRpYWwgcHJvZmlsZS5cclxuICAgICAqIFRvIGJlIGEgY2FuZGlkYXRlLCBmaWxlIG11c3QgZXhpc3QgYW5kIGNvbnRhaW4gcHJvcGVydHkgXCJ4bGlmZm1lcmdlT3B0aW9uc1wiLlxyXG4gICAgICogQHBhcmFtIHByb2ZpbGVQYXRoIHBhdGggb2YgcHJvZmlsZVxyXG4gICAgICogQHJldHVybiBwYXJzZWQgY29udGVudCBvZiBmaWxlIG9yIG51bGwsIGlmIGZpbGUgZG9lcyBub3QgZXhpc3Qgb3IgaXMgbm90IGEgcHJvZmlsZSBjYW5kaWRhdGUuXHJcbiAgICAgKi9cclxuICAgIHByaXZhdGUgc3RhdGljIHJlYWRQcm9maWxlQ2FuZGlkYXRlKHByb2ZpbGVQYXRoOiBzdHJpbmcpOiBJQ29uZmlnRmlsZSB7XHJcbiAgICAgICAgbGV0IGNvbnRlbnQ6IHN0cmluZztcclxuICAgICAgICB0cnkge1xyXG4gICAgICAgICAgICBjb250ZW50ID0gZnMucmVhZEZpbGVTeW5jKHByb2ZpbGVQYXRoLCAnVVRGLTgnKTtcclxuICAgICAgICB9IGNhdGNoIChlcnIpIHtcclxuICAgICAgICAgICAgcmV0dXJuIG51bGw7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGNvbnN0IHBhcnNlZENvbnRlbnQ6IElDb25maWdGaWxlID0gSlNPTi5wYXJzZShjb250ZW50KTtcclxuICAgICAgICBpZiAocGFyc2VkQ29udGVudCAmJiBwYXJzZWRDb250ZW50LnhsaWZmbWVyZ2VPcHRpb25zKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBwYXJzZWRDb250ZW50O1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIHJldHVybiBudWxsO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIEluaXRpYWxpemUgbWUgZnJvbSB0aGUgcHJvZmlsZSBjb250ZW50LlxyXG4gICAgICogKHB1YmxpYyBvbmx5IGZvciB0ZXN0IHVzYWdlKS5cclxuICAgICAqIEBwYXJhbSBvcHRpb25zIG9wdGlvbnMgZ2l2ZW4gYXQgcnVudGltZSB2aWEgY29tbWFuZCBsaW5lXHJcbiAgICAgKiBAcGFyYW0gcHJvZmlsZUNvbnRlbnQgaWYgbnVsbCwgcmVhZCBpdCBmcm9tIHByb2ZpbGUuXHJcbiAgICAgKi9cclxuICAgIHByaXZhdGUgY29uZmlndXJlKG9wdGlvbnM6IFByb2dyYW1PcHRpb25zLCBwcm9maWxlQ29udGVudD86IElDb25maWdGaWxlKSB7XHJcbiAgICAgICAgdGhpcy5lcnJvcnNGb3VuZCA9IFtdO1xyXG4gICAgICAgIHRoaXMud2FybmluZ3NGb3VuZCA9IFtdO1xyXG4gICAgICAgIGlmICghcHJvZmlsZUNvbnRlbnQpIHtcclxuICAgICAgICAgICAgcHJvZmlsZUNvbnRlbnQgPSB0aGlzLnJlYWRQcm9maWxlKG9wdGlvbnMpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBjb25zdCB2YWxpZFByb2ZpbGU6IGJvb2xlYW4gPSAoISFwcm9maWxlQ29udGVudCk7XHJcbiAgICAgICAgaWYgKG9wdGlvbnMucXVpZXQpIHtcclxuICAgICAgICAgICAgdGhpcy5fcXVpZXQgPSBvcHRpb25zLnF1aWV0O1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAob3B0aW9ucy52ZXJib3NlKSB7XHJcbiAgICAgICAgICAgIHRoaXMuX3ZlcmJvc2UgPSBvcHRpb25zLnZlcmJvc2U7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmICh2YWxpZFByb2ZpbGUpIHtcclxuICAgICAgICAgICAgdGhpcy5pbml0aWFsaXplRnJvbUNvbmZpZyhwcm9maWxlQ29udGVudCk7XHJcbiAgICAgICAgICAgIC8vIGlmIGxhbmd1YWdlcyBhcmUgZ2l2ZW4gYXMgcGFyYW1ldGVycywgdGhleSBvdnZlcmlkZSBldmVyeXRoaW5nIHNhaWQgaW4gcHJvZmlsZVxyXG4gICAgICAgICAgICBpZiAoISFvcHRpb25zLmxhbmd1YWdlcyAmJiBvcHRpb25zLmxhbmd1YWdlcy5sZW5ndGggPiAwKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLl9sYW5ndWFnZXMgPSBvcHRpb25zLmxhbmd1YWdlcztcclxuICAgICAgICAgICAgICAgIGlmICghdGhpcy5fZGVmYXVsdExhbmd1YWdlKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5fZGVmYXVsdExhbmd1YWdlID0gdGhpcy5fbGFuZ3VhZ2VzWzBdO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHRoaXMuY2hlY2tQYXJhbWV0ZXJzKCk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogUmVhZCBwcm9maWxlLlxyXG4gICAgICogQHBhcmFtIG9wdGlvbnMgcHJvZ3JhbSBvcHRpb25zXHJcbiAgICAgKiBAcmV0dXJuIHRoZSByZWFkIHByb2ZpbGUgKGVtcHR5LCBpZiBub25lLCBudWxsIGlmIGVycm9ycylcclxuICAgICAqL1xyXG4gICAgcHJpdmF0ZSByZWFkUHJvZmlsZShvcHRpb25zOiBQcm9ncmFtT3B0aW9ucyk6IElDb25maWdGaWxlIHtcclxuICAgICAgICBjb25zdCBwcm9maWxlUGF0aDogc3RyaW5nID0gb3B0aW9ucy5wcm9maWxlUGF0aDtcclxuICAgICAgICBpZiAoIXByb2ZpbGVQYXRoKSB7XHJcbiAgICAgICAgICAgIGZvciAoY29uc3QgY29uZmlnZmlsZW5hbWUgb2YgUFJPRklMRV9DQU5ESURBVEVTKSB7XHJcbiAgICAgICAgICAgICAgICBjb25zdCBwcm9maWxlID0gWGxpZmZNZXJnZVBhcmFtZXRlcnMucmVhZFByb2ZpbGVDYW5kaWRhdGUoY29uZmlnZmlsZW5hbWUpO1xyXG4gICAgICAgICAgICAgICAgaWYgKHByb2ZpbGUpIHtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLnVzZWRQcm9maWxlUGF0aCA9IGNvbmZpZ2ZpbGVuYW1lO1xyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBwcm9maWxlO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHJldHVybiB7fTtcclxuICAgICAgICB9XHJcbiAgICAgICAgbGV0IGNvbnRlbnQ6IHN0cmluZztcclxuICAgICAgICB0cnkge1xyXG4gICAgICAgICAgICBjb250ZW50ID0gZnMucmVhZEZpbGVTeW5jKHByb2ZpbGVQYXRoLCAnVVRGLTgnKTtcclxuICAgICAgICB9IGNhdGNoIChlcnIpIHtcclxuICAgICAgICAgICAgdGhpcy5lcnJvcnNGb3VuZC5wdXNoKG5ldyBYbGlmZk1lcmdlRXJyb3IoJ2NvdWxkIG5vdCByZWFkIHByb2ZpbGUgXCInICsgcHJvZmlsZVBhdGggKyAnXCInKSk7XHJcbiAgICAgICAgICAgIHJldHVybiBudWxsO1xyXG4gICAgICAgIH1cclxuICAgICAgICB0aGlzLnVzZWRQcm9maWxlUGF0aCA9IHByb2ZpbGVQYXRoO1xyXG4gICAgICAgIGNvbnN0IHByb2ZpbGVDb250ZW50OiBJQ29uZmlnRmlsZSA9IEpTT04ucGFyc2UoY29udGVudCk7XHJcbiAgICAgICAgLy8gcmVwbGFjZSBhbGwgcGF0aGVzIGluIG9wdGlvbnMgYnkgYWJzb2x1dGUgcGF0aHNcclxuICAgICAgICBjb25zdCB4bGlmZm1lcmdlT3B0aW9ucyA9IHByb2ZpbGVDb250ZW50LnhsaWZmbWVyZ2VPcHRpb25zO1xyXG4gICAgICAgIHhsaWZmbWVyZ2VPcHRpb25zLnNyY0RpciA9IHRoaXMuYWRqdXN0UGF0aFRvUHJvZmlsZVBhdGgocHJvZmlsZVBhdGgsIHhsaWZmbWVyZ2VPcHRpb25zLnNyY0Rpcik7XHJcbiAgICAgICAgeGxpZmZtZXJnZU9wdGlvbnMuZ2VuRGlyID0gdGhpcy5hZGp1c3RQYXRoVG9Qcm9maWxlUGF0aChwcm9maWxlUGF0aCwgeGxpZmZtZXJnZU9wdGlvbnMuZ2VuRGlyKTtcclxuICAgICAgICB4bGlmZm1lcmdlT3B0aW9ucy5hcGlrZXlmaWxlID0gdGhpcy5hZGp1c3RQYXRoVG9Qcm9maWxlUGF0aChwcm9maWxlUGF0aCwgeGxpZmZtZXJnZU9wdGlvbnMuYXBpa2V5ZmlsZSk7XHJcbiAgICAgICAgcmV0dXJuIHByb2ZpbGVDb250ZW50O1xyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgYWRqdXN0UGF0aFRvUHJvZmlsZVBhdGgocHJvZmlsZVBhdGg6IHN0cmluZywgcGF0aFRvQWRqdXN0OiBzdHJpbmcgfCB1bmRlZmluZWQpOiBzdHJpbmcgfCB1bmRlZmluZWQge1xyXG4gICAgICAgIGlmICghcGF0aFRvQWRqdXN0IHx8IGlzQWJzb2x1dGUocGF0aFRvQWRqdXN0KSkge1xyXG4gICAgICAgICAgICByZXR1cm4gcGF0aFRvQWRqdXN0O1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gam9pbihkaXJuYW1lKHByb2ZpbGVQYXRoKSwgcGF0aFRvQWRqdXN0KS5yZXBsYWNlKC9cXFxcL2csICcvJyk7XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSBpbml0aWFsaXplRnJvbUNvbmZpZyhwcm9maWxlQ29udGVudDogSUNvbmZpZ0ZpbGUpIHtcclxuICAgICAgICBpZiAoIXByb2ZpbGVDb250ZW50KSB7XHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcbiAgICAgICAgY29uc3QgcHJvZmlsZSA9IHByb2ZpbGVDb250ZW50LnhsaWZmbWVyZ2VPcHRpb25zO1xyXG4gICAgICAgIGlmIChwcm9maWxlKSB7XHJcbiAgICAgICAgICAgIGlmICghaXNOdWxsT3JVbmRlZmluZWQocHJvZmlsZS5xdWlldCkpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuX3F1aWV0ID0gcHJvZmlsZS5xdWlldDtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBpZiAoIWlzTnVsbE9yVW5kZWZpbmVkKHByb2ZpbGUudmVyYm9zZSkpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuX3ZlcmJvc2UgPSBwcm9maWxlLnZlcmJvc2U7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgaWYgKCFpc051bGxPclVuZGVmaW5lZChwcm9maWxlLmFsbG93SWRDaGFuZ2UpKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLl9hbGxvd0lkQ2hhbmdlID0gcHJvZmlsZS5hbGxvd0lkQ2hhbmdlO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGlmIChwcm9maWxlLmRlZmF1bHRMYW5ndWFnZSkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5fZGVmYXVsdExhbmd1YWdlID0gcHJvZmlsZS5kZWZhdWx0TGFuZ3VhZ2U7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgaWYgKHByb2ZpbGUubGFuZ3VhZ2VzKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLl9sYW5ndWFnZXMgPSBwcm9maWxlLmxhbmd1YWdlcztcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBpZiAocHJvZmlsZS5zcmNEaXIpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuX3NyY0RpciA9IHByb2ZpbGUuc3JjRGlyO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGlmIChwcm9maWxlLmFuZ3VsYXJDb21waWxlck9wdGlvbnMpIHtcclxuICAgICAgICAgICAgICAgIGlmIChwcm9maWxlLmFuZ3VsYXJDb21waWxlck9wdGlvbnMuZ2VuRGlyKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5fZ2VuRGlyID0gcHJvZmlsZS5hbmd1bGFyQ29tcGlsZXJPcHRpb25zLmdlbkRpcjtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBpZiAocHJvZmlsZS5nZW5EaXIpIHtcclxuICAgICAgICAgICAgICAgIC8vIHRoaXMgbXVzdCBiZSBhZnRlciBhbmd1bGFyQ29tcGlsZXJPcHRpb25zIHRvIGJlIHByZWZlcnJlZFxyXG4gICAgICAgICAgICAgICAgdGhpcy5fZ2VuRGlyID0gcHJvZmlsZS5nZW5EaXI7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgaWYgKHByb2ZpbGUuaTE4bkJhc2VGaWxlKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLl9pMThuQmFzZUZpbGUgPSBwcm9maWxlLmkxOG5CYXNlRmlsZTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBpZiAocHJvZmlsZS5pMThuRmlsZSkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5faTE4bkZpbGUgPSBwcm9maWxlLmkxOG5GaWxlO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGlmIChwcm9maWxlLmkxOG5Gb3JtYXQpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuX2kxOG5Gb3JtYXQgPSBwcm9maWxlLmkxOG5Gb3JtYXQ7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgaWYgKHByb2ZpbGUuZW5jb2RpbmcpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuX2VuY29kaW5nID0gcHJvZmlsZS5lbmNvZGluZztcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBpZiAoIWlzTnVsbE9yVW5kZWZpbmVkKHByb2ZpbGUucmVtb3ZlVW51c2VkSWRzKSkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5fcmVtb3ZlVW51c2VkSWRzID0gcHJvZmlsZS5yZW1vdmVVbnVzZWRJZHM7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgaWYgKCFpc051bGxPclVuZGVmaW5lZChwcm9maWxlLnN1cHBvcnROZ3hUcmFuc2xhdGUpKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLl9zdXBwb3J0Tmd4VHJhbnNsYXRlID0gcHJvZmlsZS5zdXBwb3J0Tmd4VHJhbnNsYXRlO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGlmICghaXNOdWxsT3JVbmRlZmluZWQocHJvZmlsZS5uZ3hUcmFuc2xhdGVFeHRyYWN0aW9uUGF0dGVybikpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuX25neFRyYW5zbGF0ZUV4dHJhY3Rpb25QYXR0ZXJuID0gcHJvZmlsZS5uZ3hUcmFuc2xhdGVFeHRyYWN0aW9uUGF0dGVybjtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBpZiAoIWlzTnVsbE9yVW5kZWZpbmVkKHByb2ZpbGUudXNlU291cmNlQXNUYXJnZXQpKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLl91c2VTb3VyY2VBc1RhcmdldCA9IHByb2ZpbGUudXNlU291cmNlQXNUYXJnZXQ7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgaWYgKCFpc051bGxPclVuZGVmaW5lZChwcm9maWxlLnRhcmdldFByYWVmaXgpKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLl90YXJnZXRQcmFlZml4ID0gcHJvZmlsZS50YXJnZXRQcmFlZml4O1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGlmICghaXNOdWxsT3JVbmRlZmluZWQocHJvZmlsZS50YXJnZXRTdWZmaXgpKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLl90YXJnZXRTdWZmaXggPSBwcm9maWxlLnRhcmdldFN1ZmZpeDtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBpZiAoIWlzTnVsbE9yVW5kZWZpbmVkKHByb2ZpbGUuYXV0b3RyYW5zbGF0ZSkpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuX2F1dG90cmFuc2xhdGUgPSBwcm9maWxlLmF1dG90cmFuc2xhdGU7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgaWYgKCFpc051bGxPclVuZGVmaW5lZChwcm9maWxlLmJlYXV0aWZ5T3V0cHV0KSkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5fYmVhdXRpZnlPdXRwdXQgPSBwcm9maWxlLmJlYXV0aWZ5T3V0cHV0O1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGlmICghaXNOdWxsT3JVbmRlZmluZWQocHJvZmlsZS5wcmVzZXJ2ZU9yZGVyKSkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5fcHJlc2VydmVPcmRlciA9IHByb2ZpbGUucHJlc2VydmVPcmRlcjtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBpZiAoIWlzTnVsbE9yVW5kZWZpbmVkKHByb2ZpbGUuYXBpa2V5KSkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5fYXBpa2V5ID0gcHJvZmlsZS5hcGlrZXk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgaWYgKCFpc051bGxPclVuZGVmaW5lZChwcm9maWxlLmFwaWtleWZpbGUpKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLl9hcGlrZXlmaWxlID0gcHJvZmlsZS5hcGlrZXlmaWxlO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgdGhpcy53YXJuaW5nc0ZvdW5kLnB1c2goJ2RpZCBub3QgZmluZCBcInhsaWZmbWVyZ2VPcHRpb25zXCIgaW4gcHJvZmlsZSwgdXNpbmcgZGVmYXVsdHMnKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBDaGVjayBhbGwgUGFyYW1ldGVycywgd2V0aGVyIHRoZXkgYXJlIGNvbXBsZXRlIGFuZCBjb25zaXN0ZW50LlxyXG4gICAgICogaWYgc29tZXRoaW5nIGlzIHdyb25nIHdpdGggdGhlIHBhcmFtZXRlcnMsIGl0IGlzIGNvbGxlY3RlZCBpbiBlcnJvcnNGb3VuZC5cclxuICAgICAqL1xyXG4gICAgcHJpdmF0ZSBjaGVja1BhcmFtZXRlcnMoKTogdm9pZCB7XHJcbiAgICAgICAgdGhpcy5jaGVja0xhbmd1YWdlU3ludGF4KHRoaXMuZGVmYXVsdExhbmd1YWdlKCkpO1xyXG4gICAgICAgIGlmICh0aGlzLmxhbmd1YWdlcygpLmxlbmd0aCA9PT0gMCkge1xyXG4gICAgICAgICAgICB0aGlzLmVycm9yc0ZvdW5kLnB1c2gobmV3IFhsaWZmTWVyZ2VFcnJvcignbm8gbGFuZ3VhZ2VzIHNwZWNpZmllZCcpKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgdGhpcy5sYW5ndWFnZXMoKS5mb3JFYWNoKChsYW5nKSA9PiB7XHJcbiAgICAgICAgICAgIHRoaXMuY2hlY2tMYW5ndWFnZVN5bnRheChsYW5nKTtcclxuICAgICAgICB9KTtcclxuICAgICAgICBsZXQgc3RhdHM6IFN0YXRzO1xyXG4gICAgICAgIGxldCBlcnI6IGFueTtcclxuICAgICAgICAvLyBzcmNEaXIgc2hvdWxkIGV4aXN0c1xyXG4gICAgICAgIHRyeSB7XHJcbiAgICAgICAgICAgIHN0YXRzID0gZnMuc3RhdFN5bmModGhpcy5zcmNEaXIoKSk7XHJcbiAgICAgICAgfSBjYXRjaCAoZSkge1xyXG4gICAgICAgICAgICBlcnIgPSBlO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAoISFlcnIgfHwgIXN0YXRzLmlzRGlyZWN0b3J5KCkpIHtcclxuICAgICAgICAgICAgdGhpcy5lcnJvcnNGb3VuZC5wdXNoKG5ldyBYbGlmZk1lcmdlRXJyb3IoJ3NyY0RpciBcIicgKyB0aGlzLnNyY0RpcigpICsgJ1wiIGlzIG5vdCBhIGRpcmVjdG9yeScpKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgLy8gZ2VuRGlyIHNob3VsZCBleGlzdHNcclxuICAgICAgICB0cnkge1xyXG4gICAgICAgICAgICBzdGF0cyA9IGZzLnN0YXRTeW5jKHRoaXMuZ2VuRGlyKCkpO1xyXG4gICAgICAgIH0gY2F0Y2ggKGUpIHtcclxuICAgICAgICAgICAgZXJyID0gZTtcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKCEhZXJyIHx8ICFzdGF0cy5pc0RpcmVjdG9yeSgpKSB7XHJcbiAgICAgICAgICAgIHRoaXMuZXJyb3JzRm91bmQucHVzaChuZXcgWGxpZmZNZXJnZUVycm9yKCdnZW5EaXIgXCInICsgdGhpcy5nZW5EaXIoKSArICdcIiBpcyBub3QgYSBkaXJlY3RvcnknKSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIC8vIG1hc3RlciBmaWxlIE1VU1QgZXhpc3RcclxuICAgICAgICB0cnkge1xyXG4gICAgICAgICAgICBmcy5hY2Nlc3NTeW5jKHRoaXMuaTE4bkZpbGUoKSwgZnMuY29uc3RhbnRzLlJfT0spO1xyXG4gICAgICAgIH0gY2F0Y2ggKGVycikge1xyXG4gICAgICAgICAgICB0aGlzLmVycm9yc0ZvdW5kLnB1c2gobmV3IFhsaWZmTWVyZ2VFcnJvcignaTE4bkZpbGUgXCInICsgdGhpcy5pMThuRmlsZSgpICsgJ1wiIGlzIG5vdCByZWFkYWJsZScpKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgLy8gaTE4bkZvcm1hdCBtdXN0IGJlIHhsZiB4bGYyIG9yIHhtYlxyXG4gICAgICAgIGlmICghKHRoaXMuaTE4bkZvcm1hdCgpID09PSAneGxmJyB8fCB0aGlzLmkxOG5Gb3JtYXQoKSA9PT0gJ3hsZjInIHx8IHRoaXMuaTE4bkZvcm1hdCgpID09PSAneG1iJykpIHtcclxuICAgICAgICAgICAgdGhpcy5lcnJvcnNGb3VuZC5wdXNoKG5ldyBYbGlmZk1lcmdlRXJyb3IoJ2kxOG5Gb3JtYXQgXCInICsgdGhpcy5pMThuRm9ybWF0KCkgKyAnXCIgaW52YWxpZCwgbXVzdCBiZSBcInhsZlwiIG9yIFwieGxmMlwiIG9yIFwieG1iXCInKSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIC8vIGF1dG90cmFuc2xhdGUgcmVxdWlyZXMgYXBpIGtleVxyXG4gICAgICAgIGlmICh0aGlzLmF1dG90cmFuc2xhdGUoKSAmJiAhdGhpcy5hcGlrZXkoKSkge1xyXG4gICAgICAgICAgICB0aGlzLmVycm9yc0ZvdW5kLnB1c2gobmV3IFhsaWZmTWVyZ2VFcnJvcignYXV0b3RyYW5zbGF0ZSByZXF1aXJlcyBhbiBBUEkga2V5LCBwbGVhc2Ugc2V0IG9uZScpKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgLy8gYXV0b3RyYW5zbGF0ZWQgbGFuZ3VhZ2VzIG11c3QgYmUgaW4gbGlzdCBvZiBhbGwgbGFuZ3VhZ2VzXHJcbiAgICAgICAgdGhpcy5hdXRvdHJhbnNsYXRlZExhbmd1YWdlcygpLmZvckVhY2goKGxhbmcpID0+IHtcclxuICAgICAgICAgICAgaWYgKHRoaXMubGFuZ3VhZ2VzKCkuaW5kZXhPZihsYW5nKSA8IDApIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuZXJyb3JzRm91bmQucHVzaChuZXcgWGxpZmZNZXJnZUVycm9yKCdhdXRvdHJhbnNsYXRlIGxhbmd1YWdlIFwiJyArIGxhbmcgKyAnXCIgaXMgbm90IGluIGxpc3Qgb2YgbGFuZ3VhZ2VzJykpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGlmIChsYW5nID09PSB0aGlzLmRlZmF1bHRMYW5ndWFnZSgpKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmVycm9yc0ZvdW5kLnB1c2goXHJcbiAgICAgICAgICAgICAgICAgICAgbmV3IFhsaWZmTWVyZ2VFcnJvcignYXV0b3RyYW5zbGF0ZSBsYW5ndWFnZSBcIicgKyBsYW5nICsgJ1wiIGNhbm5vdCBiZSB0cmFuc2xhdGVkLCBiZWNhdXNlIGl0IGlzIHRoZSBzb3VyY2UgbGFuZ3VhZ2UnKSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KTtcclxuICAgICAgICAvLyBuZ3ggdHJhbnNsYXRlIHBhdHRlcm4gY2hlY2tcclxuICAgICAgICBpZiAodGhpcy5zdXBwb3J0Tmd4VHJhbnNsYXRlKCkpIHtcclxuICAgICAgICAgICAgY29uc3QgY2hlY2tSZXN1bHQgPSBOZ3hUcmFuc2xhdGVFeHRyYWN0b3IuY2hlY2tQYXR0ZXJuKHRoaXMubmd4VHJhbnNsYXRlRXh0cmFjdGlvblBhdHRlcm4oKSk7XHJcbiAgICAgICAgICAgIGlmICghaXNOdWxsT3JVbmRlZmluZWQoY2hlY2tSZXN1bHQpKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmVycm9yc0ZvdW5kLnB1c2goXHJcbiAgICAgICAgICAgICAgICAgICAgbmV3IFhsaWZmTWVyZ2VFcnJvcignbmd4VHJhbnNsYXRlRXh0cmFjdGlvblBhdHRlcm4gXCInICsgdGhpcy5uZ3hUcmFuc2xhdGVFeHRyYWN0aW9uUGF0dGVybigpICsgJ1wiOiAnICsgY2hlY2tSZXN1bHQpKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICAvLyB0YXJnZXRQcmFlZml4IGFuZCB0YXJnZXRTdWZmaXggY2hlY2tcclxuICAgICAgICBpZiAoIXRoaXMudXNlU291cmNlQXNUYXJnZXQoKSkge1xyXG4gICAgICAgICAgICBpZiAodGhpcy50YXJnZXRQcmFlZml4KCkubGVuZ3RoID4gMCkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy53YXJuaW5nc0ZvdW5kLnB1c2goXHJcbiAgICAgICAgICAgICAgICAgICAgJ2NvbmZpZ3VyZWQgdGFyZ2V0UHJhZWZpeCBcIicgKyB0aGlzLnRhcmdldFByYWVmaXgoKSArICdcIiB3aWxsIG5vdCBiZSB1c2VkIGJlY2F1c2UgXCJ1c2VTb3VyY2VBc1RhcmdldFwiIGlzIGRpc2FibGVkXCInKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBpZiAodGhpcy50YXJnZXRTdWZmaXgoKS5sZW5ndGggPiAwKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLndhcm5pbmdzRm91bmQucHVzaChcclxuICAgICAgICAgICAgICAgICAgICAnY29uZmlndXJlZCB0YXJnZXRTdWZmaXggXCInICsgdGhpcy50YXJnZXRTdWZmaXgoKSArICdcIiB3aWxsIG5vdCBiZSB1c2VkIGJlY2F1c2UgXCJ1c2VTb3VyY2VBc1RhcmdldFwiIGlzIGRpc2FibGVkXCInKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBDaGVjayBzeW50YXggb2YgbGFuZ3VhZ2UuXHJcbiAgICAgKiBNdXN0IGJlIGNvbXBhdGlibGUgd2l0aCBYTUwgU2NoZW1hIHR5cGUgeHNkOmxhbmd1YWdlLlxyXG4gICAgICogUGF0dGVybjogW2EtekEtWl17MSw4fSgoLXxfKVthLXpBLVowLTldezEsOH0pKlxyXG4gICAgICogQHBhcmFtIGxhbmcgbGFuZ3VhZ2UgdG8gY2hlY2tcclxuICAgICAqL1xyXG4gICAgcHJpdmF0ZSBjaGVja0xhbmd1YWdlU3ludGF4KGxhbmc6IHN0cmluZykge1xyXG4gICAgICAgIGNvbnN0IHBhdHRlcm4gPSAvXlthLXpBLVpdezEsOH0oWy1fXVthLXpBLVowLTldezEsOH0pKiQvO1xyXG4gICAgICAgIGlmICghcGF0dGVybi50ZXN0KGxhbmcpKSB7XHJcbiAgICAgICAgICAgIHRoaXMuZXJyb3JzRm91bmQucHVzaChuZXcgWGxpZmZNZXJnZUVycm9yKCdsYW5ndWFnZSBcIicgKyBsYW5nICsgJ1wiIGlzIG5vdCB2YWxpZCcpKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIGFsbG93SWRDaGFuZ2UoKTogYm9vbGVhbiB7XHJcbiAgICAgICAgcmV0dXJuIChpc051bGxPclVuZGVmaW5lZCh0aGlzLl9hbGxvd0lkQ2hhbmdlKSkgPyBmYWxzZSA6IHRoaXMuX2FsbG93SWRDaGFuZ2U7XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIHZlcmJvc2UoKTogYm9vbGVhbiB7XHJcbiAgICAgICAgcmV0dXJuIChpc051bGxPclVuZGVmaW5lZCh0aGlzLl92ZXJib3NlKSkgPyBmYWxzZSA6IHRoaXMuX3ZlcmJvc2U7XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIHF1aWV0KCk6IGJvb2xlYW4ge1xyXG4gICAgICAgIHJldHVybiAoaXNOdWxsT3JVbmRlZmluZWQodGhpcy5fcXVpZXQpKSA/IGZhbHNlIDogdGhpcy5fcXVpZXQ7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBEZWJ1ZyBvdXRwdXQgYWxsIHBhcmFtZXRlcnMgdG8gY29tbWFuZE91dHB1dC5cclxuICAgICAqL1xyXG4gICAgcHVibGljIHNob3dBbGxQYXJhbWV0ZXJzKGNvbW1hbmRPdXRwdXQ6IENvbW1hbmRPdXRwdXQpOiB2b2lkIHtcclxuICAgICAgICBjb21tYW5kT3V0cHV0LmRlYnVnKCd4bGlmZm1lcmdlIFVzZWQgUGFyYW1ldGVyczonKTtcclxuICAgICAgICBjb21tYW5kT3V0cHV0LmRlYnVnKCd1c2VkUHJvZmlsZVBhdGg6XFx0XCIlc1wiJywgdGhpcy51c2VkUHJvZmlsZVBhdGgpO1xyXG4gICAgICAgIGNvbW1hbmRPdXRwdXQuZGVidWcoJ2RlZmF1bHRMYW5ndWFnZTpcXHRcIiVzXCInLCB0aGlzLmRlZmF1bHRMYW5ndWFnZSgpKTtcclxuICAgICAgICBjb21tYW5kT3V0cHV0LmRlYnVnKCdzcmNEaXI6XFx0XCIlc1wiJywgdGhpcy5zcmNEaXIoKSk7XHJcbiAgICAgICAgY29tbWFuZE91dHB1dC5kZWJ1ZygnZ2VuRGlyOlxcdFwiJXNcIicsIHRoaXMuZ2VuRGlyKCkpO1xyXG4gICAgICAgIGNvbW1hbmRPdXRwdXQuZGVidWcoJ2kxOG5CYXNlRmlsZTpcXHRcIiVzXCInLCB0aGlzLmkxOG5CYXNlRmlsZSgpKTtcclxuICAgICAgICBjb21tYW5kT3V0cHV0LmRlYnVnKCdpMThuRmlsZTpcXHRcIiVzXCInLCB0aGlzLmkxOG5GaWxlKCkpO1xyXG4gICAgICAgIGNvbW1hbmRPdXRwdXQuZGVidWcoJ2xhbmd1YWdlczpcXHQlcycsIHRoaXMubGFuZ3VhZ2VzKCkpO1xyXG4gICAgICAgIGZvciAoY29uc3QgbGFuZ3VhZ2Ugb2YgdGhpcy5sYW5ndWFnZXMoKSkge1xyXG4gICAgICAgICAgICBjb21tYW5kT3V0cHV0LmRlYnVnKCdvdXRwdXRGaWxlWyVzXTpcXHQlcycsIGxhbmd1YWdlLCB0aGlzLmdlbmVyYXRlZEkxOG5GaWxlKGxhbmd1YWdlKSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGNvbW1hbmRPdXRwdXQuZGVidWcoJ3JlbW92ZVVudXNlZElkczpcXHQlcycsIHRoaXMucmVtb3ZlVW51c2VkSWRzKCkpO1xyXG4gICAgICAgIGNvbW1hbmRPdXRwdXQuZGVidWcoJ3N1cHBvcnROZ3hUcmFuc2xhdGU6XFx0JXMnLCB0aGlzLnN1cHBvcnROZ3hUcmFuc2xhdGUoKSk7XHJcbiAgICAgICAgaWYgKHRoaXMuc3VwcG9ydE5neFRyYW5zbGF0ZSgpKSB7XHJcbiAgICAgICAgICAgIGNvbW1hbmRPdXRwdXQuZGVidWcoJ25neFRyYW5zbGF0ZUV4dHJhY3Rpb25QYXR0ZXJuOlxcdCVzJywgdGhpcy5uZ3hUcmFuc2xhdGVFeHRyYWN0aW9uUGF0dGVybigpKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgY29tbWFuZE91dHB1dC5kZWJ1ZygndXNlU291cmNlQXNUYXJnZXQ6XFx0JXMnLCB0aGlzLnVzZVNvdXJjZUFzVGFyZ2V0KCkpO1xyXG4gICAgICAgIGlmICh0aGlzLnVzZVNvdXJjZUFzVGFyZ2V0KCkpIHtcclxuICAgICAgICAgICAgY29tbWFuZE91dHB1dC5kZWJ1ZygndGFyZ2V0UHJhZWZpeDpcXHRcIiVzXCInLCB0aGlzLnRhcmdldFByYWVmaXgoKSk7XHJcbiAgICAgICAgICAgIGNvbW1hbmRPdXRwdXQuZGVidWcoJ3RhcmdldFN1ZmZpeDpcXHRcIiVzXCInLCB0aGlzLnRhcmdldFN1ZmZpeCgpKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgY29tbWFuZE91dHB1dC5kZWJ1ZygnYWxsb3dJZENoYW5nZTpcXHQlcycsIHRoaXMuYWxsb3dJZENoYW5nZSgpKTtcclxuICAgICAgICBjb21tYW5kT3V0cHV0LmRlYnVnKCdiZWF1dGlmeU91dHB1dDpcXHQlcycsIHRoaXMuYmVhdXRpZnlPdXRwdXQoKSk7XHJcbiAgICAgICAgY29tbWFuZE91dHB1dC5kZWJ1ZygncHJlc2VydmVPcmRlcjpcXHQlcycsIHRoaXMucHJlc2VydmVPcmRlcigpKTtcclxuICAgICAgICBjb21tYW5kT3V0cHV0LmRlYnVnKCdhdXRvdHJhbnNsYXRlOlxcdCVzJywgdGhpcy5hdXRvdHJhbnNsYXRlKCkpO1xyXG4gICAgICAgIGlmICh0aGlzLmF1dG90cmFuc2xhdGUoKSkge1xyXG4gICAgICAgICAgICBjb21tYW5kT3V0cHV0LmRlYnVnKCdhdXRvdHJhbnNsYXRlZCBsYW5ndWFnZXM6XFx0JXMnLCB0aGlzLmF1dG90cmFuc2xhdGVkTGFuZ3VhZ2VzKCkpO1xyXG4gICAgICAgICAgICBjb21tYW5kT3V0cHV0LmRlYnVnKCdhcGlrZXk6XFx0JXMnLCB0aGlzLmFwaWtleSgpID8gJyoqKionIDogJ05PVCBTRVQnKTtcclxuICAgICAgICAgICAgY29tbWFuZE91dHB1dC5kZWJ1ZygnYXBpa2V5ZmlsZTpcXHQlcycsIHRoaXMuYXBpa2V5ZmlsZSgpKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBEZWZhdWx0LUxhbmd1YWdlLCBkZWZhdWx0IGVuLlxyXG4gICAgICogQHJldHVybiBkZWZhdWx0IGxhbmd1YWdlXHJcbiAgICAgKi9cclxuICAgIHB1YmxpYyBkZWZhdWx0TGFuZ3VhZ2UoKTogc3RyaW5nIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5fZGVmYXVsdExhbmd1YWdlID8gdGhpcy5fZGVmYXVsdExhbmd1YWdlIDogJ2VuJztcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIExpc3RlIGRlciB6dSBiZWFyYmVpdGVuZGVuIFNwcmFjaGVuLlxyXG4gICAgICogQHJldHVybiBsYW5ndWFnZXNcclxuICAgICAqL1xyXG4gICAgcHVibGljIGxhbmd1YWdlcygpOiBzdHJpbmdbXSB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuX2xhbmd1YWdlcyA/IHRoaXMuX2xhbmd1YWdlcyA6IFtdO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogc3JjIGRpcmVjdG9yeSwgd2hlcmUgdGhlIG1hc3RlciB4bGlmIGlzIGxvY2F0ZWQuXHJcbiAgICAgKiBAcmV0dXJuIHNyY0RpclxyXG4gICAgICovXHJcbiAgICBwdWJsaWMgc3JjRGlyKCk6IHN0cmluZyB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuX3NyY0RpciA/IHRoaXMuX3NyY0RpciA6ICcuJztcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIFRoZSBiYXNlIGZpbGUgbmFtZSBvZiB0aGUgeGxpZiBmaWxlIGZvciBpbnB1dCBhbmQgb3V0cHV0LlxyXG4gICAgICogRGVmYXVsdCBpcyBtZXNzYWdlc1xyXG4gICAgICogQHJldHVybiBiYXNlIGZpbGVcclxuICAgICAqL1xyXG4gICAgcHVibGljIGkxOG5CYXNlRmlsZSgpOiBzdHJpbmcge1xyXG4gICAgICAgIHJldHVybiB0aGlzLl9pMThuQmFzZUZpbGUgPyB0aGlzLl9pMThuQmFzZUZpbGUgOiAnbWVzc2FnZXMnO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogVGhlIG1hc3RlciB4bGlmIGZpbGUgKHRoZSBvbmUgZ2VuZXJhdGVkIGJ5IG5nLXhpMThuKS5cclxuICAgICAqIERlZmF1bHQgaXMgPHNyY0Rpcj4vPGkxOG5CYXNlRmlsZT4ueGxmLlxyXG4gICAgICogQHJldHVybiBtYXN0ZXIgZmlsZVxyXG4gICAgICovXHJcbiAgICBwdWJsaWMgaTE4bkZpbGUoKTogc3RyaW5nIHtcclxuICAgICAgICByZXR1cm4gam9pbih0aGlzLnNyY0RpcigpLFxyXG4gICAgICAgICAgICAodGhpcy5faTE4bkZpbGUgPyB0aGlzLl9pMThuRmlsZSA6IHRoaXMuaTE4bkJhc2VGaWxlKCkgKyAnLicgKyB0aGlzLnN1ZmZpeEZvckdlbmVyYXRlZEkxOG5GaWxlKCkpXHJcbiAgICAgICAgKS5yZXBsYWNlKC9cXFxcL2csICcvJyk7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBGb3JtYXQgb2YgdGhlIG1hc3RlciB4bGlmIGZpbGUuXHJcbiAgICAgKiBEZWZhdWx0IGlzIFwieGxmXCIsIHBvc3NpYmxlIGFyZSBcInhsZlwiIG9yIFwieGxmMlwiIG9yIFwieG1iXCIuXHJcbiAgICAgKiBAcmV0dXJuIGZvcm1hdFxyXG4gICAgICovXHJcbiAgICBwdWJsaWMgaTE4bkZvcm1hdCgpOiBzdHJpbmcge1xyXG4gICAgICAgIHJldHVybiAodGhpcy5faTE4bkZvcm1hdCA/IHRoaXMuX2kxOG5Gb3JtYXQgOiAneGxmJyk7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBwb3RlbnRpYWxseSB0byBiZSBnZW5lcmF0ZWQgSTE4bi1GaWxlIHdpdGggdGhlIHRyYW5zbGF0aW9ucyBmb3Igb25lIGxhbmd1YWdlLlxyXG4gICAgICogQHBhcmFtIGxhbmcgbGFuZ3VhZ2Ugc2hvcnRjdXRcclxuICAgICAqIEByZXR1cm4gUGF0aCBvZiBmaWxlXHJcbiAgICAgKi9cclxuICAgIHB1YmxpYyBnZW5lcmF0ZWRJMThuRmlsZShsYW5nOiBzdHJpbmcpOiBzdHJpbmcge1xyXG4gICAgICAgIHJldHVybiBqb2luKHRoaXMuZ2VuRGlyKCksIHRoaXMuaTE4bkJhc2VGaWxlKCkgKyAnLicgKyBsYW5nICsgJy4nICsgdGhpcy5zdWZmaXhGb3JHZW5lcmF0ZWRJMThuRmlsZSgpKS5yZXBsYWNlKC9cXFxcL2csICcvJyk7XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSBzdWZmaXhGb3JHZW5lcmF0ZWRJMThuRmlsZSgpOiBzdHJpbmcge1xyXG4gICAgICAgIHN3aXRjaCAodGhpcy5pMThuRm9ybWF0KCkpIHtcclxuICAgICAgICAgICAgY2FzZSAneGxmJzpcclxuICAgICAgICAgICAgICAgIHJldHVybiAneGxmJztcclxuICAgICAgICAgICAgY2FzZSAneGxmMic6XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gJ3hsZic7XHJcbiAgICAgICAgICAgIGNhc2UgJ3htYic6XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gJ3h0Yic7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogcG90ZW50aWFsbHkgdG8gYmUgZ2VuZXJhdGVkIHRyYW5zbGF0ZS1GaWxlIGZvciBuZ3gtdHJhbnNsYXRlIHdpdGggdGhlIHRyYW5zbGF0aW9ucyBmb3Igb25lIGxhbmd1YWdlLlxyXG4gICAgICogQHBhcmFtIGxhbmcgbGFuZ3VhZ2Ugc2hvcnRjdXRcclxuICAgICAqIEByZXR1cm4gUGF0aCBvZiBmaWxlXHJcbiAgICAgKi9cclxuICAgIHB1YmxpYyBnZW5lcmF0ZWROZ3hUcmFuc2xhdGVGaWxlKGxhbmc6IHN0cmluZyk6IHN0cmluZyB7XHJcbiAgICAgICAgcmV0dXJuIGpvaW4odGhpcy5nZW5EaXIoKSwgdGhpcy5pMThuQmFzZUZpbGUoKSArICcuJyArIGxhbmcgKyAnLicgKyAnanNvbicpLnJlcGxhY2UoL1xcXFwvZywgJy8nKTtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIFRoZSBlbmNvZGluZyB1c2VkIHRvIHdyaXRlIG5ldyBYTElGRi1maWxlcy5cclxuICAgICAqIEByZXR1cm4gZW5jb2RpbmdcclxuICAgICAqL1xyXG4gICAgcHVibGljIGVuY29kaW5nKCk6IHN0cmluZyB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuX2VuY29kaW5nID8gdGhpcy5fZW5jb2RpbmcgOiAnVVRGLTgnO1xyXG4gICAgfVxyXG5cclxuICAgICAvKipcclxuICAgICAgKiBPdXRwdXQtRGlyZWN0b3J5LCB3aGVyZSB0aGUgb3V0cHV0IGlzIHdyaXR0ZW4gdG8uXHJcbiAgICAgICogRGVmYXVsdCBpcyA8c3JjRGlyPi5cclxuICAgICAqL1xyXG4gICAgcHVibGljIGdlbkRpcigpOiBzdHJpbmcge1xyXG4gICAgICAgIHJldHVybiB0aGlzLl9nZW5EaXIgPyB0aGlzLl9nZW5EaXIgOiB0aGlzLnNyY0RpcigpO1xyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyByZW1vdmVVbnVzZWRJZHMoKTogYm9vbGVhbiB7XHJcbiAgICAgICAgcmV0dXJuIChpc051bGxPclVuZGVmaW5lZCh0aGlzLl9yZW1vdmVVbnVzZWRJZHMpKSA/IHRydWUgOiB0aGlzLl9yZW1vdmVVbnVzZWRJZHM7XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIHN1cHBvcnROZ3hUcmFuc2xhdGUoKTogYm9vbGVhbiB7XHJcbiAgICAgICAgcmV0dXJuIChpc051bGxPclVuZGVmaW5lZCh0aGlzLl9zdXBwb3J0Tmd4VHJhbnNsYXRlKSkgPyBmYWxzZSA6IHRoaXMuX3N1cHBvcnROZ3hUcmFuc2xhdGU7XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIG5neFRyYW5zbGF0ZUV4dHJhY3Rpb25QYXR0ZXJuKCk6IHN0cmluZyB7XHJcbiAgICAgICAgcmV0dXJuIChpc051bGxPclVuZGVmaW5lZCh0aGlzLl9uZ3hUcmFuc2xhdGVFeHRyYWN0aW9uUGF0dGVybikpID9cclxuICAgICAgICAgICAgTmd4VHJhbnNsYXRlRXh0cmFjdG9yLkRlZmF1bHRFeHRyYWN0aW9uUGF0dGVybiA6IHRoaXMuX25neFRyYW5zbGF0ZUV4dHJhY3Rpb25QYXR0ZXJuO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogV2hldGhlciBzb3VyY2UgbXVzdCBiZSB1c2VkIGFzIHRhcmdldCBmb3IgbmV3IHRyYW5zLXVuaXRzXHJcbiAgICAgKiBEZWZhdWx0IGlzIHRydWVcclxuICAgICAqL1xyXG4gICAgcHVibGljIHVzZVNvdXJjZUFzVGFyZ2V0KCk6IGJvb2xlYW4ge1xyXG4gICAgICAgIHJldHVybiAoaXNOdWxsT3JVbmRlZmluZWQodGhpcy5fdXNlU291cmNlQXNUYXJnZXQpKSA/IHRydWUgOiB0aGlzLl91c2VTb3VyY2VBc1RhcmdldDtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIFByYWVmaXggdXNlZCBmb3IgdGFyZ2V0IHdoZW4gY29weWluZyBuZXcgdHJhbnMtdW5pdHNcclxuICAgICAqIERlZmF1bHQgaXMgXCJcIlxyXG4gICAgICovXHJcbiAgICBwdWJsaWMgdGFyZ2V0UHJhZWZpeCgpOiBzdHJpbmcge1xyXG4gICAgICAgIHJldHVybiAoaXNOdWxsT3JVbmRlZmluZWQodGhpcy5fdGFyZ2V0UHJhZWZpeCkpID8gJycgOiB0aGlzLl90YXJnZXRQcmFlZml4O1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogU3VmZml4IHVzZWQgZm9yIHRhcmdldCB3aGVuIGNvcHlpbmcgbmV3IHRyYW5zLXVuaXRzXHJcbiAgICAgKiBEZWZhdWx0IGlzIFwiXCJcclxuICAgICAqL1xyXG4gICAgcHVibGljIHRhcmdldFN1ZmZpeCgpOiBzdHJpbmcge1xyXG4gICAgICAgIHJldHVybiAoaXNOdWxsT3JVbmRlZmluZWQodGhpcy5fdGFyZ2V0U3VmZml4KSkgPyAnJyA6IHRoaXMuX3RhcmdldFN1ZmZpeDtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIElmIHNldCwgcnVuIHhtbCByZXN1bHQgdGhyb3VnaCBiZWF1dGlmaWVyIChwcmV0dHktZGF0YSkuXHJcbiAgICAgKi9cclxuICAgIHB1YmxpYyBiZWF1dGlmeU91dHB1dCgpOiBib29sZWFuIHtcclxuICAgICAgICByZXR1cm4gKGlzTnVsbE9yVW5kZWZpbmVkKHRoaXMuX2JlYXV0aWZ5T3V0cHV0KSkgPyBmYWxzZSA6IHRoaXMuX2JlYXV0aWZ5T3V0cHV0O1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogSWYgc2V0LCBvcmRlciBvZiBuZXcgdHJhbnMgdW5pdHMgd2lsbCBiZSBhcyBpbiBtYXN0ZXIuXHJcbiAgICAgKiBPdGhlcndpc2UgdGhleSBhcmUgYWRkZWQgYXQgdGhlIGVuZC5cclxuICAgICAqL1xyXG4gICAgcHVibGljIHByZXNlcnZlT3JkZXIoKTogYm9vbGVhbiB7XHJcbiAgICAgICAgcmV0dXJuIChpc051bGxPclVuZGVmaW5lZCh0aGlzLl9wcmVzZXJ2ZU9yZGVyKSkgPyB0cnVlIDogdGhpcy5fcHJlc2VydmVPcmRlcjtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIFdoZXRoZXIgdG8gdXNlIGF1dG90cmFuc2xhdGUgZm9yIG5ldyB0cmFucy11bml0c1xyXG4gICAgICogRGVmYXVsdCBpcyBmYWxzZVxyXG4gICAgICovXHJcbiAgICBwdWJsaWMgYXV0b3RyYW5zbGF0ZSgpOiBib29sZWFuIHtcclxuICAgICAgICBpZiAoaXNOdWxsT3JVbmRlZmluZWQodGhpcy5fYXV0b3RyYW5zbGF0ZSkpIHtcclxuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAoaXNBcnJheSh0aGlzLl9hdXRvdHJhbnNsYXRlKSkge1xyXG4gICAgICAgICAgICByZXR1cm4gKDxzdHJpbmdbXT50aGlzLl9hdXRvdHJhbnNsYXRlKS5sZW5ndGggPiAwO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gPGJvb2xlYW4+IHRoaXMuX2F1dG90cmFuc2xhdGU7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBXaGV0aGVyIHRvIHVzZSBhdXRvdHJhbnNsYXRlIGZvciBhIGdpdmVuIGxhbmd1YWdlLlxyXG4gICAgICogQHBhcmFtIGxhbmcgbGFuZ3VhZ2UgY29kZS5cclxuICAgICAqL1xyXG4gICAgcHVibGljIGF1dG90cmFuc2xhdGVMYW5ndWFnZShsYW5nOiBzdHJpbmcpOiBib29sZWFuIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5hdXRvdHJhbnNsYXRlZExhbmd1YWdlcygpLmluZGV4T2YobGFuZykgPj0gMDtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIFJldHVybiBhIGxpc3Qgb2YgbGFuZ3VhZ2VzIHRvIGJlIGF1dG90cmFuc2xhdGVkLlxyXG4gICAgICovXHJcbiAgICBwdWJsaWMgYXV0b3RyYW5zbGF0ZWRMYW5ndWFnZXMoKTogc3RyaW5nW10ge1xyXG4gICAgICAgIGlmIChpc051bGxPclVuZGVmaW5lZCh0aGlzLl9hdXRvdHJhbnNsYXRlKSB8fCB0aGlzLl9hdXRvdHJhbnNsYXRlID09PSBmYWxzZSkge1xyXG4gICAgICAgICAgICByZXR1cm4gW107XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmIChpc0FycmF5KHRoaXMuX2F1dG90cmFuc2xhdGUpKSB7XHJcbiAgICAgICAgICAgIHJldHVybiAoPHN0cmluZ1tdPnRoaXMuX2F1dG90cmFuc2xhdGUpO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gdGhpcy5sYW5ndWFnZXMoKS5zbGljZSgxKTsgLy8gZmlyc3QgaXMgc291cmNlIGxhbmd1YWdlXHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBBUEkga2V5IHRvIGJlIHVzZWQgZm9yIEdvb2dsZSBUcmFuc2xhdGVcclxuICAgICAqIEByZXR1cm4gYXBpIGtleVxyXG4gICAgICovXHJcbiAgICBwdWJsaWMgYXBpa2V5KCk6IHN0cmluZyB7XHJcbiAgICAgICAgaWYgKCFpc051bGxPclVuZGVmaW5lZCh0aGlzLl9hcGlrZXkpKSB7XHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzLl9hcGlrZXk7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgY29uc3QgYXBpa2V5UGF0aCA9IHRoaXMuYXBpa2V5ZmlsZSgpO1xyXG4gICAgICAgICAgICBpZiAodGhpcy5hcGlrZXlmaWxlKCkpIHtcclxuICAgICAgICAgICAgICAgIGlmIChmcy5leGlzdHNTeW5jKGFwaWtleVBhdGgpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIEZpbGVVdGlsLnJlYWQoYXBpa2V5UGF0aCwgJ3V0Zi04Jyk7XHJcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihmb3JtYXQoJ2FwaSBrZXkgZmlsZSBub3QgZm91bmQ6IEFQSV9LRVlfRklMRT0lcycsIGFwaWtleVBhdGgpKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiBudWxsO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogZmlsZSBuYW1lIGZvciBBUEkga2V5IHRvIGJlIHVzZWQgZm9yIEdvb2dsZSBUcmFuc2xhdGUuXHJcbiAgICAgKiBFeHBsaWNpdGx5IHNldCBvciByZWFkIGZyb20gZW52IHZhciBBUElfS0VZX0ZJTEUuXHJcbiAgICAgKiBAcmV0dXJuIGZpbGUgb2YgYXBpIGtleVxyXG4gICAgICovXHJcbiAgICBwdWJsaWMgYXBpa2V5ZmlsZSgpOiBzdHJpbmcge1xyXG4gICAgICAgIGlmICh0aGlzLl9hcGlrZXlmaWxlKSB7XHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzLl9hcGlrZXlmaWxlO1xyXG4gICAgICAgIH0gZWxzZSBpZiAocHJvY2Vzcy5lbnYuQVBJX0tFWV9GSUxFKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBwcm9jZXNzLmVudi5BUElfS0VZX0ZJTEU7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgcmV0dXJuIG51bGw7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59XHJcbiJdfQ==