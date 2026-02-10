import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';

/**
 * Tenant Entity
 * Represents an organization (company) using the platform.
 * This is the root of the multi-tenancy hierarchy.
 */
@Entity('tenants')
export class Tenant {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 255 })
  name: string;

  @Column({ unique: true, length: 100 })
  slug: string;

  @Column({ type: 'jsonb', nullable: true })
  settings: TenantSettings;

  @Column({ default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

/**
 * Tenant settings stored as JSONB
 */
export interface TenantSettings {
  /** Maximum number of assistants allowed */
  maxAssistants?: number;
  
  /** Maximum storage in bytes */
  maxStorageBytes?: number;
  
  /** Monthly token limit */
  monthlyTokenLimit?: number;
  
  /** Enabled LLM providers */
  allowedProviders?: string[];
  
  /** Custom branding */
  branding?: {
    primaryColor?: string;
    logoUrl?: string;
  };
}
