import { ForbiddenException, Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Product } from "./entities/product.entity";
import { CreateProductDto, ProductQueryDto, UpdateProductDto } from "./dto/product.dto";

@Injectable()
export class ProductService {
  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
  ) {}

  async getProducts(query: ProductQueryDto) {
    try {
      const qb = this.productRepository
        .createQueryBuilder("product")
        .where("product.is_active = true");

      if (query.category) {
        qb.andWhere("LOWER(product.category) = LOWER(:category)", { category: query.category });
      }
      if (query.q) {
        qb.andWhere("product.name ILIKE :q", { q: "%" + query.q + "%" });
      }

      return await qb.orderBy("product.created_at", "DESC").getMany();
    } catch (error) {
      throw error;
    }
  }

  async getProduct(id: string) {
    try {
      const product = await this.productRepository.findOne({ where: { id: id } });
      if (!product) {
        throw new NotFoundException("Product not found");
      }
      return product;
    } catch (error) {
      throw error;
    }
  }

  async getMyProducts(sellerId: string) {
    try {
      return await this.productRepository.find({
        where: { seller_id: sellerId },
        order: { created_at: "DESC" },
      });
    } catch (error) {
      throw error;
    }
  }

  async createProduct(sellerId: string, dto: CreateProductDto, imagePath?: string) {
    try {
      const product = this.productRepository.create({
        seller_id: sellerId,
        name: dto.name,
        category: dto.category,
        for_species: dto.for_species,
        description: dto.description,
        price: dto.price,
        stock: dto.stock,
        image_path: imagePath,
      });
      return await this.productRepository.save(product);
    } catch (error) {
      throw error;
    }
  }

  async updateProduct(id: string, sellerId: string, dto: UpdateProductDto) {
    try {
      const product = await this.getProduct(id);
      if (product.seller_id !== sellerId) {
        throw new ForbiddenException("You can only edit your own products");
      }

      if (dto.name) product.name = dto.name;
      if (dto.description !== undefined) product.description = dto.description;
      if (dto.price !== undefined) product.price = dto.price;
      if (dto.stock !== undefined) product.stock = dto.stock;
      if (dto.is_active !== undefined) product.is_active = dto.is_active;

      return await this.productRepository.save(product);
    } catch (error) {
      throw error;
    }
  }
}
