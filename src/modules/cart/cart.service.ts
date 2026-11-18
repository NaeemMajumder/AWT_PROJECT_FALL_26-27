import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Cart } from "./entities/cart.entity";
import { CartItem } from "./entities/cart-item.entity";
import { AddCartItemDto, UpdateCartItemDto } from "./dto/cart.dto";
import { ProductService } from "../product/product.service";

@Injectable()
export class CartService {
  constructor(
    @InjectRepository(Cart) private readonly cartRepository: Repository<Cart>,
    @InjectRepository(CartItem) private readonly cartItemRepository: Repository<CartItem>,
    private readonly productService: ProductService,
  ) {}

  async getActiveCart(userId: string) {
    let cart = await this.cartRepository.findOne({ where: { user_id: userId, status: "active" } });
    if (!cart) {
      cart = this.cartRepository.create({ user_id: userId, status: "active" });
      cart = await this.cartRepository.save(cart);
    }
    return cart;
  }

  async getMyCart(userId: string) {
    try {
      const cart = await this.getActiveCart(userId);
      const items = await this.cartItemRepository.find({
        where: { cart_id: cart.id },
        relations: ["product"],
        order: { created_at: "ASC" },
      });

      let total = 0;
      for (const item of items) {
        total = total + Number(item.product.price) * item.quantity;
      }

      return {
        id: cart.id,
        items: items,
        total: total,
      };
    } catch (error) {
      throw error;
    }
  }

  async addItem(userId: string, dto: AddCartItemDto) {
    try {
      const product = await this.productService.getProduct(dto.product_id);
      if (!product.is_active) {
        throw new BadRequestException("This product is not available now");
      }
      if (product.seller_id === userId) {
        throw new BadRequestException("You can not buy your own product");
      }

      const cart = await this.getActiveCart(userId);
      let item = await this.cartItemRepository.findOne({
        where: { cart_id: cart.id, product_id: dto.product_id },
      });

      const newQuantity = item ? item.quantity + dto.quantity : dto.quantity;
      if (newQuantity > product.stock) {
        throw new BadRequestException("Only " + product.stock + " left in stock");
      }

      if (item) {
        item.quantity = newQuantity;
      } else {
        item = this.cartItemRepository.create({
          cart_id: cart.id,
          product_id: dto.product_id,
          quantity: dto.quantity,
        });
      }
      await this.cartItemRepository.save(item);
      return await this.getMyCart(userId);
    } catch (error) {
      throw error;
    }
  }

  async updateItem(userId: string, itemId: string, dto: UpdateCartItemDto) {
    try {
      const item = await this.findMyItem(userId, itemId);
      const product = await this.productService.getProduct(item.product_id);
      if (dto.quantity > product.stock) {
        throw new BadRequestException("Only " + product.stock + " left in stock");
      }
      item.quantity = dto.quantity;
      await this.cartItemRepository.save(item);
      return await this.getMyCart(userId);
    } catch (error) {
      throw error;
    }
  }

  async removeItem(userId: string, itemId: string) {
    try {
      const item = await this.findMyItem(userId, itemId);
      await this.cartItemRepository.delete({ id: item.id });
      return await this.getMyCart(userId);
    } catch (error) {
      throw error;
    }
  }

  async findMyItem(userId: string, itemId: string) {
    const item = await this.cartItemRepository.findOne({
      where: { id: itemId },
      relations: ["cart"],
    });
    if (!item) {
      throw new NotFoundException("Cart item not found");
    }
    if (item.cart.user_id !== userId || item.cart.status !== "active") {
      throw new ForbiddenException("This item is not in your cart");
    }
    return item;
  }
}
