import { format } from 'util';
import { FORMAT_XLIFF20, FILETYPE_XLIFF20 } from '../api/constants';
import { DOMUtilities } from './dom-utilities';
import { Xliff2TransUnit } from './xliff2-trans-unit';
import { AbstractTranslationMessagesFile } from './abstract-translation-messages-file';
/**
 * Created by martin on 04.05.2017.
 * An XLIFF 2.0 file read from a source file.
 * Format definition is: http://docs.oasis-open.org/xliff/xliff-core/v2.0/os/xliff-core-v2.0-os.html
 *
 * Defines some relevant get and set method for reading and modifying such a file.
 */
export class Xliff2File extends AbstractTranslationMessagesFile {
    /**
     * Create an XLIFF 2.0-File from source.
     * @param xmlString source read from file.
     * @param path Path to file
     * @param encoding optional encoding of the xml.
     * This is read from the file, but if you know it before, you can avoid reading the file twice.
     * @return xliff file
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
            const expectedVersion = '2.0';
            if (version !== expectedVersion) {
                throw new Error(format('File "%s" seems to be no xliff 2 file, version should be %s, found %s', path, expectedVersion, version));
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
        return FORMAT_XLIFF20;
    }
    /**
     * File type.
     * Here 'XLIFF 2.0'
     */
    fileType() {
        return FILETYPE_XLIFF20;
    }
    /**
     * return tag names of all elements that have mixed content.
     * These elements will not be beautified.
     * Typical candidates are source and target.
     */
    elementsWithMixedContent() {
        return ['skeleton', 'note', 'data', 'source', 'target', 'pc', 'mrk'];
    }
    initializeTransUnits() {
        this.transUnits = [];
        const transUnitsInFile = this._parsedDocument.getElementsByTagName('unit');
        for (let i = 0; i < transUnitsInFile.length; i++) {
            const transunit = transUnitsInFile.item(i);
            const id = transunit.getAttribute('id');
            if (!id) {
                this._warnings.push(format('oops, trans-unit without "id" found in master, please check file %s', this._filename));
            }
            this.transUnits.push(new Xliff2TransUnit(transunit, id, this));
        }
    }
    /**
     * Get source language.
     * @return source language.
     */
    sourceLanguage() {
        const xliffElem = DOMUtilities.getFirstElementByTagName(this._parsedDocument, 'xliff');
        if (xliffElem) {
            return xliffElem.getAttribute('srcLang');
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
        const xliffElem = DOMUtilities.getFirstElementByTagName(this._parsedDocument, 'xliff');
        if (xliffElem) {
            xliffElem.setAttribute('srcLang', language);
        }
    }
    /**
     * Get target language.
     * @return target language.
     */
    targetLanguage() {
        const xliffElem = DOMUtilities.getFirstElementByTagName(this._parsedDocument, 'xliff');
        if (xliffElem) {
            return xliffElem.getAttribute('trgLang');
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
        const xliffElem = DOMUtilities.getFirstElementByTagName(this._parsedDocument, 'xliff');
        if (xliffElem) {
            xliffElem.setAttribute('trgLang', language);
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
        const fileElement = DOMUtilities.getFirstElementByTagName(this._parsedDocument, 'file');
        if (!fileElement) {
            throw new Error(format('File "%s" seems to be no xliff 2.0 file (should contain a file element)', this._filename));
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
            fileElement.appendChild(newTu.asXmlElement());
            inserted = true;
        }
        else if (importAfterElement === null) {
            const firstUnitElement = DOMUtilities.getFirstElementByTagName(this._parsedDocument, 'unit');
            if (firstUnitElement) {
                DOMUtilities.insertBefore(newTu.asXmlElement(), firstUnitElement);
                inserted = true;
            }
            else {
                // no trans-unit, empty file, so add to first file element
                fileElement.appendChild(newTu.asXmlElement());
                inserted = true;
            }
        }
        else {
            const refUnitElement = DOMUtilities.getElementByTagNameAndId(this._parsedDocument, 'unit', importAfterElement.id);
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
        const translationFile = new Xliff2File(this.editedContent(), filename, this.encoding());
        translationFile.setNewTransUnitTargetPraefix(this.targetPraefix);
        translationFile.setNewTransUnitTargetSuffix(this.targetSuffix);
        translationFile.setTargetLanguage(lang);
        translationFile.forEachTransUnit((transUnit) => {
            transUnit.useSourceAsTarget(isDefaultLang, copyContent);
        });
        return translationFile;
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoieGxpZmYyLWZpbGUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi9wcm9qZWN0cy9uZ3gtaTE4bnN1cHBvcnQtbGliL3NyYy9pbXBsL3hsaWZmMi1maWxlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sRUFBQyxNQUFNLEVBQUMsTUFBTSxNQUFNLENBQUM7QUFHNUIsT0FBTyxFQUFDLGNBQWMsRUFBRSxnQkFBZ0IsRUFBQyxNQUFNLGtCQUFrQixDQUFDO0FBQ2xFLE9BQU8sRUFBQyxZQUFZLEVBQUMsTUFBTSxpQkFBaUIsQ0FBQztBQUM3QyxPQUFPLEVBQUMsZUFBZSxFQUFDLE1BQU0scUJBQXFCLENBQUM7QUFDcEQsT0FBTyxFQUFDLCtCQUErQixFQUFDLE1BQU0sc0NBQXNDLENBQUM7QUFFckY7Ozs7OztHQU1HO0FBRUgsTUFBTSxPQUFPLFVBQVcsU0FBUSwrQkFBK0I7SUFFM0Q7Ozs7Ozs7T0FPRztJQUNILFlBQVksU0FBaUIsRUFBRSxJQUFZLEVBQUUsUUFBZ0I7UUFDekQsS0FBSyxFQUFFLENBQUM7UUFDUixJQUFJLENBQUMsU0FBUyxHQUFHLEVBQUUsQ0FBQztRQUNwQixJQUFJLENBQUMsZ0NBQWdDLEdBQUcsQ0FBQyxDQUFDO1FBQzFDLElBQUksQ0FBQyxxQkFBcUIsQ0FBQyxTQUFTLEVBQUUsSUFBSSxFQUFFLFFBQVEsQ0FBQyxDQUFDO0lBQzFELENBQUM7SUFFTyxxQkFBcUIsQ0FBQyxTQUFpQixFQUFFLElBQVksRUFBRSxRQUFnQjtRQUMzRSxJQUFJLENBQUMsWUFBWSxDQUFDLFNBQVMsRUFBRSxJQUFJLEVBQUUsUUFBUSxDQUFDLENBQUM7UUFDN0MsTUFBTSxTQUFTLEdBQUcsSUFBSSxDQUFDLGVBQWUsQ0FBQyxvQkFBb0IsQ0FBQyxPQUFPLENBQUMsQ0FBQztRQUNyRSxJQUFJLFNBQVMsQ0FBQyxNQUFNLEtBQUssQ0FBQyxFQUFFO1lBQ3hCLE1BQU0sSUFBSSxLQUFLLENBQUMsTUFBTSxDQUFD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Ozs7Ozs7Ozs7Ozs7T0FhRztJQUNJLDRCQUE0QixDQUFDLElBQVksRUFBRSxRQUFnQixFQUFFLGFBQXNCLEVBQUUsV0FBb0I7UUFFNUcsTUFBTSxlQUFlLEdBQUcsSUFBSSxVQUFVLENBQUMsSUFBSSxDQUFDLGFBQWEsRUFBRSxFQUFFLFFBQVEsRUFBRSxJQUFJLENBQUMsUUFBUSxFQUFFLENBQUMsQ0FBQztRQUN4RixlQUFlLENBQUMsNEJBQTRCLENBQUMsSUFBSSxDQUFDLGFBQWEsQ0FBQyxDQUFDO1FBQ2pFLGVBQWUsQ0FBQywyQkFBMkIsQ0FBQyxJQUFJLENBQUMsWUFBWSxDQUFDLENBQUM7UUFDL0QsZUFBZSxDQUFDLGlCQUFpQixDQUFDLElBQUksQ0FBQyxDQUFDO1FBQ3hDLGVBQWUsQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDLFNBQXFCLEVBQUUsRUFBRTtZQUNsQyxTQUFVLENBQUMsaUJBQWlCLENBQUMsYUFBYSxFQUFFLFdBQVcsQ0FBQyxDQUFDO1FBQ2xGLENBQUMsQ0FBQyxDQUFDO1FBQ0gsT0FBTyxlQUFlLENBQUM7SUFDM0IsQ0FBQztDQUNKIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHtmb3JtYXR9IGZyb20gJ3V0aWwnO1xyXG5pbXBvcnQge0lUcmFuc2xhdGlvbk1lc3NhZ2VzRmlsZX0gZnJvbSAnLi4vYXBpL2ktdHJhbnNsYXRpb24tbWVzc2FnZXMtZmlsZSc7XHJcbmltcG9ydCB7SVRyYW5zVW5pdH0gZnJvbSAnLi4vYXBpL2ktdHJhbnMtdW5pdCc7XHJcbmltcG9ydCB7Rk9STUFUX1hMSUZGMjAsIEZJTEVUWVBFX1hMSUZGMjB9IGZyb20gJy4uL2FwaS9jb25zdGFudHMnO1xyXG5pbXBvcnQge0RPTVV0aWxpdGllc30gZnJvbSAnLi9kb20tdXRpbGl0aWVzJztcclxuaW1wb3J0IHtYbGlmZjJUcmFuc1VuaXR9IGZyb20gJy4veGxpZmYyLXRyYW5zLXVuaXQnO1xyXG5pbXBvcnQge0Fic3RyYWN0VHJhbnNsYXRpb25NZXNzYWdlc0ZpbGV9IGZyb20gJy4vYWJzdHJhY3QtdHJhbnNsYXRpb24tbWVzc2FnZXMtZmlsZSc7XHJcbmltcG9ydCB7QWJzdHJhY3RUcmFuc1VuaXR9IGZyb20gJy4vYWJzdHJhY3QtdHJhbnMtdW5pdCc7XHJcbi8qKlxyXG4gKiBDcmVhdGVkIGJ5IG1hcnRpbiBvbiAwNC4wNS4yMDE3LlxyXG4gKiBBbiBYTElGRiAyLjAgZmlsZSByZWFkIGZyb20gYSBzb3VyY2UgZmlsZS5cclxuICogRm9ybWF0IGRlZmluaXRpb24gaXM6IGh0dHA6Ly9kb2NzLm9hc2lzLW9wZW4ub3JnL3hsaWZmL3hsaWZmLWNvcmUvdjIuMC9vcy94bGlmZi1jb3JlLXYyLjAtb3MuaHRtbFxyXG4gKlxyXG4gKiBEZWZpbmVzIHNvbWUgcmVsZXZhbnQgZ2V0IGFuZCBzZXQgbWV0aG9kIGZvciByZWFkaW5nIGFuZCBtb2RpZnlpbmcgc3VjaCBhIGZpbGUuXHJcbiAqL1xyXG5cclxuZXhwb3J0IGNsYXNzIFhsaWZmMkZpbGUgZXh0ZW5kcyBBYnN0cmFjdFRyYW5zbGF0aW9uTWVzc2FnZXNGaWxlIGltcGxlbWVudHMgSVRyYW5zbGF0aW9uTWVzc2FnZXNGaWxlIHtcclxuXHJcbiAgICAvKipcclxuICAgICAqIENyZWF0ZSBhbiBYTElGRiAyLjAtRmlsZSBmcm9tIHNvdXJjZS5cclxuICAgICAqIEBwYXJhbSB4bWxTdHJpbmcgc291cmNlIHJlYWQgZnJvbSBmaWxlLlxyXG4gICAgICogQHBhcmFtIHBhdGggUGF0aCB0byBmaWxlXHJcbiAgICAgKiBAcGFyYW0gZW5jb2Rpbmcgb3B0aW9uYWwgZW5jb2Rpbmcgb2YgdGhlIHhtbC5cclxuICAgICAqIFRoaXMgaXMgcmVhZCBmcm9tIHRoZSBmaWxlLCBidXQgaWYgeW91IGtub3cgaXQgYmVmb3JlLCB5b3UgY2FuIGF2b2lkIHJlYWRpbmcgdGhlIGZpbGUgdHdpY2UuXHJcbiAgICAgKiBAcmV0dXJuIHhsaWZmIGZpbGVcclxuICAgICAqL1xyXG4gICAgY29uc3RydWN0b3IoeG1sU3RyaW5nOiBzdHJpbmcsIHBhdGg6IHN0cmluZywgZW5jb2Rpbmc6IHN0cmluZykge1xyXG4gICAgICAgIHN1cGVyKCk7XHJcbiAgICAgICAgdGhpcy5fd2FybmluZ3MgPSBbXTtcclxuICAgICAgICB0aGlzLl9udW1iZXJPZlRyYW5zVW5pdHNXaXRoTWlzc2luZ0lkID0gMDtcclxuICAgICAgICB0aGlzLmluaXRpYWxpemVGcm9tQ29udGVudCh4bWxTdHJpbmcsIHBhdGgsIGVuY29kaW5nKTtcclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIGluaXRpYWxpemVGcm9tQ29udGVudCh4bWxTdHJpbmc6IHN0cmluZywgcGF0aDogc3RyaW5nLCBlbmNvZGluZzogc3RyaW5nKTogWGxpZmYyRmlsZSB7XHJcbiAgICAgICAgdGhpcy5wYXJzZUNvbnRlbnQoeG1sU3RyaW5nLCBwYXRoLCBlbmNvZGluZyk7XHJcbiAgICAgICAgY29uc3QgeGxpZmZMaXN0ID0gdGhpcy5fcGFyc2VkRG9jdW1lbnQuZ2V0RWxlbWVudHNCeVRhZ05hbWUoJ3hsaWZmJyk7XHJcbiAgICAgICAgaWYgKHhsaWZmTGlzdC5sZW5ndGggIT09IDEpIHtcclxuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKGZvcm1hdCgnRmlsZSBcIiVzXCIgc2VlbXMgdG8gYmUgbm8geGxpZmYgZmlsZSAoc2hvdWxkIGNvbnRhaW4gYW4geGxpZmYgZWxlbWVudCknLCBwYXRoKSk7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgY29uc3QgdmVyc2lvbiA9IHhsaWZmTGlzdC5pdGVtKDApLmdldEF0dHJpYnV0ZSgndmVyc2lvbicpO1xyXG4gICAgICAgICAgICBjb25zdCBleHBlY3RlZFZlcnNpb24gPSAnMi4wJztcclxuICAgICAgICAgICAgaWYgKHZlcnNpb24gIT09IGV4cGVjdGVkVmVyc2lvbikge1xyXG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKGZvcm1hdCgnRmlsZSBcIiVzXCIgc2VlbXMgdG8gYmUgbm8geGxpZmYgMiBmaWxlLCB2ZXJzaW9uIHNob3VsZCBiZSAlcywgZm91bmQgJXMnLFxyXG4gICAgICAgICAgICAgICAgICAgIHBhdGgsIGV4cGVjdGVkVmVyc2lvbiwgdmVyc2lvbikpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiB0aGlzO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogRmlsZSBmb3JtYXQgYXMgaXQgaXMgdXNlZCBpbiBjb25maWcgZmlsZXMuXHJcbiAgICAgKiBDdXJyZW50bHkgJ3hsZicsICd4bWInLCAneG1iMidcclxuICAgICAqIFJldHVybnMgb25lIG9mIHRoZSBjb25zdGFudHMgRk9STUFUXy4uXHJcbiAgICAgKi9cclxuICAgIHB1YmxpYyBpMThuRm9ybWF0KCk6IHN0cmluZyB7XHJcbiAgICAgICAgcmV0dXJuIEZPUk1BVF9YTElGRjIwO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogRmlsZSB0eXBlLlxyXG4gICAgICogSGVyZSAnWExJRkYgMi4wJ1xyXG4gICAgICovXHJcbiAgICBwdWJsaWMgZmlsZVR5cGUoKTogc3RyaW5nIHtcclxuICAgICAgICByZXR1cm4gRklMRVRZUEVfWExJRkYyMDtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIHJldHVybiB0YWcgbmFtZXMgb2YgYWxsIGVsZW1lbnRzIHRoYXQgaGF2ZSBtaXhlZCBjb250ZW50LlxyXG4gICAgICogVGhlc2UgZWxlbWVudHMgd2lsbCBub3QgYmUgYmVhdXRpZmllZC5cclxuICAgICAqIFR5cGljYWwgY2FuZGlkYXRlcyBhcmUgc291cmNlIGFuZCB0YXJnZXQuXHJcbiAgICAgKi9cclxuICAgIHByb3RlY3RlZCBlbGVtZW50c1dpdGhNaXhlZENvbnRlbnQoKTogc3RyaW5nW10ge1xyXG4gICAgICAgIHJldHVybiBbJ3NrZWxldG9uJywgJ25vdGUnLCAnZGF0YScsICdzb3VyY2UnLCAndGFyZ2V0JywgJ3BjJywgJ21yayddO1xyXG4gICAgfVxyXG5cclxuICAgIHByb3RlY3RlZCBpbml0aWFsaXplVHJhbnNVbml0cygpIHtcclxuICAgICAgICB0aGlzLnRyYW5zVW5pdHMgPSBbXTtcclxuICAgICAgICBjb25zdCB0cmFuc1VuaXRzSW5GaWxlID0gdGhpcy5fcGFyc2VkRG9jdW1lbnQuZ2V0RWxlbWVudHNCeVRhZ05hbWUoJ3VuaXQnKTtcclxuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IHRyYW5zVW5pdHNJbkZpbGUubGVuZ3RoOyBpKyspIHtcclxuICAgICAgICAgICAgY29uc3QgdHJhbnN1bml0ID0gdHJhbnNVbml0c0luRmlsZS5pdGVtKGkpO1xyXG4gICAgICAgICAgICBjb25zdCBpZCA9IHRyYW5zdW5pdC5nZXRBdHRyaWJ1dGUoJ2lkJyk7XHJcbiAgICAgICAgICAgIGlmICghaWQpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuX3dhcm5pbmdzLnB1c2goZm9ybWF0KCdvb3BzLCB0cmFucy11bml0IHdpdGhvdXQgXCJpZFwiIGZvdW5kIGluIG1hc3RlciwgcGxlYXNlIGNoZWNrIGZpbGUgJXMnLCB0aGlzLl9maWxlbmFtZSkpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHRoaXMudHJhbnNVbml0cy5wdXNoKG5ldyBYbGlmZjJUcmFuc1VuaXQodHJhbnN1bml0LCBpZCwgdGhpcykpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIEdldCBzb3VyY2UgbGFuZ3VhZ2UuXHJcbiAgICAgKiBAcmV0dXJuIHNvdXJjZSBsYW5ndWFnZS5cclxuICAgICAqL1xyXG4gICAgcHVibGljIHNvdXJjZUxhbmd1YWdlKCk6IHN0cmluZyB7XHJcbiAgICAgICAgY29uc3QgeGxpZmZFbGVtID0gRE9NVXRpbGl0aWVzLmdldEZpcnN0RWxlbWVudEJ5VGFnTmFtZSh0aGlzLl9wYXJzZWREb2N1bWVudCwgJ3hsaWZmJyk7XHJcbiAgICAgICAgaWYgKHhsaWZmRWxlbSkge1xyXG4gICAgICAgICAgICByZXR1cm4geGxpZmZFbGVtLmdldEF0dHJpYnV0ZSgnc3JjTGFuZycpO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIHJldHVybiBudWxsO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIEVkaXQgdGhlIHNvdXJjZSBsYW5ndWFnZS5cclxuICAgICAqIEBwYXJhbSBsYW5ndWFnZSBsYW5ndWFnZVxyXG4gICAgICovXHJcbiAgICBwdWJsaWMgc2V0U291cmNlTGFuZ3VhZ2UobGFuZ3VhZ2U6IHN0cmluZykge1xyXG4gICAgICAgIGNvbnN0IHhsaWZmRWxlbSA9IERPTVV0aWxpdGllcy5nZXRGaXJzdEVsZW1lbnRCeVRhZ05hbWUodGhpcy5fcGFyc2VkRG9jdW1lbnQsICd4bGlmZicpO1xyXG4gICAgICAgIGlmICh4bGlmZkVsZW0pIHtcclxuICAgICAgICAgICAgeGxpZmZFbGVtLnNldEF0dHJpYnV0ZSgnc3JjTGFuZycsIGxhbmd1YWdlKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBHZXQgdGFyZ2V0IGxhbmd1YWdlLlxyXG4gICAgICogQHJldHVybiB0YXJnZXQgbGFuZ3VhZ2UuXHJcbiAgICAgKi9cclxuICAgIHB1YmxpYyB0YXJnZXRMYW5ndWFnZSgpOiBzdHJpbmcge1xyXG4gICAgICAgIGNvbnN0IHhsaWZmRWxlbSA9IERPTVV0aWxpdGllcy5nZXRGaXJzdEVsZW1lbnRCeVRhZ05hbWUodGhpcy5fcGFyc2VkRG9jdW1lbnQsICd4bGlmZicpO1xyXG4gICAgICAgIGlmICh4bGlmZkVsZW0pIHtcclxuICAgICAgICAgICAgcmV0dXJuIHhsaWZmRWxlbS5nZXRBdHRyaWJ1dGUoJ3RyZ0xhbmcnKTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICByZXR1cm4gbnVsbDtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBFZGl0IHRoZSB0YXJnZXQgbGFuZ3VhZ2UuXHJcbiAgICAgKiBAcGFyYW0gbGFuZ3VhZ2UgbGFuZ3VhZ2VcclxuICAgICAqL1xyXG4gICAgcHVibGljIHNldFRhcmdldExhbmd1YWdlKGxhbmd1YWdlOiBzdHJpbmcpIHtcclxuICAgICAgICBjb25zdCB4bGlmZkVsZW0gPSBET01VdGlsaXRpZXMuZ2V0Rmlyc3RFbGVtZW50QnlUYWdOYW1lKHRoaXMuX3BhcnNlZERvY3VtZW50LCAneGxpZmYnKTtcclxuICAgICAgICBpZiAoeGxpZmZFbGVtKSB7XHJcbiAgICAgICAgICAgIHhsaWZmRWxlbS5zZXRBdHRyaWJ1dGUoJ3RyZ0xhbmcnLCBsYW5ndWFnZSk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogQWRkIGEgbmV3IHRyYW5zLXVuaXQgdG8gdGhpcyBmaWxlLlxyXG4gICAgICogVGhlIHRyYW5zIHVuaXQgc3RlbXMgZnJvbSBhbm90aGVyIGZpbGUuXHJcbiAgICAgKiBJdCBjb3BpZXMgdGhlIHNvdXJjZSBjb250ZW50IG9mIHRoZSB0dSB0byB0aGUgdGFyZ2V0IGNvbnRlbnQgdG9vLFxyXG4gICAgICogZGVwZW5kaW5nIG9uIHRoZSB2YWx1ZXMgb2YgaXNEZWZhdWx0TGFuZyBhbmQgY29weUNvbnRlbnQuXHJcbiAgICAgKiBTbyB0aGUgc291cmNlIGNhbiBiZSB1c2VkIGFzIGEgZHVtbXkgdHJhbnNsYXRpb24uXHJcbiAgICAgKiAodXNlZCBieSB4bGlmZm1lcmdlKVxyXG4gICAgICogQHBhcmFtIGZvcmVpZ25UcmFuc1VuaXQgdGhlIHRyYW5zIHVuaXQgdG8gYmUgaW1wb3J0ZWQuXHJcbiAgICAgKiBAcGFyYW0gaXNEZWZhdWx0TGFuZyBGbGFnLCB3ZXRoZXIgZmlsZSBjb250YWlucyB0aGUgZGVmYXVsdCBsYW5ndWFnZS5cclxuICAgICAqIFRoZW4gc291cmNlIGFuZCB0YXJnZXQgYXJlIGp1c3QgZXF1YWwuXHJcbiAgICAgKiBUaGUgY29udGVudCB3aWxsIGJlIGNvcGllZC5cclxuICAgICAqIFN0YXRlIHdpbGwgYmUgZmluYWwuXHJcbiAgICAgKiBAcGFyYW0gY29weUNvbnRlbnQgRmxhZywgd2V0aGVyIHRvIGNvcHkgY29udGVudCBvciBsZWF2ZSBpdCBlbXB0eS5cclxuICAgICAqIFdiZW4gdHJ1ZSwgY29udGVudCB3aWxsIGJlIGNvcGllZCBmcm9tIHNvdXJjZS5cclxuICAgICAqIFdoZW4gZmFsc2UsIGNvbnRlbnQgd2lsbCBiZSBsZWZ0IGVtcHR5IChpZiBpdCBpcyBub3QgdGhlIGRlZmF1bHQgbGFuZ3VhZ2UpLlxyXG4gICAgICogQHBhcmFtIGltcG9ydEFmdGVyRWxlbWVudCBvcHRpb25hbCAoc2luY2UgMS4xMCkgb3RoZXIgdHJhbnN1bml0IChwYXJ0IG9mIHRoaXMgZmlsZSksIHRoYXQgc2hvdWxkIGJlIHVzZWQgYXMgYW5jZXN0b3IuXHJcbiAgICAgKiBOZXdseSBpbXBvcnRlZCB0cmFucyB1bml0IGlzIHRoZW4gaW5zZXJ0ZWQgZGlyZWN0bHkgYWZ0ZXIgdGhpcyBlbGVtZW50LlxyXG4gICAgICogSWYgbm90IHNldCBvciBub3QgcGFydCBvZiB0aGlzIGZpbGUsIG5ldyB1bml0IHdpbGwgYmUgaW1wb3J0ZWQgYXQgdGhlIGVuZC5cclxuICAgICAqIElmIGV4cGxpY2l0eSBzZXQgdG8gbnVsbCwgbmV3IHVuaXQgd2lsbCBiZSBpbXBvcnRlZCBhdCB0aGUgc3RhcnQuXHJcbiAgICAgKiBAcmV0dXJuIHRoZSBuZXdseSBpbXBvcnRlZCB0cmFucyB1bml0IChzaW5jZSB2ZXJzaW9uIDEuNy4wKVxyXG4gICAgICogQHRocm93cyBhbiBlcnJvciBpZiB0cmFucy11bml0IHdpdGggc2FtZSBpZCBhbHJlYWR5IGlzIGluIHRoZSBmaWxlLlxyXG4gICAgICovXHJcbiAgICBpbXBvcnROZXdUcmFuc1VuaXQoZm9yZWlnblRyYW5zVW5pdDogSVRyYW5zVW5pdCwgaXNEZWZhdWx0TGFuZzogYm9vbGVhbiwgY29weUNvbnRlbnQ6IGJvb2xlYW4sIGltcG9ydEFmdGVyRWxlbWVudD86IElUcmFuc1VuaXQpXHJcbiAgICAgICAgOiBJVHJhbnNVbml0IHtcclxuICAgICAgICBpZiAodGhpcy50cmFuc1VuaXRXaXRoSWQoZm9yZWlnblRyYW5zVW5pdC5pZCkpIHtcclxuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKGZvcm1hdCgndHUgd2l0aCBpZCAlcyBhbHJlYWR5IGV4aXN0cyBpbiBmaWxlLCBjYW5ub3QgaW1wb3J0IGl0JywgZm9yZWlnblRyYW5zVW5pdC5pZCkpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBjb25zdCBuZXdUdSA9ICg8QWJzdHJhY3RUcmFuc1VuaXQ+IGZvcmVpZ25UcmFuc1VuaXQpLmNsb25lV2l0aFNvdXJjZUFzVGFyZ2V0KGlzRGVmYXVsdExhbmcsIGNvcHlDb250ZW50LCB0aGlzKTtcclxuICAgICAgICBjb25zdCBmaWxlRWxlbWVudCA9IERPTVV0aWxpdGllcy5nZXRGaXJzdEVsZW1lbnRCeVRhZ05hbWUodGhpcy5fcGFyc2VkRG9jdW1lbnQsICdmaWxlJyk7XHJcbiAgICAgICAgaWYgKCFmaWxlRWxlbWVudCkge1xyXG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoZm9ybWF0KCdGaWxlIFwiJXNcIiBzZWVtcyB0byBiZSBubyB4bGlmZiAyLjAgZmlsZSAoc2hvdWxkIGNvbnRhaW4gYSBmaWxlIGVsZW1lbnQpJywgdGhpcy5fZmlsZW5hbWUpKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgbGV0IGluc2VydGVkID0gZmFsc2U7XHJcbiAgICAgICAgbGV0IGlzQWZ0ZXJFbGVtZW50UGFydE9mRmlsZSA9IGZhbHNlO1xyXG4gICAgICAgIGlmICghIWltcG9ydEFmdGVyRWxlbWVudCkge1xyXG4gICAgICAgICAgICBjb25zdCBpbnNlcnRpb25Qb2ludCA9IHRoaXMudHJhbnNVbml0V2l0aElkKGltcG9ydEFmdGVyRWxlbWVudC5pZCk7XHJcbiAgICAgICAgICAgIGlmICghIWluc2VydGlvblBvaW50KSB7XHJcbiAgICAgICAgICAgICAgICBpc0FmdGVyRWxlbWVudFBhcnRPZkZpbGUgPSB0cnVlO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmIChpbXBvcnRBZnRlckVsZW1lbnQgPT09IHVuZGVmaW5lZCB8fCAoaW1wb3J0QWZ0ZXJFbGVtZW50ICYmICFpc0FmdGVyRWxlbWVudFBhcnRPZkZpbGUpKSB7XHJcbiAgICAgICAgICAgIGZpbGVFbGVtZW50LmFwcGVuZENoaWxkKG5ld1R1LmFzWG1sRWxlbWVudCgpKTtcclxuICAgICAgICAgICAgaW5zZXJ0ZWQgPSB0cnVlO1xyXG4gICAgICAgIH0gZWxzZSBpZiAoaW1wb3J0QWZ0ZXJFbGVtZW50ID09PSBudWxsKSB7XHJcbiAgICAgICAgICAgIGNvbnN0IGZpcnN0VW5pdEVsZW1lbnQgPSBET01VdGlsaXRpZXMuZ2V0Rmlyc3RFbGVtZW50QnlUYWdOYW1lKHRoaXMuX3BhcnNlZERvY3VtZW50LCAndW5pdCcpO1xyXG4gICAgICAgICAgICBpZiAoZmlyc3RVbml0RWxlbWVudCkge1xyXG4gICAgICAgICAgICAgICAgRE9NVXRpbGl0aWVzLmluc2VydEJlZm9yZShuZXdUdS5hc1htbEVsZW1lbnQoKSwgZmlyc3RVbml0RWxlbWVudCk7XHJcbiAgICAgICAgICAgICAgICBpbnNlcnRlZCA9IHRydWU7XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAvLyBubyB0cmFucy11bml0LCBlbXB0eSBmaWxlLCBzbyBhZGQgdG8gZmlyc3QgZmlsZSBlbGVtZW50XHJcbiAgICAgICAgICAgICAgICBmaWxlRWxlbWVudC5hcHBlbmRDaGlsZChuZXdUdS5hc1htbEVsZW1lbnQoKSk7XHJcbiAgICAgICAgICAgICAgICBpbnNlcnRlZCA9IHRydWU7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICBjb25zdCByZWZVbml0RWxlbWVudCA9IERPTVV0aWxpdGllcy5nZXRFbGVtZW50QnlUYWdOYW1lQW5kSWQodGhpcy5fcGFyc2VkRG9jdW1lbnQsICd1bml0JywgaW1wb3J0QWZ0ZXJFbGVtZW50LmlkKTtcclxuICAgICAgICAgICAgaWYgKHJlZlVuaXRFbGVtZW50KSB7XHJcbiAgICAgICAgICAgICAgICBET01VdGlsaXRpZXMuaW5zZXJ0QWZ0ZXIobmV3VHUuYXNYbWxFbGVtZW50KCksIHJlZlVuaXRFbGVtZW50KTtcclxuICAgICAgICAgICAgICAgIGluc2VydGVkID0gdHJ1ZTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAoaW5zZXJ0ZWQpIHtcclxuICAgICAgICAgICAgdGhpcy5sYXp5SW5pdGlhbGl6ZVRyYW5zVW5pdHMoKTtcclxuICAgICAgICAgICAgdGhpcy50cmFuc1VuaXRzLnB1c2gobmV3VHUpO1xyXG4gICAgICAgICAgICB0aGlzLmNvdW50TnVtYmVycygpO1xyXG4gICAgICAgICAgICByZXR1cm4gbmV3VHU7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgcmV0dXJuIG51bGw7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogQ3JlYXRlIGEgbmV3IHRyYW5zbGF0aW9uIGZpbGUgZm9yIHRoaXMgZmlsZSBmb3IgYSBnaXZlbiBsYW5ndWFnZS5cclxuICAgICAqIE5vcm1hbGx5LCB0aGlzIGlzIGp1c3QgYSBjb3B5IG9mIHRoZSBvcmlnaW5hbCBvbmUuXHJcbiAgICAgKiBCdXQgZm9yIFhNQiB0aGUgdHJhbnNsYXRpb24gZmlsZSBoYXMgZm9ybWF0ICdYVEInLlxyXG4gICAgICogQHBhcmFtIGxhbmcgTGFuZ3VhZ2UgY29kZVxyXG4gICAgICogQHBhcmFtIGZpbGVuYW1lIGV4cGVjdGVkIGZpbGVuYW1lIHRvIHN0b3JlIGZpbGVcclxuICAgICAqIEBwYXJhbSBpc0RlZmF1bHRMYW5nIEZsYWcsIHdldGhlciBmaWxlIGNvbnRhaW5zIHRoZSBkZWZhdWx0IGxhbmd1YWdlLlxyXG4gICAgICogVGhlbiBzb3VyY2UgYW5kIHRhcmdldCBhcmUganVzdCBlcXVhbC5cclxuICAgICAqIFRoZSBjb250ZW50IHdpbGwgYmUgY29waWVkLlxyXG4gICAgICogU3RhdGUgd2lsbCBiZSBmaW5hbC5cclxuICAgICAqIEBwYXJhbSBjb3B5Q29udGVudCBGbGFnLCB3ZXRoZXIgdG8gY29weSBjb250ZW50IG9yIGxlYXZlIGl0IGVtcHR5LlxyXG4gICAgICogV2JlbiB0cnVlLCBjb250ZW50IHdpbGwgYmUgY29waWVkIGZyb20gc291cmNlLlxyXG4gICAgICogV2hlbiBmYWxzZSwgY29udGVudCB3aWxsIGJlIGxlZnQgZW1wdHkgKGlmIGl0IGlzIG5vdCB0aGUgZGVmYXVsdCBsYW5ndWFnZSkuXHJcbiAgICAgKi9cclxuICAgIHB1YmxpYyBjcmVhdGVUcmFuc2xhdGlvbkZpbGVGb3JMYW5nKGxhbmc6IHN0cmluZywgZmlsZW5hbWU6IHN0cmluZywgaXNEZWZhdWx0TGFuZzogYm9vbGVhbiwgY29weUNvbnRlbnQ6IGJvb2xlYW4pXHJcbiAgICAgICAgOiBJVHJhbnNsYXRpb25NZXNzYWdlc0ZpbGUge1xyXG4gICAgICAgIGNvbnN0IHRyYW5zbGF0aW9uRmlsZSA9IG5ldyBYbGlmZjJGaWxlKHRoaXMuZWRpdGVkQ29udGVudCgpLCBmaWxlbmFtZSwgdGhpcy5lbmNvZGluZygpKTtcclxuICAgICAgICB0cmFuc2xhdGlvbkZpbGUuc2V0TmV3VHJhbnNVbml0VGFyZ2V0UHJhZWZpeCh0aGlzLnRhcmdldFByYWVmaXgpO1xyXG4gICAgICAgIHRyYW5zbGF0aW9uRmlsZS5zZXROZXdUcmFuc1VuaXRUYXJnZXRTdWZmaXgodGhpcy50YXJnZXRTdWZmaXgpO1xyXG4gICAgICAgIHRyYW5zbGF0aW9uRmlsZS5zZXRUYXJnZXRMYW5ndWFnZShsYW5nKTtcclxuICAgICAgICB0cmFuc2xhdGlvbkZpbGUuZm9yRWFjaFRyYW5zVW5pdCgodHJhbnNVbml0OiBJVHJhbnNVbml0KSA9PiB7XHJcbiAgICAgICAgICAgICg8QWJzdHJhY3RUcmFuc1VuaXQ+IHRyYW5zVW5pdCkudXNlU291cmNlQXNUYXJnZXQoaXNEZWZhdWx0TGFuZywgY29weUNvbnRlbnQpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIHJldHVybiB0cmFuc2xhdGlvbkZpbGU7XHJcbiAgICB9XHJcbn1cclxuIl19