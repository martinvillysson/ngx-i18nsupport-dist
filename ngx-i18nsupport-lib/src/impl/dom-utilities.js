"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DOMUtilities = void 0;
const xmldom_1 = require("xmldom");
/**
 * Created by martin on 01.05.2017.
 * Some Tool functions for XML Handling.
 */
class DOMUtilities {
    /**
     * return the first subelement with the given tag.
     * @param element element
     * @param tagName tagName
     * @return subelement or null, if not existing.
     */
    static getFirstElementByTagName(element, tagName) {
        const matchingElements = element.getElementsByTagName(tagName);
        if (matchingElements && matchingElements.length > 0) {
            return matchingElements.item(0);
        }
        else {
            return null;
        }
    }
    /**
     * return an element with the given tag and id attribute.
     * @param element element
     * @param tagName tagName
     * @param id id
     * @return subelement or null, if not existing.
     */
    static getElementByTagNameAndId(element, tagName, id) {
        const matchingElements = element.getElementsByTagName(tagName);
        if (matchingElements && matchingElements.length > 0) {
            for (let i = 0; i < matchingElements.length; i++) {
                const node = matchingElements.item(i);
                if (node.getAttribute('id') === id) {
                    return node;
                }
            }
        }
        return null;
    }
    /**
     * Get next sibling, that is an element.
     * @param element element
     */
    static getElementFollowingSibling(element) {
        if (!element) {
            return null;
        }
        let e = element.nextSibling;
        while (e) {
            if (e.nodeType === e.ELEMENT_NODE) {
                return e;
            }
            e = e.nextSibling;
        }
        return null;
    }
    /**
     * Get previous sibling, that is an element.
     * @param element element
     */
    static getElementPrecedingSibling(element) {
        if (!element) {
            return null;
        }
        let e = element.previousSibling;
        while (e) {
            if (e.nodeType === e.ELEMENT_NODE) {
                return e;
            }
            e = e.previousSibling;
        }
        return null;
    }
    /**
     * return content of element as string, including all markup.
     * @param element element
     * @return content of element as string, including all markup.
     */
    static getXMLContent(element) {
        if (!element) {
            return null;
        }
        let result = new xmldom_1.XMLSerializer().serializeToString(element);
        const tagName = element.nodeName;
        const reStartMsg = new RegExp('<' + tagName + '[^>]*>', 'g');
        result = result.replace(reStartMsg, '');
        const reEndMsg = new RegExp('</' + tagName + '>', 'g');
        result = result.replace(reEndMsg, '');
        return result;
    }
    /**
     * return PCDATA content of element.
     * @param element element
     * @return PCDATA content of element.
     */
    static getPCDATA(element) {
        if (!element) {
            return null;
        }
        let result = '';
        const childNodes = element.childNodes;
        for (let i = 0; i < childNodes.length; i++) {
            const child = childNodes.item(i);
            if (child.nodeType === child.TEXT_NODE || child.nodeType === child.CDATA_SECTION_NODE) {
                result = result + child.nodeValue;
            }
        }
        return result.length === 0 ? null : result;
    }
    /**
     * replace PCDATA content with a new one.
     * @param element element
     * @param pcdata pcdata
     */
    static replaceContentWithXMLContent(element, pcdata) {
        // remove all children
        while (element.firstChild) {
            element.removeChild(element.firstChild);
        }
        // parseICUMessage pcdata
        const pcdataFragment = new xmldom_1.DOMParser().parseFromString('<fragment>' + pcdata + '</fragment>', 'application/xml');
        const newChildren = pcdataFragment.getElementsByTagName('fragment').item(0).childNodes;
        for (let j = 0; j < newChildren.length; j++) {
            const newChild = newChildren.item(j);
            element.appendChild(element.ownerDocument.importNode(newChild, true));
        }
    }
    /**
     * find the previous sibling that is an element.
     * @param element element
     * @return the previous sibling that is an element or null.
     */
    static getPreviousElementSibling(element) {
        let node = element.previousSibling;
        while (node !== null) {
            if (node.nodeType === node.ELEMENT_NODE) {
                return node;
            }
            node = node.previousSibling;
        }
        return null;
    }
    /**
     * Create an Element Node that is the next sibling of a given node.
     * @param elementNameToCreate elementNameToCreate
     * @param previousSibling previousSibling
     * @return new element
     */
    static createFollowingSibling(elementNameToCreate, previousSibling) {
        const newElement = previousSibling.ownerDocument.createElement(elementNameToCreate);
        return DOMUtilities.insertAfter(newElement, previousSibling);
    }
    /**
     * Insert newElement directly after previousSibling.
     * @param newElement newElement
     * @param previousSibling previousSibling
     */
    static insertAfter(newElement, previousSibling) {
        if (previousSibling.nextSibling !== null) {
            previousSibling.parentNode.insertBefore(newElement, previousSibling.nextSibling);
        }
        else {
            previousSibling.parentNode.appendChild(newElement);
        }
        return newElement;
    }
    /**
     * Insert newElement directly before nextSibling.
     * @param newElement newElement
     * @param nextSibling nextSibling
     */
    static insertBefore(newElement, nextSibling) {
        nextSibling.parentNode.insertBefore(newElement, nextSibling);
        return newElement;
    }
}
exports.DOMUtilities = DOMUtilities;
//# sourceMappingURL=dom-utilities.js.map