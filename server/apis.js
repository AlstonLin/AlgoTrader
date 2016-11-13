let router = require('express').Router();
let path = require('path');
let axios = require('axios')
let parseString = require('xml2js').parseString
let _ = require('lodash');
let simulate = require('./simulation/simulate'); 
let Deferred = require('deferred');

const NASDAQ_TOKEN = 'BC2B181CF93B441D8C6342120EB0C971'

const TRADES_URL = 'http://ws.nasdaqdod.com/v1/NASDAQAnalytics.asmx/GetSummarizedTrades'

router.get("/stocks", function (req, res) {
	res.sendFile(path.join(__dirname, "/stocks.json"))
})

router.post("/algorithmSimulation", function (req, res) {
  console.log("Request:" + JSON.stringify(req.body));
  let mainData = [];
  // Parses ticker symbols
  let symbols = _.map(req.body.stocks, function(stock){
    return stock.ticket;
  });
  symbols.push("SPY");
  var trainingStarteDate = new Date(req.body.startTime)
  var trainingEndDate = new Date(req.body.endTime)
  trainingStarteDate.setDate(trainingStarteDate.getDate() - 30)
  trainingEndDate.setDate(trainingEndDate.getDate() - 30)

  let startTrainingStr = trainingStarteDate.getMonth() + "/" + trainingStarteDate.getDate() + "/" + trainingStarteDate.getFullYear() + " 09:30:00";
  let endTrainingStr = trainingEndDate.getMonth() + "/" + trainingEndDate.getDate() + "/" + trainingEndDate.getFullYear() + " 15:30:00";

  function getMainData(training) {
    let def = Deferred();
    let promise = Promise.resolve();
    while (symbols.length != 0){
      let symStr = null;
      if (symbols.length == 1){
        symStr = symbols[0] + ",";
        symbols.shift();
      } else {
        symStr = symbols[0] + "," + symbols[1] + ",";
        symbols.shift();
        symbols.shift();
      }
      promise = promise.then(function(data){
        if (!data) return getSymbols(symStr);
        return parseAndSimplify(data.data).then(function(result){
          if (data){
            mainData = mainData.concat(result);
          }
          return getSymbols(symStr);
        });
      });
    }
    // The last promise
    promise.then(function(data){
      return parseAndSimplify(data.data).then(function(result){
        if (data){
          mainData = mainData.concat(result);
        }
        def.resolve(mainData);
      });
    });
    return def.promise;
  }

  function getSymbols(syms){
    console.log("GET: " + syms);
    return axios.get(TRADES_URL, {
      params: {
        '_Token' : NASDAQ_TOKEN,
        'Symbols' : syms,
        'StartDateTime' : req.body.startTime + " 09:30:00",
        'EndDateTime' : req.body.endTime + " 15:30:00",
        'MarketCenters' : '' ,
        'TradePrecision': 'Hour',
        'TradePeriod':'1'
      }
    })
  }

  function getTrainingSymbols(syms) {
    return axios.get(TRADES_URL, {
      params: {
        '_Token' : NASDAQ_TOKEN,
        'Symbols' : syms,
        'StartDateTime' : startTrainingStr,
        'EndDateTime' : endTrainingStr,
        'MarketCenters' : '' ,
        'TradePrecision': 'Hour',
        'TradePeriod':'1'
      }
    })
  }

  getMainData()(function() {
    try {
      let indexData = [];
      mainData = _.filter(mainData, function(item){
        if (item.ticker == "SPY"){
          indexData.push(item);
          return false;
        }
        return true;
      });
      // Execute simulation
      let val = simulate(req.body.code, req.body.stocks, mainData, indexData, parseFloat(req.body.startingCash));
      res.send(val);
    } catch(err){
      console.log(err.message);
      res.status(500).json({
        error: err.message
      });
    }
  });
});


function parseAndSimplify(data) {
  let promise = new Promise(function(resolve, reject){
    parseString(data, function (err, json) {
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
        resolve(json)
      }
    })
  });
  return promise;
}

module.exports = router


