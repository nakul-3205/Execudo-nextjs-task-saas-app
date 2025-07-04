/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import { useSignIn } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Eye, EyeOff } from "lucide-react";
import { motion } from "framer-motion";

export default function SignIn() {
  const { isLoaded, signIn, setActive } = useSignIn();
  const [emailAddress, setEmailAddress] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();

  if (!isLoaded) {
    return null;
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!isLoaded) {
      return;
    }

    try {
      const result = await signIn.create({
        identifier: emailAddress,
        password,
      });

      if (result.status === "complete") {
        await setActive({ session: result.createdSessionId });
        router.push("/dashboard");
      } else {
        console.error(JSON.stringify(result, null, 2));
      }
    } catch (err: any) {
      console.error("error", err.errors[0].message);
      setError(err.errors[0].message);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-zinc-900 to-black px-4">
      <div className="grid grid-cols-1 md:grid-cols-2 w-full max-w-6xl rounded-xl overflow-hidden backdrop-blur-md bg-white/5 shadow-2xl border border-white/10">

        {/* Left: Sign In Form */}
        <motion.div
          initial={{ x: -50, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="p-8 text-white flex items-center justify-center"
        >
          <Card className="w-full max-w-md bg-black/50 backdrop-blur-xl border border-white/20 text-white shadow-xl">
            <CardHeader>
              <CardTitle className="text-2xl text-white">Sign In to Todo Master</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={submit} className="space-y-4">
                <div>
                  <Label htmlFor="email" className="text-sm text-zinc-300">Email</Label>
                  <Input
                    type="email"
                    id="email"
                    value={emailAddress}
                    onChange={(e) => setEmailAddress(e.target.value)}
                    required
                    className="text-white bg-transparent border-zinc-700 placeholder:text-zinc-400"
                  />
                </div>
                <div>
                  <Label htmlFor="password" className="text-sm text-zinc-300">Password</Label>
                  <div className="relative">
                    <Input
                      type={showPassword ? "text" : "password"}
                      id="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      className="text-white bg-transparent border-zinc-700 placeholder:text-zinc-400"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-zinc-400"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
                {error && (
                  <Alert variant="destructive">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}
                <Button type="submit" className="w-full mt-2">
                  Sign In
                </Button>
              </form>
            </CardContent>
            <CardFooter className="justify-center text-sm text-zinc-300">
              Don&apos;t have an account?{' '}
              <Link href="/sign-up" className="text-blue-400 ml-1 hover:underline">
                Sign up
              </Link>
            </CardFooter>
          </Card>
        </motion.div>

        {/* Right: Info Side */}
        <motion.div
          initial={{ x: 50, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="bg-gradient-to-br from-purple-800 to-indigo-900 p-10 text-white flex flex-col justify-center backdrop-blur-2xl bg-white/5 shadow-inner"
        >
          <h2 className="text-4xl font-bold mb-4 text-white drop-shadow-lg">Welcome Back to Execudo</h2>
          <p className="text-lg leading-relaxed text-zinc-200">
            Pick up right where you left off. Stay in flow, crush your goals, and build momentum every single day. Your productivity command center is just one sign-in away.
          </p>
        </motion.div>
      </div>
    </div>
  );
}
