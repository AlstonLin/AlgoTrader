var router = require('express').Router();
var path = require('path');

router.get("/stocks", function (req, res) {
	res.sendFile(path.join(__dirname, "/stocks.json"))
})

router.post("/algorithmSimulation", function (req, res) {
	var algo_data = {
		ticket: req.body.ticket,
		startTime: req.body.startTime,
		endTime: req.body.endTime,
		startingMoney: req.body.startingMoney
	}

	res.json(algo_data)
	
})

module.exports = router