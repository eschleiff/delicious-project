import axios from "axios";
import { $ } from './bling';

const mapOptions = {
    center: { lat: 43.2, lng: -79.8 },
    zoom: 10
}

function loadPlaces(map, lat=43.2, lng=-79.8) {
    axios.get(`/api/stores/near?lat=${lat}&lng=${lng}`)
        .then(res => {
            const places = res.data;
            if(!places.length) {
                alert('No places found');
                return;
            }
            // bounds
            const bounds = new google.maps.LatLngBounds();
            const infoWindow = new google.maps.InfoWindow();

            const markers = places.map(place => {
                const [placeLng,placeLat] = place.location.coordinates;
                const position = { lat: placeLat, lng: placeLng };
                bounds.extend(position);
                const marker = new google.maps.Marker({ map, position });
                marker.place = place;
                return marker;
            });

            // show details on marker click
            markers.forEach(marker => marker.addListener('click', function() {
                console.log(this.place);
                const html = `
                    <div class ='popup'>
                        <a href='/store/${this.place.slug}'>
                            <img src='/uploads/${this.place.photo || "store.png"}' alt='${this.place.name}' />
                            <p>${this.place.name} - ${this.place.location.address}</p>
                        </a>
                    </div>
                `;
                infoWindow.setContent(html);
                infoWindow.open({ anchor: marker, map, shouldFocus: false });
            }));
 
            // zoom to fit bounds
            map.setCenter(bounds.getCenter());
            map.fitBounds(bounds);
        });
}

function makeMap(mapDiv) {
    if(!mapDiv) return;

    //making map
    const map = new google.maps.Map(mapDiv, mapOptions);
    loadPlaces(map);

    const input = $('[name="geolocate"]');
    const autocomplete = new google.maps.places.Autocomplete(input);
}

export default makeMap