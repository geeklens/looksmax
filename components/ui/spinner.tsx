import { cn } from '@/lib/utils'

export function Spinner({ className }: { className?: string }) {
	return (
		<div className={cn('relative w-12 h-12', className)}>
			<div className='absolute inset-0 rounded-full border-4 border-primary/30' />
			<div className='absolute inset-0 rounded-full border-4 border-t-primary animate-spin' />
		</div>
	)
}

export function CyberSpinner({ className }: { className?: string }) {
	return (
		<div className={cn('relative flex items-center justify-center', className)}>
			<div className='w-16 h-16 rounded-full border-2 border-primary/20 animate-[spin_3s_linear_infinite]' />
			<div className='absolute w-12 h-12 rounded-full border-t-2 border-primary animate-[spin_2s_linear_infinite_reverse]' />
			<div className='absolute w-2 h-2 bg-primary rounded-full animate-pulse' />
		</div>
	)
}
