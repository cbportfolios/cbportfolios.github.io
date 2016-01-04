function Bond(parValue, couponRate, marketPrice, timeToMaturity, yieldToMaturity, macD, modD,ytmChange,id) {
	this.parVal = parValue;
	this.coupon = couponRate;
	this.price = marketPrice;
	this.matTime = timeToMaturity;
	this.ytm = yieldToMaturity;		// redemption yield
	this.macaulayDuration = macD;
	this.modifiedDuration = modD;
	this.name = id;
	this.vol = -1*modD*ytmChange*100;	// % price change for half-percent change in YTM
	this.htmlHSL = "hsl(160,100%,50%)";
}