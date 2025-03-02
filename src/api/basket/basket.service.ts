import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BasketEntity } from 'src/core/entity/basket.entity';
import { ProductEntity } from 'src/core/entity/product.entity';
import { UserEntity } from 'src/core/entity/user.entity';

@Injectable()
export class BasketService {
  constructor(
    @InjectRepository(BasketEntity)
    private readonly basketRepository: Repository<BasketEntity>,
    @InjectRepository(ProductEntity)
    private readonly productRepository: Repository<ProductEntity>,
  ) { }

  // Add product to basket
  async addProduct(createBasketDto, user: UserEntity) {
    const { productId, quantity } = createBasketDto;
    const product = await this.productRepository.findOne({
      where: { id: productId, is_deleted: false },
    });
    if (!product) {
      throw new NotFoundException('Product not found');
    }

    let basketItem = await this.basketRepository.findOne({
      where: { user: { id: user.id }, product, is_deleted: false },
    });
    if (basketItem) {
      basketItem.quantity += quantity;
      basketItem.updated_by = user;
    } else {
      basketItem = this.basketRepository.create({
        user,
        product,
        quantity,
        created_by: user,
      });
    }
    return this.basketRepository.save(basketItem);
  }

  // Get all products in basket
  async getBasket(user: UserEntity) {
    return this.basketRepository.find({
      where: { user: { id: user.id }, is_deleted: false },
      relations: ['product'],
    });
  }

  // Update quantity of product in basket 
  async updateQuantity(id: string, quantity: number, user: UserEntity) {
    const basketItem = await this.basketRepository.findOne({
      where: { id, user: { id: user.id }, is_deleted: false },
    });
    if (!basketItem) {
      throw new NotFoundException('Basket item not found');
    }
    basketItem.quantity = quantity;
    basketItem.updated_by = user;
    basketItem.updated_at = Date.now();
    return this.basketRepository.save(basketItem);
  }

  // Remove product from basket (Soft delete)
  async removeProduct(id: string, user: UserEntity) {
    const basketItem = await this.basketRepository.findOne({
      where: { id, user: { id: user.id }, is_deleted: false },
    });
    if (!basketItem) {
      throw new NotFoundException('Basket item not found');
    }
    basketItem.is_deleted = true;
    basketItem.deleted_at = Date.now();
    basketItem.deleted_by = user;
    return this.basketRepository.save(basketItem);
  }

  // Clear basket (Soft delete all)
  async clearBasket(user: UserEntity) {
    const basketItems = await this.basketRepository.find({
      where: { user: { id: user.id }, is_deleted: false },
    });
    basketItems.forEach((item) => {
      item.is_deleted = true;
      item.deleted_at = Date.now();
      item.deleted_by = user;
    });
    return this.basketRepository.save(basketItems);
  }
}
