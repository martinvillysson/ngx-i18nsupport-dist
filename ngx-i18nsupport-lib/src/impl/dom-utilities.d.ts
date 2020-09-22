/**
 * Created by martin on 01.05.2017.
 * Some Tool functions for XML Handling.
 */
export declare class DOMUtilities {
    /**
     * return the first subelement with the given tag.
     * @param element element
     * @param tagName tagName
     * @return subelement or null, if not existing.
     */
    static getFirstElementByTagName(element: Element | Document, tagName: string): Element;
    /**
     * return an element with the given tag and id attribute.
     * @param element element
     * @param tagName tagName
     * @param id id
     * @return subelement or null, if not existing.
     */
    static getElementByTagNameAndId(element: Element | Document, tagName: string, id: string): Element;
    /**
     * Get next sibling, that is an element.
     * @param element element
     */
    static getElementFollowingSibling(element: Element): Element;
    /**
     * Get previous sibling, that is an element.
     * @param element element
     */
    static getElementPrecedingSibling(element: Element): Element;
    /**
     * return content of element as string, including all markup.
     * @param element element
     * @return content of element as string, including all markup.
     */
    static getXMLContent(element: Element): string;
    /**
     * return PCDATA content of element.
     * @param element element
     * @return PCDATA content of element.
     */
    static getPCDATA(element: Element): string;
    /**
     * replace PCDATA content with a new one.
     * @param element element
     * @param pcdata pcdata
     */
    static replaceContentWithXMLContent(element: Element, pcdata: string): void;
    /**
     * find the previous sibling that is an element.
     * @param element element
     * @return the previous sibling that is an element or null.
     */
    static getPreviousElementSibling(element: Node): Element;
    /**
     * Create an Element Node that is the next sibling of a given node.
     * @param elementNameToCreate elementNameToCreate
     * @param previousSibling previousSibling
     * @return new element
     */
    static createFollowingSibling(elementNameToCreate: string, previousSibling: Node): Element;
    /**
     * Insert newElement directly after previousSibling.
     * @param newElement newElement
     * @param previousSibling previousSibling
     */
    static insertAfter(newElement: Node, previousSibling: Node): Node;
    /**
     * Insert newElement directly before nextSibling.
     * @param newElement newElement
     * @param nextSibling nextSibling
     */
    static insertBefore(newElement: Node, nextSibling: Node): Node;
}
