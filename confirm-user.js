const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceRoleKey) {
	process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey)

async function forceConfirm(email) {
	const {
		data: { users },
		error,
	} = await supabase.auth.admin.listUsers()
	const user = users.find(u => u.email === email)

	if (!user) {
		console.log('User not found')
		return
	}

	const { data, error: updateError } = await supabase.auth.admin.updateUserById(
		user.id,
		{ email_confirm: true, user_metadata: { email_verified: true } },
	)

	if (updateError) {
		console.log('Error updating user: ' + updateError.message)
	} else {
		console.log('User manually confirmed: ' + email)
	}
}

// Automatically confirm the user found in previous step if desired, or just exit.
// For now, let's just confirm the specific email provided.
forceConfirm('davlatgeeklens@gmail.com')
