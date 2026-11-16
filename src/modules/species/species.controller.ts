import { Body, Controller, Get, Post, Patch, Param, UseGuards } from "@nestjs/common";
import { SpeciesService } from "./species.service";
import { CreateSpeciesDto, UpdateSpeciesDto } from "./dto/species.dto";
import { JwtGuard } from "../../common/guard/jwt.guard";
import { RolesGuard } from "../../common/guard/roles.guard";
import { Roles } from "../../common/decorators/roles.decorator";
import { Role } from "../../common/enums/role.enum";

@Controller("species")
export class SpeciesController {
  constructor(private readonly speciesService: SpeciesService) {}

  @Get()
  async getSpecies() { return await this.speciesService.getAllowedSpecies(); }
  @Post()
  @UseGuards(JwtGuard, RolesGuard)
  @Roles(Role.ADMIN)
  async createSpecies(@Body() dto: CreateSpeciesDto) {
    return await this.speciesService.createSpecies(dto);
  }

  @Patch(":id")
  @UseGuards(JwtGuard, RolesGuard)
  @Roles(Role.ADMIN)
  async updateSpecies(@Param("id") id: string, @Body() dto: UpdateSpeciesDto) {
    return await this.speciesService.updateSpecies(id, dto);
  }
}
