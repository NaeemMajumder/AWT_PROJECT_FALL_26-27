import { Body, Controller, Get, Param, ParseUUIDPipe, Patch, Post, Query, UploadedFile, UseGuards, UseInterceptors } from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import { ProductService } from "./product.service";
import { CreateProductDto, ProductQueryDto, UpdateProductDto } from "./dto/product.dto";
import { JwtGuard } from "@/common/guard/jwt.guard";
import { ApprovedSellerGuard } from "@/common/guard/approved-seller.guard";
import { CurrentUser } from "@/common/decorators/current-user.decorator";
import { AuthUser } from "@/common/interfaces/auth-user.interface";
import { StorageService } from "@/providers/storage/local/storage.service";
import { ALLOWED_IMAGE_TYPES } from "@/common/constants/upload.constants";

@Controller("products")
export class ProductController {
  constructor(
    private readonly productService: ProductService,
    private readonly storageService: StorageService,
  ) {}

  @Get()
  async getProducts(@Query() query: ProductQueryDto) {
    return await this.productService.getProducts(query);
  }

  @Get("my")
  @UseGuards(JwtGuard, ApprovedSellerGuard)
  async getMyProducts(@CurrentUser() user: AuthUser) {
    return await this.productService.getMyProducts(user.id);
  }

  @Get(":id")
  async getProduct(@Param("id", ParseUUIDPipe) id: string) {
    return await this.productService.getProduct(id);
  }

  @Post()
  @UseGuards(JwtGuard, ApprovedSellerGuard)
  @UseInterceptors(FileInterceptor("image"))
  async createProduct(
    @CurrentUser() user: AuthUser,
    @Body() dto: CreateProductDto,
    @UploadedFile() image?: Express.Multer.File,
  ) {
    let imagePath: string | undefined;
    if (image) {
      imagePath = this.storageService.save(image, "products", ALLOWED_IMAGE_TYPES);
    }
    return await this.productService.createProduct(user.id, dto, imagePath);
  }

  @Patch(":id")
  @UseGuards(JwtGuard, ApprovedSellerGuard)
  async updateProduct(
    @Param("id", ParseUUIDPipe) id: string,
    @CurrentUser() user: AuthUser,
    @Body() dto: UpdateProductDto,
  ) {
    return await this.productService.updateProduct(id, user.id, dto);
  }
}
