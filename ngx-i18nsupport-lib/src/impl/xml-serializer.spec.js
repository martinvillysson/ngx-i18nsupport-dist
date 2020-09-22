"use strict";
/**
 * Created by martin on 04.08.2018.
 * Testcases for the XmlSerializer.
 */
Object.defineProperty(exports, "__esModule", { value: true });
const xmldom_1 = require("xmldom");
const xml_serializer_1 = require("./xml-serializer");
const assert_1 = require("assert");
describe('XmlSerializer test spec', () => {
    let serializer;
    /**
     * Helper. Parse an XML string.
     * @param xmlstring xmlstring
     */
    function parseXmlString(xmlstring) {
        return new xmldom_1.DOMParser().parseFromString(xmlstring);
    }
    beforeEach(() => {
        serializer = new xml_serializer_1.XmlSerializer();
    });
    it('should serialize a simple document without any changes in output', () => {
        const doc1string = `<test><elem>a test</elem></test>`;
        const doc1 = parseXmlString(doc1string);
        const serializedDoc = serializer.serializeToString(doc1);
        expect(serializedDoc).toEqual(doc1string);
    });
    it('should serialize a complex document with attributes etc. without any changes in output', () => {
        const doc1string = `<?xml version="1.0" encoding="UTF-8"?>
<xliff version="1.2" xmlns="urn:oasis:names:tc:xliff:document:1.2">
  <file source-language="en" datatype="plaintext" original="ng2.template">
  </file>
</xliff>`;
        const doc1 = parseXmlString(doc1string);
        const serializedDoc = serializer.serializeToString(doc1);
        expect(serializedDoc).toEqual(doc1string);
    });
    it('should beautify output using 2 spaces for indentation', () => {
        const doc1string = `<?xml version="1.0" encoding="UTF-8"?>
<x a="1" b="&amp;"><y>a simple pcdata element</y></x>`;
        const doc1 = parseXmlString(doc1string);
        const beautifyOptions = {
            beautify: true
        };
        const serializedDoc = serializer.serializeToString(doc1, beautifyOptions);
        const expectedResult = `<?xml version="1.0" encoding="UTF-8"?>
<x a="1" b="&amp;">
  <y>a simple pcdata element</y>
</x>`;
        expect(serializedDoc).toEqual(expectedResult);
    });
    it('should beautify output using e.g. tab for indentation', () => {
        const doc1string = `<?xml version="1.0" encoding="UTF-8"?>
<x a="1" b="&amp;"><y>a simple pcdata element</y></x>`;
        const doc1 = parseXmlString(doc1string);
        const beautifyOptions = {
            beautify: true,
            indentString: '\t'
        };
        const serializedDoc = serializer.serializeToString(doc1, beautifyOptions);
        const expectedResult = `<?xml version="1.0" encoding="UTF-8"?>
<x a="1" b="&amp;">
\t<y>a simple pcdata element</y>
</x>`;
        expect(serializedDoc).toEqual(expectedResult);
    });
    it('should throw an error if a non whitespace char is used for indentation', () => {
        const doc1string = `<?xml version="1.0" encoding="UTF-8"?>
<x a="1" b="&amp;"><y>a simple pcdata element</y></x>`;
        const doc1 = parseXmlString(doc1string);
        const beautifyOptions = {
            beautify: true,
            indentString: '\tx'
        };
        try {
            serializer.serializeToString(doc1, beautifyOptions);
            assert_1.fail('oops, error expected here');
        }
        catch (err) {
            expect(err.message).toBe('indentString must not contain non white characters');
        }
    });
    it('should beautify output with mixed content', () => {
        const doc1string = `<?xml version="1.0" encoding="UTF-8"?>
<x a="1" b="&amp;"><y>a <b><it>mixed</it> content</b> element</y></x>`;
        const doc1 = parseXmlString(doc1string);
        const beautifyOptions = {
            beautify: true,
            mixedContentElements: ['y']
        };
        const serializedDoc = serializer.serializeToString(doc1, beautifyOptions);
        const expectedResult = `<?xml version="1.0" encoding="UTF-8"?>
<x a="1" b="&amp;">
  <y>a <b><it>mixed</it> content</b> element</y>
</x>`;
        expect(serializedDoc).toEqual(expectedResult);
    });
});
//# sourceMappingURL=xml-serializer.spec.js.map