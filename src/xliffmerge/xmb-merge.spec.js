"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fs = require("fs");
const xliff_merge_1 = require("./xliff-merge");
const command_output_1 = require("../common/command-output");
const writer_to_string_1 = require("../common/writer-to-string");
const file_util_1 = require("../common/file-util");
const ngx_i18nsupport_lib_1 = require("@ngx-i18nsupport/ngx-i18nsupport-lib");
const translation_messages_file_reader_1 = require("./translation-messages-file-reader");
const xml_reader_1 = require("./xml-reader");
/**
 * Created by martin on 18.02.2017.
 * Testcases for XliffMerge Format XMB.
 */
describe('XliffMerge XMB format tests', () => {
    /**
     * Workdir, not in git.
     * Cleaned up for every test.
     * Tests, that work on files, copy everything they need into this directory.
     */
    const WORKDIR = 'test/work/';
    const SRCDIR = 'test/testdata/i18n/';
    const ENCODING = 'UTF-8';
    /**
     * Helper function to read Xmb from File
     */
    function readXmb(path) {
        return translation_messages_file_reader_1.TranslationMessagesFileReader.fromFile('xmb', path, ENCODING);
    }
    /**
     * Helper function to read Xtb from 2 Files, the xtb and the master xmb file
     */
    function readXtbWithMaster(path, masterPath) {
        return translation_messages_file_reader_1.TranslationMessagesFileReader.fromFile('xtb', path, ENCODING, masterPath);
    }
    describe('Merge process checks for format xmb', () => {
        const MASTER1FILE = 'ngExtractedMaster1.xmb';
        const MASTER2FILE = 'ngExtractedMaster2.xmb';
        const MASTER1SRC = SRCDIR + MASTER1FILE;
        const MASTER2SRC = SRCDIR + MASTER2FILE;
        const MASTERFILE = 'messages.xmb';
        const MASTER = WORKDIR + MASTERFILE;
        const ID_TRANSLATED_MYFIRST = '2047558209369508311'; // an ID from ngExtractedMaster1.xlf
        const ID_REMOVED_DESCRIPTION = '7499557905529977371'; // an ID that will be removed in master2
        const ID_REMOVED_DESCRIPTION2 = '3274258156935474372'; // another removed ID
        const ID_ADDED = '8998006760999956868'; // an ID that will be added in master2
        const ID_WITH_PLACEHOLDER = '9030312858648510700';
        beforeEach(() => {
            if (!fs.existsSync(WORKDIR)) {
                fs.mkdirSync(WORKDIR);
            }
            // cleanup workdir
            file_util_1.FileUtil.deleteFolderContentRecursive(WORKDIR);
        });
        it('should generate translated file for default language de from xmb master', (done) => {
            file_util_1.FileUtil.copy(MASTER1SRC, MASTER);
            const ws = new writer_to_string_1.WriterToString();
            const commandOut = new command_output_1.CommandOutput(ws);
            const profileContent = {
                xliffmergeOptions: {
                    defaultLanguage: 'de',
                    srcDir: WORKDIR,
                    genDir: WORKDIR,
                    i18nFile: MASTERFILE,
                    i18nFormat: 'xmb'
                }
            };
            const xliffMergeCmd = xliff_merge_1.XliffMerge.createFromOptions(commandOut, { languages: ['de'] }, profileContent);
            xliffMergeCmd.run();
            expect(ws.writtenData()).not.toContain('ERROR');
            const langFile = readXtbWithMaster(xliffMergeCmd.generatedI18nFile('de'), MASTER);
            expect(langFile.sourceLanguage()).toBeFalsy(); // not supported in xmb
            expect(langFile.targetLanguage()).toBe('de');
            langFile.forEachTransUnit((tu) => {
                expect(tu.targetContent()).toBe(tu.sourceContent());
                expect(tu.targetState()).toBe(ngx_i18nsupport_lib_1.STATE_NEW);
            });
            done();
        });
        it('should generate translated file for all languages using format xmb', (done) => {
            file_util_1.FileUtil.copy(MASTER1SRC, MASTER);
            const ws = new writer_to_string_1.WriterToString();
            const commandOut = new command_output_1.CommandOutput(ws);
            const profileContent = {
                xliffmergeOptions: {
                    defaultLanguage: 'de',
                    srcDir: WORKDIR,
                    genDir: WORKDIR,
                    i18nFile: MASTERFILE,
                    i18nFormat: 'xmb'
                }
            };
            const xliffMergeCmd = xliff_merge_1.XliffMerge.createFromOptions(commandOut, { languages: ['de', 'en'] }, profileContent);
            xliffMergeCmd.run();
            expect(ws.writtenData()).not.toContain('ERROR');
            const langFileGerman = readXtbWithMaster(xliffMergeCmd.generatedI18nFile('de'), MASTER);
            langFileGerman.forEachTransUnit((tu) => {
                expect(tu.targetContent()).toBe(tu.sourceContent());
            });
            const langFileEnglish = readXtbWithMaster(xliffMergeCmd.generatedI18nFile('en'), MASTER);
            langFileEnglish.forEachTransUnit((tu) => {
                expect(tu.targetContent()).toBe(tu.sourceContent());
            });
            done();
        });
        it('should generate translated file for all languages with empty targets for non default languages', (done) => {
            file_util_1.FileUtil.copy(MASTER1SRC, MASTER);
            const ws = new writer_to_string_1.WriterToString();
            const commandOut = new command_output_1.CommandOutput(ws);
            const profileContent = {
                xliffmergeOptions: {
                    defaultLanguage: 'de',
                    srcDir: WORKDIR,
                    genDir: WORKDIR,
                    i18nFile: MASTERFILE,
                    i18nFormat: 'xmb',
                    useSourceAsTarget: false
                }
            };
            const xliffMergeCmd = xliff_merge_1.XliffMerge.createFromOptions(commandOut, { languages: ['de', 'en'] }, profileContent);
            xliffMergeCmd.run();
            expect(ws.writtenData()).not.toContain('ERROR');
            const langFileGerman = readXtbWithMaster(xliffMergeCmd.generatedI18nFile('de'), MASTER);
            langFileGerman.forEachTransUnit((tu) => {
                // useSourceAsTarget = false, but this is the default language which will always contain translation!
                expect(tu.targetContent()).toBe(tu.sourceContent());
            });
            const langFileEnglish = readXtbWithMaster(xliffMergeCmd.generatedI18nFile('en'), MASTER);
            langFileEnglish.forEachTransUnit((tu) => {
                // since useSourceAsTarget = false, there should be no translation!
                expect(tu.targetContent()).toBe('');
                expect(tu.targetState()).toBe('new');
            });
            done();
        });
        it('should generate translated file for all languages with set praefix and suffix (#70)', (done) => {
            file_util_1.FileUtil.copy(MASTER1SRC, MASTER);
            const ws = new writer_to_string_1.WriterToString();
            const commandOut = new command_output_1.CommandOutput(ws);
            const profileContent = {
                xliffmergeOptions: {
                    defaultLanguage: 'de',
                    srcDir: WORKDIR,
                    genDir: WORKDIR,
                    i18nFormat: 'xmb',
                    i18nFile: MASTERFILE,
                    targetPraefix: '%%',
                    targetSuffix: '!!',
                }
            };
            const xliffMergeCmd = xliff_merge_1.XliffMerge.createFromOptions(commandOut, { languages: ['de', 'en'] }, profileContent);
            xliffMergeCmd.run();
            expect(ws.writtenData()).not.toContain('ERROR');
            const langFileGerman = readXtbWithMaster(xliffMergeCmd.generatedI18nFile('de'), MASTER);
            langFileGerman.forEachTransUnit((tu) => {
                if (!tu.targetContent().startsWith('{VAR')) {
                    expect(tu.targetContent()).toBe('%%' + tu.sourceContent() + '!!');
                }
                else {
                    expect(tu.targetContent()).toBe(tu.sourceContent());
                }
            });
            const langFileEnglish = readXtbWithMaster(xliffMergeCmd.generatedI18nFile('en'), MASTER);
            langFileEnglish.forEachTransUnit((tu) => {
                if (!tu.targetContent().startsWith('{VAR')) {
                    expect(tu.targetContent()).toBe('%%' + tu.sourceContent() + '!!');
                }
                else {
                    expect(tu.targetContent()).toBe(tu.sourceContent());
                }
            });
            done();
        });
        it('should merge translated file for all languages using format xmb', (done) => {
            file_util_1.FileUtil.copy(MASTER1SRC, MASTER);
            let ws = new writer_to_string_1.WriterToString();
            let commandOut = new command_output_1.CommandOutput(ws);
            const profileContent = {
                xliffmergeOptions: {
                    defaultLanguage: 'de',
                    srcDir: WORKDIR,
                    genDir: WORKDIR,
                    i18nFile: MASTERFILE,
                    i18nFormat: 'xmb'
                }
            };
            let xliffMergeCmd = xliff_merge_1.XliffMerge.createFromOptions(commandOut, { languages: ['de', 'en'] }, profileContent);
            xliffMergeCmd.run();
            expect(ws.writtenData()).not.toContain('ERROR');
            // now translate some texts in the English version
            let langFileEnglish = readXtbWithMaster(xliffMergeCmd.generatedI18nFile('en'), MASTER);
            const tu = langFileEnglish.transUnitWithId(ID_TRANSLATED_MYFIRST);
            expect(tu).toBeTruthy();
            tu.translate('My first app');
            translation_messages_file_reader_1.TranslationMessagesFileReader.save(langFileEnglish);
            // next step, use another master
            file_util_1.FileUtil.copy(MASTER2SRC, MASTER);
            ws = new writer_to_string_1.WriterToString();
            commandOut = new command_output_1.CommandOutput(ws);
            xliffMergeCmd = xliff_merge_1.XliffMerge.createFromOptions(commandOut, { languages: ['de', 'en'] }, profileContent);
            xliffMergeCmd.run();
            expect(ws.writtenData()).not.toContain('ERROR');
            expect(ws.writtenData()).toContain('merged 1 trans-units from master to "en"');
            expect(ws.writtenData()).toContain('removed 2 unused trans-units in "en"');
            expect(ws.writtenData()).not.toContain('WARNING: transferred');
            // look, that the new file contains the old translation
            langFileEnglish = readXtbWithMaster(xliffMergeCmd.generatedI18nFile('en'), MASTER);
            expect(langFileEnglish.transUnitWithId(ID_TRANSLATED_MYFIRST).targetContent()).toBe('My first app');
            // look, that the new file contains the new translation
            expect(langFileEnglish.transUnitWithId(ID_ADDED)).toBeTruthy();
            // look, that the removed IDs are really removed.
            expect(langFileEnglish.transUnitWithId(ID_REMOVED_DESCRIPTION)).toBeFalsy();
            expect(langFileEnglish.transUnitWithId(ID_REMOVED_DESCRIPTION2)).toBeFalsy();
            done();
        });
        it('should preserve order when merging new units (#96)', (done) => {
            file_util_1.FileUtil.copy(SRCDIR + 'preserveOrderMaster1.xmb', MASTER);
            let ws = new writer_to_string_1.WriterToString();
            let commandOut = new command_output_1.CommandOutput(ws);
            const profileContent = {
                xliffmergeOptions: {
                    defaultLanguage: 'en',
                    srcDir: WORKDIR,
                    genDir: WORKDIR,
                    i18nFormat: 'xmb',
                    i18nFile: MASTERFILE
                }
            };
            let xliffMergeCmd = xliff_merge_1.XliffMerge.createFromOptions(commandOut, { languages: ['en', 'de'] }, profileContent);
            xliffMergeCmd.run();
            expect(ws.writtenData()).not.toContain('ERROR');
            // next step, use new master that has added 3 units
            file_util_1.FileUtil.copy(SRCDIR + 'preserveOrderMaster2.xmb', MASTER);
            ws = new writer_to_string_1.WriterToString();
            commandOut = new command_output_1.CommandOutput(ws);
            xliffMergeCmd = xliff_merge_1.XliffMerge.createFromOptions(commandOut, { languages: ['en', 'de'] }, profileContent);
            xliffMergeCmd.run();
            expect(ws.writtenData()).not.toContain('ERROR');
            expect(ws.writtenData()).toContain('merged 3 trans-units from master to "de"');
            // look, that the new file contains the new units at the correct position
            const langFileGerman = readXtbWithMaster(xliffMergeCmd.generatedI18nFile('de'));
            const addedTu = langFileGerman.transUnitWithId('addedunit1');
            expect(addedTu).toBeTruthy();
            expect(addedTu.targetContent()).toBe('added unit 1');
            // check position
            expect(langFileGerman.editedContent().replace(/(\r\n|\n|\r)/gm, ''))
                .toMatch(/addedunit1.*firstunit.*addedunit2.*lastunit.*addedunit3/);
            done();
        });
        it('should not preserve order when merging new units when disabled via config (#108)', (done) => {
            file_util_1.FileUtil.copy(SRCDIR + 'preserveOrderMaster1.xmb', MASTER);
            let ws = new writer_to_string_1.WriterToString();
            let commandOut = new command_output_1.CommandOutput(ws);
            const profileContent = {
                xliffmergeOptions: {
                    defaultLanguage: 'en',
                    srcDir: WORKDIR,
                    genDir: WORKDIR,
                    i18nFormat: 'xmb',
                    i18nFile: MASTERFILE,
                    preserveOrder: false
                }
            };
            let xliffMergeCmd = xliff_merge_1.XliffMerge.createFromOptions(commandOut, { languages: ['en', 'de'] }, profileContent);
            xliffMergeCmd.run();
            expect(ws.writtenData()).not.toContain('ERROR');
            // next step, use new master that has added 3 units
            file_util_1.FileUtil.copy(SRCDIR + 'preserveOrderMaster2.xmb', MASTER);
            ws = new writer_to_string_1.WriterToString();
            commandOut = new command_output_1.CommandOutput(ws);
            xliffMergeCmd = xliff_merge_1.XliffMerge.createFromOptions(commandOut, { languages: ['en', 'de'] }, profileContent);
            xliffMergeCmd.run();
            expect(ws.writtenData()).not.toContain('ERROR');
            expect(ws.writtenData()).toContain('merged 3 trans-units from master to "de"');
            // look, that the new file contains the new units at the correct position
            const langFileGerman = readXtbWithMaster(xliffMergeCmd.generatedI18nFile('de'));
            const addedTu = langFileGerman.transUnitWithId('addedunit1');
            expect(addedTu).toBeTruthy();
            expect(addedTu.targetContent()).toBe('added unit 1');
            // check position, new units should be at end!
            expect(langFileGerman.editedContent().replace(/(\r\n|\n|\r)/gm, ''))
                .toMatch(/firstunit.*lastunit.*addedunit1.*addedunit2.*addedunit3/);
            done();
        });
        it('should not remove trailing line break when merging', (done) => {
            file_util_1.FileUtil.copy(MASTER1SRC, MASTER);
            const masterContent = file_util_1.FileUtil.read(MASTER, xml_reader_1.XmlReader.DEFAULT_ENCODING);
            expect(masterContent.endsWith('\n')).toBeTruthy('master file should end with EOL');
            const ws = new writer_to_string_1.WriterToString();
            const commandOut = new command_output_1.CommandOutput(ws);
            const profileContent = {
                xliffmergeOptions: {
                    defaultLanguage: 'de',
                    srcDir: WORKDIR,
                    genDir: WORKDIR,
                    i18nFormat: 'xmb',
                    i18nFile: MASTERFILE
                }
            };
            const xliffMergeCmd = xliff_merge_1.XliffMerge.createFromOptions(commandOut, { languages: ['de', 'en'] }, profileContent);
            xliffMergeCmd.run();
            expect(ws.writtenData()).not.toContain('ERROR');
            const newContent = file_util_1.FileUtil.read(xliffMergeCmd.generatedI18nFile('de'), xml_reader_1.XmlReader.DEFAULT_ENCODING);
            expect(newContent.endsWith('\n')).toBeTruthy('file should end with EOL');
            done();
        });
        // noinspection TsLint
        it('should translate messages with placeholder in format xmb', (done) => {
            file_util_1.FileUtil.copy(MASTER2SRC, MASTER);
            const ws = new writer_to_string_1.WriterToString();
            const commandOut = new command_output_1.CommandOutput(ws);
            const profileContent = {
                xliffmergeOptions: {
                    defaultLanguage: 'de',
                    srcDir: WORKDIR,
                    genDir: WORKDIR,
                    i18nFile: MASTERFILE,
                    i18nFormat: 'xmb'
                }
            };
            const xliffMergeCmd = xliff_merge_1.XliffMerge.createFromOptions(commandOut, { languages: ['de', 'en'] }, profileContent);
            xliffMergeCmd.run();
            expect(ws.writtenData()).not.toContain('ERROR');
            // now translate some texts in the English version
            let langFileEnglish = readXtbWithMaster(xliffMergeCmd.generatedI18nFile('en'), MASTER);
            const tu = langFileEnglish.transUnitWithId(ID_WITH_PLACEHOLDER);
            expect(tu).toBeTruthy();
            tu.translate('Item <ph name="INTERPOLATION"><ex>INTERPOLATION</ex></ph> of <ph name="INTERPOLATION_1"><ex>INTERPOLATION_1</ex></ph> added.');
            translation_messages_file_reader_1.TranslationMessagesFileReader.save(langFileEnglish);
            // look, that the new file contains the translation
            langFileEnglish = readXtbWithMaster(xliffMergeCmd.generatedI18nFile('en'), MASTER);
            // noinspection TsLint
            expect(langFileEnglish.transUnitWithId(ID_WITH_PLACEHOLDER).targetContent())
                .toBe('Item <ph name="INTERPOLATION"><ex>INTERPOLATION</ex></ph> of <ph name="INTERPOLATION_1"><ex>INTERPOLATION_1</ex></ph> added.');
            done();
        });
        it('should return status new for all trans units using format xmb with master file', (done) => {
            file_util_1.FileUtil.copy(MASTER1SRC, MASTER);
            const ws = new writer_to_string_1.WriterToString();
            const commandOut = new command_output_1.CommandOutput(ws);
            const profileContent = {
                xliffmergeOptions: {
                    defaultLanguage: 'de',
                    srcDir: WORKDIR,
                    genDir: WORKDIR,
                    i18nFile: MASTERFILE,
                    i18nFormat: 'xmb'
                }
            };
            const xliffMergeCmd = xliff_merge_1.XliffMerge.createFromOptions(commandOut, { languages: ['de', 'en'] }, profileContent);
            xliffMergeCmd.run();
            expect(ws.writtenData()).not.toContain('ERROR');
            const langFileEnglish = readXtbWithMaster(xliffMergeCmd.generatedI18nFile('en'), MASTER);
            langFileEnglish.forEachTransUnit((tu) => {
                expect(tu.targetState()).toBe('new');
            });
            done();
        });
        it('should return status final for a translated trans unit using format xmb with master file', (done) => {
            file_util_1.FileUtil.copy(MASTER1SRC, MASTER);
            const ws = new writer_to_string_1.WriterToString();
            const commandOut = new command_output_1.CommandOutput(ws);
            const profileContent = {
                xliffmergeOptions: {
                    defaultLanguage: 'de',
                    srcDir: WORKDIR,
                    genDir: WORKDIR,
                    i18nFile: MASTERFILE,
                    i18nFormat: 'xmb'
                }
            };
            const xliffMergeCmd = xliff_merge_1.XliffMerge.createFromOptions(commandOut, { languages: ['de', 'en'] }, profileContent);
            xliffMergeCmd.run();
            expect(ws.writtenData()).not.toContain('ERROR');
            const langFileEnglish = readXtbWithMaster(xliffMergeCmd.generatedI18nFile('en'), MASTER);
            // now translate some texts in the English version
            const tu = langFileEnglish.transUnitWithId(ID_TRANSLATED_MYFIRST);
            expect(tu).toBeTruthy();
            expect(tu.sourceContent()).toBe('Meine erste I18N-Anwendung');
            expect(tu.targetState()).toBe('new');
            tu.translate('my first i18n application');
            expect(tu.targetState()).toBe('final');
            done();
        });
    });
    describe('ngx-translate processing for format xmb', () => {
        const MASTER1FILE = 'ngxtranslate.xmb';
        const MASTER1SRC = SRCDIR + MASTER1FILE;
        const MASTER_WITHOUT_NGX_TRANSLATE_STUFF = SRCDIR + 'ngExtractedMaster1.xmb';
        const MASTERFILE = 'messages.xmb';
        const MASTER = WORKDIR + MASTERFILE;
        const ID_NODESC_NOMEANING = '2047558209369508311'; // an ID without set meaning and description
        const ID_MONDAY = '6830980354990918030'; // an ID from ngxtranslate.xmb with meaning "x.y" and description "ngx-translate"
        beforeEach(() => {
            if (!fs.existsSync(WORKDIR)) {
                fs.mkdirSync(WORKDIR);
            }
            // cleanup workdir
            file_util_1.FileUtil.deleteFolderContentRecursive(WORKDIR);
        });
        it('should return null for unset description and meaning in master xmb file', (done) => {
            file_util_1.FileUtil.copy(MASTER1SRC, MASTER);
            const master = readXmb(MASTER);
            expect(master.transUnitWithId(ID_NODESC_NOMEANING).description()).toBeFalsy();
            expect(master.transUnitWithId(ID_NODESC_NOMEANING).meaning()).toBeFalsy();
            done();
        });
        it('should find description and meaning in master  xmb file', (done) => {
            file_util_1.FileUtil.copy(MASTER1SRC, MASTER);
            const master = readXmb(MASTER);
            expect(master.transUnitWithId(ID_MONDAY).description()).toBe('ngx-translate');
            expect(master.transUnitWithId(ID_MONDAY).meaning()).toBe('dateservice.monday');
            done();
        });
        it('should find description and meaning in translated xmb file', (done) => {
            file_util_1.FileUtil.copy(MASTER1SRC, MASTER);
            const ws = new writer_to_string_1.WriterToString();
            const commandOut = new command_output_1.CommandOutput(ws);
            const profileContent = {
                xliffmergeOptions: {
                    defaultLanguage: 'de',
                    srcDir: WORKDIR,
                    genDir: WORKDIR,
                    i18nFile: MASTERFILE,
                    i18nFormat: 'xmb'
                }
            };
            const xliffMergeCmd = xliff_merge_1.XliffMerge.createFromOptions(commandOut, { languages: ['de'] }, profileContent);
            xliffMergeCmd.run();
            expect(ws.writtenData()).not.toContain('ERROR');
            const langFile = readXtbWithMaster(xliffMergeCmd.generatedI18nFile('de'), MASTER);
            expect(langFile.transUnitWithId(ID_MONDAY).description()).toBe('ngx-translate');
            expect(langFile.transUnitWithId(ID_MONDAY).meaning()).toBe('dateservice.monday');
            done();
        });
        it('should write translation json file for ngx-translate', (done) => {
            file_util_1.FileUtil.copy(MASTER1SRC, MASTER);
            const ws = new writer_to_string_1.WriterToString();
            const commandOut = new command_output_1.CommandOutput(ws);
            const profileContent = {
                xliffmergeOptions: {
                    defaultLanguage: 'de',
                    srcDir: WORKDIR,
                    genDir: WORKDIR,
                    i18nFile: MASTERFILE,
                    i18nFormat: 'xmb',
                    supportNgxTranslate: true
                }
            };
            const xliffMergeCmd = xliff_merge_1.XliffMerge.createFromOptions(commandOut, { languages: ['de'] }, profileContent);
            xliffMergeCmd.run();
            expect(ws.writtenData()).not.toContain('ERROR');
            const translationJsonFilename = xliffMergeCmd.generatedNgxTranslateFile('de');
            expect(file_util_1.FileUtil.exists(translationJsonFilename)).toBeTruthy();
            const fileContent = file_util_1.FileUtil.read(translationJsonFilename, 'UTF-8');
            const translation = JSON.parse(fileContent);
            expect(translation).toBeTruthy();
            expect(translation.myapp).toBeTruthy();
            expect(translation.dateservice.monday).toBe('Montag');
            expect(translation.dateservice.friday).toBe('Freitag');
            expect(translation.explicitlysetids.test1).toBe('Explizit gesetzte ID');
            expect(Object.keys(translation).length).toBe(5);
            done();
        });
        it('should handle placeholders in json file for ngx-translate', (done) => {
            file_util_1.FileUtil.copy(MASTER1SRC, MASTER);
            const ws = new writer_to_string_1.WriterToString();
            const commandOut = new command_output_1.CommandOutput(ws);
            const profileContent = {
                xliffmergeOptions: {
                    defaultLanguage: 'de',
                    srcDir: WORKDIR,
                    genDir: WORKDIR,
                    i18nFile: MASTERFILE,
                    i18nFormat: 'xmb',
                    supportNgxTranslate: true
                }
            };
            const xliffMergeCmd = xliff_merge_1.XliffMerge.createFromOptions(commandOut, { languages: ['de'] }, profileContent);
            xliffMergeCmd.run();
            expect(ws.writtenData()).not.toContain('ERROR');
            const translationJsonFilename = xliffMergeCmd.generatedNgxTranslateFile('de');
            expect(file_util_1.FileUtil.exists(translationJsonFilename)).toBeTruthy();
            const fileContent = file_util_1.FileUtil.read(translationJsonFilename, 'UTF-8');
            const translation = JSON.parse(fileContent);
            expect(translation).toBeTruthy();
            expect(translation.placeholders).toBeTruthy();
            expect(translation.placeholders.test1placeholder).toBe('{{0}}: Eine Nachricht mit einem Platzhalter');
            expect(translation.placeholders.test2placeholder).toBe('{{0}}: Eine Nachricht mit 2 Platzhaltern: {{1}}');
            expect(translation.placeholders.test2placeholderRepeated).toBe('{{0}}: Eine Nachricht mit 2 Platzhaltern: {{0}} {{1}}');
            done();
        });
        it('should handle embedded html markup in json file for ngx-translate', (done) => {
            file_util_1.FileUtil.copy(MASTER1SRC, MASTER);
            const ws = new writer_to_string_1.WriterToString();
            const commandOut = new command_output_1.CommandOutput(ws);
            const profileContent = {
                xliffmergeOptions: {
                    defaultLanguage: 'de',
                    srcDir: WORKDIR,
                    genDir: WORKDIR,
                    i18nFile: MASTERFILE,
                    i18nFormat: 'xmb',
                    supportNgxTranslate: true
                }
            };
            const xliffMergeCmd = xliff_merge_1.XliffMerge.createFromOptions(commandOut, { languages: ['de'] }, profileContent);
            xliffMergeCmd.run();
            expect(ws.writtenData()).not.toContain('ERROR');
            const translationJsonFilename = xliffMergeCmd.generatedNgxTranslateFile('de');
            expect(file_util_1.FileUtil.exists(translationJsonFilename)).toBeTruthy();
            const fileContent = file_util_1.FileUtil.read(translationJsonFilename, 'UTF-8');
            const translation = JSON.parse(fileContent);
            expect(translation).toBeTruthy();
            expect(translation.embeddedhtml).toBeTruthy();
            expect(translation.embeddedhtml.bold).toBe('Diese Nachricht ist <b>WICHTIG</b>');
            expect(translation.embeddedhtml.boldstrong).toBe('Diese Nachricht ist <b><strong>SEHR WICHTIG</strong></b>');
            expect(translation.embeddedhtml.strange).toBe('Diese Nachricht ist <strange>{{0}}</strange>');
            done();
        });
        it('should not write empty translation json file for ngx-translate, if there are no translation (issue #18)', (done) => {
            file_util_1.FileUtil.copy(MASTER_WITHOUT_NGX_TRANSLATE_STUFF, MASTER);
            const ws = new writer_to_string_1.WriterToString();
            const commandOut = new command_output_1.CommandOutput(ws);
            const profileContent = {
                xliffmergeOptions: {
                    defaultLanguage: 'de',
                    srcDir: WORKDIR,
                    genDir: WORKDIR,
                    i18nFile: MASTERFILE,
                    i18nFormat: 'xmb',
                    supportNgxTranslate: true
                }
            };
            const xliffMergeCmd = xliff_merge_1.XliffMerge.createFromOptions(commandOut, { languages: ['de'] }, profileContent);
            xliffMergeCmd.run();
            expect(ws.writtenData()).not.toContain('ERROR');
            const translationJsonFilename = xliffMergeCmd.generatedNgxTranslateFile('de');
            expect(file_util_1.FileUtil.exists(translationJsonFilename)).toBeFalsy();
            done();
        });
        it('should not export @@ids to translation json file, when this is supressed in pattern (issue #62)', (done) => {
            file_util_1.FileUtil.copy(MASTER1SRC, MASTER);
            const ws = new writer_to_string_1.WriterToString();
            const commandOut = new command_output_1.CommandOutput(ws);
            const profileContent = {
                xliffmergeOptions: {
                    defaultLanguage: 'de',
                    srcDir: WORKDIR,
                    genDir: WORKDIR,
                    i18nFormat: 'xmb',
                    i18nFile: MASTERFILE,
                    supportNgxTranslate: true,
                    ngxTranslateExtractionPattern: 'ngx-translate'
                }
            };
            const xliffMergeCmd = xliff_merge_1.XliffMerge.createFromOptions(commandOut, { languages: ['de'] }, profileContent);
            xliffMergeCmd.run();
            expect(ws.writtenData()).not.toContain('ERROR');
            const translationJsonFilename = xliffMergeCmd.generatedNgxTranslateFile('de');
            expect(file_util_1.FileUtil.exists(translationJsonFilename)).toBeTruthy();
            const fileContent = file_util_1.FileUtil.read(translationJsonFilename, 'UTF-8');
            const translation = JSON.parse(fileContent);
            expect(translation).toBeTruthy();
            expect(translation.dateservice.monday).toBe('Montag');
            expect(translation.explicitlysetids).toBeFalsy();
            expect(translation['alt-ngx-translate']).toBeFalsy();
            done();
        });
        it('should export other then ngx-translate description marked entries to translation json file,' +
            ' when this is specified in pattern (issue #62)', (done) => {
            file_util_1.FileUtil.copy(MASTER1SRC, MASTER);
            const ws = new writer_to_string_1.WriterToString();
            const commandOut = new command_output_1.CommandOutput(ws);
            const profileContent = {
                xliffmergeOptions: {
                    defaultLanguage: 'de',
                    srcDir: WORKDIR,
                    genDir: WORKDIR,
                    i18nFormat: 'xmb',
                    i18nFile: MASTERFILE,
                    supportNgxTranslate: true,
                    ngxTranslateExtractionPattern: 'ngx-translate|alt-ngx-translate'
                }
            };
            const xliffMergeCmd = xliff_merge_1.XliffMerge.createFromOptions(commandOut, { languages: ['de'] }, profileContent);
            xliffMergeCmd.run();
            expect(ws.writtenData()).not.toContain('ERROR');
            const translationJsonFilename = xliffMergeCmd.generatedNgxTranslateFile('de');
            expect(file_util_1.FileUtil.exists(translationJsonFilename)).toBeTruthy();
            const fileContent = file_util_1.FileUtil.read(translationJsonFilename, 'UTF-8');
            const translation = JSON.parse(fileContent);
            expect(translation).toBeTruthy();
            expect(translation.dateservice.monday).toBe('Montag');
            expect(translation.explicitlysetids).toBeFalsy();
            expect(translation['alt-ngx-translate'].example1).toBe('Alternate description for ngx-translate export');
            done();
        });
    });
});
//# sourceMappingURL=xmb-merge.spec.js.map