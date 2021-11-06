import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { typeList } from '../../../Model/Date.model';
import { RootState } from '../../../store';
import {
    setTargetDate,
    setTargetMonth,
    setTargetYear,
} from '../../../store/ReportStateSlice';

import styles from '../../../styles/Report/DateContorol.module.scss';

export const DateContorol: React.FC = () => {
    const reportType = useSelector(
        (state: RootState) => state.ReportState.reportType
    );
    const targetDate = useSelector(
        (state: RootState) => state.ReportState.targetDate
    );
    const targetMonth = useSelector(
        (state: RootState) => state.ReportState.targetMonth
    );
    const targetYear = useSelector(
        (state: RootState) => state.ReportState.targetYear
    );

    const dispatch = useDispatch();
    const onClickPrevMonthBtn = () => {
        const newDate = new Date(
            targetDate.setMonth(targetDate.getMonth() - 1)
        );
        dispatch(setTargetDate({ targetDate: newDate }));

        const newMonth = new Date(
            targetMonth.setMonth(targetMonth.getMonth() - 1)
        );
        dispatch(setTargetMonth({ targetMonth: newMonth }));
    };

    const onClickNextMonthBtn = () => {
        const newDate = new Date(
            targetDate.setMonth(targetDate.getMonth() + 1)
        );
        dispatch(setTargetDate({ targetDate: newDate }));

        const newMonth = new Date(
            targetMonth.setMonth(targetMonth.getMonth() + 1)
        );
        dispatch(setTargetMonth({ targetMonth: newMonth }));
    };

    const onClickPrevYearBtn = () => {
        const newDate = new Date(
            targetDate.setFullYear(targetDate.getFullYear() - 1)
        );
        dispatch(setTargetDate({ targetDate: newDate }));

        const newYear = new Date(
            targetYear.setFullYear(targetYear.getFullYear() - 1)
        );
        dispatch(setTargetYear({ targetYear: newYear }));
    };

    const onClickNextYearBtn = () => {
        const newDate = new Date(
            targetDate.setFullYear(targetDate.getFullYear() + 1)
        );
        dispatch(setTargetDate({ targetDate: newDate }));

        const newYear = new Date(
            targetYear.setFullYear(targetYear.getFullYear() + 1)
        );
        dispatch(setTargetYear({ targetYear: newYear }));
    };

    return (
        <div className={styles.contorolArea}>
            {reportType === typeList[0] ? (
                <>
                    <button
                        onClick={onClickPrevMonthBtn}
                        className={`${styles.changeDateBtn} iconBtn prev`}
                    ></button>
                    <p className={styles.date}>
                        {`${targetDate.getFullYear()}年${
                            targetDate.getMonth() + 1
                        }月`}
                    </p>

                    <button
                        onClick={onClickNextMonthBtn}
                        className={`${styles.changeDateBtn} iconBtn next`}
                    ></button>
                </>
            ) : (
                <>
                    <button
                        onClick={onClickPrevYearBtn}
                        className={`${styles.changeDateBtn} iconBtn prev`}
                    ></button>
                    <p className={styles.date}>
                        {`${targetDate.getFullYear()}年`}
                    </p>

                    <button
                        onClick={onClickNextYearBtn}
                        className={`${styles.changeDateBtn} iconBtn next`}
                    ></button>
                </>
            )}
        </div>
    );
};
