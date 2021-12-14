/**
 * Kecamatan
 */

const server = require('express').Router();
const https = require('https');
const xml = require('fast-xml-parser');

const xml_parser = new xml.XMLParser({
	ignoreAttributes: false,
	attributeNamePrefix : "_"
});

const kec_request = {
	hostname: "dataweb.bmkg.go.id",
	port: 443,
	path: "/API/cuaca/data-kecamatan.bmkg"
};

function handleError(status, response, resObject) {
	response.message = "Unable to fetch data";
	resObject.json(response);
}

/**
 * Ambil data kecamatan dari GET parameter "kabupaten"
 */
server.get("/", function(req, res){
	if (req.query.kabupaten == undefined) {
		return res
		.status(400)
		.json(
			{
				message: "'kabupaten' parameter must be filled in"
			}
		);
	}
	
	let kabupaten_name = req.query.kabupaten.trim();
	
	// validasi
	const regex = /^([A-Za-z\.\s]+)$/mg;
	if (regex.exec(kabupaten_name) === null) {
		return res
		.status(400)
		.json(
			{
				message: "'kabupaten' invalid"
			}
		);
	}
	
	let options = { ... kec_request };
	options.path += "?kab=" + encodeURI(kabupaten_name);
	
	let response = {
		kabupaten: kabupaten_name,
		kecamatan: [
		],
		links: {
			source: {
				url: "http://bmkg.go.id",
				method: "get"
			}
		}
	};
	
	let f_res;
	
	https.get(options,
	(r) => {
		let status = r.statusCode;
		
		r.on('data', (d) => {
			let converted;
			try {
				converted = xml_parser.parse(d);
			} catch (error) {
				handleError(500, response, res);
				return;
			}
			
			for (kec of converted.data.kec) {
				response.kecamatan.push({
					"name": kec._nama,
					"id": kec._id
				})
				
				response.links[kec._nama] = {
					"url": "/kecamatan/" + kec._id,
					"method": "get"
				}
			}
			
			res
			.status(r.statusCode)
			.json(
				response
			);
				
			return;
		});
	}).on('error', (e) => {
		response.message = "Unable to fetch data";
		
		res
		.status(404)
		.json(response);
	});
});

/**
 * Ambil data kecamatan
 */
server.get("/:id([0-9]+)", function(req, res) {
	let response = {
		id: req.params.id,
		links: {
			source: {
				url: "http://bmkg.go.id",
				method: "get"
			}
		}
	};
	
	let options = { ... kec_request };
	options.path = "/API/cuaca/cuaca-kecamatan.bmkg?id=" + req.params.id + "&detail=0";
	
	https.get(options,
	(r) => {
		let status = r.statusCode;
		
		r.on('data', (d) => {
			let converted;
			try {
				converted = xml_parser.parse(d);
			} catch (error) {
				handleError(500, response, res);
				return;
			}
			
			if (converted == undefined) {
				handleError(status, response, res);
				return;
			}
			
			if (converted.cuaca_kecamatan == undefined) {
				handleError(status, response, res);
				return;
			}
			
			response.kecamatan = converted.cuaca_kecamatan.kecamatan._kec;
			response.latitude = converted.cuaca_kecamatan.kecamatan._lat;
			response.longitude = converted.cuaca_kecamatan.kecamatan._lon;
			response.kabupaten = converted.cuaca_kecamatan.kabupaten;
			response.province = converted.cuaca_kecamatan.provinsi;
			
			response.links['weather'] = {
				url: "/kecamatan/" + req.params.id + "/weather",
				method: "get"
			};
					
			res
			.status(status)
			.json(
				response
			);
				
			return;
		});
	}).on('error', (e) => {
		response.message = "Unable to fetch data";
		
		res
		.status(404)
		.json(response);
	});
});

/**
 * Ambil cuaca kecamatan
 */
