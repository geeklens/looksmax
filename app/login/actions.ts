'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export async function login(formData: FormData) {
	const supabase = await createClient()

	const email = formData.get('email') as string
	const password = formData.get('password') as string

	const { error } = await supabase.auth.signInWithPassword({
		email,
		password,
	})

	if (error) {
		return redirect(`/error?message=${encodeURIComponent(error.message)}`)
	}

	revalidatePath('/', 'layout')
	redirect('/')
}

export async function signup(formData: FormData) {
	const supabase = await createClient()

	const email = formData.get('email') as string
	const password = formData.get('password') as string

	// Common gotcha: Supabase might default to email confirmation.
	// If you want instant login, disable "Confirm email" in Supabase Auth Settings.
	// Or we handle the case where session is null.
	const { data, error } = await supabase.auth.signUp({
		email,
		password,
	})

	if (error) {
		return redirect(`/error?message=${encodeURIComponent(error.message)}`)
	}

	if (!data.session) {
		return redirect(
			`/error?message=${encodeURIComponent(
				'Registration successful! Please check your email to confirm your account.',
			)}`,
		)
	}

	revalidatePath('/', 'layout')
	redirect('/')
}
