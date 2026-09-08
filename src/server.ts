import { paraglideMiddleware } from './paraglide/server.js'
import handler from '@tanstack/react-start/server-entry'
import { OnlinePaymentService } from '@/features/orders/common/services/online-payment-service.ts'

OnlinePaymentService.startReverifyJob()

export default {
  fetch(req: Request): Promise<Response> {
    return paraglideMiddleware(req, () => handler.fetch(req))
  },
}