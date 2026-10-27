import { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Logo } from "@/components/gigclose/Logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { ToastAction } from "@/components/ui/toast";
import { WorkerSkillsSelector } from "@/components/gigclose/WorkerSkillsSelector";
import { AREA_OPTIONS, AppRole } from "@/lib/gigs";
import authBackground from "@/assets/gigclosesignup.jpg";
import promotionImage from "@/assets/gigclose-login-pic-removebg-preview.png";
import {
  ArrowLeft,
  ArrowRight,
  BriefcaseBusiness,
  Eye,
  EyeOff,
  Linkedin,
  Loader2,
  LockKeyhole,
  Mail,
  ShieldCheck,
  UserRound,
  Zap,
} from "lucide-react";

const signUpSchema = z.object({
  email: z.string().trim().email().max(255),
  password: z.string().min(8).max(72),
  display_name: z.string().trim().min(2).max(50),
  city: z.string().trim().min(1),
});

const signInSchema = z.object({
  email: z.string().trim().email().max(255),
  password: z.string().min(1).max(72),
});

const passwordResetSchema = z.object({
  password: z.string().min(8).max(72),
  confirmPassword: z.string(),
}).refine((values) => values.password === values.confirmPassword, {
  message: "Passwords do not match.",
  path: ["confirmPassword"],
});

