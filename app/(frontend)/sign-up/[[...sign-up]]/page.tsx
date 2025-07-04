'use client'
import React, { useState } from 'react'
import { useSignUp } from '@clerk/nextjs'
import { useRouter } from 'next/navigation'
import toast, { Toaster } from 'react-hot-toast'
import { Eye, EyeOff } from 'lucide-react'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

import {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
} from '@/components/ui/input-otp'
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

const Page = () => {
  const { isLoaded, signUp, setActive } = useSignUp()
  const [emailAddress, setEmailAddress] = useState('')
  const [password, setPassword] = useState('')
  const [pendingVerification, setPendingVerification] = useState(false)
  const [code, setCode] = useState('')
  const [error, setError] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)
  const [verifying, setVerifying] = useState(false)

  const router = useRouter()

  const Loader = () => (
    <div className="flex justify-center items-center min-h-screen">
      <div className="animate-spin rounded-full border-4 border-gray-300 border-t-primary w-10 h-10" />
    </div>
  )

  if (!isLoaded) return <Loader />

  const Submit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!isLoaded) return

    setLoading(true)
    try {
      await signUp.create({ emailAddress, password })
      await signUp.prepareEmailAddressVerification({ strategy: 'email_code' })
      setPendingVerification(true)
      setError('')
    } catch (error: any) {
      console.log(error)
      setError(error?.errors?.[0]?.message || 'Signup failed')
    } finally {
      setLoading(false)
    }
  }

  const onPassVerify = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!isLoaded) return

    setVerifying(true)
    try {
      const completeSignUp = await signUp.attemptEmailAddressVerification({ code })

      if (completeSignUp.status === 'complete') {
        await setActive({ session: completeSignUp.createdSessionId })
        router.push('/dashboard')
      } else {
        toast.error('Verification failed. Try again.')
      }
    } catch (error) {
      console.error(error)
      toast.error('Failed to verify code')
    } finally {
      setVerifying(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-zinc-900 to-black px-4">
      <Toaster position="top-center" />
      <div className="grid grid-cols-1 md:grid-cols-2 w-full max-w-6xl rounded-xl overflow-hidden backdrop-blur-md bg-white/5 shadow-2xl border border-white/10">

        {/* Left: Signup Form */}
        <motion.div
          initial={{ x: -50, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="p-8 text-white flex items-center justify-center"
        >
          <Card className="w-full max-w-md bg-black/50 backdrop-blur-xl border border-white/20 text-white shadow-xl">
            <CardHeader>
              <CardTitle className="text-2xl">
                {pendingVerification ? 'Verify OTP' : 'Create Account'}
              </CardTitle>
              <CardDescription className="text-zinc-300">
                {pendingVerification
                  ? 'Enter the code sent to your email.'
                  : 'Sign up to continue to the dashboard'}
              </CardDescription>
            </CardHeader>

            <CardContent>
              {!pendingVerification ? (
                <form onSubmit={Submit} className="space-y-4">
                  <div>
                    <label className="text-sm text-zinc-300">Email Address</label>
                    <Input
                      className="text-white bg-transparent border-zinc-700 placeholder:text-zinc-400"
                      value={emailAddress}
                      onChange={(e) => setEmailAddress(e.target.value)}
                      placeholder="you@example.com"
                      type="email"
                      required
                    />
                  </div>
                  <div className="relative">
                    <label className="text-sm text-zinc-300">Password</label>
                    <Input
                      className="text-white bg-transparent border-zinc-700 placeholder:text-zinc-400"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      type={showPass ? 'text' : 'password'}
                      required
                    />
                    <span
                      className="absolute right-3 top-8 cursor-pointer text-zinc-400"
                      onClick={() => setShowPass(!showPass)}
                    >
                      {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
                    </span>
                  </div>
                  {error && <p className="text-red-500 text-sm">{error}</p>}
                  <Button type="submit" className="w-full mt-2" disabled={loading}>
                    {loading ? 'Creating account...' : 'Sign Up'}
                  </Button>
                </form>
              ) : (
                <form onSubmit={onPassVerify} className="space-y-4">
                  <InputOTP maxLength={6} value={code} onChange={setCode}>
                    <InputOTPGroup>
                      <InputOTPSlot index={0} />
                      <InputOTPSlot index={1} />
                      <InputOTPSlot index={2} />
                    </InputOTPGroup>
                    <InputOTPSeparator />
                    <InputOTPGroup>
                      <InputOTPSlot index={3} />
                      <InputOTPSlot index={4} />
                      <InputOTPSlot index={5} />
                    </InputOTPGroup>
                  </InputOTP>
                  <Button type="submit" className="w-full" disabled={verifying}>
                    {verifying ? 'Verifying...' : 'Verify'}
                  </Button>
                </form>
              )}
            </CardContent>

            <CardFooter className="text-sm text-zinc-300">
              Already have an account? <a href="/sign-in" className="text-blue-400 ml-1">Sign in</a>
            </CardFooter>
          </Card>
        </motion.div>

        {/* Right Panel */}
        <motion.div
          initial={{ x: 50, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="bg-gradient-to-br from-purple-800 to-indigo-900 p-10 text-white flex flex-col justify-center backdrop-blur-2xl bg-white/5 shadow-inner"
        >
          <h2 className="text-4xl font-bold mb-4 text-white drop-shadow-lg">Welcome to Execudo</h2>
          <p className="text-lg leading-relaxed text-zinc-200">
            Execudo is your all-in-one productivity powerhouse. Seamlessly track tasks, manage deadlines, and stay focused on what matters most. Whether you're a founder, freelancer, or student — Execudo keeps your goals within reach.
          </p>
        </motion.div>
      </div>
    </div>
  )
}

export default Page
