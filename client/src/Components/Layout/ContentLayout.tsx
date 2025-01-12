import classNames from 'classnames/bind'
import styles from '../../styles/ContentLayout.module.scss'

interface ContentLayoutProp {
    children: React.ReactElement
    title: string | false
    option?: string
}

export const ContentLayout: React.FC<ContentLayoutProp> = ({ children, title, option }) => {
    const cx = classNames.bind(styles)
    const optionClass = (option?: string) => {
        return cx({
            content: true,
            monthly: option === 'monthly',
        })
    }

    return (
        <section className={optionClass(option)}>
            {title ? <h2 className={styles.headTitle}>{title}</h2> : <></>}
            {children}
        </section>
    )
}
