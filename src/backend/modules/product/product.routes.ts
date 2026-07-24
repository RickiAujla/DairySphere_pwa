import { Router } from 'express';
import { productController } from './product.controller';
import { authenticationGuard, tenantGuard, branchGuard, requireAnyPermission } from '../../common/guards';

const router = Router();

router.use(authenticationGuard);
router.use(tenantGuard);
router.use(branchGuard);

router.post(
  '/',
  requireAnyPermission('product:create', 'product:master:create', 'product:*'),
  productController.createProduct.bind(productController)
);

router.get(
  '/',
  requireAnyPermission('product:view', 'product:master:view', 'product:*'),
  productController.getProductList.bind(productController)
);

router.get(
  '/:id',
  requireAnyPermission('product:view', 'product:master:view', 'product:*'),
  productController.getProductById.bind(productController)
);

router.put(
  '/:id',
  requireAnyPermission('product:update', 'product:master:update', 'product:*'),
  productController.updateProduct.bind(productController)
);

router.patch(
  '/:id',
  requireAnyPermission('product:update', 'product:master:update', 'product:*'),
  productController.updateProduct.bind(productController)
);

router.patch(
  '/:id/status',
  requireAnyPermission('product:update', 'product:master:update', 'product:*'),
  productController.updateProductStatus.bind(productController)
);

router.delete(
  '/:id',
  requireAnyPermission('product:delete', 'product:update', 'product:master:update', 'product:*'),
  productController.deleteProduct.bind(productController)
);

export const productRoutes = router;
