import { Body, Controller, Get, Param, ParseUUIDPipe, Patch, Post, Query, UseGuards } from "@nestjs/common";
import { VetService } from "./vet.service";
import { CreateVetApplicationDto, UpdateVetProfileDto, VetSearchQueryDto } from "./dto/vet.dto";
import { JwtGuard } from "@/common/guard/jwt.guard";
import { CurrentUser } from "@/common/decorators/current-user.decorator";
import { AuthUser } from "@/common/interfaces/auth-user.interface";

@Controller("vets")
export class VetController {
  constructor(private readonly vetService: VetService) {}

  @Get()
  async searchVets(@Query() query: VetSearchQueryDto) {
    return await this.vetService.searchVets(query);
  }

  @Post("apply")
  @UseGuards(JwtGuard)
  async apply(@CurrentUser() user: AuthUser, @Body() dto: CreateVetApplicationDto) {
    return await this.vetService.apply(user.id, dto);
  }

  @Get("me")
  @UseGuards(JwtGuard)
  async getMe(@CurrentUser() user: AuthUser) {
    return await this.vetService.getMyProfile(user.id);
  }

  @Patch("me")
  @UseGuards(JwtGuard)
  async updateMe(@CurrentUser() user: AuthUser, @Body() dto: UpdateVetProfileDto) {
    return await this.vetService.updateMyProfile(user.id, dto);
  }

  @Get(":id")
  async getVet(@Param("id", ParseUUIDPipe) id: string) {
    return await this.vetService.getPublicVet(id);
  }
}
