interface ContentLayoutProp {
    children: React.ReactElement;
    title?: string;
}
export const ContentLayout: React.FC<ContentLayoutProp> = ({
    children,
    title,
}) => {
    return (
        <section className="content">
            {title ? <h2 className="headTitle">{title}</h2> : <></>}
            {children}
        </section>
    );
};
