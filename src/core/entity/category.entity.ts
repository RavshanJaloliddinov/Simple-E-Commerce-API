
import { Column, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn } from 'typeorm';

@Entity('categories')
export class CategoryEntity {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    name: string;

    @ManyToOne(() => CategoryEntity, (category) => category.children, { nullable: true, onDelete: 'SET NULL' })
    parent: CategoryEntity;

    @OneToMany(() => CategoryEntity, (category) => category.parent)
    children: CategoryEntity[];
}
