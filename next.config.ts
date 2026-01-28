import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
	images: {
		remotePatterns: [
			{
				protocol: 'https',
				hostname: 'vsgxpfvnmappfaahepnq.supabase.co',
				port: '',
				pathname: '/storage/v1/object/sign/**',
			},
			{
				protocol: 'https',
				hostname: 'vsgxpfvnmappfaahepnq.supabase.co',
				port: '',
				pathname: '/storage/v1/object/public/**',
			},
		],
	},
}

export default nextConfig
