'use client'

import { useSearchParams } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { Suspense } from 'react'

function ErrorContent() {
	const searchParams = useSearchParams()
	const message =
		searchParams.get('message') || 'Something went wrong. Please try again.'

	return (
		<Card className='w-full max-w-md border-destructive/50'>
			<CardHeader>
				<CardTitle className='text-destructive'>Authentication Error</CardTitle>
			</CardHeader>
			<CardContent className='space-y-4'>
				<p className='text-sm text-muted-foreground'>{message}</p>
				<div className='flex justify-end'>
					<Link href='/login'>
						<Button variant='secondary'>Back to Login</Button>
					</Link>
				</div>
			</CardContent>
		</Card>
	)
}

export default function ErrorPage() {
	return (
		<div className='flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900'>
			<Suspense fallback={<div>Loading error...</div>}>
				<ErrorContent />
			</Suspense>
		</div>
	)
}
