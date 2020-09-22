/**
 * Created by roobm on 16.05.2017.
 * Mapping from normalized tag names to placeholder names.
 */
export declare class TagMapping {
    getStartTagPlaceholderName(tag: string, id: number): string;
    getCloseTagPlaceholderName(tag: string): string;
    getEmptyTagPlaceholderName(tag: string, id: number): string;
    getCtypeForTag(tag: string): string;
    getTagnameFromStartTagPlaceholderName(placeholderName: string): string;
    getTagnameFromCloseTagPlaceholderName(placeholderName: string): string;
    /**
     * Test, wether placeholder name stands for empty html tag.
     * @param placeholderName can be TAG_<name> or just <name>
     */
    isEmptyTagPlaceholderName(placeholderName: string): boolean;
    /**
     * tagname of empty tag placeholder.
     * @param placeholderName can be TAG_<name> or just <name>
     */
    getTagnameFromEmptyTagPlaceholderName(placeholderName: string): string;
    /**
     * If placeholder ends with _[0-9]+, strip that number.
     * @param placeholderName placeholderName
     * @return placeholderName without counter at end.
     */
    private stripCounter;
    /**
     * String suffix for counter.
     * If counter is 0, it is empty, otherwise _<id>.
     * @param id id
     * @return suffix for counter.
     */
    private counterString;
}
