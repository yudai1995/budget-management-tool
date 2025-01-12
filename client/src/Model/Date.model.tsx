export enum DateModel {
    YY_MM_DD = 'YYYY-MM-DD',
    MM_DD = 'MM-DD',
}

export type ReportType = '月間' | '年間'
export const typeList: ReportType[] = ['月間', '年間']

/**
 * YYYY-MM-DD, MM-DDにフォーマットする
 * @param {Date} date
 * @param {DateModel} type
 * @param {Boolean} isPadStart
 * @return {string}
 */
export const formatDate = (date: Date, type: DateModel, isPadStart?: Boolean): string => {
    if (Object.prototype.toString.call(date) !== '[object Date]') {
        return ''
    }

    if (isPadStart) {
        switch (type) {
            case DateModel.YY_MM_DD:
                return `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}`
            case DateModel.MM_DD:
                return `${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}`
            default:
                return ''
        }
    } else {
        switch (type) {
            case DateModel.YY_MM_DD:
                return `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`
            case DateModel.MM_DD:
                return `${date.getMonth() + 1}-${date.getDate()}`
            default:
                return ''
        }
    }
}

/**
 * YYYY-MM-DDから年を取得
 * @param {string} stringDate
 * @return {string}
 */
export const getYear = (stringDate: string) => {
    return stringDate.split('-')[0]
}

/**
 * YYYY-MM-DDから月を取得
 * @param {string} stringDate
 * @return {string}
 */
export const getMonth = (stringDate: string) => {
    return stringDate.split('-')[1]
}

/**
 * YYYY-MM-DDから年を取得
 * @param {string} stringDate
 * @return {string}
 */
export const getDate = (stringDate: string) => {
    return stringDate.split('-')[2]
}

/**
 * ハイフンからスラッシュに置き換えてDate型を戻す
 * @param {string} stringDate
 * @return {Date}
 */
export const hyphenToSlash = (stringDate: string) => {
    return new Date(stringDate.replace(/-/g, '/'))
}
