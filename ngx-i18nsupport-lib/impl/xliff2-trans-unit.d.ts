import { ITranslationMessagesFile } from '../api/i-translation-messages-file';
import { INormalizedMessage } from '../api/i-normalized-message';
import { ITransUnit } from '../api/i-trans-unit';
import { INote } from '../api/i-note';
import { ParsedMessage } from './parsed-message';
import { AbstractTransUnit } from './abstract-trans-unit';
import { AbstractMessageParser } from './abstract-message-parser';
/**
 * Created by martin on 04.05.2017.
 * A Translation Unit in an XLIFF 2.0 file.
 */
export declare class Xliff2TransUnit extends AbstractTransUnit implements ITransUnit {
    constructor(_element: Element, _id: string, _translationMessagesFile: ITranslationMessagesFile);
    sourceContent(): string;
    /**
     * Set new source content in the transunit.
     * Normally, this is done by ng-extract.
     * Method only exists to allow xliffmerge to merge missing changed source content.
     * @param newContent the new content.
     */
    setSourceContent(newContent: string): void;
    /**
     * Return a parser used for normalized messages.
     */
    protected messageParser(): AbstractMessageParser;
    /**
     * The original text value, that is to be translated, as normalized message.
     */
    createSourceContentNormalized(): ParsedMessage;
    /**
     * the translated value (containing all markup, depends on the concrete format used).
     */
    targetContent(): string;
    /**
     * the translated value, but all placeholders are replaced with {{n}} (starting at 0)
     * and all embedded html is replaced by direct html markup.
     */
    targetContentNormalized(): INormalizedMessage;
    /**
     * State of the translation as stored in the xml.
     */
    nativeTargetState(): string;
    /**
     * set state in xml.
     * @param nativeState nativeState
     */
    protected setNativeTargetState(nativeState: string): void;
    /**
     * Map an abstract state (new, translated, final) to a concrete state used in the xml.
     * Returns the state to be used in the xml.
     * @param state one of Constants.STATE...
     * @returns a native state (depends on concrete format)
     * @throws error, if state is invalid.
     */
    protected mapStateToNativeState(state: string): string;
    /**
     * Map a native state (found in the document) to an abstract state (new, translated, final).
     * Returns the abstract state.
     * @param nativeState nativeState
     */
    protected mapNativeStateToState(nativeState: string): string;
    /**
     * All the source elements in the trans unit.
     * The source element is a reference to the original template.
     * It contains the name of the template file and a line number with the position inside the template.
     * It is just a help for translators to find the context for the translation.
     * This is set when using Angular 4.0 or greater.
     * Otherwise it just returns an empty array.
     */
    sourceReferences(): {
        sourcefile: string;
        linenumber: number;
    }[];
    /**
     * Parses something like 'c:\xxx:7' and returns source and linenumber.
     * @param sourceAndPos something like 'c:\xxx:7', last colon is the separator
     * @return source and line number
     */
    private parseSourceAndPos;
    private parseLineNumber;
    /**
     * Set source ref elements in the transunit.
     * Normally, this is done by ng-extract.
     * Method only exists to allow xliffmerge to merge missing source refs.
     * @param sourceRefs the sourcerefs to set. Old ones are removed.
     */
    setSourceReferences(sourceRefs: {
        sourcefile: string;
        linenumber: number;
    }[]): void;
    private removeAllSourceReferences;
    /**
     * The description set in the template as value of the i18n-attribute.
     * e.g. i18n="mydescription".
     * In xliff 2.0 this is stored as a note element with attribute category="description".
     */
    description(): string;
    /**
     * Change description property of trans-unit.
     * @param description description
     */
    setDescription(description: string): void;
    /**
     * Find a note element with attribute category='<attrValue>'
     * @param attrValue value of category attribute
     * @return element or null is absent
     */
    private findNoteElementWithCategoryAttribute;
    /**
     * Get all note elements where from attribute is not description or meaning
     * @return elements
     */
    private findAllAdditionalNoteElements;
    /**
     * Create a new note element with attribute from='<attrValue>'
     * @param attrValue category attribute value
     * @param content content of note element
     * @return the new created element
     */
    private createNoteElementWithCategoryAttribute;
    private removeNotesElementIfEmpty;
    /**
     * Remove note element with attribute from='<attrValue>'
     * @param attrValue attrValue
     */
    private removeNoteElementWithCategoryAttribute;
    /**
     * Remove all note elements where attribute "from" is not description or meaning.
     */
    private removeAllAdditionalNoteElements;
    /**
     * The meaning (intent) set in the template as value of the i18n-attribute.
     * This is the part in front of the | symbol.
     * e.g. i18n="meaning|mydescription".
     * In xliff 2.0 this is stored as a note element with attribute category="meaning".
     */
    meaning(): string;
    /**
     * Change meaning property of trans-unit.
     * @param meaning meaning
     */
    setMeaning(meaning: string): void;
    /**
     * Get all notes of the trans-unit.
     * Notes are remarks made by a translator.
     * (description and meaning are not included here!)
     */
    notes(): INote[];
    /**
     * Test, wether setting of notes is supported.
     * If not, setNotes will do nothing.
     * xtb does not support this, all other formats do.
     */
    supportsSetNotes(): boolean;
    /**
     * Add notes to trans unit.
     * @param newNotes the notes to add.
     */
    setNotes(newNotes: INote[]): void;
    /**
     * Set the translation to a given string (including markup).
     * @param translation translation
     */
    protected translateNative(translation: string): void;
    /**
     * Copy source to target to use it as dummy translation.
     * Returns a changed copy of this trans unit.
     * receiver is not changed.
     * (internal usage only, a client should call importNewTransUnit on ITranslationMessageFile)
     */
    cloneWithSourceAsTarget(isDefaultLang: boolean, copyContent: boolean, targetFile: ITranslationMessagesFile): AbstractTransUnit;
    /**
     * Copy source to target to use it as dummy translation.
     * (internal usage only, a client should call createTranslationFileForLang on ITranslationMessageFile)
     */
    useSourceAsTarget(isDefaultLang: boolean, copyContent: boolean): void;
}
