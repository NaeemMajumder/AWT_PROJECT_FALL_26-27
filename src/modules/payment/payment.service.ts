import { BadRequestException, ConflictException, ForbiddenException, Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { randomBytes } from "crypto";
import { Payment } from "./entities/payment.entity";
import { PayOrderDto } from "./dto/payment.dto";
import { OrderService } from "../order/order.service";
import { OrderStatus } from "@/common/enums/order.enum";
import { PaymentStatus } from "@/common/enums/payment.enum";

@Injectable()
export class PaymentService {
  constructor(
    @InjectRepository(Payment) private readonly paymentRepository: Repository<Payment>,
    private readonly orderService: OrderService,
  ) {}

  async payOrder(orderId: string, userId: string, dto: PayOrderDto) {
    try {
      const order = await this.orderService.getOrderById(orderId);
      if (order.buyer_id !== userId) {
        throw new ForbiddenException("This is not your order");
      }
      if (order.status === OrderStatus.PAID || order.status === OrderStatus.COMPLETED) {
        throw new ConflictException("This order is already paid");
      }
      if (order.status !== OrderStatus.PENDING) {
        throw new BadRequestException("This order is " + order.status + ", it can not be paid");
      }
      if (order.pay_by && new Date(order.pay_by) < new Date()) {
        throw new ConflictException("Payment time is over for this order");
      }

      const payment = await this.paymentRepository.findOne({ where: { order_id: orderId } });
      if (!payment) {
        throw new NotFoundException("Payment record not found");
      }

      if (dto.method) {
        payment.method = dto.method;
      }
      payment.status = PaymentStatus.PAID;
      payment.paid_at = new Date();
      payment.transaction_ref = "TXN-" + randomBytes(4).toString("hex").toUpperCase();
      await this.paymentRepository.save(payment);

      await this.orderService.markPaid(order);

      return {
        message: "Payment successful",
        payment: payment,
      };
    } catch (error) {
      throw error;
    }
  }

  async getPayment(orderId: string, userId: string, roles: string[]) {
    try {
      await this.orderService.getOrderForUser(orderId, userId, roles);
      const payment = await this.paymentRepository.findOne({ where: { order_id: orderId } });
      if (!payment) {
        throw new NotFoundException("Payment record not found");
      }
      return payment;
    } catch (error) {
      throw error;
    }
  }
}
