/**
 * ==================================================================
 *  TEAM B  (Farzana Islam Upoma)
 * ==================================================================
 *  ConsultationController: HTTP endpoints for vet consultation booking and the demo video call  (route: /consultations)
 *
 *  - POST   /consultations             book a vet (date, start_time, mode online/chamber)
 *  - GET    /consultations/my          my bookings  |  GET /consultations/vet   vet's own bookings
 *  - PATCH  /consultations/:id/confirm | /complete | /cancel
 *  - GET    /consultations/:id/join    demo call link (only user + vet, 10 min before start until end)
 * ==================================================================
 */
