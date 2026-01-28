import { LucideIcon } from 'lucide-react'
import { CyberCard } from './cyber-card'
import { Progress } from './progress'

interface StatCardProps {
	label: string
	value: number | string
	icon: LucideIcon
	description?: string
	color?: 'primary' | 'secondary'
}

export function StatCard({
	label,
	value,
	icon: Icon,
	description,
	color = 'primary',
}: StatCardProps) {
	const isNumber = typeof value === 'number'

	return (
		<CyberCard
			variant={color}
			className='flex flex-col gap-2 relative overflow-hidden group'
		>
			<div className='absolute top-2 right-2 opacity-20 group-hover:opacity-40 transition-opacity'>
				<Icon className='w-12 h-12' />
			</div>

			<div className='flex items-center gap-2 text-muted-foreground z-10'>
				<Icon className='w-4 h-4' />
				<span className='text-xs uppercase tracking-widest'>{label}</span>
			</div>

			<div className='z-10 mt-1'>
				<div className='text-2xl font-bold font-mono text-shadow-neon'>
					{value}
				</div>
				{description && (
					<p className='text-xs text-muted-foreground mt-1'>{description}</p>
				)}
			</div>

			{isNumber && (
				<div className='mt-2 z-10'>
					<Progress
						value={value as number}
						className='h-1 bg-muted/20'
						indicatorClassName={
							color === 'secondary'
								? 'bg-secondary box-shadow-green'
								: 'bg-primary box-shadow-neon'
						}
					/>
				</div>
			)}
		</CyberCard>
	)
}
