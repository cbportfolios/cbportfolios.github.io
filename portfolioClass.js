function Portfolio(d,maxBonds,index,total) {
	this.index = index;
	this.total = total;

	this.animating = false;
	this.vel = 0;
		
	this.d = d;
	this.selected = false;
	this.bondIds = new Array(maxBonds);	// this identifies the bonds selected
										// for this portfolio
	for (var k = 0 ; k < maxBonds ; k++) { 
		this.bondIds[k] = false;
	}
		
	this.oldVol = 0;
	this.vol = 0;
	this.modifiedDuration = 0;
	
	this.x = 0;			// set and updated by display method
	this.y = 0;			// likewise
	this.barWidth;		// likewise
	
	this.volSumTerms = [];	// *weighted* modified durations of bonds in this portfolio
	
	this.flash = false;		// so that the first portfolio looks clickable
	this.flashCount = 0;
}

// find volatility of the portfolio (% price change)
Portfolio.prototype.findVol = function(_bonds,ytmChange) {
	var totalValue = 0;
	this.modifiedDuration = 0;
	
	// sum market prices of the bonds in this portfolio
	for (var i = 0 ; i < _bonds.length ; i++) {
		if (this.bondIds[i]) {
			totalValue += _bonds[i].price;
		}
	}
	
	this.volSumTerms = [];	// flush
	// summation of weighted modD's of bonds in this portfolio
	for (var i = 0 ; i < _bonds.length ; i++) {
		if (this.bondIds[i]) {
			var term = (_bonds[i].modifiedDuration*_bonds[i].price/totalValue);
			this.volSumTerms.push(term);
			this.modifiedDuration += term;
		}
	}
	
	// find the % change in price for a given change in Yield to Maturity
	var newVol = -1*this.modifiedDuration*ytmChange*100;
	
		this.oldVol = this.vol;
		this.vol = newVol;
		this.animating = true;
		this.flash = false;
}

Portfolio.prototype.chosen = function(mx,my,origin,spans,maxY,barWidth) {		
		// check if arc clicked
		if (dist(mx,my,this.x,this.y) < barWidth/2 && my < this.y) {
			return true;
		}
		
		// check if bar clicked
		if (mx > this.x-barWidth/2 && mx < this.x+barWidth/2) {
			if (my < origin.y && my > this.y) {
				return true;
			}
		}
		
		return false;
}

Portfolio.prototype.display = function(origin,spans,maxY,barWidth,_bonds) {
	var mass = 0.8,springK = 0.008,damp = 0.9;	// spring [related] constants 

	var xp =	origin.x+spans.x/(2*this.total)+spans.x*this.index/this.total;
	var yp = origin.y-spans.y*this.oldVol/maxY;
	var out = Math.round(this.vol*100)/100;			// text output if required
	
	// to animate the bars, a spring model is used over 
	// safer cosine ease because the bouncing up and 
	// down gives a better sense of volatility
	if (this.animating) {
				var path = (spans.y*this.vol/maxY)-(spans.y*this.oldVol/maxY);			
				var sep = (origin.y-spans.y*this.vol/maxY)-this.y;	// X
				var force = springK*sep;														// F = KX
				var acc = force/mass;																// A = F/M
						this.vel = (this.vel+acc)*damp; 								// V(i+i) = V(i)+A(i)*damp
						this.y += this.vel;
								
				if (Math.abs(this.vel) < 0.008 && Math.abs(sep) < 3 || this.y > origin.y) {
					this.animating = false;
					this.y = Math.round(yp-path);	// to nearest pixel
					this.vel = 0;
					this.oldVol = this.vol;
				}
	} else {
			this.y = Math.round(yp);	// to nearest pixel
	}
	
	this.x = Math.round(xp);			// to nearest pixel
	
	// tab that user selects to
	// start building a portfolio
	
	fill(150);
	
	if (this.selected) { 
		fill(109,168,102);
	}
	
	// flashing arc/tab highlights to user that portfolio/bar is clickable
	if (this.y == origin.y) arc(this.x,this.y,barWidth,barWidth,Math.PI,0);
	
	if (this.flash) {
		fill(240,250,42,Math.round((0.5-0.5*Math.cos(Math.PI*this.flashCount/60))*255));	// cosine ease
		this.flashCount = this.flashCount > 120 ? this.flashCount = 0 : this.flashCount+1.5;
	}
	
	if (this.y == origin.y) arc(this.x,this.y,barWidth,barWidth,Math.PI,0);

	rectMode(CORNER);
		
	noStroke();
	noSmooth();
	
	// since modified duration is a measure of price-sensitivity to YTM changes,
	// the bar is coloured by the proportion of price-sensitivity contributed
	// by each bond (weighted_modD_for_bond/portfolio_modD)
	
	var startY = origin.y;
	for (var i = 0, k = 0 ; i < _bonds.length ; i++) {
			if(this.bondIds[i]) {
				fill(color(_bonds[i].htmlHSL));
				var spanY = (this.y-origin.y)*this.volSumTerms[k++]/this.modifiedDuration;
						rect(this.x-barWidth/2,startY,barWidth,spanY);	// stack the bars
						startY += spanY;
			}
	}
	
	noFill();
	
	// outline the bar if it is the active/selected one
	if (this.selected || this.vol == 0) {	// second condition to show descent of unselected bars
		stroke(50);													// auto-triggered to return to 0
		rect(this.x-barWidth/2,origin.y,barWidth,this.y-origin.y);
	}
	
	if (this.selected) {
		noStroke();
		fill(100);
		textAlign(CENTER,CENTER);
		text(out+"%",this.x,this.y-20);
	}
	
	noStroke();
	
	textAlign(CENTER,CENTER);
	textSize(12);
	fill(100);
	if (this.selected) fill(0);
	
	text(this.index+1,this.x,origin.y+this.d/2); // identify the bar on the x axis
}