import { AnalysisResult, FaceAnalyzer } from './analyzer'

export class OpenAiAnalyzer implements FaceAnalyzer {
	async analyze(imageUrl: string): Promise<AnalysisResult> {
		throw new Error('OpenAI Analyzer not implemented yet. Use AI_MODE=mock')
	}
}
