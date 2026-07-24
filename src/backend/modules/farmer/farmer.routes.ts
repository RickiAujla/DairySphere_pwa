import { Router } from 'express';
import { farmerController } from './farmer.controller';
import { authenticationGuard, tenantGuard, branchGuard, requireAnyPermission } from '../../common/guards';

const router = Router();

router.use(authenticationGuard);
router.use(tenantGuard);
router.use(branchGuard);

router.post(
  '/',
  requireAnyPermission('farmer:create', 'farmer:master:create', 'farmer:*'),
  farmerController.createFarmer.bind(farmerController)
);

router.get(
  '/',
  requireAnyPermission('farmer:view', 'farmer:master:view', 'farmer:*'),
  farmerController.getFarmerList.bind(farmerController)
);

router.get(
  '/:id',
  requireAnyPermission('farmer:view', 'farmer:master:view', 'farmer:*'),
  farmerController.getFarmerById.bind(farmerController)
);

router.patch(
  '/:id',
  requireAnyPermission('farmer:update', 'farmer:master:update', 'farmer:*'),
  farmerController.updateFarmer.bind(farmerController)
);

router.patch(
  '/:id/status',
  requireAnyPermission('farmer:update', 'farmer:master:update', 'farmer:*'),
  farmerController.updateFarmerStatus.bind(farmerController)
);

export const farmerRoutes = router;
