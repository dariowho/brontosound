import { BeforeInsert, Column, Entity, ManyToOne, PrimaryGeneratedColumn, ViewColumn, ViewEntity } from "typeorm";

export enum UserRole {
    VIEWER = 'viewer',
    EDITOR = 'editor',
    ADMIN = 'admin',
}

// TODO: implement in API endpoints
export const permissionsFromRole = {
    [UserRole.VIEWER]: ['songbook.read', 'live.read', 'contacts.read', 'bandSettings.read'],
    [UserRole.EDITOR]: ['songbook.read', 'live.read', 'contacts.read', 'songbook.write', 'live.write', 'contacts.write', 'bandSettings.read'],
    [UserRole.ADMIN]: ['songbook.read', 'live.read', 'contacts.read', 'songbook.write', 'live.write', 'contacts.write', 'bandSettings.read', 'bandSettings.write'],
}


@Entity()
export class User {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ type: 'varchar', unique: true })
    username: string;

    @Column({ type: 'varchar' })
    name: string;

    @Column({ type: 'varchar', nullable: true, select: false })
    passwordHash: string;

    @Column({ type: 'varchar', unique: true })
    email: string;

    @Column({ type: 'simple-enum', enum: UserRole })
    role: UserRole;
}

export abstract class UserCreatedEntity {
    @PrimaryGeneratedColumn()
    id: number

    @ManyToOne(() => User, {nullable: true, cascade: true, eager: true})
    createdBy: User

    @ManyToOne(() => User, {nullable: true})
    lastModifiedBy: User

    @Column({type: 'datetime', default: () => 'CURRENT_TIMESTAMP'})
    creationDate?: Date

    @BeforeInsert()
    setCreatedByAsLastModifiedByDefault() {
        if (!this.createdBy && this.lastModifiedBy) {
            this.createdBy = this.lastModifiedBy;
        }
    }
}
