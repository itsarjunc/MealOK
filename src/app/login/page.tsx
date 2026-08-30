import { auth, signIn } from "@/auth";
import { AuthError } from "next-auth";
import { redirect } from "next/navigation";

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const session = await auth();
  if (session) {
    redirect("/home");
  }

  const { error } = await searchParams;

  return (
    <div className="flex min-h-screen items-center justify-center bg-surface-muted p-4 md:p-8">
      <div className="w-full max-w-sm rounded-[2rem] border border-border bg-surface p-6 shadow-[0_12px_40px_rgba(0,0,0,0.06)] md:p-10">
        <div className="flex justify-center mb-8 select-none">
          <img src="/branding/Vector.svg" alt="Logo" className="h-24 w-auto" />
        </div>
        
        {error && (
          <div className="mb-6 rounded-xl border border-red-100 bg-red-50 p-3 text-center text-sm font-bold text-red-700">
            {error === "CredentialsSignin" ? "Invalid email or password." : "Something went wrong. Please try again."}
          </div>
        )}

        <form
          action={async (formData) => {
            "use server"
            try {
              await signIn("credentials", formData)
            } catch (err) {
              if (err instanceof AuthError) {
                redirect("/login?error=CredentialsSignin");
              }
              throw err; // Rethrow Next.js redirect errors
            }
          }}
          className="flex flex-col gap-4"
        >
          <div>
            <label className="block text-xs font-bold mb-1.5 text-foreground uppercase tracking-wide">Email</label>
            <input
              name="email"
              type="email"
              required
              className="w-full border border-border bg-surface-muted text-foreground p-3 rounded-xl focus:border-zomato focus:ring-1 focus:ring-zomato outline-none transition-all"
              defaultValue="arjun@mealok.local"
            />
          </div>
          <div>
            <label className="block text-xs font-bold mb-1.5 text-foreground uppercase tracking-wide">Password</label>
            <input
              name="password"
              type="password"
              required
              className="w-full border border-border bg-surface-muted text-foreground p-3 rounded-xl focus:border-zomato focus:ring-1 focus:ring-zomato outline-none transition-all"
              defaultValue="password"
            />
          </div>
          <button type="submit" className="mt-2 w-full rounded-xl bg-zomato py-3 font-bold text-white transition hover:bg-zomato-dark focus:outline-none">
            Sign In
          </button>
        </form>
      </div>
    </div>
  );
}
