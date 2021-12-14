// dependency
const express = require('express');
var app = express();

// port yg ditentukan
const PORT = process.env.PORT || 4000;

// jalankan API
app.use("/", require("./Controllers/API"))

// jalankan server
app.listen(PORT, function(){
	console.log(`Server is running! (port ${PORT})`);
});