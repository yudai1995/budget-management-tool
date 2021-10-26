import { Budget, BalanceType } from '../../Model/budget.model';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';
import { getCategoryName } from '../../store/CategoryListSlice';
import classNames from 'classnames/bind';
import styles from '../../styles/ReportListLayout.module.scss';

interface ReportListLayoutProp {
    budgetData: Budget;
}
export const ReportListLayout: React.FC<ReportListLayoutProp> = ({
    budgetData,
}) => {
    const categoryName = useSelector((state: RootState) =>
        getCategoryName(state, budgetData.categoryId, budgetData.balanceType)
    );

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
                <span className={styles.categoryIcon}>{categoryName}</span>
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
        </div>
    );
};
