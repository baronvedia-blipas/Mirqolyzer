"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }
    router.push("/dashboard");
    router.refresh();
  }

  async function handleGoogleLogin() {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/callback` },
    });
    if (error) setError(error.message);
  }

  return (
    <Card className="border-brand-700/50 bg-white/5 backdrop-blur-xl">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl text-white">
          <span className="font-bold">Mirqo</span>
          <span className="font-light">lyzer</span>
        </CardTitle>
        <CardDescription className="text-brand-200">Sign in to your account</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleLogin} className="space-y-4">
          {error && (
            <div className="rounded-md bg-destructive/10 p-3 text-sm text-red-400">{error}</div>
          )}
          <div className="space-y-2">
            <Label htmlFor="email" className="text-brand-100">Email</Label>
            <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required placeholder="you@company.com" className="bg-white/10 border-brand-600 text-white placeholder:text-brand-400" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password" className="text-brand-100">Password</Label>
            <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required placeholder="••••••••" className="bg-white/10 border-brand-600 text-white placeholder:text-brand-400" />
          </div>
          <Button type="submit" className="w-full bg-brand-600 hover:bg-brand-500" disabled={loading}>
            {loading ? "Signing in..." : "Sign In"}
          </Button>
        </form>
        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-brand-700" /></div>
          <div className="relative flex justify-center text-xs"><span className="bg-transparent px-2 text-brand-400">or continue with</span></div>
        </div>
        <Button variant="outline" className="w-full border-brand-600 text-brand-100 hover:bg-white/10" onClick={handleGoogleLogin}>Google</Button>
      </CardContent>
      <CardFooter className="justify-center">
        <p className="text-sm text-brand-300">Don&apos;t have an account?{" "}<Link href="/signup" className="text-brand-100 underline hover:text-white">Sign up</Link></p>
      </CardFooter>
    </Card>
  );
}
