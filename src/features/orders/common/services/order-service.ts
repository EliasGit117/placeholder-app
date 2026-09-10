import { ORPCError } from '@orpc/server';
import { type Order, type OrderProduct, type Prisma } from '~/prisma/generated/prisma/client.ts';
import { DeliveryMethod, ImageResourceType, OrderStatus } from '~/prisma/generated/prisma/enums.ts';
import { prisma } from '@/lib/db';
import { getLocale } from '@/paraglide/runtime';
import { PaginationResultDtoFactory } from '@/features/shared/dtos/pagination-result-dto.ts';
import { OrderDtoFactory, type TOrderDto } from '@/features/orders/common/dtos/order.ts';
import type { TSearchOrdersRequestDto } from '@/features/orders/admin/dtos/search-orders.ts';
import { ImageService } from '@/features/images/common/services/image-service.ts';
import { BriefImageDtoFactory, type TBriefImageDto } from '@/features/products/common/dtos/brief-image.ts';
import { OnlinePaymentService } from '@/features/orders/common/services/online-payment-service.ts';
import { OnlinePaymentDtoFactory, type TOnlinePaymentDto } from '@/features/orders/common/dtos/online-payment.ts';
import { PaymentType, smallDeliveryOrderSurcharge, smallDeliveryOrderThreshold, type TPaymentType } from '@/features/orders/common/constants.ts';

export interface ICreateOrderItem {
  variantId: number;
  count: number;
}

export interface ICreateOrderInput {
  items: ICreateOrderItem[];
  paymentType: TPaymentType;
  fullName: string;
  phone: string;
  email: string;
  deliveryMethod: DeliveryMethod;
  address: string;
}

export class OrderService {

  // Batch-fetch the lead (display order) image per variant, converted to the
  // list/grid-friendly brief image shape. Images live via the polymorphic image
  // resource map, so order line items never store their own image reference.
  private static async firstImageByVariant(variantIds: number[]): Promise<Map<number, TBriefImageDto>> {
    if (variantIds.length === 0)
      return new Map();

    const images = await ImageService.findByResources(
      ImageResourceType.PRODUCT_VARIANT,
      variantIds.map(String)
    );

    const map = new Map<number, TBriefImageDto>();
    for (const img of images) {
      const variantId = Number(img.resourceId);
      if (map.has(variantId))
        continue;
      map.set(variantId, BriefImageDtoFactory.fromImageDto(img));
    }

    return map;
  }

  // Category isn't snapshotted on the order line item (unlike name/price/discount), so
  // it's looked up live via the variant's current product/category relation.
  private static async categoryByVariant(variantIds: number[]): Promise<Map<number, string>> {
    if (variantIds.length === 0)
      return new Map();

    const ru = getLocale() === 'ru';
    const variants = await prisma.productVariant.findMany({
      where: { id: { in: variantIds } },
      select: { id: true, product: { select: { category: { select: { nameRo: true, nameRu: true } } } } },
    });

    const map = new Map<number, string>();
    for (const v of variants) {
      const name = ru ? v.product.category?.nameRu : v.product.category?.nameRo;
      if (name != null)
        map.set(v.id, name);
    }

    return map;
  }

  // Variant may have been renamed/removed since the order was placed, so this
  // is a best-effort link — falls back to no link (null) rather than a slug
  // that no longer resolves.
  private static async slugByVariant(variantIds: number[]): Promise<Map<number, string>> {
    if (variantIds.length === 0)
      return new Map();

    const variants = await prisma.productVariant.findMany({
      where: { id: { in: variantIds } },
      select: { id: true, fullSlug: true },
    });

    return new Map(variants.map((v) => [v.id, v.fullSlug]));
  }

  private static async withImages(
    entity: Order & { items: OrderProduct[] },
    onlinePayment: TOnlinePaymentDto | null = null
  ): Promise<TOrderDto> {
    const variantIds = entity.items.map((i) => i.variantId);
    const [imagesByVariant, categoryByVariant, slugByVariant] = await Promise.all([
      OrderService.firstImageByVariant(variantIds),
      OrderService.categoryByVariant(variantIds),
      OrderService.slugByVariant(variantIds),
    ]);
    return OrderDtoFactory.fromEntity(entity, imagesByVariant, categoryByVariant, onlinePayment, slugByVariant);
  }

  static async findById(id: number): Promise<TOrderDto | null> {
    const entity = await prisma.order.findUnique({ where: { id }, include: { items: true } });
    if (!entity)
      return null;

    const onlinePayment = await OnlinePaymentService.findByOrderId(entity.id);
    return OrderService.withImages(entity, onlinePayment);
  }

  // Guest order confirmation page — synced live with maib since the payer can land
  // here before the callback webhook arrives (or if it never arrives).
  static async findByUid(uid: string): Promise<TOrderDto | null> {
    const entity = await prisma.order.findUnique({ where: { uid }, include: { items: true } });
    if (!entity)
      return null;

    const onlinePayment = await OnlinePaymentService.findByOrderIdFresh(entity.id);
    return OrderService.withImages(entity, onlinePayment);
  }

