import { ulid } from 'ulid'

/** 収支区分: 0=支出, 1=収入 */
export type BalanceType = 0 | 1

export interface ExpenseProps {
    id: string
    amount: number
    balanceType: BalanceType
    userId: string
    categoryId: number
    content: string | null
    date: string
    createdDate: Date
    updatedDate: Date
    deletedDate: Date | null
}

export interface CreateExpenseProps {
    amount: number
    balanceType: BalanceType
    userId: string
    categoryId?: number
    content?: string | null
    date: string
}

export class Expense {
    readonly id: string
    readonly amount: number
    readonly balanceType: BalanceType
    readonly userId: string
    readonly categoryId: number
    readonly content: string | null
    readonly date: string
    readonly createdDate: Date
    readonly updatedDate: Date
    readonly deletedDate: Date | null

    private constructor(props: ExpenseProps) {
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

    /** 新規支出を生成するファクトリメソッド（バリデーション付き） */
    static create(props: CreateExpenseProps): Expense {
        if (props.amount <= 0) {
            throw new Error('金額は正の値である必要があります')
        }
        if (!props.userId) {
            throw new Error('ユーザーIDは必須です')
        }
        if (!props.date) {
            throw new Error('日付は必須です')
        }

        const now = new Date()
        return new Expense({
            id: ulid(),
            amount: props.amount,
            balanceType: props.balanceType,
            userId: props.userId,
            categoryId: props.categoryId ?? 1,
            content: props.content ?? null,
            date: props.date,
            createdDate: now,
            updatedDate: now,
            deletedDate: null,
        })
    }

    /** 永続化済みデータからドメインモデルを再構築するファクトリメソッド */
    static reconstruct(props: ExpenseProps): Expense {
        return new Expense(props)
    }
}
