import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { RegisterClient } from "./client";

export default async function RegisterPage() {
  const session = await auth();
  if (session) redirect("/home");

  return <RegisterClient />;
}
