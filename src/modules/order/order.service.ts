import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { DataSource, EntityManager, LessThan, Repository } from "typeorm";
import { EventEmitter2 } from "@nestjs/event-emitter";
import { Order } from "./entities/order.entity";
import { OrderItem } from "./entities/order-item.entity";
import { CheckoutDto, OrderQueryDto, UpdateOrderStatusDto } from "./dto/order.dto";
import { Cart } from "../cart/entities/cart.entity";
import { CartItem } from "../cart/entities/cart-item.entity";
import { Product } from "../product/entities/product.entity";
import { Payment } from "../payment/entities/payment.entity";
import { OrderSource, OrderStatus, OrderType } from "@/common/enums/order.enum";
import { PaymentMethod, PaymentStatus } from "@/common/enums/payment.enum";
import { CreatePetOrderInput } from "@/common/interfaces/create-pet-order.interface";
import { OrderEventPayload } from "@/common/interfaces/order-event.interface";
import { ORDER_EXPIRED, ORDER_PAID } from "@/common/constants/events.constants";
import { PET_ORDER_PAY_WINDOW_HOURS } from "@/common/constants/order.constants";
import { NotificationService } from "../notification/notification.service";
import { NotificationType } from "@/common/enums/notification-type.enum";

@Injectable()
export class OrderService {
  constructor(
    @InjectRepository(Order) private readonly orderRepository: Repository<Order>,
    @InjectRepository(OrderItem) private readonly orderItemRepository: Repository<OrderItem>,
    private readonly dataSource: DataSource,
    private readonly eventEmitter: EventEmitter2,
    private readonly notificationService: NotificationService,
  ) {}

  async checkout(userId: string, dto: CheckoutDto) {
    try {
      const orderId = await this.dataSource.transaction(async (manager) => {
        const cart = await manager.findOne(Cart, { where: { user_id: userId, status: "active" } });
        if (!cart) {
          throw new BadRequestException("Your cart is empty");
        }

        const cartItems = await manager.find(CartItem, { where: { cart_id: cart.id } });
        if (cartItems.length === 0) {
          throw new BadRequestException("Your cart is empty");
        }

        let total = 0;
        const orderItems: OrderItem[] = [];

        for (const cartItem of cartItems) {
          const product = await manager.findOne(Product, {
            where: { id: cartItem.product_id },
            lock: { mode: "pessimistic_write" },
          });
          if (!product || !product.is_active) {
            throw new BadRequestException("A product in your cart is not available now");
          }
          if (product.stock < cartItem.quantity) {
            throw new BadRequestException(product.name + " has only " + product.stock + " left");
          }

          product.stock = product.stock - cartItem.quantity;
          await manager.save(product);

          total = total + Number(product.price) * cartItem.quantity;
          orderItems.push(
            manager.create(OrderItem, {
              seller_id: product.seller_id,
              product_id: product.id,
              quantity: cartItem.quantity,
              unit_price: product.price,
            }),
          );
        }

        const order = await manager.save(
          manager.create(Order, {
            buyer_id: userId,
            order_type: OrderType.PRODUCT,
            source: OrderSource.CART,
            total_amount: total,
            status: OrderStatus.PENDING,
          }),
        );

        for (const item of orderItems) {
          item.order_id = order.id;
        }
        await manager.save(orderItems);

        await manager.save(
          manager.create(Payment, {
            order_id: order.id,
            method: dto.payment_method || PaymentMethod.ONLINE_SIMULATED,
            status: PaymentStatus.PENDING,
            amount: total,
          }),
        );

        cart.status = "checked_out";
        await manager.save(cart);

        return order.id;
      });

      return await this.getOrderById(orderId);
    } catch (error) {
      throw error;
    }
  }

  async createPetOrder(input: CreatePetOrderInput, manager?: EntityManager) {
    const em = manager || this.dataSource.manager;

    const payBy = new Date(Date.now() + PET_ORDER_PAY_WINDOW_HOURS * 60 * 60 * 1000);

    const order = await em.save(
      em.create(Order, {
        buyer_id: input.buyerId,
        order_type: OrderType.PET,
        source: input.source,
        source_id: input.sourceId,
        total_amount: input.amount,
        status: OrderStatus.PENDING,
        pay_by: payBy,
      }),
    );

    await em.save(
      em.create(OrderItem, {
        order_id: order.id,
        seller_id: input.sellerId,
        pet_id: input.petId,
        quantity: 1,
        unit_price: input.amount,
      }),
    );

    await em.save(
      em.create(Payment, {
        order_id: order.id,
        method: PaymentMethod.ONLINE_SIMULATED,
        status: PaymentStatus.PENDING,
        amount: input.amount,
      }),
    );

    return order;
  }

  async getOrderById(id: string) {
    const order = await this.orderRepository.findOne({
      where: { id: id },
      relations: ["items", "items.product"],
    });
    if (!order) {
      throw new NotFoundException("Order not found");
    }
    return order;
  }

