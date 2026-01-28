import { cn } from '@/lib/utils'

interface CyberCardProps extends React.HTMLAttributes<HTMLDivElement> {
	children: React.ReactNode
	variant?: 'primary' | 'secondary' | 'danger'
}

export function CyberCard({
	children,
	className,
	variant = 'primary',
	...props
}: CyberCardProps) {
	const borderColor =
		variant === 'secondary'
			? 'border-secondary/50'
			: variant === 'danger'
				? 'border-destructive/50'
				: 'border-primary/50'

	const cornerColor =
		variant === 'secondary'
			? 'bg-secondary'
			: variant === 'danger'
				? 'bg-destructive'
				: 'bg-primary'

	return (
		<div
			className={cn(
				'relative p-6 bg-card/40 backdrop-blur-md border',
				borderColor,
				className,
			)}
			{...props}
		>
			{/* Top Left Corner */}
			<div
				className={cn(
					'absolute -top-[1px] -left-[1px] w-4 h-4 border-l-2 border-t-2',
					borderColor.replace('/50', ''),
				)}
			/>

			{/* Bottom Right Corner */}
			<div
				className={cn(
					'absolute -bottom-[1px] -right-[1px] w-4 h-4 border-r-2 border-b-2',
					borderColor.replace('/50', ''),
				)}
			/>

			{/* Decorative Lines */}
			<div className={cn('absolute top-0 right-8 w-12 h-[2px]', cornerColor)} />
			<div
				className={cn('absolute bottom-0 left-8 w-12 h-[2px]', cornerColor)}
			/>

			{children}
		</div>
	)
}
