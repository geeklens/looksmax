import { useEffect, useRef, useState } from 'react'
import {
	FilesetResolver,
	FaceLandmarker,
	FaceLandmarkerResult,
} from '@mediapipe/tasks-vision'
import {
	GeometricAnalyzer,
	FaceGeometryResult,
	Point,
} from '@/lib/ai/face-geometry'

export function useFaceAnalyzer() {
	const [isLoadingModel, setIsLoadingModel] = useState(true)
	const [error, setError] = useState<string | null>(null)
	const faceLandmarkerRef = useRef<FaceLandmarker | null>(null)

	useEffect(() => {
		const loadModel = async () => {
			try {
				const filesetResolver = await FilesetResolver.forVisionTasks(
					'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.3/wasm',
				)

				faceLandmarkerRef.current = await FaceLandmarker.createFromOptions(
					filesetResolver,
					{
						baseOptions: {
							modelAssetPath: `https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task`,
							delegate: 'GPU',
						},
						outputFaceBlendshapes: true,
						runningMode: 'IMAGE',
						numFaces: 1,
					},
				)

				setIsLoadingModel(false)
			} catch (err: any) {
				console.error('Failed to load MediaPipe model:', err)
				setError('Failed to load AI model. Please refresh.')
				setIsLoadingModel(false)
			}
		}

		loadModel()

		return () => {
			try {
				if (faceLandmarkerRef.current) {
					faceLandmarkerRef.current.close()
					faceLandmarkerRef.current = null
				}
			} catch (cleanupError) {
				console.warn('Failed to close MediaPipe model:', cleanupError)
			}
		}
	}, [])

	const analyzeImage = async (imageFile: File): Promise<FaceGeometryResult> => {
		if (!faceLandmarkerRef.current) {
			throw new Error('AI Model not ready')
		}

		// Prepare image using a canvas to ensure raw pixel data is ready and compatible
		const canvas = document.createElement('canvas')
		const ctx = canvas.getContext('2d')
		if (!ctx) throw new Error('Failed to create canvas context')

		const img = new Image()
		img.src = URL.createObjectURL(imageFile)

		await new Promise((resolve, reject) => {
			img.onload = resolve
			img.onerror = reject
		})

		canvas.width = img.width
		canvas.height = img.height
		ctx.drawImage(img, 0, 0)

		let result: FaceLandmarkerResult
		try {
			result = faceLandmarkerRef.current.detect(canvas) // Canvas is always safe
		} catch (e) {
			console.error('MediaPipe Detect crashed', e)
			throw new Error('AI Detection failed')
		} finally {
			// Clean up
			canvas.remove()
			URL.revokeObjectURL(img.src)
		}

		if (!result.faceLandmarks || result.faceLandmarks.length === 0) {
			throw new Error('No face detected')
		}

		const landmarks = result.faceLandmarks[0] // 478 points

		// Convert to our Point interface
		const points: Point[] = landmarks.map(p => ({ x: p.x, y: p.y, z: p.z }))

		// real calculations from landmarks
		const pose = GeometricAnalyzer.getPose(points)
		const symmetry = GeometricAnalyzer.calculateSymmetry(points)
		const jawline = GeometricAnalyzer.calculateJawlineScore(points, pose)
		const eyes = GeometricAnalyzer.calculateEyeScore(points)

		// Skin and Hair are still estimated/mocked for now as geometry doesn't cover texture
		const skin = Math.floor(Math.random() * (90 - 75) + 75)
		const hair = Math.floor(Math.random() * (92 - 70) + 70)

		const avgScore = Math.floor((symmetry + jawline + eyes + skin + hair) / 5)

		const resultValues = {
			symmetry: Math.floor(symmetry),
			jawline: Math.floor(jawline),
			eyes: Math.floor(eyes),
			skin,
			hair,
			cheekbones: Math.floor((jawline + symmetry) / 2),
			nose: 82, // Standard
		}

		const recommendations = GeometricAnalyzer.getRecommendations(resultValues)
		const potential = Math.min(
			100,
			Math.floor(avgScore + (100 - avgScore) * 0.4),
		)

		return {
			score: avgScore,
			...resultValues,
			recommendations,
			potential,
		}
	}

	return { analyzeImage, isLoadingModel, error }
}
