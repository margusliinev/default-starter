import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { Provider } from '../../../common/enums/provider';
import { User } from '../../users/entities/user.entity';

@Entity('accounts')
export class Account {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ name: 'user_id', type: 'uuid' })
    user_id: string;

    @Column({ type: 'enum', enum: Provider })
    provider: Provider;

    @Column({ name: 'provider_id', type: 'varchar', length: 255, nullable: true })
    provider_id: string | null;

    @Column({ type: 'varchar', length: 255, nullable: true })
    password: string | null;

    @Column({ name: 'access_token', type: 'text', nullable: true })
    access_token: string | null;

    @Column({ name: 'refresh_token', type: 'text', nullable: true })
    refresh_token: string | null;

    @Column({ name: 'access_token_expires_at', type: 'timestamptz', nullable: true })
    access_token_expires_at: Date | null;

    @Column({ name: 'refresh_token_expires_at', type: 'timestamptz', nullable: true })
    refresh_token_expires_at: Date | null;

    @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
    created_at: Date;

    @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
    updated_at: Date;

    @ManyToOne(() => User, { onDelete: 'CASCADE', onUpdate: 'CASCADE' })
    @JoinColumn({ name: 'user_id' })
    user: User;
}
