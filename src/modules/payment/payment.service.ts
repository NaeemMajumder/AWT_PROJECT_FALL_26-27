/**
 * ==================================================================
 *  TEAM A  (Naeem Majumder)
 * ==================================================================
 *  PaymentService: business logic and rules for simulated payments
 *
 *  - Only the buyer can pay; pet orders only before pay_by deadline
 *  - On success: payment PAID + OrderService.markPaid() (emits order.paid)
 *  - No real gateway; never store card numbers
 * ==================================================================
 */
