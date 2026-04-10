import { redirect } from "next/navigation";

/** ルートアクセスは支出一覧へリダイレクト */
export default function Home() {
  redirect("/expenses");
}
