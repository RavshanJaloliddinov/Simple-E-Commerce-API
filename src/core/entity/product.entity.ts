import { Column, Entity, ManyToOne, OneToMany } from 'typeorm';
import { BaseEntity } from '../../common/database/BaseEntity';
import { ProductStatus } from 'src/common/database/Enums';
import { BasketEntity } from './basket.entity';
import { UserEntity } from './user.entity';
import { OrderItemEntity } from './order-item.entity';
import { CategoryEntity } from './category.entity';

@Entity('product')
export class ProductEntity extends BaseEntity {
    @Column({ type: 'varchar', length: 255 })
    name: string;

    @Column({ type: 'text', nullable: true })
    description: string;

    @Column({ type: 'integer' })
    price: number;

    @Column({ type: 'int', default: 0 })
    stock: number;

    @Column({ type: 'enum', enum: ProductStatus, default: ProductStatus.AVAILABLE })
    status: ProductStatus;

    @Column({ type: 'varchar', nullable: true })
    image: string;

    @ManyToOne(() => UserEntity, (user) => user.products)
    user: UserEntity;

    @OneToMany(() => BasketEntity, (basketItem) => basketItem.product)
    basketItems: BasketEntity[];

    @OneToMany(() => OrderItemEntity, (orderItem) => orderItem.product)
    orderItems: OrderItemEntity[];

    @ManyToOne(() => CategoryEntity, (category) => category.products, { onDelete: 'SET NULL', nullable: true })
    category: CategoryEntity;
}
