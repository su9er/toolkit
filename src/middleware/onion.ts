/**
 * Middleware
 * @template S state type
 */
export type OnionMiddleware<S> = (state: S, next: () => Promise<void>) => Promise<void> | void

/**
   * Middleware Async use Onion style like Koa.
   * @template S state type
   */
export class Onion<S> {
  private readonly middlewares: Array<OnionMiddleware<S>>

  constructor() {
    this.middlewares = []
  }

  /**
     * Use the given middleware.
     * @param middleware middleware func
     */
  use(middleware: OnionMiddleware<S> | Array<OnionMiddleware<S>>): Onion<S> {
    if (typeof middleware === 'function')
      this.middlewares.push(middleware)

    else
      this.middlewares.push(...middleware)

    return this
  }

  /**
     * Run all middlewares.
     * @param state initial state
     * @see {@link https://github.com/koajs/compose/blob/master/index.js}
     */
  run(state: S): Promise<void> {
    const next = async(): Promise<void> => {
      const current = this.middlewares.shift()
      if (current == null) return Promise.resolve()
      const result = current(state, next)
      return Promise.resolve(result)
    }
    return next()
  }

  /**
     * Create middlewares layer.
     */
  static create<T>(): Onion<T> {
    return new Onion<T>()
  }
}
