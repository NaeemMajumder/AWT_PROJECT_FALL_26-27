import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Review } from "./entities/review.entity";
import { ReviewController } from "./review.controller";
import { ReviewService } from "./review.service";
import { OrderModule } from "../order/order.module";
import { ConsultationModule } from "../consultation/consultation.module";

@Module({
  imports: [TypeOrmModule.forFeature([Review]), OrderModule, ConsultationModule],
  controllers: [ReviewController],
  providers: [ReviewService],
})
export class ReviewModule {}
