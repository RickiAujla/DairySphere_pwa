import { Router } from 'express';
import { milkCollectionController } from './milk-collection.controller';
import { authenticationGuard, tenantGuard, branchGuard, requireAnyPermission } from '../../../common/guards';

const router = Router();

router.use(authenticationGuard);
router.use(tenantGuard);
router.use(branchGuard);

router.post(
  '/',
  requireAnyPermission('milk:collection:create', 'milk:collection:*', 'milk:*'),
  milkCollectionController.recordCollection.bind(milkCollectionController)
);

router.get(
  '/',
  requireAnyPermission('milk:collection:view', 'milk:collection:*', 'milk:*'),
  milkCollectionController.listCollections.bind(milkCollectionController)
);

router.get(
  '/:id',
  requireAnyPermission('milk:collection:view', 'milk:collection:*', 'milk:*'),
  milkCollectionController.getCollectionById.bind(milkCollectionController)
);

export const milkCollectionRoutes = router;
