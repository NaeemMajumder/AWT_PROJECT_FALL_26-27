/**
 * ==================================================================
 *  TEAM A  (Naeem Majumder)
 * ==================================================================
 *  SellerService: business logic and rules for seller applications and approval
 *
 *  - apply(): create seller_profile with status PENDING
 *  - approve() / reject(): called from AdminService, store reason and reviewed_at
 *  - isApprovedSeller(userId): used by ApprovedSellerGuard (handshake 1)
 * ==================================================================
 */
