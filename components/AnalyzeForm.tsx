'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { analyzeFace } from '@/app/actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import type { AnalysisResult } from '@/lib/ai/analyzer'
import { CyberCard } from '@/components/ui/cyber-card'
import { StatCard } from '@/components/ui/stat-card'
import {
	ScanFace,
	Droplets,
	Scale,
	Eye,
	Sparkles,
	UploadCloud,
	Activity,
	Orbit,
} from 'lucide-react'

export function AnalyzeForm({ userId }: { userId: string }) {
	const [file, setFile] = useState<File | null>(null)
	const [preview, setPreview] = useState<string | null>(null)
	const [loading, setLoading] = useState(false)
	const [result, setResult] = useState<AnalysisResult | null>(null)

	const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		if (e.target.files && e.target.files[0]) {
			const selectedFile = e.target.files[0]
			setFile(selectedFile)
			setPreview(URL.createObjectURL(selectedFile))
			setResult(null)
		}
	}

	const handleUpload = async () => {
		if (!file) return
		setLoading(true)
		setResult(null)

		try {
			const supabase = createClient()
			const ext = file.name.split('.').pop()
			const path = `${userId}/${Date.now()}.${ext}`

			const { error: uploadError } = await supabase.storage
				.from('photos')
				.upload(path, file)

			if (uploadError) throw uploadError

			const { data: signedUrlData, error: signedError } = await supabase.storage
				.from('photos')
				.createSignedUrl(path, 60 * 5) // 5 minutes valid

			if (signedError || !signedUrlData)
				throw new Error('Failed to get signed url')

			const resultData = await analyzeFace(signedUrlData.signedUrl, path)
			setResult(resultData)
		} catch (err: any) {
			console.error(err)
			alert(err.message || 'Something went wrong')
		} finally {
			setLoading(false)
		}
	}

	return (
		<div className='space-y-12 w-full max-w-6xl mx-auto'>
			{/* Upload Section */}
			<CyberCard className='border-primary/50'>
				<div className='flex flex-col md:flex-row items-center gap-8'>
					<div className='flex-1 space-y-4 w-full'>
						<div className='flex items-center gap-2 mb-2'>
							<UploadCloud className='w-6 h-6 text-primary' />
							<h2 className='text-xl font-mono font-bold text-primary tracking-widest uppercase'>
								Upload Subject
							</h2>
						</div>
						<div className='p-8 border-2 border-dashed border-muted rounded-lg hover:border-primary/50 transition-colors bg-black/20 flex flex-col items-center justify-center gap-4 relative'>
							<Input
								type='file'
								onChange={handleFileChange}
								accept='image/*'
								className='absolute inset-0 w-full h-full opacity-0 cursor-pointer'
							/>
							{preview ? (
								<img
									src={preview}
									alt='Queue'
									className='max-h-32 object-contain'
								/>
							) : (
								<div className='text-center text-muted-foreground'>
									<ScanFace className='w-12 h-12 mx-auto mb-2 opacity-50' />
									<p>Drop image or click to scan</p>
								</div>
							)}
						</div>
						<Button
							onClick={handleUpload}
							disabled={loading || !file}
							className='w-full bg-primary text-black hover:bg-primary/90 font-mono font-bold tracking-wider'
							size='lg'
						>
							{loading ? (
								<span className='flex items-center gap-2'>
									<Activity className='animate-pulse w-4 h-4' />
									PROCESSING...
								</span>
							) : (
								'INITIATE ANALYSIS'
							)}
						</Button>
					</div>
				</div>
			</CyberCard>

			{result && (
				<div className='grid grid-cols-1 lg:grid-cols-3 gap-8 animate-in fade-in slide-in-from-bottom-8 duration-700'>
					{/* Left Column: Image & Radar (Placeholder for now) */}
					<div className='lg:col-span-1 space-y-8'>
						<CyberCard className='overflow-hidden p-0 bg-black/50 border-primary/30'>
							<div className='relative aspect-[3/4] w-full'>
								<div className='absolute inset-0 bg-gradient-to-t from-black/80 to-transparent z-10' />
								{/* Grid Overlay */}
								<div className='absolute inset-0 bg-[linear-gradient(rgba(0,255,0,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(0,255,0,0.1)_1px,transparent_1px)] bg-[size:20px_20px] z-10 pointer-events-none' />

								{/* Scanner Line Animation */}
								<div className='absolute top-0 left-0 w-full h-1 bg-primary/50 shadow-[0_0_15px_rgba(var(--primary),0.8)] z-20 animate-[scan_3s_ease-in-out_infinite]' />

								{preview && (
									// eslint-disable-next-line @next/next/no-img-element
									<img
										src={preview}
										alt='Subject'
										className='w-full h-full object-cover grayscale-[0.3] contrast-125'
									/>
								)}

								<div className='absolute bottom-4 left-4 z-20'>
									<h3 className='text-2xl font-bold font-mono text-primary text-shadow-neon'>
										{result.score}
									</h3>
									<p className='text-xs text-primary/70 font-mono'>
										OVERALL SCORE
									</p>
								</div>
							</div>
						</CyberCard>
					</div>

					{/* Right Column: Stats Grid */}
					<div className='lg:col-span-2 space-y-6'>
						<div className='grid grid-cols-2 lg:grid-cols-3 gap-4'>
							<StatCard
								label='Jawline'
								value={result.jawline}
								icon={Activity}
								description='Mandibular definition'
								color='secondary'
							/>
							<StatCard
								label='Skin'
								value={result.skin}
								icon={Droplets}
								description='Texture quality'
							/>
							<StatCard
								label='Symmetry'
								value={result.symmetry}
								icon={Scale}
								description='Lateral Balance'
							/>
							<StatCard
								label='Eyes'
								value={result.eyes}
								icon={Eye}
								description='Canthal Tilt'
								color='secondary'
							/>
							<StatCard
								label='Hair'
								value={result.hair}
								icon={Sparkles}
								description='Volume & Style'
							/>
							<StatCard
								label='Potential'
								value='MAX'
								icon={Orbit}
								description='Projected Limit'
								color='secondary'
							/>
						</div>

						<CyberCard className='border-primary/30'>
							<h3 className='text-lg font-mono font-bold text-primary mb-4 flex items-center gap-2'>
								<span className='text-primary/50 text-sm'>{'>>'}</span>
								OPTIMIZATION PROTOCOLS
							</h3>
							<div className='space-y-2'>
								{result.recommendations.map((rec, i) => (
									<div
										key={i}
										className='flex items-start gap-4 p-3 bg-secondary/5 border border-secondary/20 rounded-sm'
									>
										<span className='text-secondary font-mono text-sm opacity-50'>
											0{i + 1}
										</span>
										<p className='text-sm font-mono text-secondary-foreground/90'>
											{rec}
										</p>
									</div>
								))}
							</div>
						</CyberCard>
					</div>
				</div>
			)}
		</div>
	)
}
