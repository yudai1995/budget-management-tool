import { Budget } from '../../Model/budget.model';

interface NoDateLayoutProp {
    children: React.ReactElement;
    data: Budget[];
    text?: string;
}

const style = { textAlign: 'center' as 'center', color: '#9a9a9a' };
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
                <>
                    {text ? (
                        <h2 style={{ textAlign: 'center', color: '#9a9a9a' }}>
                            {text}
                        </h2>
                    ) : (
                        <>
                            <h2 style={style}>入力データがございません</h2>
                            <p style={style}>収支をご入力ください</p>
                        </>
                    )}
                </>
            )}
        </>
    );
};
