/**
 * ==================================================================
 *  TEAM A  (Naeem Majumder)
 * ==================================================================
 *  OrderExpiryJob: expires unpaid pet orders
 *
 *  - Every minute: pet orders with status PENDING and pay_by < now -> EXPIRED
 *  - Emit 'order.expired' so Team B releases the pet / marks auction UNSOLD
 * ==================================================================
 */
