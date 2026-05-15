import { redirect } from "next/navigation";

export default function OnboardingRedirectPage() {
  // 旧 URL からの互換性維持: /setup へリダイレクト
  redirect("/setup");
}
