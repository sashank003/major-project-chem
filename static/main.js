/*jshint esversion: 6 */
document.addEventListener("DOMContentLoaded", theDomHasLoaded, false);

function theDomHasLoaded(e) {
	let r = sessionStorage.getItem('sessionData');
	if (r == "a")
	{
		document.getElementById("loading").style.display = "none";
	}
//	submit();
	if ( window.history.replaceState ) {
		window.history.replaceState( null, null, window.location.href);
	}
}

document.onreadystatechange = function(e) {
	let r = sessionStorage.getItem('sessionData');
	if (r == "a")
	{
		document.getElementById("loading").style.display = "none";
	}
	changes1();
	changes2();
	changes3();
};	
//function submit(){
//  	document.getElementById("hidden1").value = document.getElementById("v1").value;
//	document.getElementById("hidden2").value = document.getElementById("v2").value;
//}
//range slider
var range1,range2,range3,range4,range5,range6,range7,range8,range9;
window.addEventListener("DOMContentLoaded",() => {
	"use strict";
	window.range1 = new RollCounterRange_R("#range1");
	window.range2 = new RollCounterRange_G("#range2");
	window.range3 = new RollCounterRange_B("#range3");
	window.range4 = new RollCounterRange_R("#range4");
	window.range5 = new RollCounterRange_G("#range5");
	window.range6 = new RollCounterRange_B("#range6");
	window.range7 = new RollCounterRange_R("#range7");
	window.range8 = new RollCounterRange_G("#range8");
	window.range9 = new RollCounterRange_B("#range9");
});

class RollCounterRange_R {
	constructor(id) {
		this.el = document.querySelector(id);
		this.srValue = null;
		this.fill = null;
		this.digitCols = null;
		this.lastDigits = "";
		this.rollDuration = 0; // the transition duration from CSS will override this
		this.trans09 = false;

		if (this.el) {
			this.buildSlider();
			this.el.addEventListener("input",this.changeValue.bind(this));
		}
	}
	buildSlider() {
		// create a div to contain the <input>
		let rangeWrap = document.createElement("div");
		rangeWrap.className = "range_R";
		this.el.parentElement.insertBefore(rangeWrap,this.el);

		// create another div to contain the <input> and fill
		let rangeInput = document.createElement("span");
		rangeInput.className = "range__input_R";
		rangeWrap.appendChild(rangeInput);

		// range fill, place the <input> and fill inside container <span>
		let rangeFill = document.createElement("span");
		rangeFill.className = "range__input-fill_R";
		rangeInput.appendChild(this.el);
		rangeInput.appendChild(rangeFill);

		// create the counter
		let counter = document.createElement("span");
		counter.className = "range__counter";
		rangeWrap.appendChild(counter);

		// screen reader value
		let srValue = document.createElement("span");
		srValue.className = "range__counter-sr";
		srValue.textContent = "0";
		counter.appendChild(srValue);

		// column for each digit
		for (let D of this.el.max.split("")) {
			let digitCol = document.createElement("span");
			digitCol.className = "range__counter-column";
			digitCol.setAttribute("aria-hidden","true");
			counter.appendChild(digitCol);

			// digits (blank, 0–9, fake 0)
			for (let d = 0; d <= 11; ++d) {
				let digit = document.createElement("span");
				digit.className = "range__counter-digit";

				if (d > 0)
					digit.textContent = d == 11 ? 0 : `${d - 1}`;

				digitCol.appendChild(digit);
			}
		}

		this.srValue = srValue;
		this.fill = rangeFill;
		this.digitCols = counter.querySelectorAll(".range__counter-column");
		this.lastDigits = this.el.value;

		while (this.lastDigits.length < this.digitCols.length)
			this.lastDigits = " " + this.lastDigits;

		this.changeValue();

		// use the transition duration from CSS
		let colCS = window.getComputedStyle(this.digitCols[0]),
			transDur = colCS.getPropertyValue("transition-duration"),
			msLabelPos = transDur.indexOf("ms"),
			sLabelPos = transDur.indexOf("s");

		if (msLabelPos > -1)
			this.rollDuration = transDur.substr(0,msLabelPos);
		else if (sLabelPos > -1)
			this.rollDuration = transDur.substr(0,sLabelPos) * 1e3;
	}

