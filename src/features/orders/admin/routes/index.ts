import { adminOrdersSearch } from './search.ts';
import { adminOrdersGet } from './get.ts';
import { adminOrdersUpdateStatus } from './update-status.ts';
import { adminOrdersRefund } from './refund.ts';

export const ordersAdminRoutes = {
  search: adminOrdersSearch,
  get: adminOrdersGet,
  updateStatus: adminOrdersUpdateStatus,
  refund: adminOrdersRefund,
};
