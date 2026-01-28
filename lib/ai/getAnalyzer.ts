import { FaceAnalyzer } from './analyzer'
import { MockAnalyzer } from './mockAnalyzer'
import { OpenAiAnalyzer } from './openaiAnalyzer'

export function getAnalyzer(): FaceAnalyzer {
	const mode = process.env.AI_MODE || 'mock'

	if (mode === 'openai') {
		return new OpenAiAnalyzer()
	}

	return new MockAnalyzer()
}
