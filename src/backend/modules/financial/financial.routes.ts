import { Router } from 'express';
import { ledgerRoutes } from './ledger/ledger.routes';
import { billRoutes } from './bill/bill.routes';
import { paymentRoutes } from './payment/payment.routes';
import { adjustmentRoutes } from './adjustment/adjustment.routes';

const router = Router();

router.use('/', ledgerRoutes);
router.use('/bills', billRoutes);
router.use('/payments', paymentRoutes);
router.use('/adjustments', adjustmentRoutes);

export const financialRoutes = router;
