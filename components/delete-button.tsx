'use client'

import { Trash2 } from 'lucide-react'
import { deleteRating } from '@/app/actions'
import { Button } from '@/components/ui/button'
import { useTransition } from 'react'

export function DeleteButton({ ratingId }: { ratingId: string }) {
	const [isPending, startTransition] = useTransition()

	const handleDelete = (e: React.MouseEvent) => {
		e.preventDefault()
		e.stopPropagation()

		if (
			confirm(
				'Are you sure you want to delete this scan? This cannot be undone.',
			)
		) {
			startTransition(async () => {
				try {
					await deleteRating(ratingId)
				} catch (error) {
					alert('Failed to delete')
				}
			})
		}
	}

	return (
		<Button
			variant='ghost'
			size='icon'
			className='bg-black/40 hover:bg-red-500/80 text-white/70 hover:text-white border border-white/10 hover:border-red-500 h-8 w-8 backdrop-blur-sm transition-all shadow-lg overflow-hidden'
			onClick={handleDelete}
			disabled={isPending}
		>
			<Trash2 className='w-4 h-4' />
		</Button>
	)
}
