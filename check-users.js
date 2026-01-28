const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceRoleKey) {
	console.error('Missing environment variables. Check .env.local')
	process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey)

async function listUsers() {
	const {
		data: { users },
		error,
	} = await supabase.auth.admin.listUsers()

	if (error) {
		console.error('Error fetching users:', error)
		return
	}

	console.log('--- USERS LIST ---')
	users.forEach(u => {
		console.log(`ID: ${u.id}`)
		console.log(`Email: ${u.email}`)
		console.log(
			`Confirmed At: ${u.email_confirmed_at ? u.email_confirmed_at : 'NOT CONFIRMED'}`,
		)
		console.log(`Last Sign In: ${u.last_sign_in_at}`)
		console.log('------------------')
	})
}

listUsers()
