import type { Metadata } from "next";
import { LoginForm } from "@/components/login/LoginForm";

export const metadata: Metadata = {
  title: "ログイン | 家計管理",
};

export default function LoginPage() {
  return <LoginForm />;
}
