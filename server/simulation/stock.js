class Stock {
  constructor(trader, ticker, name, industry){
    this.quantityOwned = 0;
    this.trader = trader;
    this.ticker = ticker;
    this.industry = industry;
    this.name = name;
    // Attributes that should be updated every hour
    this.price = undefined;
    this.dailyLow = undefined;
    this.dailyHigh = undefined;
    // TODO: Add more attributes
  });
  
  updateAttributes(data){
    // TODO: Set the attributes based on the data values
  }

  buy(quantity){
    var totalCost = quantity * this.price;
    if (totalCost > this.trader.currentCash){
      return false;
    }
    this.trader.currentCash -= totalCost;
    this.quantityOwned += quantity;
  }

  sell(quantity){
    if (quantity > this.quantityOwned){
      return false;
    }
    this.quantityOwned -= quantity;
    this.trader.currentCash += quantity * this.price;
  }
}
