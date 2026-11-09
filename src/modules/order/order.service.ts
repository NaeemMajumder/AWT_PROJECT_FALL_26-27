/**
 * ==================================================================
 *  TEAM A  (Naeem Majumder)
 * ==================================================================
 *  OrderService: business logic and rules for product checkout and pet orders
 *
 *  - checkout(): ONE transaction -> lock products, check stock, create order + items, decrease stock
 *  - createPetOrder(input): HANDSHAKE 3, called by Team B when a request is accepted or an auction is won
 *  - markPaid(): emits 'order.paid' event  /  expire(): emits 'order.expired' event (HANDSHAKE 4)
 *  - isCompletedFor(orderId, userId): used by ReviewService
 * ==================================================================
 */
