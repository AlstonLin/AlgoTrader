let router = require('express').Router();
let path = require('path');
let axios = require('axios')
let parseString = require('xml2js').parseString
let _ = require('lodash');
let simulate = require('./simulation/simulate'); 

const NASDAQ_TOKEN = 'BC2B181CF93B441D8C6342120EB0C971'

const TRADES_URL = 'http://ws.nasdaqdod.com/v1/NASDAQAnalytics.asmx/GetSummarizedTrades'

router.get("/stocks", function (req, res) {
	res.sendFile(path.join(__dirname, "/stocks.json"))
})

router.post("/algorithmSimulation", function (req, res) {
  // Parses ticker symbols

  console.log(JSON.stringify(req.body))
  let symbols = ''
  req.body.stocks.forEach(function(s) {
    symbols = symbols + (s.ticket + ",")
  })
  // API call to NASDAQ
	axios.get(TRADES_URL, {
		params: {
      '_Token' : NASDAQ_TOKEN,
      'Symbols' : symbols,
      'StartDateTime' : req.body.startTime + " 09:30:00",
      'EndDateTime' : req.body.endTime + " 15:30:00",
      'MarketCenters' : '' ,
      'TradePrecision': 'Hour',
      'TradePeriod':'1'
    }
	})
  .then(function (response) {
    // Parses XML
    parseString(response.data, function (err, json) {
      if (err) {
        res.json({Error: "Nasdaq api shit the bed"})
      } else {
        const acceptableTimes = ["09:30:00.000", "10:30:00.000", "11:30:00.000", "12:30:00.000", "13:30:00.000", "14:30:00.000", "15:30:00.000"]
        // Cleans up the JSON
        json = json["ArrayOfSummarizedTradeCollection"]["SummarizedTradeCollection"];
        json = _.map(json, function(item){
          let val = {};
          val.trades = item["SummarizedTrades"][0]["SummarizedTrade"];
          val.ticker = item["Symbol"];
          return val;
        });
        // Makes all times consistent
        for (let idx in json){
          json[idx].trades = _.filter(json[idx].trades, function(item){
            let time = item.Time[0];
            for (let i in acceptableTimes){
              if (time.includes(acceptableTimes[i])) return true;
            }
            return false;
          });
        }
        try {
          // Execute simulation
          var val = simulate(req.body.code, req.body.stocks, json, parseFloat(req.body.startingCash));
          res.send(val);
        } catch(err){
          console.log(err);
        }
      }
    });
  })
  .catch(function(error) {
    console.log(error);
    res.json(error)
  });
})

module.exports = router
