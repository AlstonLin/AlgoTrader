class Stock {
  constructor(trader, ticker, name, industry){
    this.quantityOwned = 0;
    this.trader = trader;
    this.ticker = ticker;
    this.name = name;
    this.industry = industry;
    // Attributes that should be updated every hour
    this.price = undefined;
    this.dailyLow = undefined;
    this.dailyHigh = undefined;
    this.volume = undefined;
    this.VWAP = undefined;
    this.TWAP = undefined;
    this.trades = undefined;
    this.updateAttributes = this.updateAttributes.bind(this);
    this.buy = this.buy.bind(this);
    this.sell = this.sell.bind(this);
  };
  
  updateAttributes(data){
    this.price = parseFloat(data.Last[0]);
    this.dailyLow = parseFloat(data.Low[0]);
    this.dailyHigh = parseFloat(data.High[0]);
    this.volume = parseFloat(data.Volume[0]);
    this.VWAP = parseFloat(data.VWAP[0]);
    this.TWAP = parseFloat(data.TWAP[0]);
    this.trades = parseFloat(data.Trades[0]);
  }

  buy(quantity){
    var totalCost = quantity * this.price;
    if (totalCost > this.trader.currentCash){
      return false;
    }
    this.trader.currentCash -= totalCost;
    this.quantityOwned += quantity;
    this.trader.buyHistory.push({
      quantity: quantity,
      price: this.price,
      total: totalCost,
      time: this.trader.time
    });
    return true
  }

  sell(quantity){
    if (quantity > this.quantityOwned){
      return false;
    }
    this.quantityOwned -= quantity;
    this.trader.currentCash += quantity * this.price;
    this.trader.sellHistory.push({
      quantity: quantity,
      price: this.price,
      total: (quantity * this.price),
      time: this.trader.time
    });
  }
}

module.exports = Stock;
