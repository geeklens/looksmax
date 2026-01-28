import { createClient } from '@/lib/supabase/server'
import { supabaseAdmin } from '@/lib/supabase/admin-client'
import { redirect } from 'next/navigation'
import { CyberCard } from '@/components/ui/cyber-card'
import { DeleteButton } from '@/components/delete-button'
import { Button } from '@/components/ui/button'
import { UserActions } from '@/components/admin/user-actions'
import {
	Calendar,
	Shield,
	Users,
	Database,
	ChevronLeft,
	ChevronRight,
	Mail,
	Fingerprint,
} from 'lucide-react'
import Link from 'next/link'

interface AdminPageProps {
	searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

export default async function AdminPage({ searchParams }: AdminPageProps) {
	const supabase = await createClient()
	const {
		data: { user },
	} = await supabase.auth.getUser()

	if (!user) {
		redirect('/login')
	}

	const isAdmin = user.app_metadata?.role === 'admin'
	if (!isAdmin) {
		redirect('/')
	}

	// Await search params for Next.js 15+
	const params = await searchParams
	const page = typeof params.page === 'string' ? parseInt(params.page) : 1
	const PER_PAGE = 10
	const from = (page - 1) * PER_PAGE
	const to = from + PER_PAGE - 1

	// Fetch Data
	const {
		data: { users },
	} = await supabaseAdmin.auth.admin.listUsers()

	// Use Admin client to fetch ratings to bypass RLS and ensure we see ALL users' data
	const { data: ratings, count } = await supabaseAdmin
		.from('ratings')
		.select('*, photos(*)', { count: 'exact' })
		.order('created_at', { ascending: false })
		.range(from, to)

	// Calculate pagination
	const totalCount = count || 0
	const totalPages = Math.ceil(totalCount / PER_PAGE)

	// Stats
	const totalUsers = users?.length || 0
	const totalScans = totalCount // Total scans in DB

	// Time stats
	const now = new Date()
	const startOfDay = new Date(
		now.getFullYear(),
		now.getMonth(),
		now.getDate(),
	).toISOString()

	const newUsersToday =
		users?.filter(u => u.created_at > startOfDay).length || 0
	const scansToday =
		ratings?.filter((r: any) => r.created_at > startOfDay).length || 0 // This is only for the current page, ideally we need separate query for today's total stats but using current page list is inaccurate for stats.
	// Correction: We can't easily get "scans today" without another query if we paginate.
	// For now, I will skip "scans today" accuracy or run a lightweight query.
	// Let's run a quick count query for today stats if important, or just remove "today" stats for scans to save bandwidth.
	// I will remove "scans today" detail to optimize, or keep it as "recent scans today" (from fetched).
	// Actually, let's keep it simple.

	// Process ratings to refresh signed URLs
	// User admin client to sign URLs to ensure we have permission to access other users' files
	const ratingsWithSignedUrls = await Promise.all(
		(ratings || []).map(async (rating: any) => {
			let path = rating.photos?.image_url
			if (path && path.includes('/sign/photos/')) {
				const match = path.match(/\/sign\/photos\/(.*?)\?/)
				if (match) path = match[1]
			}
			if (path && !path.startsWith('http')) {
				const { data } = await supabaseAdmin.storage
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
			{/* Header */}
			<div className='flex justify-between items-center border-b border-primary/20 pb-4'>
				<div>
					<h1 className='text-3xl font-mono font-bold tracking-widest text-primary text-shadow-neon flex items-center gap-3'>
						<Shield className='w-8 h-8' />
						COMMAND_CENTER
					</h1>
					<p className='text-sm text-muted-foreground font-mono mt-1 flex items-center gap-2'>
						<span className='w-2 h-2 rounded-full bg-green-500 animate-pulse' />
						SYSTEM OPERATIONAL
						<span className='text-primary/50 mx-2'>|</span>
						ADMIN: {user.email}
					</p>
				</div>
			</div>

			{/* Top Stats Row */}
			<div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
				<CyberCard className='border-secondary/50 bg-secondary/5'>
					<div className='flex justify-between items-start mb-2'>
						<div className='text-xs font-mono text-secondary/70 uppercase'>
							Total Users
						</div>
						<Users className='w-4 h-4 text-secondary' />
					</div>
					<div className='text-3xl font-mono font-bold text-secondary text-shadow-neon'>
						{totalUsers}
					</div>
					<div className='text-[10px] font-mono text-muted-foreground mt-1'>
						+{newUsersToday} new agents joined today
					</div>
				</CyberCard>

				<CyberCard className='border-primary/50 bg-primary/5'>
					<div className='flex justify-between items-start mb-2'>
						<div className='text-xs font-mono text-primary/70 uppercase'>
							Total Scans
						</div>
						<Database className='w-4 h-4 text-primary' />
					</div>
					<div className='text-3xl font-mono font-bold text-primary text-shadow-neon'>
						{totalScans}
					</div>
					<div className='text-[10px] font-mono text-muted-foreground mt-1'>
						Displaying page {page} of {totalPages}
					</div>
				</CyberCard>
			</div>

			{/* User Directory */}
			<CyberCard className='border-primary/30'>
				<h2 className='text-xl font-mono font-bold text-primary tracking-widest mb-4 flex items-center gap-2'>
					<Users className='w-5 h-5' /> AGENT_DIRECTORY
				</h2>
				<div className='rounded-md border border-primary/20 overflow-hidden'>
					<div className='bg-primary/10 p-3 grid grid-cols-12 gap-4 text-xs font-mono text-primary font-bold uppercase tracking-wider'>
						<div className='col-span-4'>Email</div>
						<div className='col-span-3'>ID</div>
						<div className='col-span-3'>Joined</div>
						<div className='col-span-2 text-right'>Last Seen</div>
					</div>
					<div className='max-h-[300px] overflow-y-auto custom-scrollbar'>
						{users?.map((u, i) => (
							<div
								key={u.id}
								className={`p-3 grid grid-cols-12 gap-4 text-xs font-mono border-t border-primary/10 items-center hover:bg-primary/5 transition-colors group ${i % 2 === 0 ? 'bg-black/20' : 'bg-transparent'}`}
							>
								<div className='col-span-4 flex items-center gap-2 truncate text-foreground/90'>
									<Mail className='w-3 h-3 text-muted-foreground' />
									{u.email}
								</div>
								<div
									className='col-span-3 flex items-center gap-2 text-muted-foreground truncate'
									title={u.id}
								>
									<Fingerprint className='w-3 h-3' />
									{u.id.split('-')[0]}...
								</div>
								<div className='col-span-3 text-muted-foreground'>
									{new Date(u.created_at).toLocaleDateString()}
								</div>
								<div className='col-span-2 text-right text-muted-foreground relative min-h-[24px] flex items-center justify-end'>
									<span className='group-hover:opacity-0 transition-opacity duration-200'>
										{u.last_sign_in_at
											? new Date(u.last_sign_in_at).toLocaleDateString()
											: 'Never'}
									</span>
									<div className='absolute right-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200'>
										<UserActions userId={u.id} />
									</div>
								</div>
							</div>
						))}
					</div>
				</div>
			</CyberCard>

			{/* Main Feed */}
			<div className='space-y-4'>
				<div className='flex justify-between items-end border-l-4 border-primary pl-4'>
					<h2 className='text-xl font-mono font-bold text-primary tracking-widest flex items-center gap-2'>
						GLOBAL_SURVEILLANCE_LOGS
					</h2>
					<div className='text-xs font-mono text-muted-foreground'>
						PAGE {page} / {totalPages}
					</div>
				</div>

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

									<div className='absolute bottom-3 left-3 z-20 flex flex-col gap-1 text-xs font-mono text-primary/80'>
										<div className='flex items-center gap-2'>
											<Calendar className='w-3 h-3' />
											{new Date(rating.created_at).toLocaleDateString()}
										</div>
										<div className='text-[10px] text-muted-foreground bg-black/50 px-1 rounded truncate max-w-[150px]'>
											USER: {rating.photos?.user_id || 'Unknown'}
										</div>
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
				{/* Pagination Controls */}
				<div className='flex justify-center items-center gap-4 mt-8 pt-4 border-t border-primary/20'>
					{page > 1 ? (
						<Link href={`/admin?page=${page - 1}`} className='group'>
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
						<Link href={`/admin?page=${page + 1}`} className='group'>
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
		</div>
	)
}
