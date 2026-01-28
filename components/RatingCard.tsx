'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { CyberCard } from '@/components/ui/cyber-card'
import { DeleteButton } from '@/components/delete-button'
import {
	Calendar,
	Activity,
	Droplets,
	Scale,
	Eye,
	Sparkles,
	Orbit,
	X,
	Info,
	Database,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { createPortal } from 'react-dom'
import { StatCard } from '@/components/ui/stat-card'
import { cn } from '@/lib/utils'

interface RatingCardProps {
	rating: any
	isAdmin?: boolean
}

export function RatingCard({ rating, isAdmin = false }: RatingCardProps) {
	const [isOpen, setIsOpen] = useState(false)
	const [mounted, setMounted] = useState(false)
	const [imageLoading, setImageLoading] = useState(true)

	useEffect(() => {
		setMounted(true)
		if (isOpen) {
			document.body.style.overflow = 'hidden'
		} else {
			document.body.style.overflow = 'auto'
		}
		return () => {
			document.body.style.overflow = 'auto'
		}
	}, [isOpen])

	const photo = rating.photos as any
	const imageUrl = rating.signedUrl || photo?.image_url

	const stats = [
		{
			label: 'Jawline',
			value: rating.jawline,
			icon: Activity,
			color: 'secondary' as const,
		},
		{
			label: 'Skin',
			value: rating.skin,
			icon: Droplets,
			color: 'primary' as const,
		},
		{
			label: 'Symmetry',
			value: rating.symmetry,
			icon: Scale,
			color: 'primary' as const,
		},
		{
			label: 'Eyes',
			value: rating.eyes,
			icon: Eye,
			color: 'secondary' as const,
		},
		{
			label: 'Hair',
			value: rating.hair,
			icon: Sparkles,
			color: 'primary' as const,
		},
	]

	return (
		<>
			<div
				className='block group relative cursor-pointer'
				onClick={() => setIsOpen(true)}
			>
				<CyberCard className='h-full p-0 overflow-hidden border-primary/30 group-hover:border-primary transition-colors hover:shadow-[0_0_20px_rgba(var(--primary),0.2)]'>
					{/* Header Image Area */}
					<div className='relative aspect-square w-full bg-black/50'>
						<div className='absolute inset-0 bg-gradient-to-b from-transparent to-black/90 z-10' />

						{imageUrl ? (
							<Image
								src={imageUrl}
								alt='Subject'
								fill
								sizes='(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw'
								onLoad={() => setImageLoading(false)}
								className={cn(
									'object-cover transition-all duration-700',
									imageLoading
										? 'opacity-0 scale-105'
										: 'opacity-100 scale-100',
								)}
							/>
						) : (
							<div className='w-full h-full flex items-center justify-center text-muted-foreground bg-secondary/10'>
								<span className='text-xs font-mono'>IMG_EXP</span>
							</div>
						)}

						<div className='absolute top-3 right-3 z-20 flex gap-2'>
							<div className='bg-black/80 backdrop-blur-md border border-primary/50 px-3 py-1 rounded-sm'>
								<span className='text-xl font-bold font-mono text-white dark:text-primary text-shadow-neon'>
									{rating.score}
								</span>
							</div>
						</div>

						<div
							className='absolute top-3 left-3 z-20'
							onClick={e => e.stopPropagation()}
						>
							<DeleteButton ratingId={rating.id} />
						</div>

						<div className='absolute bottom-3 left-3 z-20 flex flex-col gap-1 text-xs font-mono text-white/90 dark:text-primary/80'>
							<div className='flex items-center gap-2'>
								<Calendar className='w-3 h-3' />
								{new Date(rating.created_at).toLocaleDateString()}
							</div>
							{isAdmin && (
								<div className='text-[10px] text-muted-foreground bg-black/50 px-1 rounded truncate max-w-[150px]'>
									USER: {photo?.user_id || 'Unknown'}
								</div>
							)}
						</div>
					</div>

					{/* Body Stats Area - Summary */}
					<div className='p-4 space-y-3 relative'>
						<div className='grid grid-cols-3 gap-2 text-center'>
							<div className='p-1 bg-secondary/5 rounded-sm border border-secondary/10'>
								<div className='text-[8px] text-muted-foreground uppercase'>
									Jaw
								</div>
								<div className='text-sm font-mono font-bold text-secondary'>
									{rating.jawline}
								</div>
							</div>
							<div className='p-1 bg-primary/5 rounded-sm border border-primary/10'>
								<div className='text-[8px] text-muted-foreground uppercase'>
									Skin
								</div>
								<div className='text-sm font-mono font-bold text-primary'>
									{rating.skin}
								</div>
							</div>
							<div className='p-1 bg-secondary/5 rounded-sm border border-secondary/10'>
								<div className='text-[8px] text-muted-foreground uppercase'>
									Eye
								</div>
								<div className='text-sm font-mono font-bold text-secondary'>
									{rating.eyes}
								</div>
							</div>
						</div>
					</div>
				</CyberCard>
			</div>

			{/* Modal Portal */}
			{mounted &&
				isOpen &&
				createPortal(
					<div className='fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8'>
						<div
							className='absolute inset-0 bg-black/80 backdrop-blur-sm'
							onClick={() => setIsOpen(false)}
						/>

						<div className='relative w-full max-w-4xl max-h-[90vh] overflow-y-auto custom-scrollbar bg-background border border-primary/30 shadow-[0_0_50px_rgba(0,0,0,0.5)] animate-in fade-in zoom-in-95 duration-200'>
							<div className='sticky top-0 right-0 p-4 flex justify-end z-50'>
								<Button
									variant='ghost'
									size='icon'
									onClick={() => setIsOpen(false)}
									className='bg-black/50 hover:bg-red-500 text-white border border-white/10'
								>
									<X className='w-5 h-5' />
								</Button>
							</div>

							<div className='p-6 md:p-10 -mt-14'>
								<div className='grid grid-cols-1 lg:grid-cols-2 gap-10'>
									{/* Image Section */}
									<div className='space-y-6'>
										<CyberCard className='p-0 overflow-hidden border-primary/50 aspect-[3/4] relative'>
											<div className='absolute inset-0 bg-[linear-gradient(rgba(0,255,0,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(0,255,0,0.05)_1px,transparent_1px)] bg-[size:30px_30px] z-10' />
											{imageUrl && (
												<Image
													src={imageUrl}
													alt='Detailed Subject'
													fill
													className='object-cover'
												/>
											)}
											<div className='absolute bottom-6 left-6 z-20'>
												<div className='text-4xl font-bold font-mono text-primary text-shadow-neon'>
													{rating.score}
												</div>
												<div className='text-xs text-primary/70 font-mono tracking-widest'>
													FINAL_ANALYSIS_SCORE
												</div>
											</div>

											<div className='absolute top-6 left-6 z-20'>
												<DeleteButton ratingId={rating.id} />
											</div>
										</CyberCard>

										{/* Admin Details */}
										{isAdmin && (
											<CyberCard className='bg-primary/5 border-primary/20 space-y-3 font-mono text-[10px]'>
												<h4 className='text-primary font-bold flex items-center gap-2 uppercase tracking-widest text-xs mb-2'>
													<Database className='w-3 h-3' /> System_Metadata
												</h4>
												<div className='flex justify-between border-b border-primary/10 pb-1'>
													<span className='text-muted-foreground'>
														RECORD_ID:
													</span>
													<span className='text-primary'>{rating.id}</span>
												</div>
												<div className='flex justify-between border-b border-primary/10 pb-1'>
													<span className='text-muted-foreground'>
														USER_AUTH_ID:
													</span>
													<span className='text-primary'>{photo?.user_id}</span>
												</div>
												<div className='flex justify-between border-b border-primary/10 pb-1'>
													<span className='text-muted-foreground'>
														PHOTO_REF:
													</span>
													<span className='text-primary'>
														{rating.photo_id}
													</span>
												</div>
												<div className='flex justify-between pb-1'>
													<span className='text-muted-foreground'>
														TIMESTAMP:
													</span>
													<span className='text-primary'>
														{rating.created_at}
													</span>
												</div>
											</CyberCard>
										)}
									</div>

									{/* Results Section */}
									<div className='space-y-8'>
										<div>
											<h3 className='text-xl font-mono font-bold text-primary mb-6 flex items-center gap-2 tracking-tighter'>
												<Activity className='w-5 h-5' /> BIOMETRIC_REPORTS
											</h3>
											<div className='grid grid-cols-2 gap-4'>
												{stats.map((stat, i) => (
													<StatCard key={i} {...stat} />
												))}
												<StatCard
													label='Potential'
													value={
														rating.potential ||
														Math.min(
															100,
															Math.floor(
																rating.score + (100 - rating.score) * 0.4,
															),
														)
													}
													icon={Orbit}
													color='secondary'
													description='Projected Limit'
												/>
											</div>
										</div>

										<div className='space-y-4'>
											<h3 className='text-lg font-mono font-bold text-primary flex items-center gap-2'>
												<Info className='w-4 h-4' /> OPTIMIZATION_PROTOCOLS
											</h3>
											<div className='space-y-3'>
												{rating.recommendations?.map(
													(rec: string, i: number) => (
														<div
															key={i}
															className='flex items-start gap-4 p-4 bg-secondary/10 border border-secondary/20 rounded-none relative'
														>
															<div className='absolute left-0 top-0 w-1 h-full bg-secondary shadow-[0_0_10px_rgba(var(--secondary),0.5)]' />
															<span className='text-secondary font-mono text-xs font-bold pt-1'>
																[{i + 1}]
															</span>
															<p className='text-sm font-mono text-foreground'>
																{rec}
															</p>
														</div>
													),
												)}
											</div>
										</div>
									</div>
								</div>
							</div>
						</div>
					</div>,
					document.body,
				)}
		</>
	)
}
