import { BaseEntity } from 'src/common/database/BaseEntity';
import { Entity, Column, OneToMany } from 'typeorm';
import { Roles } from "src/common/database/Enums";
import { BasketEntity } from './basket.entity';
import { ProductEntity } from './product.entity';
import { OrderEntity } from './order.entity';

@Entity('users')
export class UserEntity extends BaseEntity {
    @Column({ nullable: false })
    name: string;

    @Column({ unique: true, nullable: false })
    email: string;

    @Column({ nullable: false })
    password: string;

    @Column({
        type: 'enum',
        enum: Roles,
        default: Roles.USER,
    })
    role: Roles;

    @OneToMany(() => ProductEntity, (product) => product.user)
    products: ProductEntity[];

    @OneToMany(() => BasketEntity, (basketItem) => basketItem.user)
    basketItems: BasketEntity[];

    @OneToMany(() => OrderEntity, (order) => order.user)
    orders: OrderEntity[];

}
