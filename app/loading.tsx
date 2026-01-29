import { CyberSpinner } from '@/components/ui/spinner'

export default function Loading() {
	return (
		<div className='fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm'>
			<div className='flex flex-col items-center gap-4'>
				<CyberSpinner />
				<p className='text-sm font-mono text-primary animate-pulse'>
					INITIALIZING...
				</p>
			</div>
		</div>
	)
}
