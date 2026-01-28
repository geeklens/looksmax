'use server'

import { supabaseAdmin } from '@/lib/supabase/admin-client'
import { createClient } from '@/lib/supabase/server'
import { getAnalyzer } from '@/lib/ai/getAnalyzer'
import { revalidatePath } from 'next/cache'

export async function analyzeFace(
	imageUrl: string,
	storagePath?: string,
	clientResults?: any,
) {
	const supabase = await createClient()

	const {
		data: { user },
	} = await supabase.auth.getUser()
	if (!user) {
		throw new Error('Unauthorized')
	}

	// 1. Create Photo Record in DB (User RLS required)
	// Store the storagePath if provided, so we can generate fresh signed URLs later
	const { data: photoData, error: photoError } = await supabase
		.from('photos')
		.insert({
			user_id: user.id,
			image_url: storagePath || imageUrl,
		})
		.select()
		.single()

	if (photoError) {
		console.error('Photo Error:', photoError)
		throw new Error('Failed to save photo record')
	}

	// 2. Analyze
	// 2. Analyze
	let rawResult
	if (clientResults) {
		rawResult = clientResults
	} else {
		const analyzer = getAnalyzer()
		rawResult = await analyzer.analyze(imageUrl)
	}

	// Filter to ensure we match DB schema (remove extra fields like cheekbones, nose)
	const result = {
		score: rawResult.score,
		jawline: rawResult.jawline,
		skin: rawResult.skin,
		symmetry: rawResult.symmetry,
		eyes: rawResult.eyes,
		hair: rawResult.hair,
		recommendations: rawResult.recommendations || [],
	}

	// 3. Save Rating (Use Admin Client to bypass RLS complexity for system generated data)
	const { error: ratingError } = await supabaseAdmin.from('ratings').insert({
		photo_id: photoData.id,
		...result,
	})

	if (ratingError) {
		console.error('Rating Error:', ratingError)
		throw new Error('Failed to save rating')
	}

	revalidatePath('/history')
	revalidatePath('/admin')

	return {
		...result,
		potential: rawResult.potential,
	}
}

export async function deleteRating(ratingId: string) {
	const supabase = await createClient()
	const {
		data: { user },
	} = await supabase.auth.getUser()

	if (!user) throw new Error('Unauthorized')

	const isAdmin = user.app_metadata?.role === 'admin'

	// Get the photo_id first to verify ownership and potentially delete image
	// If admin, we use admin client to fetch to ensure we can see it even if RLS somehow hides it (unlikely for read usually, but safe)
	const clientToUse = isAdmin ? supabaseAdmin : supabase
	const { data: rating } = await clientToUse
		.from('ratings')
		.select('photo_id, photos(user_id, image_url)')
		.eq('id', ratingId)
		.single()

	if (!rating) throw new Error('Rating not found')

	// Verify ownership if not admin
	if (!isAdmin) {
		const photo = rating.photos as any
		if (photo?.user_id !== user.id) {
			throw new Error('Unauthorized access to this rating')
		}
	}

	// Delete the photo record
	// Using admin client for admin users ensures RLS is bypassed for deletion of others' data
	const { error: deleteError } = await clientToUse
		.from('photos')
		.delete()
		.eq('id', rating.photo_id)

	if (deleteError) {
		console.error('Delete error:', deleteError)
		throw new Error('Failed to delete record: ' + deleteError.message)
	}

	// Try to delete from storage if we can extract path (Best effort)
	// We saved the path in database for newer uploads, but older ones have full URL.
	// We check if image_url does NOT start with http (means it is a path) OR try to regex it.
	const photo = rating.photos as any
	let storagePath = photo?.image_url

	// Attempt to recover path from signed URL if legacy
	if (
		storagePath &&
		storagePath.startsWith('http') &&
		storagePath.includes('/sign/photos/')
	) {
		const match = storagePath.match(/\/sign\/photos\/(.*?)\?/)
		if (match) storagePath = match[1]
	}

	if (storagePath && !storagePath.startsWith('http')) {
		// Use admin client for storage removal to ensure permission
		await supabaseAdmin.storage.from('photos').remove([storagePath])
	}

	revalidatePath('/history')
	revalidatePath('/admin')
}

export async function manageUser(
	userId: string,
	action: 'delete' | 'ban' | 'unban',
) {
	const supabase = await createClient()
	const {
		data: { user },
	} = await supabase.auth.getUser()

	if (!user || user.app_metadata?.role !== 'admin') {
		throw new Error('Unauthorized')
	}

	if (action === 'delete') {
		// Delete user logic
		// First, delete all photos owned by this user to prevent FK violations if cascade is missing
		// Use supabaseAdmin to bypass RLS and ensure deletion
		const { error: deletePhotosError } = await supabaseAdmin
			.from('photos')
			.delete()
			.eq('user_id', userId)
		if (deletePhotosError) {
			console.error("Error deleting user's photos:", deletePhotosError)
			throw new Error(
				"Failed to delete user's photos: " + deletePhotosError.message,
			)
		}

		const { error } = await supabaseAdmin.auth.admin.deleteUser(userId)
		if (error) {
			console.error('Delete user error:', error)
			throw new Error(error.message)
		}
	} else if (action === 'ban') {
		// Ban for 100 years
		const { error } = await supabaseAdmin.auth.admin.updateUserById(userId, {
			ban_duration: '876000h',
		})
		if (error) {
			console.error('Ban user error:', error)
			throw new Error(error.message)
		}
	} else if (action === 'unban') {
		// Unban
		const { error } = await supabaseAdmin.auth.admin.updateUserById(userId, {
			ban_duration: 'none',
		})
		if (error) {
			console.error('Unban user error:', error)
			throw new Error(error.message)
		}
	}

	revalidatePath('/admin')
}

export async function adminResetPassword(userId: string, newPassword: string) {
	const supabase = await createClient()
	const {
		data: { user },
	} = await supabase.auth.getUser()

	if (!user || user.app_metadata?.role !== 'admin') {
		throw new Error('Unauthorized')
	}

	if (newPassword.length < 6) {
		throw new Error('Password must be at least 6 characters')
	}

	const { error } = await supabaseAdmin.auth.admin.updateUserById(userId, {
		password: newPassword,
	})

	if (error) {
		console.error('Reset password error:', error)
		throw new Error(error.message)
	}

	return { success: true }
}
