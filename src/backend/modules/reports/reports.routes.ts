import { Router } from 'express';
import { reportsController } from './controllers/reports.controller';
import { authenticationGuard, tenantGuard, branchGuard, requireAnyPermission } from '../../common/guards';

const router = Router();

router.use(authenticationGuard);
router.use(tenantGuard);
router.use(branchGuard);

// 1. Milk Collection Reports
router.get(
  '/milk/collection',
  requireAnyPermission('reports:view', 'reports:*'),
  reportsController.getMilkCollectionReport.bind(reportsController)
);

// 2. Milk Sales Reports
router.get(
  '/milk/sales',
  requireAnyPermission('reports:view', 'reports:*'),
  reportsController.getMilkSalesReport.bind(reportsController)
);

// 3. Farmer Reports
router.get(
  '/farmers',
  requireAnyPermission('reports:view', 'reports:*'),
  reportsController.getFarmerReport.bind(reportsController)
);

// 4. Customer Reports
router.get(
  '/customers',
  requireAnyPermission('reports:view', 'reports:*'),
  reportsController.getCustomerReport.bind(reportsController)
);

// 5. Financial Reports
router.get(
  '/financial',
  requireAnyPermission('reports:view', 'reports:*'),
  reportsController.getFinancialReport.bind(reportsController)
);

// 6. Inventory Reports
router.get(
  '/inventory',
  requireAnyPermission('reports:view', 'reports:*'),
  reportsController.getInventoryReport.bind(reportsController)
);

export const reportRoutes = router;
