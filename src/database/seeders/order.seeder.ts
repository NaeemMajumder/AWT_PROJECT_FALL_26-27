import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Seeder } from "nestjs-seeder";
import { Order } from "@/modules/order/entities/order.entity";
import { OrderItem } from "@/modules/order/entities/order-item.entity";
import { Payment } from "@/modules/payment/entities/payment.entity";
import { Product } from "@/modules/product/entities/product.entity";
import { User } from "@/modules/user/entities/user.entity";
import { OrderSource, OrderStatus, OrderType } from "@/common/enums/order.enum";
import { PaymentMethod, PaymentStatus } from "@/common/enums/payment.enum";

@Injectable()
export class OrderSeeder implements Seeder {
  constructor(
    @InjectRepository(Order) private readonly orderRepository: Repository<Order>,
    @InjectRepository(OrderItem) private readonly itemRepository: Repository<OrderItem>,
    @InjectRepository(Payment) private readonly paymentRepository: Repository<Payment>,
    @InjectRepository(Product) private readonly productRepository: Repository<Product>,
    @InjectRepository(User) private readonly userRepository: Repository<User>,
  ) {}

  async seed() {
    const count = await this.orderRepository.count();
    if (count > 0) {
      return;
    }

    const rahim = await this.userRepository.findOne({ where: { email: "rahim@gmail.com" } });
    const product = await this.productRepository.findOne({ where: { name: "Royal Canin Puppy Food 2kg" } });
    if (!rahim || !product) {
      return;
    }

    const order = await this.orderRepository.save(
      this.orderRepository.create({
        buyer_id: rahim.id,
        order_type: OrderType.PRODUCT,
        source: OrderSource.CART,
        total_amount: Number(product.price),
        status: OrderStatus.COMPLETED,
      }),
    );

    await this.itemRepository.save(
      this.itemRepository.create({
        order_id: order.id,
        seller_id: product.seller_id,
        product_id: product.id,
        quantity: 1,
        unit_price: Number(product.price),
      }),
    );

    await this.paymentRepository.save(
      this.paymentRepository.create({
        order_id: order.id,
        method: PaymentMethod.CASH_ON_DELIVERY,
        status: PaymentStatus.PAID,
        amount: Number(product.price),
        transaction_ref: "TXN-SEED0001",
        paid_at: new Date(),
      }),
    );
  }

  async drop() {}
}
