import React from 'react'
import { useState, useCallback, useRef } from 'react'
import { useHistory } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { RootState } from '../store'
import { sumAmount, getTargetDateList } from '../store/budgetListSlice'
import { balanceType, BalanceType } from '../Model/budget.model'
import { getYear, getMonth, getDate } from '../Model/Date.model'
import FullCalendar, { EventContentArg } from '@fullcalendar/react'
import dayGridPlugin from '@fullcalendar/daygrid'
import allLocales from '@fullcalendar/core/locales-all'
import interactionPlugin, { DateClickArg } from '@fullcalendar/interaction'
import '../styles/Monthly.module.scss'
import { Helmet } from 'react-helmet'
import { pageTitle } from '../Model/navigation.model'

interface MonthlyProps {}

export const Monthly: React.FC<MonthlyProps> = () => {
    const calendarRef = useRef<FullCalendar>(null!)
    const [targetDate, setTargetDate] = useState(new Date())

    const customPrevHandler = useCallback(() => {
        const calendarApi = calendarRef.current.getApi()
        calendarApi.prev()

        const currentDate = calendarApi.getDate()
        setTargetDate(currentDate)
    }, [])

    const customNextHandler = useCallback(() => {
        const calendarApi = calendarRef.current.getApi()
        calendarApi.next()

        const currentDate = calendarApi.getDate()
        setTargetDate(currentDate)
    }, [])

    const targetBudgetList = useSelector((state: RootState) => getTargetDateList(state, [targetDate.getFullYear(), targetDate.getMonth() + 1]))

    const history = useHistory()
    const dateClickHandler = useCallback(
        (arg: DateClickArg) => {
            history.push(`/edit`, { date: arg.date })
        },
        [history]
    )

    // カレンダーに掲載するデータを取得
    let eventList: {
        title: string
        date: string
        typenum: BalanceType
        dateStr: string
    }[] = []

    if (targetBudgetList.length) {
        targetBudgetList.forEach((data) => {
            const date = `${getYear(data.date)}-${getMonth(data.date).padStart(2, '0')}-${getDate(data.date).padStart(2, '0')}`

            const targetDayList = getTargetDateList(targetBudgetList, [0, 0], data.date)
            const sum = sumAmount(targetDayList, data.balanceType)
            const index = eventList.findIndex(({ dateStr, typenum }) => dateStr === data.date && typenum === data.balanceType)

            if (index === -1 && sum !== 0) {
                eventList = [
                    ...eventList,
                    {
                        title: `${sum}`,
                        date: data.balanceType === 0 ? date + ' 00:00:00' : date + ' 00:00:10',
                        typenum: data.balanceType,
                        dateStr: data.date,
                    },
                ]
            }
        })
    }

    // 結果数値
    const renderReportContent = (eventInfo: EventContentArg) => (
        <span className={eventInfo.event.extendedProps.typenum === 0 ? balanceType[0].type : balanceType[1].type}>
            <span className="sign">{eventInfo.event.extendedProps.typenum === 0 ? '-' : '+'}</span>
            <span className="amount">{eventInfo.event.title}</span>
        </span>
    )
    const title = pageTitle.Monthly

    return (
        <>
            <Helmet>
                <meta name="description" content={`家計簿管理の${title}画面です`} />
                <meta name="keywords" content={`家計簿, 支出管理, ${title}`} />
                <meta property="og:title" content={`${title} | 家計簿管理`} />
                <meta property="og:description" content={`家計簿管理の${title}画面です`} />
                <title>{`${title} | 家計簿管理`}</title>
            </Helmet>
            <div>
                <FullCalendar
                    plugins={[dayGridPlugin, interactionPlugin]}
                    initialView="dayGridMonth"
                    locales={allLocales}
                    locale="ja"
                    events={eventList}
                    eventContent={renderReportContent}
                    eventClick={(e) => history.push(`/report/${e.event.extendedProps.dateStr}`)}
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
        </>
    )
}
