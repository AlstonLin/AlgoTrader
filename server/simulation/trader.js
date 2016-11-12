class Trader {
  constructor(startingCash){
    this.currentCash = startingCash;
    this.stockMap = {};
    this.buyHistory = [];
    this.sellHistory = [];
    this.time = undefined;
    this.addStock = this.addStock.bind(this);
    this.getStock = this.getStock.bind(this);
    this.getPortfolioValue = this.getPortfolioValue.bind(this);
  }
  addStock(stock){
    this.stockMap[stock.ticker] = stock;
  }
  getStock(ticker){
    return this.stockMap[ticker];
  }
  getPortfolioValue(){
    let portfolioValue = 0;
    for (let key in this.stockMap){
      let stock = this.stockMap[key];
      portfolioValue += stock.quantityOwned * stock.price;
    }
    return portfolioValue;
  }
}

module.exports = Trader;
