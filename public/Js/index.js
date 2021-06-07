
// -------------- Definir mapa con Leaflet --------------------
var map = L.map('myMap').setView([3.452444, -76.402359], 11.3);	

// -------------- Añadir la capa base del mapa ----------------
var openStreet = L.tileLayer("http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",{
    maxZoom: 20,
    attribution: 'openStreet'
})
openStreet.addTo(map);

function limpiarMapa(){
    map.eachLayer(function (layer) {
        if (layer != openStreet){
            map.removeLayer(layer);
        } else {
            map.on('click', onMapClick);
        }
    });
}

// -------------------- Medir distancias ---------------------
var optionsDistance = {
    position: 'topleft',           
    unit: 'metres',                
    clearMeasurementsOnStop: true, 
    showBearings: false,           
    bearingTextIn: 'In',            
    bearingTextOut: 'Out',         
    tooltipTextFinish: 'Click para <b>finalizar la línea.</b><br>',
    tooltipTextDelete: 'Presionar SHIFT-key y click para <b>elimar el punto.</b>',
    tooltipTextMove: 'Click para dibujar y <b>mover el punto.</b><br>',
    tooltipTextResume: '<br>Presionar CTRL-key y click para <b>reanudar la línea.</b>',
    tooltipTextAdd: 'Presionar CTRL-key y click para <b>añadir un punto.</b>',
    measureControlTitleOn: 'Medir distancia',   
    measureControlTitleOff: 'Desactivar', 
    measureControlLabel: '&#8614;', 
    measureControlClasses: [],      
    showClearControl: false,        
    clearControlTitle: 'Limpiar medidas', 
    clearControlLabel: '&times',    
    clearControlClasses: [],        
    showUnitControl: false,         
    distanceShowSameUnit: false,    
    unitControlTitle: {             
        text: 'Change Units',
        metres: 'metres',
        landmiles: 'land miles',
        nauticalmiles: 'nautical miles'
    },
    unitControlLabel: {            
        metres: 'm',
        kilometres: 'km',
        feet: 'ft',
        landmiles: 'mi',
        nauticalmiles: 'nm'
    },
    tempLine: {                    
        color: '#FFD000',             
        weight: 2                  
    },          
    fixedLine: {                   
        color: '#0034CF',             
        weight: 2                  
    },
    startCircle: {                 
        color: '#FFD000',             
        weight: 1,                 
        fillColor: '#FFD000',         
        fillOpacity: 1,            
        radius: 3                  
    },
    intermedCircle: {              
        color: '#FFD000',             
        weight: 1,                 
        fillColor: '#FFD000',         
        fillOpacity: 1,            
        radius: 3                  
    },
    currentCircle: {               
        color: '#FFD000',             
        weight: 1,                 
        fillColor: '#FFD000',         
        fillOpacity: 1,            
        radius: 3                  
    },
    endCircle: {                   
        color: '#FFD000',              
        weight: 1,                  
        fillColor: '#FFD000',          
        fillOpacity: 1,             
        radius: 3                   
    },
};
var distancia = L.control.polylineMeasure(optionsDistance).addTo(map);

// --------------- Barra lateral informativa ------------------
var sidebar = L.control.sidebar('sidebar').addTo(map);

// ----------------- Coordenadas del punto --------------------
var mousePosition = new L.Control.MousePosition().addTo(map);	
var popup = L.popup();
function onMapClick(e) {
    popup
        .setLatLng(e.latlng)
        .setContent("<b>Coordenadas: </b><br>" + e.latlng)
        .openOn(map);
}

// -------------------- Editar Geovallas ---------------------
map.pm.addControls({  
    positions: {
        draw: 'bottomleft',
        edit: 'bottomright'
    },  
    drawCircle: true,  
}); 
map.pm.setLang('es');  
map.pm.setGlobalOptions({ measurements: { measurement: true, displayFormat: 'metric'}, pmIgnore: true });

// --------------------- Cargar Heatmap ----------------------
function cargarcapa () {
    document.getElementById('myMap').innerHTML = '<object data="./Datos/Heatmap.html" style="height: 610px; width: 100%"></object>'  
}

// --------------------- Funciones Vertices ------------------
function colorCluster(lab) {
    console.log('Llega al color',typeof(lab))
    return lab == 0 ? '#DF0000' :
        lab == 1 ? '#FFD000' :
        lab == 3 ? '#A92AFF' :
        lab == 5 ? '#0034CF' :
        lab == 6 ? '#FF9B00' :
        '#000000';
};

function style(feature){
    return {
        fillColor: colorCluster(feature.properties.STDLabel),
        weight: 2,
        opacity: 1,
        color: colorCluster(feature.properties.STDLabel),
        dashArray: '3',
        fillOpacity: 0.5
    };
};

var info = L.control();

info.onAdd = function (map) {
    this._div = L.DomUtil.create('div', 'info');
    this.update();
    return this._div;
};

