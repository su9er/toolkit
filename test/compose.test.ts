import { describe, expect, it } from 'vitest'
import { Compose } from '../src'

describe('compose middleware auto run', async() => {
  type State = Record<string, number>
  const order: number[] = []

  const app = Compose.create<State>()

  app.use(async(state) => {
    expect(state.a).toBe(1)
    state.b = 2
    order.push(1)
  })

  app.use([
    async(state) => {
      expect(state.b).toBe(2)
      state.c = 3
      order.push(2)
      // break chain
      throw new Error('break')
    },
    async(state) => {
      // never call
      state.d = 4
      order.push(3)
    },
  ])

  it('should auto run middlewares use Compose with Error', async() => {
    const state: State = { a: 1 }
    try {
      await app.run(state)
    }
    catch (e) {
      expect((e as Error).message).toBe('break')
    }
    expect(state).toEqual({ a: 1, b: 2, c: 3 })
    expect(order).toEqual([1, 2])
  })
})
