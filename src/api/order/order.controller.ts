// src/api/order/order.controller.ts
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
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { OrderService } from './order.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderStatusDto } from './dto/update-order.dto';
import { Roles } from 'src/common/database/Enums';
import { CurrentUser } from 'src/common/decorator/current-user';
import { UserEntity } from 'src/core/entity/user.entity';
import { RolesGuard } from '../auth/roles/RoleGuard';
import { JwtAuthGuard } from '../auth/users/AuthGuard';
import { RolesDecorator } from '../auth/roles/RolesDecorator';

@ApiTags('Orders')
@ApiBearerAuth('access-token')
@Controller('orders')
export class OrderController {
  constructor(private readonly orderService: OrderService) { }

  // Create a new order
  @Post('create')
  @RolesDecorator(Roles.USER, Roles.SUPER_ADMIN)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiOperation({ summary: 'Create a new order' })
  @ApiResponse({ status: 201, description: 'Order successfully created' })
  createOrder(
    @Body() createOrderDto: CreateOrderDto,
    @CurrentUser() currentUser: UserEntity,
  ) {
    return this.orderService.createOrder(createOrderDto, currentUser);
  }

  // Get all orders (Admin only)
  @Get()
  @RolesDecorator(Roles.ADMIN, Roles.SUPER_ADMIN)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiOperation({ summary: 'Get all orders (Admin only)' })
  @ApiResponse({ status: 200, description: 'List of all orders' })
  getAllOrders() {
    return this.orderService.getAllOrders();
  }

  // Get orders by user
  @Get('user')
  @RolesDecorator(Roles.USER, Roles.SUPER_ADMIN)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiOperation({ summary: 'Get orders by current user' })
  @ApiResponse({ status: 200, description: 'List of user orders' })
  getUserOrders(@CurrentUser() currentUser: UserEntity) {
    return this.orderService.getUserOrders(currentUser);
  }

  // Get order by ID
  @Get(':id')
  @RolesDecorator(Roles.USER, Roles.ADMIN, Roles.SUPER_ADMIN)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiOperation({ summary: 'Get order by ID' })
  @ApiParam({ name: 'id', type: 'string', description: 'Order ID' })
  @ApiResponse({ status: 200, description: 'Order details' })
  getOrderById(
    @Param('id') id: string,
    @CurrentUser() currentUser: UserEntity,
  ) {
    return this.orderService.getOrderById(id, currentUser);
  }

  // Update order status (Admin only)
  @Patch(':id/status')
  @RolesDecorator(Roles.ADMIN, Roles.SUPER_ADMIN)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiOperation({ summary: 'Update order status' })
  @ApiParam({ name: 'id', type: 'string', description: 'Order ID' })
  @ApiResponse({ status: 200, description: 'Order status updated' })
  updateOrderStatus(
    @Param('id') id: string,
    @Body() updateOrderStatusDto: UpdateOrderStatusDto,
    @CurrentUser() currentUser: UserEntity,
  ) {
    return this.orderService.updateOrderStatus(id, updateOrderStatusDto, currentUser);
  }

  // Delete order (Admin only)
  @Delete(':id')
  @RolesDecorator(Roles.ADMIN, Roles.SUPER_ADMIN)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiOperation({ summary: 'Delete order by ID' })
  @ApiParam({ name: 'id', type: 'string', description: 'Order ID' })
  @ApiResponse({ status: 200, description: 'Order deleted' })
  deleteOrder(
    @Param('id') id: string,
    @CurrentUser() currentUser: UserEntity,) {
    return this.orderService.deleteOrder(id, currentUser);
  }
}
