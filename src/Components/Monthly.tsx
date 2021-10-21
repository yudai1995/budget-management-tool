import React from 'react';
import { useState, useCallback, useRef } from 'react';
import { useHistory } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from '../store';
import { sumAmount, getTargetDateList } from '../store/budgetListSlice';
import { balanceType, BalanceType } from '../Model/budget.model';
import FullCalendar, { EventContentArg } from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import allLocales from '@fullcalendar/core/locales-all';
import interactionPlugin, { DateClickArg } from '@fullcalendar/interaction';
import '../styles/Monthly.scss';

interface MonthlyProps {}

export const Monthly: React.FC<MonthlyProps> = () => {
    const calendarRef = useRef<FullCalendar>(null!);
    const [targetDate, setTargetDate] = useState(new Date());

    const customPrevHandler = useCallback(() => {
        const calendarApi = calendarRef.current.getApi();
        const currentDate = calendarApi.getDate();

        setTargetDate(
            new Date(currentDate.setMonth(currentDate.getMonth() - 1))
        );
        calendarApi.prev();
    }, []);

    const customNextHandler = useCallback(() => {
        const calendarApi = calendarRef.current.getApi();
        const currentDate = calendarApi.getDate();

        setTargetDate(
            new Date(currentDate.setMonth(currentDate.getMonth() + 1))
        );
        calendarApi.next();
    }, []);

    const targetBudgetList = useSelector((state: RootState) =>
        getTargetDateList(state, [
            targetDate.getFullYear(),
            targetDate.getMonth() + 1,
        ])
    );

    const history = useHistory();
    const dateClickHandler = useCallback(
        (arg: DateClickArg) => {
            history.push(`/edit`, { date: arg.date });
        },
        [history]
    );

    let eventList: {
        title: string;
        date: string;
        typenum: BalanceType;
        dateStr: string;
    }[] = [];
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
                        }-${day.toString().padStart(2, '0')} 00:00:00`,
                        typenum: 0,
                        dateStr: fullDate,
                    },
                ];
            }
            if (incomeSum !== 0) {
                eventList = [
                    {
                        title: `${incomeSum}`,
                        date: `${targetDate.getFullYear()}-${
                            targetDate.getMonth() + 1
                        }-${day.toString().padStart(2, '0')} 00:00:10`,
                        typenum: 1,
                        dateStr: fullDate,
                    },

                    ...eventList,
                ];
            }

            // balanceType.forEach((type) => {
            //     const sum = sumAmount(targetBudget, type.typenum);
            //     console.log(sum);

            //     if (sum !== 0) {
            //     }
            // });
        }
    }

    // 結果数値
    const renderReportContent = (eventInfo: EventContentArg) => (
        <span
            className={
                eventInfo.event.extendedProps.typenum === 0
                    ? balanceType[0].type
                    : balanceType[1].type
            }
        >
            ¥
            <span className="sign">
                {eventInfo.event.extendedProps.typenum === 0 ? '-' : '+'}
            </span>
            {eventInfo.event.title}
        </span>
    );

    return (
        <div>
            <FullCalendar
                plugins={[dayGridPlugin, interactionPlugin]}
                initialView="dayGridMonth"
                locales={allLocales}
                locale="ja"
                events={eventList}
                eventContent={renderReportContent}
                eventClick={(e) =>
                    history.push(`/report/${e.event.extendedProps.dateStr}`)
                }
                dateClick={dateClickHandler}
                selectable={true}
                titleFormat={{
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                }}
                customButtons={{
                    customPrev: {
                        text: '<',
                        click: customPrevHandler,
                    },
                    customNext: {
                        text: '>',
                        click: customNextHandler,
                    },
                }}
                headerToolbar={{
                    start: 'customPrev',
                    center: 'title',
                    end: 'customNext',
                }}
                ref={calendarRef}
                editable={true}
            />
        </div>
    );
};
