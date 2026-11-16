/**
 * ==================================================================
 *  TEAM B  (Farzana Islam Upoma)
 * ==================================================================

 * PetController: public pet search and authenticated listing management.
 */
import { Body, Controller, Get, Post, Patch, Delete, Param, Query, UseGuards, UploadedFile, UseInterceptors } from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import { PetService } from "./pet.service";
import { CreatePetDto, PetSearchQueryDto, ReviewPetDto, UpdatePetDto } from "./dto/pet.dto";
import { JwtGuard } from "../../common/guard/jwt.guard";
import { RolesGuard } from "../../common/guard/roles.guard";
import { Roles } from "../../common/decorators/roles.decorator";
import { Role } from "../../common/enums/role.enum";
import { CurrentUser } from "../../common/decorators/current-user.decorator";
import { AuthUser } from "../../common/interfaces/auth-user.interface";

@Controller("pets")
export class PetController {
  constructor(private readonly petService: PetService) {}

  @Get()
  async getPets(@Query() query: PetSearchQueryDto) { return await this.petService.getPets(query); }

  @Get("my")
  @UseGuards(JwtGuard)
  async getMyPets(@CurrentUser() user: AuthUser) {
    return await this.petService.getMyPets(user.id);
  }

  @Get(":id")
  async getPet(@Param("id") id: string) { return await this.petService.getPet(id); }

  @Post()
  @UseGuards(JwtGuard)
  @UseInterceptors(FileInterceptor("photo", {
    limits: { fileSize: 2 * 1024 * 1024 },
    fileFilter: (request, file, callback) => {
      if (!["image/jpeg", "image/png"].includes(file.mimetype)) {
        return callback(new Error("Only JPG and PNG images are allowed"), false);
      }
      callback(null, true);
    },
  }))
  async createPet(@CurrentUser() user: AuthUser, @Body() dto: CreatePetDto, @UploadedFile() photo?: Express.Multer.File) {
    // Team A must add ApprovedSellerGuard for SALE listings (handshake 1).
    return await this.petService.createPet(user.id, dto, photo);
  }

  @Patch(":id")
  @UseGuards(JwtGuard)
  async updatePet(@Param("id") id: string, @CurrentUser() user: AuthUser, @Body() dto: UpdatePetDto) {
    return await this.petService.updatePet(id, user.id, dto);
  }

  @Delete(":id")
  @UseGuards(JwtGuard)
  async withdrawPet(@Param("id") id: string, @CurrentUser() user: AuthUser) {
    return await this.petService.withdrawPet(id, user.id);
  }

  @Patch(":id/review")
  @UseGuards(JwtGuard, RolesGuard)
  @Roles(Role.ADMIN)
  async reviewPet(@Param("id") id: string, @Body() dto: ReviewPetDto) {
    return await this.petService.reviewPet(id, dto);
  }
}
