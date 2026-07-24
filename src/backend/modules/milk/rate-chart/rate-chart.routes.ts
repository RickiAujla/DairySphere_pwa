import { Router } from 'express';
import { rateChartController } from './rate-chart.controller';
import { authenticationGuard, tenantGuard, branchGuard, requireAnyPermission } from '../../../common/guards';

const router = Router();

router.use(authenticationGuard);
router.use(tenantGuard);
router.use(branchGuard);

router.post(
  '/',
  requireAnyPermission('milk:rate:create', 'milk:rate:*', 'milk:*'),
  rateChartController.createRateChart.bind(rateChartController)
);

router.get(
  '/',
  requireAnyPermission('milk:rate:view', 'milk:rate:*', 'milk:*'),
  rateChartController.listRateCharts.bind(rateChartController)
);

router.get(
  '/:id',
  requireAnyPermission('milk:rate:view', 'milk:rate:*', 'milk:*'),
  rateChartController.getRateChartById.bind(rateChartController)
);

router.patch(
  '/:id',
  requireAnyPermission('milk:rate:update', 'milk:rate:*', 'milk:*'),
  rateChartController.updateRateChart.bind(rateChartController)
);

router.patch(
  '/:id/status',
  requireAnyPermission('milk:rate:update', 'milk:rate:*', 'milk:*'),
  rateChartController.updateRateChartStatus.bind(rateChartController)
);

export const rateChartRoutes = router;
