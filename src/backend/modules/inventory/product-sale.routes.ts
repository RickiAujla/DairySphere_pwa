import { Router } from 'express';
import { productSaleController } from './controllers/product-sale.controller';
import { authenticationGuard, tenantGuard, branchGuard, requireAnyPermission } from '../../common/guards';

const router = Router();

router.use(authenticationGuard);
router.use(tenantGuard);
router.use(branchGuard);

router.post(
  '/',
  requireAnyPermission('sale:create', 'sale:*'),
  productSaleController.createSale.bind(productSaleController)
);

router.get(
  '/',
  requireAnyPermission('sale:view', 'sale:*'),
  productSaleController.getSaleList.bind(productSaleController)
);

router.get(
  '/:id',
  requireAnyPermission('sale:view', 'sale:*'),
  productSaleController.getSaleById.bind(productSaleController)
);

export const productSaleRoutes = router;