	changeValue() {
		// keep the value within range
		if (+this.el.value > this.el.max)
			this.el.value = this.el.max;

		else if (+this.el.value < this.el.min)
			this.el.value = this.el.min;

		// update the screen reader value
		if (this.srValue)
			this.srValue.textContent = this.el.value;

		// width of fill
		if (this.fill) {
			let pct = this.el.value / this.el.max,
				fillWidth = pct * 100,
				thumbEm = 1 - pct;

			this.fill.style.width = `calc(${fillWidth}% + ${thumbEm}em)`;
		}
		
		if (this.digitCols) {
			let rangeVal = this.el.value;

			// add blanks at the start if needed
			while (rangeVal.length < this.digitCols.length)
				rangeVal = " " + rangeVal;

			// get the differences between current and last digits
			let diffsFromLast = [];
			if (this.lastDigits) {
				rangeVal.split("").forEach((r,i) => {
					let diff = +r - this.lastDigits[i];
					diffsFromLast.push(diff);
				});
			}

			// roll the digits
			this.trans09 = false;
			rangeVal.split("").forEach((e,i) => {
				let digitH = 1.5,
					over9 = false,
					under0 = false,
					transY = e === " " ? 0 : (-digitH * (+e + 1)),
					col = this.digitCols[i];

				// start handling the 9-to-0 or 0-to-9 transition
				if (e == 0 && diffsFromLast[i] == -9) {
					transY = -digitH * 11;
					over9 = true;

				} else if (e == 9 && diffsFromLast[i] == 9) {
					transY = 0;
					under0 = true;
				}

				col.style.transform = `translateY(${transY}em)`;
				col.firstChild.textContent = "";

				// finish the transition
				if (over9 || under0) {
					this.trans09 = true;
					// add a temporary 9
					if (under0)
						col.firstChild.textContent = e;

					setTimeout(() => {
						if (this.trans09) {
							let pauseClass = "range__counter-column--pause",
								transYAgain = -digitH * (over9 ? 1 : 10);

							col.classList.add(pauseClass);
							col.style.transform = `translateY(${transYAgain}em)`;
							void col.offsetHeight;
							col.classList.remove(pauseClass);

							// remove the 9
							if (under0)
								col.firstChild.textContent = "";
						}

					},this.rollDuration);
				}
			});
			this.lastDigits = rangeVal;
		}
	}
}
class RollCounterRange_G {
	constructor(id) {
		this.el = document.querySelector(id);
		this.srValue = null;
		this.fill = null;
		this.digitCols = null;
		this.lastDigits = "";
		this.rollDuration = 0; // the transition duration from CSS will override this
		this.trans09 = false;

		if (this.el) {
			this.buildSlider();
			this.el.addEventListener("input",this.changeValue.bind(this));
		}
	}
	buildSlider() {
		// create a div to contain the <input>
		let rangeWrap = document.createElement("div");
		rangeWrap.className = "range_G";
		this.el.parentElement.insertBefore(rangeWrap,this.el);

		// create another div to contain the <input> and fill
		let rangeInput = document.createElement("span");
		rangeInput.className = "range__input_G";
		rangeWrap.appendChild(rangeInput);

		// range fill, place the <input> and fill inside container <span>
		let rangeFill = document.createElement("span");
		rangeFill.className = "range__input-fill_G";
		rangeInput.appendChild(this.el);
		rangeInput.appendChild(rangeFill);

		// create the counter
		let counter = document.createElement("span");
		counter.className = "range__counter";
		rangeWrap.appendChild(counter);

		// screen reader value
		let srValue = document.createElement("span");
		srValue.className = "range__counter-sr";
		srValue.textContent = "0";
		counter.appendChild(srValue);

		// column for each digit
		for (let D of this.el.max.split("")) {
			let digitCol = document.createElement("span");
			digitCol.className = "range__counter-column";
			digitCol.setAttribute("aria-hidden","true");
			counter.appendChild(digitCol);

			// digits (blank, 0–9, fake 0)
			for (let d = 0; d <= 11; ++d) {
				let digit = document.createElement("span");
				digit.className = "range__counter-digit";

				if (d > 0)
					digit.textContent = d == 11 ? 0 : `${d - 1}`;

				digitCol.appendChild(digit);
			}
		}

		this.srValue = srValue;
		this.fill = rangeFill;
		this.digitCols = counter.querySelectorAll(".range__counter-column");
		this.lastDigits = this.el.value;

		while (this.lastDigits.length < this.digitCols.length)
			this.lastDigits = " " + this.lastDigits;

		this.changeValue();

		// use the transition duration from CSS
		let colCS = window.getComputedStyle(this.digitCols[0]),
			transDur = colCS.getPropertyValue("transition-duration"),
			msLabelPos = transDur.indexOf("ms"),
			sLabelPos = transDur.indexOf("s");

		if (msLabelPos > -1)
			this.rollDuration = transDur.substr(0,msLabelPos);
		else if (sLabelPos > -1)
			this.rollDuration = transDur.substr(0,sLabelPos) * 1e3;
	}
	changeValue() {
		// keep the value within range
		if (+this.el.value > this.el.max)
			this.el.value = this.el.max;

		else if (+this.el.value < this.el.min)
			this.el.value = this.el.min;

		// update the screen reader value
		if (this.srValue)
			this.srValue.textContent = this.el.value;

		// width of fill
		if (this.fill) {
			let pct = this.el.value / this.el.max,
				fillWidth = pct * 100,
				thumbEm = 1 - pct;

			this.fill.style.width = `calc(${fillWidth}% + ${thumbEm}em)`;
		}
		
		if (this.digitCols) {
			let rangeVal = this.el.value;

			// add blanks at the start if needed
			while (rangeVal.length < this.digitCols.length)
				rangeVal = " " + rangeVal;

			// get the differences between current and last digits
			let diffsFromLast = [];
			if (this.lastDigits) {
				rangeVal.split("").forEach((r,i) => {
					let diff = +r - this.lastDigits[i];
					diffsFromLast.push(diff);
				});
			}

			// roll the digits
			this.trans09 = false;
			rangeVal.split("").forEach((e,i) => {
				let digitH = 1.5,
					over9 = false,
					under0 = false,
					transY = e === " " ? 0 : (-digitH * (+e + 1)),
					col = this.digitCols[i];

				// start handling the 9-to-0 or 0-to-9 transition
				if (e == 0 && diffsFromLast[i] == -9) {
					transY = -digitH * 11;
					over9 = true;

				} else if (e == 9 && diffsFromLast[i] == 9) {
					transY = 0;
					under0 = true;
				}

				col.style.transform = `translateY(${transY}em)`;
				col.firstChild.textContent = "";

				// finish the transition
				if (over9 || under0) {
					this.trans09 = true;
					// add a temporary 9
					if (under0)
						col.firstChild.textContent = e;

					setTimeout(() => {
						if (this.trans09) {
							let pauseClass = "range__counter-column--pause",
								transYAgain = -digitH * (over9 ? 1 : 10);

							col.classList.add(pauseClass);
							col.style.transform = `translateY(${transYAgain}em)`;
							void col.offsetHeight;
							col.classList.remove(pauseClass);

							// remove the 9
							if (under0)
								col.firstChild.textContent = "";
						}

					},this.rollDuration);
				}
			});
			this.lastDigits = rangeVal;
		}
	}
}
class RollCounterRange_B {
	constructor(id) {
		this.el = document.querySelector(id);
		this.srValue = null;
		this.fill = null;
		this.digitCols = null;
		this.lastDigits = "";
		this.rollDuration = 0; // the transition duration from CSS will override this
		this.trans09 = false;

		if (this.el) {
			this.buildSlider();
			this.el.addEventListener("input",this.changeValue.bind(this));
		}
	}
	buildSlider() {
		// create a div to contain the <input>
		let rangeWrap = document.createElement("div");
		rangeWrap.className = "range_B";
		this.el.parentElement.insertBefore(rangeWrap,this.el);

		// create another div to contain the <input> and fill
		let rangeInput = document.createElement("span");
		rangeInput.className = "range__input_B";
		rangeWrap.appendChild(rangeInput);

		// range fill, place the <input> and fill inside container <span>
		let rangeFill = document.createElement("span");
		rangeFill.className = "range__input-fill_B";
		rangeInput.appendChild(this.el);
		rangeInput.appendChild(rangeFill);

		// create the counter
		let counter = document.createElement("span");
		counter.className = "range__counter";
		rangeWrap.appendChild(counter);

		// screen reader value
		let srValue = document.createElement("span");
		srValue.className = "range__counter-sr";
		srValue.textContent = "0";
		counter.appendChild(srValue);

		// column for each digit
		for (let D of this.el.max.split("")) {
			let digitCol = document.createElement("span");
			digitCol.className = "range__counter-column";
			digitCol.setAttribute("aria-hidden","true");
			counter.appendChild(digitCol);

			// digits (blank, 0–9, fake 0)
			for (let d = 0; d <= 11; ++d) {
				let digit = document.createElement("span");
				digit.className = "range__counter-digit";

				if (d > 0)
					digit.textContent = d == 11 ? 0 : `${d - 1}`;

				digitCol.appendChild(digit);
			}
		}

		this.srValue = srValue;
		this.fill = rangeFill;
		this.digitCols = counter.querySelectorAll(".range__counter-column");
		this.lastDigits = this.el.value;

		while (this.lastDigits.length < this.digitCols.length)
			this.lastDigits = " " + this.lastDigits;

		this.changeValue();

		// use the transition duration from CSS
		let colCS = window.getComputedStyle(this.digitCols[0]),
			transDur = colCS.getPropertyValue("transition-duration"),
			msLabelPos = transDur.indexOf("ms"),
			sLabelPos = transDur.indexOf("s");

		if (msLabelPos > -1)
			this.rollDuration = transDur.substr(0,msLabelPos);
		else if (sLabelPos > -1)
			this.rollDuration = transDur.substr(0,sLabelPos) * 1e3;
	}
	changeValue() {
		// keep the value within range
		if (+this.el.value > this.el.max)
			this.el.value = this.el.max;

		else if (+this.el.value < this.el.min)
			this.el.value = this.el.min;

		// update the screen reader value
		if (this.srValue)
			this.srValue.textContent = this.el.value;

		// width of fill
		if (this.fill) {
			let pct = this.el.value / this.el.max,
				fillWidth = pct * 100,
				thumbEm = 1 - pct;

			this.fill.style.width = `calc(${fillWidth}% + ${thumbEm}em)`;
		}
		
		if (this.digitCols) {
			let rangeVal = this.el.value;

			// add blanks at the start if needed
			while (rangeVal.length < this.digitCols.length)
				rangeVal = " " + rangeVal;

			// get the differences between current and last digits
			let diffsFromLast = [];
			if (this.lastDigits) {
				rangeVal.split("").forEach((r,i) => {
					let diff = +r - this.lastDigits[i];
					diffsFromLast.push(diff);
				});
			}

			// roll the digits
			this.trans09 = false;
			rangeVal.split("").forEach((e,i) => {
				let digitH = 1.5,
					over9 = false,
					under0 = false,
					transY = e === " " ? 0 : (-digitH * (+e + 1)),
					col = this.digitCols[i];

				// start handling the 9-to-0 or 0-to-9 transition
				if (e == 0 && diffsFromLast[i] == -9) {
					transY = -digitH * 11;
					over9 = true;

				} else if (e == 9 && diffsFromLast[i] == 9) {
					transY = 0;
					under0 = true;
				}

				col.style.transform = `translateY(${transY}em)`;
				col.firstChild.textContent = "";

				// finish the transition
				if (over9 || under0) {
					this.trans09 = true;
					// add a temporary 9
					if (under0)
						col.firstChild.textContent = e;

					setTimeout(() => {
						if (this.trans09) {
							let pauseClass = "range__counter-column--pause",
								transYAgain = -digitH * (over9 ? 1 : 10);

							col.classList.add(pauseClass);
							col.style.transform = `translateY(${transYAgain}em)`;
							void col.offsetHeight;
							col.classList.remove(pauseClass);

							// remove the 9
							if (under0)
								col.firstChild.textContent = "";
						}

					},this.rollDuration);
				}
			});
			this.lastDigits = rangeVal;
		}
	}
}

