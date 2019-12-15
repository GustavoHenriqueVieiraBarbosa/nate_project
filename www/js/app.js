// Initialize app
var myApp = new Framework7();


// If we need to use custom DOM library, let's save it to $$ variable:
var $$ = Dom7;

// Add view
var mainView = myApp.addView('.view-main', {
    // Because we want to use dynamic navbar, we need to enable it for this view:
    dynamicNavbar: true
});

// Handle Cordova Device Ready Event
$$(document).on('deviceready', function() {
    console.log("Device is ready!");

    getLocation();
    readFilePlaces();
});


// Now we need to run the code that will be executed only for About page.

// Option 1. Using page callback for page (for "about" page in this case) (recommended way):
myApp.onPageInit('about', function (page) {
    // Do something here for "about" page

})

// Option 2. Using one 'pageInit' event handler for all pages:
$$(document).on('pageInit', function (e) {
    // Get page data from event data
    var page = e.detail.page;

    if (page.name === 'about') {
        // Following code will be executed for page with data-page attribute equal to "about"
        myApp.alert('Here comes About page');
    }
})

// Option 2. Using live 'pageInit' event handlers for each page
$$(document).on('pageInit', '.page[data-page="about"]', function (e) {
    // Following code will be executed for page with data-page attribute equal to "about"
    myApp.alert('Here comes About page');
})

// -------------------------------------------------------------------------------------------------------- //

// GET LOCATION FUNCTION
function getLocation() {
    navigator.geolocation.getCurrentPosition(geoCallback, onError)
}

function geoCallback (position) {
    var latitude = position.coords.latitude;
    var longitude = position.coords.longitude;

    // PLACEHOLDER FOR INFO THAT WILL BE DISPLAYED ON HTML PAGE
    document.getElementById('latitude').innerHTML = "Latitude : " + latitude;
    document.getElementById('longitude').innerHTML = "Longitude : " + longitude;

    // PASSING LATITUDE & LONGITUDE DATA TO OPENCAGE API FUNCTION
    openCageApi(latitude, longitude);

    initMap(latitude, longitude);
}

// RETURN ERROR MESSAGE
function onError (error) {
    alert("code: "    + error.code    + "\n" + "message: " + error.message + "\n");
}


// OPENCAGE API
function openCageApi(latitude, longitude) {
    var http = new XMLHttpRequest();
    const url = 'https://api.opencagedata.com/geocode/v1/json?q='+latitude+'+'+longitude+'&key=f7998cbe707947bd8d210b640ef9ba74';
    http.open("GET", url);
    http.send();
    http.onreadystatechange = (e) => {
		var response = http.responseText;
        var responseJSON = JSON.parse(response); 
        
        var city = responseJSON.results[0].components.city;

        // RETRIEVING DATA FROM OPENCAGE API ARRAY & DISPLAY DATA IN HTML FILE
        document.getElementById('country').innerHTML = "Country : " + responseJSON.results[0].components.country;
        document.getElementById('city').innerHTML = "City : " + city;
        document.getElementById('state').innerHTML = "State : " + responseJSON.results[0].components.state;
        document.getElementById('continent').innerHTML = "Continent : " + responseJSON.results[0].components.continent;
        
        // RETRIEVING DATA FOR CURRENCY CONVERSION
        document.getElementById('currencyUsdPlaceholder').value = responseJSON.results[0].annotations.currency.iso_code;
        document.getElementById('currencyLocalPlaceholder').value = responseJSON.results[0].annotations.currency.iso_code;
        
        // PASSING CITY DATA TO OPENWEATHER API
        openWeatherApi(city);
    }

};


// OPEN WEATHER API
function openWeatherApi(city) { 
    var http = new XMLHttpRequest();
    const url = 'http://api.openweathermap.org/data/2.5/weather?q='+city+'&APPID=66794c4e0cf4a2e147448b5097a4c66b&units=metric';
    http.open("GET", url);
    http.send();
    http.onreadystatechange = (e) => {
		var response = http.responseText;
        var responseJSON = JSON.parse(response); 

        // RETRIEVING DATA FROM OPENWEATHER API ARRAY & DISPLAY DATA IN HTML FILE
        document.getElementById('weather').innerHTML = 'Weather: '+ responseJSON.weather[0].description;
        document.getElementById('temperature').innerHTML = 'Temperature: '+ responseJSON.main.temp;
        document.getElementById('pressure').innerHTML = 'Pressure: '+ responseJSON.main.pressure;
        document.getElementById('humidity').innerHTML = 'Humidity: '+ responseJSON.main.humidity;
        document.getElementById('windSpeed').innerHTML = 'Wind Speed: '+ responseJSON.wind.speed;
    }
};


// CURRENCY CONVERSION : LOCAL TO USD
function convertLocalToUsd() {
    var globalCurrency = document.getElementById('currencyUsdPlaceholder').value;
    var http = new XMLHttpRequest();
    const url = 'http://apilayer.net/api/live?access_key=942bd42230bce884fba11790c4918c12';
    http.open("GET", url);
    http.send();
    http.onreadystatechange = (e) => {
        var response = http.responseText;
        var responseJSON = JSON.parse(response);

        var currency = responseJSON.quotes["USD" + globalCurrency];
        var currencyAmount = document.getElementById('currencyEur').value;

        // DIVISION USED FOR CURRENCY CONVERSION
        var convertLocalToUsd = currencyAmount / currency;

        // ROUNDS UP ORIGINAL RESULT TO TWO DECIMAL PLACES
        var result = Math.round(convertLocalToUsd * 100) / 100;

        // RESULT DISPLAYED ON HTML FILE
        document.getElementById('currencyUsdResult').innerHTML = "$" + result;

    }
};


