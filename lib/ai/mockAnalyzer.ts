import { AnalysisResult, FaceAnalyzer } from './analyzer'

export class MockAnalyzer implements FaceAnalyzer {
	async analyze(imageUrl: string): Promise<AnalysisResult> {
		// Simulate delay
		await new Promise(resolve => setTimeout(resolve, 2000))

		return {
			score: 85,
			jawline: 80,
			skin: 90,
			symmetry: 85,
			eyes: 88,
			hair: 82,
			recommendations: [
				'Drink more water to improve skin hydration.',
				'Consider a new haircut to frame your face better.',
				'Maintain good posture to accentuate jawline.',
			],
		}
	}
}
