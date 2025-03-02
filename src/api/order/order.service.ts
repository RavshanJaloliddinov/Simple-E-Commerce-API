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
import { ResponseTypes, Roles } from 'src/common/database/Enums';
import { responseByLang } from 'src/infrastructure/prompts/responsePrompts';

@Injectable()
export class OrderService {
  constructor(
    @InjectRepository(OrderEntity)
    private readonly orderRepository: Repository<OrderEntity>,
    @InjectRepository(ProductEntity)
    private readonly productRepository: Repository<ProductEntity>,
  ) { }

  // **1️⃣ Create Order from Basket**
  async createOrder(createOrderDto: CreateOrderDto, user: UserEntity, lang: string) {
    const { productId, quantity } = createOrderDto;
    const product = await this.productRepository.findOne({
      where: { id: productId, is_deleted: false },
    });

    if (!product) {
      throw new NotFoundException(responseByLang(ResponseTypes.PRODUCT_NOT_FOUND, lang));
    }

    const order = this.orderRepository.create({
      user,
      product,
      quantity,
      created_by: user,
      created_at: Date.now(),
    });

    await this.orderRepository.save(order);

    return { data: order, status_code: 201, message: responseByLang(ResponseTypes.CREATE, lang) };
  }

  // **2️⃣ Get all orders (Admin only)**
  async getAllOrders(lang: string) {
    const orders = await this.orderRepository.find({
      relations: ['user', 'product'],
    });

    return { data: orders, status_code: 200, message: responseByLang(ResponseTypes.FETCH_ALL, lang) };
  }

  // **3️⃣ Get orders by user**
  async getUserOrders(user: UserEntity, lang: string) {
    const orders = await this.orderRepository.find({
      where: { user: { id: user.id }, is_deleted: false },
      relations: ['product'],
    });

    return { data: orders, status_code: 200, message: responseByLang(ResponseTypes.FETCH_ALL, lang) };
  }

  // **4️⃣ Get order by ID**
  async getOrderById(id: string, currentUser: UserEntity, lang: string) {
    const order = await this.orderRepository.findOne({
      where: { id, is_deleted: false },
      relations: ['user', 'product'],
    });

    if (!order) {
      throw new NotFoundException(responseByLang(ResponseTypes.ORDER_NOT_FOUND, lang));
    }

    // **Check if the current user is the owner or an admin**
    if (order.user.id !== currentUser.id && currentUser.role !== Roles.ADMIN) {
      throw new ForbiddenException(responseByLang(ResponseTypes.FORBIDDEN, lang));
    }

    return { data: order, status_code: 200, message: responseByLang(ResponseTypes.FETCH_ONE, lang) };
  }

  // **5️⃣ Update order status (Admin only)**
  async updateOrderStatus(
    id: string,
    updateOrderStatusDto: UpdateOrderStatusDto,
    currentUser: UserEntity,
    lang: string
  ) {
    if (currentUser.role !== Roles.ADMIN) {
      throw new ForbiddenException(responseByLang(ResponseTypes.FORBIDDEN, lang));
    }

    const order = await this.orderRepository.findOne({ where: { id } });

    if (!order) {
      throw new NotFoundException(responseByLang(ResponseTypes.ORDER_NOT_FOUND, lang));
    }

    order.status = updateOrderStatusDto.status;
    order.updated_by = currentUser;
    order.updated_at = Date.now();

    await this.orderRepository.save(order);

    return { data: order, status_code: 200, message: responseByLang(ResponseTypes.UPDATE, lang) };
  }

  // **6️⃣ Delete Order (Admin only)**
  async deleteOrder(id: string, currentUser: UserEntity, lang: string) {
    if (currentUser.role !== Roles.ADMIN) {
      throw new ForbiddenException(responseByLang(ResponseTypes.FORBIDDEN, lang));
    }

    const order = await this.orderRepository.findOne({ where: { id } });

    if (!order) {
      throw new NotFoundException(responseByLang(ResponseTypes.ORDER_NOT_FOUND, lang));
    }

    order.is_deleted = true;
    order.deleted_by = currentUser;
    order.deleted_at = Date.now();

    await this.orderRepository.save(order);

    return { data: null, status_code: 200, message: responseByLang(ResponseTypes.DELETE, lang) };
  }
}
