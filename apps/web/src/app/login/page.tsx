import type { Metadata } from "next";
import { LoginForm } from "@/components/login/LoginForm";

export const metadata: Metadata = {
  title: "ログイン | 家計管理",
};

type Props = {
  searchParams: Promise<{ returnTo?: string }>;
};

export default async function LoginPage({ searchParams }: Props) {
  const { returnTo } = await searchParams;
  return <LoginForm returnTo={returnTo} />;
}