  static async search(input: TSearchOrdersRequestDto) {
    const where: Prisma.OrderWhereInput = {};

    if (input.status != null)
      where.status = { in: input.status };

    if (input.createdAt?.from != null || input.createdAt?.to != null) {
      where.createdAt = {};
      if (input.createdAt.from != null) where.createdAt.gte = input.createdAt.from;
      if (input.createdAt.to != null) where.createdAt.lte = input.createdAt.to;
    }

    if (input.updatedAt?.from != null || input.updatedAt?.to != null) {
      where.updatedAt = {};
      if (input.updatedAt.from != null) where.updatedAt.gte = input.updatedAt.from;
      if (input.updatedAt.to != null) where.updatedAt.lte = input.updatedAt.to;
    }

    const [items, meta] = await prisma.order
      .paginate({
        where,
        orderBy: { [input.sort ?? 'createdAt']: input.dir ?? 'desc' },
        include: { items: true },
      })
      .withPages({
        page: input.page ?? 1,
        limit: input.limit ?? 10,
        includePageCount: true,
      });

    const variantIds = items.flatMap((o) => o.items.map((i) => i.variantId));
    const [imagesByVariant, categoryByVariant, onlinePayments] = await Promise.all([
      OrderService.firstImageByVariant(variantIds),
      OrderService.categoryByVariant(variantIds),
      prisma.onlinePayment.findMany({ where: { orderId: { in: items.map((o) => o.id) } } }),
    ]);
    const onlinePaymentByOrderId = new Map(onlinePayments.map((p) => [p.orderId, OnlinePaymentDtoFactory.fromEntity(p)]));

    return PaginationResultDtoFactory.getWithCount(
      items.map((e) => OrderDtoFactory.fromEntity(e, imagesByVariant, categoryByVariant, onlinePaymentByOrderId.get(e.id) ?? null)),
      meta
    );
  }

  static async updateStatus(id: number, status: OrderStatus): Promise<TOrderDto> {
    const existing = await prisma.order.findUnique({ where: { id } });
    if (!existing)
      throw new ORPCError('NOT_FOUND');

    const entity = await prisma.order.update({
      where: { id },
      data: { status },
      include: { items: true },
    });

    const onlinePayment = await OnlinePaymentService.findByOrderId(entity.id);
    return OrderService.withImages(entity, onlinePayment);
  }

  // Snapshots each variant's current name/price/discount onto the order line item, so the
  // order stays accurate even if the product/variant is later changed or deleted.
  static async create(input: ICreateOrderInput): Promise<TOrderDto> {
    const rawItems = input.items;
    if (rawItems.length === 0)
      throw new ORPCError('BAD_REQUEST', { message: 'Order must contain at least one item' });

    const variantIds = rawItems.map((i) => i.variantId);
    const variants = await prisma.productVariant.findMany({
      where: { id: { in: variantIds } },
      include: { product: true },
    });

    const variantById = new Map(variants.map((v) => [v.id, v]));
    for (const item of rawItems) {
      if (!variantById.has(item.variantId))
        throw new ORPCError('NOT_FOUND', { message: `Variant '${item.variantId}' not found` });
    }

    const subtotal = rawItems.reduce((sum, item) => {
      const variant = variantById.get(item.variantId)!;
      const unitPrice = effectivePrice(variant.price, variant.discountPercent);
      return sum + unitPrice * item.count;
    }, 0);
    
    const isSmallDeliveryOrder = input.deliveryMethod === DeliveryMethod.COURIER && subtotal < smallDeliveryOrderThreshold;
    const totalPrice = isSmallDeliveryOrder ? subtotal + smallDeliveryOrderSurcharge : subtotal;

    const entity = await prisma.order.create({
      data: {
        status: OrderStatus.PENDING,
        totalPrice,
        fullName: input.fullName,
        phone: input.phone,
        email: input.email,
        deliveryMethod: input.deliveryMethod,
        address: input.address,
        items: {
          create: rawItems.map((item) => {
            const variant = variantById.get(item.variantId)!;
            return {
              variantId: variant.id,
              count: item.count,
              productNameRo: variant.product.nameRo,
              productNameRu: variant.product.nameRu,
              variantNameRo: variant.nameRo,
              variantNameRu: variant.nameRu,
              price: variant.price,
              discountPercent: variant.discountPercent,
            };
          }),
        },
      },
      include: { items: true },
    });

    const onlinePayment = input.paymentType === PaymentType.MAIB
      ? await OnlinePaymentService.createForOrder(entity.id)
      : null;

    return OrderService.withImages(entity, onlinePayment);
  }
}

function effectivePrice(price: number, discountPercent: number | null): number {
  if (!discountPercent)
    return price;

  return Math.round(price * (1 - discountPercent / 100));
}
