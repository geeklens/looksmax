'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export async function login(prevState: any, formData: FormData) {
	const supabase = await createClient()

	const email = formData.get('email') as string
	const password = formData.get('password') as string

	const { error } = await supabase.auth.signInWithPassword({
		email,
		password,
	})

	if (error) {
		return { error: error.message }
	}

	revalidatePath('/', 'layout')
	redirect('/')
}

export async function signup(prevState: any, formData: FormData) {
	const supabase = await createClient()

	const email = formData.get('email') as string
	const password = formData.get('password') as string

	const { data, error } = await supabase.auth.signUp({
		email,
		password,
	})

	if (error) {
		return { error: error.message }
	}

	if (!data.session) {
		return {
			success: true,
			message:
				'Registration successful! Please check your email to confirm your account.',
		}
	}

	revalidatePath('/', 'layout')
	redirect('/')
}
