'use client'

import { resetPassword } from '@/app/auth/actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { CyberCard } from '@/components/ui/cyber-card'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { Suspense } from 'react'

function ForgotPasswordContent() {
	const searchParams = useSearchParams()
	const message = searchParams.get('message')

	return (
		<div className='flex items-center justify-center min-h-screen bg-background p-4'>
			<CyberCard className='w-full max-w-md border-primary/50'>
				<div className='space-y-6'>
					<div className='space-y-2 text-center'>
						<h1 className='text-2xl font-mono font-bold text-primary tracking-widest uppercase'>
							Recovery Protocol
						</h1>
						<p className='text-sm text-muted-foreground'>
							Enter your email to receive a password reset link.
						</p>
					</div>

					{message && (
						<div className='p-3 bg-secondary/10 border border-secondary/50 text-secondary text-sm font-mono rounded-sm'>
							{message}
						</div>
					)}

					<form action={resetPassword} className='space-y-4'>
						<div className='space-y-2'>
							<Label htmlFor='email' className='font-mono uppercase text-xs'>
								Email Address
							</Label>
							<Input
								id='email'
								name='email'
								type='email'
								required
								placeholder='name@example.com'
								className='bg-black/50 border-primary/30 focus:border-primary/80'
							/>
						</div>
						<Button
							type='submit'
							className='w-full font-mono uppercase font-bold tracking-wider'
						>
							Send Reset Link
						</Button>
					</form>

					<div className='text-center'>
						<Link
							href='/login'
							className='text-sm text-primary hover:underline font-mono'
						>
							{'<<'} Back to Login
						</Link>
					</div>
				</div>
			</CyberCard>
		</div>
	)
}

export default function ForgotPasswordPage() {
	return (
		<Suspense>
			<ForgotPasswordContent />
		</Suspense>
	)
}
