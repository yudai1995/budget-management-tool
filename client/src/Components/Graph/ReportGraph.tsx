import { Doughnut } from 'react-chartjs-2'
import { sumAmount } from '../../store/budgetListSlice'
import { Budget, balanceType } from '../../Model/budget.model'
import { ContentLayout } from '../Layout/ContentLayout'
import '../../styles/Graph.module.scss'
import classNames from 'classnames'
import { useSelector } from 'react-redux'
import { RootState } from '../../store'

interface ReportGraphProp {
    targetBudgetList: Budget[]
}

export const ReportGraph: React.FC<ReportGraphProp> = ({ targetBudgetList }) => {
    const totalValueType = useSelector((state: RootState) => state.ReportState.totalValueID)
    const categoryList = useSelector((state: RootState) => state.CategoryList.data)

    // 円グラフに渡すデータの取得
    let labels: string[], reportData: number[], bgColor: string[]
    if (totalValueType === 2) {
        labels = [balanceType[0].typename, balanceType[1].typename]
        reportData = [sumAmount(targetBudgetList, 0), sumAmount(targetBudgetList, 1)]
        bgColor = [balanceType[0].color, balanceType[1].color]
    } else {
        labels = categoryList[totalValueType].map((category) => category.name)
        reportData = categoryList[totalValueType].map((category) => {
            const filterList = targetBudgetList.filter((data) => data.categoryId === category.categoryId)
            return sumAmount(filterList)
        })
        bgColor = categoryList[totalValueType].map((category) => category.color)
    }

    const data = {
        labels: labels,
        datasets: [
            {
                data: reportData,
                backgroundColor: bgColor,
                borderWidth: 1,
            },
        ],
    }

    const options = {
        plugins: {
            legend: {
                display: false,
                position: 'bottom' as 'bottom',
                title: {
                    display: false,
                    text: '収支グラフ',
                },
            },
        },
    }

    return (
        <ContentLayout title={false}>
            <div
                className={classNames('doughnutWrapper', {
                    noData: sumAmount(targetBudgetList, 0) + sumAmount(targetBudgetList, 1) === 0,
                })}
            >
                <Doughnut data={data} width={240} height={240} options={options} />
            </div>
        </ContentLayout>
    )
}
