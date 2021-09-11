import React from 'react';
import { Doughnut } from 'react-chartjs-2';
import { Balance, balanceType, sumAmount } from '../Model/budget.model';
import '../css/Graph.scss';

interface GraphProps {
    moneyList: Balance[];
}

export const Graph: React.FC<GraphProps> = (props) => {
    const data = {
        labels: [balanceType[0], balanceType[1]],
        //labels: ['Red', 'Blue', 'Yellow', 'Green', 'Purple', 'Orange'],
        datasets: [
            {
                label: 'Dataset',
                data: [
                    sumAmount(props.moneyList, 0),
                    sumAmount(props.moneyList, 1),
                ],
                backgroundColor: ['#4dbf7b', '#ff9676'],
                borderColor: ['#0d9242', '#ff2419'],
                borderWidth: 1,
            },
        ],
    };

    const options = {
        // scales: {
        //     yAxes: [{
        //         ticks: {
        //             beginAtZero: true
        //         }
        //     }]
        // }
    };

    return (
        <div className="doughnutWrapper">
            <Doughnut data={data} width={240} height={240} options={options} />
        </div>
    );
};
