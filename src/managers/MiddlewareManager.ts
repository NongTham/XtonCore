import { MiddlewareFunction, MiddlewareContext } from '../dev';
import { Clientlogger } from '../logger';

export class MiddlewareManager {
  private middlewares: MiddlewareFunction[] = [];

  /**
   * Register a middleware function to be executed before a command runs
   */
  public use(middleware: MiddlewareFunction): void {
    if (typeof middleware !== 'function') {
      throw new Error('Middleware must be a function');
    }
    this.middlewares.push(middleware);
  }

  /**
   * Execute the middleware pipeline
   * @param context Context object containing interaction, command, etc.
   * @returns boolean indicating if the pipeline successfully reached the end
   */
  public async execute(context: MiddlewareContext): Promise<boolean> {
    let index = -1;
    let completed = false;

    const dispatch = async (i: number, error?: Error): Promise<void> => {
      if (error) {
        throw error;
      }
      
      if (i <= index) {
        throw new Error('next() called multiple times in a single middleware');
      }
      
      index = i;

      // If we've reached the end of the pipeline
      if (i === this.middlewares.length) {
        completed = true;
        return;
      }

      const middleware = this.middlewares[i];
      
      try {
        await middleware(context, async (err?: Error) => {
          await dispatch(i + 1, err);
        });
      } catch (err) {
        Clientlogger.error(`Error executing middleware at index ${i}:`, err);
        throw err;
      }
    };

    try {
      await dispatch(0);
      return completed;
    } catch (err) {
      if (err instanceof Error && err.message !== 'next() called multiple times in a single middleware') {
         Clientlogger.error('Unhandled error in middleware pipeline', err);
      }
      return false; // If an error was thrown, consider the pipeline blocked
    }
  }

  /**
   * Get the number of registered middlewares
   */
  public getCount(): number {
    return this.middlewares.length;
  }

  /**
   * Clear all registered middlewares
   */
  public clear(): void {
    this.middlewares = [];
  }
}
