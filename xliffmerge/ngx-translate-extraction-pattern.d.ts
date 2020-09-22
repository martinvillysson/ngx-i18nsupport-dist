/**
 * Helper class to parse ngx translate extraction pattern
 * and to decide wether a given message matches the pattern.
 */
export declare class NgxTranslateExtractionPattern {
    private extractionPatternString;
    private _matchExplicitId;
    private _descriptionPatterns;
    /**
     * Construct the pattern from given description string
     * @param extractionPatternString extractionPatternString
     * @throws an error, if there is a syntax error
     */
    constructor(extractionPatternString: string);
    /**
     * Check, wether an explicitly set id matches the pattern.
     * @param id id
     * @return wether an explicitly set id matches the pattern.
     */
    isExplicitIdMatched(id: string): boolean;
    /**
     * Check, wether a given description matches the pattern.
     * @param description description
     * @return wether a given description matches the pattern.
     */
    isDescriptionMatched(description: string): boolean;
    private checkValidDescriptionPattern;
}
