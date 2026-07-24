import { Router } from 'express';
import { customerController } from './customer.controller';
import { authenticationGuard, tenantGuard, branchGuard, requireAnyPermission } from '../../common/guards';

const router = Router();

router.use(authenticationGuard);
router.use(tenantGuard);
router.use(branchGuard);

router.post(
  '/',
  requireAnyPermission('customer:create', 'customer:master:create', 'customer:*'),
  customerController.createCustomer.bind(customerController)
);

router.get(
  '/',
  requireAnyPermission('customer:view', 'customer:master:view', 'customer:*'),
  customerController.getCustomerList.bind(customerController)
);

router.get(
  '/:id',
  requireAnyPermission('customer:view', 'customer:master:view', 'customer:*'),
  customerController.getCustomerById.bind(customerController)
);

router.patch(
  '/:id',
  requireAnyPermission('customer:update', 'customer:master:update', 'customer:*'),
  customerController.updateCustomer.bind(customerController)
);

router.patch(
  '/:id/status',
  requireAnyPermission('customer:update', 'customer:master:update', 'customer:*'),
  customerController.updateCustomerStatus.bind(customerController)
);

export const customerRoutes = router;
