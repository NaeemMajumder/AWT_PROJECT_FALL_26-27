import { Body, Controller, Get, Post, Patch, Param, UseGuards } from "@nestjs/common";
import { AuctionService } from "./auction.service";
import { BidService } from "./bid.service";
import { CreateAuctionDto, PriceDropDecisionDto, ReviewAuctionDto } from "./dto/auction.dto";
import { PlaceBidDto, EditBidDto } from "./dto/bid.dto";
import { JwtGuard } from "../../common/guard/jwt.guard";
import { RolesGuard } from "../../common/guard/roles.guard";
import { Roles } from "../../common/decorators/roles.decorator";
import { Role } from "../../common/enums/role.enum";
import { CurrentUser } from "../../common/decorators/current-user.decorator";
import { AuthUser } from "../../common/interfaces/auth-user.interface";

@Controller("auctions")
export class AuctionController {
  constructor(private readonly auctionService: AuctionService, private readonly bidService: BidService) {}

  @Get()
  async getAuctions() { return await this.auctionService.getAuctions(); }

  @Get("my-bids")
  @UseGuards(JwtGuard)
  async getMyBids(@CurrentUser() user: AuthUser) { return await this.bidService.getMyBids(user.id); }

  @Get(":id")
  async getAuction(@Param("id") id: string) { return await this.auctionService.getAuction(id); }

  @Post()
  @UseGuards(JwtGuard)
  async createAuction(@CurrentUser() user: AuthUser, @Body() dto: CreateAuctionDto) {
    return await this.auctionService.createAuction(user.id, dto);
  }

  @Patch(":id/review")
  @UseGuards(JwtGuard, RolesGuard)
  @Roles(Role.ADMIN)
  async reviewAuction(@Param("id") id: string, @CurrentUser() user: AuthUser, @Body() dto: ReviewAuctionDto) {
    return await this.auctionService.reviewAuction(id, user.id, dto);
  }

  @Post(":id/bids")
  @UseGuards(JwtGuard)
  async placeBid(@Param("id") id: string, @CurrentUser() user: AuthUser, @Body() dto: PlaceBidDto) {
    return await this.bidService.placeBid(id, user.id, dto.amount);
  }

  @Patch(":id/bids/me")
  @UseGuards(JwtGuard)
  async editBid(@Param("id") id: string, @CurrentUser() user: AuthUser, @Body() dto: EditBidDto) {
    return await this.bidService.editBid(id, user.id, dto.amount);
  }

  @Patch(":id/price-drop")
  @UseGuards(JwtGuard)
  async decidePriceDrop(@Param("id") id: string, @CurrentUser() user: AuthUser, @Body() dto: PriceDropDecisionDto) {
    return await this.auctionService.decidePriceDrop(id, user.id, dto);
  }
}
