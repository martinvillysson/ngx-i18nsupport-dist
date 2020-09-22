import { ITranslationMessagesFile } from '../api/i-translation-messages-file';
import { INormalizedMessage } from '../api/i-normalized-message';
import { ITransUnit } from '../api/i-trans-unit';
import { INote } from '../api/i-note';
import { AbstractTransUnit } from './abstract-trans-unit';
import { ParsedMessage } from './parsed-message';
import { AbstractMessageParser } from './abstract-message-parser';
/**
 * Created by martin on 01.05.2017.
 * A Translation Unit in an XMB file.
 */
export declare class XmbTransUnit extends AbstractTransUnit implements ITransUnit {
    constructor(_element: Element, _id: string, _translationMessagesFile: ITranslationMessagesFile);
    /**
     * Parses something like 'c:\xxx:7' and returns source and linenumber.
     * @param sourceAndPos something like 'c:\xxx:7', last colon is the separator
     * @return source and linenumber
     */
    private static parseSourceAndPos;
    private static parseLineNumber;
    /**
     * Get content to translate.
     * Source parts are excluded here.
     * @return source content
     */
    sourceContent(): string;
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
     * State of the translation.
     * (not supported in xmb)
     */
    nativeTargetState(): string;
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
     * set state in xml.
     * (not supported in xmb)
     * @param nativeState nativeState
     */
    protected setNativeTargetState(nativeState: string): void;
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
     * In xmb this is stored in the attribute "desc".
     */
    description(): string;
    /**
     * The meaning (intent) set in the template as value of the i18n-attribute.
     * This is the part in front of the | symbol.
     * e.g. i18n="meaning|mydescription".
     * In xmb this is stored in the attribute "meaning".
     */
    meaning(): string;
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
    setDescription(description: string): void;
    /**
     * Change meaning property of trans-unit.
     * @param meaning meaning
     */
    setMeaning(meaning: string): void;
    /**
     * Get all notes of the trans-unit.
     * There are NO notes in xmb/xtb
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
     * NOT Supported in xmb/xtb
     */
    setNotes(newNotes: INote[]): void;
    /**
     * Copy source to target to use it as dummy translation.
     * Returns a changed copy of this trans unit.
     * receiver is not changed.
     * (internal usage only, a client should call importNewTransUnit on ITranslationMessageFile)
     * In xmb there is nothing to do, because there is only a target, no source.
     */
    cloneWithSourceAsTarget(isDefaultLang: boolean, copyContent: boolean, targetFile: ITranslationMessagesFile): AbstractTransUnit;
    /**
     * Copy source to target to use it as dummy translation.
     * (internal usage only, a client should call createTranslationFileForLang on ITranslationMessageFile)
     */
    useSourceAsTarget(isDefaultLang: boolean, copyContent: boolean): void;
    /**
     * Set the translation to a given string (including markup).
     * In fact, xmb cannot be translated.
     * So this throws an error.
     * @param translation translation
     */
    protected translateNative(translation: string): void;
}
