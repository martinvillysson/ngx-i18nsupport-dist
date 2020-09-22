"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.XliffMergeAutoTranslateService = void 0;
const util_1 = require("../common/util");
const rxjs_1 = require("rxjs");
const operators_1 = require("rxjs/operators");
const entityDecoderLib = require("he");
const ngx_i18nsupport_lib_1 = require("@ngx-i18nsupport/ngx-i18nsupport-lib");
const auto_translate_service_1 = require("./auto-translate-service");
const auto_translate_result_1 = require("./auto-translate-result");
const auto_translate_summary_report_1 = require("./auto-translate-summary-report");
/**
 * Created by martin on 07.07.2017.
 * Service to autotranslate Transunits via Google Translate.
 */
class XliffMergeAutoTranslateService {
    constructor(apikey) {
        this.autoTranslateService = new auto_translate_service_1.AutoTranslateService(apikey);
    }
    /**
     * Auto translate file via Google Translate.
     * Will translate all new units in file.
     * @param from from
     * @param to to
     * @param languageSpecificMessagesFile languageSpecificMessagesFile
     * @return a promise with the execution result as a summary report.
     */
    autoTranslate(from, to, languageSpecificMessagesFile) {
        return rxjs_1.forkJoin([
            this.doAutoTranslateNonICUMessages(from, to, languageSpecificMessagesFile),
            ...this.doAutoTranslateICUMessages(from, to, languageSpecificMessagesFile)
        ])
            .pipe(operators_1.map((summaries) => {
            const summary = summaries[0];
            for (let i = 1; i < summaries.length; i++) {
                summary.merge(summaries[i]);
            }
            return summary;
        }));
    }
    /**
     * Collect all units that are untranslated.
     * @param languageSpecificMessagesFile languageSpecificMessagesFile
     * @return all untranslated units
     */
    allUntranslatedTUs(languageSpecificMessagesFile) {
        // collect all units, that should be auto translated
        const allUntranslated = [];
        languageSpecificMessagesFile.forEachTransUnit((tu) => {
            if (tu.targetState() === ngx_i18nsupport_lib_1.STATE_NEW) {
                allUntranslated.push(tu);
            }
        });
        return allUntranslated;
    }
    doAutoTranslateNonICUMessages(from, to, languageSpecificMessagesFile) {
        const allUntranslated = this.allUntranslatedTUs(languageSpecificMessagesFile);
        const allTranslatable = allUntranslated.filter((tu) => util_1.isNullOrUndefined(tu.sourceContentNormalized().getICUMessage()));
        const allMessages = allTranslatable.map((tu) => {
            return tu.sourceContentNormalized().asDisplayString();
        });
        return this.autoTranslateService.translateMultipleStrings(allMessages, from, to)
            .pipe(
        // #94 google translate might return &#.. entity refs, that must be decoded
        operators_1.map((translations) => translations.map(encodedTranslation => entityDecoderLib.decode(encodedTranslation))), operators_1.map((translations) => {
            const summary = new auto_translate_summary_report_1.AutoTranslateSummaryReport(from, to);
            summary.setIgnored(allUntranslated.length - allTranslatable.length);
            for (let i = 0; i < translations.length; i++) {
                const tu = allTranslatable[i];
                const translationText = translations[i];
                const result = this.autoTranslateNonICUUnit(tu, translationText);
                summary.addSingleResult(tu, result);
            }
            return summary;
        }), operators_1.catchError((err) => {
            const failSummary = new auto_translate_summary_report_1.AutoTranslateSummaryReport(from, to);
            failSummary.setError(err.message, allMessages.length);
            return rxjs_1.of(failSummary);
        }));
    }
    doAutoTranslateICUMessages(from, to, languageSpecificMessagesFile) {
        const allUntranslated = this.allUntranslatedTUs(languageSpecificMessagesFile);
        const allTranslatableICU = allUntranslated.filter((tu) => !util_1.isNullOrUndefined(tu.sourceContentNormalized().getICUMessage()));
        return allTranslatableICU.map((tu) => {
            return this.doAutoTranslateICUMessage(from, to, tu);
        });
    }
    /**
     * Translate single ICU Messages.
     * @param from from
     * @param to to
     * @param tu transunit to translate (must contain ICU Message)
     * @return summary report
     */
    doAutoTranslateICUMessage(from, to, tu) {
        const icuMessage = tu.sourceContentNormalized().getICUMessage();
        const categories = icuMessage.getCategories();
        // check for nested ICUs, we do not support that
        if (categories.find((category) => !util_1.isNullOrUndefined(category.getMessageNormalized().getICUMessage()))) {
            const summary = new auto_translate_summary_report_1.AutoTranslateSummaryReport(from, to);
            summary.setIgnored(1);
            return rxjs_1.of(summary);
        }
        const allMessages = categories.map((category) => category.getMessageNormalized().asDisplayString());
        return this.autoTranslateService.translateMultipleStrings(allMessages, from, to)
            .pipe(
        // #94 google translate might return &#.. entity refs, that must be decoded
        operators_1.map((translations) => translations.map(encodedTranslation => entityDecoderLib.decode(encodedTranslation))), operators_1.map((translations) => {
            const summary = new auto_translate_summary_report_1.AutoTranslateSummaryReport(from, to);
            const icuTranslation = {};
            for (let i = 0; i < translations.length; i++) {
                icuTranslation[categories[i].getCategory()] = translations[i];
            }
            const result = this.autoTranslateICUUnit(tu, icuTranslation);
            summary.addSingleResult(tu, result);
            return summary;
        }), operators_1.catchError((err) => {
            const failSummary = new auto_translate_summary_report_1.AutoTranslateSummaryReport(from, to);
            failSummary.setError(err.message, allMessages.length);
            return rxjs_1.of(failSummary);
        }));
    }
    autoTranslateNonICUUnit(tu, translatedMessage) {
        return this.autoTranslateUnit(tu, tu.sourceContentNormalized().translate(translatedMessage));
    }
    autoTranslateICUUnit(tu, translation) {
        return this.autoTranslateUnit(tu, tu.sourceContentNormalized().translateICUMessage(translation));
    }
    autoTranslateUnit(tu, translatedMessage) {
        const errors = translatedMessage.validate();
        const warnings = translatedMessage.validateWarnings();
        if (!util_1.isNullOrUndefined(errors)) {
            return new auto_translate_result_1.AutoTranslateResult(false, 'errors detected, not translated');
        }
        else if (!util_1.isNullOrUndefined(warnings)) {
            return new auto_translate_result_1.AutoTranslateResult(false, 'warnings detected, not translated');
        }
        else {
            tu.translate(translatedMessage);
            return new auto_translate_result_1.AutoTranslateResult(true, null); // success
        }
    }
}
exports.XliffMergeAutoTranslateService = XliffMergeAutoTranslateService;
//# sourceMappingURL=xliff-merge-auto-translate-service.js.map