import { Column, PrimaryGeneratedColumn } from "typeorm"
import { UserCreatedEntity } from "./user"

export class Location {
    @PrimaryGeneratedColumn()
    id: number

    @Column({ type: 'decimal', precision: 8, scale: 6})
    latitude: number

    @Column({ type: 'decimal', precision: 9, scale: 6})
    longitude: number
    
    @Column({ type: 'varchar'})
    formattedAddress: string

    @Column({ type: 'varchar', nullable: true})
    poiName: string

    @Column({ type: 'varchar', nullable: true})
    googlemapsPlaceId: string

    @Column({ type: 'varchar', nullable: true})
    street: string

    @Column({ type: 'varchar', nullable: true})
    streetNumber: string

    @Column({ type: 'varchar', nullable: true})
    city: string

    @Column({ type: 'varchar', nullable: true})
    postalCode: string

    @Column({ type: 'varchar', nullable: true})
    country: string
}

export enum LocationLinkType {
    // A place's page on a maps provider (PLACE_PAGE_LABELS in $lib/maps/place.ts)
    GOOGLE_MAPS_URL = 'GOOGLE_MAPS_URL',
    OPENSTREETMAP_URL = 'OPENSTREETMAP_URL',
    HERE_WEGO_URL = 'HERE_WEGO_URL',

    WEBSITE = 'WEBSITE',
    FACEBOOK = 'FACEBOOK',
    INSTAGRAM = 'INSTAGRAM',
    YOUTUBE = 'YOUTUBE',
    PHONE_NUMBER = 'PHONE_NUMBER',
    EMAIL = 'EMAIL',
}

export class LocationLink extends UserCreatedEntity{
    @Column({ type: 'simple-enum', enum: LocationLinkType})
    type: LocationLinkType

    @Column({ type: 'varchar', nullable: true})
    customLabel?: string = null

    @Column({ type: 'varchar'})
    value: string

    @Column({ type: 'varchar', nullable: true})
    note?: string = null
}
