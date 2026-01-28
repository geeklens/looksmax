'use client'

import { manageUser } from '@/app/actions'
import { Button } from '@/components/ui/button'
import { Ban, Trash2, ShieldCheck, ShieldAlert } from 'lucide-react'
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

	return (
		<div className='flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity'>
			<Button
				variant='ghost'
				size='icon'
				className='h-6 w-6 text-amber-500 hover:text-amber-600 hover:bg-amber-500/10'
				onClick={() => handleAction('ban')}
				disabled={isPending}
				title='Ban User'
			>
				<Ban className='w-3 h-3' />
			</Button>
			<Button
				variant='ghost'
				size='icon'
				className='h-6 w-6 text-red-500 hover:text-red-600 hover:bg-red-500/10'
				onClick={() => handleAction('delete')}
				disabled={isPending}
				title='Delete User'
			>
				<Trash2 className='w-3 h-3' />
			</Button>
		</div>
	)
}
