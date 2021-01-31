/*
The Google Maps JavaScript API geometry library provides utility functions for the computation of geometric data on the surface of the Earth. The library includes three namespaces:
spherical contains spherical geometry utilities allowing you to compute angles, distances and areas from latitudes and longitudes.

Geocoding is the process of converting addresses (like "1600 Amphitheatre Parkway, Mountain View, CA") into geographic coordinates (like latitude 37.423021 and longitude -122.083739), 
which you can use to place markers on a map, or position the map.

*/
//The window object represents an open window in a browser.
window.playPathData = {
    paused: false,
    speedMultiplier: 1, 
    changingPosition: false, 
    autofollow: true, 
    fps: 10
};

//********************* TRANSLATION and API Call FUNCTION ***************************//
//Given two LatLng objects and value between 0 and 1, you may also calculate a destination between them using the interpolate() method, 
//which performs spherical linear interpolation between the two locations, where the value indicates the fractional distance to travel along the path from the origin to the destination.

function toInterpolate(from, to, distance) {
    result = google.maps.geometry.spherical.interpolate(from, to, distance);
    //Translation
    if (result.lat() - from.lat() < 1.0E-10 && result.lng() - from.lng() < 1.0E-10) {
        result = new google.maps.LatLng(from.lat() + distance * (to.lat() - from.lat()), from.lng() + distance * (to.lng() - from.lng()));
        
        //Latitude and longitude variables
        var lat = from.lat();
        var lng = to.lng();
        var latNum = lat.toFixed(2);
        var lngNum = lng.toFixed(2);

        //Gets the latitude and longitude from the html div
        $("#lat").text(latNum);
        $("#long").text(lngNum);

        /************************* API CALLS ****************************************/

        //API calls to ozone, temperature, UV, humidity, windspeed
        var jsonUrl = "https://api.forecast.io/forecast/6b7f32cac7b68ab04a67a970f5b81be8/" + lat + "," + lng;
        $.getJSON(jsonUrl, function (data) {
            $('#ozone').text(JSON.stringify(data.currently.ozone, 2));
            $('#Temperature').text(JSON.stringify(data.currently.apparentTemperature, 2));
            $('#uv').text(JSON.stringify(data.currently.uvIndex, 2));
            $('#humidity').text(JSON.stringify(data.currently.humidity, 2));
            $('#windSpeed').text(JSON.stringify(data.currently.windSpeed, 2));
        }, "json");

        //API call for pollution and logic to get pollution rating 
        var jsonUrl = "http://api.airvisual.com//v2/nearest_city?lat=lat&lon=lng&rad=1000&key=dAL7yc4ixXiEpHhHd"
        $.getJSON(jsonUrl, function (data) {
            $('#pol').text(JSON.stringify(data.data.current.pollution.aqius, 2));
            if (data.data.current.pollution.aqius < 51) {
                var rating = document.getElementById('rating');
                rating.innerHTML = "Good";
            }
            else if (51 < data.data.current.pollution.aqius < 101) {
                var rating = document.getElementById('rating');
                rating.innerHTML = "Moderate";
            }
            else if (101 < data.data.current.pollution.aqius < 201) {
                var rating = document.getElementById('rating');
                rating.innerHTML = "Unhealthy";
            }
            else if (201 < data.data.current.pollution.aqius < 301) {
                var rating = document.getElementById('rating');
                rating.innerHTML = "Very Unhealthy";
            }
            else {
                var rating = document.getElementById('rating');
                rating.innerHTML = "Hazardous";
            }
        }, "json");
    }
    return result;
} //end of toInterpolate


//*********************************//

//Distance between destination and source
var computeDistanceBetween = google.maps.geometry.spherical.computeDistanceBetween;

function mod(dest, source) {
    return ((dest % source) + source) & source;
}
//****************** UI for maps ************************************************//

//Zoom, images, dragstarts, views 
//origin and destination is passed in through the request object

