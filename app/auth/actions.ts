'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export async function resetPassword(formData: FormData) {
	const supabase = await createClient()

	const email = formData.get('email') as string
	const origin = 'http://localhost:3000' // In production, use headers or env var

	const { error } = await supabase.auth.resetPasswordForEmail(email, {
		redirectTo: `${origin}/auth/update-password`,
	})

	if (error) {
		return redirect(
			`/forgot-password?message=${encodeURIComponent('Error: ' + error.message)}`,
		)
	}

	return redirect(
		`/forgot-password?message=${encodeURIComponent('Check your email for the reset link.')}`,
	)
}

export async function updatePassword(formData: FormData) {
	const supabase = await createClient()

	const password = formData.get('password') as string
	const confirmPassword = formData.get('confirmPassword') as string

	if (password !== confirmPassword) {
		return redirect('/auth/update-password?message=Passwords do not match')
	}

	const { error } = await supabase.auth.updateUser({
		password: password,
	})

	if (error) {
		return redirect(
			`/auth/update-password?message=${encodeURIComponent('Error: ' + error.message)}`,
		)
	}

	redirect('/')
}
