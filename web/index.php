<!DOCTYPE html>
<html>
	<head>
		<meta charset="utf-8" />
		<title>Safe Transportation</title>
		<meta name="viewport" content="initial-scale=1.0">
		
		<link rel="stylesheet" href="styles/bootstrap.css">
		<link rel="stylesheet" href="styles/jquery-ui.css">
		<link rel="stylesheet" href="styles/jquery-ui.structure.css">
		<link rel="stylesheet" href="styles/jquery-ui.theme.css">
		<link rel="stylesheet" href="styles/style.css">
		
		
		<script type="text/javascript" src="scripts/jquery-3.5.1.js"></script>
		<script type="text/javascript" src="scripts/jquery-ui.min.js"></script>
		<script type="text/javascript" src="scripts/bootstrap.js"></script>
		<script type="text/javascript" src="scripts/script.js"></script>
		<!--<script src="https://maps.googleapis.com/maps/api/js?key=AIzaSyAikv_zwmE_upUzXmsC_MGSEgRkzpdkDVU"-->
		<script src="https://maps.googleapis.com/maps/api/js?key=AIzaSyAEhSk10kykEmIR78FnvzWPYJbNIwTPSKk"
		async defer></script>

	</head>
	<body>
		<header>

		</header>
		<section>
			<div id="container">
				<div class="row" id="map-panel">
					<div id="map" ></div>
					<div id="right-panel"></div>
					<div id="contextMenu" class="stPopup">
						<div class="stPopup-arrow-left"></div>
						<ul>
							<li id="liOrigen">Origen</li>
							<li id="liDesti">Destí</li>
						</ul>
					</div>
					
				</div>
				<form>
					<div id="dades">
						<div class="form-group">
							<label>Origen</label>
							<input id="origen" type="text" class="form-control">
						</div>
						<div class="form-group">
							<label>Destí</label>
							<input id="desti" type="text" class="form-control">
						</div>
						<div class="row form-group">
							<div class="col">
								<label>Hora de sortida:</label>
								<input type="time" id="hora" class="form-control">
							</div>
							<div class="col">
								<label>Dia:</label>
								<input type="text" id="datepicker" class="form-control">
							</div>
						</div>
						<div class="form-group">
							<input type="button" id="enviar" class="form-control" value="Buscar Ruta">
						</div>
						<div class="form-group">
							<input type="button" id="guardar" class="form-control" value="Guardar Ruta">
						</div>
						<div class="form-group">
							<input type="button" id="pintar" class="form-control" value="Pintar Ruta">
						</div>
						
						<div class="form-group">
							<input type="button" id="indata" class="indata" value="INPUT DATA">
						</div>
					</div>
				</form>
			</div>
		</section>
		<footer class="page-footer font-small blue">

			<div class="container">
				<ul class="foote_bottom_ul_amrc">
				<li><a href="#">Avís legal</a></li>
				<li><a href="#">Política de privadesa</a></li>
				<li><a href="#">Politica de cookies</a></li>
				<li><a href="#">Accessibilitat</a></li>
				<li><a href="#">Mapa web</a></li>
				<li><a href="#">Directori web</a></li>
				</ul>
			</div>
			<div class="footer-copyright text-center py-3">© Grup MASS 2020 - Tots els drets reservats:
				<!--<a href="https://mdbootstrap.com/"> MDBootstrap.com</a>-->
			</div>

		</footer>
	</body>
</html>
