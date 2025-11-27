import { Injectable, ExecutionContext } from '@nestjs/common';
import {
  ThrottlerGuard,
  ThrottlerLimitDetail,
  ThrottlerException,
} from '@nestjs/throttler';

/**
 * Custom throttler guard for authentication endpoints.
 * Applies stricter rate limits to prevent brute force attacks.
 *
 * Login/Register endpoints: 5 requests per minute per IP
 * MFA verification: 10 requests per minute per IP
 */
@Injectable()
export class AuthThrottlerGuard extends ThrottlerGuard {
  protected async getTracker(req: Record<string, any>): Promise<string> {
    // Use IP address as tracker for unauthenticated requests
    // Falls back to x-forwarded-for header for proxied requests
    return req.ips?.length ? req.ips[0] : req.ip;
  }

  protected async getErrorMessage(
    context: ExecutionContext,
    throttlerLimitDetail: ThrottlerLimitDetail,
  ): Promise<string> {
    return 'Demasiadas solicitudes. Por favor, espere un momento antes de intentar nuevamente.';
  }

  protected async throwThrottlingException(
    context: ExecutionContext,
    throttlerLimitDetail: ThrottlerLimitDetail,
  ): Promise<void> {
    const message = await this.getErrorMessage(context, throttlerLimitDetail);
    throw new ThrottlerException(message);
  }
}
