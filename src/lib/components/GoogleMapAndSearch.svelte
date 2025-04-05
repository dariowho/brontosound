<script lang="ts">
    import { parseGooglemapsPlace } from "$lib/dbEntities/location";
    import { Button } from "flowbite-svelte";
    import { GoogleSdk } from '@beyonk/svelte-googlemaps'
    import { onMount } from "svelte";

    export let googlemapsToken: string;
    export let lat: number, lng: number;
    export let handleUpdateLocation: CallableFunction;

    let latLng;
    $: latLng = {lat: lat, lng: lng};
    const zoom = 17;

    let google;
    let placesService;

    let newPlace = null;
    let map;
    let mapComponent;
    let mapMarker;
    let autocompleteInputElement;

    let mounted = false;
    let mapsready = false;
    let mapsinit = false;

    $: if (mapMarker && newPlace) {mapMarker.setMap(null);} else if (mapMarker && map) {mapMarker.setMap(map)}
    $: if (newPlace && newPlace.geometry) { changeLocation(newPlace.geometry.location.lat(), newPlace.geometry.location.lng(), true) } else if (map) { resetLocation(); }

    onMount(async () => {
        if (mapsready && ! mapsinit) {
            // console.log("Onmount: init maps");
            mapsinit = true;
            initMaps();
        }
        mounted = true;

    });

    function googlemapsReady() {
        // console.log("GoogleMapsReady")
        if (mounted && ! mapsinit) {
            // console.log("GoogleMapsReady: init maps");
            mapsinit = true;
            initMaps();
        }
        mapsready = true;
    }

    function initMaps() {
        //@ts-ignore
        google = window.window.google;

        // console.log("googlemaps:", google)
        // console.log("input:",autocompleteInputElement)
        map = new google.maps.Map(mapComponent, {
            center: latLng,
            zoom: zoom,
            options: {mapTypeControl: false}
        })
        placesService = new google.maps.places.PlacesService(map);
        let autocomplete = new google.maps.places.Autocomplete(autocompleteInputElement)
        // console.log("map:", map)
        map.center = latLng;
        mapMarker = new google.maps.Marker();

        map.addListener("click", (e) => {
            e.stop();
            // console.log("map clicked:", e)
            if (e.placeId) {
                updateNewPlace(e.placeId);
            } else {
                // newPlace = null;
            }
        });
        autocomplete.addListener('place_changed', () => {
            const place = autocomplete.getPlace()
            // console.log("place changed:", place);
            newPlace = place;
        });
    }

    function changeLocation(lat, lng, setPin=false) {
        const position = {lat: lat, lng: lng};
        map.setCenter(position);
        map.setZoom(zoom);

        if (setPin) {
            mapMarker.setPosition(position);
            mapMarker.setMap(map);
        }
    }

    function resetLocation() {
        // changeLocation(lat, lng, true);
        if (lat && lng) {
            // console.log("Got location")
            changeLocation(lat, lng, true);
        } else {
            // console.log("No location")
            // Default: Milan
            changeLocation(45.468503, 9.182402699999999, false);
        }
    }

    function cancelNewPlace() {
        newPlace = null;
    }

    function updateNewPlace(placeId: string) {
        placesService.getDetails(
            { placeId: placeId },
            (
                place,
                status
            ) => {
                if (
                    status === "OK" &&
                    place &&
                    place.geometry &&
                    place.geometry.location
                ) {
                    newPlace = place;
                    console.log("newPlace:",place);
                } else {
                    newPlace = null;
                }
            }
        );
    }

    async function handleSave() {
        if (! newPlace) {
            throw Error("Save action called but no place is selected. newPlace:", newPlace);
        }

        const newLocation = parseGooglemapsPlace(newPlace);

        console.log("Saving location:", newLocation);

        const result = await handleUpdateLocation(newLocation);
        lat = newLocation.latitude;
        lng = newLocation.longitude;
        newPlace = null;
        return result
    }
</script>

<GoogleSdk apiKey={googlemapsToken} on:ready={googlemapsReady} />


<div class="mapWrapper">
    <div class="map" style="width:100%; height: 100%;" bind:this={mapComponent}></div>

    <div class="buttonOverlay">
        <div class="search">
            <input type="text" bind:this={autocompleteInputElement}/>
        </div>
        {#if newPlace}
    
            <div class="buttonsContainer">
                <span class="placeDetails">
                    <span class="placeName">{newPlace.name}</span>
                    <span class="placeAddress">{newPlace.formatted_address}</span>
                </span>
                <div class="buttonsWrapper" >
                    <Button on:click={handleSave}>Save</Button>
                    <Button color="light" on:click={cancelNewPlace}>Cancel</Button>
                </div>
                
            </div>
        {/if}
    </div>
</div>

<style>
    .placeDetails {
        display: inline-block;
    }

    .placeName {
        display: block;
        font-weight: bold;
    }
    .placeAddress {
        display: block;
        font-size: small;
    }

    .mapWrapper {
        width: 100%;
        height: 100%;
    }

    .buttonOverlay {
        position: relative;
        width: 100%;
        height: 100%;
        top: -100%;
        pointer-events: none;        
    }

    .search {
        margin: 1rem;
        pointer-events: all;
    }

    .buttonsContainer {
        position: absolute;
        bottom: 0;
        z-index: 5;
        pointer-events: all;
        width: 100%;
        background: #fff9;
        padding: 1em 0;
        text-align: center;
    }
</style>