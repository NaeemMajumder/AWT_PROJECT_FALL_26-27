import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from "@nestjs/common";
import { DataSource } from "typeorm";
import { SellerProfile } from "@/modules/seller/entities/seller-profile.entity";
import { ProfileStatus } from "@/common/enums/profile-status.enum";

@Injectable()
export class ApprovedSellerGuard implements CanActivate {
  constructor(private readonly dataSource: DataSource) {}

  async canActivate(context: ExecutionContext) {
    const req = context.switchToHttp().getRequest();
    const user = req.user;
    if (!user) {
      throw new ForbiddenException("User not authenticated");
    }

    const profile = await this.dataSource.getRepository(SellerProfile).findOne({
      where: { user_id: user.id },
    });
    if (!profile || profile.status !== ProfileStatus.APPROVED) {
      throw new ForbiddenException("Only approved sellers can do this");
    }
    return true;
  }
}
