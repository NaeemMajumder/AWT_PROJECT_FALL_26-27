import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from "@nestjs/common";
import { DataSource } from "typeorm";
import { VetProfile } from "@/modules/vet/entities/vet-profile.entity";
import { ProfileStatus } from "@/common/enums/profile-status.enum";

@Injectable()
export class ApprovedVetGuard implements CanActivate {
  constructor(private readonly dataSource: DataSource) {}

  async canActivate(context: ExecutionContext) {
    const req = context.switchToHttp().getRequest();
    const user = req.user;
    if (!user) {
      throw new ForbiddenException("User not authenticated");
    }

    const profile = await this.dataSource.getRepository(VetProfile).findOne({
      where: { user_id: user.id },
    });
    if (!profile || profile.status !== ProfileStatus.APPROVED) {
      throw new ForbiddenException("Only approved vets can do this");
    }
    return true;
  }
}
