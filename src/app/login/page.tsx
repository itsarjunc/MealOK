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
    <div className="min-h-screen flex items-center justify-center bg-surface p-4 md:p-8">
      <div className="bg-surface p-6 md:p-10 rounded-3xl md:shadow-[0_8px_30px_rgb(0,0,0,0.04)] max-w-sm w-full md:border border-border">
        <h1 className="text-4xl font-extrabold mb-6 text-center text-zomato tracking-tight">Mealok</h1>
        
        {error && (
          <div className="mb-6 p-3 bg-red-50 text-zomato text-sm font-bold rounded-xl border border-red-100 text-center">
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
          <button type="submit" className="w-full bg-gradient-to-b from-zomato to-[#c52c38] text-white py-3.5 rounded-xl hover:brightness-105 font-bold text-lg mt-4 focus:outline-none border-b-4 border-[#9c1822] active:translate-y-[2px] active:border-b-2 transition-all shadow-md shadow-zomato/20">
            Sign In
          </button>
        </form>
      </div>
    </div>
  );
}
