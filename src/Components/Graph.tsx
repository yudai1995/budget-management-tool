import React from 'react';
import { Doughnut, Line } from 'react-chartjs-2';
import { useSelector } from 'react-redux';
import { RootState } from '../store';
import {
    sumAmount,
    getTargetDateList,
    getRecentData,
} from '../store/budgetListSlice';
import { balanceType } from '../Model/budget.model';
import { DateModel, formatDate } from '../Model/Date.model';
import '../styles/Graph.scss';
import classNames from 'classnames';

export const Graph: React.FC = () => {
    const activeMonth = new Date(); //仮入れです。
    const budgetLists = useSelector((state) =>
        getTargetDateList(state as RootState, [
            activeMonth.getFullYear(),
            activeMonth.getMonth() + 1,
        ])
    );

    const data = {
        labels: [balanceType[0].typename, balanceType[1].typename],
        //labels: ['Red', 'Blue', 'Yellow', 'Green', 'Purple', 'Orange'],
        datasets: [
            {
                label: 'Dataset',
                data: [sumAmount(budgetLists, 0), sumAmount(budgetLists, 1)],
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
        <section className="graphSection">
            <h2>収支グラフ</h2>
            <div
                className={classNames('doughnutWrapper', {
                    noData:
                        sumAmount(budgetLists, 0) +
                            sumAmount(budgetLists, 1) ===
                        0,
                })}
            >
                {sumAmount(budgetLists, 0) + sumAmount(budgetLists, 1) !== 0 ? (
                    <Doughnut
                        data={data}
                        width={240}
                        height={240}
                        options={options}
                    />
                ) : (
                    'データがありません'
                )}
            </div>
        </section>
    );
};

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

    return (
        <Line data={data} />
    );
};
