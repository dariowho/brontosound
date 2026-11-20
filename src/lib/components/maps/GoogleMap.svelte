<script lang="ts">
    import { GoogleSdk } from '@beyonk/svelte-googlemaps'
    import { onMount } from "svelte";
    import { googlePlaceToPlace } from "$lib/maps/google";
    import type { Place } from "$lib/maps/place";
    import SelectedPlace from "./SelectedPlace.svelte";

    export let token: string;
    export let lat: number | undefined, lng: number | undefined;
    export let onSave: ((place: Place) => Promise<unknown>) | undefined = undefined; // without it, the map only shows the location

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
        map.center = latLng;
        mapMarker = new google.maps.Marker();
        if (onSave) {
            initPlaceSearch();
        }
    }

    // Finding a new place: in the search box, or by clicking one on the map
    function initPlaceSearch() {
        placesService = new google.maps.places.PlacesService(map);
        let autocomplete = new google.maps.places.Autocomplete(autocompleteInputElement)

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
        const place = googlePlaceToPlace(newPlace);
        await onSave!(place);
        lat = place.location.latitude;
        lng = place.location.longitude;
        newPlace = null;
    }
</script>

<GoogleSdk apiKey={token} on:ready={googlemapsReady} />


<div class="mapWrapper">
    <div class="map" style="width:100%; height: 100%;" bind:this={mapComponent}></div>

    <div class="buttonOverlay">
        {#if onSave}
            <div class="search">
                <input type="text" bind:this={autocompleteInputElement}/>
            </div>
        {/if}
        {#if newPlace}
            <div class="buttonsContainer">
                <SelectedPlace place={googlePlaceToPlace(newPlace)} onSave={handleSave} onCancel={cancelNewPlace} />
            </div>
        {/if}
    </div>
</div>

<style>
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
        pointer-events: none;
    }

    .search input {
        pointer-events: all;
    }

    .buttonsContainer {
        position: absolute;
        bottom: 0;
        z-index: 5;
        pointer-events: all;
        width: 100%;
        padding: 0.5rem;
    }
</style>