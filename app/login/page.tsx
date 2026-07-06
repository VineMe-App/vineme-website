import Image from "next/image";
import Link from "next/link";

export default function LoginPage() {
  return (
    <section className="bg-brand-beige px-5 py-16 sm:px-6 lg:py-24">
      <div className="mx-auto grid w-full max-w-6xl items-center gap-10 lg:grid-cols-[0.95fr_1.05fr]">
        <div>
          <p className="text-sm font-black uppercase tracking-[0.24em] text-brand-pink">
            VineMe sign in
          </p>
          <h1 className="mt-4 font-heading text-5xl font-black leading-[1.05] text-brand-dark sm:text-6xl">
            Welcome back to your church connection hub.
          </h1>
          <p className="mt-6 max-w-xl text-lg leading-8 text-brand-dark/75">
            Sign in to view your user database, track connection requests, and
            connect VineMe with ChurchSuite.
          </p>
        </div>

        <div className="rounded-3xl bg-white p-6 shadow-2xl shadow-brand-dark/10 sm:p-8">
          <Image
            src="/images/vineme-assets/LOGO/vineme_svg-05.svg"
            alt="VineMe"
            width={180}
            height={49}
            className="mb-8 h-8 w-auto"
            priority
          />

          <form className="space-y-5">
            <div>
              <label
                htmlFor="email"
                className="text-sm font-black text-brand-dark"
              >
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                placeholder="you@church.org"
                className="mt-2 w-full rounded-xl border border-brand-dark/15 px-4 py-3 text-brand-dark outline-none transition-colors placeholder:text-brand-dark/35 focus:border-brand-pink"
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="text-sm font-black text-brand-dark"
              >
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                placeholder="Enter your password"
                className="mt-2 w-full rounded-xl border border-brand-dark/15 px-4 py-3 text-brand-dark outline-none transition-colors placeholder:text-brand-dark/35 focus:border-brand-pink"
              />
            </div>

            <Link
              href="/dashboard"
              className="block w-full rounded-xl bg-brand-pink px-6 py-4 text-center font-black text-white shadow-lg shadow-brand-pink/20 transition-colors hover:bg-brand-dark"
            >
              Sign in to VineMe
            </Link>
          </form>

          <p className="mt-5 text-sm leading-6 text-brand-dark/60">
            Demo sign in for preview. Authentication can be wired to the live
            VineMe user system next.
          </p>
        </div>
      </div>
    </section>
  );
}
