import { Entity, Column, PrimaryColumn, TableInheritance, ChildEntity } from "typeorm"

@Entity()
@TableInheritance({ column: { type: "varchar", name: "type" } })
export class StoredObject {
    @Column({ type: 'varchar'})
    parentPath: string;

    @Column({ type: 'varchar'})
    name: string;

    @PrimaryColumn({ type: 'varchar'})
    path: string;

    @Column({ type: 'datetime', nullable: true})
    creationDate?: Date;

    @Column({ type: 'datetime'})
    modificationDate: Date;

    @Column({ type: 'json', nullable: true})
    customProperties: object;

    @Column({ type: 'datetime', nullable: true})
    lastVisited?: Date;
}

@ChildEntity()
export class StoredDirectory extends StoredObject {
    @Column({ type: 'varchar', nullable: true})
    foo?: Date;
}

@ChildEntity()
export class StoredFile extends StoredObject {
    @Column({ type: 'varchar'})
    content: string;
}
