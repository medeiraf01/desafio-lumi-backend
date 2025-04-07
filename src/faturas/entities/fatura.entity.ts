import { BaseEntity } from 'src/common/entities/base.entity';
import { Column, Entity, ManyToOne, JoinColumn } from 'typeorm';
import { Customer } from 'src/customer/entities/customer.entity';

@Entity('faturas')
export class Fatura extends BaseEntity {
  @ManyToOne(() => Customer)
  @JoinColumn({ name: 'cliente_id' })
  cliente: Customer;

  @Column({ type: 'uuid' })
  cliente_id: string;

  @Column()
  mes_referencia: string;

  @Column({ type: 'numeric', precision: 10, scale: 2 })
  energia_eletrica_kwh: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  energia_eletrica_valor: number;

  @Column({ type: 'numeric', precision: 10, scale: 2 })
  energia_scee_kwh: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  energia_scee_valor: number;

  @Column({ type: 'numeric', precision: 10, scale: 2 })
  energia_compensada_kwh: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  energia_compensada_valor: number;

  @Column({ type: 'numeric', precision: 10, scale: 2 })
  contrib_ilum_pub_municipal: number;

  @Column('jsonb', { nullable: true })
  historico_consumo: any;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  consumo_energia_eletrica_kwh: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  valor_total_sem_gd: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  total_a_pagar: number;

  @Column({ nullable: true })
  pdf_path: string;

  @Column()
  numero_instalacao: string;

  @Column()
  data_vencimento: string;
}
