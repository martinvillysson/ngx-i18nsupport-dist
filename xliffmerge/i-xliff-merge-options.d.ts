/**
 * Created by roobm on 15.03.2017.
 * Interfaces for command line call and config file content.
 */
/**
 * Options that can be passed as program arguments.
 */
export interface ProgramOptions {
    quiet?: boolean;
    verbose?: boolean;
    profilePath?: string;
    languages?: string[];
}
/**
 * Definition of the possible values used in the config file
 */
export interface IConfigFile {
    xliffmergeOptions?: IXliffMergeOptions;
}
export interface IXliffMergeOptions {
    quiet?: boolean;
    verbose?: boolean;
    allowIdChange?: boolean;
    defaultLanguage?: string;
    languages?: string[];
    srcDir?: string;
    i18nBaseFile?: string;
    i18nFile?: string;
    i18nFormat?: string;
    encoding?: string;
    genDir?: string;
    angularCompilerOptions?: {
        genDir?: string;
    };
    removeUnusedIds?: boolean;
    supportNgxTranslate?: boolean;
    ngxTranslateExtractionPattern?: string;
    useSourceAsTarget?: boolean;
    targetPraefix?: string;
    targetSuffix?: string;
    beautifyOutput?: boolean;
    preserveOrder?: boolean;
    autotranslate?: boolean | string[];
    apikey?: string;
    apikeyfile?: string;
}
