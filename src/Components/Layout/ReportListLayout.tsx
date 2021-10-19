import { Budget } from '../../Model/budget.model';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';
import { getCategoryName } from '../../store/CategoryListSlice';

interface ReportListLayoutProp {
    budgetData: Budget;
}
export const ReportListLayout: React.FC<ReportListLayoutProp> = ({
    budgetData,
}) => {
    const categoryName = useSelector((state: RootState) =>
        getCategoryName(state, budgetData.categoryId)
    );
    return (
        <>
            <span className="category">{categoryName}</span>
            <span className="content">
                {budgetData.content ? `${budgetData.content}:` : ''}
            </span>
            <span className="amount">{`¥${
                budgetData.balanceType === 0 ? '-' : '+'
            } ${budgetData.amount}`}</span>
        </>
    );
};
