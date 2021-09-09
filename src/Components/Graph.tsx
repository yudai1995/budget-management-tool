import React from 'react';
import { Doughnut } from 'react-chartjs-2';
import { Balance, sumAmount } from '../Model/budget.model';

interface GraphProps {
    moneyList: Balance[];
}

export const Graph:React.FC<GraphProps> = (props) => {

    const data = {
        labels: ['Red', 'Blue'],
        //labels: ['Red', 'Blue', 'Yellow', 'Green', 'Purple', 'Orange'],
        datasets: [{
            label: 'Dataset',
            data: [sumAmount(props.moneyList, 'income'), sumAmount(props.moneyList, 'outgo')],
            backgroundColor: [
                'rgba(255, 99, 132, 1)',
                'rgba(54, 162, 235, 1)',
                'rgba(255, 206, 86, 1)',
                'rgba(75, 192, 192, 1)',
                'rgba(153, 102, 255, 1)',
                'rgba(255, 159, 64, 1)'
            ],
            borderColor: [
                'rgba(255, 99, 132, 1)',
                'rgba(54, 162, 235, 1)',
                'rgba(255, 206, 86, 1)',
                'rgba(75, 192, 192, 1)',
                'rgba(153, 102, 255, 1)',
                'rgba(255, 159, 64, 1)'
            ],
            borderWidth: 1
        }]
    }

    const options = {
        scales: {
            yAxes: [{
                ticks: {
                    beginAtZero: true
                }
            }]
        }
    }

    return (
        <Doughnut
            data={data}
            width={100}
            height={50}
            options={options}
        />
    );
};