// comma sep for the 1,000's place to help readability
function addCommas(nStr){   
    nStr += '';
    x = nStr.split('.');
    x1 = x[0];
    x2 = x.length > 1 ? '.' + x[1] : '';
    var rgx = /(\d+)(\d{3})/;
    while (rgx.test(x1)) {
        x1 = x1.replace(rgx, '$1' + ',' + '$2');
    }
    return x1 + x2;
};

var population = new L.LayerGroup();

var map = L.map('map',{
center: [47.615, -122.3321],
zoom: 11,
scrollWheelZoom: true
});

L.tileLayer('http://tile.stamen.com/toner-lite/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: 'Map tiles by <a href="http://stamen.com">Stamen Design</a>, under <a href="http://creativecommons.org/licenses/by/3.0">CC BY 3.0</a>. Data by <a href="http://openstreetmap.org">OpenStreetMap</a>, under <a href="http://www.openstreetmap.org/copyright">ODbL</a>.'
}).addTo(map);


// control that shows state info on hover
var info = L.control();

info.onAdd = function (map) {
    this._div = L.DomUtil.create('div', 'info');
    this.update();
    return this._div;
};

info.update = function (props) {
    this._div.innerHTML =  (props ?
        '<table><tr><td> Trump Votes:</td><td>'+ Math.round(100*props.PctTrump)/100 +'%</td></tr>\
        </tr><tr><td> "No" votes:</td><td> '+ Math.round(100*props.pctNo)/100 +'%</td></tr>\
        <tr><td> Predicted "no" votes: </td><td> '+ Math.round(100*(props.pctNo - props.residual_of_current))/100 +'%</td>\
        <tr><td> Residual (prediction error): </td><td> '+ Math.round(100*props.residual_of_current)/100 +'%</td></tr> </table>'
        : 'Hover over a precinct');
};

info.addTo(map);
// var baseLayers = {
//     // maybe add option to view other map stuff?
//     "Residuals&nbsp;(prediction&nbsp;error)": residualfeatures,
// };
// var overlays = {
// };
//removed because for number of something choropleth isn't the best. it's just for rates
//L.control.layers(baseLayers, overlays, {position: 'bottomleft', collapsed: false}).addTo(map);


        function getColorForMap(d) {
    return d > 12  ? '#b35806' :
           d > 7.5  ? '#f1a340' :
           d > 2.5  ? '#fee0b6' :
           d > -2.5   ? '#f7f7f7' :
           d > -7.5  ? '#d8daeb' :
           d > -13   ? '#998ec3' :
                   '#542788';
};


function style3(feature) {
    return {
        weight: 1,
        opacity: .5,
        color: 'white',
        fillOpacity: 0.7,
        fillColor: getColorForMap(feature.properties.residual_of_current)
    };
}
    
function highlightFeature(e) {
    var layer = e.target;

    layer.setStyle({
        weight: 5,
        color: '#666',
        dashArray: '',
        fillOpacity: 0.7
    });

    if (!L.Browser.ie && !L.Browser.opera) {
        layer.bringToFront();
    }

    info.update(layer.feature.properties);
}

var geojson3;


function resetHighlight(e) {
    geojson3.resetStyle(e.target);
    info.update();
}


function onEachFeature(feature, layer) {
    layer.on({
        mouseover: highlightFeature,
        mouseout: resetHighlight,
        click: highlightFeature
    });
}

function draw_map(){
    var residualfeatures = new L.LayerGroup();
    geojson3 = L.geoJson(hoods, {
        style: style3,
        onEachFeature: onEachFeature
    }).addTo(residualfeatures);
    residualfeatures.addTo(map);
};  

draw_map()

map.attributionControl.addAttribution('By <a href="http://harrymaher.github.io" target="_blank">Harry Maher</a>. Data from King County elections: <a target="_blank" href="https://info.kingcounty.gov/KCElections/Results/web-results.aspx" >Results</a>, <a target="_blank" href="http://www.kingcounty.gov/depts/elections/elections/maps/precinct-and-district-data.aspx">Spatial Data</a>');


var legend = L.control({position: 'bottomright'});
legend.onAdd = function (map) {
    var div = L.DomUtil.create('div', 'info legend'),
        grades = [-17, -13, -2.5, 2.5, 7.5, 12],
        labels = ["<div style='text-align:center !important;'>Prediction Error of Votes<br>(Actual% - Predicted %)</div>"],
        from, to;      

    for (var i = 0; i < grades.length; i++) {
        from = grades[i];
        to = grades[i + 1];

        labels.push(
            '<i style="background:' + getColorForMap(from + 1) + '"></i> ' +
            from + (to ? '&ndash;' + to : '+'));
    }

    div.innerHTML = labels.join('<br>');
    return div;
};
legend.addTo(map);
