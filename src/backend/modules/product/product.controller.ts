import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../../common/types/auth.types';
import { productService } from './services/product.service';
import { getRequestContext } from '../../common/context/request-context';
import { DomainValidationError } from '../../common/errors';
import { ProductStatus } from '@prisma/client';

export class ProductController {
  public async createProduct(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const context = getRequestContext();
      const tenantId = req.user?.tenantId || context.tenantId;
      const companyId = req.body.companyId || req.user?.companyId || context.companyId;

      if (!tenantId) {
        throw new DomainValidationError('Tenant context required to create product.');
      }
      if (!companyId) {
        throw new DomainValidationError('Company context required to create product.');
      }

      if (req.body.basePrice === undefined || Number(req.body.basePrice) < 0) {
        throw new DomainValidationError('Valid non-negative base price is required.');
      }

      const product = await productService.createProduct({
        tenantId,
        companyId,
        productCode: req.body.productCode,
        name: req.body.name,
        category: req.body.category || 'GENERAL',
        unitOfMeasure: req.body.unitOfMeasure || 'UNIT',
        basePrice: Number(req.body.basePrice),
        taxRate: req.body.taxRate !== undefined ? Number(req.body.taxRate) : 0,
        userId: req.user?.userId,
      });

      res.status(201).json({
        success: true,
        message: 'Product created successfully',
        data: product,
      });
    } catch (error) {
      next(error);
    }
  }

  public async getProductList(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const context = getRequestContext();
      const tenantId = req.user?.tenantId || context.tenantId;
      const companyId = (req.query.companyId as string) || req.user?.companyId || context.companyId;

      const page = req.query.page ? parseInt(req.query.page as string, 10) : 1;
      const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 20;

      const result = await productService.listProducts(
        { page, limit, sortBy: req.query.sortBy as string, sortOrder: req.query.sortOrder as 'asc' | 'desc' },
        tenantId,
        companyId
      );

      res.status(200).json({
        success: true,
        data: result.data,
        pagination: {
          total: result.total,
          page: result.page,
          limit: result.limit,
          totalPages: result.totalPages,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  public async getProductById(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const context = getRequestContext();
      const tenantId = req.user?.tenantId || context.tenantId;
      const { id } = req.params;

      const product = await productService.getProductById(id, tenantId);

      res.status(200).json({
        success: true,
        data: product,
      });
    } catch (error) {
      next(error);
    }
  }

  public async updateProduct(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const context = getRequestContext();
      const tenantId = req.user?.tenantId || context.tenantId;
      const { id } = req.params;

      const updated = await productService.updateProduct(
        id,
        {
          ...(req.body.name ? { name: req.body.name } : {}),
          ...(req.body.category ? { category: req.body.category } : {}),
          ...(req.body.unitOfMeasure ? { unitOfMeasure: req.body.unitOfMeasure } : {}),
          ...(req.body.basePrice !== undefined ? { basePrice: Number(req.body.basePrice) } : {}),
          ...(req.body.taxRate !== undefined ? { taxRate: Number(req.body.taxRate) } : {}),
          ...(req.body.status ? { status: req.body.status as ProductStatus } : {}),
        },
        tenantId,
        req.user?.userId
      );

      res.status(200).json({
        success: true,
        message: 'Product updated successfully',
        data: updated,
      });
    } catch (error) {
      next(error);
    }
  }

  public async updateProductStatus(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const context = getRequestContext();
      const tenantId = req.user?.tenantId || context.tenantId;
      const { id } = req.params;
      const { status } = req.body;

      if (!status || !Object.values(ProductStatus).includes(status)) {
        throw new DomainValidationError(`Invalid status provided. Must be one of: ${Object.values(ProductStatus).join(', ')}`);
      }

      const updated = await productService.updateProduct(id, { status }, tenantId, req.user?.userId);

      res.status(200).json({
        success: true,
        message: `Product status updated to ${status}`,
        data: updated,
      });
    } catch (error) {
      next(error);
    }
  }

  public async deleteProduct(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const context = getRequestContext();
      const tenantId = req.user?.tenantId || context.tenantId;
      const { id } = req.params;

      const deleted = await productService.deleteProduct(id, tenantId, req.user?.userId);

      res.status(200).json({
        success: true,
        message: 'Product deleted/deactivated successfully',
        data: deleted,
      });
    } catch (error) {
      next(error);
    }
  }
}

export const productController = new ProductController();
