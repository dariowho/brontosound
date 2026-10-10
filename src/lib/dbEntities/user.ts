import { BeforeInsert, Column, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn, Unique } from "typeorm";
import { Exclude } from "class-transformer";

export enum UserRole {
    VIEWER = 'viewer',
    EDITOR = 'editor',
    ADMIN = 'admin',
}

// TODO: enforce in API endpoints (only `users.manage` is enforced so far)
export const permissionsFromRole = {
    [UserRole.VIEWER]: ['songbook.read', 'live.read', 'contacts.read', 'bandSettings.read'],
    [UserRole.EDITOR]: ['songbook.read', 'live.read', 'contacts.read', 'songbook.write', 'live.write', 'contacts.write', 'bandSettings.read'],
    [UserRole.ADMIN]: ['songbook.read', 'live.read', 'contacts.read', 'songbook.write', 'live.write', 'contacts.write', 'bandSettings.read', 'bandSettings.write', 'users.manage'],
}


@Entity()
export class User {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ type: 'varchar', unique: true })
    username: string;

    @Column({ type: 'varchar' })
    name: string;

    @Exclude()
    @Column({ type: 'varchar', nullable: true, select: false })
    passwordHash: string | null;

    // Null only for the default admin
    @Column({ type: 'varchar', unique: true, nullable: true })
    email: string | null;

    @Column({ type: 'simple-enum', enum: UserRole })
    role: UserRole;

    // Set when an admin removes the user: the row is kept so authored content keeps its attribution
    @Column({ type: 'datetime', nullable: true })
    removedDate?: Date | null;

    // Sessions carry the value they were issued with; bumping it signs the user out everywhere
    @Column({ type: 'integer', default: 0 })
    sessionVersion: number;

    @OneToMany(() => UserAccount, account => account.user)
    accounts?: UserAccount[];
}

// An external account (Google SSO; later Spotify, Apple Music, ...) linked to a User
@Entity()
@Unique(['provider', 'providerAccountId'])
export class UserAccount {
    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(() => User, user => user.accounts, { nullable: false, onDelete: 'CASCADE' })
    user: User;

    @Column({ type: 'varchar' })
    provider: string;

    // The provider's stable account id (e.g. the OAuth `sub`)
    @Column({ type: 'varchar' })
    providerAccountId: string;

    @Column({ type: 'varchar', nullable: true })
    email: string | null;

    @Column({ type: 'datetime', default: () => 'CURRENT_TIMESTAMP' })
    linkedDate?: Date;
}

export abstract class UserCreatedEntity {
    @PrimaryGeneratedColumn()
    id: number

    // No cascade: it would let any API payload overwrite the referenced User (role, passwordHash)
    @ManyToOne(() => User, {nullable: true, eager: true})
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
