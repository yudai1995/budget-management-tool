import { Column, CreateDateColumn, DeleteDateColumn, Entity, ManyToOne, JoinColumn, PrimaryColumn, UpdateDateColumn } from 'typeorm'
import { User } from './User'

@Entity({
    name: 'budget_list',
})
export class Budget {
    @PrimaryColumn({ type: 'varchar', length: 255, name: 'id' })
    id: string

    @Column({ type: 'int', name: 'amount' })
    amount: number

    @Column({ type: 'enum', enum: [0, 1], name: 'balanceType' })
    balanceType: 0 | 1

    @Column({ type: 'varchar', length: 255, name: 'userId' })
    userId: string

    @ManyToOne(() => User, (user) => user.budgets, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'userId', referencedColumnName: 'userId' })
    user: User

    @Column({ type: 'int', default: 1, name: 'categoryId' })
    categoryId: number

    @Column({ type: 'varchar', length: 255, nullable: true, name: 'content' })
    content: string

    @Column({ type: 'varchar', length: 255, name: 'date' })
    date: string

    @CreateDateColumn({ type: 'datetime', precision: 6, update: false, name: 'createdDate' })
    createdDate: Date

    @UpdateDateColumn({ type: 'datetime', precision: 6, name: 'updatedDate' })
    updatedDate: Date

    @DeleteDateColumn({ type: 'datetime', precision: 6, name: 'deletedDate' })
    deletedDate: Date
}
