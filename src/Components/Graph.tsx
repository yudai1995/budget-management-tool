import React from 'react';
import { Doughnut } from 'react-chartjs-2';
import { Balance, balanceType, sumAmount } from '../Model/budget.model';
import '../styles/Graph.scss';
import classNames from 'classnames';

interface GraphProps {
    moneyList: Balance[];
}

export const Graph: React.FC<GraphProps> = (props) => {
    const data = {
        labels: [balanceType[0].typename, balanceType[1].typename],
        //labels: ['Red', 'Blue', 'Yellow', 'Green', 'Purple', 'Orange'],
        datasets: [
            {
                label: 'Dataset',
                data: [
                    sumAmount(props.moneyList, 0),
                    sumAmount(props.moneyList, 1),
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
                }
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
                        sumAmount(props.moneyList, 0) +
                            sumAmount(props.moneyList, 1) ===
                        0,
                })}
            >
                {sumAmount(props.moneyList, 0) +
                    sumAmount(props.moneyList, 1) !==
                0 ? (
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
