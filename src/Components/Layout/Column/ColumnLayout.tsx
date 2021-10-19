import '../../../styles/ColumnLayout.scss';

interface ColumnLayoutProp {
    children: [React.ReactElement, React.ReactElement];
}
export const ColumnLayout: React.FC<ColumnLayoutProp> = ({ children }) => {
    return (
        <div className="columnWrapper" style={{ display: 'flex' }}>
            <div className="subColumn" style={{ width: '40%' }}>
                {children[0]}
            </div>
            <div
                className="mainColumn"
                style={{
                    width: '60%',
                    marginLeft: '10px',
                }}
            >
                {children[1]}
            </div>
        </div>
    );
};
