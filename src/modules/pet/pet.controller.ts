import { Body, Controller, Delete, Get, Param, ParseUUIDPipe, Patch, Post, Query, UploadedFile, UseGuards, UseInterceptors } from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import { PetService } from "./pet.service";
import { CreatePetDto, PetSearchQueryDto, ReviewPetDto, UpdatePetDto } from "./dto/pet.dto";
import { JwtGuard } from "@/common/guard/jwt.guard";
import { RolesGuard } from "@/common/guard/roles.guard";
import { Roles } from "@/common/decorators/roles.decorator";
import { Role } from "@/common/enums/role.enum";
import { CurrentUser } from "@/common/decorators/current-user.decorator";
import { AuthUser } from "@/common/interfaces/auth-user.interface";
import { StorageService } from "@/providers/storage/local/storage.service";
import { ALLOWED_IMAGE_TYPES } from "@/common/constants/upload.constants";

@Controller("pets")
export class PetController {
  constructor(
    private readonly petService: PetService,
    private readonly storageService: StorageService,
  ) {}

  @Get()
  async getPets(@Query() query: PetSearchQueryDto) {
    return await this.petService.getPets(query);
  }

  @Get("my")
  @UseGuards(JwtGuard)
  async getMyPets(@CurrentUser() user: AuthUser) {
    return await this.petService.getMyPets(user.id);
  }

  @Get("pending")
  @UseGuards(JwtGuard, RolesGuard)
  @Roles(Role.ADMIN)
  async getPendingPets() {
    return await this.petService.getPendingPets();
  }

  @Get(":id")
  async getPet(@Param("id", ParseUUIDPipe) id: string) {
    return await this.petService.getPet(id);
  }

  @Post()
  @UseGuards(JwtGuard)
  @UseInterceptors(FileInterceptor("photo"))
  async createPet(
    @CurrentUser() user: AuthUser,
    @Body() dto: CreatePetDto,
    @UploadedFile() photo?: Express.Multer.File,
  ) {
    let photoPath: string | undefined;
    if (photo) {
      photoPath = this.storageService.save(photo, "pets", ALLOWED_IMAGE_TYPES);
    }
    return await this.petService.createPet(user.id, dto, photoPath);
  }

  @Patch(":id")
  @UseGuards(JwtGuard)
  async updatePet(
    @Param("id", ParseUUIDPipe) id: string,
    @CurrentUser() user: AuthUser,
    @Body() dto: UpdatePetDto,
  ) {
    return await this.petService.updatePet(id, user.id, dto);
  }

  @Delete(":id")
  @UseGuards(JwtGuard)
  async withdrawPet(@Param("id", ParseUUIDPipe) id: string, @CurrentUser() user: AuthUser) {
    return await this.petService.withdrawPet(id, user.id);
  }

  @Patch(":id/review")
  @UseGuards(JwtGuard, RolesGuard)
  @Roles(Role.ADMIN)
  async reviewPet(@Param("id", ParseUUIDPipe) id: string, @Body() dto: ReviewPetDto) {
    return await this.petService.reviewPet(id, dto);
  }
}
