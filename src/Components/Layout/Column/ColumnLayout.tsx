import '../../../styles/ColumnLayout.scss';

interface ColumnLayoutProp {
    children: [React.ReactElement, React.ReactElement];
    width: [number, number];
}
export const ColumnLayout: React.FC<ColumnLayoutProp> = ({ children, width }) => {
    return (
        <div className="columnWrapper" style={{ display: 'flex' }}>
            <div className="leftColumn" style={{ width: `${width[0]}%` }}>
                {children[0]}
            </div>
            <div
                className="rightColumn"
                style={{
                    width: `${width[1]}%`,
                    marginLeft: '10px',
                }}
            >
                {children[1]}
            </div>
        </div>
    );
};
