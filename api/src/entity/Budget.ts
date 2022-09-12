import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  UpdateDateColumn,
  DeleteDateColumn,
  CreateDateColumn,
  Generated,
} from 'typeorm';

@Entity({
  name: 'budget_list',
})
export class Budget {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'int' })
  amount: number;

  @Column({ enum: [0, 1] })
  balanceType: 0 | 1;

  @Column({ default: 1 })
  categoryId: number;

  @Column({ nullable: true })
  content: string;

  @Column()
  date: string;

  @CreateDateColumn({ update: false })
  createdDate: Date;

  @UpdateDateColumn()
  updatedDate: Date;

  @DeleteDateColumn()
  deletedDate: Date;
}
