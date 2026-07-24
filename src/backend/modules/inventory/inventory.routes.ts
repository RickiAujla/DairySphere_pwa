import { Router } from 'express';
import { inventoryController } from './controllers/inventory.controller';
import { stockAdjustmentController } from './controllers/stock-adjustment.controller';
import { authenticationGuard, tenantGuard, branchGuard, requireAnyPermission } from '../../common/guards';

const router = Router();

router.use(authenticationGuard);
router.use(tenantGuard);
router.use(branchGuard);

// Movement history
router.get(
  '/movements',
  requireAnyPermission('inventory:view', 'inventory:*'),
  inventoryController.listStockMovements.bind(inventoryController)
);

// Stock Adjustments via Inventory route
router.get(
  '/adjustments',
  requireAnyPermission('inventory:view', 'inventory:*'),
  stockAdjustmentController.getAdjustmentList.bind(stockAdjustmentController)
);

router.post(
  '/adjustments',
  requireAnyPermission('inventory:adjust', 'inventory:*'),
  stockAdjustmentController.createAdjustment.bind(stockAdjustmentController)
);

// Inventory summary and single product stock
router.get(
  '/',
  requireAnyPermission('inventory:view', 'inventory:*'),
  inventoryController.getInventorySummary.bind(inventoryController)
);

router.get(
  '/:productId',
  requireAnyPermission('inventory:view', 'inventory:*'),
  inventoryController.getProductInventory.bind(inventoryController)
);

export const inventoryRoutes = router;
