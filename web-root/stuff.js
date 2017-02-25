var util = require('./util.js');
var stations = require('./marta_stations.json');

let trainMarkers = [];
const trainIcon = L.icon({
    iconUrl: 'icon.png',
    // shadowUrl: 'leaf-shadow.png',

    iconSize:     [35, 35], // size of the icon
    shadowSize:   [50, 64], // size of the shadow
    iconAnchor:   [22, 94], // point of the icon which will correspond to marker's location
    shadowAnchor: [4, 62],  // the same for the shadow
    popupAnchor:  [-3, -76] // point from which the popup should open relative to the iconAnchor
});


const interval = setInterval(() => {
    /*
     [{DESTINATION: "Airport", DIRECTION: "S", EVENT_TIME: "2/24/2017 11:04:16 PM", LINE: "GOLD",…}
     DESTINATION : "Airport"
     DIRECTION : "S"
     EVENT_TIME : "2/24/2017 11:04:16 PM"
     LINE : "GOLD"
     NEXT_ARR : "11:04:25 PM"
     STATION : "LAKEWOOD STATION"
     TRAIN_ID : "309506"
     WAITING_SECONDS : "-42"
     WAITING_TIME : "Boarding"
    * */

    fetch("http://developer.itsmarta.com/RealtimeTrain/RestServiceNextTrain/GetRealtimeArrivals?apikey=49741de7-d606-46f9-aecc-d36a1d1963e9").then(function (response) {
        const contentType = response.headers.get("content-type");
        if (contentType && contentType.indexOf("application/json") !== -1) {
            return response.json().then(function (trainData) {
                const time = new Date();

                const filteredTrainData = trainData.reduce((trains, train) => {
                    if(train.WAITING_TIME === 'Boarding' || train.WAITING_TIME === 'Arriving') {
                        trains[train.TRAIN_ID] = train;
                    } else {
                        if(train.TRAIN_ID in trains) {
                            const newTime = parseCrappyTime(time, train.NEXT_ARR);
                            const oldTime = parseCrappyTime(time, trains[train.TRAIN_ID].NEXT_ARR);
                            if(newTime > time && (oldTime > newTime || oldTime < time)
                                && !(trains[train.TRAIN_ID].WAITING_TIME === 'Boarding' || trains[train.TRAIN_ID].WAITING_TIME === 'Arriving')) {
                                trains[train.TRAIN_ID] = train;
                            }
                        } else {
                            trains[train.TRAIN_ID] = train;
                        }
                    }

                    return trains;
                }, {});
                const trainDataArr = [];
                for(const trainId in filteredTrainData) {
                    trainDataArr.push(filteredTrainData[trainId]);
                }

                const trainList = document.getElementById("train-list");
                const items = trainList.querySelectorAll('li');
                Array.prototype.forEach.call(items, item => {
                    trainList.removeChild(item);
                });

                trainData.forEach(train => {
                    const node = document.createElement("li");
                    const textnode = document.createTextNode(train.TRAIN_ID);
                    node.appendChild(textnode);
                    document.getElementById("train-list").appendChild(node);
                });

                trainMarkers.forEach(marker => {
                    map.removeLayer(marker);
                });
                trainMarkers = [];


                trainDataArr.forEach(train => {
                    const currentStation = train.STATION;
                    const station = stations.features.reduce((min, station) => {
                        const distance = levenshtein(station.properties.station_name, currentStation);

                        if(distance < min.distance) {
                            return {distance: distance, station};
                        }
                        return min;
                    }, {station: null, distance: Infinity}).station;
                    const nextStationName = train.DESTINATION;
                    const nextStation = stations.features.reduce((min, station) => {
                        const distance = levenshtein(station.properties.station_name, nextStationName);

                        if(distance < min.distance) {
                            return {distance: distance, station};
                        }
                        return min;
                    }, {station: null, distance: Infinity}).station;

                    //TODO this is fucked, time formats not consistent, won't work properly
                    const lastTime = new Date(train.EVENT_TIME);
                    let nextTime = parseCrappyTime(time, train.NEXT_ARR);

                    let p = (nextTime - time) / (nextTime - lastTime);
                    if(time > nextTime) {
                        p = 1;
                    }
                    if(train.WAITING_TIME === 'Boarding') {p = 0;}
                    // if(train.WAITING_TIME === 'Arriving') {p = 1;}

                    const c1 = station.geometry.coordinates;
                    const c2 = nextStation.geometry.coordinates;

                    //TODO this isn't correct, since the map is flat
                    //close enough for this though
                    const c1_2 = [(c2[0]-c1[0])*p + c1[0], (c2[1]-c1[1])*p + c1[1]];

                    const marker = L.marker(c1_2,  {icon: trainIcon})
                        .addTo(map)
                        .bindPopup(train.TRAIN_ID);

                    trainMarkers.push(marker);

                });
                // for(stationName in stationText) {
                //     var marker = stationMarkers[stationName];
                //     marker.bindPopup(stationName + '<br>\n' + stationText[stationName].join('<br>') + '<br>');
                // }


            });
        } else {
            console.log("Oops, we haven't got JSON!");
        }
    });

}, 1000);
function STAHP() {
    window.clearInterval(interval);
}


var map = L.map('map').setView([33.7490, -84.3880], 13);
L.tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="http://mapbox.com">Mapbox</a>'
}).addTo(map);

var stationMarkers = {};
stations.features.forEach(feature => {
    stationMarkers[feature.properties.station_name] = L.marker(feature.geometry.coordinates.reverse())
        .addTo(map)
        .bindPopup(feature.properties.station_name);
});


