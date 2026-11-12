
import {
  Body,
  Controller,
  Get,
  Patch,
  Param,
  Post,
} from "@nestjs/common";
import { SpeciesService } from "./species.service";
import { CreateSpeciesDto, UpdateSpeciesDto } from "./dto/species.dto";

@Controller("species")
export class SpeciesController {
  constructor(private readonly speciesService: SpeciesService) {}

  @Get()
  async getSpecies() {
    return await this.speciesService.getSpecies();
  }

  @Post()
  async createSpecies(@Body() dto: CreateSpeciesDto) {
    return await this.speciesService.createSpecies(dto);
  }

  @Patch(":id")
  async updateSpecies(
    @Param("id") id: string,
    @Body() dto: UpdateSpeciesDto,
  ) {
    return await this.speciesService.updateSpecies(id, dto);
  }
}
