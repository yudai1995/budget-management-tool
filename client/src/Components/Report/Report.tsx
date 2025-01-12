import React from 'react'
import { useSelector } from 'react-redux'
import { RootState } from '../../store'
import { Budget } from '../../Model/budget.model'
import { getTargetDateList, getTargetAnnulaList } from '../../store/budgetListSlice'
import { typeList } from '../../Model/Date.model'
import { ReportSettings } from '../Layout/Report/ReportSettings'
import { ReportListLayout } from '../Layout/ReportListLayout'
import { NoDateLayout } from '../Layout/NoDateLayout'
import { ReportGraph } from '../Graph/ReportGraph'
import styles from '../../styles/Report.module.scss'
import { Helmet } from 'react-helmet'
import { pageTitle } from '../../Model/navigation.model'

export const Report: React.FC = () => {
    const budgetList = useSelector((state: RootState) => state.budgetList.data)
    const reportType = useSelector((state: RootState) => state.ReportState.reportType)
    const targetDate = useSelector((state: RootState) => state.ReportState.targetDate)

    // 月次か年次かによって切り分け
    let BudgetListBYDate: Budget[] = []
    if (reportType === typeList[0]) {
        BudgetListBYDate = getTargetDateList(budgetList, [targetDate.getFullYear(), targetDate.getMonth() + 1])
    } else if (reportType === typeList[1]) {
        BudgetListBYDate = getTargetAnnulaList(budgetList, targetDate)
    }

    const totalValueType = useSelector((state: RootState) => state.ReportState.totalValueID)

    // 全収支か支出、収入かで切り分け
    let targetBudgetList: Budget[] = []
    if (totalValueType === 2) {
        targetBudgetList = BudgetListBYDate
    } else {
        targetBudgetList = BudgetListBYDate.filter((data) => data.balanceType === totalValueType)
    }
    const title = pageTitle.Report

    return (
        <>
            <Helmet>
                <meta name="description" content={`家計簿管理の${title}画面です`} />
                <meta name="keywords" content={`家計簿, 支出管理, ${title}`} />
                <meta property="og:title" content={`${title} | 家計簿管理`} />
                <meta property="og:description" content={`家計簿管理の${title}画面です`} />
                <title>{`${title} | 家計簿管理`}</title>
            </Helmet>
            <ReportSettings />
            <NoDateLayout data={targetBudgetList}>
                <>
                    <div className={styles.graphWrapper}>
                        <ReportGraph targetBudgetList={targetBudgetList} />
                    </div>
                    <ul>
                        {targetBudgetList.map((data) => (
                            <li key={data.id} className={styles.report}>
                                <ReportListLayout budgetData={data} />
                            </li>
                        ))}
                    </ul>
                </>
            </NoDateLayout>
        </>
    )
}
