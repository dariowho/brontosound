import { Entity, Column, PrimaryColumn } from "typeorm"

@Entity()
export class StoredDirectory {
    @Column({ type: 'varchar'})
    parentPath: string;

    @Column({ type: 'varchar'})
    name: string;

    @PrimaryColumn({ type: 'varchar'})
    path: string;

    @Column({ type: 'datetime'})
    creationDate: Date;

    @Column({ type: 'datetime'})
    modificationDate: Date;

    @Column({ type: 'json', nullable: true})
    customProperties: object;

    @Column({ type: 'datetime', nullable: true})
    lastVisited?: Date;
}