//vertical slider
window.onload = function(){
	var slider1 = document.getElementById("v1");
	var  result1 = document.getElementById("final1");
	var slider2 = document.getElementById("v2");
	var  result2 = document.getElementById("final2");
	slider1.oninput = function(){
		result1.innerHTML = slider1.value + "%"  ;
	}
	slider2.oninput = function(){
		result2.innerHTML = slider2.value + "%" ;
	}
}

//back
var moveForce = 20; // max popup movement in pixels
var rotateForce = 15; // max popup rotation in deg
$(document).mousemove(function(e) {
    var docX = $(document).width();
    var docY = $(document).height();
    
    var moveX = (e.pageX - docX/2) / (docX/2) * -moveForce;
    var moveY = (e.pageY - docY/2) / (docY/2) * -moveForce;
    
    var rotateY = (e.pageX / docX * rotateForce*2) - rotateForce;
    var rotateX = -((e.pageY / docY * rotateForce*2) - rotateForce);
    
    $('.popup')
        .css('left', moveX+'px')
        .css('top', moveY+'px')
        .css('transform', 'rotateX('+rotateX+'deg) rotateY('+rotateY+'deg)');
	$('.square_popup')
        .css('left', moveX+'px')
        .css('top', '-'+moveY+'px');
	$('.triangle_popup')
        .css('left', '-'+moveX+'px')
        .css('top', moveY+'px');
	$('.circle_popup')
        .css('left', '-'+moveX+'px')
        .css('top', '-'+moveY+'px');
});

