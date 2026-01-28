import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { CyberCard } from '@/components/ui/cyber-card'
import { DeleteButton } from '@/components/delete-button'
import {
	Activity,
	Calendar,
	ArrowRight,
	ChevronLeft,
	ChevronRight,
} from 'lucide-react'
import { RatingCard } from '@/components/RatingCard'

interface HistoryPageProps {
	searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

export default async function HistoryPage({ searchParams }: HistoryPageProps) {
	const supabase = await createClient()
	const {
		data: { user },
	} = await supabase.auth.getUser()

	if (!user) {
		redirect('/login')
	}

	// Pagination Params
	const params = await searchParams
	const page = typeof params.page === 'string' ? parseInt(params.page) : 1
	const PER_PAGE = 10
	const from = (page - 1) * PER_PAGE
	const to = from + PER_PAGE - 1

	const { data: ratings, count } = await supabase
		.from('ratings')
		.select(
			`
            *,
            photos (
                image_url
            )
            `,
			{ count: 'exact' },
		)
		.order('created_at', { ascending: false })
		.range(from, to)

	// Calculate pagination
	const totalCount = count || 0
	const totalPages = Math.ceil(totalCount / PER_PAGE)

	// Bulk refresh signed URLs for better performance
	const ratingsData = ratings || []
	const pathsToSign = ratingsData
		.map((r: any) => {
			let path = r.photos?.image_url
			if (path && path.includes('/sign/photos/')) {
				const match = path.match(/\/sign\/photos\/(.*?)\?/)
				if (match) path = match[1]
			}
			return path && !path.startsWith('http') ? path : null
		})
		.filter(Boolean) as string[]

	const { data: signedUrls } =
		pathsToSign.length > 0
			? await supabase.storage
					.from('photos')
					.createSignedUrls(pathsToSign, 3600)
			: { data: [] }

	const signedUrlMap = new Map(signedUrls?.map(s => [s.path, s.signedUrl]))

	const ratingsWithSignedUrls = ratingsData.map((rating: any) => {
		let path = rating.photos?.image_url
		if (path && path.includes('/sign/photos/')) {
			const match = path.match(/\/sign\/photos\/(.*?)\?/)
			if (match) path = match[1]
		}
		const signedUrl = signedUrlMap.get(path) || rating.photos?.image_url
		return { ...rating, signedUrl }
	})

	return (
		<div className='container mx-auto p-4 md:p-8 space-y-8'>
			<div className='flex justify-between items-center border-b border-primary/20 pb-4'>
				<div>
					<h1 className='text-3xl font-mono font-bold tracking-widest text-primary dark:text-shadow-neon'>
						ARCHIVES
					</h1>
					<p className='text-sm text-muted-foreground font-mono mt-1'>
						// TOTAL RECORDS:{' '}
						<span className='text-secondary'>{totalCount || 0}</span>
					</p>
				</div>
				<Link href='/'>
					<Button
						variant='outline'
						className='border-primary/50 text-primary hover:bg-primary/20 font-mono tracking-wider'
					>
						+ NEW SCAN
					</Button>
				</Link>
			</div>

			{!ratings || ratings.length === 0 ? (
				<div className='flex flex-col items-center justify-center p-20 border border-dashed border-primary/20 rounded-lg text-muted-foreground font-mono'>
					<Activity className='w-12 h-12 mb-4 opacity-50' />
					<p>NO DATA LOGGED</p>
				</div>
			) : (
				<div className='space-y-8'>
					<div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'>
						{ratingsWithSignedUrls.map((rating: any) => (
							<RatingCard key={rating.id} rating={rating} />
						))}
					</div>

					{/* Pagination Controls */}
					<div className='flex justify-center items-center gap-4 pt-4 border-t border-primary/20'>
						{page > 1 ? (
							<Link href={`/history?page=${page - 1}`} className='group'>
								<Button
									variant='outline'
									className='font-mono text-primary border-primary/50 hover:bg-primary/20 hover:text-primary pl-2 pr-4 flex gap-2'
								>
									<ChevronLeft className='w-4 h-4 group-hover:-translate-x-1 transition-transform' />{' '}
									PREV
								</Button>
							</Link>
						) : (
							<Button
								disabled
								variant='outline'
								className='font-mono text-muted-foreground border-primary/20 pl-2 pr-4 flex gap-2 opacity-50 cursor-not-allowed'
							>
								<ChevronLeft className='w-4 h-4' /> PREV
							</Button>
						)}

						<span className='font-mono text-primary font-bold'>
							{page} / {totalPages || 1}
						</span>

						{page < totalPages ? (
							<Link href={`/history?page=${page + 1}`} className='group'>
								<Button
									variant='outline'
									className='font-mono text-primary border-primary/50 hover:bg-primary/20 hover:text-primary pl-4 pr-2 flex gap-2'
								>
									NEXT{' '}
									<ChevronRight className='w-4 h-4 group-hover:translate-x-1 transition-transform' />
								</Button>
							</Link>
						) : (
							<Button
								disabled
								variant='outline'
								className='font-mono text-muted-foreground border-primary/20 pl-4 pr-2 flex gap-2 opacity-50 cursor-not-allowed'
							>
								NEXT <ChevronRight className='w-4 h-4' />
							</Button>
						)}
					</div>
				</div>
			)}
		</div>
	)
}
