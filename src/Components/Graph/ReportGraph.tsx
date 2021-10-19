import { Doughnut } from 'react-chartjs-2';
import { sumAmount } from '../../store/budgetListSlice';
import { balanceType, Budget } from '../../Model/budget.model';
import { ContentLayout } from '../Layout/ContentLayout';
import '../../styles/Graph.scss';
import classNames from 'classnames';

interface ReportGraphProp {
    targetBudgetList: Budget[];
}

export const ReportGraph: React.FC<ReportGraphProp> = ({
    targetBudgetList,
}) => {
    const data = {
        labels: [balanceType[0].typename, balanceType[1].typename],
        //labels: ['Red', 'Blue', 'Yellow', 'Green', 'Purple', 'Orange'],
        datasets: [
            {
                label: 'Dataset',
                data: [
                    sumAmount(targetBudgetList, 0),
                    sumAmount(targetBudgetList, 1),
                ],
                backgroundColor: [balanceType[0].color, balanceType[1].color],
                borderColor: [
                    balanceType[0].borderColor,
                    balanceType[1].borderColor,
                ],
                borderWidth: 1,
            },
        ],
    };

    const options = {
        plugins: {
            legend: {
                position: 'bottom',
                labels: {
                    padding: 20,
                },
            },
        },

        // scales: {
        //     yAxes: [{
        //         ticks: {
        //             beginAtZero: true
        //         }
        //     }]
        // }
    };

    return (
        <ContentLayout title="収支グラフ">
            <div
                className={classNames('doughnutWrapper', {
                    noData:
                        sumAmount(targetBudgetList, 0) +
                            sumAmount(targetBudgetList, 1) ===
                        0,
                })}
            >
                <Doughnut
                    data={data}
                    width={240}
                    height={240}
                    options={options}
                />
            </div>
        </ContentLayout>
    );
};
