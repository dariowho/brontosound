import { Entity, PrimaryGeneratedColumn, Column, OneToOne, OneToMany, ManyToOne } from "typeorm"
import { User } from "./user"
import { Contact } from "./contacts"

@Entity()
export class LiveVenue {
    @PrimaryGeneratedColumn()
    id?: number

    @Column({ type: 'varchar'})
    name: string

    @Column({type: 'datetime', default: () => 'CURRENT_TIMESTAMP'})
    creationDate?: Date

    @OneToOne(() => LiveVenueAddress, liveVenueLocation => liveVenueLocation.venue, {nullable: true})
    location?: LiveVenueAddress

    @Column({ type: 'varchar', default: ""})
    note?: string

    @OneToMany(() => LiveGig, gig => gig.venue)
    gigs?: LiveGig[]
}

@Entity()
export class LiveVenueAddress {
    @PrimaryGeneratedColumn()
    id: number

    @OneToOne(() => LiveVenue, venue => venue.location)
    venue: LiveVenue

    @Column({ type: 'varchar'})
    street: string

    @Column({ type: 'varchar'})
    city: string

    @Column({ type: 'varchar'})
    state: string

    @Column({ type: 'varchar'})
    zip: string

    @Column({ type: 'varchar'})
    country: string
}

export enum LiveGigStatus {
    NEW = 'NEW',
    WAITING_VENUE = 'WAITING_VENUE',
    WAITING_BAND = 'WAITING_BAND',
    CONFIRMED = 'CONFIRMED',
    CANCELED = 'CANCELED',
    WAITING_PAYMENT = 'WAITING_PAYMENT',
    COMPLETE = 'COMPLETE',
}

export interface MoneyAmount {
    amount: number,
    currency: string,
}

@Entity()
export class LiveGig {
    @PrimaryGeneratedColumn()
    id: number = null

    @Column({ type: 'varchar'})
    name: string

    @Column({ type: 'simple-enum', enum: LiveGigStatus})
    status: LiveGigStatus

    @Column({ type: 'datetime'})
    date: Date

    @Column({ type: 'varchar', nullable: true})
    note: string

    @ManyToOne(() => LiveVenue, venue => venue.gigs)
    venue: LiveVenue

    @OneToMany(() => LiveGigInteraction, interaction => interaction.gig)
    interactions: LiveGigInteraction[] = null

    @Column({type: 'datetime', default: () => 'CURRENT_TIMESTAMP'})
    creationDate?: Date

    @Column({ type: 'json', nullable: true})
    proposedCachet?: MoneyAmount

    @Column({ type: 'json', nullable: true})
    agreedCachet?: MoneyAmount

    @Column({ type: 'json', nullable: true})
    ReceivedCachet?: MoneyAmount
}

export enum InteractionSender {
    VENUE = 'VENUE',
    BAND = 'BAND'
}

@Entity()
export class LiveGigInteraction {
    @PrimaryGeneratedColumn()
    id: number = null

    @Column({ type: 'datetime'})
    date: Date

    @ManyToOne(() => User)
    createdBy: User

    @Column({ type: 'varchar', nullable: true})
    note: string

    @ManyToOne(() => LiveGig, gig => gig.interactions)
    gig: LiveGig

    @Column({ type: 'simple-enum', enum: InteractionSender })
    from: InteractionSender

    @ManyToOne(() => User, { nullable: true })
    bandUser: User

    @ManyToOne(() => Contact, { nullable: true })
    venueContact: Contact
}
