/**
 * ==================================================================
 *  TEAM B  (Farzana Islam Upoma)
 * ==================================================================
 *  PetRequestService: business logic and rules for purchase and adoption requests (seller/owner approval)
 *
 *  - accept(): ONE transaction with row lock on the pet ->
 *    pet must be AVAILABLE, request ACCEPTED, pet RESERVED, other pending requests REJECTED
 *    purchase -> OrderService.createPetOrder() (HANDSHAKE 3); adoption -> pet ADOPTED, no payment
 *  - Second accept on same pet -> 409 Conflict; requester cannot be the owner
 *  - Seller phone shared with buyer only after acceptance; notify via NotificationService
 * ==================================================================
 */
