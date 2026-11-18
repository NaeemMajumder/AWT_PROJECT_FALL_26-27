import { Body, Controller, Get, Param, ParseUUIDPipe, Post, UploadedFile, UseGuards, UseInterceptors } from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import { SellerService } from "./seller.service";
import { CreateSellerApplicationDto } from "./dto/seller.dto";
import { JwtGuard } from "@/common/guard/jwt.guard";
import { CurrentUser } from "@/common/decorators/current-user.decorator";
import { AuthUser } from "@/common/interfaces/auth-user.interface";
import { StorageService } from "@/providers/storage/local/storage.service";
import { ALLOWED_DOC_TYPES } from "@/common/constants/upload.constants";

@Controller("sellers")
export class SellerController {
  constructor(
    private readonly sellerService: SellerService,
    private readonly storageService: StorageService,
  ) {}

  @Post("apply")
  @UseGuards(JwtGuard)
  @UseInterceptors(FileInterceptor("document"))
  async apply(
    @CurrentUser() user: AuthUser,
    @Body() dto: CreateSellerApplicationDto,
    @UploadedFile() document?: Express.Multer.File,
  ) {
    let documentPath: string | undefined;
    if (document) {
      documentPath = this.storageService.save(document, "documents", ALLOWED_DOC_TYPES);
    }
    return await this.sellerService.apply(user.id, dto, documentPath);
  }

  @Get("me")
  @UseGuards(JwtGuard)
  async getMe(@CurrentUser() user: AuthUser) {
    return await this.sellerService.getMyProfile(user.id);
  }

  @Get(":id")
  async getSeller(@Param("id", ParseUUIDPipe) id: string) {
    return await this.sellerService.getPublicProfile(id);
  }
}
