import React, { useRef } from "react";
import { BalanceType } from '../Model/budget.model';

interface InputFormProps {
    onSubmitHandler: (newAmount: number, newType: BalanceType, newContent: string) => void
}


export const InputForm: React.FC<InputFormProps> = (props) => {

    // useRefを実行、このrefを使用しinputDOMオブジェクトにrefオブジェクトを割り当てる
    const amountInputRef = useRef<HTMLInputElement>(null);
    const contentInputRef = useRef<HTMLInputElement>(null);

    const newItemSubmitHandler = (event: React.FormEvent) => {
        event.preventDefault();

        const newAmount = +amountInputRef.current!.value;
        const newContent = contentInputRef.current!.value;
        const newType = (newAmount >= 0) ? 'income' : 'outgo';


        props.onSubmitHandler(newAmount, newType, newContent)
        console.log('run');
        

    }

    return (
        <form onSubmit={newItemSubmitHandler} className="inner">
            <div className="inputForm">
                <label htmlFor="amount">金額</label>
                <input type="number" id="amount" ref={amountInputRef} placeholder="Enter amount to add."/>
            </div>

            <div className="inputForm">
                <label htmlFor="content">内容</label>
                <input type="text" id="amount" ref={contentInputRef} placeholder="Enter to add."/>
            </div>
            <button type="submit">追加</button>
        </form>
    )

}