function initialize(request) {

    var overviewMap = new google.maps.Map(document.getElementById('overviewMap'), {
        disableDefaultUI: true
    });

    var followMap = new google.maps.Map(document.getElementById('followMap'), {
        disableDefaultUI: true
    });

    var stopAutoFollow = function () {
        if (window.playPathData.justSetZoom) {
            window.playPathData.justSetZoom = false;
            return
        }
        window.playPathData.autofollow = false;
    }

    google.maps.event.addListener(followMap, 'dragstart', stopAutoFollow);
    google.maps.event.addListener(followMap, 'zoom_changed', stopAutoFollow);

    var overviewDirectionsDisplay = new google.maps.DirectionsRenderer();
    overviewDirectionsDisplay.setMap(overviewMap);

    var followDirectionsDisplay = new google.maps.DirectionsRenderer({
        preserveViewport: true
    });
    followDirectionsDisplay.setMap(followMap);

    //Creates a new CarOverLay object from the carOverlay file
    //Car on the first screen 
    var overviewCar = new CarOverlay('Sideview-car.png', 64);
    overviewCar.setMap(overviewMap);
    //car on the second screen
    var followCar = new CarOverlay('Sideview-car.png', 64);
    followCar.setMap(followMap);

    var panorama = new google.maps.StreetViewPanorama(document.getElementById('panorama'), {
        disableDefaultUI: true
    });
    var directionsService = new google.maps.DirectionsService();

    //*************************************************************************//
    //Segment used everywhere is determined here

    var determineSegments = function (route) {
            var segments = [];
            var totalSteps = 0;
            for (var i = 0; i < route.legs.length; ++i) {
                var leg = route.legs[i];
                for (var j = 0; j < leg.steps.length; ++j) {
                    var step = leg.steps[j];
                    var speed = step.distance.value / step.duration.value;
                    for (var k = 0; k < step.path.length - 1; ++k) {
                        var segment = {}
                        segment.step = totalSteps;
                        segment.instructions = leg.steps[Math.min(j + 1, leg.steps.length - 1)].instructions;
                        segment.from = step.path[k];
                        segment.to = step.path[k + 1];
                        segment.distance = computeDistanceBetween(segment.from, segment.to)
                        segment.duration = segment.distance / speed;
                        segment.speed = speed;
                        segment.heading = google.maps.geometry.spherical.computeHeading(segment.from, segment.to);
                        segments.push(segment);
                    }
                    totalSteps += 1;
                }
            }
            var totalDuration = 0;
            var totalDistance = 0;
            for (var i = 0; i < segments.length; ++i) {
                totalDuration += segments[i].duration;
                totalDistance += segments[i].distance;
            }
            var eta = totalDuration;
            var distanceLeft = totalDistance;
            for (var i = 0; i < segments.length; ++i) {
                segments[i].eta = eta;
                segments[i].distanceLeft = distanceLeft;
                eta -= segments[i].duration;
                distanceLeft -= segments[i].distance;
                segments[i].totalSteps = totalSteps;
            }
            return segments;
        } //end of determine segments

//******************** //UI for distance *****************************************************//
   
    var formatDistance = function (distance) {
        var unit = 'm';
        distance = Math.round(distance);
        if (distance >= 1000) {
            distance /= 1000;
            distance = distance.toFixed(2);
            unit = 'km';
        }
        return distance + '&nbsp' + unit;
    }
    var updateCar = function (newPosition, newHeading) {
            var timeout = 1000 / window.playPathData.fps;
            overviewCar.updatePosition(newPosition, newHeading, timeout);
            followCar.updatePosition(newPosition, newHeading, timeout);
            overviewCar.draw();
            followCar.draw();
    }

    //Dashboard UI - Speed, Distance
    var updateDashboard = function (data, segment) {
            if (segment === undefined) return;
            var length = data.segments[0].distanceLeft;
            var distance = length - segment.distanceLeft + data.t;
            var eta = segment.eta - segment.duration * data.t / segment.distance;
            var elapsed = data.segments[0].eta - eta;
            document.getElementById('playPauseButton').value = window.playPathData.paused ? '▶' : '▮▮';
            document.getElementById('autofollow').checked = window.playPathData.autofollow;
            document.getElementById('distance').innerHTML = formatDistance(distance) + ' / ' + formatDistance(length);
            document.getElementById('speed').innerHTML = Math.round(segment.speed * 3.6) + '&nbsp;km/h or ' + Math.round(segment.speed * 2.23694) + '&nbsp;mph';
            if (data.speedMultiplier != 1) document.getElementById('speed').innerHTML += ' (x' + data.speedMultiplier + ')';
        }

//*************************************************************************//
//To take speed data from the window and and increase car speed by interpolation 
    var playPath = function () {
            var data = window.playPathData;
            var segment = null;
            while (true) {
                segment = data.segments[data.segment];
                if (data.t < 0) {
                    if (data.segment > 0) {
                        data.segment -= 1;
                        data.t = data.segments[data.segment].distance + data.t;
                    }
                    else {
                        data.t = 0;
                    }
                }
                else if (data.t >= segment.distance) {
                    if (data.segment < data.segments.length - 1) {
                        data.segment += 1;
                        data.t -= segment.distance;
                    }
                    else {
                        data.t = segment.distance;
                        break;
                    }
                }
                else {
                    break;
                }
            }
            //Call update function after segment has been set
            updateDashboard(data, segment);
            if (!data.paused && segment !== undefined) {
                var heading = segment.heading;
                if (data.heading === undefined) {
                    data.heading = heading;
                }
                else {
                    data.heading = data.heading + 2 * (heading - data.heading) / data.fps;
                }

                //Call toInterpolate for translation and interpolation after taking in window data
                //To, from, distance
                var interpolated = toInterpolate(segment.from, segment.to, data.t / segment.distance);
                panorama.setPosition(interpolated);
                panorama.setPov({
                    heading: heading
                    , pitch: 0
                });

                //Update car using update position
                updateCar(interpolated, data.heading);

                //Speed and zoom adjustment
                if (data.autofollow) {
                    window.playPathData.justSetZoom = true;
                    followMap.setZoom(Math.round(-2 * segment.speed / 27 + 164 / 9));
                    followMap.panTo(interpolated);
                }
                data.t += data.speedMultiplier * (segment.speed / data.fps);
            }

            //The setTimeout() method calls a function or evaluates an expression after 1000 milliseconds.
            setTimeout(function () {
                playPath(data);
            }, 1000 / data.fps);
        } //end of playPath

//*************************************************************************//

    directionsService.route(request, function (response, status) {
        if (status == google.maps.DirectionsStatus.OK) {
            var data = window.playPathData;
            data.segments = determineSegments(response.routes[0]);
            data.segment = 0;
            data.t = 0;
            overviewDirectionsDisplay.setDirections(response);
            followDirectionsDisplay.setDirections(response);
            playPath();
            document.getElementById('searchControls').style.display = 'none';
        }
    });
}
//*************************************************************************//
//To increase and decrease speed of the car on the UI
function speedUp() {
    var data = window.playPathData;
    if (data.speedMultiplier >= 1) data.speedMultiplier *= 2;
    else if (data.speedMultiplier < -1) data.speedMultiplier /= 2;
    else data.speedMultiplier = 1;
}

function slowDown() {
    var data = window.playPathData;
    if (data.speedMultiplier > 1) data.speedMultiplier /= 2;
    else if (data.speedMultiplier <= -1) data.speedMultiplier *= 2;
    else data.speedMultiplier = -1;
}





//Get Place value from UI, the source and destination 
function goOnARoadtrip() {
    //Object to grab origin and destination
    var request = {
        origin: document.getElementById('origin').value, 
        destination: document.getElementById('destination').value, 
        travelMode: google.maps.TravelMode.DRIVING, 
        avoidHighways: false, 
        avoidTolls: true
    };

    //Sends request object to initialize function
    initialize(request);
    return false;
}