/**
 * Middleware
 * @template S state type
 */
export type ComposeMiddleware<S> = (state: S) => Promise<void> | void

/**
 * Middleware Async use Compose style to auto run Promise.
 * @template S state type
 */
export class Compose<S> {
  private readonly middlewares: Array<ComposeMiddleware<S>>

  constructor() {
    this.middlewares = []
  }

  /**
   * Use the given middleware.
   * @param middleware middleware func
   */
  use(middleware: ComposeMiddleware<S> | Array<ComposeMiddleware<S>>): Compose<S> {
    if (typeof middleware === 'function')
      this.middlewares.push(middleware)

    else
      this.middlewares.push(...middleware)

    return this
  }

  /**
   * Auto run all middlewares.
   * @param state initial state
   */
  run(state: S): Promise<void> {
    return this.middlewares.reduce((prev, current) => prev.then(() => current(state)), Promise.resolve())
  }

  /**
   * Create middlewares layer.
   */
  static create<T>(): Compose<T> {
    return new Compose<T>()
  }
}
