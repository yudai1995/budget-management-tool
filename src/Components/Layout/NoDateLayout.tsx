import { Budget } from '../../Model/budget.model';

interface NoDateLayoutProp {
    children: React.ReactElement;
    data: Budget[];
    text?: string;
}
export const NoDateLayout: React.FC<NoDateLayoutProp> = ({
    children,
    data,
    text,
}) => {
    return (
        <>
            {data.length ? (
                children
            ) : (
                <h2>{text ? { text } : 'データがありません'}</h2>
            )}
        </>
    );
};
