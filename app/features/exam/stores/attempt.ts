import { defineStore } from 'pinia'
import type { AttemptAnswer, AttemptDraft } from '../exam.types'

export const useAttemptStore = defineStore('exam-attempt', {
  state: (): AttemptDraft => ({
    answers: {},
    currentQuestion: 0,
    questionCount: 0,
    completed: false,
  }),
  actions: {
    initialize(questionCount: number) {
      this.questionCount = Math.max(0, Math.trunc(questionCount))
      this.answers = {}
      this.currentQuestion = 0
      this.completed = false
    },
    setAnswer(questionId: string, answer: AttemptAnswer) {
      this.answers[questionId] = [...answer]
    },
    clearAnswer(questionId: string) {
      const { [questionId]: _clearedAnswer, ...remainingAnswers } = this.answers
      this.answers = remainingAnswers
    },
    goToQuestion(index: number) {
      const lastIndex = Math.max(0, this.questionCount - 1)
      this.currentQuestion = Math.min(Math.max(0, Math.trunc(index)), lastIndex)
    },
    markCompleted() {
      this.completed = true
    },
  },
})
