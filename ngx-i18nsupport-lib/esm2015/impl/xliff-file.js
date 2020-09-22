import { format } from 'util';
import { FORMAT_XLIFF12, FILETYPE_XLIFF12 } from '../api/constants';
import { DOMUtilities } from './dom-utilities';
import { XliffTransUnit } from './xliff-trans-unit';
import { AbstractTranslationMessagesFile } from './abstract-translation-messages-file';
/**
 * Created by martin on 23.02.2017.
 * Ab xliff file read from a source file.
 * Defines some relevant get and set method for reading and modifying such a file.
 */
export class XliffFile extends AbstractTranslationMessagesFile {
    /**
     * Create an xlf-File from source.
     * @param xmlString source read from file.
     * @param path Path to file
     * @param encoding optional encoding of the xml.
     * This is read from the file, but if you know it before, you can avoid reading the file twice.
     * @return XliffFile
     */
    constructor(xmlString, path, encoding) {
        super();
        this._warnings = [];
        this._numberOfTransUnitsWithMissingId = 0;
        this.initializeFromContent(xmlString, path, encoding);
    }
    initializeFromContent(xmlString, path, encoding) {
        this.parseContent(xmlString, path, encoding);
        const xliffList = this._parsedDocument.getElementsByTagName('xliff');
        if (xliffList.length !== 1) {
            throw new Error(format('File "%s" seems to be no xliff file (should contain an xliff element)', path));
        }
        else {
            const version = xliffList.item(0).getAttribute('version');
            const expectedVersion = '1.2';
            if (version !== expectedVersion) {
                throw new Error(format('File "%s" seems to be no xliff 1.2 file, version should be %s, found %s', path, expectedVersion, version));
            }
        }
        return this;
    }
    /**
     * File format as it is used in config files.
     * Currently 'xlf', 'xmb', 'xmb2'
     * Returns one of the constants FORMAT_..
     */
    i18nFormat() {
        return FORMAT_XLIFF12;
    }
    /**
     * File type.
     * Here 'XLIFF 1.2'
     */
    fileType() {
        return FILETYPE_XLIFF12;
    }
    /**
     * return tag names of all elements that have mixed content.
     * These elements will not be beautified.
     * Typical candidates are source and target.
     */
    elementsWithMixedContent() {
        return ['source', 'target', 'tool', 'seg-source', 'g', 'ph', 'bpt', 'ept', 'it', 'sub', 'mrk'];
    }
    initializeTransUnits() {
        this.transUnits = [];
        const transUnitsInFile = this._parsedDocument.getElementsByTagName('trans-unit');
        for (let i = 0; i < transUnitsInFile.length; i++) {
            const transunit = transUnitsInFile.item(i);
            const id = transunit.getAttribute('id');
            if (!id) {
                this._warnings.push(format('oops, trans-unit without "id" found in master, please check file %s', this._filename));
            }
            this.transUnits.push(new XliffTransUnit(transunit, id, this));
        }
    }
    /**
     * Get source language.
     * @return source language.
     */
    sourceLanguage() {
        const fileElem = DOMUtilities.getFirstElementByTagName(this._parsedDocument, 'file');
        if (fileElem) {
            return fileElem.getAttribute('source-language');
        }
        else {
            return null;
        }
    }
    /**
     * Edit the source language.
     * @param language language
     */
    setSourceLanguage(language) {
        const fileElem = DOMUtilities.getFirstElementByTagName(this._parsedDocument, 'file');
        if (fileElem) {
            fileElem.setAttribute('source-language', language);
        }
    }
    /**
     * Get target language.
     * @return target language.
     */
    targetLanguage() {
        const fileElem = DOMUtilities.getFirstElementByTagName(this._parsedDocument, 'file');
        if (fileElem) {
            return fileElem.getAttribute('target-language');
        }
        else {
            return null;
        }
    }
    /**
     * Edit the target language.
     * @param language language
     */
    setTargetLanguage(language) {
        const fileElem = DOMUtilities.getFirstElementByTagName(this._parsedDocument, 'file');
        if (fileElem) {
            fileElem.setAttribute('target-language', language);
        }
    }
    /**
     * Add a new trans-unit to this file.
     * The trans unit stems from another file.
     * It copies the source content of the tu to the target content too,
     * depending on the values of isDefaultLang and copyContent.
     * So the source can be used as a dummy translation.
     * (used by xliffmerge)
     * @param foreignTransUnit the trans unit to be imported.
     * @param isDefaultLang Flag, wether file contains the default language.
     * Then source and target are just equal.
     * The content will be copied.
     * State will be final.
     * @param copyContent Flag, wether to copy content or leave it empty.
     * Wben true, content will be copied from source.
     * When false, content will be left empty (if it is not the default language).
     * @param importAfterElement optional (since 1.10) other transunit (part of this file), that should be used as ancestor.
     * Newly imported trans unit is then inserted directly after this element.
     * If not set or not part of this file, new unit will be imported at the end.
     * If explicity set to null, new unit will be imported at the start.
     * @return the newly imported trans unit (since version 1.7.0)
     * @throws an error if trans-unit with same id already is in the file.
     */
    importNewTransUnit(foreignTransUnit, isDefaultLang, copyContent, importAfterElement) {
        if (this.transUnitWithId(foreignTransUnit.id)) {
            throw new Error(format('tu with id %s already exists in file, cannot import it', foreignTransUnit.id));
        }
        const newTu = foreignTransUnit.cloneWithSourceAsTarget(isDefaultLang, copyContent, this);
        const bodyElement = DOMUtilities.getFirstElementByTagName(this._parsedDocument, 'body');
        if (!bodyElement) {
            throw new Error(format('File "%s" seems to be no xliff 1.2 file (should contain a body element)', this._filename));
        }
        let inserted = false;
        let isAfterElementPartOfFile = false;
        if (!!importAfterElement) {
            const insertionPoint = this.transUnitWithId(importAfterElement.id);
            if (!!insertionPoint) {
                isAfterElementPartOfFile = true;
            }
        }
        if (importAfterElement === undefined || (importAfterElement && !isAfterElementPartOfFile)) {
            bodyElement.appendChild(newTu.asXmlElement());
            inserted = true;
        }
        else if (importAfterElement === null) {
            const firstUnitElement = DOMUtilities.getFirstElementByTagName(this._parsedDocument, 'trans-unit');
            if (firstUnitElement) {
                DOMUtilities.insertBefore(newTu.asXmlElement(), firstUnitElement);
                inserted = true;
            }
            else {
                // no trans-unit, empty file, so add to body
                bodyElement.appendChild(newTu.asXmlElement());
                inserted = true;
            }
        }
        else {
            const refUnitElement = DOMUtilities.getElementByTagNameAndId(this._parsedDocument, 'trans-unit', importAfterElement.id);
            if (refUnitElement) {
                DOMUtilities.insertAfter(newTu.asXmlElement(), refUnitElement);
                inserted = true;
            }
        }
        if (inserted) {
            this.lazyInitializeTransUnits();
            this.transUnits.push(newTu);
            this.countNumbers();
            return newTu;
        }
        else {
            return null;
        }
    }
    /**
     * Create a new translation file for this file for a given language.
     * Normally, this is just a copy of the original one.
     * But for XMB the translation file has format 'XTB'.
     * @param lang Language code
     * @param filename expected filename to store file
     * @param isDefaultLang Flag, wether file contains the default language.
     * Then source and target are just equal.
     * The content will be copied.
     * State will be final.
     * @param copyContent Flag, wether to copy content or leave it empty.
     * Wben true, content will be copied from source.
     * When false, content will be left empty (if it is not the default language).
     */
    createTranslationFileForLang(lang, filename, isDefaultLang, copyContent) {
        const translationFile = new XliffFile(this.editedContent(), filename, this.encoding());
        translationFile.setNewTransUnitTargetPraefix(this.targetPraefix);
        translationFile.setNewTransUnitTargetSuffix(this.targetSuffix);
        translationFile.setTargetLanguage(lang);
        translationFile.forEachTransUnit((transUnit) => {
            transUnit.useSourceAsTarget(isDefaultLang, copyContent);
        });
        return translationFile;
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoieGxpZmYtZmlsZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3Byb2plY3RzL25neC1pMThuc3VwcG9ydC1saWIvc3JjL2ltcGwveGxpZmYtZmlsZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLEVBQUMsTUFBTSxFQUFDLE1BQU0sTUFBTSxDQUFDO0FBRzVCLE9BQU8sRUFBQyxjQUFjLEVBQUUsZ0JBQWdCLEVBQUMsTUFBTSxrQkFBa0IsQ0FBQztBQUNsRSxPQUFPLEVBQUMsWUFBWSxFQUFDLE1BQU0saUJBQWlCLENBQUM7QUFDN0MsT0FBTyxFQUFDLGNBQWMsRUFBQyxNQUFNLG9CQUFvQixDQUFDO0FBQ2xELE9BQU8sRUFBQywrQkFBK0IsRUFBQyxNQUFNLHNDQUFzQyxDQUFDO0FBRXJGOzs7O0dBSUc7QUFFSCxNQUFNLE9BQU8sU0FBVSxTQUFRLCtCQUErQjtJQUUxRDs7Ozs7OztPQU9HO0lBQ0gsWUFBWSxTQUFpQixFQUFFLElBQVksRUFBRSxRQUFnQjtRQUN6RCxLQUFLLEVBQUUsQ0FBQztRQUNSLElBQUksQ0FBQyxTQUFTLEdBQUcsRUFBRSxDQUFDO1FBQ3BCLElBQUksQ0FBQyxnQ0FBZ0MsR0FBRyxDQUFDLENBQUM7UUFDMUMsSUFBSSxDQUFDLHFCQUFxQixDQUFDLFNBQVMsRUFBRSxJQUFJLEVBQUUsUUFBUSxDQUFDLENBQUM7SUFDMUQsQ0FBQztJQUVPLHFCQUFxQixDQUFDLFNBQWlCLEVBQUUsSUFBWSxFQUFFLFFBQWdCO1FBQzNFLElBQUksQ0FBQyxZQUFZLENBQUMsU0FBUyxFQUFFLElBQUksRUFBRSxRQUFRLENBQUMsQ0FBQztRQUM3QyxNQUFNLFNBQVMsR0FBRyxJQUFJLENBQUMsZUFBZSxDQUFDLG9CQUFvQixDQUFDLE9BQU8sQ0FBQyxDQUFDO1FBQ3JFLElBQUksU0FBUyxDQUFDLE1BQU0sS0FBSyxDQUFDLEVBQUU7WUFDeEIsTUFBTSxJQUFJLEtBQUssQ0FBQyxNQUFNLENBQUMsdUVB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QUFNO1lBQ04sT0FBTyxJQUFJLENBQUM7U0FDWjtJQUNMLENBQUM7SUFFRDs7Ozs7Ozs7Ozs7OztPQWFHO0lBQ0ksNEJBQTRCLENBQUMsSUFBWSxFQUFFLFFBQWdCLEVBQUUsYUFBc0IsRUFBRSxXQUFvQjtRQUU1RyxNQUFNLGVBQWUsR0FBRyxJQUFJLFNBQVMsQ0FBQyxJQUFJLENBQUMsYUFBYSxFQUFFLEVBQUUsUUFBUSxFQUFFLElBQUksQ0FBQyxRQUFRLEVBQUUsQ0FBQyxDQUFDO1FBQ3ZGLGVBQWUsQ0FBQyw0QkFBNEIsQ0FBQyxJQUFJLENBQUMsYUFBYSxDQUFDLENBQUM7UUFDakUsZUFBZSxDQUFDLDJCQUEyQixDQUFDLElBQUksQ0FBQyxZQUFZLENBQUMsQ0FBQztRQUMvRCxlQUFlLENBQUMsaUJBQWlCLENBQUMsSUFBSSxDQUFDLENBQUM7UUFDeEMsZUFBZSxDQUFDLGdCQUFnQixDQUFDLENBQUMsU0FBcUIsRUFBRSxFQUFFO1lBQ2xDLFNBQVUsQ0FBQyxpQkFBaUIsQ0FBQyxhQUFhLEVBQUUsV0FBVyxDQUFDLENBQUM7UUFDbEYsQ0FBQyxDQUFDLENBQUM7UUFDSCxPQUFPLGVBQWUsQ0FBQztJQUMzQixDQUFDO0NBQ0oiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQge2Zvcm1hdH0gZnJvbSAndXRpbCc7XHJcbmltcG9ydCB7SVRyYW5zbGF0aW9uTWVzc2FnZXNGaWxlfSBmcm9tICcuLi9hcGkvaS10cmFuc2xhdGlvbi1tZXNzYWdlcy1maWxlJztcclxuaW1wb3J0IHtJVHJhbnNVbml0fSBmcm9tICcuLi9hcGkvaS10cmFucy11bml0JztcclxuaW1wb3J0IHtGT1JNQVRfWExJRkYxMiwgRklMRVRZUEVfWExJRkYxMn0gZnJvbSAnLi4vYXBpL2NvbnN0YW50cyc7XHJcbmltcG9ydCB7RE9NVXRpbGl0aWVzfSBmcm9tICcuL2RvbS11dGlsaXRpZXMnO1xyXG5pbXBvcnQge1hsaWZmVHJhbnNVbml0fSBmcm9tICcuL3hsaWZmLXRyYW5zLXVuaXQnO1xyXG5pbXBvcnQge0Fic3RyYWN0VHJhbnNsYXRpb25NZXNzYWdlc0ZpbGV9IGZyb20gJy4vYWJzdHJhY3QtdHJhbnNsYXRpb24tbWVzc2FnZXMtZmlsZSc7XHJcbmltcG9ydCB7QWJzdHJhY3RUcmFuc1VuaXR9IGZyb20gJy4vYWJzdHJhY3QtdHJhbnMtdW5pdCc7XHJcbi8qKlxyXG4gKiBDcmVhdGVkIGJ5IG1hcnRpbiBvbiAyMy4wMi4yMDE3LlxyXG4gKiBBYiB4bGlmZiBmaWxlIHJlYWQgZnJvbSBhIHNvdXJjZSBmaWxlLlxyXG4gKiBEZWZpbmVzIHNvbWUgcmVsZXZhbnQgZ2V0IGFuZCBzZXQgbWV0aG9kIGZvciByZWFkaW5nIGFuZCBtb2RpZnlpbmcgc3VjaCBhIGZpbGUuXHJcbiAqL1xyXG5cclxuZXhwb3J0IGNsYXNzIFhsaWZmRmlsZSBleHRlbmRzIEFic3RyYWN0VHJhbnNsYXRpb25NZXNzYWdlc0ZpbGUgaW1wbGVtZW50cyBJVHJhbnNsYXRpb25NZXNzYWdlc0ZpbGUge1xyXG5cclxuICAgIC8qKlxyXG4gICAgICogQ3JlYXRlIGFuIHhsZi1GaWxlIGZyb20gc291cmNlLlxyXG4gICAgICogQHBhcmFtIHhtbFN0cmluZyBzb3VyY2UgcmVhZCBmcm9tIGZpbGUuXHJcbiAgICAgKiBAcGFyYW0gcGF0aCBQYXRoIHRvIGZpbGVcclxuICAgICAqIEBwYXJhbSBlbmNvZGluZyBvcHRpb25hbCBlbmNvZGluZyBvZiB0aGUgeG1sLlxyXG4gICAgICogVGhpcyBpcyByZWFkIGZyb20gdGhlIGZpbGUsIGJ1dCBpZiB5b3Uga25vdyBpdCBiZWZvcmUsIHlvdSBjYW4gYXZvaWQgcmVhZGluZyB0aGUgZmlsZSB0d2ljZS5cclxuICAgICAqIEByZXR1cm4gWGxpZmZGaWxlXHJcbiAgICAgKi9cclxuICAgIGNvbnN0cnVjdG9yKHhtbFN0cmluZzogc3RyaW5nLCBwYXRoOiBzdHJpbmcsIGVuY29kaW5nOiBzdHJpbmcpIHtcclxuICAgICAgICBzdXBlcigpO1xyXG4gICAgICAgIHRoaXMuX3dhcm5pbmdzID0gW107XHJcbiAgICAgICAgdGhpcy5fbnVtYmVyT2ZUcmFuc1VuaXRzV2l0aE1pc3NpbmdJZCA9IDA7XHJcbiAgICAgICAgdGhpcy5pbml0aWFsaXplRnJvbUNvbnRlbnQoeG1sU3RyaW5nLCBwYXRoLCBlbmNvZGluZyk7XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSBpbml0aWFsaXplRnJvbUNvbnRlbnQoeG1sU3RyaW5nOiBzdHJpbmcsIHBhdGg6IHN0cmluZywgZW5jb2Rpbmc6IHN0cmluZyk6IFhsaWZmRmlsZSB7XHJcbiAgICAgICAgdGhpcy5wYXJzZUNvbnRlbnQoeG1sU3RyaW5nLCBwYXRoLCBlbmNvZGluZyk7XHJcbiAgICAgICAgY29uc3QgeGxpZmZMaXN0ID0gdGhpcy5fcGFyc2VkRG9jdW1lbnQuZ2V0RWxlbWVudHNCeVRhZ05hbWUoJ3hsaWZmJyk7XHJcbiAgICAgICAgaWYgKHhsaWZmTGlzdC5sZW5ndGggIT09IDEpIHtcclxuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKGZvcm1hdCgnRmlsZSBcIiVzXCIgc2VlbXMgdG8gYmUgbm8geGxpZmYgZmlsZSAoc2hvdWxkIGNvbnRhaW4gYW4geGxpZmYgZWxlbWVudCknLCBwYXRoKSk7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgY29uc3QgdmVyc2lvbiA9IHhsaWZmTGlzdC5pdGVtKDApLmdldEF0dHJpYnV0ZSgndmVyc2lvbicpO1xyXG4gICAgICAgICAgICBjb25zdCBleHBlY3RlZFZlcnNpb24gPSAnMS4yJztcclxuICAgICAgICAgICAgaWYgKHZlcnNpb24gIT09IGV4cGVjdGVkVmVyc2lvbikge1xyXG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKGZvcm1hdCgnRmlsZSBcIiVzXCIgc2VlbXMgdG8gYmUgbm8geGxpZmYgMS4yIGZpbGUsIHZlcnNpb24gc2hvdWxkIGJlICVzLCBmb3VuZCAlcycsXHJcbiAgICAgICAgICAgICAgICAgICAgcGF0aCwgZXhwZWN0ZWRWZXJzaW9uLCB2ZXJzaW9uKSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIHRoaXM7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBGaWxlIGZvcm1hdCBhcyBpdCBpcyB1c2VkIGluIGNvbmZpZyBmaWxlcy5cclxuICAgICAqIEN1cnJlbnRseSAneGxmJywgJ3htYicsICd4bWIyJ1xyXG4gICAgICogUmV0dXJucyBvbmUgb2YgdGhlIGNvbnN0YW50cyBGT1JNQVRfLi5cclxuICAgICAqL1xyXG4gICAgcHVibGljIGkxOG5Gb3JtYXQoKTogc3RyaW5nIHtcclxuICAgICAgICByZXR1cm4gRk9STUFUX1hMSUZGMTI7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBGaWxlIHR5cGUuXHJcbiAgICAgKiBIZXJlICdYTElGRiAxLjInXHJcbiAgICAgKi9cclxuICAgIHB1YmxpYyBmaWxlVHlwZSgpOiBzdHJpbmcge1xyXG4gICAgICAgIHJldHVybiBGSUxFVFlQRV9YTElGRjEyO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogcmV0dXJuIHRhZyBuYW1lcyBvZiBhbGwgZWxlbWVudHMgdGhhdCBoYXZlIG1peGVkIGNvbnRlbnQuXHJcbiAgICAgKiBUaGVzZSBlbGVtZW50cyB3aWxsIG5vdCBiZSBiZWF1dGlmaWVkLlxyXG4gICAgICogVHlwaWNhbCBjYW5kaWRhdGVzIGFyZSBzb3VyY2UgYW5kIHRhcmdldC5cclxuICAgICAqL1xyXG4gICAgcHJvdGVjdGVkIGVsZW1lbnRzV2l0aE1peGVkQ29udGVudCgpOiBzdHJpbmdbXSB7XHJcbiAgICAgICAgcmV0dXJuIFsnc291cmNlJywgJ3RhcmdldCcsICd0b29sJywgJ3NlZy1zb3VyY2UnLCAnZycsICdwaCcsICdicHQnLCAnZXB0JywgJ2l0JywgJ3N1YicsICdtcmsnXTtcclxuICAgIH1cclxuXHJcbiAgICBwcm90ZWN0ZWQgaW5pdGlhbGl6ZVRyYW5zVW5pdHMoKSB7XHJcbiAgICAgICAgdGhpcy50cmFuc1VuaXRzID0gW107XHJcbiAgICAgICAgY29uc3QgdHJhbnNVbml0c0luRmlsZSA9IHRoaXMuX3BhcnNlZERvY3VtZW50LmdldEVsZW1lbnRzQnlUYWdOYW1lKCd0cmFucy11bml0Jyk7XHJcbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCB0cmFuc1VuaXRzSW5GaWxlLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgICAgIGNvbnN0IHRyYW5zdW5pdCA9IHRyYW5zVW5pdHNJbkZpbGUuaXRlbShpKTtcclxuICAgICAgICAgICAgY29uc3QgaWQgPSB0cmFuc3VuaXQuZ2V0QXR0cmlidXRlKCdpZCcpO1xyXG4gICAgICAgICAgICBpZiAoIWlkKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLl93YXJuaW5ncy5wdXNoKGZvcm1hdCgnb29wcywgdHJhbnMtdW5pdCB3aXRob3V0IFwiaWRcIiBmb3VuZCBpbiBtYXN0ZXIsIHBsZWFzZSBjaGVjayBmaWxlICVzJywgdGhpcy5fZmlsZW5hbWUpKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB0aGlzLnRyYW5zVW5pdHMucHVzaChuZXcgWGxpZmZUcmFuc1VuaXQodHJhbnN1bml0LCBpZCwgdGhpcykpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIEdldCBzb3VyY2UgbGFuZ3VhZ2UuXHJcbiAgICAgKiBAcmV0dXJuIHNvdXJjZSBsYW5ndWFnZS5cclxuICAgICAqL1xyXG4gICAgcHVibGljIHNvdXJjZUxhbmd1YWdlKCk6IHN0cmluZyB7XHJcbiAgICAgICAgY29uc3QgZmlsZUVsZW0gPSBET01VdGlsaXRpZXMuZ2V0Rmlyc3RFbGVtZW50QnlUYWdOYW1lKHRoaXMuX3BhcnNlZERvY3VtZW50LCAnZmlsZScpO1xyXG4gICAgICAgIGlmIChmaWxlRWxlbSkge1xyXG4gICAgICAgICAgICByZXR1cm4gZmlsZUVsZW0uZ2V0QXR0cmlidXRlKCdzb3VyY2UtbGFuZ3VhZ2UnKTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICByZXR1cm4gbnVsbDtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBFZGl0IHRoZSBzb3VyY2UgbGFuZ3VhZ2UuXHJcbiAgICAgKiBAcGFyYW0gbGFuZ3VhZ2UgbGFuZ3VhZ2VcclxuICAgICAqL1xyXG4gICAgcHVibGljIHNldFNvdXJjZUxhbmd1YWdlKGxhbmd1YWdlOiBzdHJpbmcpIHtcclxuICAgICAgICBjb25zdCBmaWxlRWxlbSA9IERPTVV0aWxpdGllcy5nZXRGaXJzdEVsZW1lbnRCeVRhZ05hbWUodGhpcy5fcGFyc2VkRG9jdW1lbnQsICdmaWxlJyk7XHJcbiAgICAgICAgaWYgKGZpbGVFbGVtKSB7XHJcbiAgICAgICAgICAgIGZpbGVFbGVtLnNldEF0dHJpYnV0ZSgnc291cmNlLWxhbmd1YWdlJywgbGFuZ3VhZ2UpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIEdldCB0YXJnZXQgbGFuZ3VhZ2UuXHJcbiAgICAgKiBAcmV0dXJuIHRhcmdldCBsYW5ndWFnZS5cclxuICAgICAqL1xyXG4gICAgcHVibGljIHRhcmdldExhbmd1YWdlKCk6IHN0cmluZyB7XHJcbiAgICAgICAgY29uc3QgZmlsZUVsZW0gPSBET01VdGlsaXRpZXMuZ2V0Rmlyc3RFbGVtZW50QnlUYWdOYW1lKHRoaXMuX3BhcnNlZERvY3VtZW50LCAnZmlsZScpO1xyXG4gICAgICAgIGlmIChmaWxlRWxlbSkge1xyXG4gICAgICAgICAgICByZXR1cm4gZmlsZUVsZW0uZ2V0QXR0cmlidXRlKCd0YXJnZXQtbGFuZ3VhZ2UnKTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICByZXR1cm4gbnVsbDtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBFZGl0IHRoZSB0YXJnZXQgbGFuZ3VhZ2UuXHJcbiAgICAgKiBAcGFyYW0gbGFuZ3VhZ2UgbGFuZ3VhZ2VcclxuICAgICAqL1xyXG4gICAgcHVibGljIHNldFRhcmdldExhbmd1YWdlKGxhbmd1YWdlOiBzdHJpbmcpIHtcclxuICAgICAgICBjb25zdCBmaWxlRWxlbSA9IERPTVV0aWxpdGllcy5nZXRGaXJzdEVsZW1lbnRCeVRhZ05hbWUodGhpcy5fcGFyc2VkRG9jdW1lbnQsICdmaWxlJyk7XHJcbiAgICAgICAgaWYgKGZpbGVFbGVtKSB7XHJcbiAgICAgICAgICAgIGZpbGVFbGVtLnNldEF0dHJpYnV0ZSgndGFyZ2V0LWxhbmd1YWdlJywgbGFuZ3VhZ2UpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIEFkZCBhIG5ldyB0cmFucy11bml0IHRvIHRoaXMgZmlsZS5cclxuICAgICAqIFRoZSB0cmFucyB1bml0IHN0ZW1zIGZyb20gYW5vdGhlciBmaWxlLlxyXG4gICAgICogSXQgY29waWVzIHRoZSBzb3VyY2UgY29udGVudCBvZiB0aGUgdHUgdG8gdGhlIHRhcmdldCBjb250ZW50IHRvbyxcclxuICAgICAqIGRlcGVuZGluZyBvbiB0aGUgdmFsdWVzIG9mIGlzRGVmYXVsdExhbmcgYW5kIGNvcHlDb250ZW50LlxyXG4gICAgICogU28gdGhlIHNvdXJjZSBjYW4gYmUgdXNlZCBhcyBhIGR1bW15IHRyYW5zbGF0aW9uLlxyXG4gICAgICogKHVzZWQgYnkgeGxpZmZtZXJnZSlcclxuICAgICAqIEBwYXJhbSBmb3JlaWduVHJhbnNVbml0IHRoZSB0cmFucyB1bml0IHRvIGJlIGltcG9ydGVkLlxyXG4gICAgICogQHBhcmFtIGlzRGVmYXVsdExhbmcgRmxhZywgd2V0aGVyIGZpbGUgY29udGFpbnMgdGhlIGRlZmF1bHQgbGFuZ3VhZ2UuXHJcbiAgICAgKiBUaGVuIHNvdXJjZSBhbmQgdGFyZ2V0IGFyZSBqdXN0IGVxdWFsLlxyXG4gICAgICogVGhlIGNvbnRlbnQgd2lsbCBiZSBjb3BpZWQuXHJcbiAgICAgKiBTdGF0ZSB3aWxsIGJlIGZpbmFsLlxyXG4gICAgICogQHBhcmFtIGNvcHlDb250ZW50IEZsYWcsIHdldGhlciB0byBjb3B5IGNvbnRlbnQgb3IgbGVhdmUgaXQgZW1wdHkuXHJcbiAgICAgKiBXYmVuIHRydWUsIGNvbnRlbnQgd2lsbCBiZSBjb3BpZWQgZnJvbSBzb3VyY2UuXHJcbiAgICAgKiBXaGVuIGZhbHNlLCBjb250ZW50IHdpbGwgYmUgbGVmdCBlbXB0eSAoaWYgaXQgaXMgbm90IHRoZSBkZWZhdWx0IGxhbmd1YWdlKS5cclxuICAgICAqIEBwYXJhbSBpbXBvcnRBZnRlckVsZW1lbnQgb3B0aW9uYWwgKHNpbmNlIDEuMTApIG90aGVyIHRyYW5zdW5pdCAocGFydCBvZiB0aGlzIGZpbGUpLCB0aGF0IHNob3VsZCBiZSB1c2VkIGFzIGFuY2VzdG9yLlxyXG4gICAgICogTmV3bHkgaW1wb3J0ZWQgdHJhbnMgdW5pdCBpcyB0aGVuIGluc2VydGVkIGRpcmVjdGx5IGFmdGVyIHRoaXMgZWxlbWVudC5cclxuICAgICAqIElmIG5vdCBzZXQgb3Igbm90IHBhcnQgb2YgdGhpcyBmaWxlLCBuZXcgdW5pdCB3aWxsIGJlIGltcG9ydGVkIGF0IHRoZSBlbmQuXHJcbiAgICAgKiBJZiBleHBsaWNpdHkgc2V0IHRvIG51bGwsIG5ldyB1bml0IHdpbGwgYmUgaW1wb3J0ZWQgYXQgdGhlIHN0YXJ0LlxyXG4gICAgICogQHJldHVybiB0aGUgbmV3bHkgaW1wb3J0ZWQgdHJhbnMgdW5pdCAoc2luY2UgdmVyc2lvbiAxLjcuMClcclxuICAgICAqIEB0aHJvd3MgYW4gZXJyb3IgaWYgdHJhbnMtdW5pdCB3aXRoIHNhbWUgaWQgYWxyZWFkeSBpcyBpbiB0aGUgZmlsZS5cclxuICAgICAqL1xyXG4gICAgaW1wb3J0TmV3VHJhbnNVbml0KGZvcmVpZ25UcmFuc1VuaXQ6IElUcmFuc1VuaXQsIGlzRGVmYXVsdExhbmc6IGJvb2xlYW4sIGNvcHlDb250ZW50OiBib29sZWFuLCBpbXBvcnRBZnRlckVsZW1lbnQ/OiBJVHJhbnNVbml0KVxyXG4gICAgICAgIDogSVRyYW5zVW5pdCB7XHJcbiAgICAgICAgaWYgKHRoaXMudHJhbnNVbml0V2l0aElkKGZvcmVpZ25UcmFuc1VuaXQuaWQpKSB7XHJcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihmb3JtYXQoJ3R1IHdpdGggaWQgJXMgYWxyZWFkeSBleGlzdHMgaW4gZmlsZSwgY2Fubm90IGltcG9ydCBpdCcsIGZvcmVpZ25UcmFuc1VuaXQuaWQpKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgY29uc3QgbmV3VHUgPSAoPEFic3RyYWN0VHJhbnNVbml0PiBmb3JlaWduVHJhbnNVbml0KS5jbG9uZVdpdGhTb3VyY2VBc1RhcmdldChpc0RlZmF1bHRMYW5nLCBjb3B5Q29udGVudCwgdGhpcyk7XHJcbiAgICAgICAgY29uc3QgYm9keUVsZW1lbnQgPSBET01VdGlsaXRpZXMuZ2V0Rmlyc3RFbGVtZW50QnlUYWdOYW1lKHRoaXMuX3BhcnNlZERvY3VtZW50LCAnYm9keScpO1xyXG4gICAgICAgIGlmICghYm9keUVsZW1lbnQpIHtcclxuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKGZvcm1hdCgnRmlsZSBcIiVzXCIgc2VlbXMgdG8gYmUgbm8geGxpZmYgMS4yIGZpbGUgKHNob3VsZCBjb250YWluIGEgYm9keSBlbGVtZW50KScsIHRoaXMuX2ZpbGVuYW1lKSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGxldCBpbnNlcnRlZCA9IGZhbHNlO1xyXG4gICAgICAgIGxldCBpc0FmdGVyRWxlbWVudFBhcnRPZkZpbGUgPSBmYWxzZTtcclxuICAgICAgICBpZiAoISFpbXBvcnRBZnRlckVsZW1lbnQpIHtcclxuICAgICAgICAgICAgY29uc3QgaW5zZXJ0aW9uUG9pbnQgPSB0aGlzLnRyYW5zVW5pdFdpdGhJZChpbXBvcnRBZnRlckVsZW1lbnQuaWQpO1xyXG4gICAgICAgICAgICBpZiAoISFpbnNlcnRpb25Qb2ludCkge1xyXG4gICAgICAgICAgICAgICAgaXNBZnRlckVsZW1lbnRQYXJ0T2ZGaWxlID0gdHJ1ZTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAoaW1wb3J0QWZ0ZXJFbGVtZW50ID09PSB1bmRlZmluZWQgfHwgKGltcG9ydEFmdGVyRWxlbWVudCAmJiAhaXNBZnRlckVsZW1lbnRQYXJ0T2ZGaWxlKSkge1xyXG4gICAgICAgICAgICBib2R5RWxlbWVudC5hcHBlbmRDaGlsZChuZXdUdS5hc1htbEVsZW1lbnQoKSk7XHJcbiAgICAgICAgICAgIGluc2VydGVkID0gdHJ1ZTtcclxuICAgICAgICB9IGVsc2UgaWYgKGltcG9ydEFmdGVyRWxlbWVudCA9PT0gbnVsbCkge1xyXG4gICAgICAgICAgICBjb25zdCBmaXJzdFVuaXRFbGVtZW50ID0gRE9NVXRpbGl0aWVzLmdldEZpcnN0RWxlbWVudEJ5VGFnTmFtZSh0aGlzLl9wYXJzZWREb2N1bWVudCwgJ3RyYW5zLXVuaXQnKTtcclxuICAgICAgICAgICAgaWYgKGZpcnN0VW5pdEVsZW1lbnQpIHtcclxuICAgICAgICAgICAgICAgIERPTVV0aWxpdGllcy5pbnNlcnRCZWZvcmUobmV3VHUuYXNYbWxFbGVtZW50KCksIGZpcnN0VW5pdEVsZW1lbnQpO1xyXG4gICAgICAgICAgICAgICAgaW5zZXJ0ZWQgPSB0cnVlO1xyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgLy8gbm8gdHJhbnMtdW5pdCwgZW1wdHkgZmlsZSwgc28gYWRkIHRvIGJvZHlcclxuICAgICAgICAgICAgICAgIGJvZHlFbGVtZW50LmFwcGVuZENoaWxkKG5ld1R1LmFzWG1sRWxlbWVudCgpKTtcclxuICAgICAgICAgICAgICAgIGluc2VydGVkID0gdHJ1ZTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIGNvbnN0IHJlZlVuaXRFbGVtZW50ID0gRE9NVXRpbGl0aWVzLmdldEVsZW1lbnRCeVRhZ05hbWVBbmRJZCh0aGlzLl9wYXJzZWREb2N1bWVudCwgJ3RyYW5zLXVuaXQnLCBpbXBvcnRBZnRlckVsZW1lbnQuaWQpO1xyXG4gICAgICAgICAgICBpZiAocmVmVW5pdEVsZW1lbnQpIHtcclxuICAgICAgICAgICAgICAgIERPTVV0aWxpdGllcy5pbnNlcnRBZnRlcihuZXdUdS5hc1htbEVsZW1lbnQoKSwgcmVmVW5pdEVsZW1lbnQpO1xyXG4gICAgICAgICAgICAgICAgaW5zZXJ0ZWQgPSB0cnVlO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmIChpbnNlcnRlZCkge1xyXG4gICAgICAgICAgICB0aGlzLmxhenlJbml0aWFsaXplVHJhbnNVbml0cygpO1xyXG4gICAgICAgICAgICB0aGlzLnRyYW5zVW5pdHMucHVzaChuZXdUdSk7XHJcbiAgICAgICAgICAgIHRoaXMuY291bnROdW1iZXJzKCk7XHJcbiAgICAgICAgICAgIHJldHVybiBuZXdUdTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICByZXR1cm4gbnVsbDtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBDcmVhdGUgYSBuZXcgdHJhbnNsYXRpb24gZmlsZSBmb3IgdGhpcyBmaWxlIGZvciBhIGdpdmVuIGxhbmd1YWdlLlxyXG4gICAgICogTm9ybWFsbHksIHRoaXMgaXMganVzdCBhIGNvcHkgb2YgdGhlIG9yaWdpbmFsIG9uZS5cclxuICAgICAqIEJ1dCBmb3IgWE1CIHRoZSB0cmFuc2xhdGlvbiBmaWxlIGhhcyBmb3JtYXQgJ1hUQicuXHJcbiAgICAgKiBAcGFyYW0gbGFuZyBMYW5ndWFnZSBjb2RlXHJcbiAgICAgKiBAcGFyYW0gZmlsZW5hbWUgZXhwZWN0ZWQgZmlsZW5hbWUgdG8gc3RvcmUgZmlsZVxyXG4gICAgICogQHBhcmFtIGlzRGVmYXVsdExhbmcgRmxhZywgd2V0aGVyIGZpbGUgY29udGFpbnMgdGhlIGRlZmF1bHQgbGFuZ3VhZ2UuXHJcbiAgICAgKiBUaGVuIHNvdXJjZSBhbmQgdGFyZ2V0IGFyZSBqdXN0IGVxdWFsLlxyXG4gICAgICogVGhlIGNvbnRlbnQgd2lsbCBiZSBjb3BpZWQuXHJcbiAgICAgKiBTdGF0ZSB3aWxsIGJlIGZpbmFsLlxyXG4gICAgICogQHBhcmFtIGNvcHlDb250ZW50IEZsYWcsIHdldGhlciB0byBjb3B5IGNvbnRlbnQgb3IgbGVhdmUgaXQgZW1wdHkuXHJcbiAgICAgKiBXYmVuIHRydWUsIGNvbnRlbnQgd2lsbCBiZSBjb3BpZWQgZnJvbSBzb3VyY2UuXHJcbiAgICAgKiBXaGVuIGZhbHNlLCBjb250ZW50IHdpbGwgYmUgbGVmdCBlbXB0eSAoaWYgaXQgaXMgbm90IHRoZSBkZWZhdWx0IGxhbmd1YWdlKS5cclxuICAgICAqL1xyXG4gICAgcHVibGljIGNyZWF0ZVRyYW5zbGF0aW9uRmlsZUZvckxhbmcobGFuZzogc3RyaW5nLCBmaWxlbmFtZTogc3RyaW5nLCBpc0RlZmF1bHRMYW5nOiBib29sZWFuLCBjb3B5Q29udGVudDogYm9vbGVhbilcclxuICAgICAgICA6IElUcmFuc2xhdGlvbk1lc3NhZ2VzRmlsZSB7XHJcbiAgICAgICAgY29uc3QgdHJhbnNsYXRpb25GaWxlID0gbmV3IFhsaWZmRmlsZSh0aGlzLmVkaXRlZENvbnRlbnQoKSwgZmlsZW5hbWUsIHRoaXMuZW5jb2RpbmcoKSk7XHJcbiAgICAgICAgdHJhbnNsYXRpb25GaWxlLnNldE5ld1RyYW5zVW5pdFRhcmdldFByYWVmaXgodGhpcy50YXJnZXRQcmFlZml4KTtcclxuICAgICAgICB0cmFuc2xhdGlvbkZpbGUuc2V0TmV3VHJhbnNVbml0VGFyZ2V0U3VmZml4KHRoaXMudGFyZ2V0U3VmZml4KTtcclxuICAgICAgICB0cmFuc2xhdGlvbkZpbGUuc2V0VGFyZ2V0TGFuZ3VhZ2UobGFuZyk7XHJcbiAgICAgICAgdHJhbnNsYXRpb25GaWxlLmZvckVhY2hUcmFuc1VuaXQoKHRyYW5zVW5pdDogSVRyYW5zVW5pdCkgPT4ge1xyXG4gICAgICAgICAgICAoPEFic3RyYWN0VHJhbnNVbml0PiB0cmFuc1VuaXQpLnVzZVNvdXJjZUFzVGFyZ2V0KGlzRGVmYXVsdExhbmcsIGNvcHlDb250ZW50KTtcclxuICAgICAgICB9KTtcclxuICAgICAgICByZXR1cm4gdHJhbnNsYXRpb25GaWxlO1xyXG4gICAgfVxyXG59XHJcbiJdfQ==