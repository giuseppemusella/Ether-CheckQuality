/*---------------------------- IMPORTO I FOGLI DI STILE PER PERMETTERE A WEBPACK DI GENERARE UN UNICO FILE BUNDLE.JS CONTENENTE TUTTO IL MATERIALE NECESSARIO ------------------------*/

import '../css/style.css';
import '../css/normalize.css';

/*---------------------------- DICHIARO VARIABILI E COSTANTI ------------------------*/

const apiKey = process.env.API_KEY;
const geoBtn = document.getElementById("geo-btn");
const searchBtn = document.getElementById("searchBtn");
const inputText = document.getElementById("input");
let city = document.getElementById("city-data");
let aqi = document.getElementById("aqi-data");
let aqiLevel = document.getElementById("aqi-level")
let aqiLevelBox = document.getElementById("aqi-level-box");
let healthNotes = document.getElementById("health");
let lat;
let long;


/*---------------------------- DEFINISCO LA FUNZIONE DI GESTIONE DEI DATI ACQUISITI ------------------------*/

const responseJsonAdapter = (response) => {
    let { data, status } = response;
    if (status === "error") {
        aqi.innerHTML = "n.d.";
        city.innerHTML = "Sorry, we cannot find your city";
        let lat = "n.d.";
        let long = "n.d.";
        aqiLevel.innerHTML = "n.d.";
        aqiLevelBox.style.backgroundColor = "#ebeef3";
        healthNotes.innerHTML = "n.d.";
        showMap(lat, long);
    } else {
        console.log(data);
        aqi.innerHTML = `${data.aqi}`;
        city.innerHTML = `${data.city.name}`;
        let lat = data.city.geo[0];
        let long = data.city.geo[1];
        aqiLevelText(data.aqi);
        showMap(lat, long);
    }
}

/*---------------------------- FUNZIONE PER IL RICAVO DEL VOTO SULLA QUALITA' DELL'ARIA ------------------------*/

function aqiLevelText(value) {
    if (value <= 50) {
        aqiLevel.innerHTML = "Good";
        aqiLevelBox.style.backgroundColor = "#009966";
        healthNotes.innerHTML = "Air quality is considered satisfactory, and air pollution poses little or no risk";
    } else if (value > 50 && value <= 100) {
        aqiLevel.innerHTML = "Moderate";
        aqiLevelBox.style.backgroundColor = "#ffde33";
        healthNotes.innerHTML = "Air quality is acceptable; however, for some pollutants there may be a moderate health concern for a very small number of people who are unusually sensitive to air pollution.";
    } else if (value > 100 && value <= 200) {
        aqiLevel.innerHTML = "Unhealty";
        aqiLevelBox.style.backgroundColor = "#cc0033";
        healthNotes.innerHTML = "Everyone may begin to experience health effects; members of sensitive groups may experience more serious health effects";
    } else if (value > 200 && value <= 300) {
        aqiLevel.innerHTML = "Very Unhealty";
        aqiLevelBox.style.backgroundColor = "#660099";
        healthNotes.innerHTML = "Health warnings of emergency conditions. The entire population is more likely to be affected.";
    } else if (value > 300) {
        aqiLevel.innerHTML = "Hazardous";
        aqiLevelBox.style.backgroundColor = "#7e0023";
        healthNotes.innerHTML = "Health alert: everyone may experience more serious health effects";
    }
}

/*---------------------------- INIZIALIZZO LA MAPPA ------------------------*/

let map = L.map("map", 14);

let showMap = (lat, long) => {
    const icon = L.icon({
        iconUrl: './src/img/geo-pointer.png',
        iconSize: [60, 80],
        iconAnchor: [20, 25],
    });

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(map);

    map.setView([lat, long], 14);
    L.marker([lat, long], { icon: icon }).addTo(map);
};

/*---------------------------- ACQUISIZIONE DEI DATI DI DEFAULT ( MILANO ) ------------------------*/

async function defaultLocation() {
    try {
        fetch(`https://api.waqi.info/feed/Milano/?token=${apiKey}`)
            .then(response => response.json())
            .then(json => responseJsonAdapter(json))
    } catch (e) {
        console.log('Errore nella ricezione dei dati: ' + e.message);
        aqi.innerHTML = "n.d.";
        city.innerHTML = "n.d.";
        aqiLevel.innerHTML = "n.d.";
    }
}

defaultLocation();

/*---------------------------- GEOLOCALIZZAZIONE ------------------------*/

geoBtn.onclick = function() {
    let latitude;
    let longitude;

    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition((position) => {
            let latitude = position.coords.latitude;
            let longitude = position.coords.longitude;

            try {
                fetch(`https://api.waqi.info/feed/geo:${latitude};${longitude}/?token=${apiKey}`)
                    .then(response => response.json())
                    .then(json => responseJsonAdapter(json))
            } catch (e) {
                console.log('Errore nella ricezione dei dati: ' + e.message);
                aqi.innerHTML = "n.d.";
                city.innerHTML = "n.d.";
                aqiLevel.innerHTML = "n.d.";
            }
        })
    } else { alert("Geolocalizzazione non supportata dal browser"); }
}


/*---------------------------- RICERCA PERSONALIZZATA ------------------------*/

const customSearch = () => {
    let location = document.getElementById("input").value;

    try {
        fetch(`https://api.waqi.info/feed/${location}/?token=${apiKey}`)
            .then(response => response.json())
            .then(json => responseJsonAdapter(json))
    } catch (e) {
        console.log('Errore nella ricezione dei dati: ' + e.message);
        aqi.innerHTML = "n.d.";
        city.innerHTML = "n.d.";
        aqiLevel.innerHTML = "n.d.";
    }
}

searchBtn.addEventListener('click', (e) => {
    e.preventDefault();
    customSearch();
});


inputText.addEventListener('keypress', (e) => {
    if (e.which === 13) {
        e.preventDefault();
        customSearch(e.target && e.target.value);
    }
});