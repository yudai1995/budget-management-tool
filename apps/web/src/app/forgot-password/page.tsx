import type { Metadata } from "next";
import { ForgotPasswordFlow } from "@/components/recovery/ForgotPasswordFlow";

export const metadata: Metadata = { title: "パスワードを忘れた場合 | 家計管理ツール" };

export default function ForgotPasswordPage() {
    return <ForgotPasswordFlow />;
}
