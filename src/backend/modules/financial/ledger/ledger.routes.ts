import { Router } from 'express';
import { ledgerController } from './ledger.controller';
import { authenticationGuard, tenantGuard, branchGuard, requireAnyPermission } from '../../../common/guards';

const router = Router();

router.use(authenticationGuard);
router.use(tenantGuard);
router.use(branchGuard);

router.get(
  '/ledger/:accountId',
  requireAnyPermission('financial:ledger:view', 'financial:ledger:*', 'financial:*'),
  ledgerController.getEntriesForAccount.bind(ledgerController)
);

router.get(
  '/accounts/:id',
  requireAnyPermission('financial:ledger:view', 'financial:ledger:*', 'financial:*'),
  ledgerController.getAccountById.bind(ledgerController)
);

export const ledgerRoutes = router;
