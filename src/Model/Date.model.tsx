export enum DateModel {
    YY_MM_DD = 'YYYY-MM-DD',
    MM_DD = 'MM-DD',
}
/**
 * YYYY-MM-DD, MM-DDにフォーマットする
 * @param {Date} date
 * @param {DateModel} type
 * @return {string}
 */
export const formatDate = (date: Date, type: DateModel): string => {
    switch (type) {
        case DateModel.YY_MM_DD:
            return `${date.getFullYear()}-${date.getMonth()+1}-${date.getDate()}`;
        case DateModel.MM_DD:
            return `${date.getMonth()+1}-${date.getDate()}`;
        default:
            return '';
    }
};

/**
 * YYYY-MM-DDから年を取得
 * @param {string} stringDate
 * @return {string}
 */
export const catchYear = (stringDate: string) => {
    return stringDate.split('-')[0];
};

/**
 * YYYY-MM-DDから月を取得
 * @param {string} stringDate
 * @return {string}
 */
export const catchMonth = (stringDate: string) => {
    return stringDate.split('-')[1];
};

/**
 * YYYY-MM-DDから年を取得
 * @param {string} stringDate
 * @return {string}
 */
export const catchDay = (stringDate: string) => {
    return stringDate.split('-')[2];
};

/**
 * ハイフンからスラッシュに置き換えてDate型を戻す
 * @param {string} stringDate
 * @return {Date}
 */
 export const hyphenToSlash = (stringDate: string) => {
    return new Date(stringDate.replace(/-/g, '/'));
};
