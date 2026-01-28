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

	// Process ratings to refresh signed URLs
	const ratingsWithSignedUrls = await Promise.all(
		(ratings || []).map(async (rating: any) => {
			let path = rating.photos?.image_url

			// Try to recover path from expired URL if necessary
			if (path && path.includes('/sign/photos/')) {
				const match = path.match(/\/sign\/photos\/(.*?)\?/)
				if (match) path = match[1]
			}

			// If it's a path (not a full url) or we extracted it, sign it
			if (path && !path.startsWith('http')) {
				const { data } = await supabase.storage
					.from('photos')
					.createSignedUrl(path, 3600)
				if (data?.signedUrl) {
					return { ...rating, signedUrl: data.signedUrl }
				}
			}

			return { ...rating, signedUrl: rating.photos?.image_url }
		}),
	)

	return (
		<div className='container mx-auto p-4 md:p-8 space-y-8'>
			<div className='flex justify-between items-center border-b border-primary/20 pb-4'>
				<div>
					<h1 className='text-3xl font-mono font-bold tracking-widest text-primary text-shadow-neon'>
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
							<div key={rating.id} className='block group relative'>
								<CyberCard className='h-full p-0 overflow-hidden border-primary/30 group-hover:border-primary transition-colors hover:shadow-[0_0_20px_rgba(var(--primary),0.2)]'>
									{/* Header Image Area */}
									<div className='relative aspect-square w-full bg-black/50'>
										<div className='absolute inset-0 bg-gradient-to-b from-transparent to-black/90 z-10' />

										{rating.signedUrl ? (
											// eslint-disable-next-line @next/next/no-img-element
											<img
												src={rating.signedUrl}
												alt='Subject'
												className='w-full h-full object-cover grayscale-[0.8] group-hover:grayscale-0 transition-all duration-700'
											/>
										) : (
											<div className='w-full h-full flex items-center justify-center text-muted-foreground bg-secondary/10'>
												<span className='text-xs font-mono'>IMG_EXP</span>
											</div>
										)}

										<div className='absolute top-3 right-3 z-20 flex gap-2'>
											<div className='bg-black/80 backdrop-blur-md border border-primary/50 px-3 py-1 rounded-sm'>
												<span className='text-xl font-bold font-mono text-primary text-shadow-neon'>
													{rating.score}
												</span>
											</div>
										</div>

										<div className='absolute top-3 left-3 z-20'>
											<DeleteButton ratingId={rating.id} />
										</div>

										<div className='absolute bottom-3 left-3 z-20 flex items-center gap-2 text-xs font-mono text-primary/80'>
											<Calendar className='w-3 h-3' />
											{new Date(rating.created_at).toLocaleDateString()}
										</div>
									</div>

									{/* Body Stats Area */}
									<div className='p-4 space-y-4 relative'>
										<div className='grid grid-cols-3 gap-2 text-center'>
											<div className='p-2 bg-secondary/5 rounded-sm border border-secondary/10'>
												<div className='text-[10px] text-muted-foreground uppercase'>
													Jaw
												</div>
												<div className='text-lg font-mono font-bold text-secondary'>
													{rating.jawline}
												</div>
											</div>
											<div className='p-2 bg-primary/5 rounded-sm border border-primary/10'>
												<div className='text-[10px] text-muted-foreground uppercase'>
													Skin
												</div>
												<div className='text-lg font-mono font-bold text-primary'>
													{rating.skin}
												</div>
											</div>
											<div className='p-2 bg-secondary/5 rounded-sm border border-secondary/10'>
												<div className='text-[10px] text-muted-foreground uppercase'>
													Eye
												</div>
												<div className='text-lg font-mono font-bold text-secondary'>
													{rating.eyes}
												</div>
											</div>
										</div>

										<div className='pl-2 border-l-2 border-primary/30'>
											<p className='text-xs text-muted-foreground line-clamp-2 font-mono'>
												{rating.recommendations?.[0]
													? `"${rating.recommendations[0]}"`
													: 'No protocols available.'}
											</p>
										</div>
									</div>
								</CyberCard>
							</div>
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
