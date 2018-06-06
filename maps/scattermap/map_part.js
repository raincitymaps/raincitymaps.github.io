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
        x_prop = document.getElementById('x_dataset').value.split(";")[0]
        y_prop = document.getElementById('y_dataset').value.split(";")[0]
        x_title = document.getElementById('x_dataset').value.split(";")[1]
        y_title = document.getElementById('y_dataset').value.split(";")[1]
    this._div.innerHTML =  (props ?
        /// these props are wrong because need to divide by "b"
        '<table><tr><td>'+x_title+' votes:</td><td>'+ Math.round(props[x_prop]/props["b"] * 10000)/100 +'% ('+props[x_prop] +')</td></tr>\
        </tr><tr><td>'+y_title+' votes:</td><td> '+ Math.round(props[y_prop]/props["b"] * 10000)/100 +'% ('+props[y_prop] +')</td></tr>\
        <tr><td> Predicted '+y_title+' votes: </td><td> '+ Math.round(100*(props[y_prop]/props["b"] * 100 - props.residual_of_current))/100 +'% ('+ Math.round(((props[y_prop]/props["b"] * 100 - props.residual_of_current))/100 * props["b"])+')</td>\
        <tr><td> Residual (prediction error): </td><td> '+ Math.round(100*props.residual_of_current)/100 +'%</td></tr>\
        <tr><td> Res. Standard Dev.:</td><td>'+ Math.round(100*props.std_dev_of_residual)/100+'</td></tr></table>'
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

// fix?
        function getColorForMap(d) {
    return d > 2  ? '#b35806' :
           d > 1  ? '#f1a340' :
           d > .5  ? '#fee0b6' :
           d > -.5   ? '#f7f7f7' :
           d > -1  ? '#d8daeb' :
           d > -2   ? '#998ec3' :
                   '#542788';
};


function style(feature) {
    return {
        weight: 1,
        opacity: .5,
        color: 'white',
        fillOpacity: 0.7,
        className: feature.properties[UID].replace(" ", ""), // this should be whatever the unique identifier is
        fillColor: getColorForMap(feature.properties.std_dev_of_residual)
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

    // highlight circle of hovered element if on the plot
    try{
    document.getElementById(layer.feature.properties[UID]).style.opacity = 1
    document.getElementById(layer.feature.properties[UID]).style.fill = "black";
    }catch(err){
        //console.log(err)
    }
}

var geojson;


function resetHighlight(e) {
    var layer = e.target;

    // un-highlight circle as hover changes if on plot
    try{
    document.getElementById(layer.feature.properties[UID]).style.opacity = .2;
    document.getElementById(layer.feature.properties[UID]).style.fill = "#7A99AC";
    }catch(err){
        //console.log(err)
    }
    geojson.resetStyle(e.target);
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
    geojson = L.geoJson(precincts, {  // precincts needs to be whatever we're calling geojson
        style: style,
        onEachFeature: onEachFeature
    }).addTo(residualfeatures);
    residualfeatures.addTo(map);
};  

draw_map()

map.attributionControl.addAttribution('By <a href="http://harrymaher.github.io" target="_blank">Harry Maher</a>. Data from King County elections: <a target="_blank" href="https://info.kingcounty.gov/KCElections/Results/web-results.aspx" >Results</a>, <a target="_blank" href="http://www.kingcounty.gov/depts/elections/elections/maps/precinct-and-district-data.aspx">Spatial Data</a>');


var legend = L.control({position: 'bottomright'});
legend.onAdd = function (map) {
    min = (Math.round(data.min*10)/10);
    var div = L.DomUtil.create('div', 'info legend'),
        grades = [min, -2, -1, -.5, .5, 1, 2,],
        labels = ["<span style='text-align:center !important; display:inline-block !important;'>Residual<br>Standard Deviations</span>"],
        from, to;      

    for (var i = 0; i < grades.length; i++) {
        from = grades[i];
        to = grades[i + 1];

        labels.push(
            '<i style="background:' + getColorForMap(from + .01) + '"></i> ' +
            from + (to ? '&nbsp; &ndash; &nbsp;' + to : '+'));
    }

    div.innerHTML = labels.join('<br>');
    return div;
};
legend.addTo(map);
