const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceRoleKey) {
	process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey)

async function resetPass(email, newPass) {
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
		{ password: newPass },
	)

	if (updateError) {
		console.log('Error updating password: ' + updateError.message)
	} else {
		console.log(`Password for ${email} manually reset to: ${newPass}`)
	}
}

resetPass('davlatgeeklens@gmail.com', '123123')
