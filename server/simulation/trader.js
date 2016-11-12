class Trader {
  constructor(startingCash, stocks){
    this.currentCash = startingCash;
    this.stocks = [];
    this.addStock = this.addStock.bind(this);
  }
  addStock(stock){
    this.stocks.push(stock);
  }
}

module.exports = Trader;
