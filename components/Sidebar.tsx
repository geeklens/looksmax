'use client'

import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
	LayoutDashboard,
	History,
	Settings,
	Shield,
	Menu,
	LogOut,
	Eye,
} from 'lucide-react'
import { ModeToggle } from '@/components/mode-toggle'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

interface SidebarProps {
	isAdmin: boolean
}

export function Sidebar({ isAdmin }: SidebarProps) {
	const pathname = usePathname()
	const router = useRouter()
	const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false)

	const navItems = [
		{
			title: 'Analyze',
			href: '/',
			icon: Eye,
		},
		{
			title: 'History',
			href: '/history',
			icon: History,
		},
		{
			title: 'Profile',
			href: '/profile',
			icon: Settings,
		},
	]

	if (isAdmin) {
		navItems.push({
			title: 'Admin',
			href: '/admin',
			icon: Shield,
		})
	}

	const handleSignOut = async () => {
		const supabase = createClient()
		await supabase.auth.signOut()
		router.refresh()
	}

	return (
		<>
			{/* Mobile Menu Button */}
			<div className='md:hidden fixed top-4 right-4 z-50'>
				<Button
					variant='outline'
					size='icon'
					onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
					className='border-primary/50 text-primary'
				>
					<Menu className='h-4 w-4' />
				</Button>
			</div>

			{/* Sidebar Container */}
			<aside
				className={cn(
					'fixed left-0 top-0 z-40 h-screen w-64 transform border-r-[1px] border-primary/20 bg-black/90 backdrop-blur-xl transition-transform duration-200 ease-in-out md:translate-x-0 font-mono',
					isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full',
				)}
			>
				<div className='flex h-full flex-col'>
					{/* Header */}
					<div className='flex h-16 items-center border-b border-primary/20 px-6 relative overflow-hidden group'>
						<div className='absolute inset-0 bg-primary/5 group-hover:bg-primary/10 transition-colors' />
						<div className='absolute bottom-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-primary to-transparent' />
						<Link
							href='/'
							className='flex items-center gap-2 font-semibold relative z-10 w-full'
						>
							<span className='text-xl font-bold tracking-widest text-primary text-shadow-neon w-full text-center'>
								LOOKSMAX_AI
							</span>
						</Link>
					</div>

					{/* Navigation */}
					<nav className='flex-1 space-y-2 p-4'>
						{navItems.map(item => (
							<Link
								key={item.href}
								href={item.href}
								className={cn(
									'flex items-center gap-3 rounded-none px-3 py-3 text-sm font-medium transition-all relative border-l-2',
									pathname === item.href
										? 'border-primary bg-primary/10 text-primary shadow-[inset_10px_0_20px_-10px_rgba(var(--primary),0.2)]'
										: 'border-transparent text-muted-foreground hover:text-primary hover:bg-primary/5 hover:border-primary/30',
								)}
								onClick={() => setIsMobileMenuOpen(false)}
							>
								<item.icon
									className={cn(
										'h-4 w-4',
										pathname === item.href && 'text-shadow-neon',
									)}
								/>
								<span className='tracking-wider uppercase'>{item.title}</span>
								{pathname === item.href && (
									<div className='absolute right-2 w-2 h-2 bg-primary rounded-full shadow-[0_0_5px_rgba(var(--primary),0.8)]' />
								)}
							</Link>
						))}
					</nav>

					{/* Footer */}
					<div className='border-t border-primary/20 p-4 space-y-4 bg-primary/5'>
						{/* Stats Mocks */}
						<div className='grid grid-cols-2 gap-2 text-[10px] items-center text-primary/60 font-mono'>
							<div>SYS.STATUS:</div>
							<div className='text-right text-green-500'>ONLINE</div>
							<div>VER:</div>
							<div className='text-right'>2.0.4</div>
						</div>

						<div className='flex items-center justify-between'>
							<p className='text-xs text-muted-foreground uppercase tracking-widest'>
								Theme
							</p>
							<ModeToggle />
						</div>
						<Button
							variant='destructive'
							className='w-full justify-center gap-2 font-mono uppercase tracking-widest bg-red-900/20 text-red-500 border border-red-900/50 hover:bg-red-900/40'
							onClick={handleSignOut}
						>
							<LogOut className='h-4 w-4' />
							Disconnect
						</Button>
					</div>
				</div>
			</aside>

			{/* Overlay for mobile */}
			{isMobileMenuOpen && (
				<div
					className='fixed inset-0 z-30 bg-black/80 md:hidden backdrop-blur-sm'
					onClick={() => setIsMobileMenuOpen(false)}
				/>
			)}
		</>
	)
}
