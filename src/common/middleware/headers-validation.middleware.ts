import { Injectable, NestMiddleware, Logger } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class HeadersValidationMiddleware implements NestMiddleware {
  private readonly logger = new Logger(HeadersValidationMiddleware.name);

  use(req: Request, res: Response, next: NextFunction) {
    const contentType = req.headers['content-type'];
    const acceptHeader = req.headers.accept;

    // Verificar se o Content-Type está presente para requisições POST, PUT e PATCH
    if (['POST', 'PUT', 'PATCH'].includes(req.method)) {
      if (!contentType || !contentType.includes('application/json')) {
        this.logger.warn(
          `Invalid Content-Type header: ${contentType} for ${req.method} ${req.url}`,
        );
      }
    }

    // Verificar se o Accept header está presente
    if (!acceptHeader || !acceptHeader.includes('application/json')) {
      this.logger.warn(
        `Missing or invalid Accept header: ${acceptHeader} for ${req.method} ${req.url}`,
      );
    }

    next();
  }
}