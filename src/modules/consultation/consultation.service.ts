/**
 * ==================================================================
 *  TEAM B  (Farzana Islam Upoma)
 * ==================================================================
 *  ConsultationService: business logic and rules for vet consultation booking and the demo video call
 *
 *  - end_time = start_time + vet slot_minutes (VetService.getApprovedVet: HANDSHAKE 2)
 *  - No overlap for the same vet AND for the same user -> 409
 *  - Inside vet working hours, future dates only, cancelled bookings ignored
 *  - Online booking -> MeetingService creates room_code
 *  - isCompleted(id, userId): HANDSHAKE 6 for Team A ReviewService
 * ==================================================================
 */
