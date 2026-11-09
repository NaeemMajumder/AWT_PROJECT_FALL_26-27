/**
 * ==================================================================
 *  TEAM B  (Farzana Islam Upoma)
 * ==================================================================
 *  AuctionController: HTTP endpoints for auctions and bidding for high-value pets  (route: /auctions)
 *
 *  - POST   /auctions                  seller requests auction (start_price >= 50,000, duration <= 2 days)
 *  - PATCH  /auctions/:id/review       admin approves (sets start_time) or rejects
 *  - GET    /auctions | /auctions/:id  public view: highest bid, min next bid, bidder count, time left
 *  - POST   /auctions/:id/bids         place first bid
 *  - PATCH  /auctions/:id/bids/me      raise own bid (max 3 edits)
 *  - GET    /auctions/my-bids          my bid, edits left, am I highest
 *  - PATCH  /auctions/:id/price-drop   seller accepts the -5,000 offer or withdraws
 * ==================================================================
 */
