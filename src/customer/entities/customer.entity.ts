import { BaseEntity } from "src/common/entities/base.entity";
import { Column, Entity } from "typeorm";

@Entity('customers')
export class Customer extends BaseEntity {
    
    

    @Column({ nullable: true })
    nome: string;

    @Column({ nullable: false })
    num_cliente: string;


}
