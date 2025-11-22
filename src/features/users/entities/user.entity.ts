import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

@Entity('users')
export class User {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ type: 'varchar', length: 255 })
    name: string;

    @Column({ unique: true, type: 'varchar', length: 255 })
    email: string;

    @Column({ type: 'text', nullable: true })
    image: string | null;

    @Column({ name: 'email_verified_at', type: 'timestamptz', nullable: true })
    email_verified_at: Date | null;

    @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
    created_at: Date;

    @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
    updated_at: Date;
}
