$(function(){
	// Constantes
	const RED = "#FF0000";
	const ORANGE = "#E99400";
	const YELOW = "#E6D83E";
	const GREEN = "#00FF00";
	colors = [GREEN, YELOW, ORANGE, RED];

	// Bloquear botón derecho ratón en página
	$(document).bind("contextmenu", function(e){
		return false;
	});
	
	netejaForm();

	// Varibales Globales
		// Cosas de Google
	var gMarkerOrigen;
	var gMarkerDesti;
	var gMap;
	var gLatLon;
	var gDirectionsRender;
	var gDirectionsService;
	var gService;
	var gLatOrigen;
	var gLngOrigen;
		// Propias
	var rutasAlternas;
	var labels = 'AB';
	var labelIndex = 0;
	var coords = [];
	var minDistancia = 0;
	var densitats;
	var minWalk;
	var medWalk;
	var maxWalk;
	var minTran;
	var medTran;
	var maxTran;
	var route;
	var polyLineRoute;
	var panel = false;
	var valorAnterior;

	/**
	* Función ancla de la aplicación web.
	* Comprueba que se ha activado el permiso de geolocalización.
	*  -> success: Función que es llamada si está habilitado
	*	           el permiso.
	*  -> error: Función que es llamada si no está habilitado
	*			 el permiso.
	*/
	navigator.geolocation.getCurrentPosition(success, error);

	function error(){
		alert("No esta habilitado la geolocalización");
	};
	/**
	* Función que permite la interacción con la API
    * de Google Maps JavaScript.
	* . position: Variable para obtener las cooredenadas servidas
	*             por el navegador.
	*/
	function success(position) {

		gLatOrigen = position.coords.latitude;
		gLngOrigen = position.coords.longitude;
		
		// Creación objeto LatLng de Google Maps que contiene las
		// coordenadas obtenidas por el navegador.
		gLatLon = new google.maps.LatLng(gLatOrigen,gLngOrigen);
		
		var geocoder = new google.maps.Geocoder();
		gDirectionsRenderer = new google.maps.DirectionsRenderer;
		gDirectionsService = new google.maps.DirectionsService;
		gService = new google.maps.DistanceMatrixService();
		
		// Configuración estilo del mapa
		var myStyles = [{
			featureType: 'poi',
			elementType: 'labels',
			stylers: [{ visibility: 'off' }]
		}];
		// Configuración del Mapa
		var objConfig = {
			zoom : 17,
			center: gLatLon,
			streetViewControl: false,
			mapTypeControl:false,
			fullscreenControl: false,
			styles: myStyles
		}
		// Creación objecto mapa
		gMap = new google.maps.Map(map, objConfig);

		var transitLayer = new google.maps.TransitLayer();
		transitLayer.setMap(gMap);

		gMarkerOrigen = new google.maps.Marker({
			position: gLatLon,
			map: gMap,
			label: labels[0]
		});

		gMarkerDesti = new google.maps.Marker({
			map:gMap
		});


//		gMap.addListener('touchstart', obrirMenu2);
		/**
		* Función a la espera a un clic derecho del ratón
		* encima del mapa que abre un pequeño menú con
		* las opciones de seleccionar origen y destino.
		*  -> obrirMenu: Función que es llamada
		*/
		gMap.addListener('rightclick', obrirMenu);

		/**
		* Función para habilitar y mostrar el menú
		* de selección origen y destino.
		* . mapsMouseEvent: Variable para obtener las cooredenadas
		*					del mapa.
		*/
		function obrirMenu(mapsMouseEvent) {

			$('#contextMenu').css('display','block');
			$('#contextMenu').css('zindex',10);
			$('#contextMenu').css('left', event.clientX + 'px');
			$('#contextMenu').css('top', event.clientY + 'px');

			gLatLon = mapsMouseEvent.latLng;
		}

		/**
		* Función que se realiza cuando se cliquea en la opción
		* de origen.
		* Se crea un marcador con la nueva posición de origen.
		* Se consigue transformar las coordenadas en una dirección
		* leible para el usuario.
		* Si el usuario ya a seleccionado un origen y un destino se habilita 
		* el botón para poder hacer la consulta.
		*/
		$('#liOrigen').click(function(){
			$('#liOrigen').data('semafor', true);
			gMarkerOrigen.setMap(null);
			gMarkerOrigen = new google.maps.Marker({
				position: gLatLon,
				map:gMap,
				label: labels[0]
			});
			$('#contextMenu').css('display','none');

			$('#origen').data('lat', gLatLon.toString());

			geocodeAddress('#origen', geocoder, gMap);
			$('#liOrigen').data('semafor', false);
			if ($('#desti').val().length > 0) {
				$('#enviar').attr('disabled', false);
			}
		});
		/**
		* Función que se realiza cuando se cliquea en la opción
		* de destino.
		* Se crea un marcador con la nueva posición de destino.
		* Se consigue transformar las coordenadas en una dirección
		* leible para el usuario.
		* Si el usuario ya a seleccionado un origen y un destino se habilita 
		* el botón para poder hacer la consulta.
		*/
		$('#liDesti').click(function(){
			$('#liDesti').data('semafor', true);
			gMarkerDesti.setMap(null);
			gMarkerDesti = new google.maps.Marker({
				position: gLatLon,
				map:gMap,
				label: labels[1]
			});
			$('#contextMenu').css('display','none');
			geocodeAddress('#desti', geocoder, gMap);
			$('#liDesti').data('semafor', false);
			if ($('#origen').val().length > 0) {
				$('#enviar').attr('disabled', false);
			}
		});
		/**
		* Función para cerrar el menú en el mapa con el botón
		* izquierdo del ratón
		*/
		gMap.addListener('click', function(mapsMouseEvent){
			$('#contextMenu').css('display','none');
		});
		/**
		* Función que actualiza el mapa y opciones del origen
		* cuando el focus en el input para el origen es cambiado.
		* Si el usuario ya a seleccionado un origen y un destino se habilita 
		* el botón para poder hacer la consulta.
		*/
		$('#origen').blur(function(){
			if ($('#origen').val().length > 0) {
				geocodeAddress('#origen',geocoder, gMap);
				if ($('#desti').val().length > 0) {
					$('#enviar').attr('disabled', false);
				}
			}
		});
		/**
		* Función que actualiza el mapa y opciones del destino
		* cuando el focus en el input para el destino es cambiado.
		* Si el usuario ya a seleccionado un origen y un destino se habilita 
		* el botón para poder hacer la consulta.
		*/
		$('#desti').blur(function(){
			if ($('#desti').val().length > 0) {
				geocodeAddress('#desti', geocoder, gMap);
				if ($('#origen').val().length > 0) {
					$('#enviar').attr('disabled', false);
				}
			}
		});

	};

	
	/**
	* Función que obtiene a partir de las opciones seleccionads
	* de origen, destino, hora y fecha las rutas. Cada ruta puede 
	* estar representada por un camino camino que se hace andando,
	* o por el tramo que se realiza con transporte público (tren, metro, bus).
	* La infromación de las rutas obtenidas por la API Direccions, es enviada al
	* a una Cloud Function que la procesará y retornarà un JSON con con un número
	* que representa la densidad para esa ruta y cada tramo que contiene.
	* 
	*/
	$('#enviar').click(function(){
		if ($('#origen').val().length > 0 || $('#desti').val().length > 0) {
			$('#espera').css('display', 'block');
			$('.preloader').css('display', 'block');
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

					$.each(rutasAlternas, function(ind, val){
						val.setMap(null);
						val.setPanel(null);
					});
					////////////////////////////////////////////////////////
					let rutaSel = response.routes;
					let startLoc = rutaSel[0].legs[0].start_location.toString();
					let endLoc = rutaSel[0].legs[0].end_location.toString();
					let depTime = rutaSel[0].legs[0].departure_time.text
					let depTimeHora = parseInt(depTime.split(":")[0]);
					let depTimeMin = parseInt(depTime.split(":")[1]);
					let duration = parseInt(rutaSel[0].legs[0].duration.text.split(" ")[0]);
					let distance = parseFloat(rutaSel[0].legs[0].distance.text.split(" ")[0]);
					let lat;
					let lon;
					let pathT;// = new Array();
					let path;
					let path2;
					let path3 = [];


					$.each(rutaSel, function(ind, val){
						$.each(val, function(ind2, val2){
							path2 = [];
							if(ind2 == "legs"){
								$.each(val2[0].steps, function(ind3, val3){ 
									pathT = new Array();
									path = new Array();
									$.each(val3.path, function(ind4, val4){
										let tmp = val4.toString().split(",");
										lat = tmp[0].split("(")[1];
										lng = tmp[1].split(")")[0];
										let latLng = { "latitud" : lat,
													   "longitud" : lng };
										path.push(latLng);
									});

									pathT.push({"travel_mode" : val3.travel_mode, "path":path});
									path2.push(pathT);
								});
								path3.push(path2);
							}
						});
					});

					route = {
						"start_location" : startLoc,
						"end_location" : endLoc,
						"departure_time" : {
								"hora" : depTimeHora,
								"minuts" : depTimeMin,
								"segos" : 00
						},
						"duration" : duration,
						"distance" : distance,
						"steps" : path3

					}
					/* Llamada a la función que contiene una llamada AJAX 
					   para mandar el JSON personalizado a una función PYTHON
					   del servidor que realiza una llamada a la Cloud Function
					   pertinente y retornarà las densidades de las rutas.
					*/
					getDensitat(route);
					// La espera de 9 segundos se realiza para esperar la respuesta del servidor.
					await sleep(9000);
					$('.preloader').css('display', 'none');
					$('#espera').css('display', 'none');

					rutasAlternas = [];
					gMarkerOrigen.setMap(null);
					gMarkerDesti.setMap(null);
					/* Recorrer todas las rutas, si hay alguna de ellas que tenga una distancia
					   superior a la mejor distancia (seleccionada por la API Direcctions Matrix)
					   más 5 se descarta, para las que passan el baremo, se les asigna un indice
					   mientras son creadas. Este indice es utilizado para saber que ruta 
					   es la escojida.
					*/
					for (var i = 0; i < response.routes.length; i++){
						let dist = parseInt(response.routes[i].legs[0].distance.text.split(" ")[0]);
						if(dist < minDistancia + 5){
							gDirectionsRenderer = new google.maps.DirectionsRenderer({
														directions: response,
														routeIndex: i,
														polylineOptions: { visible: false }
													});
							rutasAlternas.push(gDirectionsRenderer);

						}
						rutasAlternas[0].setMap(gMap);
						rutasAlternas[0].setPanel(document.getElementById('right-panel'));
					}
					pintarRuta();

					$('#right-panel').css('display', 'block');
					$('#map').css('width','60%');
					$('#map').css('margin-left','6%');
					$('#guardar').css('display', 'block');
					$('#guardar').attr('disabled', false);

					panel = true;
					await sleep(1000);
					valorAnterior = document.getElementsByClassName('adp-listsel')[0].getAttributeNode('data-route-index').value;

				} else {
					console.error('Directions request failed due to ' + status);
				}
			});
		}
	});
	/**
	* Función para obtener los resultados de la API Direccion Matrix.
	* . response: Variable que contiene la respuesta de la API
	* . status: Valor de retorno de la petición.
	*/
	function callback(response, status){
		if(status == 'OK'){
			var origins = response.originAddresses;
			var destinations = response.destinationAddresses;

			for (var i = 0; i < origins.length; i++) {
				var results = response.rows[i].elements;
				for (var j = 0; j < results.length; j++) {
					var element = results[j];
					var distance = element.distance.text;
					let dist = parseInt(element.distance.text.split(" ")[0]);
					minDistancia = dist;
					var duration = element.duration.text;
					var from = origins[i];
					var to = destinations[j];
				}
			}
		} else {
			console.error("Error: " + status);
		}
	}
	/**
	* Función con una llamada AJAX que hace una llamada al fichero
	* getDensitat.py del servidor, el cual realiza una llamada 
	* a la Cloud Function.
	* . route: JSON personalizado con la información de las rutas.
	*/
	function getDensitat(route){
		$.ajax({
			url: "getDensitat",
			type:'POST',
			contentType: "json",
			data: JSON.stringify(route),
			success: function(datos){
				let obj = JSON.parse(datos);
				densitats = obj;
			}, error: function(datos, status, error){

			}
		});

	}
	/**
	* Función para obtener a partir de coordenadas como de direcciones
	* los puntos de origen y destino.
	*/
	function geocodeAddress(place, geocoder, map){
		if( $('#liOrigen').data('semafor') || $('#liDesti').data('semafor')){
			geocoder.geocode({'location':gLatLon}, function(results, status){
				if (status == 'OK'){
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
							position: results[0].geometry.location
						});
					} else {
						gMarkerDesti.setMap(null);
						gMarkerDesti = new google.maps.Marker({
							map: map,
							label: labels[1],
							position: results[0].geometry.location
						});
					}
				} else {
					alert("Geocode was not successful for the following reason: " + status);
				}
			});
		}
	}
	/**
	* Función para almacenar en la base de datos la ruta seleccionada por el usuario.
	*/
	$('#guardar').click(function(){

		let opcion = document.getElementsByClassName('adp-listsel')[0].getAttributeNode('data-route-index').value;
		let rutaSel = rutasAlternas[0].directions.routes[opcion].legs;

		let startLoc = rutaSel[0].start_location.toString();
		let endLoc = rutaSel[0].end_location.toString();
		let depTime = rutaSel[0].departure_time.text
		let depTimeHora = parseInt(depTime.split(":")[0]);
		let depTimeMin = parseInt(depTime.split(":")[1]);
		let duration = parseInt(rutaSel[0].duration.text.split(" ")[0]);
		let distance = parseFloat(rutaSel[0].distance.text.split(" ")[0]);
		let pathT = new Array();
		let path2 = [];


		$.each(rutaSel[0].steps , function(ind, val){

			let path = new Array();
			$.each(val.path, function(ind2, val2){
				let tmp = val2.toString().split(",");
				lat = tmp[0].split("(")[1];
				lng = tmp[1].split(")")[0];
				let latLng = {"latitud" : lat,
							  "longitud" : lng };
				path.push(latLng);
			});
			pathT = { "travel_mode" : val.travel_mode, "path":path }
			path2.push(pathT);
		});


		let route = {
			"start_location" : startLoc,
			"end_location" : endLoc,
			"departure_time" : {
					"hora" : depTimeHora,
					"minuts" : depTimeMin,
					"segos" : 00
			},
			"duration" : duration,
			"distance" : distance,
			"steps" : path2
		}
	
		$.ajax({
			url: "save",
			type:'POST',
			contentType: "json",
			data: JSON.stringify(route),
			success: function(data){
				alert("Ruta emmagatzemada correctament");
				neteja();
			},
			error: function(data, status, error){
				alert("S'ha produït un error a l'hora d'emmagatzemar la ruta");
				console.log(data);
				console.log(status);
				console.log(error);
			}
		});

	});
	/**
	* Función que comprueba si es necesario pintar una ruta.
	*/
	function actualizar(){
		if(panel){
			if (document.getElementsByClassName('adp-listsel')[0].getAttributeNode('data-route-index').value != valorAnterior){
				pintarRuta();
			}
		}
	}
	// Función que pinta la ruta según el color de densidad.
	function pintarRuta(){
		
		$.each(polyLineRoute, function(ind, val){
			val.setOptions({map: null});
		});
		polyLineRoute = [];
		let dens = new Array();

		$.each(densitats, function(ind, val){
			dens.push(val);
		});
		
		let ind = rutasAlternas[0].getRouteIndex();
		valorAnterior = ind;
		console.log("ind : ", ind);
		let index = 0;
		for (let j = 0; j<route.steps[ind].length; j++){

			color = colors[dens[ind][j][index]];

			let paths2 = new Array();
			for (let b = 0; b < route.steps[ind][j][0].path.length; b++){
				paths2.push( new google.maps.LatLng(route.steps[ind][j][0].path[b].latitud,route.steps[ind][j][0].path[b].longitud));
			}

			let p = new google.maps.Polyline({
					path: paths2,
					geodesic: true,
					strokeColor: color,
					strokeOpacity: 1.0,
					strokeWeight: 5
				});
			p.setOptions({map: gMap});
			polyLineRoute.push(p);
			index += 1;
		}

	}
	// Función que limpia cualquier dato que el usuario puediera haber introducido en la página.
	async function neteja(){
		$('#espera').css('display', 'block');
		$('.preloader').css('display', 'block');
		await sleep(250);
		rutasAlternas[0].setMap(null);
		rutasAlternas[0].setPanel(null);
		gLatLon = new google.maps.LatLng(gLatOrigen,gLngOrigen);
		gMarkerOrigen = new google.maps.Marker({
			position: gLatLon,
			map: gMap,
			label: labels[0]
		});
		gMap.setZoom(17);
		gMap.setCenter(gLatLon);
		$.each(polyLineRoute, function(ind, val){
			val.setOptions({map: null});
		});
		$('#right-panel').css('display', 'none');
		$('#map').removeAttr('style');
		netejaForm();
		$('.preloader').css('display', 'none');
		$('#espera').css('display', 'none');
		
	}
	
	function netejaForm(){
		$(':input', '#myForm').not('#guardar, #enviar').val('');
		$('#enviar').attr('disabled', true);
		$('#guardar').css('display', 'none');
		$('#guardar').attr('disabled', true);
	}

	function sleep(ms) {
		return new Promise(resolve => setTimeout(resolve, ms));
	}

	$.datepicker.regional["es"] = {
		closeText: 'Cerrar',
		prevText: '<Ant',
		nextText: 'Sig>',
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

	setInterval(actualizar,1000);

});
