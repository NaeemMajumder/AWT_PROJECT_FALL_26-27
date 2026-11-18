import { Body, Controller, Get, Param, ParseUUIDPipe, Patch, Post, UseGuards } from "@nestjs/common";
import { AuctionService } from "./auction.service";
import { BidService } from "./bid.service";
import { CreateAuctionDto, PriceDropDecisionDto, ReviewAuctionDto } from "./dto/auction.dto";
import { PlaceBidDto } from "./dto/bid.dto";
import { JwtGuard } from "@/common/guard/jwt.guard";
import { RolesGuard } from "@/common/guard/roles.guard";
import { ApprovedSellerGuard } from "@/common/guard/approved-seller.guard";
import { Roles } from "@/common/decorators/roles.decorator";
import { Role } from "@/common/enums/role.enum";
import { CurrentUser } from "@/common/decorators/current-user.decorator";
import { AuthUser } from "@/common/interfaces/auth-user.interface";

@Controller("auctions")
export class AuctionController {
  constructor(
    private readonly auctionService: AuctionService,
    private readonly bidService: BidService,
  ) {}

  @Get()
  async getAuctions() {
    return await this.auctionService.getAuctions();
  }

  @Get("my-bids")
  @UseGuards(JwtGuard)
  async getMyBids(@CurrentUser() user: AuthUser) {
    return await this.bidService.getMyBids(user.id);
  }

  @Get("my-auctions")
  @UseGuards(JwtGuard, ApprovedSellerGuard)
  async getMyAuctions(@CurrentUser() user: AuthUser) {
    return await this.auctionService.getMyAuctions(user.id);
  }

  @Get("requests")
  @UseGuards(JwtGuard, RolesGuard)
  @Roles(Role.ADMIN)
  async getRequests() {
    return await this.auctionService.getAuctionRequests();
  }

  @Get(":id")
  async getAuction(@Param("id", ParseUUIDPipe) id: string) {
    return await this.auctionService.getAuction(id);
  }

  @Post()
  @UseGuards(JwtGuard, ApprovedSellerGuard)
  async createAuction(@CurrentUser() user: AuthUser, @Body() dto: CreateAuctionDto) {
    return await this.auctionService.createAuction(user.id, dto);
  }

  @Patch(":id/review")
  @UseGuards(JwtGuard, RolesGuard)
  @Roles(Role.ADMIN)
  async reviewAuction(
    @Param("id", ParseUUIDPipe) id: string,
    @CurrentUser() user: AuthUser,
    @Body() dto: ReviewAuctionDto,
  ) {
    return await this.auctionService.reviewAuction(id, user.id, dto);
  }

  @Post(":id/bids")
  @UseGuards(JwtGuard)
  async placeBid(
    @Param("id", ParseUUIDPipe) id: string,
    @CurrentUser() user: AuthUser,
    @Body() dto: PlaceBidDto,
  ) {
    return await this.bidService.placeBid(id, user.id, dto.amount);
  }

  @Patch(":id/bids/me")
  @UseGuards(JwtGuard)
  async editBid(
    @Param("id", ParseUUIDPipe) id: string,
    @CurrentUser() user: AuthUser,
    @Body() dto: PlaceBidDto,
  ) {
    return await this.bidService.editBid(id, user.id, dto.amount);
  }

  @Patch(":id/price-drop")
  @UseGuards(JwtGuard)
  async decidePriceDrop(
    @Param("id", ParseUUIDPipe) id: string,
    @CurrentUser() user: AuthUser,
    @Body() dto: PriceDropDecisionDto,
  ) {
    return await this.auctionService.decidePriceDrop(id, user.id, dto);
  }
}
