import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Sidebar } from '@/components/Sidebar'

export default async function DashboardLayout({
	children,
}: {
	children: React.ReactNode
}) {
	const supabase = await createClient()
	const {
		data: { user },
	} = await supabase.auth.getUser()

	if (!user) {
		redirect('/login')
	}

	const isAdmin = user.app_metadata?.role === 'admin'

	return (
		<div className='min-h-screen bg-background text-foreground flex'>
			<Sidebar isAdmin={isAdmin} />
			<main className='flex-1 md:ml-64 p-8 overflow-y-auto h-screen'>
				{children}
			</main>
		</div>
	)
}
