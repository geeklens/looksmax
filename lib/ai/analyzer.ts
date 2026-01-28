export interface AnalysisResult {
	score: number
	jawline: number
	skin: number
	symmetry: number
	eyes: number
	hair: number
	recommendations: string[]
	potential?: number
}

export interface FaceAnalyzer {
	analyze(imageUrl: string): Promise<AnalysisResult>
}
