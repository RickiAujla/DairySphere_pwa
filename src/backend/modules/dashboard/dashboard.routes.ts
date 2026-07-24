import { Router } from 'express';
import { dashboardController } from './dashboard.controller';
import { authenticationGuard, tenantGuard, branchGuard, requireAnyPermission } from '../../common/guards';

const router = Router();

router.use(authenticationGuard);
router.use(tenantGuard);
router.use(branchGuard);

router.get(
  '/summary',
  requireAnyPermission('dashboard:view', 'dashboard:*', 'reports:view', 'reports:*'),
  dashboardController.getSummary.bind(dashboardController)
);

export const dashboardRoutes = router;
