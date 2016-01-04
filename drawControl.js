var bonds = [];
var portfolios = [];

var origin,spans;						// 2D vector objects
var maxY,barWidth,padding;	// scalars

var stage;
var showInstructions;
var instruction1,instruction2;

function setup() {
	initializeBonds();
	var container = document.getElementById("myContainer");
	var myCanvas = createCanvas(500,400);
			myCanvas.parent(container);
		
  textFont("Arial");
  rectMode(CORNERS);
  noStroke();
  
  initializePortfolios(10);
	initializeInstructions();
	
	var canv = $("canv");
			canv.setAttribute("rowspan",bonds.length+2);
		//canv.setAttribute("colspan",1);
		
	var canvasRow = $("io");
	
		var headRow = c$("tr");
				headRow.style.background = "#d3d3d3";
				headRow.style.textAlign = "center";
		var c1 = c$("td");
		var c2 = c$("td");
				c2.innerHTML = "Bond";
		var c3 = c$("td");
				c3.innerHTML = "Coupon %";
		var c4 = c$("td");
				c4.innerHTML = "Price £";
		var c5 = c$("td");
				c5.innerHTML = "Years";
	
				appendChildren(headRow,c1,c2,c3,c4,c5);
				canvasRow.appendChild(headRow);
	
	for (var i = 0 ; i < bonds.length ; i++) {
		var checkRow = c$("tr");
		var checkCell = c$("td");
				
		var nameCell = c$("td");
				nameCell.innerHTML = bonds[i].name;
				nameCell.style.background = bonds[i].htmlHSL;
				nameCell.style.width = "25px";
				nameCell.style.padding = "2px";
				//nameCell.style.height = "10px";

		var couponCell = c$("td");
				couponCell.innerHTML = Math.round(10000*bonds[i].coupon)/100;
		var priceCell = c$("td");
				priceCell.innerHTML = bonds[i].price;
		var timeCell = c$("td");
				timeCell.innerHTML = bonds[i].matTime;		
		var checkButton = c$("input");
				checkButton.setAttribute("type","checkbox");
				checkButton.checked = false;
			
	// necessary to do it this way because otherwise i (index) will always
	// evaluate to its final loop value for all the functions:
	// http://stackoverflow.com/questions/750486/javascript-closure-inside-loops-simple-practical-example
			
			var f = (function(index,bds) {
        					return function() {
            					for (var k = 0 ; k < portfolios.length ; k++) {
												if (portfolios[k].selected) {
														portfolios[k].bondIds[index] = !portfolios[k].bondIds[index];
														portfolios[k].findVol(bds,-0.005);
														k = portfolios.length-1; 	// break out of loop
												}
											}
											showInstructions = false;	// refers to global var
        					};
    					}(i,bonds));	// define and invoke
			
			checkButton.onchange = f;
			
			//checkCell.onclick = g;
			
			checkCell.appendChild(checkButton);
			appendChildren(checkRow,checkCell,nameCell,couponCell,priceCell,timeCell);
			canvasRow.appendChild(checkRow);
			
	} // end of outer loop
			
			// Final row with data source information
			
			var sourceRow = c$("tr");
					//sourceRow.setAttribute("colspan",5);
			var sourceCell = c$("td");
					sourceCell.setAttribute("colspan",5);
					sourceCell.innerHTML = "Source: FT Gilts UK, 21.12.2015"
					sourceCell.style.textAlign = "right";
					sourceCell.style.font = "12px georgia";
					sourceCell.style.padding = "7px";
					sourceCell.style.color = "#696969";
					
			sourceRow.appendChild(sourceCell);
			canvasRow.appendChild(sourceRow);
			
			var tech = $("method");
					tech.onclick = function() { window.open("technicalDetails.html"); };
			
			initializePresets();
				
			// --- Display Parameters --- 

  		padding = Math.round(height/8);
			origin = {x: 45,y: height-3*padding/2};
   		spans = {x:width-padding/5-origin.x,y:origin.y-padding};
  		maxY = 12.5;
  		barWidth = Math.round(spans.x/(18));
  		if (barWidth%2 != 0) barWidth++;	// important for pixel rounding 
  																			// (see portfolio class)

	stage = 0;
	showInstructions = true;
}

