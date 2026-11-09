/**
 * ==================================================================
 *  TEAM B  (Farzana Islam Upoma)
 * ==================================================================
 *  BidService: placing and editing bids (the core bidding rules)
 *
 *  - ONE transaction with row lock on the auction row (SELECT ... FOR UPDATE)
 *  - Auction must be LIVE; amount >= start_price (first bid) or >= highest_bid + 5,000
 *  - Too low -> 409 with the minimum allowed amount; 4th edit -> 409; seller bidding -> 403
 *  - Bid in last 5 min -> end_time + 5 min (max 6 extensions)
 *  - Save old amount in bid_revisions; notify previous highest bidder (outbid)
 * ==================================================================
 */
