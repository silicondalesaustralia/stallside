import { redirect } from "next/navigation";

/** Legacy magic-link route — codes are entered at /login/code. */
export default function CheckEmailPage() {
  redirect("/login");
}
