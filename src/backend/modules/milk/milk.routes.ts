import { Router } from 'express';
import { rateChartRoutes } from './rate-chart/rate-chart.routes';
import { milkCollectionRoutes } from './collection/milk-collection.routes';
import { milkSaleRoutes } from './sale/milk-sale.routes';

const router = Router();

router.use('/rate-charts', rateChartRoutes);
router.use('/collections', milkCollectionRoutes);
router.use('/sales', milkSaleRoutes);

export const milkRoutes = router;