const Auth = () => {
  const [params] = useSearchParams();
  const redirect = params.get("redirect") || "/app";
  const requestedRole = params.get("role");
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [accountType, setAccountType] = useState<AppRole>(requestedRole === "client" ? "client" : "worker");
  const [city, setCity] = useState(AREA_OPTIONS[0].label);
  const [workerSkills, setWorkerSkills] = useState<string[]>([]);
  const [showSignInPassword, setShowSignInPassword] = useState(false);
  const [showSignUpPassword, setShowSignUpPassword] = useState(false);
  const [authTab, setAuthTab] = useState("signin");
  const [isPasswordRecovery, setIsPasswordRecovery] = useState(params.get("mode") === "reset");
  const [rememberedEmail] = useState(() =>
    typeof window === "undefined" ? "" : window.localStorage.getItem("gigclose-remembered-email") ?? "",
  );
  const [rememberDevice, setRememberDevice] = useState(Boolean(rememberedEmail));
  const [signInEmail, setSignInEmail] = useState(rememberedEmail);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") setIsPasswordRecovery(true);
    });
    return () => subscription.unsubscribe();
  }, []);

  const handleSignUp = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const result = signUpSchema.safeParse({ email: fd.get("email"), password: fd.get("password"), display_name: fd.get("display_name"), city });
    if (!result.success) { toast({ title: "Check your details", description: result.error.issues[0].message, variant: "destructive" }); return; }
    if (accountType === "worker" && workerSkills.length === 0) {
      toast({ title: "Choose your skills", description: "Select at least one skill to help us find suitable jobs for you.", variant: "destructive" });
      return;
    }
    setLoading(true);
    const { data, error } = await supabase.auth.signUp({
      email: result.data.email, password: result.data.password,
      options: { emailRedirectTo: `${window.location.origin}${redirect}`, data: { display_name: result.data.display_name, account_type: accountType, city: result.data.city, skills: accountType === "worker" ? workerSkills : [] } },
    });
    setLoading(false);
    if (error) { toast({ title: "Sign up failed", description: error.message, variant: "destructive" }); return; }

    if (!data.session) {
      setSignInEmail(result.data.email);
      setAuthTab("signin");
      toast({
        title: "Check your email to continue",
        description: "Confirm your email address before signing in. If you already have an account, use Forgot password to regain access.",
      });
      return;
    }

    toast({ title: "Welcome to Gigsclose", description: `Your ${accountType} account is ready.` });
    navigate(redirect);
  };

  const handleSignIn = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const result = signInSchema.safeParse({ email: fd.get("email"), password: fd.get("password") });
    if (!result.success) { toast({ title: "Check your details", description: result.error.issues[0].message, variant: "destructive" }); return; }
    setLoading(true);
    const { data: signInData, error } = await supabase.auth.signInWithPassword({ email: result.data.email, password: result.data.password });
    if (error) {
      setLoading(false);
      const invalidCredentials = error.code === "invalid_credentials";
      toast({
        title: "Sign in failed",
        description: invalidCredentials
          ? "The email and password were not accepted. If this is the correct email, reset the password and then sign in as Employer."
          : error.message,
        variant: "destructive",
        ...(invalidCredentials && {
          action: (
            <ToastAction altText="Send a password reset email" onClick={() => void handleForgotPassword()}>
              Reset password
            </ToastAction>
          ),
        }),
      });
      return;
    }

    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("account_type")
      .eq("user_id", signInData.user.id)
      .maybeSingle();
    const actualRole = profile?.account_type ?? signInData.user.user_metadata?.account_type;

    if (profileError || actualRole !== accountType) {
      const { error: signOutError } = await supabase.auth.signOut();
      setLoading(false);
      if (profileError) {
        toast({
          title: "Could not verify your account",
          description: profileError.message,
          variant: "destructive",
        });
      } else {
        const actualRoleLabel = actualRole === "client"
          ? "Employer"
          : actualRole === "worker"
            ? "Job Seeker"
            : "an unrecognized account type";
        toast({
          title: "Choose the correct account type",
          description: `This account is registered as ${actualRoleLabel}. Select that option to sign in.`,
          variant: "destructive",
        });
      }
      if (signOutError) {
        toast({
          title: "Sign out failed",
          description: signOutError.message,
          variant: "destructive",
        });
      }
      return;
    }
    setLoading(false);
    try {
      if (rememberDevice) {
        window.localStorage.setItem("gigclose-remembered-email", result.data.email);
      } else {
        window.localStorage.removeItem("gigclose-remembered-email");
      }
    } catch {
      toast({ title: "Could not remember this device", description: "Your browser blocked local storage. You can still continue." });
    }
    navigate(redirect);
  };

  const handleForgotPassword = async () => {
    const result = z.string().trim().email().max(255).safeParse(signInEmail);
    if (!result.success) {
      toast({ title: "Enter your email", description: "Add a valid email address first so we can send a reset link.", variant: "destructive" });
      return;
    }

    setLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(result.data, {
      redirectTo: `${window.location.origin}/auth?mode=reset`,
    });
    setLoading(false);
    if (error) {
      toast({ title: "Password reset failed", description: error.message, variant: "destructive" });
      return;
    }
    toast({ title: "Check your email", description: "If an account exists for that address, password reset instructions are on the way." });
  };

  const handlePasswordReset = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const result = passwordResetSchema.safeParse({
      password: formData.get("password"),
      confirmPassword: formData.get("confirmPassword"),
    });
    if (!result.success) {
      toast({ title: "Check your password", description: result.error.issues[0].message, variant: "destructive" });
      return;
    }

    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password: result.data.password });
    setLoading(false);
    if (error) {
      toast({ title: "Password update failed", description: error.message, variant: "destructive" });
      return;
    }

    toast({ title: "Password updated", description: "Your password has been changed successfully." });
    navigate("/app", { replace: true });
  };

  const handleSocialSignIn = async (provider: "google" | "linkedin_oidc" | "apple") => {
    setLoading(true);
    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: { redirectTo: `${window.location.origin}${redirect}` },
    });
    setLoading(false);
    if (error) {
      toast({ title: "Social sign-in failed", description: error.message, variant: "destructive" });
    }
  };

  return (
    <main className="flex min-h-screen w-full flex-col items-stretch overflow-hidden bg-white text-slate-900 lg:min-h-[1024px] lg:flex-row lg:px-0">
      <section className="relative order-2 flex min-h-screen w-full flex-col items-center justify-center overflow-hidden bg-white px-4 py-6 lg:min-h-[1024px] lg:w-1/2 lg:px-12 xl:px-20">
        <img
          aria-hidden="true"
          src={authBackground}
          alt=""
          className="pointer-events-none absolute inset-0 h-full w-full scale-105 object-cover opacity-40 blur-lg"
        />
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-white/35 backdrop-blur-md" />
        <Link
          to="/"
          className="absolute left-4 top-4 z-20 inline-flex min-h-10 items-center gap-2 rounded-full px-2 text-sm font-semibold text-slate-700 transition hover:text-sky-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-600 focus-visible:ring-offset-2"
        >
          <ArrowLeft aria-hidden="true" className="h-4 w-4" />
          Back to home
        </Link>
        <div aria-hidden="true" className="pointer-events-none absolute -bottom-32 -right-24 h-96 w-96 rounded-full bg-sky-200/50 blur-3xl" />
        <div aria-hidden="true" className="pointer-events-none absolute -left-32 top-[-8rem] h-96 w-96 rounded-full bg-blue-100/70 blur-3xl" />

        <div className="relative z-10 flex w-full max-w-[448px] flex-col gap-6 pt-12 sm:pt-0">
        <header className="flex flex-col items-center gap-3 text-center lg:items-start lg:text-left">
          <Link to="/" aria-label="Gigsclose home" className="rounded-xl transition-opacity hover:opacity-80 lg:hidden">
            <span className="[&_img]:!h-9"><Logo /></span>
          </Link>
          <h1 className="w-full text-2xl font-extrabold leading-9 tracking-tight text-slate-900 sm:text-3xl">
            {isPasswordRecovery ? "Set a new password" : authTab === "signup" ? "Create your account" : "Welcome back"}
          </h1>
          <p className="w-full text-sm leading-5 text-slate-500">
            {isPasswordRecovery
              ? "Choose a new password for your GigClose account."
              : authTab === "signup"
                ? "Get started with your next local opportunity."
                : "Sign in to your GigClose job seeker or employer account"}
          </p>
        </header>

        <section className="w-full">
          {isPasswordRecovery ? (
            <form onSubmit={handlePasswordReset} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="reset-password" className="px-1 text-xs font-bold uppercase tracking-[0.05em] text-slate-700">New password</Label>
                <Input
                  id="reset-password"
                  name="password"
                  type="password"
                  required
                  minLength={8}
                  maxLength={72}
                  autoComplete="new-password"
                  placeholder="At least 8 characters"
                  className="h-[42px] rounded-xl border-slate-200 bg-slate-50 px-4 text-slate-950 placeholder:text-slate-500 focus-visible:ring-sky-600"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="reset-confirm-password" className="px-1 text-xs font-bold uppercase tracking-[0.05em] text-slate-700">Confirm new password</Label>
                <Input
                  id="reset-confirm-password"
                  name="confirmPassword"
                  type="password"
                  required
                  minLength={8}
                  maxLength={72}
                  autoComplete="new-password"
                  placeholder="Enter your new password again"
                  className="h-[42px] rounded-xl border-slate-200 bg-slate-50 px-4 text-slate-950 placeholder:text-slate-500 focus-visible:ring-sky-600"
                />
              </div>
              <Button type="submit" disabled={loading} className="h-12 w-full rounded-xl bg-gradient-to-r from-sky-500 to-sky-700 text-base font-bold text-white shadow-[0_10px_20px_-10px_rgba(14,165,233,0.5)] transition hover:from-sky-600 hover:to-sky-800 disabled:opacity-60">
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Update password"}
              </Button>
              <button
                type="button"
                onClick={() => {
                  setIsPasswordRecovery(false);
                  navigate("/auth", { replace: true });
                }}
                className="w-full text-sm font-semibold text-sky-700 hover:text-sky-800"
              >
                Back to sign in
              </button>
            </form>
          ) : (
            <>
          <div className="mb-6 grid grid-cols-2 rounded-xl border border-slate-200/60 bg-slate-100 p-1" aria-label="Choose account type">
            {([
              { role: "worker", label: "Job Seeker", Icon: UserRound },
              { role: "client", label: "Employer", Icon: BriefcaseBusiness },
            ] as const).map(({ role, label, Icon }) => {
              const selected = accountType === role;
              return (
                <button
                  key={role}
                  type="button"
                  aria-pressed={selected}
                  onClick={() => setAccountType(role)}
                  className={`flex min-h-9 items-center justify-center gap-1.5 rounded-lg px-3 text-xs font-bold transition ${
                    selected ? "border border-slate-200/50 bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-900"
                  }`}
                >
                  <Icon aria-hidden="true" className={`h-4 w-4 ${selected ? "text-sky-500" : "text-slate-400"}`} />
                  {label}
                </button>
              );
            })}
          </div>

          <Tabs value={authTab} onValueChange={setAuthTab}>
            <TabsContent value="signin" className="mt-0">
              <form onSubmit={handleSignIn} className="space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="si-email" className="px-1 text-xs font-bold uppercase tracking-[0.05em] text-slate-700">Work email</Label>
                  <div className="relative">
                    <Mail aria-hidden="true" className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <Input id="si-email" name="email" type="email" required autoComplete="email" value={signInEmail} onChange={(event) => setSignInEmail(event.target.value)} placeholder="alex.vance@agency.design" className="h-[42px] rounded-xl border-slate-200 bg-slate-50 pl-10 text-sm text-slate-950 placeholder:text-slate-500 focus-visible:ring-sky-600" />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between gap-3 px-1">
                    <Label htmlFor="si-password" className="text-xs font-bold uppercase tracking-[0.05em] text-slate-700">Password</Label>
                    <button type="button" onClick={handleForgotPassword} disabled={loading} className="text-xs font-semibold text-sky-700 hover:text-sky-800">
                      Forgot password?
                    </button>
                  </div>
                  <div className="relative">
                    <LockKeyhole aria-hidden="true" className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <Input
                      id="si-password"
                      name="password"
                      type={showSignInPassword ? "text" : "password"}
                      required
                      autoComplete="current-password"
                      placeholder="Enter your password"
                      className="h-[42px] rounded-xl border-slate-200 bg-slate-50 pl-10 pr-12 text-sm text-slate-950 placeholder:text-slate-500 focus-visible:ring-sky-600"
                    />
                    <button
                      type="button"
                      onClick={() => setShowSignInPassword((visible) => !visible)}
                      className="absolute right-2 top-1/2 grid h-8 w-8 -translate-y-1/2 place-items-center rounded-full text-slate-400 transition hover:bg-white hover:text-slate-900"
                      aria-label={showSignInPassword ? "Hide password" : "Show password"}
                    >
                      {showSignInPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
                <label className="flex items-center gap-2 px-1 pt-0.5 text-xs text-slate-600">
                  <input
                    type="checkbox"
                    checked={rememberDevice}
                    onChange={(event) => setRememberDevice(event.target.checked)}
                    className="h-4 w-4 rounded accent-sky-500"
                  />
                  Remember my email on this device
                </label>
                <Button type="submit" disabled={loading} className="h-12 w-full rounded-xl bg-gradient-to-r from-sky-500 to-sky-700 text-base font-bold text-white shadow-[0_10px_20px_-10px_rgba(14,165,233,0.5)] transition hover:from-sky-600 hover:to-sky-800 disabled:opacity-60">
                  {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : (
                    <span className="inline-flex items-center gap-2">
                      {accountType === "worker" ? "Sign in as Job Seeker" : "Sign in as Employer"}
                      <ArrowRight aria-hidden="true" className="h-4 w-4" />
                    </span>
                  )}
                </Button>
              </form>
              <div className="mt-6 space-y-4">
                <div className="relative flex items-center justify-center">
                  <div className="h-px w-full bg-slate-200" />
                  <span className="absolute px-3 text-xs font-semibold tracking-[0.05em] text-black">OR CONTINUE WITH</span>
                </div>
                <div className="grid grid-cols-3 gap-2.5">
                  <button
                    type="button"
                    disabled={loading}
                    onClick={() => void handleSocialSignIn("google")}
                    className="flex h-10 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:opacity-50"
                  >
                    <svg aria-hidden="true" viewBox="0 0 48 48" className="h-4 w-4">
                      <path fill="#FFC107" d="M43.6 24.5c0-1.4-.1-2.8-.4-4.1H24v7.8h11a9.4 9.4 0 0 1-4.1 6.2v5h6.6c3.9-3.6 6.1-8.8 6.1-14.9Z" />
                      <path fill="#34A853" d="M24 44c5.5 0 10.1-1.8 13.5-4.8l-6.6-5c-1.8 1.2-4.1 2-6.9 2-5.3 0-9.8-3.6-11.4-8.4H5.8v5.1A20 20 0 0 0 24 44Z" />
                      <path fill="#4A90E2" d="M12.6 27.8a12 12 0 0 1 0-7.6v-5.1H5.8a20 20 0 0 0 0 17.8l6.8-5.1Z" />
                      <path fill="#EA4335" d="M24 11.8c3 0 5.7 1 7.8 3l5.8-5.8A19.4 19.4 0 0 0 24 4 20 20 0 0 0 5.8 15.1l6.8 5.1c1.6-4.8 6.1-8.4 11.4-8.4Z" />
                    </svg>
                    Google
                  </button>
                  <button
                    type="button"
                    aria-label="Continue with LinkedIn"
                    disabled={loading}
                    onClick={() => void handleSocialSignIn("linkedin_oidc")}
                    className="flex h-10 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:opacity-50"
                  >
                    <Linkedin aria-hidden="true" className="h-4 w-4 fill-current text-[#0a66c2]" />
                    LinkedIn
                  </button>
                  <button
                    type="button"
                    aria-label="Continue with Apple"
                    disabled={loading}
                    onClick={() => void handleSocialSignIn("apple")}
                    className="flex h-10 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:opacity-50"
                  >
                    <svg aria-hidden="true" viewBox="0 0 24 24" className="h-4 w-4 fill-current">
                      <path d="M16.37 1.43c0 1.14-.42 2.2-1.24 3.17-.99 1.16-2.19 1.83-3.5 1.72a3.65 3.65 0 0 1-.03-.44c0-1.1.48-2.27 1.33-3.2.43-.48.98-.88 1.63-1.2.65-.3 1.27-.47 1.85-.5.02.15.02.3.02.45Zm5.13 16.24c-.37.85-.81 1.64-1.32 2.36-.7.98-1.27 1.66-1.71 2.04-.69.63-1.43.95-2.22.97-.57 0-1.25-.16-2.03-.49-.78-.32-1.5-.48-2.15-.48-.68 0-1.42.16-2.2.48-.8.33-1.45.5-1.94.51-.76.03-1.52-.3-2.3-.98-.47-.41-1.07-1.12-1.78-2.1A23.2 23.2 0 0 1 1.5 14.3c-.53-1.48-.8-2.9-.8-4.26 0-1.58.34-2.95 1.03-4.1a6.06 6.06 0 0 1 2.2-2.18 5.9 5.9 0 0 1 2.97-.82c.58 0 1.35.18 2.32.54.96.36 1.58.54 1.86.54.2 0 .89-.21 2.08-.64 1.11-.4 2.05-.56 2.83-.5 2.1.17 3.68 1 4.74 2.5-1.87 1.13-2.8 2.7-2.78 4.72.02 1.57.6 2.88 1.73 3.92.51.49 1.09.87 1.73 1.14-.14.42-.3.83-.48 1.22Z" />
                    </svg>
                    Apple
                  </button>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="signup" className="mt-0">
              <form onSubmit={handleSignUp} className="space-y-4">
              {accountType === "worker" && (
                <fieldset className="space-y-2">
                  <legend className="text-xs font-bold uppercase tracking-[0.05em] text-slate-700">
                    Your skills <span className="normal-case font-medium text-slate-500">(select all that apply)</span>
                  </legend>
                  <WorkerSkillsSelector value={workerSkills} onChange={setWorkerSkills} disabled={loading} />
                </fieldset>
              )}
              <div className="space-y-1.5">
                  <Label htmlFor="su-name" className="px-1 text-xs font-bold uppercase tracking-[0.05em] text-slate-700">Display name</Label>
                  <div className="relative">
                    <UserRound aria-hidden="true" className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <Input id="su-name" name="display_name" required autoComplete="name" placeholder="Your name" className="h-[42px] rounded-xl border-slate-200 bg-slate-50 pl-10 text-slate-950 placeholder:text-slate-500 focus-visible:ring-sky-600" />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="su-email" className="px-1 text-xs font-bold uppercase tracking-[0.05em] text-slate-700">Work email</Label>
                  <div className="relative">
                    <Mail aria-hidden="true" className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <Input id="su-email" name="email" type="email" required autoComplete="email" placeholder="name@example.com" className="h-[42px] rounded-xl border-slate-200 bg-slate-50 pl-10 text-slate-950 placeholder:text-slate-500 focus-visible:ring-sky-600" />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="su-password" className="px-1 text-xs font-bold uppercase tracking-[0.05em] text-slate-700">Password</Label>
                  <div className="relative">
                    <Input
                      id="su-password"
                      name="password"
                      type={showSignUpPassword ? "text" : "password"}
                      required
                      minLength={8}
                      autoComplete="new-password"
                      placeholder="At least 8 characters"
                      className="h-[42px] rounded-xl border-slate-200 bg-slate-50 px-4 pr-12 text-slate-950 placeholder:text-slate-500 focus-visible:ring-sky-600"
                    />
                    <button
                      type="button"
                      onClick={() => setShowSignUpPassword((visible) => !visible)}
                      className="absolute right-2 top-1/2 grid h-8 w-8 -translate-y-1/2 place-items-center rounded-full text-slate-500 transition hover:bg-white hover:text-slate-900"
                      aria-label={showSignUpPassword ? "Hide password" : "Show password"}
                    >
                      {showSignUpPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="su-city" className="px-1 text-xs font-bold uppercase tracking-[0.05em] text-slate-700">Base area</Label>
                  <Select value={city} onValueChange={setCity}>
                    <SelectTrigger id="su-city" className="h-[42px] rounded-xl border-slate-200 bg-slate-50 text-slate-950 focus:ring-sky-600">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {AREA_OPTIONS.map((area) => <SelectItem key={area.label} value={area.label}>{area.label}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <Button type="submit" disabled={loading} className="h-12 w-full rounded-xl bg-gradient-to-r from-sky-500 to-sky-700 text-base font-bold text-white shadow-[0_10px_20px_-10px_rgba(14,165,233,0.5)] transition hover:from-sky-600 hover:to-sky-800 disabled:opacity-60">
                  {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : (
                    <span className="inline-flex items-center gap-2">
                      Create {accountType === "worker" ? "job seeker" : "employer"} account
                      <ArrowRight aria-hidden="true" className="h-4 w-4" />
                    </span>
                  )}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
            </>
          )}

        </section>

        {!isPasswordRecovery && <div className="flex flex-wrap items-center justify-center gap-1.5 text-center text-sm text-[#40474f]">
          <span>{authTab === "signup" ? "Already have an account?" : "Don’t have an account?"}</span>
          <button
            type="button"
            onClick={() => setAuthTab(authTab === "signup" ? "signin" : "signup")}
            className="font-bold text-[#0081FF] hover:text-[#006fdc]"
          >
            {authTab === "signup" ? "Sign in" : "Sign up for free"}
          </button>
        </div>}

        <div className="inline-flex items-center gap-2.5 rounded-full border border-white/80 bg-white/85 px-3.5 py-2 text-[10px] text-[#40474f] shadow-sm backdrop-blur">
          <div aria-hidden="true" className="flex -space-x-2">
            {[
              { initials: "A", color: "bg-[#d8a27d]" },
              { initials: "J", color: "bg-[#6a8f78]" },
              { initials: "M", color: "bg-[#8b79ac]" },
            ].map((avatar) => (
              <span key={avatar.initials} className={`grid h-6 w-6 place-items-center rounded-full border-2 border-[#e2e7ff] ${avatar.color} text-[9px] font-bold text-white`}>
                {avatar.initials}
              </span>
            ))}
          </div>
          <span>
            Trusted by <strong className="text-slate-900">450,000+</strong> top candidates &amp; hiring teams
          </span>
        </div>
        </div>
      </section>

      <section
        aria-label="Talent Network promotion"
        className="relative order-1 hidden min-h-screen w-1/2 flex-col overflow-hidden border-r border-sky-200/60 bg-[linear-gradient(123deg,#f0f9ff_0%,#1fa5ff_100%,#10d3e9_100%)] p-8 lg:flex lg:min-h-[1024px] lg:px-12 lg:py-8 xl:px-16"
      >
        <div aria-hidden="true" className="absolute -left-24 -top-24 h-96 w-96 rounded-full bg-sky-200/60 blur-3xl" />
        <div aria-hidden="true" className="absolute -bottom-24 -right-24 h-96 w-96 rounded-full bg-blue-200/50 blur-3xl" />
        <div aria-hidden="true" className="absolute left-1/3 top-1/2 h-72 w-[45%] -translate-y-1/2 rounded-full bg-cyan-200/40 blur-3xl" />

        <header className="relative z-10 flex items-center gap-3">
          <Link to="/" aria-label="GigClose home" className="rounded-xl transition-opacity hover:opacity-80">
            <Logo />
          </Link>
          <span className="rounded-full border border-sky-300/60 bg-sky-100/70 px-3 py-1 text-xs font-semibold text-sky-800 shadow-sm backdrop-blur">
            Talent Network
          </span>
        </header>

        <div className="relative z-10 flex flex-1 flex-col justify-center py-10">
          <div className="mx-auto flex w-full max-w-xl flex-col items-center text-center">
            <img
              src={promotionImage}
              alt="Professional ready to take on their next opportunity"
              className="mb-8 h-[360px] w-[300px] rounded-none border-0 object-cover object-top shadow-none xl:h-[420px] xl:w-[316px]"
            />
            <h1 className="font-display text-3xl font-extrabold leading-tight tracking-tight text-slate-900 xl:text-4xl">
              Where top-tier talent
              <br />
              <span className="text-sky-700">closes dream contracts</span>.
            </h1>
            <p className="mt-4 max-w-md text-sm leading-6 text-slate-600 xl:text-base">
              Direct enterprise escrow, zero bidding wars, and verified high-ticket contracts closed fast.
            </p>
          </div>

          <div className="mx-auto mt-8 flex w-full max-w-xl flex-wrap items-center justify-center gap-3">
            {[
              { Icon: null, label: "$48M+ Escrow Paid", status: true },
              { Icon: Zap, label: "99.4% Closed < 72h", status: false },
              { Icon: ShieldCheck, label: "SOC-2 Type II Certified", status: false },
            ].map(({ Icon, label, status }) => (
              <span key={label} className="inline-flex items-center gap-2 rounded-full border border-white/70 bg-white/65 px-3 py-2 text-[11px] font-semibold text-slate-700 shadow-sm backdrop-blur-sm">
                {status ? (
                  <span aria-hidden="true" className="h-2 w-2 rounded-full bg-emerald-500" />
                ) : Icon ? (
                  <Icon aria-hidden="true" className="h-3.5 w-3.5 text-sky-600" />
                ) : null}
                {label}
              </span>
            ))}
          </div>
        </div>

        <footer className="relative z-10 flex items-center justify-between border-t border-sky-200/60 pt-4 text-xs text-slate-700">
          <p>© 2025 GigClose Inc.</p>
          <nav aria-label="Footer navigation" className="flex items-center gap-4">
            <a href="#security" className="transition hover:text-sky-800">Security</a>
            <a href="#terms-of-escrow" className="transition hover:text-sky-800">Terms of Escrow</a>
          </nav>
        </footer>
      </section>
    </main>
  );
};

export default Auth;
