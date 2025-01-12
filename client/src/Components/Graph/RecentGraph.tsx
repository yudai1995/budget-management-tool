import { Line } from 'react-chartjs-2'
import { useSelector } from 'react-redux'
import { RootState } from '../../store'
import { sumAmount, getTargetDateList, getRecentData } from '../../store/budgetListSlice'
import { balanceType, unitFormat } from '../../Model/budget.model'
import { DateModel, formatDate } from '../../Model/Date.model'
import '../../styles/Graph.module.scss'

export const RecentGraph: React.FC = () => {
    const recentBudgetList = useSelector((state) => getRecentData(state as RootState))

    // 一週間以内の収支金額を取得する
    let labels: string[] = [],
        outgoData: number[] = [],
        incomeData: number[] = []
    for (let i = 0; i < 7; i++) {
        let targetDate = new Date(new Date().setDate(new Date().getDate() - i))

        labels = [formatDate(targetDate, DateModel.MM_DD).replace(/-/g, '/'), ...labels]

        const tagetMonthList = getTargetDateList(recentBudgetList, [targetDate.getFullYear(), targetDate.getMonth() + 1, targetDate.getDate()])

        outgoData = [sumAmount(tagetMonthList, 0), ...outgoData]
        incomeData = [sumAmount(tagetMonthList, 1), ...incomeData]
    }

    // 収支金額が1万を超える場合
    const getArrayMax = (a: number, b: number) => {
        return Math.max(a, b)
    }
    const maxNum = outgoData.reduce(getArrayMax) > incomeData.reduce(getArrayMax) ? outgoData.reduce(getArrayMax) : incomeData.reduce(getArrayMax)
    const threshold = 10000

    let setOutgoData: number[] = [],
        setIncomeData: number[] = [],
        stepSize: number,
        suggestedMin: number,
        suggestedMax: number

    if (maxNum >= threshold) {
        setOutgoData = outgoData.map((data) => data / threshold)
        setIncomeData = incomeData.map((data) => data / threshold)
        stepSize = 5
        suggestedMin = 1
        suggestedMax = 10
    } else {
        setOutgoData = outgoData
        setIncomeData = incomeData
        stepSize = 100
        suggestedMin = 100
        suggestedMax = 1000
    }

    const data = {
        labels: labels,
        datasets: [
            {
                label: '支出',
                data: setOutgoData,
                backgroundColor: balanceType[0].color,
                borderColor: balanceType[0].borderColor,
                borderWidth: 1,
                pointBorderWidth: 8,
                pointBorderColor: balanceType[0].color,
            },

            {
                label: '収入',
                data: setIncomeData,
                backgroundColor: balanceType[1].color,
                borderColor: balanceType[1].borderColor,
                borderWidth: 1,
                pointBorderWidth: 8,
                pointBorderColor: balanceType[1].color,
            },
        ],
    }

    const options: any = {
        scales: {
            x: {
                grid: {
                    color: '#ffffff00',
                    borderColor: '#dfdfdf',
                    tickColor: '#dfdfdf',
                },
            },
            y: {
                ticks: {
                    stepSize: stepSize,
                    callback: (label: number) => {
                        if (maxNum >= threshold) {
                            return unitFormat(label * threshold) + '円'
                        } else {
                            return unitFormat(label) + '円'
                        }
                    },
                },
                suggestedMin: suggestedMin,
                suggestedMax: suggestedMax,
            },
        },
        plugins: {
            tooltip: {
                callbacks: {
                    label: (tooltipItem: { raw: number }) => {
                        if (maxNum >= threshold) {
                            return unitFormat(tooltipItem.raw * threshold) + '円'
                        } else {
                            return unitFormat(tooltipItem.raw) + '円'
                        }
                    },
                },
            },
        },
    }

    return <Line data={data} options={options} />
}
