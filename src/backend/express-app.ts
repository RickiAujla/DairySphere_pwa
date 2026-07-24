import express, { Express, Request, Response, NextFunction } from 'express';
import { requestContextMiddleware, getRequestContext } from './common/context/request-context';
import { AppError } from './common/errors';
import { checkDatabaseHealth } from './prisma/client';
import { env } from './config/env';
import { authRoutes } from './modules/auth/auth.routes';
import { farmerRoutes } from './modules/farmer/farmer.routes';
import { customerRoutes } from './modules/customer/customer.routes';
import { productRoutes } from './modules/product/product.routes';
import { milkRoutes } from './modules/milk/milk.routes';
import { financialRoutes } from './modules/financial/financial.routes';
import { inventoryRoutes } from './modules/inventory/inventory.routes';
import { productPurchaseRoutes } from './modules/inventory/product-purchase.routes';
import { productSaleRoutes } from './modules/inventory/product-sale.routes';
import { stockAdjustmentRoutes } from './modules/inventory/stock-adjustment.routes';
import { dashboardRoutes } from './modules/dashboard/dashboard.routes';
import { reportRoutes } from './modules/reports/reports.routes';

export function createExpressApp(): Express {
  const app = express();

  // Parse JSON bodies
  app.use(express.json());

  // Attach Request Context
  app.use(requestContextMiddleware);

  // Health check endpoint
  app.get('/api/health', async (req: Request, res: Response) => {
    const context = getRequestContext();
    
    // Optional Database Health Check triggered via ?db=true
    let dbStatus: { connected: boolean; error?: string } = { connected: false, error: 'Not checked' };
    if (req.query.db === 'true') {
      dbStatus = await checkDatabaseHealth();
    }

    res.status(200).json({
      status: 'ok',
      service: 'dairysphere-backend',
      environment: env.NODE_ENV,
      timestamp: new Date().toISOString(),
      requestId: context?.requestId,
      database: dbStatus,
    });
  });

  // Authentication routes
  app.use('/api/auth', authRoutes);

  // Master Data routes
  app.use('/api/farmers', farmerRoutes);
  app.use('/api/customers', customerRoutes);
  app.use('/api/products', productRoutes);

  // Milk Operations routes
  app.use('/api/milk', milkRoutes);

  // Financial Domain routes
  app.use('/api/financial', financialRoutes);

  // Product & Inventory Business Engine routes
  app.use('/api/inventory', inventoryRoutes);
  app.use('/api/product-purchases', productPurchaseRoutes);
  app.use('/api/product-sales', productSaleRoutes);
  app.use('/api/stock-adjustments', stockAdjustmentRoutes);

  // Reporting & Dashboard Backend routes
  app.use('/api/dashboard', dashboardRoutes);
  app.use('/api/reports', reportRoutes);

  // Global error handling middleware
  app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
    const context = getRequestContext();
    const requestId = context?.requestId || 'unknown';

    if (err instanceof AppError) {
      res.status(err.statusCode).json({
        error: {
          code: err.code,
          message: err.message,
          details: err.details,
          requestId,
        },
      });
      return;
    }

    if (err.name?.includes('PrismaClient') || err.message?.includes('database server') || err.message?.includes('DATABASE_URL')) {
      res.status(503).json({
        error: {
          code: 'DATABASE_UNAVAILABLE',
          message: 'PostgreSQL database connection is unavailable. Please ensure process.env.DATABASE_URL is set to a reachable PostgreSQL database.',
          requestId,
        },
      });
      return;
    }

    console.error(`[Unhandled Error] RequestID: ${requestId}`, err);

    res.status(500).json({
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: env.NODE_ENV === 'production' ? 'An unexpected internal error occurred' : err.message,
        requestId,
      },
    });
  });

  return app;
}
