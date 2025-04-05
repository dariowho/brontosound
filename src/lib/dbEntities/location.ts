import { Column, PrimaryGeneratedColumn } from "typeorm"

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

type GoogleAddressComponent = {
    long_name: string;
    short_name: string;
    types: string[];
};

type GooglePlace = {
    place_id: string,
    geometry: any,
    formatted_address: string,
    name: string,
    address_components: GoogleAddressComponent[],
}

export function parseGooglemapsPlace(place: GooglePlace): Location {
    let result: Location = new Location();
  
    place.address_components.forEach(component => {
      if (component.types.includes("street_number")) {
        result.streetNumber = component.long_name;
      } else if (component.types.includes("route")) {
        result.street = component.long_name;
      } else if (component.types.includes("locality")) {
        result.city = component.long_name;
      } else if (component.types.includes("postal_code")) {
        result.postalCode = component.long_name;
      } else if (component.types.includes("country")) {
        result.country = component.long_name;
      }
    });

    result.latitude = place.geometry.location.lat();
    result.longitude = place.geometry.location.lng();
    result.formattedAddress = place.formatted_address;
    result.poiName = place.name;
    result.googlemapsPlaceId = place.place_id;
  
    return result;
  }