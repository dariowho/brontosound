import { Entity, PrimaryGeneratedColumn, Column } from "typeorm"
import { ManyToMany, JoinTable } from "typeorm"

@Entity()
export class Song {
    @PrimaryGeneratedColumn()
    id: number

    @Column({ type: 'varchar'})
    artist: string

    @Column({ type: 'varchar'})
    title: string

    @Column({type: 'varchar'})
    storedDirName: string

    @Column({type: 'datetime', default: () => 'CURRENT_TIMESTAMP'})
    creationDate: Date

    @Column({type: 'boolean'})
    deleted: boolean

    @ManyToMany(() => SongTag, songTag => songTag.songs)
    @JoinTable()
    tags: SongTag[]
}

@Entity()
export class SongTag {
    @PrimaryGeneratedColumn()
    id: number

    @Column({type: 'varchar'})
    name: string

    @ManyToMany(() => Song, song => song.tags)
    songs: Song[]
}