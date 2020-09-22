import { Observable } from 'rxjs';
import { ITranslationMessagesFile } from '@ngx-i18nsupport/ngx-i18nsupport-lib';
import { AutoTranslateSummaryReport } from './auto-translate-summary-report';
/**
 * Created by martin on 07.07.2017.
 * Service to autotranslate Transunits via Google Translate.
 */
export declare class XliffMergeAutoTranslateService {
    private autoTranslateService;
    constructor(apikey: string);
    /**
     * Auto translate file via Google Translate.
     * Will translate all new units in file.
     * @param from from
     * @param to to
     * @param languageSpecificMessagesFile languageSpecificMessagesFile
     * @return a promise with the execution result as a summary report.
     */
    autoTranslate(from: string, to: string, languageSpecificMessagesFile: ITranslationMessagesFile): Observable<AutoTranslateSummaryReport>;
    /**
     * Collect all units that are untranslated.
     * @param languageSpecificMessagesFile languageSpecificMessagesFile
     * @return all untranslated units
     */
    private allUntranslatedTUs;
    private doAutoTranslateNonICUMessages;
    private doAutoTranslateICUMessages;
    /**
     * Translate single ICU Messages.
     * @param from from
     * @param to to
     * @param tu transunit to translate (must contain ICU Message)
     * @return summary report
     */
    private doAutoTranslateICUMessage;
    private autoTranslateNonICUUnit;
    private autoTranslateICUUnit;
    private autoTranslateUnit;
}
