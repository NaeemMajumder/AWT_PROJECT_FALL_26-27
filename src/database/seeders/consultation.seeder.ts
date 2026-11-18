import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Seeder } from "nestjs-seeder";
import { Consultation } from "@/modules/consultation/entities/consultation.entity";
import { VetProfile } from "@/modules/vet/entities/vet-profile.entity";
import { User } from "@/modules/user/entities/user.entity";
import { Species } from "@/modules/species/entities/species.entity";
import { ConsultationMode, ConsultationStatus } from "@/common/enums/consultation.enum";

@Injectable()
export class ConsultationSeeder implements Seeder {
  constructor(
    @InjectRepository(Consultation) private readonly consultationRepository: Repository<Consultation>,
    @InjectRepository(VetProfile) private readonly vetRepository: Repository<VetProfile>,
    @InjectRepository(User) private readonly userRepository: Repository<User>,
    @InjectRepository(Species) private readonly speciesRepository: Repository<Species>,
  ) {}

  dateString(daysFromToday: number) {
    const date = new Date(Date.now() + daysFromToday * 24 * 60 * 60 * 1000);
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return date.getFullYear() + "-" + month + "-" + day;
  }

  async seed() {
    const count = await this.consultationRepository.count();
    if (count > 0) {
      return;
    }

    const rahim = await this.userRepository.findOne({ where: { email: "rahim@gmail.com" } });
    const vetUser = await this.userRepository.findOne({ where: { email: "hasan.vet@gmail.com" } });
    const dog = await this.speciesRepository.findOne({ where: { name: "Dog" } });
    if (!rahim || !vetUser || !dog) {
      return;
    }
    const vet = await this.vetRepository.findOne({ where: { user_id: vetUser.id } });
    if (!vet) {
      return;
    }

    await this.consultationRepository.save(
      this.consultationRepository.create({
        vet_id: vet.id,
        user_id: rahim.id,
        species_id: dog.id,
        pet_name: "Tommy",
        problem_note: "Not eating for two days",
        date: this.dateString(-2),
        start_time: "11:00:00",
        end_time: "11:30:00",
        mode: ConsultationMode.ONLINE,
        room_code: "pet-bazaar-demo-room-1",
        status: ConsultationStatus.COMPLETED,
      }),
    );

    await this.consultationRepository.save(
      this.consultationRepository.create({
        vet_id: vet.id,
        user_id: rahim.id,
        species_id: dog.id,
        pet_name: "Tommy",
        problem_note: "Follow up checkup",
        date: this.dateString(3),
        start_time: "15:00:00",
        end_time: "15:30:00",
        mode: ConsultationMode.CHAMBER,
        status: ConsultationStatus.CONFIRMED,
      }),
    );
  }

  async drop() {}
}
