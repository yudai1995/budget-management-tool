import type { Metadata } from "next";
import { RegisterForm } from "@/components/register/RegisterForm";

export const metadata: Metadata = { title: "アカウント登録 | 家計管理ツール" };

export default function RegisterPage() {
    return <RegisterForm />;
}