function Vertices(verPoints){
    distancia.addTo(map)
    var geojson = L.geoJSON(verPoints, {style: style, onEachFeature: onEachFeature }).addTo(map);
    geojson.setStyle(style)

    info.update = function (props, geo) {
        var coord = []; 
        if (geo){
            for (g=0; g<= geo.coordinates[0].length-1; g++){
                if (props.Dates[g] != undefined){
                    coord.push('<b>Fecha: '+ props.Dates[g]+' :</b> ['+geo.coordinates[0][g][0]+ ' , '+ geo.coordinates[0][g][1]+']<br>');
                }
            }

            this._div.innerHTML = '<b>Información de los vértices del Clúster:</b><br>' +  (props ?
                '<b> Número: </b>' + props.STDLabel + '.<br>' + 
                '<b> Cantidad de puntos: </b>' + props.Dates.length + '<br>' +
                '<b> Vértices:</b><br>' + coord.toString().replaceAll('<br>,','<br>')
                : '');
            
        } else {
            this._div.innerHTML = ''
        }      
    };

    info.addTo(map);

    function highlightFeature(e,) {
        var layer = e.target;
    
        layer.setStyle({
            weight: 3.5,
            color: '#FAFAFA',
            dashArray: '',
            fillOpacity: 0.7
        });
    
        if (!L.Browser.ie && !L.Browser.opera && !L.Browser.edge) {
            layer.bringToFront();
        }
    
        info.update(layer.feature.properties,layer.feature.geometry);
    }

    function resetHighlight(e) {
        geojson.resetStyle(e.target);
        info.update();
    }
    
    function zoomToFeature(e) {
        map.fitBounds(e.target.getBounds());
    }
    
    function onEachFeature(feature, layer) {
        layer.on({
            mouseover: highlightFeature,
            mouseout: resetHighlight,
            click: zoomToFeature
        });
    }
}

// ---- Funciones Generales: Visualización de resultados ----
function Clusteres(clusPoints){
    distancia.addTo(map)
    var LeafIcon = L.Icon.extend({
        options: {
            iconSize:     [30, 30],
            iconAnchor:   [40, 40],
            popupAnchor:  [0, -76],
        }
    });

    var popOptionsC ={
        'maxWidth': '500',
        'maxHeight': '200',
        'className' : 'custom'
    }

    for (i=0; i <= clusPoints.features.length-1; i++) {

        var iconC = clusPoints.features[i]['properties']['icon'];
        var iconcusC = new LeafIcon({iconUrl: './Images/'+iconC})

        // Informacion
        var lonC = clusPoints.features[i]['geometry']['coordinates'];
        var latC = clusPoints.features[i]['geometry']['coordinates'];
        var clus = clusPoints.features[i]['properties']['STDLabel'];
        var datesC = clusPoints.features[i]['properties']['Dates'];
        var deltasC = clusPoints.features[i]['properties']['Deltas'];

        for (j=0; j <= lonC.length-1; j++) {
            var coordenadasC = '<b>No. Clúster: '+clus+'.<br>Coordenadas: ['+latC[j][1]+' , '+lonC[j][0]+']</b><br>'
            var minutesC = Math.round((deltasC[j]/60)*2)
            var clusContent = coordenadasC + '<b>Fecha: '+datesC[j]+'<br>Tiempo: '+ minutesC.toString()+' Minutos.</b><br>' 
            L.marker([latC[j][1],lonC[j][0]], {icon: iconcusC}).addTo(map).bindPopup(clusContent,popOptionsC).openPopup();
        }
    } 
}

function Estacionarios(stayPoints) {
    
    distancia.addTo(map)
    var LeafIcon = L.Icon.extend({
        options: {
            iconSize:     [50, 50],
            iconAnchor:   [40, 40],
            popupAnchor:  [0, -30],
        }
    });

    var popOptions ={
        'maxWidth': '500',
        'maxHeight': '200',
        'className' : 'custom'
    }
    
    for (i=0; i <= stayPoints.features.length-1; i++) {
        duos = [];
        var icon = stayPoints.features[i]['properties']['icon'];
        var iconcus = new LeafIcon({iconUrl: './Images/'+icon})

        // Informacion
        var lon = stayPoints.features[i]['geometry']['coordinates'][0];
        var lat = stayPoints.features[i]['geometry']['coordinates'][1];
        var name = stayPoints.features[i]['properties']['Name'];
        var dates = stayPoints.features[i]['properties']['Dates'];
        var deltas = stayPoints.features[i]['properties']['Deltas'];

        var coordenadas = '<b>Lugar: '+name+'</b><br><b>Coordenadas: ['+lat+' , '+lon+']</b><br><br>'

        for (j=0; j <= dates.length-1; j++){
            var minutes = Math.round((deltas[j]/60)*2)
            duos.push(['<b>Fecha: '+dates[j]+'.<br>Tiempo estacionado: '+ minutes.toString()+' Minutos.</b><br><br>'])
        } 
        
        var stayContent = coordenadas+duos.toString().replaceAll(',','');

        L.marker([lat,lon], {icon: iconcus}).addTo(map).bindPopup(stayContent,popOptions).openPopup(); 
    }
}

