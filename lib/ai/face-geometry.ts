// Logic for calculating aesthetic scores based on facial landmarks
// This is designed to work with MediaPipe Face Mesh (468/478 points) or Face-api.js (68 points) logic.
// For now, we'll assume a standard set of normalized points.

export interface Point {
	x: number
	y: number
	z?: number
}

export interface FaceGeometryResult {
	score: number
	symmetry: number
	jawline: number
	cheekbones: number
	eyes: number
	nose: number
	skin: number
	hair: number
	recommendations: string[]
	potential: number
}

// MediaPipe Landmark Index Mapping (Approximate key points for 468/478 points)
export const LANDMARKS = {
	MIDLINE: [1, 4, 6, 168, 8, 9, 10, 152], // Forehead to chin
	LEFT_EYE: [33, 133, 159, 145, 173], // Corners, top, bottom
	RIGHT_EYE: [263, 362, 386, 374, 398],
	LEFT_BROW: [70, 63, 105, 66, 107],
	RIGHT_BROW: [300, 293, 334, 296, 336],
	MOUTH_CORNERS: [61, 291],
	NOSE_TIP: 1,
	CHIN: 152,
	// Jawline points (Left Gonion -> Chin -> Right Gonion)
	LEFT_GONION: 172,
	RIGHT_GONION: 397,
	JAW_LINE: [172, 136, 150, 149, 176, 148, 152, 377, 400, 378, 379, 365, 397],
	FACE_BOUNDS: { LEFT: 234, RIGHT: 454, TOP: 10, BOTTOM: 152 },
}

/**
 * Calculates the Euclidean distance between two points
 */
function distance(p1: Point, p2: Point): number {
	return Math.sqrt(Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2))
}

/**
 * Calculates the angle between three points (p1 is the vertex)
 */
function calculateAngle(p1: Point, p2: Point, p3: Point): number {
	const d12 = distance(p1, p2)
	const d13 = distance(p1, p3)
	const d23 = distance(p2, p3)

	// Law of cosines: c^2 = a^2 + b^2 - 2ab cos(C)
	// d23^2 = d12^2 + d13^2 - 2*d12*d13*cos(Angle)
	const numerator = Math.pow(d12, 2) + Math.pow(d13, 2) - Math.pow(d23, 2)
	const denominator = 2 * d12 * d13

	return Math.acos(numerator / denominator) * (180 / Math.PI)
}

export class GeometricAnalyzer {
	/**
	 * Calculate Head Pose (Pitch, Yaw, Roll)
	 */
	static getPose(points: Point[]) {
		const leftEye = points[33]
		const rightEye = points[263]
		const nose = points[1]
		const chin = points[152]

		// Roll: Angle between eyes
		const roll = Math.atan2(rightEye.y - leftEye.y, rightEye.x - leftEye.x)

		// Yaw: Comparison of left vs right face width
		const faceLeft = Math.abs(nose.x - points[234].x)
		const faceRight = Math.abs(nose.x - points[454].x)
		const yaw = (faceLeft - faceRight) / (faceLeft + faceRight) // -1 to 1

		// Pitch: Ratio of nose-to-chin vs total face height
		const noseToChin = Math.abs(nose.y - chin.y)
		const faceHeight = Math.abs(points[10].y - chin.y)
		const pitch = noseToChin / faceHeight // Normalized ratio

		return { roll, yaw, pitch }
	}

	/**
	 * Normalize points by de-rotating (Roll correction)
	 */
	static normalizePoints(points: Point[], roll: number): Point[] {
		const cos = Math.cos(-roll)
		const sin = Math.sin(-roll)
		const nose = points[1]

		return points.map(p => {
			const dx = p.x - nose.x
			const dy = p.y - nose.y
			return {
				x: nose.x + (dx * cos - dy * sin),
				y: nose.y + (dx * sin + dy * cos),
				z: p.z,
			}
		})
	}

	/**
	 * Analyze face symmetry based on normalized mirrored pairs
	 */
	static calculateSymmetry(points: Point[]): number {
		const pose = this.getPose(points)
		const normalized = this.normalizePoints(points, pose.roll)
		const midlineX = normalized[LANDMARKS.MIDLINE[0]].x

		const pairs = [
			[33, 263],
			[133, 362],
			[70, 300],
			[61, 291],
			[234, 454],
		]

		let totalDeviation = 0
		pairs.forEach(([l, r]) => {
			const leftDist = Math.abs(normalized[l].x - midlineX)
			const rightDist = Math.abs(normalized[r].x - midlineX)
			totalDeviation += Math.abs(leftDist - rightDist)
		})

		const avgDev = totalDeviation / pairs.length

		// Penalty for high Yaw (face turned)
		const yawPenalty = Math.abs(pose.yaw) * 50
		return Math.max(0, Math.min(100, 100 - avgDev * 800 - yawPenalty))
	}

	/**
	 * Calculate Jawline score with pose compensation
	 */
	static calculateJawlineScore(points: Point[], pose: { yaw: number }): number {
		const leftG = points[LANDMARKS.LEFT_GONION]
		const rightG = points[LANDMARKS.RIGHT_GONION]
		const chin = points[LANDMARKS.CHIN]

		const angle = calculateAngle(leftG, chin, points[234])

		const idealAngle = 125
		const deviation = Math.abs(angle - idealAngle)

		// Adjust score if face is turned (yaw > 0 means left side is more visible)
		const score = 100 - deviation * 1.5
		const poseCorrection = Math.abs(pose.yaw) * 10

		return Math.max(0, Math.min(100, score - poseCorrection))
	}

	/**
	 * Eye scoring: Canthal tilt and proportion
	 */
	static calculateEyeScore(points: Point[]): number {
		const leftOuter = points[33]
		const leftInner = points[133]

		// Canthal tilt: Angle between horizontal and inner-outer corner line
		const dy = leftInner.y - leftOuter.y
		const dx = leftOuter.x - leftInner.x
		const tilt = Math.atan2(dy, dx) * (180 / Math.PI)

		// Positive tilt (inner lower than outer) is "Hunter Eyes" aesthetic in looksmax community
		const tiltScore = tilt > 0 ? 90 + tilt : 80 + tilt
		return Math.max(0, Math.min(100, tiltScore))
	}

	/**
	 * Generate real-world recommendations based on scores
	 */
	static getRecommendations(results: Partial<FaceGeometryResult>): string[] {
		const recs: string[] = []

		if ((results.jawline || 0) < 80) {
			recs.push(
				'Initiate mewing protocol: maintain proper tongue posture on the roof of the mouth.',
			)
			recs.push(
				'Implement resistance chewing: focus on masseter muscle hypertrophy.',
			)
		}

		if ((results.skin || 0) < 85) {
			recs.push(
				'Optimize skin health: ensure consistent exfoliation and SPF protection.',
			)
		}

		if ((results.symmetry || 0) < 80) {
			recs.push(
				'Balance facial posture: avoid sleeping on one side of the face.',
			)
		}

		if ((results.eyes || 0) < 80) {
			recs.push(
				'Enhance orbital area: focus on lymphatic drainage and consistent ice therapy.',
			)
		}

		if (recs.length < 3) {
			recs.push('Maintain current optimization routine for peak performance.')
			recs.push(
				'Focus on body fat reduction to enhance bone structure visibility.',
			)
		}

		return recs.slice(0, 4)
	}
}
