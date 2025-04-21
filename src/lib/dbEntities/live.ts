import { Entity, PrimaryGeneratedColumn, Column, OneToOne, OneToMany, ManyToOne, JoinColumn } from "typeorm"
import { User, UserCreatedEntity } from "./user"
import { Contact } from "./contacts"
import { Location, LocationLink } from "./location"
import type { CurrencyCode } from "$lib/currencyCodes"

@Entity()
export class LiveVenue extends UserCreatedEntity {
    @Column({ type: 'varchar'})
    name: string

    @OneToOne(() => LiveVenueLocation, liveVenueLocation => liveVenueLocation.venue, {nullable: true, cascade: true, eager: true})
    @JoinColumn()
    location?: LiveVenueLocation

    @Column({ type: 'varchar', default: ""})
    note?: string

    @OneToMany(() => LiveVenueLink, link => link.venue, {cascade: true, eager: true})
    links?: LiveVenueLink[]

    @OneToMany(() => LiveGig, gig => gig.venue)
    gigs?: LiveGig[]
}

export enum LiveVenueLinkSource {
    MANUAL = 'MANUAL',
    README = 'README',
    GOOGLE_MAPS = 'GOOGLE_MAPS',
}

@Entity()
export class LiveVenueLink extends LocationLink {
    @Column({type: 'boolean', default: false})
    hidden?: boolean = false

    @Column({ type: 'simple-enum', enum: LiveVenueLinkSource})
    source: LiveVenueLinkSource

    @ManyToOne(() => LiveVenue, venue => venue.gigs)
    venue: LiveVenue
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

export const LIVE_GIG_STATUS_NAME_FROM_ENUM = {
    [LiveGigStatus.NEW]: '💪 We are going to ask them',
    [LiveGigStatus.WAITING_VENUE]: '⌛ Proposed, waiting for venue',
    [LiveGigStatus.WAITING_BAND]: '❗ Proposed, waiting for us',
    [LiveGigStatus.CONFIRMED]: '🤝🏻 Confirmed',
    [LiveGigStatus.CANCELED]: '❌ Canceled',
    [LiveGigStatus.WAITING_PAYMENT]: '🫰🏻 Waiting for payment',
    [LiveGigStatus.COMPLETE]: '✅ Complete',
}

export const LIVE_GIG_STATUS_NAMES = [
    { value: LiveGigStatus.NEW, name: LIVE_GIG_STATUS_NAME_FROM_ENUM[LiveGigStatus.NEW]},
    { value: LiveGigStatus.WAITING_VENUE, name: LIVE_GIG_STATUS_NAME_FROM_ENUM[LiveGigStatus.WAITING_VENUE]},
    { value: LiveGigStatus.WAITING_BAND, name: LIVE_GIG_STATUS_NAME_FROM_ENUM[LiveGigStatus.WAITING_BAND]},
    { value: LiveGigStatus.CONFIRMED, name: LIVE_GIG_STATUS_NAME_FROM_ENUM[LiveGigStatus.CONFIRMED]},
    { value: LiveGigStatus.CANCELED, name: LIVE_GIG_STATUS_NAME_FROM_ENUM[LiveGigStatus.CANCELED]},
    { value: LiveGigStatus.WAITING_PAYMENT, name: LIVE_GIG_STATUS_NAME_FROM_ENUM[LiveGigStatus.WAITING_PAYMENT]},
    { value: LiveGigStatus.COMPLETE, name: LIVE_GIG_STATUS_NAME_FROM_ENUM[LiveGigStatus.COMPLETE]},
]

export interface MoneyAmount {
    amount: number,
    currency: CurrencyCode,
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
