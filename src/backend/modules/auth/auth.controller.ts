import { Request, Response, NextFunction } from 'express';
import { authService } from './auth.service';
import { LoginDto, RefreshTokenDto, LogoutDto } from './dto/auth.dto';

export class AuthController {
  public async login(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const dto: LoginDto = req.body;
      const result = await authService.login(dto);
      res.status(200).json(result);
    } catch (err) {
      next(err);
    }
  }

  public async refresh(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const dto: RefreshTokenDto = req.body;
      const result = await authService.refresh(dto);
      res.status(200).json(result);
    } catch (err) {
      next(err);
    }
  }

  public async logout(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const dto: LogoutDto = req.body;
      const result = await authService.logout(dto);
      res.status(200).json(result);
    } catch (err) {
      next(err);
    }
  }
}

export const authController = new AuthController();
