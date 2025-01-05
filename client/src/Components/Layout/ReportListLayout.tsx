import { Budget, BalanceType } from '../../Model/budget.model';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../../store';
import { deleteBudget } from '../../store/budgetListSlice';
import {
    RequestData,
    RequestDataSuccess,
    RequestDataFailed,
} from '../../store/FetchingStateSlice';
import { getCategoryData } from '../../store/CategoryListSlice';
import classNames from 'classnames/bind';
import axios from 'axios';
import styles from '../../styles/ReportListLayout.module.scss';

interface ReportListLayoutProp {
    budgetData: Budget;
}
export const ReportListLayout: React.FC<ReportListLayoutProp> = ({
    budgetData,
}) => {
    const categoryData = useSelector((state: RootState) =>
        getCategoryData(state, budgetData.categoryId, budgetData.balanceType)
    );

    const dispatch = useDispatch();
    const onClickSetHandler = (
        event: React.MouseEvent<HTMLButtonElement, MouseEvent>,
        id: string
    ) => {
        event.preventDefault();
        dispatch(RequestData({}));
        axios
            .delete(`/api/budget/${id}`, {
                data: { id: id },
            })
            .then((response) => {
                dispatch(deleteBudget({ id }));
                dispatch(RequestDataSuccess({}));
            })
            .catch(function (error) {
                console.log(error);
                dispatch(RequestDataFailed({}));
            });
    };

    const cx = classNames.bind(styles);
    const signClass = (type: BalanceType) => {
        return cx({
            sign: true,
            outgo: type === 0,
            income: type === 1,
        });
    };

    return (
        <div className={styles.reportWrapper}>
            <div className={styles.category}>
                <span
                    className={styles.categoryIcon}
                    style={{ color: `${categoryData.color}` }}
                >
                    {categoryData.name}
                </span>
            </div>
            <span className={styles.content}>
                {budgetData.content ? `${budgetData.content}` : ''}
            </span>
            <span className={styles.amount}>
                <span className={signClass(budgetData.balanceType)}>{`¥${
                    budgetData.balanceType === 0 ? '-' : '+'
                }`}</span>
                {budgetData.amount.toLocaleString()}
            </span>
            <button
                className={styles.setBtn}
                onClick={(e) => onClickSetHandler(e, budgetData.id)}
            ></button>
        </div>
    );
};
