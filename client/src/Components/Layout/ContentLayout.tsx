import styles from '../../styles/ContentLayout.module.scss';

interface ContentLayoutProp {
    children: React.ReactElement;
    title?: string;
}
export const ContentLayout: React.FC<ContentLayoutProp> = ({
    children,
    title,
}) => {
    return (
        <section className={styles.content}>
            {title ? <h2 className={styles.headTitle}>{title}</h2> : <></>}
            {children}
        </section>
    );
};
