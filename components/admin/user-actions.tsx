'use client'

import { manageUser, adminResetPassword } from '@/app/actions'
import { Button } from '@/components/ui/button'
import { Ban, Trash2, ShieldCheck, ShieldAlert, Key } from 'lucide-react'
import { useState, useTransition } from 'react'

interface UserActionsProps {
	userId: string
	isBanned?: boolean // We might need to pass this if we can know it. For now, we assume active unless verified.
}

export function UserActions({ userId }: UserActionsProps) {
	const [isPending, startTransition] = useTransition()
	// Local state to track ban status optimistically if we knew it.
	// Since we don't get 'banned_until' easily from listUsers without mapping, we might just show Ban button always for now, or assume unbanned.
	// A better way is to pass the user object fully.

	const handleAction = (action: 'delete' | 'ban' | 'unban') => {
		const confirmMsg =
			action === 'delete'
				? 'PERMANENTLY DELETE this user? This cannot be undone.'
				: action === 'ban'
					? 'BLOCK this user from accessing the system?'
					: 'Unblock this user?'

		if (!confirm(confirmMsg)) return

		startTransition(async () => {
			try {
				await manageUser(userId, action)
			} catch (err: any) {
				alert('Action failed: ' + (err.message || 'Unknown error'))
			}
		})
	}

	const handlePasswordReset = () => {
		const newPassword = prompt(
			'Enter NEW password for this user (min 6 chars):',
		)
		if (!newPassword) return

		if (newPassword.length < 6) {
			alert('Password too short!')
			return
		}

		startTransition(async () => {
			try {
				await adminResetPassword(userId, newPassword)
				alert('Password updated successfully!')
			} catch (err: any) {
				alert('Reset failed: ' + (err.message || 'Unknown error'))
			}
		})
	}

	return (
		<div className='flex items-center gap-2'>
			<Button
				variant='ghost'
				size='icon'
				className='h-7 w-7 text-blue-500 bg-blue-500/5 hover:text-white hover:bg-blue-600 border border-blue-500/20'
				onClick={handlePasswordReset}
				disabled={isPending}
				title='Reset Password'
			>
				<Key className='w-3.5 h-3.5' />
			</Button>
			<Button
				variant='ghost'
				size='icon'
				className='h-7 w-7 text-amber-500 bg-amber-500/5 hover:text-white hover:bg-amber-600 border border-amber-500/20'
				onClick={() => handleAction('ban')}
				disabled={isPending}
				title='Ban User'
			>
				<Ban className='w-3.5 h-3.5' />
			</Button>
			<Button
				variant='ghost'
				size='icon'
				className='h-7 w-7 text-red-500 bg-red-500/5 hover:text-white hover:bg-red-600 border border-red-500/20'
				onClick={() => handleAction('delete')}
				disabled={isPending}
				title='Delete User'
			>
				<Trash2 className='w-3.5 h-3.5' />
			</Button>
		</div>
	)
}
