import { Router } from 'express';
import { adjustmentController } from './adjustment.controller';
import { authenticationGuard, tenantGuard, branchGuard, requireAnyPermission } from '../../../common/guards';

const router = Router();

router.use(authenticationGuard);
router.use(tenantGuard);
router.use(branchGuard);

router.post(
  '/',
  requireAnyPermission('financial:adjustment:create', 'financial:adjustment:*', 'financial:*'),
  adjustmentController.recordAdjustment.bind(adjustmentController)
);

router.get(
  '/',
  requireAnyPermission('financial:adjustment:view', 'financial:adjustment:*', 'financial:*'),
  adjustmentController.listAdjustments.bind(adjustmentController)
);

router.get(
  '/:id',
  requireAnyPermission('financial:adjustment:view', 'financial:adjustment:*', 'financial:*'),
  adjustmentController.getAdjustmentById.bind(adjustmentController)
);

export const adjustmentRoutes = router;
