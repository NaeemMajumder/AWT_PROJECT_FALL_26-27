import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Seeder } from "nestjs-seeder";
import { Product } from "@/modules/product/entities/product.entity";
import { User } from "@/modules/user/entities/user.entity";

@Injectable()
export class ProductSeeder implements Seeder {
  constructor(
    @InjectRepository(Product) private readonly productRepository: Repository<Product>,
    @InjectRepository(User) private readonly userRepository: Repository<User>,
  ) {}

  async seed() {
    const count = await this.productRepository.count();
    if (count > 0) {
      return;
    }

    const sabbir = await this.userRepository.findOne({ where: { email: "sabbir@gmail.com" } });
    const nusrat = await this.userRepository.findOne({ where: { email: "nusrat@gmail.com" } });
    if (!sabbir || !nusrat) {
      return;
    }

    const products = [
      { seller_id: nusrat.id, name: "Royal Canin Puppy Food 2kg", category: "food", for_species: "Dog", price: 2800, stock: 25 },
      { seller_id: nusrat.id, name: "Whiskas Cat Food 1.2kg", category: "food", for_species: "Cat", price: 950, stock: 40 },
      { seller_id: nusrat.id, name: "Cat Litter 5L", category: "care", for_species: "Cat", price: 650, stock: 30 },
      { seller_id: sabbir.id, name: "Dog Collar with Leash", category: "accessories", for_species: "Dog", price: 450, stock: 15 },
      { seller_id: sabbir.id, name: "Bird Cage Medium", category: "accessories", for_species: "Bird", price: 1800, stock: 5 },
      { seller_id: sabbir.id, name: "Anti Tick Shampoo", category: "medicine", for_species: null, price: 380, stock: 20 },
    ];

    for (const item of products) {
      const product = this.productRepository.create({
        seller_id: item.seller_id,
        name: item.name,
        category: item.category,
        for_species: item.for_species,
        description: item.name + " - original product",
        price: item.price,
        stock: item.stock,
        is_active: true,
      });
      await this.productRepository.save(product);
    }
  }

  async drop() {}
}
