import { Column, Entity } from "typeorm";
import { UserCreatedEntity } from "./user";

// A Backline app linked to its creator's account. It signs in with a token, of which only the hash is kept
@Entity()
export class BacklineLink extends UserCreatedEntity {
    @Column({ type: 'varchar', unique: true })
    tokenHash: string;
}
