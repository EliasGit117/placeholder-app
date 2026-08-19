import { adminOrdersSearch } from './search.ts';
import { adminOrdersGet } from './get.ts';
import { adminOrdersUpdateStatus } from './update-status.ts';

export const ordersAdminRoutes = {
  search: adminOrdersSearch,
  get: adminOrdersGet,
  updateStatus: adminOrdersUpdateStatus,
};
