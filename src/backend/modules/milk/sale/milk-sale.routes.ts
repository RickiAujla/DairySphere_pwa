import { Router } from 'express';
import { milkSaleController } from './milk-sale.controller';
import { authenticationGuard, tenantGuard, branchGuard, requireAnyPermission } from '../../../common/guards';

const router = Router();

router.use(authenticationGuard);
router.use(tenantGuard);
router.use(branchGuard);

router.post(
  '/',
  requireAnyPermission('milk:sale:create', 'milk:sale:*', 'milk:*'),
  milkSaleController.recordSale.bind(milkSaleController)
);

router.get(
  '/',
  requireAnyPermission('milk:sale:view', 'milk:sale:*', 'milk:*'),
  milkSaleController.listSales.bind(milkSaleController)
);

router.get(
  '/:id',
  requireAnyPermission('milk:sale:view', 'milk:sale:*', 'milk:*'),
  milkSaleController.getSaleById.bind(milkSaleController)
);

export const milkSaleRoutes = router;
