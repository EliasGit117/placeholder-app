import { z } from 'zod';
import type { Order, OrderProduct } from '~/prisma/generated/prisma/client.ts';
import { DeliveryMethod, OrderStatus } from '~/prisma/generated/prisma/enums.ts';
import { briefImageDtoSchema, type TBriefImageDto } from '@/features/products/common/dtos/brief-image.ts';

export const orderProductDtoSchema = z.object({
  id: z.number(),
  orderId: z.number(),
  variantId: z.number(),
  count: z.number().int(),
  productNameRo: z.string(),
  productNameRu: z.string(),
  variantNameRo: z.string(),
  variantNameRu: z.string(),
  price: z.number().int(),
  discountPercent: z.number().int().nullable(),
  category: z.string().nullable(),
  image: briefImageDtoSchema.nullable(),
  createdAt: z.string(),
});

export type TOrderProductDto = z.infer<typeof orderProductDtoSchema>;

export const orderDtoSchema = z.object({
  id: z.number(),
  uid: z.string(),
  status: z.enum(OrderStatus),
  totalPrice: z.number().int(),
  fullName: z.string(),
  phone: z.string(),
  email: z.string(),
  deliveryMethod: z.enum(DeliveryMethod),
  address: z.string(),
  items: z.array(orderProductDtoSchema),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export type TOrderDto = z.infer<typeof orderDtoSchema>;

export class OrderProductDtoFactory {

  static fromEntity(
    entity: OrderProduct,
    image: TBriefImageDto | null = null,
    category: string | null = null
  ): TOrderProductDto {
    return {
      id: entity.id,
      orderId: entity.orderId,
      variantId: entity.variantId,
      count: entity.count,
      productNameRo: entity.productNameRo,
      productNameRu: entity.productNameRu,
      variantNameRo: entity.variantNameRo,
      variantNameRu: entity.variantNameRu,
      price: entity.price,
      discountPercent: entity.discountPercent,
      category,
      image,
      createdAt: entity.createdAt.toISOString(),
    };
  }
}

export class OrderDtoFactory {

  static fromEntity(
    entity: Order & { items: OrderProduct[] },
    imagesByVariant?: Map<number, TBriefImageDto>,
    categoryByVariant?: Map<number, string>
  ): TOrderDto {
    return {
      id: entity.id,
      uid: entity.uid,
      status: entity.status,
      totalPrice: entity.totalPrice,
      fullName: entity.fullName,
      phone: entity.phone,
      email: entity.email,
      deliveryMethod: entity.deliveryMethod,
      address: entity.address,
      items: entity.items.map((i) =>
        OrderProductDtoFactory.fromEntity(
          i,
          imagesByVariant?.get(i.variantId) ?? null,
          categoryByVariant?.get(i.variantId) ?? null
        )
      ),
      createdAt: entity.createdAt.toISOString(),
      updatedAt: entity.updatedAt.toISOString(),
    };
  }
}