  async getMyOrders(userId: string, query: OrderQueryDto) {
    try {
      const where: any = { buyer_id: userId };
      if (query.type) where.order_type = query.type;
      if (query.status) where.status = query.status;

      return await this.orderRepository.find({
        where: where,
        relations: ["items", "items.product"],
        order: { created_at: "DESC" },
      });
    } catch (error) {
      throw error;
    }
  }

  async getMySales(sellerId: string) {
    try {
      return await this.orderItemRepository.find({
        where: { seller_id: sellerId },
        relations: ["order", "product"],
        order: { order: { created_at: "DESC" } },
      });
    } catch (error) {
      throw error;
    }
  }

  async getOrderForUser(id: string, userId: string, roles: string[]) {
    try {
      const order = await this.getOrderById(id);
      const isSeller = order.items.some((item) => item.seller_id === userId);
      if (order.buyer_id !== userId && !isSeller && !roles.includes("admin")) {
        throw new ForbiddenException("You can not see this order");
      }
      return order;
    } catch (error) {
      throw error;
    }
  }

  async cancelMyOrder(id: string, userId: string) {
    try {
      await this.dataSource.transaction(async (manager) => {
        const order = await manager.findOne(Order, {
          where: { id: id },
          lock: { mode: "pessimistic_write" },
        });
        if (!order) {
          throw new NotFoundException("Order not found");
        }
        if (order.buyer_id !== userId) {
          throw new ForbiddenException("This is not your order");
        }
        if (order.order_type !== OrderType.PRODUCT || order.status !== OrderStatus.PENDING) {
          throw new BadRequestException("Only unpaid product orders can be cancelled");
        }

        const items = await manager.find(OrderItem, { where: { order_id: order.id } });
        for (const item of items) {
          if (item.product_id) {
            await manager.increment(Product, { id: item.product_id }, "stock", item.quantity);
          }
        }

        order.status = OrderStatus.CANCELLED;
        await manager.save(order);
        await manager.update(Payment, { order_id: order.id }, { status: PaymentStatus.FAILED });
      });

      return await this.getOrderById(id);
    } catch (error) {
      throw error;
    }
  }

  async markPaid(order: Order) {
    order.status = OrderStatus.PAID;
    await this.orderRepository.save(order);

    if (order.order_type === OrderType.PET) {
      const item = await this.orderItemRepository.findOne({ where: { order_id: order.id } });
      const payload: OrderEventPayload = {
        orderId: order.id,
        petId: item!.pet_id as string,
        source: order.source,
        sourceId: order.source_id as string,
      };
      this.eventEmitter.emit(ORDER_PAID, payload);
    }
  }

  async expireUnpaidPetOrders() {
    const orders = await this.orderRepository.find({
      where: {
        order_type: OrderType.PET,
        status: OrderStatus.PENDING,
        pay_by: LessThan(new Date()),
      },
      relations: ["items"],
    });

    for (const order of orders) {
      order.status = OrderStatus.EXPIRED;
      await this.orderRepository.save(order);
      await this.dataSource.getRepository(Payment).update({ order_id: order.id }, { status: PaymentStatus.FAILED });

      const payload: OrderEventPayload = {
        orderId: order.id,
        petId: order.items[0].pet_id as string,
        source: order.source,
        sourceId: order.source_id as string,
      };
      this.eventEmitter.emit(ORDER_EXPIRED, payload);

      await this.notificationService.notify(
        order.buyer_id,
        NotificationType.ORDER_EXPIRED,
        "Your pet order was not paid in time, so it has expired",
      );
    }

    return orders.length;
  }

  async getCompletedOrderForReview(orderId: string, userId: string) {
    const order = await this.getOrderById(orderId);
    if (order.buyer_id !== userId) {
      throw new ForbiddenException("This is not your order");
    }
    if (order.status !== OrderStatus.PAID && order.status !== OrderStatus.COMPLETED) {
      throw new BadRequestException("You can review only after the order is paid");
    }
    return order;
  }

  async getAllOrders(query: OrderQueryDto) {
    try {
      const where: any = {};
      if (query.type) where.order_type = query.type;
      if (query.status) where.status = query.status;
      return await this.orderRepository.find({
        where: where,
        relations: ["items"],
        order: { created_at: "DESC" },
      });
    } catch (error) {
      throw error;
    }
  }

  async updateStatusByAdmin(id: string, dto: UpdateOrderStatusDto) {
    try {
      const order = await this.getOrderById(id);
      if (dto.status === OrderStatus.COMPLETED && order.status !== OrderStatus.PAID) {
        throw new BadRequestException("Only paid orders can be completed");
      }
      if (dto.status === OrderStatus.CANCELLED && order.status !== OrderStatus.PENDING) {
        throw new BadRequestException("Only pending orders can be cancelled");
      }
      if (dto.status === OrderStatus.CANCELLED && order.order_type === OrderType.PRODUCT) {
        for (const item of order.items) {
          if (item.product_id) {
            await this.dataSource.getRepository(Product).increment({ id: item.product_id }, "stock", item.quantity);
          }
        }
      }
      order.status = dto.status;
      return await this.orderRepository.save(order);
    } catch (error) {
      throw error;
    }
  }

  async countByStatus(status: OrderStatus) {
    return await this.orderRepository.count({ where: { status: status } });
  }
}
