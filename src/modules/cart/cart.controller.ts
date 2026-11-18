import { Body, Controller, Delete, Get, Param, ParseUUIDPipe, Patch, Post, UseGuards } from "@nestjs/common";
import { CartService } from "./cart.service";
import { AddCartItemDto, UpdateCartItemDto } from "./dto/cart.dto";
import { JwtGuard } from "@/common/guard/jwt.guard";
import { CurrentUser } from "@/common/decorators/current-user.decorator";
import { AuthUser } from "@/common/interfaces/auth-user.interface";

@Controller("cart")
@UseGuards(JwtGuard)
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @Get()
  async getCart(@CurrentUser() user: AuthUser) {
    return await this.cartService.getMyCart(user.id);
  }

  @Post("items")
  async addItem(@CurrentUser() user: AuthUser, @Body() dto: AddCartItemDto) {
    return await this.cartService.addItem(user.id, dto);
  }

  @Patch("items/:id")
  async updateItem(
    @CurrentUser() user: AuthUser,
    @Param("id", ParseUUIDPipe) id: string,
    @Body() dto: UpdateCartItemDto,
  ) {
    return await this.cartService.updateItem(user.id, id, dto);
  }

  @Delete("items/:id")
  async removeItem(@CurrentUser() user: AuthUser, @Param("id", ParseUUIDPipe) id: string) {
    return await this.cartService.removeItem(user.id, id);
  }
}
