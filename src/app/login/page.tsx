import { auth, signIn } from "@/auth";
import { redirect } from "next/navigation";

export default async function LoginPage() {
  const session = await auth();
  if (session) {
    redirect("/home");
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-surface p-4 md:p-8">
      <div className="bg-surface p-6 md:p-10 rounded-3xl md:shadow-[0_8px_30px_rgb(0,0,0,0.04)] max-w-sm w-full md:border border-border">
        <h1 className="text-4xl font-extrabold mb-8 text-center text-zomato tracking-tight">Mealok</h1>
        <form
          action={async (formData) => {
            "use server"
            await signIn("credentials", formData)
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
