/**
 * ==================================================================
 *  TEAM B  (Farzana Islam Upoma)
 * ==================================================================
 *  AuctionPriceDropJob: the no-bid price-drop offer
 *
 *  - Create offer_price = start_price - 5,000 (only if >= 50,000) and notify seller
 *  - Offer not answered in 24h -> pet WITHDRAWN from auction
 * ==================================================================
 */
