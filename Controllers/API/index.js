/**
 * Endpoint untuk API
 */

const server = require('express').Router();

server.use("/", require("./_EntryPoint"))

server.use("/kecamatan", require("./_Kecamatan"))

module.exports = server;
