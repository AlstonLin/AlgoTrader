let router = require('express').Router();
let path = require('path');
let axios = require('axios')
let Parallel = require('paralleljs')
let parseString = require('xml2js').parseString
let _ = require('lodash');
let simulate = require('./simulation/simulate'); 

const NASDAQ_TOKEN = 'BC2B181CF93B441D8C6342120EB0C971'

const TRADES_URL = 'http://ws.nasdaqdod.com/v1/NASDAQAnalytics.asmx/GetSummarizedTrades'

router.get("/stocks", function (req, res) {
	res.sendFile(path.join(__dirname, "/stocks.json"))
})

// router.get("/blocking", function(req, res) {
// 	let p = new Parallel({test: "test"})
// 	p.spawn(function(data){
// 		while (true) {

// 		}
// 		res.send("gdgdf")
// 	})
// })

// router.get("/shouldreturn", function(req, res) {
// 	res.send("SUCCESS")
// })


router.post("/algorithmSimulation", function (req, res) {
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
    parseString(response.data, function (err, json) {
      console.log("JSON: " + JSON.stringify(json));
      if (err) {
        res.json({Error: "Nasdaq api shit the bed"})
      } else {
        let p = new Parallel(json);
        p.spawn(function(json){
          json = json["ArrayOfSummarizedTradeCollection"]["SummarizedTradeCollection"];
          json = _.map(json, function(item){
            let val = {};
            val.trades = item["SummarizedTrades"][0]["SummarizedTrade"];
            val.ticker = item["Symbol"];
            return val;
          });
          return simulate(req.body.code, [], json, req.body.startingCash);
        }).then(function(result){
          res.send(result);
        });
      }
    });
  })
  .catch(function (error) {
    res.json(error)
  });
})

module.exports = router
