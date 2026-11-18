import { Injectable } from "@nestjs/common";
import { randomUUID } from "crypto";

@Injectable()
export class MeetingService {
  createRoomCode() {
    return `pet-bazaar-${randomUUID()}`;
  }

  getMeetingUrl(roomCode: string) {
    return `https://meet.jit.si/${roomCode}`;
  }
}
