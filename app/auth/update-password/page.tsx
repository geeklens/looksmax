'use client'

import { updatePassword } from '@/app/auth/actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { CyberCard } from '@/components/ui/cyber-card'
import { useSearchParams } from 'next/navigation'
import { Suspense } from 'react'

function UpdatePasswordContent() {
	const searchParams = useSearchParams()
	const message = searchParams.get('message')

	return (
		<div className='flex items-center justify-center min-h-screen bg-background p-4'>
			<CyberCard className='w-full max-w-md border-primary/50'>
				<div className='space-y-6'>
					<div className='space-y-2 text-center'>
						<h1 className='text-2xl font-mono font-bold text-primary tracking-widest uppercase'>
							Set New Password
						</h1>
						<p className='text-sm text-muted-foreground'>
							Enter your new credentials below.
						</p>
					</div>

					{message && (
						<div className='p-3 bg-secondary/10 border border-secondary/50 text-secondary text-sm font-mono rounded-sm'>
							{message}
						</div>
					)}

					<form action={updatePassword} className='space-y-4'>
						<div className='space-y-2'>
							<Label htmlFor='password' className='font-mono uppercase text-xs'>
								New Password
							</Label>
							<Input
								id='password'
								name='password'
								type='password'
								required
								className='bg-black/50 border-primary/30 focus:border-primary/80'
							/>
						</div>
						<div className='space-y-2'>
							<Label
								htmlFor='confirmPassword'
								className='font-mono uppercase text-xs'
							>
								Confirm Password
							</Label>
							<Input
								id='confirmPassword'
								name='confirmPassword'
								type='password'
								required
								className='bg-black/50 border-primary/30 focus:border-primary/80'
							/>
						</div>
						<Button
							type='submit'
							className='w-full font-mono uppercase font-bold tracking-wider'
						>
							Update Credentials
						</Button>
					</form>
				</div>
			</CyberCard>
		</div>
	)
}

export default function UpdatePasswordPage() {
	return (
		<Suspense>
			<UpdatePasswordContent />
		</Suspense>
	)
}
