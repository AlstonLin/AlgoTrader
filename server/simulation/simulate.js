var Trader = require('./trader.js');

module.exports = function(code, stocks, tradingData, startingCash){
  var trader = new Trader(startingCash);
  // Creates the stocks
  for (let idx in stocks){
    var stock = stock[idx];
    trader.addStock(new Stock(trader, stocks.company, stocks.ticket));
  }
  // This expects the code to set the variable stockUpdate (i.e. AlgoTrader.stockUpdate = function(stock){ ) ...
  var AlgoTrader = trader;
  eval("(function(){" + code + "}())");
  // Runs through the tradingData and simulates it
  console.log(AlgoTrader.stockUpdate(""));
}
