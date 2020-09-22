import { DOMParser, XMLSerializer } from 'xmldom';
/**
 * Created by martin on 01.05.2017.
 * Some Tool functions for XML Handling.
 */
export class DOMUtilities {
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
        let result = new XMLSerializer().serializeToString(element);
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
        const pcdataFragment = new DOMParser().parseFromString('<fragment>' + pcdata + '</fragment>', 'application/xml');
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZG9tLXV0aWxpdGllcy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3Byb2plY3RzL25neC1pMThuc3VwcG9ydC1saWIvc3JjL2ltcGwvZG9tLXV0aWxpdGllcy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLEVBQUMsU0FBUyxFQUFFLGFBQWEsRUFBQyxNQUFNLFFBQVEsQ0FBQztBQUNoRDs7O0dBR0c7QUFFSCxNQUFNLE9BQU8sWUFBWTtJQUVyQjs7Ozs7T0FLRztJQUNJLE1BQU0sQ0FBQyx3QkFBd0IsQ0FBQyxPQUEyQixFQUFFLE9BQWU7UUFDL0UsTUFBTSxnQkFBZ0IsR0FBRyxPQUFPLENBQUMsb0JBQW9CLENBQUMsT0FBTyxDQUFDLENBQUM7UUFDL0QsSUFBSSxnQkFBZ0IsSUFBSSxnQkFBZ0IsQ0FBQyxNQUFNLEdBQUcsQ0FBQyxFQUFFO1lBQ2pELE9BQU8sZ0JBQWdCLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDO1NBQ25DO2FBQU07WUFDSCxPQUFPLElBQUksQ0FBQztTQUNmO0lBQ0wsQ0FBQztJQUVEOzs7Ozs7T0FNRztJQUNJLE1BQU0sQ0FBQyx3QkFBd0IsQ0FBQyxPQUEyQixFQUFFLE9BQWUsRUFBRSxFQUFVO1FBQzNGLE1BQU0sZ0JBQWdCLEdBQUcsT0FBTyxDQUFDLG9CQUFvQixDQUFDLE9BQU8sQ0FBQyxDQUFDO1FBQy9ELElBQUksZ0JBQWdCLElBQUksZ0JBQWdCLENBQUMsTUFBTSxHQUFHLENBQUMsRUFBRTtZQUNqRCxLQUFLLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsZ0JBQWdCLENBQUMsTUFBTSxFQUFFLENBQUMsRUFBRSxFQUFFO2dCQUM5QyxNQUFNLElBQUksR0FBWSxnQkFBZ0IsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7Z0JBQy9DLElBQUksSUFBSSxDQUFDLFlBQVksQ0FBQyxJQUFJLENBQUMsS0FBSyxFQUFFLEVBQUU7b0JBQ2hDLE9B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QWEsQ0FBQyxhQUFhLENBQUMsbUJBQW1CLENBQUMsQ0FBQztRQUNwRixPQUFpQixZQUFZLENBQUMsV0FBVyxDQUFDLFVBQVUsRUFBRSxlQUFlLENBQUMsQ0FBQztJQUMzRSxDQUFDO0lBRUQ7Ozs7T0FJRztJQUNJLE1BQU0sQ0FBQyxXQUFXLENBQUMsVUFBZ0IsRUFBRSxlQUFxQjtRQUM3RCxJQUFJLGVBQWUsQ0FBQyxXQUFXLEtBQUssSUFBSSxFQUFFO1lBQ3RDLGVBQWUsQ0FBQyxVQUFVLENBQUMsWUFBWSxDQUFDLFVBQVUsRUFBRSxlQUFlLENBQUMsV0FBVyxDQUFDLENBQUM7U0FDcEY7YUFBTTtZQUNILGVBQWUsQ0FBQyxVQUFVLENBQUMsV0FBVyxDQUFDLFVBQVUsQ0FBQyxDQUFDO1NBQ3REO1FBQ0QsT0FBTyxVQUFVLENBQUM7SUFDdEIsQ0FBQztJQUVEOzs7O09BSUc7SUFDSSxNQUFNLENBQUMsWUFBWSxDQUFDLFVBQWdCLEVBQUUsV0FBaUI7UUFDMUQsV0FBVyxDQUFDLFVBQVUsQ0FBQyxZQUFZLENBQUMsVUFBVSxFQUFFLFdBQVcsQ0FBQyxDQUFDO1FBQzdELE9BQU8sVUFBVSxDQUFDO0lBQ3RCLENBQUM7Q0FDSiIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7RE9NUGFyc2VyLCBYTUxTZXJpYWxpemVyfSBmcm9tICd4bWxkb20nO1xyXG4vKipcclxuICogQ3JlYXRlZCBieSBtYXJ0aW4gb24gMDEuMDUuMjAxNy5cclxuICogU29tZSBUb29sIGZ1bmN0aW9ucyBmb3IgWE1MIEhhbmRsaW5nLlxyXG4gKi9cclxuXHJcbmV4cG9ydCBjbGFzcyBET01VdGlsaXRpZXMge1xyXG5cclxuICAgIC8qKlxyXG4gICAgICogcmV0dXJuIHRoZSBmaXJzdCBzdWJlbGVtZW50IHdpdGggdGhlIGdpdmVuIHRhZy5cclxuICAgICAqIEBwYXJhbSBlbGVtZW50IGVsZW1lbnRcclxuICAgICAqIEBwYXJhbSB0YWdOYW1lIHRhZ05hbWVcclxuICAgICAqIEByZXR1cm4gc3ViZWxlbWVudCBvciBudWxsLCBpZiBub3QgZXhpc3RpbmcuXHJcbiAgICAgKi9cclxuICAgIHB1YmxpYyBzdGF0aWMgZ2V0Rmlyc3RFbGVtZW50QnlUYWdOYW1lKGVsZW1lbnQ6IEVsZW1lbnQgfCBEb2N1bWVudCwgdGFnTmFtZTogc3RyaW5nKTogRWxlbWVudCB7XHJcbiAgICAgICAgY29uc3QgbWF0Y2hpbmdFbGVtZW50cyA9IGVsZW1lbnQuZ2V0RWxlbWVudHNCeVRhZ05hbWUodGFnTmFtZSk7XHJcbiAgICAgICAgaWYgKG1hdGNoaW5nRWxlbWVudHMgJiYgbWF0Y2hpbmdFbGVtZW50cy5sZW5ndGggPiAwKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBtYXRjaGluZ0VsZW1lbnRzLml0ZW0oMCk7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgcmV0dXJuIG51bGw7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogcmV0dXJuIGFuIGVsZW1lbnQgd2l0aCB0aGUgZ2l2ZW4gdGFnIGFuZCBpZCBhdHRyaWJ1dGUuXHJcbiAgICAgKiBAcGFyYW0gZWxlbWVudCBlbGVtZW50XHJcbiAgICAgKiBAcGFyYW0gdGFnTmFtZSB0YWdOYW1lXHJcbiAgICAgKiBAcGFyYW0gaWQgaWRcclxuICAgICAqIEByZXR1cm4gc3ViZWxlbWVudCBvciBudWxsLCBpZiBub3QgZXhpc3RpbmcuXHJcbiAgICAgKi9cclxuICAgIHB1YmxpYyBzdGF0aWMgZ2V0RWxlbWVudEJ5VGFnTmFtZUFuZElkKGVsZW1lbnQ6IEVsZW1lbnQgfCBEb2N1bWVudCwgdGFnTmFtZTogc3RyaW5nLCBpZDogc3RyaW5nKTogRWxlbWVudCB7XHJcbiAgICAgICAgY29uc3QgbWF0Y2hpbmdFbGVtZW50cyA9IGVsZW1lbnQuZ2V0RWxlbWVudHNCeVRhZ05hbWUodGFnTmFtZSk7XHJcbiAgICAgICAgaWYgKG1hdGNoaW5nRWxlbWVudHMgJiYgbWF0Y2hpbmdFbGVtZW50cy5sZW5ndGggPiAwKSB7XHJcbiAgICAgICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgbWF0Y2hpbmdFbGVtZW50cy5sZW5ndGg7IGkrKykge1xyXG4gICAgICAgICAgICAgICAgY29uc3Qgbm9kZTogRWxlbWVudCA9IG1hdGNoaW5nRWxlbWVudHMuaXRlbShpKTtcclxuICAgICAgICAgICAgICAgIGlmIChub2RlLmdldEF0dHJpYnV0ZSgnaWQnKSA9PT0gaWQpIHtcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gbm9kZTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gbnVsbDtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIEdldCBuZXh0IHNpYmxpbmcsIHRoYXQgaXMgYW4gZWxlbWVudC5cclxuICAgICAqIEBwYXJhbSBlbGVtZW50IGVsZW1lbnRcclxuICAgICAqL1xyXG4gICAgcHVibGljIHN0YXRpYyBnZXRFbGVtZW50Rm9sbG93aW5nU2libGluZyhlbGVtZW50OiBFbGVtZW50KTogRWxlbWVudCB7XHJcbiAgICAgICAgaWYgKCFlbGVtZW50KSB7XHJcbiAgICAgICAgICAgIHJldHVybiBudWxsO1xyXG4gICAgICAgIH1cclxuICAgICAgICBsZXQgZSA9IGVsZW1lbnQubmV4dFNpYmxpbmc7XHJcbiAgICAgICAgd2hpbGUgKGUpIHtcclxuICAgICAgICAgICAgaWYgKGUubm9kZVR5cGUgPT09IGUuRUxFTUVOVF9OT0RFKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gPEVsZW1lbnQ+IGU7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZSA9IGUubmV4dFNpYmxpbmc7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiBudWxsO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogR2V0IHByZXZpb3VzIHNpYmxpbmcsIHRoYXQgaXMgYW4gZWxlbWVudC5cclxuICAgICAqIEBwYXJhbSBlbGVtZW50IGVsZW1lbnRcclxuICAgICAqL1xyXG4gICAgcHVibGljIHN0YXRpYyBnZXRFbGVtZW50UHJlY2VkaW5nU2libGluZyhlbGVtZW50OiBFbGVtZW50KTogRWxlbWVudCB7XHJcbiAgICAgICAgaWYgKCFlbGVtZW50KSB7XHJcbiAgICAgICAgICAgIHJldHVybiBudWxsO1xyXG4gICAgICAgIH1cclxuICAgICAgICBsZXQgZSA9IGVsZW1lbnQucHJldmlvdXNTaWJsaW5nO1xyXG4gICAgICAgIHdoaWxlIChlKSB7XHJcbiAgICAgICAgICAgIGlmIChlLm5vZGVUeXBlID09PSBlLkVMRU1FTlRfTk9ERSkge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIDxFbGVtZW50PiBlO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGUgPSBlLnByZXZpb3VzU2libGluZztcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIG51bGw7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiByZXR1cm4gY29udGVudCBvZiBlbGVtZW50IGFzIHN0cmluZywgaW5jbHVkaW5nIGFsbCBtYXJrdXAuXHJcbiAgICAgKiBAcGFyYW0gZWxlbWVudCBlbGVtZW50XHJcbiAgICAgKiBAcmV0dXJuIGNvbnRlbnQgb2YgZWxlbWVudCBhcyBzdHJpbmcsIGluY2x1ZGluZyBhbGwgbWFya3VwLlxyXG4gICAgICovXHJcbiAgICBwdWJsaWMgc3RhdGljIGdldFhNTENvbnRlbnQoZWxlbWVudDogRWxlbWVudCk6IHN0cmluZyB7XHJcbiAgICAgICAgaWYgKCFlbGVtZW50KSB7XHJcbiAgICAgICAgICAgIHJldHVybiBudWxsO1xyXG4gICAgICAgIH1cclxuICAgICAgICBsZXQgcmVzdWx0ID0gbmV3IFhNTFNlcmlhbGl6ZXIoKS5zZXJpYWxpemVUb1N0cmluZyhlbGVtZW50KTtcclxuICAgICAgICBjb25zdCB0YWdOYW1lID0gZWxlbWVudC5ub2RlTmFtZTtcclxuICAgICAgICBjb25zdCByZVN0YXJ0TXNnOiBSZWdFeHAgPSBuZXcgUmVnRXhwKCc8JyArIHRhZ05hbWUgKyAnW14+XSo+JywgJ2cnKTtcclxuICAgICAgICByZXN1bHQgPSByZXN1bHQucmVwbGFjZShyZVN0YXJ0TXNnLCAnJyk7XHJcbiAgICAgICAgY29uc3QgcmVFbmRNc2c6IFJlZ0V4cCA9IG5ldyBSZWdFeHAoJzwvJyArIHRhZ05hbWUgKyAnPicsICdnJyk7XHJcbiAgICAgICAgcmVzdWx0ID0gcmVzdWx0LnJlcGxhY2UocmVFbmRNc2csICcnKTtcclxuICAgICAgICByZXR1cm4gcmVzdWx0O1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogcmV0dXJuIFBDREFUQSBjb250ZW50IG9mIGVsZW1lbnQuXHJcbiAgICAgKiBAcGFyYW0gZWxlbWVudCBlbGVtZW50XHJcbiAgICAgKiBAcmV0dXJuIFBDREFUQSBjb250ZW50IG9mIGVsZW1lbnQuXHJcbiAgICAgKi9cclxuICAgIHB1YmxpYyBzdGF0aWMgZ2V0UENEQVRBKGVsZW1lbnQ6IEVsZW1lbnQpOiBzdHJpbmcge1xyXG4gICAgICAgIGlmICghZWxlbWVudCkge1xyXG4gICAgICAgICAgICByZXR1cm4gbnVsbDtcclxuICAgICAgICB9XHJcbiAgICAgICAgbGV0IHJlc3VsdCA9ICcnO1xyXG4gICAgICAgIGNvbnN0IGNoaWxkTm9kZXMgPSBlbGVtZW50LmNoaWxkTm9kZXM7XHJcbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBjaGlsZE5vZGVzLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgICAgIGNvbnN0IGNoaWxkID0gY2hpbGROb2Rlcy5pdGVtKGkpO1xyXG4gICAgICAgICAgICBpZiAoY2hpbGQubm9kZVR5cGUgPT09IGNoaWxkLlRFWFRfTk9ERSB8fCBjaGlsZC5ub2RlVHlwZSA9PT0gY2hpbGQuQ0RBVEFfU0VDVElPTl9OT0RFKSB7XHJcbiAgICAgICAgICAgICAgICByZXN1bHQgPSByZXN1bHQgKyBjaGlsZC5ub2RlVmFsdWU7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIHJlc3VsdC5sZW5ndGggPT09IDAgPyBudWxsIDogcmVzdWx0O1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogcmVwbGFjZSBQQ0RBVEEgY29udGVudCB3aXRoIGEgbmV3IG9uZS5cclxuICAgICAqIEBwYXJhbSBlbGVtZW50IGVsZW1lbnRcclxuICAgICAqIEBwYXJhbSBwY2RhdGEgcGNkYXRhXHJcbiAgICAgKi9cclxuICAgIHB1YmxpYyBzdGF0aWMgcmVwbGFjZUNvbnRlbnRXaXRoWE1MQ29udGVudChlbGVtZW50OiBFbGVtZW50LCBwY2RhdGE6IHN0cmluZykge1xyXG4gICAgICAgIC8vIHJlbW92ZSBhbGwgY2hpbGRyZW5cclxuICAgICAgICB3aGlsZSAoZWxlbWVudC5maXJzdENoaWxkKSB7XHJcbiAgICAgICAgICAgIGVsZW1lbnQucmVtb3ZlQ2hpbGQoZWxlbWVudC5maXJzdENoaWxkKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgLy8gcGFyc2VJQ1VNZXNzYWdlIHBjZGF0YVxyXG4gICAgICAgIGNvbnN0IHBjZGF0YUZyYWdtZW50OiBEb2N1bWVudCA9IG5ldyBET01QYXJzZXIoKS5wYXJzZUZyb21TdHJpbmcoJzxmcmFnbWVudD4nICsgcGNkYXRhICsgJzwvZnJhZ21lbnQ+JywgJ2FwcGxpY2F0aW9uL3htbCcpO1xyXG4gICAgICAgIGNvbnN0IG5ld0NoaWxkcmVuID0gcGNkYXRhRnJhZ21lbnQuZ2V0RWxlbWVudHNCeVRhZ05hbWUoJ2ZyYWdtZW50JykuaXRlbSgwKS5jaGlsZE5vZGVzO1xyXG4gICAgICAgIGZvciAobGV0IGogPSAwOyBqIDwgbmV3Q2hpbGRyZW4ubGVuZ3RoOyBqKyspIHtcclxuICAgICAgICAgICAgY29uc3QgbmV3Q2hpbGQgPSBuZXdDaGlsZHJlbi5pdGVtKGopO1xyXG4gICAgICAgICAgICBlbGVtZW50LmFwcGVuZENoaWxkKGVsZW1lbnQub3duZXJEb2N1bWVudC5pbXBvcnROb2RlKG5ld0NoaWxkLCB0cnVlKSk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogZmluZCB0aGUgcHJldmlvdXMgc2libGluZyB0aGF0IGlzIGFuIGVsZW1lbnQuXHJcbiAgICAgKiBAcGFyYW0gZWxlbWVudCBlbGVtZW50XHJcbiAgICAgKiBAcmV0dXJuIHRoZSBwcmV2aW91cyBzaWJsaW5nIHRoYXQgaXMgYW4gZWxlbWVudCBvciBudWxsLlxyXG4gICAgICovXHJcbiAgICBwdWJsaWMgc3RhdGljIGdldFByZXZpb3VzRWxlbWVudFNpYmxpbmcoZWxlbWVudDogTm9kZSk6IEVsZW1lbnQge1xyXG4gICAgICAgIGxldCBub2RlID0gZWxlbWVudC5wcmV2aW91c1NpYmxpbmc7XHJcbiAgICAgICAgd2hpbGUgKG5vZGUgIT09IG51bGwpIHtcclxuICAgICAgICAgICAgaWYgKG5vZGUubm9kZVR5cGUgPT09IG5vZGUuRUxFTUVOVF9OT0RFKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gPEVsZW1lbnQ+IG5vZGU7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgbm9kZSA9IG5vZGUucHJldmlvdXNTaWJsaW5nO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gbnVsbDtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIENyZWF0ZSBhbiBFbGVtZW50IE5vZGUgdGhhdCBpcyB0aGUgbmV4dCBzaWJsaW5nIG9mIGEgZ2l2ZW4gbm9kZS5cclxuICAgICAqIEBwYXJhbSBlbGVtZW50TmFtZVRvQ3JlYXRlIGVsZW1lbnROYW1lVG9DcmVhdGVcclxuICAgICAqIEBwYXJhbSBwcmV2aW91c1NpYmxpbmcgcHJldmlvdXNTaWJsaW5nXHJcbiAgICAgKiBAcmV0dXJuIG5ldyBlbGVtZW50XHJcbiAgICAgKi9cclxuICAgIHB1YmxpYyBzdGF0aWMgY3JlYXRlRm9sbG93aW5nU2libGluZyhlbGVtZW50TmFtZVRvQ3JlYXRlOiBzdHJpbmcsIHByZXZpb3VzU2libGluZzogTm9kZSk6IEVsZW1lbnQge1xyXG4gICAgICAgIGNvbnN0IG5ld0VsZW1lbnQgPSBwcmV2aW91c1NpYmxpbmcub3duZXJEb2N1bWVudC5jcmVhdGVFbGVtZW50KGVsZW1lbnROYW1lVG9DcmVhdGUpO1xyXG4gICAgICAgIHJldHVybiA8RWxlbWVudD4gRE9NVXRpbGl0aWVzLmluc2VydEFmdGVyKG5ld0VsZW1lbnQsIHByZXZpb3VzU2libGluZyk7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBJbnNlcnQgbmV3RWxlbWVudCBkaXJlY3RseSBhZnRlciBwcmV2aW91c1NpYmxpbmcuXHJcbiAgICAgKiBAcGFyYW0gbmV3RWxlbWVudCBuZXdFbGVtZW50XHJcbiAgICAgKiBAcGFyYW0gcHJldmlvdXNTaWJsaW5nIHByZXZpb3VzU2libGluZ1xyXG4gICAgICovXHJcbiAgICBwdWJsaWMgc3RhdGljIGluc2VydEFmdGVyKG5ld0VsZW1lbnQ6IE5vZGUsIHByZXZpb3VzU2libGluZzogTm9kZSk6IE5vZGUge1xyXG4gICAgICAgIGlmIChwcmV2aW91c1NpYmxpbmcubmV4dFNpYmxpbmcgIT09IG51bGwpIHtcclxuICAgICAgICAgICAgcHJldmlvdXNTaWJsaW5nLnBhcmVudE5vZGUuaW5zZXJ0QmVmb3JlKG5ld0VsZW1lbnQsIHByZXZpb3VzU2libGluZy5uZXh0U2libGluZyk7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgcHJldmlvdXNTaWJsaW5nLnBhcmVudE5vZGUuYXBwZW5kQ2hpbGQobmV3RWxlbWVudCk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiBuZXdFbGVtZW50O1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogSW5zZXJ0IG5ld0VsZW1lbnQgZGlyZWN0bHkgYmVmb3JlIG5leHRTaWJsaW5nLlxyXG4gICAgICogQHBhcmFtIG5ld0VsZW1lbnQgbmV3RWxlbWVudFxyXG4gICAgICogQHBhcmFtIG5leHRTaWJsaW5nIG5leHRTaWJsaW5nXHJcbiAgICAgKi9cclxuICAgIHB1YmxpYyBzdGF0aWMgaW5zZXJ0QmVmb3JlKG5ld0VsZW1lbnQ6IE5vZGUsIG5leHRTaWJsaW5nOiBOb2RlKTogTm9kZSB7XHJcbiAgICAgICAgbmV4dFNpYmxpbmcucGFyZW50Tm9kZS5pbnNlcnRCZWZvcmUobmV3RWxlbWVudCwgbmV4dFNpYmxpbmcpO1xyXG4gICAgICAgIHJldHVybiBuZXdFbGVtZW50O1xyXG4gICAgfVxyXG59XHJcbiJdfQ==