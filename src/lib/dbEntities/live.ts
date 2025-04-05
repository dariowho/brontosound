import { Entity, PrimaryGeneratedColumn, Column, OneToOne, OneToMany, ManyToOne, JoinColumn } from "typeorm"
import { User, UserCreatedEntity } from "./user"
import { Contact } from "./contacts"
import { Location } from "./location"

@Entity()
export class LiveVenue extends UserCreatedEntity {
    @Column({ type: 'varchar'})
    name: string

    @OneToOne(() => LiveVenueLocation, liveVenueLocation => liveVenueLocation.venue, {nullable: true, cascade: true, eager: true})
    @JoinColumn()
    location?: LiveVenueLocation

    @Column({ type: 'varchar', default: ""})
    note?: string

    @OneToMany(() => LiveGig, gig => gig.venue)
    gigs?: LiveGig[]
}

@Entity()
export class LiveVenueLocation extends Location {
    @OneToOne(() => LiveVenue, venue => venue.location)
    venue: LiveVenue
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
export class LiveGig extends UserCreatedEntity {
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
export class LiveGigInteraction extends UserCreatedEntity {
    @Column({ type: 'datetime'})
    date: Date

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
