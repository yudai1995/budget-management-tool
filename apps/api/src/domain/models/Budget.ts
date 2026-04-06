export interface BudgetProps {
    id: string
    amount: number
    balanceType: 0 | 1
    userId: string
    categoryId: number
    content: string | null
    date: string
    createdDate: Date
    updatedDate: Date
    deletedDate: Date | null
}

/** budget_list に対応するドメインエンティティ（インフラ依存なし） */
export class Budget {
    readonly id: string
    readonly amount: number
    readonly balanceType: 0 | 1
    readonly userId: string
    readonly categoryId: number
    readonly content: string | null
    readonly date: string
    readonly createdDate: Date
    readonly updatedDate: Date
    readonly deletedDate: Date | null

    private constructor(props: BudgetProps) {
        this.id = props.id
        this.amount = props.amount
        this.balanceType = props.balanceType
        this.userId = props.userId
        this.categoryId = props.categoryId
        this.content = props.content
        this.date = props.date
        this.createdDate = props.createdDate
        this.updatedDate = props.updatedDate
        this.deletedDate = props.deletedDate
    }

    static reconstruct(props: BudgetProps): Budget {
        return new Budget(props)
    }
}