function Datos(dataPoints) {
    
    distancia.addTo(map)
    var LeafIcon = L.Icon.extend({
        options: {
            iconSize:     [10, 10],
            iconAnchor:   [5, 5],
            popupAnchor:  [0, -30],
        }
    });

    var popOptions ={
        'maxWidth': '500',
        'maxHeight': '200',
        'className' : 'custom'
    }
    
    for (i=0; i <= dataPoints.features.length-1; i++) {
        var iconcus = new LeafIcon({iconUrl: './Images/data.png'})

        // Informacion
        var lonD = dataPoints.features[i]['geometry']['coordinates'][0];
        var latD = dataPoints.features[i]['geometry']['coordinates'][1];
        var dateD = dataPoints.features[i]['properties']['datecreated'];

        var coordenadasD = '<b>Fecha: '+dateD+'</b><br><b>Coordenadas: ['+latD+' , '+lonD+']</b><br>'

        L.marker([latD,lonD], {icon: iconcus}).addTo(map).bindPopup(coordenadasD,popOptions).openPopup(); 
    }
}

const cargarGeoJson = async (archivo) => {
    limpiarMapa();
    await fetch('./Datos/'+archivo) //('https://geoclus.herokuapp.com/Datos/'+archivo)
    .then(function(response) {
        return response.json();
    })
    .then(function(data) {
        if (archivo == "DatosOriginales.json"){
            Datos(data);
        } else if (archivo == "Estacionarios.json"){
            Estacionarios(data);
        } else if (archivo == "Clusteres.json"){
            Clusteres(data);
        } else if (archivo == "Vertices.json"){
            Vertices(data);
        } else {
            L.geoJSON(data).addTo(map);
        }
        return data;
    });
}

function descargarGeoJson(archivo) {
    axios({
            url: ('./Datos/'+archivo), //url: ('https://geoclus.herokuapp.com/Datos/'+archivo),
            method: 'GET',
            responseType: 'blob'
    })
    .then((response) => {
        const url = window.URL
                .createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', archivo);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    })
}

// ----------------- Funciones Routing por dia -------------------

var aviso = L.control();

aviso.onAdd = function (map) {
    this._div = L.DomUtil.create('div', 'aviso');
    this.update();
    return this._div;
};

const cargarRoutes = async (archivo,dc) => {
    limpiarMapa();
    await fetch('./Datos/'+archivo) //('https://geoclus.herokuapp.com/Datos/'+archivo)
    .then(function(response) {
        return response.json();
    })
    .then(function(data) {
    
        dayRouting(data,dc)
        
    });
}

function dayRouting(routesPoints,dateCalendar){

    distancia.addTo(map)
    var LeafIcon = L.Icon.extend({
        options: {
            iconSize:     [10, 10],
            iconAnchor:   [5, 5],
            popupAnchor:  [0, -30],
        }
    });

    var popOptionsR ={
        'maxWidth': '500',
        'maxHeight': '200',
        'className' : 'custom'
    }

    var calendar = [];

    for (p=0; p <= routesPoints.features.length-1; p++) {
        var dateP = routesPoints.features[p]['properties']['datecreated'][0];
        calendar.push(dateP);
    }

    if (!calendar.includes(dateCalendar) ) {
        
        var avisoD = dateCalendar
        aviso.update = function () {
            this._div.innerHTML = '<b>Para el día ' + avisoD.toString() + ' no hay registros.</b>'     
        };
        aviso.addTo(map);
        alert("Para el día "+dateCalendar.toString()+" no hay registros.")
        
    } else {

        for (r=0; r <= routesPoints.features.length-1; r++) {

            // Informacion
            var lonR = routesPoints.features[r]['geometry']['coordinates'];
            var latR = routesPoints.features[r]['geometry']['coordinates'];
            var dateR = routesPoints.features[r]['properties']['datecreated'][0];
            var label = routesPoints.features[r]['properties']['STDLabel'];
            var hoursR = routesPoints.features[r]['properties']['hours'];
            var deltasR = routesPoints.features[r]['properties']['deltaTime'];

            if (dateR == dateCalendar){
                
                aviso.update = function () {
                    this._div.innerHTML = '<b>Para el día ' + dateR.toString() + ' hay '+ lonR.length +' registros.</b>'     
                };
                aviso.addTo(map);

                for (q=0; q <= lonR.length-1; q++) {

                    // Icono punto 
                    var iconcusR = new LeafIcon({iconUrl: './Images/Punto'+label[q].toString()+'.png'})
                    
                    // Pop-up
                    var coordenadasR = '<center><b>Día: '+dateR+'</center></b><br><b>No. Clúster:</b> '+label[q].toString()+'.<br><b>Coordenadas: </b>['+latR[q][1]+' , '+lonR[q][0]+'].<br>'
                    var minutesR = Math.round((deltasR[q]/60))
                    var routeContent = coordenadasR + '<b>Hora:</b> '+hoursR[q]+'<br><b>Tiempo en la posición:</b> '+ minutesR.toString()+' Minutos.<br>' 
                    L.marker([latR[q][1],lonR[q][0]], {icon: iconcusR}).addTo(map).bindPopup(routeContent,popOptionsR).openPopup();
                }
            }
        } 
    }
}