server.get("/:id([0-9]+)/weather", function(req, res) {
	let response = {
		links: {
			source: {
				url: "http://bmkg.go.id",
				method: "get"
			}
		}
	};
	
	let options = { ... kec_request };
	options.path = "/API/cuaca/cuaca-kecamatan.bmkg?id=" + req.params.id + "&detail=1";
	
	https.get(options,
	(r) => {
		let status = r.statusCode;
		
		r.on('data', (d) => {
			let converted;
			try {
				converted = xml_parser.parse(d);
			} catch (error) {
				handleError(500, response, res);
				return;
			}
			
			if (converted === undefined) {
				handleError(status, response, res);
				return;
			}
			
			response.links["kecamatan"] = {
				"url": "/kecamatan/" + req.params.id,
				"method": "get"
			}
			
			response.lastUpdated = converted.cuaca_kecamatan.update;
			response.utcOffset = converted.cuaca_kecamatan.timezone;
			
			response.units = {
				"temperature": "celcius",
				"humidity": "percent",
				"wind.speed": "km per hour"
			}
			
			response.dayAverages = []
			for (average of converted.cuaca_kecamatan.average.row) {
				response.dayAverages.push({
					"date": average._date,
					"temperature": {
						"min": average._tmin,
						"max": average._tmax
					},
					"humidity": {
						"min": average._humin,
						"max": average._humax
					}
				})
			}
			
			response.predictions = []
			for (weather of converted.cuaca_kecamatan.datacuaca.cuaca) {
				let direction = weather._wdcard;
				let directionFriendly;
				switch(direction) {
					case "N":
						directionFriendly = "North"
						break;
					case "NNE":
						directionFriendly = "North-Northeast"
						break;
					case "NE":
						directionFriendly = "Northeast"
						break;
					case "ENE":
						directionFriendly = "East-Northeast"
						break;
					case "E":
						directionFriendly = "East"
						break;
					case "ESE":
						directionFriendly = "East-Southeast"
						break;
					case "SE":
						directionFriendly = "Southeast"
						break;
					case "SSE":
						directionFriendly = "South-Southeast"
						break;
					case "S":
						directionFriendly = "South"
						break;
					case "SSW":
						directionFriendly = "South-Southwest"
						break;
					case "SW":
						directionFriendly = "Southwest"
						break;
					case "WSW":
						directionFriendly = "West-Southwest"
						break;
					case "W":
						directionFriendly = "West"
						break;
					case "WNW":
						directionFriendly = "West-Northwest"
						break;
					case "NW":
						directionFriendly = "Northwest"
						break;
					case "NNW":
						directionFriendly = "North-Northwest"
						break;
					case "VARIABLE":
						directionFriendly = "Variable"
						break;
					case "CALM":
						directionFriendly = "Calm"
						break;
					default:
						directionFriendly = "unknown"
						break;
				}
				
				let weatherCode = weather._weather;
				let weatherFriendly;
				switch(weatherCode) {
					case "0":
						weatherFriendly = "Clear skies"
						break;
					case "1":
					case "2":
						weatherFriendly = "Partly cloudy"
						break;
					case "3":
						weatherFriendly = "Mostly cloudy"
						break;
					case "4":
						weatherFriendly = "Overcast"
						break;
					case "5":
						weatherFriendly = "Haze"
						break;
					case "10":
						weatherFriendly = "Smoke"
						break;
					case "45":
						weatherFriendly = "Fog"
						break;
					case "60":
						weatherFriendly = "Light rain"
						break;
					case "61":
						weatherFriendly = "Rain"
						break;
					case "63":
						weatherFriendly = "Heavy rain"
						break;
					case "80":
						weatherFriendly = "Isolated shower"
						break;
					case "95":
					case "97":
						weatherFriendly = "Severe thunderstorm"
						break;
					default:
						weatherFriendly = "unknown"
						break;
				}
				
				response.predictions.push({
					"date": weather._date,
					"humidity": weather._hu,
					"temperature": weather._t,
					"wind": {
						"direction": direction,
						"friendlyName": directionFriendly,
						"speed": weather._ws
					},
					"weather": {
						"code": weatherCode,
						"friendlyName": weatherFriendly
					}
				})
			}
			
			
					
			res
			.status(status)
			.json(
				response
			);
				
			return;
		});
	}).on('error', (e) => {
		response.message = "Unable to fetch data";
		
		res
		.status(404)
		.json(response);
	});
});
module.exports = server;