// CURRENCY CONVERSION : USD TO LOCAL
function convertUsdToLocal() {
    var globalCurrency = document.getElementById('currencyLocalPlaceholder').value;
    var http = new XMLHttpRequest();
    const url = 'http://apilayer.net/api/live?access_key=942bd42230bce884fba11790c4918c12';
    http.open("GET", url);
    http.send();
    http.onreadystatechange = (e) => {
        var response = http.responseText;
        var responseJSON = JSON.parse(response);

        var currency = responseJSON.quotes["USD" + globalCurrency];
        var currencyAmount = document.getElementById('currencyDol').value;

        // MULTIPLICATION FOR CURRNECY CONVERSION
        var convertUsdToLocal = currencyAmount * currency;

        // ROUNDS UP ORIGINAL RESULT TO TWO DECIMAL PLACES
        var result = Math.round(convertUsdToLocal * 100) / 100;

        // RESULT DISPLAYED ON HTML FILE
        document.getElementById('currencyLocalResult').innerHTML = "€" + result;
    }
};


// MAP FUNCTION
function initMap(lat, lng) {
    var currentPosition = {lat, lng};
    	var map = new
    google.maps.Map(document.getElementById('map'), 
    {  zoom: 15,
        center: currentPosition
    });
    // DISPLAYS MARKER AT CURRENT POSITION
    var marker = new google.maps.Marker({
        position: currentPosition,
        map: map
    });    
}


// SAVE FILE / LOCATION FUNCTION
function save() {
    window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, fileWSystemCallback, onError);
 }


function fileWSystemCallback(fs) {
    // NAME OF FILE TO CREATE
    var fileToCreate = "location_data_file.txt";
    // OPEN / CREATE THE FILE
    fs.root.getFile(fileToCreate, fileSystemOptionals, getWFileCallback, onError);
}


function getWFileCallback(fileEntry) {
    var text = document.getElementById("places").value == "" ? "" :  document.getElementById("places").value;

    // DISPLAY DATA TO HTML FILE
    text += '++'+ document.getElementById("country").innerHTML;
    text += '++'+ document.getElementById("city").innerHTML;
    text += '++'+ document.getElementById("state").innerHTML;
    text += '++'+ document.getElementById("continent").innerHTML;

    var dataObj = new Blob([text], { type: 'text/plain' });
    // FUNCTION TO WRITE DATA TO THE FILE
    writeFile(fileEntry, dataObj, text);
}


// WRITE FILE FUNCTION
function writeFile(fileEntry, dataObj, list) {
    // CREATE A FILEWRITE OBJECT FOR FILE ENTRY (log.txt)
    fileEntry.createWriter(function (fileWriter) { 
        // IF DATA OBJECT IS NOT PASSED IN, CREATE A NEW BLOB INSTEAD
        if (!dataObj) {
            dataObj = new Blob([list], { type: 'text/plain' });
        }
        fileWriter.write(dataObj);
        fileWriter.onwriteend = function() {    
            // FUNCTION TO SHOW LIST
            convertFile(list);
            console.log("Successful file write...");
        };
        fileWriter.onerror = function (e) {
            console.log("Failed file write: " + e.toString());
        };
    });
}


// READ LOCATION FILE FUNCTION
function readFilePlaces() {
    window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, fileRSystemCallback, onError);
}

function fileRSystemCallback(fs) {
    // NAME OF FILE TO CREATE
    var fileToCreate = "location_data_file.txt";
    // OPEN / CREATE THE FILE
    fs.root.getFile(fileToCreate, fileSystemOptionals, getRFileCallback, onError);
}

var fileSystemOptionals = { create: true, exclusive: false };

function getRFileCallback(fileEntry) {
    readFile(fileEntry);
}


// READ FILE ENTRY FUNCTION
function readFile(fileEntry) {
    // GET THE FILE FROM THE FILE ENTRY
    fileEntry.file(function (file) {
        // CREATE THE READER
        var reader = new FileReader();
        reader.readAsText(file);
        // CALLING FUNCTION TO CONVERT FILE TO OBJECT
        reader.onloadend = function() {
            convertFile(this.result);
        };
    }, onError);
}


// FUNCTION TO CONVERT FILE TO OBJECT
function convertFile(text) {
    document.getElementById("places").value = "";
    var file = null;
    if(text != "") {
        file = {};
        var list = text;
        document.getElementById("places").value = text;
        var arr = list.split('++');
        var arrayLength = arr.length;
        for (var i = 0; i < arrayLength; i++) {
            var fullCode = "";  
            fullCode = arr[i];
            var city = arr[i].split('--');
            file[i] = {
                name: city[0],
                country: city[1]
            }
        }
        displayLocation(file);
    }
}

// FUNCTION TO DISPLAY OBJECT DATA IN THE HTML FILE
function displayLocation(obj) {
    var htmlText = "";
    document.getElementById("location_data").innerHTML = "";

    if(obj != null) {
        for (var index in obj) {
            htmlText += '<li class="item-content">';
            htmlText += '<div class="item-inner">';
            htmlText += '<div class="item-title-row">';
            htmlText += '<div class="item-title">'+obj[index].name+'</div>';
            htmlText += '</div>';
            htmlText += '<div class="item-subtitle">'+obj[index].country+'</div>';
            htmlText += '</div>';
            htmlText += '</li>';
        }
    }
    document.getElementById("location_data").innerHTML = htmlText;
}