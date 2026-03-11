import { MiddlewareManager } from '../../src/managers/MiddlewareManager';
import { MiddlewareContext, MiddlewareFunction } from '../../src/dev';

// Mock logger
jest.mock('../../src/logger', () => ({
  Clientlogger: {
    info: jest.fn(),
    debug: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
  },
}));

describe('MiddlewareManager', () => {
  let manager: MiddlewareManager;
  let mockContext: MiddlewareContext;

  beforeEach(() => {
    manager = new MiddlewareManager();
    // Dummy context for testing
    mockContext = {
      interaction: {} as any,
      command: {} as any,
      client: {} as any,
      handler: {} as any,
      state: {},
    };
  });

  it('should initialize empty', () => {
    expect(manager.getCount()).toBe(0);
  });

  it('should register middlewares', () => {
    manager.use(async (ctx, next) => next());
    expect(manager.getCount()).toBe(1);
  });

  it('should execute middlewares in order', async () => {
    const order: number[] = [];

    manager.use(async (ctx, next) => {
      order.push(1);
      await next();
      order.push(6);
    });

    manager.use(async (ctx, next) => {
      order.push(2);
      await next();
      order.push(5);
    });

    manager.use(async (ctx, next) => {
      order.push(3);
      await next();
      order.push(4);
    });

    const completed = await manager.execute(mockContext);
    
    expect(completed).toBe(true);
    expect(order).toEqual([1, 2, 3, 4, 5, 6]);
  });

  it('should stop execution if next() is not called', async () => {
    const order: number[] = [];

    manager.use(async (ctx, next) => {
      order.push(1);
      await next();
    });

    manager.use(async (ctx, next) => {
      order.push(2);
      // block by not calling next()
    });

    manager.use(async (ctx, next) => {
      order.push(3); // Should not be reached
      await next();
    });

    const completed = await manager.execute(mockContext);
    
    expect(completed).toBe(false);
    expect(order).toEqual([1, 2]);
  });

  it('should throw if next() is called multiple times', async () => {
    manager.use(async (ctx, next) => {
      await next();
      await next(); // Should throw error that is caught and logged
    });

    const completed = await manager.execute(mockContext);
    
    // We expect the manager to catch the error and return false (blocked)
    expect(completed).toBe(false);
  });

  it('should pass state between middlewares', async () => {
    manager.use(async (ctx, next) => {
      ctx.state.userRole = 'admin';
      await next();
    });

    manager.use(async (ctx, next) => {
      expect(ctx.state.userRole).toBe('admin');
      ctx.state.validated = true;
      await next();
    });

    await manager.execute(mockContext);
    expect(mockContext.state.validated).toBe(true);
  });

  it('should clear middlewares', () => {
    manager.use(async (ctx, next) => next());
    manager.clear();
    expect(manager.getCount()).toBe(0);
  });
});
