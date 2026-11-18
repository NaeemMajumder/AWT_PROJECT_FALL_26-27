import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Product } from "./entities/product.entity";
import { ProductController } from "./product.controller";
import { ProductService } from "./product.service";
import { StorageModule } from "@/providers/storage/local/storage.module";

@Module({
  imports: [TypeOrmModule.forFeature([Product]), StorageModule],
  controllers: [ProductController],
  providers: [ProductService],
  exports: [ProductService],
})
export class ProductModule {}
