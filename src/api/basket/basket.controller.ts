import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { BasketService } from './basket.service';
import { CreateBasketDto } from './dto/create-basket.dto';
import { Roles } from 'src/common/database/Enums';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { CurrentUser } from 'src/common/decorator/current-user';
import { UserEntity } from 'src/core/entity/user.entity';
import { RolesGuard } from '../auth/roles/RoleGuard';
import { JwtAuthGuard } from '../auth/users/AuthGuard';
import { RolesDecorator } from '../auth/roles/RolesDecorator';

@ApiTags('Baskets')
@ApiBearerAuth('access-token')
@Controller('baskets')
export class BasketController {
  constructor(private readonly basketService: BasketService) { }

  // Add product to basket
  @Post('add')
  @RolesDecorator(Roles.USER, Roles.SUPER_ADMIN)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiOperation({ summary: 'Add product to basket' })
  @ApiResponse({ status: 201, description: 'Product added to basket' })
  addProduct(
    @Body() createBasketDto: CreateBasketDto,
    @CurrentUser() currentUser: UserEntity,
  ) {
    return this.basketService.addProduct(createBasketDto, currentUser);
  }

  // Get all products in the basket
  @Get()
  @RolesDecorator(Roles.USER, Roles.SUPER_ADMIN)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiOperation({ summary: 'Get all products in the basket' })
  @ApiResponse({ status: 200, description: 'List of basket products' })
  getBasket(@CurrentUser() currentUser: UserEntity) {
    return this.basketService.getBasket(currentUser);
  }

  // Update quantity of product in the basket
  @Patch('update/:id')
  @RolesDecorator(Roles.USER, Roles.SUPER_ADMIN)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiOperation({ summary: 'Update quantity of product in the basket' })
  @ApiParam({ name: 'id', type: 'string', description: 'Basket Item ID' })
  @ApiResponse({ status: 200, description: 'Basket product quantity updated' })
  updateQuantity(
    @Param('id') id: string,
    @Body() quantity: number,
    @CurrentUser() currentUser: UserEntity,
  ) {
    return this.basketService.updateQuantity(id, quantity, currentUser);
  }

  // Remove product from basket
  @Delete('remove/:id')
  @RolesDecorator(Roles.USER, Roles.SUPER_ADMIN)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiOperation({ summary: 'Remove product from basket' })
  @ApiParam({ name: 'id', type: 'string', description: 'Basket Item ID' })
  @ApiResponse({ status: 200, description: 'Product removed from basket' })
  removeProduct(
    @Param('id') id: string,
    @CurrentUser() currentUser: UserEntity,
  ) {
    return this.basketService.removeProduct(id, currentUser);
  }

  // Clear the basket
  @Delete('clear')
  @RolesDecorator(Roles.USER, Roles.SUPER_ADMIN)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiOperation({ summary: 'Clear the basket' })
  @ApiResponse({ status: 200, description: 'Basket cleared' })
  clearBasket(@CurrentUser() currentUser: UserEntity) {
    return this.basketService.clearBasket(currentUser);
  }
}
