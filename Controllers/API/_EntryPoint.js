/**
 * Halaman utama
 */

const server = require('express').Router();

server.get("/", function(req, res){
	res.json({
		message: "Unofficial REST API for BMKG Updates",
		links: {
			documentation: {
				url: "https://github.com/rbsoen/bmkg-rest",
				method: "get"
			},
			kecamatan: {
				url: "/kecamatan",
				method: "get",
				params: ["kabupaten"]
			}
		}
	});
});

module.exports = server;
