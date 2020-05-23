$(function(){
	// Constantes 
	const RED = "#FF0000";
	const ORANGE = "#E99400";
	const GREEN = "#00FF00";
	
	
	// Bloquear botón derecho ratón en página 
	$(document).bind("contextmenu", function(e){
		return false;
	});
	// Comprobar si es móvil o tableta
	window.mobileAndTabletCheck = function() {
		let check = false;
		(function(a){if(/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino|android|ipad|playbook|silk/i.test(a)||/1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0,4))) check = true;})(navigator.userAgent||navigator.vendor||window.opera);
		return check;
	};
	
	// Varibales Globales
		// Cosas de Google
	var gMarkerOrigen;
	var gMarkerDesti;
	var gMap;
	var gLatLon;
	var gDirectionsRender;
	var gDirectionsService;
	var gService;
		// Propias
	var rutasAlternas;
	//var labels = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
	var labels = 'AB';
	var labelIndex = 0;
	var colors = ['red', 'blue', 'green', 'black', 'white'];
	var coords = [];
	var minDistancia = 0;
	

	navigator.geolocation.getCurrentPosition(success, error);

	function error(){
		console.error("No esta habilitado la geolocalización");
	};

	function success(position) {
				
		var lat = position.coords.latitude;
		var lon = position.coords.longitude;
		
		var geocoder = new google.maps.Geocoder();
		
		gLatLon = new google.maps.LatLng(lat,lon);
		
		gDirectionsRenderer = new google.maps.DirectionsRenderer;
		gDirectionsService = new google.maps.DirectionsService;
		gService = new google.maps.DistanceMatrixService();
		
		var myStyles = [{
			featureType: 'poi',
			elementType: 'labels',
			stylers: [{ visibility: 'off' }]
		}];
			
		var objConfig = {
			zoom : 17,
			center: gLatLon,
			streetViewControl: false,
			mapTypeControl:false,
			fullscreenControl: false,
			styles: myStyles
		}
		
		gMap = new google.maps.Map(map, objConfig);
				
		
		var transitLayer = new google.maps.TransitLayer();
		transitLayer.setMap(gMap);

		
		gMarkerOrigen = new google.maps.Marker({
			position: gLatLon,
			map: gMap,
			label: labels[0],
			icon: "https://maps.google.com/mapfiles/ms/icons/red-dot.png"
		});
		
		gMarkerDesti = new google.maps.Marker({
			map:gMap
		});
		
		
		
		
		gMap.addListener('touchstart', obrirMenu2);
		
		function obrirMenu2(ev){
			alert(ev.touches);
		}
		
		gMap.addListener('rightclick', obrirMenu);
		
		function obrirMenu(mapsMouseEvent) {
			
			$('#contextMenu').css('display','block');
			$('#contextMenu').css('zindex',10);
			$('#contextMenu').css('left', event.clientX + 'px');
			$('#contextMenu').css('top', event.clientY + 'px');
		
			gLatLon = mapsMouseEvent.latLng; 
		}
		
		$('#liOrigen').click(function(){
			$('#liOrigen').data('semafor', true);
			gMarkerOrigen.setMap(null);
			gMarkerOrigen = new google.maps.Marker({
				position: gLatLon,
				map:gMap,
				label: labels[0],
				icon: "https://maps.google.com/mapfiles/ms/icons/red-dot.png"
			});	
			$('#contextMenu').css('display','none');
			
			$('#origen').data('lat', gLatLon.toString());
			
			geocodeAddress('#origen', geocoder, gMap);
			$('#liOrigen').data('semafor', false);
		});
		
		$('#liDesti').click(function(){
			$('#liDesti').data('semafor', true);
			gMarkerDesti.setMap(null);
			gMarkerDesti = new google.maps.Marker({
				position: gLatLon,
				map:gMap,
				label: labels[1],
				icon: "http://maps.google.com/mapfiles/ms/icons/blue-dot.png"
			});	
			$('#contextMenu').css('display','none');
			geocodeAddress('#desti', geocoder, gMap);
			$('#liDesti').data('semafor', false);
		});
		
		
		
		gMap.addListener('click', function(mapsMouseEvent){
			$('#contextMenu').css('display','none');
		});
		
		

		$('#origen').blur(function(){
			if ($('#origen').val().length > 0) {
				geocodeAddress('#origen',geocoder, gMap);
			}
		});


		$('#desti').blur(function(){
			if ($('#desti').val().length > 0) {
				geocodeAddress('#desti', geocoder, gMap);
			}
		});
		
		
	};
	$('#indata').click(function(){
		console.log("HAS HECHO CLICK");
	
		//var d = { name : "Miquel", email : "Miquel@gmail.com" };
        $.ajax({
                url : "/addRoute",
                //async: false,
		data : d,
                success : function(response){
                       //codigo de exito
                       console.log("Good");
                       console.log(response);
                },
                error: function(response, status, error){
                       //codigo error
                       console.log("Bad");
                       console.log(response);
                       console.log(status);
			console.log(error);
                }
        });
	});

	$('#enviar').click(function(){
		let transOptions;
		if ($('#hora').val().length > 0 && $('#datepicker').val().length > 0){		
			let dia = parseInt($('#datepicker').val().split('/')[0]);
			let mes = parseInt($('#datepicker').val().split('/')[1]) - 1;
			let any = parseInt($('#datepicker').val().split('/')[2]);
			let hor = parseInt($('#hora').val().split(':')[0]);
			let min = parseInt($('#hora').val().split(':')[1]);
			
			let data = new Date(any, mes, dia, hor, min);
			transOptions = {
				departureTime: data,
				modes: ['BUS', 'RAIL']
			};	
		} else {
			transOptions = {
				modes: ['BUS', 'RAIL']
			};
		}
		
		gDirectionsService.route({
			origin: $('#origen').val(),
			destination: $('#desti').val(),
			travelMode: 'TRANSIT',
			transitOptions: transOptions,
			provideRouteAlternatives: true
			
		}, async function(response, status){
			if(status == 'OK'){
				
				gService.getDistanceMatrix({
					origins: [$('#origen').val()],
					destinations: [$('#desti').val()],
					travelMode: 'TRANSIT',
					transitOptions: transOptions,
				}, callback);
				
				await sleep(2000);
					
				console.log(response);
				$.each(rutasAlternas, function(ind, val){
					val.setMap(null);
					val.setPanel(null);
				});
				
				rutasAlternas = [];
				gMarkerOrigen.setMap(null);
				gMarkerDesti.setMap(null);
				///////////////////////////////////////////////////////////////////
	//			rutasAlternas = new google.maps.DirectionsRenderer({
	//												directions: response,
	//												//routeIndex: i,
	//												//polylineOptions: { visible: false }
	//											});
	//			rutasAlternas.setMap(gMap);
	//			rutasAlternas.setPanel(document.getElementById('right-panel'));
				///////////////////////////////////////////////////////////////////
				for (var i = 0; i < response.routes.length; i++){
					console.log(response.routes[i]);
					/*for(var j=0;j < response.routes[i].overview_path.length; j++){
						//console.log("Coords = "+response.routes[i].overview_path[j].toString());
						coords.push(response.routes[i].overview_path[j].toString());
					}		*/			
					let dist = parseInt(response.routes[i].legs[0].distance.text.split(" ")[0]);
					console.log(response.routes[i].legs[0].distance.text);
					console.log(typeof response.routes[i].legs[0].distance.text);
					console.log(dist);
					console.log(typeof dist);
					console.log("minDist + 5 ", minDistancia + 5);
					console.log("dist > minDistancia + 5" , dist > minDistancia + 5);
					
					if(dist < minDistancia + 5){
						/*rutasAlternas[i] = new google.maps.DirectionsRenderer({
											directions: response,
											routeIndex: i,
										});
						rutasAlternas[0].setMap(gMap);
						rutasAlternas[0].setPanel(document.getElementById('right-panel'));*/
						gDirectionsRenderer = new google.maps.DirectionsRenderer({
													directions: response,
													routeIndex: i,
													//polylineOptions: { visible: false }
												});
						rutasAlternas.push(gDirectionsRenderer);
	
					}
					rutasAlternas[0].setMap(gMap);
					rutasAlternas[0].setPanel(document.getElementById('right-panel'));	
					//opcion = document.getElementById('adp-listsel');
				}
				//pintarRuta();
			
				$('#right-panel').css('display', 'block').css('width','33%');
				$('#map').css('width', '66%');
				
			} else {
				console.error('Directions request failed due to ' + status);
			}
		});	
	});
	
	function callback(response, status){		
		if(status == 'OK'){
			var origins = response.originAddresses;
			var destinations = response.destinationAddresses;
			
			for (var i = 0; i < origins.length; i++) {
				var results = response.rows[i].elements;
				for (var j = 0; j < results.length; j++) {
					var element = results[j];
					var distance = element.distance.text;
					console.log("Distance : ", distance);
					let dist = parseInt(element.distance.text.split(" ")[0]);
					minDistancia = dist;
					var duration = element.duration.text;
					console.log("Duration : ", duration);
					var from = origins[i];
					console.log("From : ", from);
					var to = destinations[j];
					console.log("To : ", to);
				}
			}

			
		} else {
			console.error("Error: " + status);
		}
	}
	
	
	function geocodeAddress(place, geocoder, map){
		console.log("GeocodeAddress");
		if( $('#liOrigen').data('semafor') || $('#liDesti').data('semafor')){
			console.log("Por ratón");
			geocoder.geocode({'location':gLatLon}, function(results, status){
				if (status == 'OK'){
					/*console.log("REsultats : ");
					console.log(results);*/
					if (results[0]){
						$(place).val(results[0].formatted_address);
					} else {
						window.alert("No s'han trobat resultats.");
					}
				} else {
					alert("Geocode was not successful for the following reason: " + status);
				}
			});
			
		} else {
			var address = $(place).val();
			geocoder.geocode({'address':address}, function(results, status){
				if (status == 'OK'){
					map.setCenter(results[0].geometry.location);
					if(place == '#origen') { 
						gMarkerOrigen.setMap(null);
						gMarkerOrigen = new google.maps.Marker({
							map: map,
							label: labels[0],
							position: results[0].geometry.location,
							icon: "https://maps.google.com/mapfiles/ms/icons/red-dot.png"
						});
					} else { 
						gMarkerDesti.setMap(null);
						gMarkerDesti = new google.maps.Marker({
							map: map,
							label: labels[1],
							position: results[0].geometry.location,
							icon: "https://maps.google.com/mapfiles/ms/icons/blue-dot.png"
						});
					}
				} else {
					alert("Geocode was not successful for the following reason: " + status);
				}
			});
		}
	}
	
	$('#guardar').click(function(){
		
		console.log("Guardar");
		let opcion = document.getElementsByClassName('adp-listsel')[0].getAttributeNode('data-route-index').value;		 
		console.log(opcion);
		
		let rutaSel = rutasAlternas[0].directions.routes[opcion].legs;
		
		console.log(rutaSel);
		
		let startLoc = rutaSel[0].start_location.toString();
		let endLoc = rutaSel[0].end_location.toString();
		let depTime = rutaSel[0].departure_time.text
		let depTimeHora = parseInt(depTime.split(":")[0]);
		let depTimeMin = parseInt(depTime.split(":")[1]);
		let duration = parseInt(rutaSel[0].duration.text.split(" ")[0]);
		let distance = parseFloat(rutaSel[0].distance.text.split(" ")[0]);
		let path = new Array();
		let path2 = new Array();
		
		/*$.each(rutaSel[0].steps , function(ind, val){
			console.log("Idex : ",ind);
			console.log("Valor : ", val);
			path[ind]
			$.each(val.path, function(ind2, val2){
				console.log("val2 = ", val2.toString());
				path[ind]
			});
		});*/
		
		/*let route = {
			start_location : ,
			end_location : ,
			departure_time : {
					hora :
					minuts :,
			duration : ,
			distance : ,
			steps : [
						{ 
							travel_mode : ,
							path : []
						}
					]
		}*/
		
		/*let pool;
		const createPool = async() => {
			pool = await mysql.createPool({
				user: 
		*/
		
		
		
		
		
		
		
		/*let ind = rutasAlternas[0].getRouteIndex();
		console.log("Printando coordenadas");
		for( let i =0; i<rutasAlternas[ind].directions.routes[ind].overview_path.length; i++){
			console.log(rutasAlternas[ind].directions.routes[ind].overview_path[i].toString());
		}
		
		console.log("Hora : ", $('#hora').val());
		console.log("Dia : ", $('#datepicker').val());*/
		
	});
	


	//Carrer de Batista i Roca, 11A, 08912 Badalona, Barcelona, España
	//Gran Via de les Corts Catalanes, 1097, 08020 Barcelona, España
	
	$('#pintar').click(pintarRuta);
	
	
	function pintarRuta(){
		console.log("Pintar Ruta");
		
		let ind = rutasAlternas[0].getRouteIndex();
		console.log(ind);
		for (let i=0; i<rutasAlternas[ind].directions.routes[ind].legs[0].steps.length; i++){
		
			
			let color;
			if (i % 2 == 0){ color = ORANGE;
			} else { color = RED; } 
				
			let path = rutasAlternas[ind].directions.routes[ind].legs[0].steps[i].path;
					
			console.log("Color : ", color);
				
			let paths2 = new Array();

			for (let b = 0; b < path.length; b++){
				paths2.push(path[b]);
			}

			let p = new google.maps.Polyline({
				path: paths2,
				geodesic: true,
				strokeColor: color,
				strokeOpacity: 1.0,
				strokeWeight: 5
			});
			
			p.setOptions({map: gMap});
				
		}
	}
	
	
	
	function sleep(ms) {
		return new Promise(resolve => setTimeout(resolve, ms));
	}
	
	$.datepicker.regional["es"] = {
		closeText: 'Cerrar',
		/*prevText: '<Ant',
		nextText: 'Sig>',*/
		currentText: 'Hoy',
		monthNames: ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
		'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'],
		monthNamesShort: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun',
		'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'],
		dayNames: ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'],
		dayNamesShort: ['Dom', 'Lun', 'Mar', 'Mié;', 'Juv', 'Vie', 'Sáb'],
		dayNamesMin: ['Do', 'Lu', 'Ma', 'Mi', 'Ju', 'Vi', 'Sá'],
		weekHeader: 'Sm',
		dateFormat: 'dd/mm/yy',
		firstDay: 1,
		isRTL: false,
		showMonthAfterYear: false,
		yearSuffix: '',
		minDate: 0
	};
	
	$.datepicker.setDefaults($.datepicker.regional["es"]);
	$( "#datepicker" ).datepicker();
	
	

});
		