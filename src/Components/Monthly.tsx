import React from 'react';
import { useState } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../store';
import { sumAmount, getTargetDateList } from '../store/budgetListSlice';
import { balanceType } from '../Model/budget.model';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import allLocales from '@fullcalendar/core/locales-all';
import '../styles/Monthly.scss';

interface MonthlyProps {}

export const Monthly: React.FC<MonthlyProps> = () => {
    const [targetDate, setTargetDate] = useState(new Date());
    const targetBudgetList = useSelector((state: RootState) =>
        getTargetDateList(state, [
            targetDate.getFullYear(),
            targetDate.getMonth() + 1,
        ])
    );

    // const [eventList, setEventList] = useState<
    //     { title: string; date: string }[]
    // >([]);
    let eventList: { title: string; date: string }[] = [];

    for (let day = 1; day <= 31; day++) {
        let fullDate = `${targetDate.getFullYear()}-${
            targetDate.getMonth() + 1
        }-${day}`;
        const index = targetBudgetList.findIndex(
            ({ date }) => date === fullDate
        );

        if (index !== -1) {
            const targetBudget = getTargetDateList(
                targetBudgetList,
                [0, 0],
                fullDate
            );

            const outgoSum = sumAmount(targetBudget, 0);
            const incomeSum = sumAmount(targetBudget, 1);

            if (outgoSum !== 0) {
                eventList = [
                    ...eventList,
                    {
                        title: `${outgoSum}`,
                        date: `${targetDate.getFullYear()}-${
                            targetDate.getMonth() + 1
                        }-${day.toString().padStart(2, '0')}`,
                    },
                ];
            }
            if (incomeSum !== 0) {
                eventList = [
                    {
                        title: `${incomeSum}`,
                        date: `${targetDate.getFullYear()}-${
                            targetDate.getMonth() + 1
                        }-${day.toString().padStart(2, '0')}`,
                    },

                    ...eventList,
                ];
            }

            // balanceType.forEach((type) => {
            //     const sum = sumAmount(targetBudget, 0);

            //     if (sum !== 0) {
            //     }
            // });
        }
    }


    return (
        <div>
            <FullCalendar
                plugins={[dayGridPlugin]}
                initialView="dayGridMonth"
                locales={allLocales}
                locale="ja"
                // events={[{ title: 'sampe', date: `2021-10-001` }]}
                events={eventList}
            />
        </div>
    );
};