// ------------------------------------------
// ---- Draw loop (refreshes the canvas) ----
// ------------------------------------------

function draw() {
  background(240,248,255);
  
  if (showInstructions) {
  	fill(100);
  	textAlign(LEFT,CENTER);
  	noStroke();
  	textSize(14);
  	text(instruction1,origin.x+spans.x/2-140,origin.y-spans.y,300,100);
  	text(instruction2,origin.x+spans.x/2-140,origin.y-spans.y+104,300,130);
  }
  
  // y axis dotted reference lines
	for (var i = 0 ; i < spans.x ; i+=3) {
		stroke(180);
		point(origin.x+i,origin.y-Math.round(2*spans.y*2/maxY));
		point(origin.x+i,origin.y-Math.round(4*spans.y*2/maxY));
	}
  
  for (var k in portfolios) portfolios[k].display(origin,spans,maxY,barWidth,bonds);
  
  axes();

}

function keyTyped() {
	if (key === 'o') {
		if (stage == 0) {
			
			for (var i = 0 ; i < portfolios.length ; i++) {
				for (var l = 0 ; l < bonds.length ; l++) portfolios[i].bondIds[l] = false;
				portfolios[i].bondIds[i] = true;
				portfolios[i].findVol(bonds,-0.005);
			}

			stage = 1;
		} else {
	
		for (var i = 0 ; i < portfolios.length ; i++) {
			for (var k = 0 ; k < portfolios[i].bondIds.length ; k++) {
				if (Math.random() > 0.5) {
					portfolios[i].bondIds[k] = !portfolios[i].bondIds[k];
				}
			}
			portfolios[i].findVol(bonds,-0.005);
		}
		stage = 0;
	}	// end of else
	}
}

function axes() {
	stroke(0);
	strokeWeight(1);
	textSize(13);
	var upperX = upperY = 0;
	for (var i in bonds) {
		if (bonds[i].coupon > upperX) upperX = bonds[i].coupon;
		if (bonds[i].vol > upperY) upperY = bonds[i].vol;
	}
	
	noSmooth();
	
	stroke(150);
	noSmooth();
	
	// x axis	
	line(origin.x,origin.y,origin.x+spans.x,origin.y);
	
	// y axis		
	line(origin.x,origin.y,origin.x,origin.y-spans.y);
	
	// y axis ticks
	textAlign(RIGHT,CENTER);
	for (var i = 0 ; i <= 6  ; i++) {		// major
		var majStep = Math.round(spans.y*2/maxY);
		var yp = origin.y-i*majStep;
				if (i != 0) line(origin.x,yp,origin.x-3,yp);
				fill(150);
				noStroke();
				text(i*2,origin.x-5,yp);
				stroke(150);
	}
	
	smooth();
	noStroke();
	fill(150);
	
	//text(maxY+"%",origin.x-padding/2,origin.y-spans.y);

	textAlign(CENTER,CENTER);
	text("My Bond Portfolios",width/2,origin.y+30);
	textAlign(LEFT,CENTER);
	text("*For a half percent increase Yield to Maturity",10,height-10);
	
	textAlign(CENTER,CENTER);
	push();
		translate(origin.x-30,height/2);
		rotate(3*PI/2);
		text("% Decrease in Price*",0,0);
	pop();
}

// --- Mouse utility functions ---

function mouseClicked() {
	// only interact with the canvas if mouse is over it
	if (mouseOverCanvas()) {
			for (var k in portfolios) {			// check if mouse over portfolio icon
				portfolios[k].selected = false;
				if (portfolios[k].chosen(mouseX,mouseY,origin,spans,maxY,barWidth)) {
					showInstructions = false;
					portfolios[k].selected = true;
					var checksParent = $("io");
							checks = checksParent.getElementsByTagName("input");
						for (var i = 0 ; i < checks.length ; i++) {
							checks[i].checked = portfolios[k].bondIds[i];
						}
				}
			}
	}
}

