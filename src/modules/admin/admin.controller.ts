/**
 * ==================================================================
 *  TEAM A  (Naeem Majumder)
 * ==================================================================
 *  AdminController: HTTP endpoints for admin-only actions  (route: /admin)
 *
 *  - PATCH  /admin/sellers/:id/review      approve or reject a seller
 *  - PATCH  /admin/vets/:id/review         approve or reject a vet
 *  - PATCH  /admin/users/:id/deactivate    deactivate a user
 *  - GET    /admin/orders | /admin/summary  view all orders, simple counts
 *  - All routes: @Roles(Role.ADMIN) + RolesGuard
 *  - NOTE: pet listing review and auction approval routes live in Team B modules (pet, auction)
 * ==================================================================
 */
