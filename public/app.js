mapboxgl.accessToken = 'pk.eyJ1Ijoid2lsbGl3b25rYSIsImEiOiJjbHdyYnVhMDIwOGd5MmlvZ3lsZnRsbTg0In0.bSSPmW9wZJj0mqVX6z3Wsg';
var map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/mapbox/streets-v11',
    center: [-88.89653, 13.794185], // Coordenadas centrales de El Salvador
    zoom: 7
});

function geocodeAddress(address) {
    return new Promise((resolve, reject) => {
        fetch(`https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(address)}.json?access_token=${mapboxgl.accessToken}`)
            .then(response => response.json())
            .then(data => {
                if (data.features && data.features.length > 0) {
                    const coords = data.features[0].geometry.coordinates;
                    resolve({
                        latitude: coords[1],
                        longitude: coords[0]
                    });
                } else {
                    reject('Address not found');
                }
            })
            .catch(err => {
                reject(err);
            });
    });
}

function loadFleetData() {
    fetch('/flota')
        .then(response => response.json())
        .then(data => {
            if (!Array.isArray(data)) {
                throw new Error('Data is not an array');
            }

            // Limpia los marcadores existentes
            const markers = document.querySelectorAll('.mapboxgl-marker');
            markers.forEach(marker => marker.remove());

            data.forEach(vehicle => {
                new mapboxgl.Marker()
                    .setLngLat([vehicle.location.longitude, vehicle.location.latitude])
                    .setPopup(new mapboxgl.Popup().setHTML(`
                        <h3>ID: ${vehicle.id}</h3>
                        <p>Estatus: ${vehicle.status}</p>
                        <p>Nivel de gasolina: ${vehicle.performance.fuel_level}%</p>
                        <p>Velocidad: ${vehicle.performance.avg_speed} km/h</p>
                        <p>Total KM: ${vehicle.performance.total_km} km</p>
                    `))
                    .addTo(map);
            });
        })
        .catch(error => {
            console.error('Error loading fleet data:', error);
        });
}

document.getElementById('add-vehicle-form').addEventListener('submit', function(event) {
    event.preventDefault();
    const address = document.getElementById('add-address').value;
    geocodeAddress(address).then(location => {
        const vehicle = {
            id: parseInt(document.getElementById('add-id').value),
            status: document.getElementById('add-status').value,
            location: location,
            performance: {
                fuel_level: parseInt(document.getElementById('add-fuel-level').value),
                avg_speed: parseInt(document.getElementById('add-avg-speed').value),
                total_km: parseInt(document.getElementById('add-total-km').value)
            }
        };

        fetch('/flota', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(vehicle)
        }).then(response => response.json())
        .then(data => {
            console.log('Vehicle added:', data);
            loadFleetData();
        })
        .catch(error => {
            console.error('Error adding vehicle:', error);
        });
    }).catch(error => {
        console.error('Error geocoding address:', error);
    });
});

document.getElementById('update-vehicle-form').addEventListener('submit', function(event) {
    event.preventDefault();
    const vehicleId = parseInt(document.getElementById('update-id').value);
    const address = document.getElementById('update-address').value;
    geocodeAddress(address).then(location => {
        const vehicle = {
            id: vehicleId,
            status: document.getElementById('update-status').value,
            location: location,
            performance: {
                fuel_level: parseInt(document.getElementById('update-fuel-level').value),
                avg_speed: parseInt(document.getElementById('update-avg-speed').value),
                total_km: parseInt(document.getElementById('update-total-km').value)
            }
        };

        fetch(`/flota/${vehicleId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(vehicle)
        }).then(response => response.json())
        .then(data => {
            console.log('Vehicle updated:', data);
            loadFleetData();
        })
        .catch(error => {
            console.error('Error updating vehicle:', error);
        });
    }).catch(error => {
        console.error('Error geocoding address:', error);
    });
});

loadFleetData();