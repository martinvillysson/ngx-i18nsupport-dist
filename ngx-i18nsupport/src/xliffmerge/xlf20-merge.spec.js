"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fs = require("fs");
const xliff_merge_1 = require("./xliff-merge");
const command_output_1 = require("../common/command-output");
const writer_to_string_1 = require("../common/writer-to-string");
const file_util_1 = require("../common/file-util");
const ngx_i18nsupport_lib_1 = require("@ngx-i18nsupport/ngx-i18nsupport-lib");
const translation_messages_file_reader_1 = require("./translation-messages-file-reader");
const auto_translate_service_spec_1 = require("../autotranslate/auto-translate-service.spec");
const xml_reader_1 = require("./xml-reader");
/**
 * Created by martin on 18.02.2017.
 * Testcases for XliffMerge Format XLIFF 2.0.
 */
describe('XliffMerge XLIFF 2.0 format tests', () => {
    /**
     * Workdir, not in git.
     * Cleaned up for every test.
     * Tests, that work on files, copy everything they need into this directory.
     */
    const WORKDIR = 'test/work/';
    const SRCDIR = 'test/testdata/i18n/';
    const ENCODING = 'UTF-8';
    /**
     * Helper function to read XLIFF 2.0 from File
     */
    function readXliff2(path) {
        return translation_messages_file_reader_1.TranslationMessagesFileReader.fromFile('xlf2', path, ENCODING);
    }
    describe('Merge process checks for format XLIFF 2.0', () => {
        const MASTER1FILE = 'ngExtractedMaster1.xlf2';
        const MASTER2FILE = 'ngExtractedMaster2.xlf2';
        const MASTER1SRC = SRCDIR + MASTER1FILE;
        const MASTER2SRC = SRCDIR + MASTER2FILE;
        const MASTERFILE = 'messages.xlf2';
        const MASTER = WORKDIR + MASTERFILE;
        const ID_APP_RUNS = '4371668001355139802'; // an ID from ngExtractedMaster1.xlf
        const ID_REMOVED_MYFIRST = '2047558209369508311'; // an ID that will be removed in master2
        const ID_REMOVED_APPDESCRIPTION = '7499557905529977371'; // another removed ID
        const ID_WITH_PLACEHOLDER = '9030312858648510700';
        const ID_DESCRIPTION_CHANGE = 'DescriptionAndMeaning1';
        const ID_DESCRIPTION_ADD = 'AddDescriptionAndMeaning';
        const ID_DESCRIPTION_REMOVE = 'RemoveDescriptionAndMeaning';
        beforeEach(() => {
            if (!fs.existsSync(WORKDIR)) {
                fs.mkdirSync(WORKDIR);
            }
            // cleanup workdir
            file_util_1.FileUtil.deleteFolderContentRecursive(WORKDIR);
        });
        it('should fix source language, if the masters lang is not the default', (done) => {
            file_util_1.FileUtil.copy(MASTER1SRC, MASTER);
            const master = readXliff2(MASTER);
            expect(master.sourceLanguage()).toBe('en'); // master is german, but ng-18n extracts it as en
            const ws = new writer_to_string_1.WriterToString();
            const commandOut = new command_output_1.CommandOutput(ws);
            const profileContent = {
                xliffmergeOptions: {
                    defaultLanguage: 'de',
                    srcDir: WORKDIR,
                    genDir: WORKDIR,
                    i18nFormat: 'xlf2',
                    i18nFile: MASTERFILE,
                }
            };
            const xliffMergeCmd = xliff_merge_1.XliffMerge.createFromOptions(commandOut, { languages: ['de'] }, profileContent);
            xliffMergeCmd.run();
            expect(ws.writtenData()).not.toContain('ERROR');
            expect(ws.writtenData()).toContain('master says to have source-language="en"');
            expect(ws.writtenData()).toContain('changed master source-language="en" to "de"');
            const newmaster = readXliff2(MASTER);
            expect(newmaster.sourceLanguage()).toBe('de'); // master is german
            done();
        });
        it('should generate translated file for default language de from master', (done) => {
            file_util_1.FileUtil.copy(MASTER1SRC, MASTER);
            const ws = new writer_to_string_1.WriterToString();
            const commandOut = new command_output_1.CommandOutput(ws);
            const profileContent = {
                xliffmergeOptions: {
                    defaultLanguage: 'de',
                    srcDir: WORKDIR,
                    genDir: WORKDIR,
                    i18nFormat: 'xlf2',
                    i18nFile: MASTERFILE,
                    useSourceAsTarget: false
                }
            };
            const xliffMergeCmd = xliff_merge_1.XliffMerge.createFromOptions(commandOut, { languages: ['de'] }, profileContent);
            xliffMergeCmd.run();
            expect(ws.writtenData()).not.toContain('ERROR');
            const langFile = readXliff2(xliffMergeCmd.generatedI18nFile('de'));
            expect(langFile.sourceLanguage()).toBe('de');
            expect(langFile.targetLanguage()).toBe('de');
            langFile.forEachTransUnit((tu) => {
                expect(tu.targetContent()).toBe(tu.sourceContent());
                expect(tu.targetState()).toBe('final');
            });
            done();
        });
        it('should generate translated file for all languages', (done) => {
            file_util_1.FileUtil.copy(MASTER1SRC, MASTER);
            const ws = new writer_to_string_1.WriterToString();
            const commandOut = new command_output_1.CommandOutput(ws);
            const profileContent = {
                xliffmergeOptions: {
                    defaultLanguage: 'de',
                    srcDir: WORKDIR,
                    genDir: WORKDIR,
                    i18nFormat: 'xlf2',
                    i18nFile: MASTERFILE
                }
            };
            const xliffMergeCmd = xliff_merge_1.XliffMerge.createFromOptions(commandOut, { languages: ['de', 'en'] }, profileContent);
            xliffMergeCmd.run();
            expect(ws.writtenData()).not.toContain('ERROR');
            const langFileGerman = readXliff2(xliffMergeCmd.generatedI18nFile('de'));
            expect(langFileGerman.sourceLanguage()).toBe('de');
            expect(langFileGerman.targetLanguage()).toBe('de');
            langFileGerman.forEachTransUnit((tu) => {
                expect(tu.targetContent()).toBe(tu.sourceContent());
                expect(tu.targetState()).toBe('final');
            });
            const langFileEnglish = readXliff2(xliffMergeCmd.generatedI18nFile('en'));
            expect(langFileEnglish.sourceLanguage()).toBe('de');
            expect(langFileEnglish.targetLanguage()).toBe('en');
            langFileEnglish.forEachTransUnit((tu) => {
                expect(tu.targetContent()).toBe(tu.sourceContent());
                expect(tu.targetState()).toBe('new');
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
                    i18nFormat: 'xlf2',
                    i18nFile: MASTERFILE,
                    useSourceAsTarget: false
                }
            };
            const xliffMergeCmd = xliff_merge_1.XliffMerge.createFromOptions(commandOut, { languages: ['de', 'en'] }, profileContent);
            xliffMergeCmd.run();
            expect(ws.writtenData()).not.toContain('ERROR');
            const langFileGerman = readXliff2(xliffMergeCmd.generatedI18nFile('de'));
            expect(langFileGerman.sourceLanguage()).toBe('de');
            expect(langFileGerman.targetLanguage()).toBe('de');
            langFileGerman.forEachTransUnit((tu) => {
                expect(tu.targetContent()).toBe(tu.sourceContent());
                expect(tu.targetState()).toBe('final');
            });
            const langFileEnglish = readXliff2(xliffMergeCmd.generatedI18nFile('en'));
            expect(langFileEnglish.sourceLanguage()).toBe('de');
            expect(langFileEnglish.targetLanguage()).toBe('en');
            langFileEnglish.forEachTransUnit((tu) => {
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
                    i18nFormat: 'xlf2',
                    i18nFile: MASTERFILE,
                    targetPraefix: '%%',
                    targetSuffix: '!!',
                }
            };
            const xliffMergeCmd = xliff_merge_1.XliffMerge.createFromOptions(commandOut, { languages: ['de', 'en'] }, profileContent);
            xliffMergeCmd.run();
            expect(ws.writtenData()).not.toContain('ERROR');
            const langFileGerman = readXliff2(xliffMergeCmd.generatedI18nFile('de'));
            expect(langFileGerman.sourceLanguage()).toBe('de');
            expect(langFileGerman.targetLanguage()).toBe('de');
            langFileGerman.forEachTransUnit((tu) => {
                if (!tu.targetContent().startsWith('{VAR')) {
                    expect(tu.targetContent()).toBe('%%' + tu.sourceContent() + '!!');
                }
                else {
                    expect(tu.targetContent()).toBe(tu.sourceContent());
                }
                expect(tu.targetState()).toBe('final');
            });
            const langFileEnglish = readXliff2(xliffMergeCmd.generatedI18nFile('en'));
            expect(langFileEnglish.sourceLanguage()).toBe('de');
            expect(langFileEnglish.targetLanguage()).toBe('en');
            langFileEnglish.forEachTransUnit((tu) => {
                if (!tu.targetContent().startsWith('{VAR')) {
                    expect(tu.targetContent()).toBe('%%' + tu.sourceContent() + '!!');
                }
                else {
                    expect(tu.targetContent()).toBe(tu.sourceContent());
                }
                expect(tu.targetState()).toBe('new');
            });
            done();
        });
        it('should generate translated file with native trans unit status "initial", testcase for issue #57', (done) => {
            file_util_1.FileUtil.copy(MASTER1SRC, MASTER);
            const ws = new writer_to_string_1.WriterToString();
            const commandOut = new command_output_1.CommandOutput(ws);
            const profileContent = {
                xliffmergeOptions: {
                    defaultLanguage: 'de',
                    srcDir: WORKDIR,
                    genDir: WORKDIR,
                    i18nFormat: 'xlf2',
                    i18nFile: MASTERFILE,
                    useSourceAsTarget: false
                }
            };
            const xliffMergeCmd = xliff_merge_1.XliffMerge.createFromOptions(commandOut, { languages: ['de', 'en'] }, profileContent);
            xliffMergeCmd.run();
            expect(ws.writtenData()).not.toContain('ERROR');
            const langFileGerman = readXliff2(xliffMergeCmd.generatedI18nFile('de'));
            langFileGerman.forEachTransUnit((tu) => {
                // need a cast to <any> to call nativeTargetState, which is not part of the official API
                expect(tu.nativeTargetState()).toBe('final');
            });
            const langFileEnglish = readXliff2(xliffMergeCmd.generatedI18nFile('en'));
            langFileEnglish.forEachTransUnit((tu) => {
                // need a cast to <any> to call nativeTargetState, which is not part of the official API
                expect(tu.nativeTargetState()).toBe('initial'); // #56, state should be new, but in file we expect initial
            });
            done();
        });
        it('should merge translated file for all languages', (done) => {
            file_util_1.FileUtil.copy(MASTER1SRC, MASTER);
            let ws = new writer_to_string_1.WriterToString();
            let commandOut = new command_output_1.CommandOutput(ws);
            const profileContent = {
                xliffmergeOptions: {
                    defaultLanguage: 'de',
                    srcDir: WORKDIR,
                    genDir: WORKDIR,
                    i18nFormat: 'xlf2',
                    i18nFile: MASTERFILE
                }
            };
            let xliffMergeCmd = xliff_merge_1.XliffMerge.createFromOptions(commandOut, { languages: ['de', 'en'] }, profileContent);
            xliffMergeCmd.run();
            expect(ws.writtenData()).not.toContain('ERROR');
            // now translate some texts in the English version
            let langFileEnglish = readXliff2(xliffMergeCmd.generatedI18nFile('en'));
            const tu = langFileEnglish.transUnitWithId(ID_APP_RUNS);
            expect(tu).toBeTruthy();
            tu.translate('App runs');
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
            expect(ws.writtenData()).toContain('WARNING: transferred 1 source references');
            // look, that the new file contains the old translation
            langFileEnglish = readXliff2(xliffMergeCmd.generatedI18nFile('en'));
            expect(langFileEnglish.transUnitWithId(ID_APP_RUNS).targetContent()).toBe('App runs');
            // look, that the removed IDs are really removed.
            expect(langFileEnglish.transUnitWithId(ID_REMOVED_MYFIRST)).toBeFalsy();
            expect(langFileEnglish.transUnitWithId(ID_REMOVED_APPDESCRIPTION)).toBeFalsy();
            done();
        });
        it('should merge changed source content with explicit ID to default language file (#81)', (done) => {
            const ID_SOURCE_CHANGE = 'sourcechanged';
            const ID_SOURCE_CHANGE_STATE_FINAL = 'sourcechanged_state_final';
            const TRANSLATED_FILE = 'WithSourceContentChange.de.xlf2';
            file_util_1.FileUtil.copy(SRCDIR + 'ngExtractedMasterWithSourceContentChange.xlf2', MASTER);
            file_util_1.FileUtil.copy(SRCDIR + TRANSLATED_FILE, WORKDIR + 'messages.de.xlf');
            const ws = new writer_to_string_1.WriterToString();
            const commandOut = new command_output_1.CommandOutput(ws);
            const profileContent = {
                xliffmergeOptions: {
                    defaultLanguage: 'de',
                    srcDir: WORKDIR,
                    genDir: WORKDIR,
                    i18nFormat: 'xlf2',
                    i18nFile: MASTERFILE
                }
            };
            const xliffMergeCmd = xliff_merge_1.XliffMerge.createFromOptions(commandOut, { languages: ['de', 'en'], verbose: true }, profileContent);
            xliffMergeCmd.run();
            expect(ws.writtenData()).not.toContain('ERROR');
            expect(ws.writtenData()).toContain('WARNING: transferred 2 changed source content from master to "de"');
            // check that source is changed
            const langFileGerman = readXliff2(xliffMergeCmd.generatedI18nFile('de'));
            const tu = langFileGerman.transUnitWithId(ID_SOURCE_CHANGE);
            expect(tu).toBeTruthy();
            expect(tu.sourceContent()).toBe('Test Änderung Source (geändert!)');
            expect(tu.targetContent()).toBe('Test Änderung Source (geändert!)');
            expect(tu.targetState()).toBe(ngx_i18nsupport_lib_1.STATE_FINAL);
            done();
        });
        it('should merge changed source content to already translated files', (done) => {
            const ID_SOURCE_CHANGE = 'sourcechanged';
            const ID_SOURCE_CHANGE_STATE_FINAL = 'sourcechanged_state_final';
            const TRANSLATED_FILE = 'WithSourceContentChange.en.xlf2';
            file_util_1.FileUtil.copy(SRCDIR + 'ngExtractedMasterWithSourceContentChange.xlf2', MASTER);
            file_util_1.FileUtil.copy(SRCDIR + TRANSLATED_FILE, WORKDIR + 'messages.en.xlf');
            const ws = new writer_to_string_1.WriterToString();
            const commandOut = new command_output_1.CommandOutput(ws);
            const profileContent = {
                xliffmergeOptions: {
                    defaultLanguage: 'de',
                    srcDir: WORKDIR,
                    genDir: WORKDIR,
                    i18nFormat: 'xlf2',
                    i18nFile: MASTERFILE
                }
            };
            const xliffMergeCmd = xliff_merge_1.XliffMerge.createFromOptions(commandOut, { languages: ['de', 'en'], verbose: true }, profileContent);
            xliffMergeCmd.run();
            expect(ws.writtenData()).not.toContain('ERROR');
            expect(ws.writtenData()).toContain('WARNING: transferred 2 changed source content from master to "en"');
            // check that source is changed
            const langFileEnglish = readXliff2(xliffMergeCmd.generatedI18nFile('en'));
            const tu = langFileEnglish.transUnitWithId(ID_SOURCE_CHANGE);
            expect(tu).toBeTruthy();
            expect(tu.sourceContent()).toBe('Test Änderung Source (geändert!)');
            expect(tu.targetState()).toBe(ngx_i18nsupport_lib_1.STATE_NEW);
            const tuFinal = langFileEnglish.transUnitWithId(ID_SOURCE_CHANGE_STATE_FINAL);
            expect(tuFinal).toBeTruthy();
            expect(tuFinal.sourceContent()).toBe('Test Änderung Source (state final, geändert!)');
            expect(tuFinal.targetState()).toBe(ngx_i18nsupport_lib_1.STATE_TRANSLATED);
            done();
        });
        it('should merge changed descriptions and meanings to already translated files', (done) => {
            const TRANSLATED_FILE = 'WithDescriptions.en.xlf2';
            file_util_1.FileUtil.copy(SRCDIR + 'ngExtractedMasterWithDescriptions.xlf2', MASTER);
            file_util_1.FileUtil.copy(SRCDIR + TRANSLATED_FILE, WORKDIR + 'messages.en.xlf');
            const ws = new writer_to_string_1.WriterToString();
            const commandOut = new command_output_1.CommandOutput(ws);
            const profileContent = {
                xliffmergeOptions: {
                    defaultLanguage: 'de',
                    srcDir: WORKDIR,
                    genDir: WORKDIR,
                    i18nFormat: 'xlf2',
                    i18nFile: MASTERFILE
                }
            };
            const xliffMergeCmd = xliff_merge_1.XliffMerge.createFromOptions(commandOut, { languages: ['de', 'en'], verbose: true }, profileContent);
            xliffMergeCmd.run();
            expect(ws.writtenData()).not.toContain('ERROR');
            expect(ws.writtenData()).toContain('WARNING: transferred 3 changed descriptions/meanings from master to "en"');
            // check that description and meaning are changed
            const langFileEnglish = readXliff2(xliffMergeCmd.generatedI18nFile('en'));
            const tu = langFileEnglish.transUnitWithId(ID_DESCRIPTION_CHANGE);
            expect(tu).toBeTruthy();
            expect(tu.description()).toBe('changed description');
            expect(tu.meaning()).toBe('changed meaning');
            // added description
            const tuAdded = langFileEnglish.transUnitWithId(ID_DESCRIPTION_ADD);
            expect(tuAdded).toBeTruthy();
            expect(tuAdded.description()).toBe('added description');
            expect(tuAdded.meaning()).toBe('added meaning');
            // removed description
            const tuRemoved = langFileEnglish.transUnitWithId(ID_DESCRIPTION_REMOVE);
            expect(tuRemoved).toBeTruthy();
            expect(tuRemoved.description()).toBeNull();
            expect(tuRemoved.meaning()).toBeNull();
            done();
        });
        it('should preserve order when merging new units (#96)', (done) => {
            file_util_1.FileUtil.copy(SRCDIR + 'preserveOrderMaster1.xlf2', MASTER);
            let ws = new writer_to_string_1.WriterToString();
            let commandOut = new command_output_1.CommandOutput(ws);
            const profileContent = {
                xliffmergeOptions: {
                    defaultLanguage: 'en',
                    srcDir: WORKDIR,
                    genDir: WORKDIR,
                    i18nFormat: 'xlf2',
                    i18nFile: MASTERFILE
                }
            };
            let xliffMergeCmd = xliff_merge_1.XliffMerge.createFromOptions(commandOut, { languages: ['en', 'de'] }, profileContent);
            xliffMergeCmd.run();
            expect(ws.writtenData()).not.toContain('ERROR');
            // next step, use new master that has added 3 units
            file_util_1.FileUtil.copy(SRCDIR + 'preserveOrderMaster2.xlf2', MASTER);
            ws = new writer_to_string_1.WriterToString();
            commandOut = new command_output_1.CommandOutput(ws);
            xliffMergeCmd = xliff_merge_1.XliffMerge.createFromOptions(commandOut, { languages: ['en', 'de'] }, profileContent);
            xliffMergeCmd.run();
            expect(ws.writtenData()).not.toContain('ERROR');
            expect(ws.writtenData()).toContain('merged 3 trans-units from master to "de"');
            // look, that the new file contains the new units at the correct position
            const langFileGerman = readXliff2(xliffMergeCmd.generatedI18nFile('de'));
            const addedTu = langFileGerman.transUnitWithId('addedunit1');
            expect(addedTu).toBeTruthy();
            expect(addedTu.sourceContent()).toBe('added unit 1');
            // check position
            expect(langFileGerman.editedContent().replace(/(\r\n|\n|\r)/gm, ''))
                .toMatch(/addedunit1.*firstunit.*addedunit2.*lastunit.*addedunit3/);
            done();
        });
        it('should not preserve order when merging new units when disabled via config (#108)', (done) => {
            file_util_1.FileUtil.copy(SRCDIR + 'preserveOrderMaster1.xlf2', MASTER);
            let ws = new writer_to_string_1.WriterToString();
            let commandOut = new command_output_1.CommandOutput(ws);
            const profileContent = {
                xliffmergeOptions: {
                    defaultLanguage: 'en',
                    srcDir: WORKDIR,
                    genDir: WORKDIR,
                    i18nFormat: 'xlf2',
                    i18nFile: MASTERFILE,
                    preserveOrder: false
                }
            };
            let xliffMergeCmd = xliff_merge_1.XliffMerge.createFromOptions(commandOut, { languages: ['en', 'de'] }, profileContent);
            xliffMergeCmd.run();
            expect(ws.writtenData()).not.toContain('ERROR');
            // next step, use new master that has added 3 units
            file_util_1.FileUtil.copy(SRCDIR + 'preserveOrderMaster2.xlf2', MASTER);
            ws = new writer_to_string_1.WriterToString();
            commandOut = new command_output_1.CommandOutput(ws);
            xliffMergeCmd = xliff_merge_1.XliffMerge.createFromOptions(commandOut, { languages: ['en', 'de'] }, profileContent);
            xliffMergeCmd.run();
            expect(ws.writtenData()).not.toContain('ERROR');
            expect(ws.writtenData()).toContain('merged 3 trans-units from master to "de"');
            // look, that the new file contains the new units at the correct position
            const langFileGerman = readXliff2(xliffMergeCmd.generatedI18nFile('de'));
            const addedTu = langFileGerman.transUnitWithId('addedunit1');
            expect(addedTu).toBeTruthy();
            expect(addedTu.sourceContent()).toBe('added unit 1');
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
                    i18nFormat: 'xlf2',
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
        it('allowIdChange feature should merge only white space changed content with changed ID' +
            ' to already translated files (#65)', (done) => {
            const ID_ORIGINAL = 'originalId';
            const ID_CHANGED = 'changedId';
            const TRANSLATED_FILE = 'WithIdChange.en.xlf2';
            file_util_1.FileUtil.copy(SRCDIR + 'ngExtractedMasterWithIdChange.xlf2', MASTER);
            file_util_1.FileUtil.copy(SRCDIR + TRANSLATED_FILE, WORKDIR + 'messages.en.xlf');
            const ws = new writer_to_string_1.WriterToString();
            const commandOut = new command_output_1.CommandOutput(ws);
            const profileContent = {
                xliffmergeOptions: {
                    defaultLanguage: 'de',
                    srcDir: WORKDIR,
                    genDir: WORKDIR,
                    i18nFormat: 'xlf2',
                    i18nFile: MASTERFILE,
                    allowIdChange: true
                }
            };
            const xliffMergeCmd = xliff_merge_1.XliffMerge.createFromOptions(commandOut, { languages: ['de', 'en'], verbose: true }, profileContent);
            xliffMergeCmd.run();
            expect(ws.writtenData()).not.toContain('ERROR');
            expect(ws.writtenData()).toContain('WARNING: found 2 changed id\'s in "en"');
            // check that changed id is merged
            const langFileEnglish = readXliff2(xliffMergeCmd.generatedI18nFile('en'));
            const tuChanged = langFileEnglish.transUnitWithId(ID_CHANGED);
            expect(tuChanged).toBeTruthy();
            expect(tuChanged.sourceContent().trim()).toBe('Test kleine Änderung, nur white spaces!');
            expect(tuChanged.targetState()).toBe(ngx_i18nsupport_lib_1.STATE_TRANSLATED);
            expect(tuChanged.targetContent()).toBe('Test for a small white space change');
            const tuOriginal = langFileEnglish.transUnitWithId(ID_ORIGINAL);
            expect(tuOriginal).toBeFalsy();
            done();
        });
        it('allowIdChange feature should merge untranslated only white space changed content with changed ID,' +
            ' but should set preserve state "new" (#68)', (done) => {
            const ID_ORIGINAL = 'originalIdUntranslated';
            const ID_CHANGED = 'changedIdUntranslated';
            const TRANSLATED_FILE = 'WithIdChange.en.xlf2';
            file_util_1.FileUtil.copy(SRCDIR + 'ngExtractedMasterWithIdChange.xlf2', MASTER);
            file_util_1.FileUtil.copy(SRCDIR + TRANSLATED_FILE, WORKDIR + 'messages.en.xlf');
            const ws = new writer_to_string_1.WriterToString();
            const commandOut = new command_output_1.CommandOutput(ws);
            const profileContent = {
                xliffmergeOptions: {
                    defaultLanguage: 'de',
                    srcDir: WORKDIR,
                    genDir: WORKDIR,
                    i18nFormat: 'xlf2',
                    i18nFile: MASTERFILE,
                    allowIdChange: true
                }
            };
            const xliffMergeCmd = xliff_merge_1.XliffMerge.createFromOptions(commandOut, { languages: ['de', 'en'], verbose: true }, profileContent);
            xliffMergeCmd.run();
            expect(ws.writtenData()).not.toContain('ERROR');
            expect(ws.writtenData()).toContain('WARNING: found 2 changed id\'s in "en"');
            // check that changed id is merged
            const langFileEnglish = readXliff2(xliffMergeCmd.generatedI18nFile('en'));
            const tuChanged = langFileEnglish.transUnitWithId(ID_CHANGED);
            expect(tuChanged).toBeTruthy();
            expect(tuChanged.sourceContent().trim()).toBe('Unübersetzt');
            expect(tuChanged.targetState()).toBe(ngx_i18nsupport_lib_1.STATE_NEW);
            expect(tuChanged.targetContent()).toBe(''); // not translated
            const tuOriginal = langFileEnglish.transUnitWithId(ID_ORIGINAL);
            expect(tuOriginal).toBeFalsy();
            done();
        });
        it('should translate messages with placeholder', (done) => {
            file_util_1.FileUtil.copy(MASTER2SRC, MASTER);
            const ws = new writer_to_string_1.WriterToString();
            const commandOut = new command_output_1.CommandOutput(ws);
            const profileContent = {
                xliffmergeOptions: {
                    defaultLanguage: 'de',
                    srcDir: WORKDIR,
                    genDir: WORKDIR,
                    i18nFormat: 'xlf2',
                    i18nFile: MASTERFILE
                }
            };
            const xliffMergeCmd = xliff_merge_1.XliffMerge.createFromOptions(commandOut, { languages: ['de', 'en'] }, profileContent);
            xliffMergeCmd.run();
            expect(ws.writtenData()).not.toContain('ERROR');
            // now translate some texts in the English version
            let langFileEnglish = readXliff2(xliffMergeCmd.generatedI18nFile('en'));
            const tu = langFileEnglish.transUnitWithId(ID_WITH_PLACEHOLDER);
            expect(tu).toBeTruthy();
            tu.translate('Item <ph id="0" equiv="INTERPOLATION" disp="{{number()}}"/> of <ph id="1" equiv="INTERPOLATION_1" disp="{{total()}}"/> added.');
            translation_messages_file_reader_1.TranslationMessagesFileReader.save(langFileEnglish);
            // look, that the new file contains the translation
            langFileEnglish = readXliff2(xliffMergeCmd.generatedI18nFile('en'));
            expect(langFileEnglish.transUnitWithId(ID_WITH_PLACEHOLDER).targetContent())
                .toBe('Item <ph id="0" equiv="INTERPOLATION" disp="{{number()}}"/> of <ph id="1" equiv="INTERPOLATION_1" disp="{{total()}}"/> added.');
            expect(langFileEnglish.transUnitWithId(ID_WITH_PLACEHOLDER).targetContentNormalized().asDisplayString())
                .toBe('Item {{0}} of {{1}} added.');
            done();
        });
        it('should not output a warning when autotranslate is not enabled for a language (issue #49)', (done) => {
            file_util_1.FileUtil.copy(MASTER2SRC, MASTER);
            const ws = new writer_to_string_1.WriterToString();
            const commandOut = new command_output_1.CommandOutput(ws);
            const apiKey = auto_translate_service_spec_1.getApiKey();
            const profileContent = {
                xliffmergeOptions: {
                    defaultLanguage: 'de',
                    languages: ['de', 'ru', 'en'],
                    autotranslate: ['ru'],
                    apikey: apiKey,
                    srcDir: WORKDIR,
                    genDir: WORKDIR,
                    i18nFormat: 'xlf2',
                    i18nFile: MASTERFILE
                }
            };
            const xliffMergeCmd = xliff_merge_1.XliffMerge.createFromOptions(commandOut, {}, profileContent);
            xliffMergeCmd.run(() => {
                if (apiKey) {
                    expect(ws.writtenData()).not.toContain('ERROR');
                    expect(ws.writtenData()).not.toContain('Auto translation from "de" to "en"');
                    expect(ws.writtenData()).toContain('Auto translation from "de" to "ru"');
                }
                else {
                    expect(ws.writtenData()).toContain('ERROR: autotranslate requires an API key');
                }
                done();
            });
        });
        it('should read xlf2 format file with expected extension xlf, not xlf2 (#124)', (done) => {
            const masterWithXlfSuffix = WORKDIR + 'messages.xlf'; // expected suffix for XLIFF2 is also xlf
            file_util_1.FileUtil.copy(MASTER1SRC, masterWithXlfSuffix);
            const ws = new writer_to_string_1.WriterToString();
            const commandOut = new command_output_1.CommandOutput(ws);
            // do not use i18nfile option here, so that the default will be used
            const profileContent = {
                xliffmergeOptions: {
                    defaultLanguage: 'de',
                    srcDir: WORKDIR,
                    genDir: WORKDIR,
                    i18nFormat: 'xlf2',
                    useSourceAsTarget: false
                }
            };
            const xliffMergeCmd = xliff_merge_1.XliffMerge.createFromOptions(commandOut, { languages: ['de'] }, profileContent);
            xliffMergeCmd.run();
            expect(ws.writtenData()).not.toContain('ERROR');
            const langFile = readXliff2(xliffMergeCmd.generatedI18nFile('de'));
            expect(langFile.sourceLanguage()).toBe('de');
            expect(langFile.targetLanguage()).toBe('de');
            done();
        });
    });
    describe('ngx-translate processing for format XLIFF 2.0', () => {
        const MASTER1FILE = 'ngxtranslate.xlf2';
        const MASTER1SRC = SRCDIR + MASTER1FILE;
        const MASTER_WITHOUT_NGX_TRANSLATE_STUFF = SRCDIR + 'ngExtractedMaster1.xlf2';
        const MASTERFILE = 'messages.xlf2';
        const MASTER = WORKDIR + MASTERFILE;
        const ID_NODESC_NOMEANING = '2047558209369508311'; // an ID without set meaning and description
        const ID_MONDAY = '6830980354990918030'; // an ID from ngxtranslate.xlf with meaning "x.y" and description "ngx-translate"
        beforeEach(() => {
            if (!fs.existsSync(WORKDIR)) {
                fs.mkdirSync(WORKDIR);
            }
            // cleanup workdir
            file_util_1.FileUtil.deleteFolderContentRecursive(WORKDIR);
        });
        it('should return null for unset description and meaning in master xlf2 file', (done) => {
            file_util_1.FileUtil.copy(MASTER1SRC, MASTER);
            const master = readXliff2(MASTER);
            expect(master.transUnitWithId(ID_NODESC_NOMEANING).description()).toBeFalsy();
            expect(master.transUnitWithId(ID_NODESC_NOMEANING).meaning()).toBeFalsy();
            done();
        });
        it('should find description and meaning in master xlf2 file', (done) => {
            file_util_1.FileUtil.copy(MASTER1SRC, MASTER);
            const master = readXliff2(MASTER);
            expect(master.transUnitWithId(ID_MONDAY).description()).toBe('ngx-translate');
            expect(master.transUnitWithId(ID_MONDAY).meaning()).toBe('dateservice.monday');
            done();
        });
        it('should find description and meaning in translated xlf2 file', (done) => {
            file_util_1.FileUtil.copy(MASTER1SRC, MASTER);
            const ws = new writer_to_string_1.WriterToString();
            const commandOut = new command_output_1.CommandOutput(ws);
            const profileContent = {
                xliffmergeOptions: {
                    defaultLanguage: 'de',
                    srcDir: WORKDIR,
                    genDir: WORKDIR,
                    i18nFormat: 'xlf2',
                    i18nFile: MASTERFILE
                }
            };
            const xliffMergeCmd = xliff_merge_1.XliffMerge.createFromOptions(commandOut, { languages: ['de'] }, profileContent);
            xliffMergeCmd.run();
            expect(ws.writtenData()).not.toContain('ERROR');
            const langFile = readXliff2(xliffMergeCmd.generatedI18nFile('de'));
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
                    i18nFormat: 'xlf2',
                    i18nFile: MASTERFILE,
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
            expect(translation.dateservice.monday).toBe("Montag");
            expect(translation.dateservice.friday).toBe("Freitag");
            expect(translation.explicitlysetids.test1).toBe("Explizit gesetzte ID");
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
                    i18nFormat: 'xlf2',
                    i18nFile: MASTERFILE,
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
                    i18nFormat: 'xlf2',
                    i18nFile: MASTERFILE,
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
        it('should not export @@ids to translation json file, when this is supressed in pattern (issue #62)', (done) => {
            file_util_1.FileUtil.copy(MASTER1SRC, MASTER);
            const ws = new writer_to_string_1.WriterToString();
            const commandOut = new command_output_1.CommandOutput(ws);
            const profileContent = {
                xliffmergeOptions: {
                    defaultLanguage: 'de',
                    srcDir: WORKDIR,
                    genDir: WORKDIR,
                    i18nFormat: 'xlf2',
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
                    i18nFormat: 'xlf2',
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
//# sourceMappingURL=xlf20-merge.spec.js.map