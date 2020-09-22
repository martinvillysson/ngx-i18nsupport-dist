import { ITranslationMessagesFile, INormalizedMessage, ITransUnit, INote } from './internalapi';
import { ParsedMessage } from './parsed-message';
import { AbstractMessageParser } from './abstract-message-parser';
/**
 * Created by roobm on 10.05.2017.
 * Abstract superclass for all implementations of ITransUnit.
 */
export declare abstract class AbstractTransUnit implements ITransUnit {
    protected _element: Element;
    protected _id: string;
    protected _translationMessagesFile: ITranslationMessagesFile;
    private _sourceContentNormalized;
    protected constructor(_element: Element, _id: string, _translationMessagesFile: ITranslationMessagesFile);
    get id(): string;
    /**
     * The file the unit belongs to.,
     */
    translationMessagesFile(): ITranslationMessagesFile;
    /**
     * The original text value, that is to be translated.
     * Contains all markup, depends on the concrete format used.
     */
    abstract sourceContent(): string;
    /**
     * Test, wether setting of source content is supported.
     * If not, setSourceContent in trans-unit will do nothing.
     * xtb does not support this, all other formats do.
     */
    supportsSetSourceContent(): boolean;
    /**
     * Set new source content in the transunit.
     * Normally, this is done by ng-extract.
     * Method only exists to allow xliffmerge to merge missing changed source content.
     * @param newContent the new content.
     */
    abstract setSourceContent(newContent: string): any;
    /**
     * The original text value, that is to be translated, as normalized message.
     */
    sourceContentNormalized(): ParsedMessage;
    /**
     * The original text value, that is to be translated, as normalized message.
     */
    abstract createSourceContentNormalized(): ParsedMessage;
    /**
     * The translated value.
     * Contains all markup, depends on the concrete format used.
     */
    abstract targetContent(): string;
    /**
     * The translated value as normalized message.
     * All placeholders are replaced with {{n}} (starting at 0)
     * and all embedded html is replaced by direct html markup.
     */
    abstract targetContentNormalized(): INormalizedMessage;
    /**
     * State of the translation as stored in the xml.
     */
    abstract nativeTargetState(): string;
    /**
     * State of the translation.
     * (on of new, translated, final)
     * Return values are defined as Constants STATE_...
     */
    targetState(): string;
    /**
     * Map an abstract state (new, translated, final) to a concrete state used in the xml.
     * Returns the state to be used in the xml.
     * @param state one of Constants.STATE...
     * @returns a native state (depends on concrete format)
     * @throws error, if state is invalid.
     */
    protected abstract mapStateToNativeState(state: string): string;
    /**
     * Map a native state (found in the document) to an abstract state (new, translated, final).
     * Returns the abstract state.
     * @param nativeState nativeState
     */
    protected abstract mapNativeStateToState(nativeState: string): string;
    /**
     * set state in xml.
     * @param nativeState nativeState
     */
    protected abstract setNativeTargetState(nativeState: string): any;
    /**
     * Modify the target state.
     * @param newState one of the 3 allowed target states new, translated, final.
     * Constants STATE_...
     * Invalid states throw an error.
     */
    setTargetState(newState: string): void;
    /**
     * All the source elements in the trans unit.
     * The source element is a reference to the original template.
     * It contains the name of the template file and a line number with the position inside the template.
     * It is just a help for translators to find the context for the translation.
     * This is set when using Angular 4.0 or greater.
     * Otherwise it just returns an empty array.
     */
    abstract sourceReferences(): {
        sourcefile: string;
        linenumber: number;
    }[];
    /**
     * Test, wether setting of source refs is supported.
     * If not, setSourceReferences will do nothing.
     * xtb does not support this, all other formats do.
     */
    supportsSetSourceReferences(): boolean;
    /**
     * Set source ref elements in the transunit.
     * Normally, this is done by ng-extract.
     * Method only exists to allow xliffmerge to merge missing source refs.
     * @param sourceRefs the sourcerefs to set. Old ones are removed.
     */
    abstract setSourceReferences(sourceRefs: {
        sourcefile: string;
        linenumber: number;
    }[]): any;
    /**
     * The description set in the template as value of the i18n-attribute.
     * e.g. i18n="mydescription".
     */
    abstract description(): string;
    /**
     * The meaning (intent) set in the template as value of the i18n-attribute.
     * This is the part in front of the | symbol.
     * e.g. i18n="meaning|mydescription".
     */
    abstract meaning(): string;
    /**
     * Test, wether setting of description and meaning is supported.
     * If not, setDescription and setMeaning will do nothing.
     * xtb does not support this, all other formats do.
     */
    supportsSetDescriptionAndMeaning(): boolean;
    /**
     * Change description property of trans-unit.
     * @param description description
     */
    abstract setDescription(description: string): any;
    /**
     * Change meaning property of trans-unit.
     * @param meaning meaning
     */
    abstract setMeaning(meaning: string): any;
    /**
     * Get all notes of the trans-unit.
     * Notes are remarks made by a translator.
     * (description and meaning are not included here!)
     */
    abstract notes(): INote[];
    /**
     * Test, wether setting of notes is supported.
     * If not, setNotes will do nothing.
     * xtb does not support this, all other formats do.
     */
    abstract supportsSetNotes(): boolean;
    /**
     * Add notes to trans unit.
     * @param newNotes the notes to add.
     * @throws an Error if any note contains descpription or meaning as from attribute.
     */
    abstract setNotes(newNotes: INote[]): any;
    /**
     * Check notes
     * @param newNotes the notes to add.
     * @throws an Error if any note contains description or meaning as from attribute.
     */
    protected checkNotes(newNotes: INote[]): void;
    /**
     * The real xml element used for the trans unit.
     * (internal usage only, a client should never need this)
     * @return real xml element used for the trans unit.
     */
    asXmlElement(): Element;
    /**
     * Copy source to target to use it as dummy translation.
     * Returns a changed copy of this trans unit.
     * receiver is not changed.
     * (internal usage only, a client should call importNewTransUnit on ITranslationMessageFile)
     */
    abstract cloneWithSourceAsTarget(isDefaultLang: boolean, copyContent: boolean, targetFile: ITranslationMessagesFile): AbstractTransUnit;
    /**
     * Copy source to target to use it as dummy translation.
     * (internal usage only, a client should call createTranslationFileForLang on ITranslationMessageFile)
     */
    abstract useSourceAsTarget(isDefaultLang: boolean, copyContent: boolean): any;
    /**
     * Translate the trans unit.
     * @param translation the translated string or (preferred) a normalized message.
     * The pure string can contain any markup and will not be checked.
     * So it can damage the document.
     * A normalized message prevents this.
     */
    translate(translation: string | INormalizedMessage): void;
    /**
     * Return a parser used for normalized messages.
     */
    protected abstract messageParser(): AbstractMessageParser;
    /**
     * Test, wether message looks like ICU message.
     * @param message message
     * @return wether message looks like ICU message.
     */
    isICUMessage(message: string): boolean;
    /**
     * Set the translation to a given string (including markup).
     * @param translation translation
     */
    protected abstract translateNative(translation: string): any;
}
