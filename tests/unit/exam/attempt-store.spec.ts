import { createPinia, setActivePinia } from 'pinia'
import { beforeEach, describe, expect, it } from 'vitest'
import { useAttemptStore } from '../../../app/features/exam/stores/attempt'

describe('attempt store', () => {
  beforeEach(() => setActivePinia(createPinia()))

  it('sets and clears local answer drafts', () => {
    const store = useAttemptStore()

    store.setAnswer('question-1', ['option-a'])
    expect(store.answers['question-1']).toEqual(['option-a'])

    store.clearAnswer('question-1')
    expect(store.answers['question-1']).toBeUndefined()
  })

  it('keeps the current question inside the configured bounds', () => {
    const store = useAttemptStore()
    store.initialize(3)

    store.goToQuestion(-1)
    expect(store.currentQuestion).toBe(0)

    store.goToQuestion(99)
    expect(store.currentQuestion).toBe(2)
  })

  it('tracks only local completion state and exposes no grading authority', () => {
    const store = useAttemptStore()
    store.initialize(2)
    store.setAnswer('question-1', ['option-a'])
    store.markCompleted()

    expect(store.completed).toBe(true)
    expect('score' in store).toBe(false)
    expect('grade' in store).toBe(false)
    expect('calculateScore' in store).toBe(false)
  })

  it('starts a new attempt without answers or position from the previous attempt', () => {
    const store = useAttemptStore()
    store.initialize(3)
    store.setAnswer('question-1', ['option-a'])
    store.goToQuestion(2)
    store.markCompleted()

    store.initialize(2)

    expect(store.answers).toEqual({})
    expect(store.currentQuestion).toBe(0)
    expect(store.completed).toBe(false)
  })
})
