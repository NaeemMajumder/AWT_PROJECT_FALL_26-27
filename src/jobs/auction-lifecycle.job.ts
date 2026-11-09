/**
 * ==================================================================
 *  TEAM B  (Farzana Islam Upoma)
 * ==================================================================
 *  AuctionLifecycleJob: starts and closes auctions
 *
 *  - SCHEDULED -> LIVE when start_time reached
 *  - LIVE -> ENDED when end_time reached: winner = highest bidder, call OrderService.createPetOrder()
 *  - No bids -> AWAITING_SELLER (handled by AuctionPriceDropJob)
 * ==================================================================
 */
