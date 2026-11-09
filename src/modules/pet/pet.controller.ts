/**
 * ==================================================================
 *  TEAM B  (Farzana Islam Upoma)
 * ==================================================================
 *  PetController: HTTP endpoints for pet listings for sale, adoption and rescue  (route: /pets)
 *
 *  - GET    /pets?species=&breed=&district=&type=&rescue=   public search (approved only)
 *  - GET    /pets/:id
 *  - POST   /pets                      sale: ApprovedSellerGuard / adoption: any logged-in user
 *  - PATCH  /pets/:id | DELETE /pets/:id     owner edits or withdraws
 *  - PATCH  /pets/:id/review           admin approves/rejects listing (@Roles ADMIN)
 * ==================================================================
 */
