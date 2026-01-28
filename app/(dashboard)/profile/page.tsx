import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'

export default async function ProfilePage() {
	const supabase = await createClient()
	const {
		data: { user },
	} = await supabase.auth.getUser()

	return (
		<div className='max-w-2xl mx-auto space-y-8'>
			<h1 className='text-3xl font-bold'>Profile Settings</h1>

			<Card>
				<CardHeader>
					<CardTitle>Account Information</CardTitle>
				</CardHeader>
				<CardContent className='space-y-4'>
					<div className='grid gap-2'>
						<Label>Email</Label>
						<div className='p-2 bg-muted rounded-md text-sm'>{user?.email}</div>
					</div>
					<div className='grid gap-2'>
						<Label>User ID</Label>
						<div className='p-2 bg-muted rounded-md text-xs font-mono'>
							{user?.id}
						</div>
					</div>
					<div className='grid gap-2'>
						<Label>Role</Label>
						<div className='p-2 bg-muted rounded-md text-sm capitalize'>
							{user?.app_metadata?.role || 'User'}
						</div>
					</div>
				</CardContent>
			</Card>
		</div>
	)
}