function mouseOverCanvas() {
	if ((mouseX > 0 && mouseX < width) 
		&& (mouseY > 0 && mouseY < height)) {
		return true;
	} else {
		return false;
	}
}

// --- DOM utility functions ---

function appendChildren(dad) {
	for (var i=1 ; i < arguments.length ; i++) {
			dad.appendChild(arguments[i]);
	}
}

function $(s) {
	return document.getElementById(s);
}

function c$(s) {
	return document.createElement(s);
}

// --- Initialisation functions ---

function initializePresets() {
			
	var dem1 = $("demo1");
					dem1.onclick = function() {
							// checkboxes to false
							var checksParent = $("io");
							var checks = checksParent.getElementsByTagName("input");
									for (var i in checks) checks[i].checked = false;
												
								for (var i = 0 ; i < portfolios.length-2 ; i++) {
										// remove all bonds from portfolios
										portfolios[i].bondIds = portfolios[i].bondIds.map(function() {return false;});
										// only add i'th bond to i'th portfolio
										portfolios[i].bondIds[i] = true;
										if (portfolios[i].selected) checks[i].checked = true;
										portfolios[i].findVol(bonds,-0.005);
								}
								stage = 1;
								showInstructions = false;
								return false;	// to stop the page from scrolling to the top
					};
					
				var dem2 = $("demo2");
						dem2.onclick = function() {
								// checkboxes to false
								var checksParent = $("io");
								var checks = checksParent.getElementsByTagName("input");
										for (var i in checks) checks[i].checked = false;
										
								for (var l = 0 ; l < portfolios.length ; l++) {
									portfolios[l].selected = false; // deselect all
									portfolios[l].bondIds = portfolios[l].bondIds.map(function() {return false;});
									portfolios[l].findVol(bonds,-0.005);
								}
						
									for (var i = 0 ; i < bonds.length ; i++) {
										portfolios[7].bondIds[i] = i == 7 ? true : false;
										portfolios[8].bondIds[i] = i == 8 ? true : false;
										portfolios[9].bondIds[i] = i == 9 ? true : false;
										
										portfolios[7].findVol(bonds,-0.005);
										portfolios[8].findVol(bonds,-0.005);
										portfolios[9].findVol(bonds,-0.005);
									}
									
									portfolios[7].selected = true;	// emphasis
									checks[7].checked = true;
									
									showInstructions = false;
									return false;
						};
						
				var dem3 = $("demo3");
						dem3.onclick = function() {
								// checkboxes to false
								var checksParent = $("io");
								var checks = checksParent.getElementsByTagName("input");
										for (var i = 0 ; i < checks.length ; i++) checks[i].checked = false;
									
								for (var i = 0 ; i < portfolios.length ; i++) {
									portfolios[i].selected = false; // deselect all
									for (var l = 0 ; l < bonds.length ; l++) { 
										portfolios[i].bondIds[l] = i != l || l > 4 ? false : true; 
									}
							
									portfolios[i].findVol(bonds,-0.005);
								}
								
								// select this one just to remind user of 'selected' status
								portfolios[3].selected = true;
								checks[3].checked = true;
								
								//stage = 1;
								showInstructions = false;
								return false;
						};
				
				var dem4 = $("demo4");
						dem4.onclick = function() {
								// checkboxes to false
								var checksParent = $("io");
								var checks = checksParent.getElementsByTagName("input");
										for (var i = 0 ; i < checks.length ; i++) checks[i].checked = false;
										
								for (var i = 0 ; i < portfolios.length ; i++) {
									portfolios[i].selected = false;	// deselect all for now
									portfolios[i].bondIds = portfolios[i].bondIds.map(function() {return false; });
									for (var k = 0 ; k < portfolios[i].bondIds.length-2 ; k++) {
										if (Math.random() > 0.5 && i < portfolios.length-2) {
											portfolios[i].bondIds[k] = !portfolios[i].bondIds[k];
										} else {
											portfolios[i].bondIds[k] = false;
										}
									}
									portfolios[i].findVol(bonds,-0.005);
									showInstructions = false;
								}
								
								// select this one just to remind user of 'selected' status
								portfolios[5].selected = true;
								checks[5].checked = true;
								
								// populate the checkboxes
								for (var i = 0 ; i < checks.length ; i++) {
									checks[i].checked = portfolios[5].bondIds[i];
								}
								
								return false;
						};
						
				var reset = $("reset");

						reset.onclick = function() {
								// checkboxes to false
								var checksParent = $("io");
								var checks = checksParent.getElementsByTagName("input");
										for (var i = 0 ; i < checks.length ; i++) checks[i].checked = false;
						
								for (var l = 0 ; l < portfolios.length ; l++) {
									for (var i = 0 ; i < bonds.length ; i++) {
										portfolios[l].bondIds[i] = false;
									}
									portfolios[l].findVol(bonds,-0.005);
									portfolios[l].selected = false;
								}
									showInstructions = true;
									portfolios[0].selected = true;
									portfolios[0].flash = true;
										return false;
						};

}

