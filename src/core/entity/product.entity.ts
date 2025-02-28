import { Column, Entity, ManyToOne, OneToMany } from 'typeorm';
import { BaseEntity } from 'src/common/database/BaseEntity';
import { ProductStatus } from 'src/common/database/Enums';
import { BasketEntity } from './basket.entity';
import { UserEntity } from './user.entity';
import { OrderEntity } from './order.entity';

@Entity('product')
export class ProductEntity extends BaseEntity {
    @Column({ type: 'varchar', length: 255 })
    name: string;

    @Column({ type: 'text', nullable: true })
    description: string;

    @Column({ type: 'decimal', precision: 10, scale: 2 })
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

    @OneToMany(() => OrderEntity, (order) => order.product)
    orders: OrderEntity[];

}
