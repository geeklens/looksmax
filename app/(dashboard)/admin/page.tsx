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
import { RatingCard } from '@/components/RatingCard'
import { cn } from '@/lib/utils'

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

	// Bulk refresh signed URLs using Admin Client for all users' photos
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
			? await supabaseAdmin.storage
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
			<CyberCard className='border-primary/30 p-0 md:p-6 overflow-hidden'>
				<div className='p-6 md:p-0'>
					<h2 className='text-xl font-mono font-bold text-primary tracking-widest mb-4 flex items-center gap-2'>
						<Users className='w-5 h-5' /> AGENT_DIRECTORY
					</h2>
					<div className='rounded-md border border-primary/20 bg-black/20'>
						{/* Table Header - Hidden on small mobile */}
						<div className='hidden md:grid bg-primary/10 p-3 grid-cols-12 gap-4 text-xs font-mono text-primary font-bold uppercase tracking-wider'>
							<div className='col-span-4'>Email</div>
							<div className='col-span-3'>ID</div>
							<div className='col-span-3'>Joined</div>
							<div className='col-span-2 text-right'>Actions</div>
						</div>
						<div className='max-h-[400px] overflow-y-auto custom-scrollbar'>
							{users?.map((u, i) => (
								<div
									key={u.id}
									className={cn(
										'p-4 md:p-3 flex flex-col md:grid md:grid-cols-12 gap-2 md:gap-4 text-xs font-mono border-t border-primary/10 transition-colors group',
										i % 2 === 0 ? 'bg-primary/5' : 'bg-transparent',
									)}
								>
									<div className='md:col-span-4 flex items-center gap-2 truncate text-foreground/90 font-bold md:font-normal'>
										<Mail className='w-3 h-3 text-primary/70 shrink-0' />
										<span className='truncate'>{u.email}</span>
									</div>
									<div className='md:col-span-3 flex items-center gap-2 text-muted-foreground truncate opacity-70 md:opacity-100'>
										<span className='md:hidden text-[10px] text-primary/40 uppercase w-12'>
											UID:
										</span>
										<Fingerprint className='w-3 h-3 hidden md:block' />
										<span className='truncate'>{u.id}</span>
									</div>
									<div className='md:col-span-3 flex items-center gap-2 text-muted-foreground'>
										<span className='md:hidden text-[10px] text-primary/40 uppercase w-12'>
											DATE:
										</span>
										{new Date(u.created_at).toLocaleDateString()}
									</div>
									<div className='md:col-span-2 flex items-center justify-between md:justify-end gap-2 mt-2 md:mt-0 pt-2 md:pt-0 border-t border-primary/5 md:border-0'>
										<span className='md:hidden text-[10px] text-primary/40 uppercase'>
											Operations
										</span>
										<UserActions userId={u.id} />
									</div>
								</div>
							))}
						</div>
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
						<RatingCard key={rating.id} rating={rating} isAdmin={true} />
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