//color code conversion
const hexToRgb = hex =>
  hex.replace(/^#?([a-f\d])([a-f\d])([a-f\d])$/i,(m, r, g, b) => '#' + r + r + g + g + b + b)
    .substring(1).match(/.{2}/g)
    .map(x => parseInt(x, 16))

const rgbToHex = (r, g, b) => '#' + [r, g, b].map(x => {
  const hex = x.toString(16)
  return hex.length === 1 ? '0' + hex : hex
}).join('')


function change1(){
	let text = document.getElementById("cc1").value;
	let col  = hexToRgb(text);
	document.documentElement.style.setProperty('--color1',text);
	document.getElementById("range1").value = col[0];
	window.range1.changeValue();
	document.getElementById("range2").value = col[1];
	window.range2.changeValue();
	document.getElementById("range3").value = col[2];
	window.range3.changeValue();
}
function change2(){
	let text = document.getElementById("cc2").value;
	let col  = hexToRgb(text);
	document.documentElement.style.setProperty('--color2',text);
	document.getElementById("range4").value = col[0];
	window.range4.changeValue();
	document.getElementById("range5").value = col[1];
	window.range5.changeValue();
	document.getElementById("range6").value = col[2];
	window.range6.changeValue();
}
function change3(){
	let text = document.getElementById("cc3").value;
	let col  = hexToRgb(text);
	document.getElementById("color_name").innerHTML = text;
	document.documentElement.style.setProperty('--color3',text);
	document.getElementById("range7").value = col[0];
	window.range7.changeValue();
	document.getElementById("range8").value = col[1];
	window.range8.changeValue();
	document.getElementById("range9").value = col[2];
	window.range9.changeValue();
}
function changes1(){
	let r = document.getElementById("range1").value;
	let g = document.getElementById("range2").value;
	let b = document.getElementById("range3").value;
	let hex = rgbToHex(parseInt(r), parseInt(g), parseInt(b));
	document.getElementById("cc1").value = hex;
	document.documentElement.style.setProperty('--color1',hex);
}
function changes2(){
	let r = document.getElementById("range4").value;
	let g = document.getElementById("range5").value;
	let b = document.getElementById("range6").value;
	let hex = rgbToHex(parseInt(r), parseInt(g), parseInt(b));
	document.getElementById("cc2").value = hex;
	document.documentElement.style.setProperty('--color2',hex);
}
function changes3(){
	let r = document.getElementById("range7").value;
	let g = document.getElementById("range8").value;
	let b = document.getElementById("range9").value;
	let hex = rgbToHex(parseInt(r), parseInt(g), parseInt(b));
	document.getElementById("cc3").value = hex;
	document.getElementById("color_name").innerHTML = hex;
	document.documentElement.style.setProperty('--color3',hex);
}


 function next() {
	 document.getElementById("loading").style.display = "none";
	 sessionStorage.setItem("sessionData", "a"); 
 }
function add() {
	let c1 = document.getElementById("cr0");
	let c2 = document.getElementById("cr1");
	c1.classList.add("popup_b");
	c2.classList.add("circle_popup_b");
}
function hide(elem) {
  elem.classList.add("fade-out");
	add();
	setTimeout(function(){
		next();
	    }, 600);
	
}
  
 
