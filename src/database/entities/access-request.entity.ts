import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  Index,
} from 'typeorm';

export enum AccessRequestStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
}

/**
 * Access Request Entity
 * Stores requests from users who want to join the platform.
 * Admins and Super Admins can approve or reject these requests.
 */
@Entity('access_requests')
export class AccessRequest {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'varchar', length: 255 })
  @Index()
  email: string;

  @Column({ type: 'text', nullable: true })
  message: string | null;

  /** If joining an existing tenant */
  @Column({ type: 'uuid', nullable: true })
  tenantId: string | null;

  /** If requesting a new tenant */
  @Column({ type: 'varchar', length: 255, nullable: true })
  newTenantName: string | null;

  @Column({
    type: 'enum',
    enum: AccessRequestStatus,
    default: AccessRequestStatus.PENDING,
  })
  @Index()
  status: AccessRequestStatus;

  /** The admin/super-admin who reviewed this request */
  @Column({ type: 'uuid', nullable: true })
  reviewedBy: string | null;

  @Column({ type: 'timestamp', nullable: true })
  reviewedAt: Date | null;

  @CreateDateColumn()
  createdAt: Date;
}
