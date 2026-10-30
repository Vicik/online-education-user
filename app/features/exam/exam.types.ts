export type ExamDifficulty = 'beginner' | 'intermediate' | 'advanced'

export interface ExamQuery {
  page: number
  pageSize: number
}

export interface ExamSummary {
  id: string
  slug: string
  title: string
  description: string
  durationMinutes: number
  questionCount: number
  difficulty?: ExamDifficulty
  updatedAt?: string
}

export interface ExamDetail extends ExamSummary {
  rules: string[]
  instructions?: string
}

export interface QuestionNavigationItem {
  id: string
  number: number
  answered: boolean
}

export type AttemptAnswer = string[]

export interface AttemptDraft {
  answers: Record<string, AttemptAnswer>
  currentQuestion: number
  questionCount: number
  completed: boolean
}
