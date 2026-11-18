import { BadRequestException, ConflictException, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Review } from "./entities/review.entity";
import { CreateReviewDto } from "./dto/review.dto";
import { OrderService } from "../order/order.service";
import { ConsultationService } from "../consultation/consultation.service";

@Injectable()
export class ReviewService {
  constructor(
    @InjectRepository(Review) private readonly reviewRepository: Repository<Review>,
    private readonly orderService: OrderService,
    private readonly consultationService: ConsultationService,
  ) {}

  async createReview(userId: string, dto: CreateReviewDto) {
    try {
      if (!dto.order_id && !dto.consultation_id) {
        throw new BadRequestException("Give an order_id or a consultation_id");
      }
      if (dto.order_id && dto.consultation_id) {
        throw new BadRequestException("Review one thing at a time");
      }

      const review = this.reviewRepository.create({
        reviewer_id: userId,
        rating: dto.rating,
        comment: dto.comment,
      });

      if (dto.order_id) {
        const already = await this.reviewRepository.findOne({
          where: { reviewer_id: userId, order_id: dto.order_id },
        });
        if (already) {
          throw new ConflictException("You already reviewed this order");
        }
        const order = await this.orderService.getCompletedOrderForReview(dto.order_id, userId);
        review.order_id = order.id;
        review.seller_id = order.items[0].seller_id;
      }

      if (dto.consultation_id) {
        const already = await this.reviewRepository.findOne({
          where: { reviewer_id: userId, consultation_id: dto.consultation_id },
        });
        if (already) {
          throw new ConflictException("You already reviewed this consultation");
        }
        const consultation = await this.consultationService.getCompletedForReview(dto.consultation_id, userId);
        review.consultation_id = consultation.id;
        review.vet_id = consultation.vet_id;
      }

      return await this.reviewRepository.save(review);
    } catch (error) {
      throw error;
    }
  }

  async getSellerReviews(sellerId: string) {
    try {
      const reviews = await this.reviewRepository.find({
        where: { seller_id: sellerId },
        relations: ["reviewer"],
        order: { created_at: "DESC" },
      });
      return this.withAverage(reviews);
    } catch (error) {
      throw error;
    }
  }

  async getVetReviews(vetId: string) {
    try {
      const reviews = await this.reviewRepository.find({
        where: { vet_id: vetId },
        relations: ["reviewer"],
        order: { created_at: "DESC" },
      });
      return this.withAverage(reviews);
    } catch (error) {
      throw error;
    }
  }

  withAverage(reviews: Review[]) {
    let sum = 0;
    for (const review of reviews) {
      sum = sum + review.rating;
    }
    const average = reviews.length > 0 ? Number((sum / reviews.length).toFixed(1)) : 0;

    const list = reviews.map((review) => ({
      id: review.id,
      rating: review.rating,
      comment: review.comment,
      reviewer: review.reviewer ? review.reviewer.name : null,
      created_at: review.created_at,
    }));

    return {
      average_rating: average,
      total: reviews.length,
      reviews: list,
    };
  }
}
