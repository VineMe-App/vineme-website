"use client";

import { useState } from "react";
import {
  createBrowserSupabaseClient,
  isSupabaseConfigured,
} from "@/lib/supabase/client";

type LoginStep = "email" | "code";

export default function AdminLoginForm() {
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [step, setStep] = useState<LoginStep>("email");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSendCode = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setMessage("");

    if (!isSupabaseConfigured()) {
      setError("Supabase login is not configured for this website yet.");
      return;
    }

    const normalizedEmail = email.trim().toLowerCase();
    if (!normalizedEmail) {
      setError("Enter your church admin email address.");
      return;
    }

    setIsSubmitting(true);

    try {
      const supabase = createBrowserSupabaseClient();
      const { error: signInError } = await supabase.auth.signInWithOtp({
        email: normalizedEmail,
        options: {
          shouldCreateUser: false,
        },
      });

      if (signInError) {
        setError(signInError.message);
        return;
      }

      setEmail(normalizedEmail);
      setStep("code");
      setMessage("We sent a sign-in code to your email.");
    } catch {
      setError("Something went wrong sending your sign-in code.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleVerifyCode = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setMessage("");

    const trimmedCode = code.trim();
    if (!trimmedCode) {
      setError("Enter the code from your email.");
      return;
    }

    setIsSubmitting(true);

    try {
      const supabase = createBrowserSupabaseClient();
      const { data, error: verifyError } = await supabase.auth.verifyOtp({
        email,
        token: trimmedCode,
        type: "email",
      });

      if (verifyError || !data.user) {
        setError(verifyError?.message ?? "We could not verify that code.");
        return;
      }

      const { data: profile, error: profileError } = await supabase
        .from("users")
        .select("roles")
        .eq("id", data.user.id)
        .single();

      const roles = Array.isArray(profile?.roles) ? profile.roles : [];

      if (profileError || !roles.includes("church_admin")) {
        await supabase.auth.signOut();
        setError("This dashboard is only available to church admins.");
        return;
      }

      window.location.href = "/dashboard";
    } catch {
      setError("Something went wrong verifying your access.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (step === "code") {
    return (
      <form className="space-y-5" onSubmit={handleVerifyCode}>
        <div>
          <label htmlFor="code" className="text-sm font-black text-brand-dark">
            Email verification code
          </label>
          <input
            id="code"
            name="code"
            type="text"
            inputMode="numeric"
            autoComplete="one-time-code"
            placeholder="Enter 6-digit code"
            value={code}
            onChange={(event) => setCode(event.target.value)}
            className="mt-2 w-full rounded-xl border border-brand-dark/15 px-4 py-3 text-brand-dark outline-none transition-colors placeholder:text-brand-dark/35 focus:border-brand-pink"
          />
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="block w-full rounded-xl bg-brand-pink px-6 py-4 text-center font-black text-white shadow-lg shadow-brand-pink/20 transition-colors hover:bg-brand-dark disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSubmitting ? "Checking access..." : "Verify and sign in"}
        </button>

        <button
          type="button"
          onClick={() => {
            setStep("email");
            setCode("");
            setError("");
            setMessage("");
          }}
          className="w-full text-sm font-black text-brand-pink hover:text-brand-dark"
        >
          Use a different email
        </button>

        {message ? (
          <p className="text-sm leading-6 text-brand-dark/65">{message}</p>
        ) : null}
        {error ? (
          <p className="text-sm font-bold leading-6 text-brand-pink">{error}</p>
        ) : null}
      </form>
    );
  }

  return (
    <form className="space-y-5" onSubmit={handleSendCode}>
      <div>
        <label htmlFor="email" className="text-sm font-black text-brand-dark">
          Church admin email address
        </label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          placeholder="you@church.org"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          className="mt-2 w-full rounded-xl border border-brand-dark/15 px-4 py-3 text-brand-dark outline-none transition-colors placeholder:text-brand-dark/35 focus:border-brand-pink"
        />
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="block w-full rounded-xl bg-brand-pink px-6 py-4 text-center font-black text-white shadow-lg shadow-brand-pink/20 transition-colors hover:bg-brand-dark disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isSubmitting ? "Sending code..." : "Send sign-in code"}
      </button>

      {message ? (
        <p className="text-sm leading-6 text-brand-dark/65">{message}</p>
      ) : null}
      {error ? (
        <p className="text-sm font-bold leading-6 text-brand-pink">{error}</p>
      ) : null}
    </form>
  );
}
