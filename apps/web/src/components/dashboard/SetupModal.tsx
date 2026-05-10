"use client";

import type { SettingsActionState } from "@/lib/actions/settings";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

interface Props {
    /** 保存完了後にローカル state を更新するコールバック */
    onSave: (totalAssets: number, monthlyIncome: number) => void;
    /** useActionState から渡す formAction */
    formAction: (payload: FormData) => void;
    /** useActionState から渡す state */
    actionState: SettingsActionState;
    /** 前回保存済みの値（再設定時に初期セット） */
    defaultAssets?: number;
    defaultIncome?: number;
    /** 設定済み状態から開いた場合に表示する閉じるボタン */
    onClose?: () => void;
}

/** 資産・月次収入を入力するセットアップモーダル */
export function SetupModal({
    onSave,
    formAction,
    actionState,
    defaultAssets,
    defaultIncome,
    onClose,
}: Props) {
    function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        const fd = new FormData(e.currentTarget);
        const assets = Number(fd.get("totalAssets"));
        const income = Number(fd.get("monthlyIncome") ?? 0);
        if (assets < 0 || Number.isNaN(assets)) return;
        formAction(fd);
        onSave(assets, income);
    }

    const isReconfigure = defaultAssets !== undefined;

    return (
        <Dialog open={true} onOpenChange={(open) => { if (!open) onClose?.(); }}>
            <DialogContent
                showCloseButton={Boolean(onClose)}
                className="max-w-md border-2 border-[#1c1410] bg-[#fffdf5] p-8"
                style={{ boxShadow: "var(--shadow-pop)" }}
            >
                {/* 幾何学デコレーション */}
                <div
                    className="pointer-events-none absolute right-16 top-4 h-6 w-6 rounded-full border border-[#f18840]/20 bg-[#fff6ee]"
                    aria-hidden="true"
                />
                <div
                    className="pointer-events-none absolute left-6 bottom-6 h-4 w-4 rotate-12 rounded-sm border border-[#35b5a2]/20 bg-[#ecfaf8]"
                    aria-hidden="true"
                />

                <DialogHeader>
                    <p className="text-xs font-bold text-[#1c1410]/40 uppercase tracking-wider">
                        {isReconfigure ? "設定の更新" : "はじめに"}
                    </p>
                    <DialogTitle className="text-xl font-extrabold">
                        {isReconfigure ? "資産データを更新する" : "家計の寿命を計算します"}
                    </DialogTitle>
                    {!isReconfigure && (
                        <DialogDescription className="text-sm text-[#1c1410]/60">
                            現在の資産と収入を入力すると、今のペースで
                            <span className="font-bold text-[#f18840]">
                                あと何年・何ヶ月 自由に暮らせるか
                            </span>
                            がわかります。
                        </DialogDescription>
                    )}
                </DialogHeader>

                {actionState.error && (
                    <p className="rounded-xl border border-[#f87171]/40 bg-[#fee2e2] px-3 py-2 text-sm font-medium text-[#1c1410]">
                        {actionState.error}
                    </p>
                )}

                <form onSubmit={handleSubmit} className={isReconfigure ? "mt-4 flex flex-col gap-5" : "flex flex-col gap-5"}>
                    <div className="flex flex-col gap-1.5">
                        <label className="text-sm font-bold text-[#1c1410]" htmlFor="totalAssets">
                            現在の総資産（円）
                        </label>
                        <input
                            id="totalAssets"
                            name="totalAssets"
                            type="number"
                            required
                            min={0}
                            defaultValue={defaultAssets}
                            placeholder="5,000,000"
                            className="input-pop"
                        />
                        <p className="text-xs text-[#1c1410]/40">
                            貯金・投資・現金の合計額を入力してください。
                        </p>
                    </div>

                    <div className="flex flex-col gap-1.5">
                        <label className="text-sm font-bold text-[#1c1410]" htmlFor="monthlyIncome">
                            月次の固定収入（円）
                            <span className="ml-1 font-normal text-[#1c1410]/40">— 任意</span>
                        </label>
                        <input
                            id="monthlyIncome"
                            name="monthlyIncome"
                            type="number"
                            min={0}
                            defaultValue={defaultIncome ?? 0}
                            placeholder="0"
                            className="input-pop"
                        />
                        <p className="text-xs text-[#1c1410]/40">
                            確定している収入のみ入力してください。不明な場合は 0 のままで構いません。
                        </p>
                    </div>

                    <button type="submit" className="btn-candy w-full py-3">
                        {isReconfigure ? "更新する" : "家計の寿命を計算する"}
                    </button>
                </form>
            </DialogContent>
        </Dialog>
    );
}
