"use client";

import React, { useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { createClient } from "@/lib/supabase-client";

export default function LoginPage() {
  const router = useRouter();
  const params = useParams();
  const locale = params.locale as string;
  const isAr = locale === "ar";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [role, setRole] = useState("scout"); // scout or admin
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const supabase = createClient();

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");
    setSuccessMsg("");

    try {
      if (isSignUp) {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: fullName,
              role: role,
            },
          },
        });

        if (error) throw error;
        
        if (data.user && data.session) {
          // Auto logged in (e.g. email confirmation disabled in Supabase)
          router.replace(`/${locale}/dashboard/scout`);
        } else {
          setSuccessMsg(
            isAr
              ? "تم إرسال بريد إلكتروني لتأكيد الحساب. يرجى التحقق من بريدك الإلكتروني."
              : "Check your email for the confirmation link to complete registration."
          );
        }
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) throw error;

        // Redirect based on role check (the middleware handles checking role)
        router.replace(`/${locale}/dashboard/scout`);
      }
    } catch (err: any) {
      setErrorMsg(err.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-scout-navy relative overflow-hidden px-4">
      {/* Background decoration */}
      <div className="absolute top-[-20%] left-[-20%] w-[60%] h-[60%] rounded-full bg-scout-green-light/20 blur-3xl" />
      <div className="absolute bottom-[-20%] right-[-20%] w-[60%] h-[60%] rounded-full bg-scout-gold/10 blur-3xl" />

      <div className="w-full max-w-md glass-panel-dark p-8 rounded-2xl shadow-2xl relative z-10 border border-white/10 text-white">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold font-display tracking-tight text-scout-gold">
            {isAr ? "بوابة كشافة الأرز" : "Scouts des Cèdres Portal"}
          </h1>
          <p className="text-white/60 mt-2 text-sm">
            {isAr
              ? "مسابقة Goal Rush - كأس العالم ٢٠٢٦"
              : "World Cup 2026 Goal Rush Fundraising"}
          </p>
        </div>

        {errorMsg && (
          <div className="bg-red-900/40 border border-red-500/50 text-red-200 px-4 py-3 rounded-lg text-sm mb-6">
            {errorMsg}
          </div>
        )}

        {successMsg && (
          <div className="bg-scout-green-light/40 border border-scout-green-light text-green-200 px-4 py-3 rounded-lg text-sm mb-6">
            {successMsg}
          </div>
        )}

        <form onSubmit={handleAuth} className="space-y-5">
          {isSignUp && (
            <div>
              <label className="block text-sm font-medium mb-1.5 text-white/80">
                {isAr ? "الاسم الكامل" : "Full Name"}
              </label>
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full px-4 py-2.5 rounded-lg bg-scout-navy-dark/60 border border-white/10 focus:border-scout-gold focus:outline-none transition text-white placeholder-white/30"
                placeholder={isAr ? "مارون الحايك" : "John Doe"}
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium mb-1.5 text-white/80">
              {isAr ? "البريد الإلكتروني" : "Email Address"}
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2.5 rounded-lg bg-scout-navy-dark/60 border border-white/10 focus:border-scout-gold focus:outline-none transition text-white placeholder-white/30"
              placeholder="scout@sdcsaintjeanmarc.org"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1.5 text-white/80">
              {isAr ? "كلمة المرور" : "Password"}
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2.5 rounded-lg bg-scout-navy-dark/60 border border-white/10 focus:border-scout-gold focus:outline-none transition text-white placeholder-white/30"
              placeholder="••••••••"
            />
          </div>

          {isSignUp && (
            <div>
              <label className="block text-sm font-medium mb-1.5 text-white/80">
                {isAr ? "الدور الكشفي" : "Role"}
              </label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full px-4 py-2.5 rounded-lg bg-scout-navy-dark/60 border border-white/10 focus:border-scout-gold focus:outline-none transition text-white"
              >
                <option value="scout" className="bg-scout-navy text-white">
                  {isAr ? "كشاف (Scout)" : "Scout"}
                </option>
                <option value="admin" className="bg-scout-navy text-white">
                  {isAr ? "مسؤول (Admin)" : "Admin"}
                </option>
              </select>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-lg bg-scout-gold hover:bg-scout-gold-light text-scout-navy font-semibold shadow-lg hover:shadow-scout-gold/20 transition-all duration-300 disabled:opacity-50 mt-2 font-display cursor-pointer"
          >
            {loading ? (
              <span className="inline-block animate-spin border-2 border-scout-navy border-t-transparent rounded-full w-5 h-5" />
            ) : isSignUp ? (
              isAr ? "إنشاء حساب" : "Create Account"
            ) : (
              isAr ? "تسجيل الدخول" : "Sign In"
            )}
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-white/60">
          {isSignUp ? (
            <>
              {isAr ? "لديك حساب بالفعل؟ " : "Already have an account? "}
              <button
                type="button"
                onClick={() => setIsSignUp(false)}
                className="text-scout-gold hover:underline"
              >
                {isAr ? "سجل دخولك" : "Sign In"}
              </button>
            </>
          ) : (
            <>
              {isAr ? "ليس لديك حساب كشاف؟ " : "Don't have a scout account? "}
              <button
                type="button"
                onClick={() => setIsSignUp(true)}
                className="text-scout-gold hover:underline"
              >
                {isAr ? "سجل الآن" : "Register Now"}
              </button>
            </>
          )}
        </div>
      </div>
    </main>
  );
}
