import { Body, Controller, Get, Param, ParseUUIDPipe, Post, UseGuards } from "@nestjs/common";
import { ReviewService } from "./review.service";
import { CreateReviewDto } from "./dto/review.dto";
import { JwtGuard } from "@/common/guard/jwt.guard";
import { CurrentUser } from "@/common/decorators/current-user.decorator";
import { AuthUser } from "@/common/interfaces/auth-user.interface";

@Controller("reviews")
export class ReviewController {
  constructor(private readonly reviewService: ReviewService) {}

  @Post()
  @UseGuards(JwtGuard)
  async createReview(@CurrentUser() user: AuthUser, @Body() dto: CreateReviewDto) {
    return await this.reviewService.createReview(user.id, dto);
  }

  @Get("seller/:sellerId")
  async getSellerReviews(@Param("sellerId", ParseUUIDPipe) sellerId: string) {
    return await this.reviewService.getSellerReviews(sellerId);
  }

  @Get("vet/:vetId")
  async getVetReviews(@Param("vetId", ParseUUIDPipe) vetId: string) {
    return await this.reviewService.getVetReviews(vetId);
  }
}
