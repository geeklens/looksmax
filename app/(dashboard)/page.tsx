import { createClient } from '@/lib/supabase/server'
import { AnalyzeForm } from '@/components/AnalyzeForm'

export default async function Home() {
	const supabase = await createClient()
	const {
		data: { user },
	} = await supabase.auth.getUser()

	// Layout handles redirect, but we need user for the form
	if (!user) return null

	return (
		<div className='flex flex-col gap-8'>
			<div className='w-full max-w-2xl mx-auto text-center px-4'>
				<h1 className='text-2xl md:text-4xl font-bold mb-4 text-balance'>
					AI Face Analysis
				</h1>
				<p className='text-muted-foreground text-sm md:text-base'>
					Upload a photo to get a detailed aesthetic analysis.
				</p>
			</div>

			<div className='w-full'>
				<AnalyzeForm userId={user.id} />
			</div>
		</div>
	)
}
