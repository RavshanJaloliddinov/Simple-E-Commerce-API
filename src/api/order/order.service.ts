// src/api/order/order.service.ts
import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { OrderEntity } from 'src/core/entity/order.entity';
import { UserEntity } from 'src/core/entity/user.entity';
import { ProductEntity } from 'src/core/entity/product.entity';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderStatusDto } from './dto/update-order.dto';
import { Roles } from 'src/common/database/Enums';

@Injectable()
export class OrderService {
  constructor(
    @InjectRepository(OrderEntity)
    private readonly orderRepository: Repository<OrderEntity>,
    @InjectRepository(ProductEntity)
    private readonly productRepository: Repository<ProductEntity>,
  ) { }

  // Create Order from Basket
  async createOrder(createOrderDto: CreateOrderDto, user: UserEntity) {
    const { productId, quantity } = createOrderDto;
    const product = await this.productRepository.findOne({
      where: { id: productId, is_deleted: false },
    });
    if (!product) {
      throw new NotFoundException('Mahsulot topilmadi');
    }

    const order = this.orderRepository.create({
      user,
      product,
      quantity,
      created_by: user,
      created_at: Date.now(),
    });

    return this.orderRepository.save(order);
  }

  // Get all orders (Admin only)
  async getAllOrders() {
    return this.orderRepository.find({
      relations: ['user', 'product'],
    });
  }

  // Get orders by user
  async getUserOrders(user: UserEntity) {
    return this.orderRepository.find({
      where: { user: { id: user.id }, is_deleted: false },
      relations: ['product'],
    });
  }

  // Get order by ID
  async getOrderById(id: string, currentUser: UserEntity) {
    const order = await this.orderRepository.findOne({
      where: { id, is_deleted: false },
      relations: ['user', 'product'],
    });
    if (!order) {
      throw new NotFoundException('Buyurtma topilmadi');
    }

    // Check if the current user is the owner or an admin
    if (
      order.user.id !== currentUser.id &&
      currentUser.role !== Roles.ADMIN
    ) {
      throw new ForbiddenException('Buyurtmani ko‘rishga ruxsat yo‘q');
    }

    return order;
  }

  // Update order status (Admin only)
  async updateOrderStatus(
    id: string,
    updateOrderStatusDto: UpdateOrderStatusDto,
    currentUser: UserEntity,
  ) {
    if (currentUser.role !== Roles.ADMIN) {
      throw new ForbiddenException('Bu amalni bajarishga ruxsat yo‘q');
    }

    const order = await this.getOrderById(id, currentUser);
    order.status = updateOrderStatusDto.status;
    order.updated_by = currentUser;
    order.updated_at = Date.now();

    return this.orderRepository.save(order);
  }

  // Delete Order (Admin only)
  async deleteOrder(id: string, currentUser: UserEntity) {
    if (currentUser.role !== Roles.ADMIN) {
      throw new ForbiddenException('Bu amalni bajarishga ruxsat yo‘q');
    }

    const order = await this.getOrderById(id, currentUser);
    order.is_deleted = true;
    order.deleted_by = currentUser;
    order.deleted_at = Date.now();

    return this.orderRepository.save(order);
  }
}
