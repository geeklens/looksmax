import { CyberSpinner } from '@/components/ui/spinner'

export default function DashboardLoading() {
	return (
		<div className='w-full h-full flex flex-col items-center justify-center min-h-[50vh]'>
			<CyberSpinner />
			<p className='mt-4 text-sm font-mono text-muted-foreground animate-pulse'>
				LOADING DATA_
			</p>
		</div>
	)
}
