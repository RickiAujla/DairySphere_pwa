import { Router } from 'express';
import { productPurchaseController } from './controllers/product-purchase.controller';
import { authenticationGuard, tenantGuard, branchGuard, requireAnyPermission } from '../../common/guards';

const router = Router();

router.use(authenticationGuard);
router.use(tenantGuard);
router.use(branchGuard);

router.post(
  '/',
  requireAnyPermission('purchase:create', 'purchase:*'),
  productPurchaseController.createPurchase.bind(productPurchaseController)
);

router.get(
  '/',
  requireAnyPermission('purchase:view', 'purchase:*'),
  productPurchaseController.getPurchaseList.bind(productPurchaseController)
);

router.get(
  '/:id',
  requireAnyPermission('purchase:view', 'purchase:*'),
  productPurchaseController.getPurchaseById.bind(productPurchaseController)
);

export const productPurchaseRoutes = router;
