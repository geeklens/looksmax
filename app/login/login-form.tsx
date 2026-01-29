'use client'

import { useActionState, useEffect } from 'react'
import { login, signup } from './actions'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Loader2 } from 'lucide-react'

interface ActionState {
	error?: string
	success?: boolean
	message?: string
}

const initialState: ActionState = {
	error: '',
	success: false,
	message: '',
}

export function LoginForm() {
	const [loginState, loginAction, isLoginPending] = useActionState<
		ActionState,
		FormData
	>(login, initialState)
	const [signupState, signupAction, isSignupPending] = useActionState<
		ActionState,
		FormData
	>(signup, initialState)

	return (
		<div className='flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900'>
			<Tabs defaultValue='login' className='w-full max-w-md'>
				<TabsList className='grid w-full grid-cols-2'>
					<TabsTrigger value='login'>Login</TabsTrigger>
					<TabsTrigger value='signup'>Sign Up</TabsTrigger>
				</TabsList>

				<TabsContent value='login'>
					<Card>
						<CardHeader>
							<CardTitle>Login</CardTitle>
							<CardDescription>
								Enter your credentials to access your account.
							</CardDescription>
						</CardHeader>
						<CardContent className='space-y-4'>
							<form action={loginAction} className='space-y-4'>
								{loginState?.error && (
									<div className='p-3 text-sm text-red-500 bg-red-50 dark:bg-red-900/20 rounded-md border border-red-200 dark:border-red-900'>
										{loginState.error}
									</div>
								)}
								<div className='space-y-2'>
									<Label htmlFor='email'>Email</Label>
									<Input
										id='email'
										name='email'
										type='email'
										required
										placeholder='you@example.com'
										disabled={isLoginPending}
									/>
								</div>
								<div className='bg-background dark:bg-background items-center'>
									<div className='flex justify-between items-center bg-background dark:bg-background'>
										<Label htmlFor='password'>Password</Label>
										<Link href='/forgot-password'>
											<span className='text-xs text-primary hover:underline cursor-pointer'>
												Forgot Password?
											</span>
										</Link>
									</div>
									<Input
										id='password'
										name='password'
										type='password'
										required
										disabled={isLoginPending}
									/>
								</div>
								<Button
									type='submit'
									className='w-full'
									disabled={isLoginPending}
								>
									{isLoginPending ? (
										<>
											<Loader2 className='mr-2 h-4 w-4 animate-spin' />
											Logging in...
										</>
									) : (
										'Log in'
									)}
								</Button>
							</form>
						</CardContent>
					</Card>
				</TabsContent>

				<TabsContent value='signup'>
					<Card>
						<CardHeader>
							<CardTitle>Sign Up</CardTitle>
							<CardDescription>
								Create a new account to start rating photos.
							</CardDescription>
						</CardHeader>
						<CardContent className='space-y-4'>
							<form action={signupAction} className='space-y-4'>
								{signupState?.error && (
									<div className='p-3 text-sm text-red-500 bg-red-50 dark:bg-red-900/20 rounded-md border border-red-200 dark:border-red-900'>
										{signupState.error}
									</div>
								)}
								{signupState?.success && (
									<div className='p-3 text-sm text-green-500 bg-green-50 dark:bg-green-900/20 rounded-md border border-green-200 dark:border-green-900'>
										{signupState.message}
									</div>
								)}
								<div className='space-y-2'>
									<Label htmlFor='signup-email'>Email</Label>
									<Input
										id='signup-email'
										name='email'
										type='email'
										required
										placeholder='you@example.com'
										disabled={isSignupPending}
									/>
								</div>
								<div className='space-y-2'>
									<Label htmlFor='signup-password'>Password</Label>
									<Input
										id='signup-password'
										name='password'
										type='password'
										required
										disabled={isSignupPending}
									/>
								</div>
								<Button
									type='submit'
									className='w-full'
									disabled={isSignupPending}
								>
									{isSignupPending ? (
										<>
											<Loader2 className='mr-2 h-4 w-4 animate-spin' />
											Creating Account...
										</>
									) : (
										'Sign Up'
									)}
								</Button>
							</form>
						</CardContent>
					</Card>
				</TabsContent>
			</Tabs>
		</div>
	)
}
