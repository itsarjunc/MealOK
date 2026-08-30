"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { registerUser } from "@/lib/actions/register";
import { RefreshCw, UserPlus } from "lucide-react";
import { Logo } from "@/components/Logo";

function createCaptcha() {
  const first = Math.floor(Math.random() * 8) + 2;
  const second = Math.floor(Math.random() * 8) + 1;
  return { first, second, answer: first + second };
}

export function RegisterClient() {
  const router = useRouter();
  const [captcha, setCaptcha] = useState(createCaptcha);
  const [captchaAnswer, setCaptchaAnswer] = useState("");
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState("");

  const refreshCaptcha = () => {
    setCaptcha(createCaptcha());
    setCaptchaAnswer("");
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");

    if (Number(captchaAnswer) !== captcha.answer) {
      setError("That answer is not correct. Try the new challenge.");
      refreshCaptcha();
      return;
    }

    const formData = new FormData(event.currentTarget);
    setIsPending(true);
    try {
      await registerUser({ name: String(formData.get("name") || ""), email: String(formData.get("email") || ""), password: String(formData.get("password") || "") });
      router.push("/login?registered=1");
    } catch (registrationError) {
      setError(registrationError instanceof Error ? registrationError.message : "Unable to create account.");
      setIsPending(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-surface-muted p-4 md:p-8">
      <div className="flex w-full max-w-sm flex-col items-center">
        <div className="mb-5 flex justify-center select-none">
          <Logo className="h-12 w-auto" />
        </div>

        <div className="w-full rounded-[2rem] border border-border bg-surface p-6 shadow-[0_12px_40px_rgba(0,0,0,0.06)] md:p-10">
          <div className="mb-6 text-center">
          <p className="mt-5 text-[10px] font-extrabold uppercase tracking-[0.2em] text-foreground-muted">Join your household kitchen</p>
          <h1 className="mt-2 text-2xl font-black tracking-tight text-foreground">Create your account</h1>
          </div>

        {error && <div className="mb-5 rounded-xl border border-red-100 bg-red-50 p-3 text-center text-sm font-bold text-red-700">{error}</div>}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div><label htmlFor="name" className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-foreground">Your name</label><input id="name" name="name" type="text" required autoComplete="name" className="w-full rounded-xl border border-border bg-surface-muted p-3 text-foreground outline-none transition focus:border-zomato focus:ring-1 focus:ring-zomato" /></div>
          <div><label htmlFor="email" className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-foreground">Email</label><input id="email" name="email" type="email" required autoComplete="email" className="w-full rounded-xl border border-border bg-surface-muted p-3 text-foreground outline-none transition focus:border-zomato focus:ring-1 focus:ring-zomato" /></div>
          <div><label htmlFor="password" className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-foreground">Password</label><input id="password" name="password" type="password" required minLength={8} autoComplete="new-password" className="w-full rounded-xl border border-border bg-surface-muted p-3 text-foreground outline-none transition focus:border-zomato focus:ring-1 focus:ring-zomato" /><p className="mt-1.5 text-[10px] font-medium text-foreground-muted">Use at least 8 characters.</p></div>
          <div className="rounded-2xl border border-border bg-surface-muted p-4"><div className="flex items-center justify-between gap-3"><div><label htmlFor="captcha" className="text-xs font-extrabold uppercase tracking-wide text-foreground">Quick check</label><p className="mt-1 text-sm font-bold text-foreground">What is {captcha.first} + {captcha.second}?</p></div><button type="button" onClick={refreshCaptcha} aria-label="New CAPTCHA" className="flex h-9 w-9 items-center justify-center rounded-xl border border-border bg-surface text-foreground-muted hover:bg-border"><RefreshCw className="h-4 w-4" /></button></div><input id="captcha" type="number" inputMode="numeric" required value={captchaAnswer} onChange={(event) => setCaptchaAnswer(event.target.value)} className="mt-3 w-full rounded-xl border border-border bg-surface p-3 text-foreground outline-none transition focus:border-zomato focus:ring-1 focus:ring-zomato" /></div>
          <button type="submit" disabled={isPending} className="mt-1 flex w-full items-center justify-center gap-2 rounded-xl bg-zomato py-3 font-bold text-white transition hover:bg-zomato-dark disabled:opacity-50"><UserPlus className="h-4 w-4" />{isPending ? "Creating account..." : "Create account"}</button>
        </form>

        <p className="mt-6 text-center text-xs font-medium text-foreground-muted">Already have an account? <Link href="/login" className="font-extrabold text-foreground hover:text-zomato">Sign in</Link></p>
        </div>
      </div>
    </div>
  );
}
