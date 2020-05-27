$(async function(){
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
			//icon: "https://maps.google.com/mapfiles/ms/icons/red-dot.png"
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
				//icon: "https://maps.google.com/mapfiles/ms/icons/red-dot.png"
			});
			$('#contextMenu').css('display','none');

			$('#origen').data('lat', gLatLon.toString());

			geocodeAddress('#origen', geocoder, gMap);
			$('#liOrigen').data('semafor', false);
			if ($('#desti').val().length > 0) {
				$('#enviar').attr('disabled', false);
			}
		});

		$('#liDesti').click(function(){
			$('#liDesti').data('semafor', true);
			gMarkerDesti.setMap(null);
			gMarkerDesti = new google.maps.Marker({
				position: gLatLon,
				map:gMap,
				label: labels[1],
				//icon: "http://maps.google.com/mapfiles/ms/icons/blue-dot.png"
			});
			$('#contextMenu').css('display','none');
			geocodeAddress('#desti', geocoder, gMap);
			$('#liDesti').data('semafor', false);
			if ($('#origen').val().length > 0) {
				$('#enviar').attr('disabled', false);
			}
		});



		gMap.addListener('click', function(mapsMouseEvent){
			$('#contextMenu').css('display','none');
		});



		$('#origen').blur(function(){
			if ($('#origen').val().length > 0) {
				geocodeAddress('#origen',geocoder, gMap);
				if ($('#desti').val().length > 0) {
					$('#enviar').attr('disabled', false);
				}
			}
		});


		$('#desti').blur(function(){
			if ($('#desti').val().length > 0) {
				geocodeAddress('#desti', geocoder, gMap);
				if ($('#origen').val().length > 0) {
					$('#enviar').attr('disabled', false);
				}
			}
		});


	};
	
	//await sleep(2000);
	
	$('#indata').click(function(){

        $.ajax({
			url : "/addRoute",
			success : function(response){
				   //codigo de exito
				   //console.log("Good");
				   //console.log(response);
			},
			error: function(response, status, error){
				   //codigo error
				   //console.log("Bad");
				   //console.log(response);
				   //console.log(status);
				   //console.log(error);
			}
        });
	});

	function test(route){
		$.ajax({
			url: "test",
			type:'POST',
			contentType: "json",
			data: JSON.stringify(route),
			success: function(datos){
				//console.log("GOOID");
				//console.log(datos);
				let obj = JSON.parse(datos);
				densitats = obj;
			}, error: function(datos, status, error){
				//console.log("BAD BOYS");
				//console.log(datos);
				//console.log(status);
				//console.log(error);
			}
		});
	
	}



	$('#enviar').click(function(){
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
				//console.log(response);
				//await sleep(2000);

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
							$.each(val2[0].steps, function(ind3, val3){                  // travel_mode + path
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
				//console.log("ROUTE");
				//console.log(route);
				
				test(route);
				await sleep(7000);
				$('.preloader').css('display', 'none');
				$('#espera').css('display', 'none');
				//console.log("Denstitats");
				//console.log(densitats);
								
				maxWalk = 0;
				minWalk = 100;
				maxTran = 0;
				minTran = 100;
				
				let index = 0;
				$.each(densitats, function(ind, val){
					let index2 = 0;
					for (let j = 0; j<route.steps[index].length; j++){
						if(route.steps[index][j][0].travel_mode == "WALKING"){
							if (parseFloat(val[j][j]) > maxWalk){
								maxWalk = parseFloat(val[j][j]);
							}else {
								if (  val[j][j] < minWalk) {
									minWalk = parseFloat(val[j][j]);
								}
							}
						} else {
							if (parseFloat(val[j][j]) > maxTran){
								maxTran = parseFloat(val[j][j]);
							} else {
								if ( val[j][j] < minTran) {
									minTran = parseFloat(val[j][j]);
								}
							}
						}
					}
					index += 1;
				});
								
				medWalk = (maxWalk+minWalk) / 2;
				medTran = (maxTran+minTran) / 2;
				

				rutasAlternas = [];
				gMarkerOrigen.setMap(null);
				gMarkerDesti.setMap(null);

				for (var i = 0; i < response.routes.length; i++){
	//				console.log(response.routes[i]);
					/*for(var j=0;j < response.routes[i].overview_path.length; j++){
						//console.log("Coords = "+response.routes[i].overview_path[j].toString());
						coords.push(response.routes[i].overview_path[j].toString());
					}		*/
					let dist = parseInt(response.routes[i].legs[0].distance.text.split(" ")[0]);
	//				console.log(response.routes[i].legs[0].distance.text);
	//				console.log(typeof response.routes[i].legs[0].distance.text);
	//				console.log(dist);
	//				console.log(typeof dist);
	//				console.log("minDist + 5 ", minDistancia + 5);
	//				console.log("dist > minDistancia + 5" , dist > minDistancia + 5);
	
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
													polylineOptions: { visible: false }
												});
						rutasAlternas.push(gDirectionsRenderer);
	
					}
					rutasAlternas[0].setMap(gMap);
					rutasAlternas[0].setPanel(document.getElementById('right-panel'));
					//opcion = document.getElementById('adp-listsel');
				}
				//pintarRuta(minWalk, medWalk, maxWalk, minTran, medTran, maxTran, dens, route);
				pintarRuta();
	
				$('#right-panel').css('display', 'block');
				$('#map').css('width','60%');
				$('#map').css('margin-left','6%');
				$('#guardar').css('display', 'block');
				
				//console.log("gMaps : ", gMap);
				//console.log("rutasAlternas[0] : ", rutasAlternas[0]);
				panel = true;
				await sleep(1000);
				valorAnterior = document.getElementsByClassName('adp-listsel')[0].getAttributeNode('data-route-index').value;
				
				//console.log("VALOR ANTERIOR : ",valorAnterior);
				
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
					//console.log("Distance : ", distance);
					let dist = parseInt(element.distance.text.split(" ")[0]);
					minDistancia = dist;
					var duration = element.duration.text;
					//console.log("Duration : ", duration);
					var from = origins[i];
					//console.log("From : ", from);
					var to = destinations[j];
					//console.log("To : ", to);
				}
			}


		} else {
			console.error("Error: " + status);
		}
	}
	
	


	function geocodeAddress(place, geocoder, map){
		//console.log("GeocodeAddress");
		if( $('#liOrigen').data('semafor') || $('#liDesti').data('semafor')){
			//console.log("Por ratón");
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
							//icon: "https://maps.google.com/mapfiles/ms/icons/red-dot.png"
						});
					} else {
						gMarkerDesti.setMap(null);
						gMarkerDesti = new google.maps.Marker({
							map: map,
							label: labels[1],
							position: results[0].geometry.location,
							//icon: "https://maps.google.com/mapfiles/ms/icons/blue-dot.png"
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
		//console.log("Opcion : ", opcion);
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
				//path.push(val2.toString());
				let tmp = val2.toString().split(",");
				lat = tmp[0].split("(")[1];
				lng = tmp[0].split(")")[0];
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
		console.log(route);
		
		$.ajax({
			url: 'save',
			type: 'POST',
			contentType: 'json',
			data: JSON.stringify(route),
			success: function(data){
				alert("Ruta emmagatzemada correctament");
			},
			error: function(data, status, error){
				alert("S'ha produït un error a l'hora d'emmagatzemar la ruta");
				console.log(data);
				console.log(status);
				console.log(error);
			}
		});

		/*
		function test(route){
		$.ajax({
			url: "test",
			type:'POST',
			contentType: "json",
			data: JSON.stringify(route),
			success: function(datos){
				//console.log("GOOID");
				//console.log(datos);
				let obj = JSON.parse(datos);
				densitats = obj;
			}, error: function(datos, status, error){
				//console.log("BAD BOYS");
				//console.log(datos);
				//console.log(status);
				//console.log(error);
			}
		});
	
	}
		*/

	});
	
	function actualizar(){
		if(panel){
			if (document.getElementsByClassName('adp-listsel')[0].getAttributeNode('data-route-index').value != valorAnterior){
				pintarRuta();
			}
		}
	}

	//Carrer de Batista i Roca, 11A, 08912 Badalona, Barcelona, España
	//Gran Via de les Corts Catalanes, 1097, 08020 Barcelona, España

	$('#pintar').click(pintarRuta);


	//function pintarRuta(minWalk, medWalk, maxWalk, minTran, medTran, maxTran, densitat, route){
	function pintarRuta(){
		/*console.log("Pintar Ruta");
	
		console.log("minWalk : ", minWalk);
		console.log("medWalk : ", medWalk);
		console.log("maxWalk : ", maxWalk);
		console.log("minTran : ", minTran);
		console.log("medTran : ", medTran);
		console.log("maxTran : ", maxTran);
		console.log("densitats : ", densitats);*/

		$.each(polyLineRoute, function(ind, val){
			/*console.log("polyLineRoute ind : ", ind);
			console.log("polyLineRoute val : ", val);*/
			val.setOptions({map: null});
		});
		polyLineRoute = [];
		//console.log(densitats);
		let dens = new Array();
		
		$.each(densitats, function(ind, val){
			//console.log("VALOR DENSITATS : ",val);
			dens.push(val);
		});
					

		/*console.log("Densitats : ", densitats);
		console.log("Dens : ", dens);
		console.log("Dens 2 : ", dens2);*/

		let ind = rutasAlternas[0].getRouteIndex();
		//console.log(ind);
		let index = 0;
		//console.log(route);
		for (let j = 0; j<route.steps[ind].length; j++){
		//	console.log(route.steps[ind][j][0]);
		//	console.log(route.steps[ind][j][0]);
			if(route.steps[ind][j][0].travel_mode == "WALKING"){
		//		console.log("WALKING");
				if (parseFloat(dens[ind][index][index]) > minWalk && parseFloat(dens[ind][index][index]) < medWalk){
					color = GREEN;
				}else if (parseFloat(dens[ind][index][index]) >= medWalk && parseFloat(dens[ind][index][index]) < maxWalk) {
					color = ORANGE;
				} else {
					color = RED;
				}
			} else {
		//		console.log("TRANSIT");
				if (parseFloat(dens[ind][index][index]) >= minTran && parseFloat(dens[ind][index][index]) < medTran){
					color = GREEN;
				}else if (parseFloat(dens[ind][index][index]) >= medTran && parseFloat(dens[ind][index][index]) < maxTran) {
					color = ORANGE;
				} else {
					color = RED;
				}
			}
		//	console.log("Valor : ", dens[ind][index][index]);
			
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

	
	function sleep(ms) {
		return new Promise(resolve => setTimeout(resolve, ms));
	}
	
	//

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
