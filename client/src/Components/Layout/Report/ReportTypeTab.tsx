import React from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { RootState } from '../../../store'
import { setReportType } from '../../../store/ReportStateSlice'
import classNames from 'classnames/bind'
import { ReportType, typeList } from '../../../Model/Date.model'
import styles from '../../../styles/Report/ReportTypeTab.module.scss'

export const ReportTypeTab: React.FC = () => {
    const dispatch = useDispatch()
    let reportType = useSelector((state: RootState) => state.ReportState.reportType)

    // タブのclass
    const cx = classNames.bind(styles)
    const tabclass = (showReport: ReportType) => {
        return cx({
            reportTypeTab: true,
            isActive: showReport === typeList[0],
        })
    }

    return (
        <div
            className={tabclass(reportType)}
            onClick={() => dispatch(setReportType(reportType === typeList[0] ? { reportType: typeList[1] } : { reportType: typeList[0] }))}
        >
            <p className={styles.tabCircle}>{reportType}レポート</p>
            <ul className={styles.tabList}>
                {typeList.map((type, index) => (
                    <li key={index} className={styles.tabListItem}>
                        {type}レポート
                    </li>
                ))}
            </ul>
        </div>
    )
}
