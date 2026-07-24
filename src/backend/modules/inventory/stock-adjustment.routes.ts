import { Router } from 'express';
import { stockAdjustmentController } from './controllers/stock-adjustment.controller';
import { authenticationGuard, tenantGuard, branchGuard, requireAnyPermission } from '../../common/guards';

const router = Router();

router.use(authenticationGuard);
router.use(tenantGuard);
router.use(branchGuard);

router.post(
  '/',
  requireAnyPermission('inventory:adjust', 'inventory:*'),
  stockAdjustmentController.createAdjustment.bind(stockAdjustmentController)
);

router.get(
  '/',
  requireAnyPermission('inventory:view', 'inventory:*'),
  stockAdjustmentController.getAdjustmentList.bind(stockAdjustmentController)
);

router.get(
  '/:id',
  requireAnyPermission('inventory:view', 'inventory:*'),
  stockAdjustmentController.getAdjustmentById.bind(stockAdjustmentController)
);

export const stockAdjustmentRoutes = router;
