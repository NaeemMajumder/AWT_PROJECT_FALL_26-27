/**
 * ==================================================================
 *  TEAM B  (Farzana Islam Upoma)
 * ==================================================================
 *  PetService: business logic and rules for pet listings for sale, adoption and rescue
 *
 *  - Validate with species rules: allowed species, min age, vaccination record
 *  - Adoption -> price must be 0; sale -> price > 0
 *  - New listing status = pending_review until admin approves
 *  - Listens to 'order.paid' -> SOLD, 'order.expired' -> AVAILABLE (HANDSHAKE 4)
 *  - Photo upload via StorageService.save() from Team A (HANDSHAKE 7)
 * ==================================================================
 */
