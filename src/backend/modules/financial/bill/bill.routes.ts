import { Router } from 'express';
import { billController } from './bill.controller';
import { authenticationGuard, tenantGuard, branchGuard, requireAnyPermission } from '../../../common/guards';

const router = Router();

router.use(authenticationGuard);
router.use(tenantGuard);
router.use(branchGuard);

router.post(
  '/generate',
  requireAnyPermission('financial:bill:create', 'financial:bill:*', 'financial:*'),
  billController.generateBill.bind(billController)
);

router.get(
  '/',
  requireAnyPermission('financial:bill:view', 'financial:bill:*', 'financial:*'),
  billController.listBills.bind(billController)
);

router.get(
  '/:id',
  requireAnyPermission('financial:bill:view', 'financial:bill:*', 'financial:*'),
  billController.getBillById.bind(billController)
);

router.post(
  '/:id/finalize',
  requireAnyPermission('financial:bill:finalize', 'financial:bill:*', 'financial:*'),
  billController.finalizeBill.bind(billController)
);

router.post(
  '/:id/revise',
  requireAnyPermission('financial:bill:create', 'financial:bill:*', 'financial:*'),
  billController.reviseBill.bind(billController)
);

export const billRoutes = router;
