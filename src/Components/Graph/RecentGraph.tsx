import { Line } from 'react-chartjs-2';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';
import {
    sumAmount,
    getTargetDateList,
    getRecentData,
} from '../../store/budgetListSlice';
import { balanceType } from '../../Model/budget.model';
import { DateModel, formatDate } from '../../Model/Date.model';
import '../../styles/Graph.scss';

export const RecentGraph: React.FC = () => {
    const recentBudgetList = useSelector((state) =>
        getRecentData(state as RootState)
    );

    let labels: string[] = [];
    let outgoData: number[] = [];
    let incomeData: number[] = [];
    for (let i = 0; i < 7; i++) {
        let targetDate = new Date(new Date().setDate(new Date().getDate() - i));

        labels = [
            formatDate(targetDate, DateModel.MM_DD).replace(/-/g, '/'),
            ...labels,
        ];

        const tagetMonthList = getTargetDateList(recentBudgetList, [
            targetDate.getFullYear(),
            targetDate.getMonth() + 1,
            targetDate.getDate(),
        ]);

        outgoData = [sumAmount(tagetMonthList, 0), ...outgoData];
        incomeData = [sumAmount(tagetMonthList, 1), ...incomeData];
    }

    const data = {
        labels: labels,
        datasets: [
            {
                label: '支出',
                data: outgoData,
                backgroundColor: balanceType[0].color,
                borderColor: balanceType[0].borderColor,
                borderWidth: 1,
            },

            {
                label: '収入',
                data: incomeData,
                backgroundColor: balanceType[1].color,
                borderColor: balanceType[1].borderColor,
                borderWidth: 1,
            },
        ],
    };

    return <Line data={data} />;
};
