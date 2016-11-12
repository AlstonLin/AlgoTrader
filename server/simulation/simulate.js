var Trader = require('./trader.js');

module.exports = function(code, stocks, tradingData, startingCash){
  var trader = new Trader(startingCash);
  // Creates the stocks
  for (let idx in stocks){
    var stock = stocks[idx];
    trader.addStock(new Stock(trader, stock.ticket, stock.company));
  }
  // This expects the code to set the variable stockUpdate (i.e. AlgoTrader.stockUpdate = function(stock){ ) ...
  var AlgoTrader = trader;
  eval("(function(){" + code + "}())");
  // Runs through the tradingData and simulates it
  return AlgoTrader.stockUpdate("");
}
