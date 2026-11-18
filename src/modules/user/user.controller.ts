import { Body, Controller, Get, Patch, UseGuards } from "@nestjs/common";
import { UserService } from "./user.service";
import { ChangePasswordDto, UpdateProfileDto } from "./dto/user.dto";
import { JwtGuard } from "@/common/guard/jwt.guard";
import { CurrentUser } from "@/common/decorators/current-user.decorator";
import { AuthUser } from "@/common/interfaces/auth-user.interface";

@Controller("users")
@UseGuards(JwtGuard)
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get("me")
  async getMe(@CurrentUser() user: AuthUser) {
    return await this.userService.getUserById(user.id);
  }

  @Patch("me")
  async updateMe(@CurrentUser() user: AuthUser, @Body() dto: UpdateProfileDto) {
    return await this.userService.updateProfile(user.id, dto);
  }

  @Patch("me/password")
  async changePassword(@CurrentUser() user: AuthUser, @Body() dto: ChangePasswordDto) {
    return await this.userService.changePassword(user.id, dto);
  }
}
