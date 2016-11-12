var router = require('express').Router();
var path = require('path');
let axios = require('axios')
var parseString = require('xml2js').parseString

const NASDAQ_TOKEN = 'BC2B181CF93B441D8C6342120EB0C971'

const TRADES_URL = 'http://ws.nasdaqdod.com/v1/NASDAQAnalytics.asmx/GetSummarizedTrades'

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

	axios.get(TRADES_URL, {
		params: {'_Token' : NASDAQ_TOKEN,
          'Symbols' : req.body.ticket,
          'StartDateTime' : req.body.startTime + " 09:30:00",
          'EndDateTime' : req.body.endTime + " 16:00:00",
          'MarketCenters' : '' ,
          'TradePrecision': 'Hour',
          'TradePeriod':'1'
      }
	})
  .then(function (response) {
    console.log(response.data);
	parseString(response.data, function (err, result) {
	    if (err) {
	    	res.json({Error: "Nasdaq api shit the bed"})
	    } else {
	    	res.send(result)
	    }
	});
  })
  .catch(function (error) {
    res.json(error)
  });

	
})

module.exports = router