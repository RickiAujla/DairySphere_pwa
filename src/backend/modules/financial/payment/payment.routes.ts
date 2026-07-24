import { Router } from 'express';
import { paymentController } from './payment.controller';
import { authenticationGuard, tenantGuard, branchGuard, requireAnyPermission } from '../../../common/guards';

const router = Router();

router.use(authenticationGuard);
router.use(tenantGuard);
router.use(branchGuard);

router.post(
  '/',
  requireAnyPermission('financial:payment:create', 'financial:payment:*', 'financial:*'),
  paymentController.recordPayment.bind(paymentController)
);

router.get(
  '/',
  requireAnyPermission('financial:payment:view', 'financial:payment:*', 'financial:*'),
  paymentController.listPayments.bind(paymentController)
);

router.get(
  '/:id',
  requireAnyPermission('financial:payment:view', 'financial:payment:*', 'financial:*'),
  paymentController.getPaymentById.bind(paymentController)
);

export const paymentRoutes = router;
