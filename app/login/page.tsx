import { login, signup } from './actions'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

export default function LoginPage() {
	return (
		<div className='flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900'>
			<Tabs defaultValue='login' className='w-full max-w-md'>
				<TabsList className='grid w-full grid-cols-2'>
					<TabsTrigger value='login'>Login</TabsTrigger>
					<TabsTrigger value='signup'>Sign Up</TabsTrigger>
				</TabsList>

				<TabsContent value='login'>
					<Card>
						<CardHeader>
							<CardTitle>Login</CardTitle>
							<CardDescription>
								Enter your credentials to access your account.
							</CardDescription>
						</CardHeader>
						<CardContent className='space-y-4'>
							<form action={login} className='space-y-4'>
								<div className='space-y-2'>
									<Label htmlFor='email'>Email</Label>
									<Input
										id='email'
										name='email'
										type='email'
										required
										placeholder='you@example.com'
									/>
								</div>
								<div className='bg-background dark:bg-background items-center'>
									<div className='flex justify-between items-center bg-background dark:bg-background'>
										<Label htmlFor='password'>Password</Label>
										<Link href='/forgot-password'>
											<span className='text-xs text-primary hover:underline cursor-pointer'>
												Forgot Password?
											</span>
										</Link>
									</div>
									<Input
										id='password'
										name='password'
										type='password'
										required
									/>
								</div>
								<Button type='submit' className='w-full'>
									Log in
								</Button>
							</form>
						</CardContent>
					</Card>
				</TabsContent>

				<TabsContent value='signup'>
					<Card>
						<CardHeader>
							<CardTitle>Sign Up</CardTitle>
							<CardDescription>
								Create a new account to start rating photos.
							</CardDescription>
						</CardHeader>
						<CardContent className='space-y-4'>
							<form action={signup} className='space-y-4'>
								<div className='space-y-2'>
									<Label htmlFor='signup-email'>Email</Label>
									<Input
										id='signup-email'
										name='email'
										type='email'
										required
										placeholder='you@example.com'
									/>
								</div>
								<div className='space-y-2'>
									<Label htmlFor='signup-password'>Password</Label>
									<Input
										id='signup-password'
										name='password'
										type='password'
										required
									/>
								</div>
								<Button type='submit' className='w-full'>
									Sign Up
								</Button>
							</form>
						</CardContent>
					</Card>
				</TabsContent>
			</Tabs>
		</div>
	)
}
