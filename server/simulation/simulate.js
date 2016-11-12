let Trader = require('./trader.js');
let Stock = require('./stock.js');

var simulateTrades = function(AlgoTrader, tradingData){
  let periods = tradingData[0].trades.length;
  for (let i = 0; i < periods; i++){
    let time = tradingData[0].trades[i].Time[0];
    // Runs through each stock ticker
    for (let j = 0; j < tradingData.length; j++){
      let stockData = tradingData[j].trades[i];
      let stockTicker = tradingData[j].ticker[0];
      let stock = AlgoTrader.getStock(stockTicker);
      if (!stock){
        console.log("Stock with ticker " + stockTicker + " was not defined in the given stocks array for simulate()");
        continue;
      }
      stock.updateAttributes(stockData);
      AlgoTrader.time = stockData.Time[0];
      AlgoTrader.stockUpdate(stock);
    }
  }
};

module.exports = function(code, stocks, trainingData, tradingData, startingCash){
  let trader = new Trader(0); 
  // Creates the stocks
  for (let idx in stocks){
    let stock = stocks[idx];
    let stockObj = new Stock(trader, stock["ticket"], stock["company"], stock["industry"]);
    trader.addStock(stockObj);
  }
  // This expects the code to set the variable stockUpdate (i.e. AlgoTrader.stockUpdate = function(stock){ ) ...
  let AlgoTrader = trader;
  eval("(function(){" + code + "}())");
  // Training Code
  simulateTrades(AlgoTrader, trainingData);
  AlgoTrader.trainingOnly = false;
  AlgoTrader.currentCash = startingCash;
  // Runs through the tradingData and simulates it
  simulateTrades(AlgoTrader, tradingData);
  let portfolioValue = AlgoTrader.getPortfolioValue();
  let data = {
    cash: AlgoTrader.currentCash,
    portfolioValue: portfolioValue,
    totalValue: AlgoTrader.currentCash + portfolioValue,
    percentOfOriginal: (AlgoTrader.currentCash + portfolioValue) / startingCash,
    buyHistory: AlgoTrader.buyHistory,
    sellHistory: AlgoTrader.sellHistory,
    tradingData: tradingData
  }
  return data;
}