function initializePortfolios(n) {
	for (var i = 0 ; i < n ; i++) {
			portfolios.push(new Portfolio(30,bonds.length,i,n));
	}
	portfolios[0].flash = true;
	portfolios[0].selected = true;
}

function initializeBonds() {
	// these lines of JavaScript source are built in MS Excel using
	// some string concatenation. They are just pasted in here
	bonds.push(new Bond(100,0.0175,101.43,1.5,0.015,1.48,1.48,-0.005,"Gilt"));
	bonds.push(new Bond(100,0.015,100.86,5,0.0132,4.85,4.786,-0.005,"Gilt"));
	bonds.push(new Bond(100,0.04,115.79,6,0.0134,5.49,5.417,-0.005,"Gilt"));
	bonds.push(new Bond(100,0.0425,124.28,11,0.0196,9.226,9.049,-0.005,"Gilt"));
	bonds.push(new Bond(100,0.0425,126.99,16,0.0227,12.425,12.149,-0.005,"Gilt"));
	bonds.push(new Bond(100,0.0425,128.59,20,0.0245,14.639,14.289,-0.005,"Gilt"));
	bonds.push(new Bond(100,0.045,138.46,26,0.0252,17.385,16.957,-0.005,"Gilt"));
	bonds.push(new Bond(100,0.04,143.29,44,0.44,24.93,24.34,-0.005,"Gilt"));
	
	bonds.push(new Bond(100,0.07,143.29,44,0.04666,18.23,17.42,-0.005,"Virtual"));
	bonds.push(new Bond(100,0.1,143.29,44,0.0686,14.2,13.29,-0.005,"Virtual"));
	
	// assign colours to the bonds
	var cols = [];
	for (var k in bonds) {
		var hue = Math.round(map(k,0,bonds.length-1,10,300));
				cols.push(hue);
	}
	
	// swap some colour neighbours to add contrast (colour blindness)
	for (var k = 0 ; k < cols.length ; k++) {
		if (k%3 == 0 && k != cols.length-1) {
			var hold = cols[k];
			cols[k] = cols[k+1];
			cols[k+1] = hold;
		}
		if (k < cols.length-2) {
			bonds[k].htmlHSL = "hsl("+cols[k]+", 70%, 63%)";
		} else {
			bonds[k].htmlHSL = "hsl(0, 0%, 50%)";
		}
	}
	
}

function initializeInstructions() {
	instruction1 = "Use this interactive graph to explore how bonds of varying maturity lengths ";
	instruction1 += "and coupon rates will decrease in value for an increase in interest rates";
	
	instruction2 = "Start by clicking on the links in the article below. ";
	instruction2 += "You can also interact directly with the graph by selecting bonds ";
	instruction2 += "on the right hand side to package into portfolio 1.";
	instruction2 += " The bar shows the % decrease in price for the portfolio for a half percent increase";
	instruction2 += " in interest rates";
}