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
			className='text-muted-foreground hover:text-red-500 hover:bg-red-500/10 h-8 w-8'
			onClick={handleDelete}
			disabled={isPending}
		>
			<Trash2 className='w-4 h-4' />
		</Button>
	)
}
