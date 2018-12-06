"use strict";

let optionsVisible=false;
let labelImage = '<svg><use xlink:href="#sticker"></svg>';
let printWindow = document.getElementById("print-area").contentWindow;
let labelElement = document.getElementById('label-name');
let labelInputHeader = document.getElementById("header-label");
let labelInputSide = document.getElementById("sidebar-label");
let upcElement = document.getElementById('label-upc');
let upcInputHeader = document.getElementById('header-upc');
let upcInputSide = document.getElementById('sidebar-upc');
let barcodeElement = document.getElementById('barcode');
let fileUpload = document.getElementById('file-upload');
let labelFontSelect = document.getElementById('label-font-select');
let upcFontSelect = document.getElementById('upc-font-select');

fileUpload.addEventListener('change', function(e) {
  let file = fileUpload.files[0]; // get the file from the input
  let reader = new FileReader();
  reader.onload = function(e) {sticker.import(reader.result)} // assign a function to the onload event of the FileReader
  reader.readAsText(file); // call the read function of FileReader, when it completes the function defined for onload will execute
});

labelFontSelect.addEventListener('change', function(e) {
  sticker.label.font.value = labelFontSelect.options.selectedIndex;
  sticker.label.font.update();
});

upcFontSelect.addEventListener('change', function(e) {
  sticker.upc.font.value = upcFontSelect.options.selectedIndex;
  sticker.upc.font.update();
});

const propertyType = {
  VISIBILITY:    1,
  FONTFAMILY:    2,
  FONTSIZE:      3,
  YPOSITION:     4,
  XPOSITION:     5,
  WIDTH:         6,
  HEIGHT:        7,
  LETTERSPACING: 8,
  WORDSPACING:   9
};

/*
OKay, font selection.
select font from dropdown, applies to inner sticker object and updates appearance // have value be an integer respresenting index
saving label saves selected font // save integer
loading label correctly applies font and changes the dropdown to the correct font // change dropdown to correct index, apply font with find(index)
*/

const fontFamily = {
  find: function(index) {
    switch(index) {
      case 0:
        return this.ARIAL;
      case 1: 
        return this.VERDANA;
      case 2:
        return this.ROBOTO;
      case 3:
        return this.TIMES;
    }
  },
  ARIAL: "'Arial', sans-serif",
  VERDANA: "'Verdana', sans-serif",
  ROBOTO: "'Roboto', sans-serif",
  TIMES: "'Times', serif"
};

let defaults = {
  letterSpacing: { step: 2, min: -10, max: 100 },
  wordSpacing:   { step: 5, min: -20, max: 100 },
  position:      { step: 2, min: 0,   max: 100 },
  fontSize:      { step: 5, min: 20,  max: 200 },
  dimensions:    { step: 5, min: 10,  max: 100 },
  step: function(type) {
    switch(type) {
      case propertyType.WIDTH:
      case propertyType.HEIGHT:
        return this.dimensions.step;
      case propertyType.FONTSIZE:
        return this.fontSize.step;
      case propertyType.YPOSITION:
      case propertyType.XPOSITION:
        return this.position.step;
      case propertyType.LETTERSPACING:
        return this.letterSpacing.step;
      case propertyType.WORDSPACING:
        return this.wordSpacing.step;
      default:
        return 0;
    }
  },
  min: function(type) {
    switch(type) {
      case propertyType.WIDTH:
      case propertyType.HEIGHT:
        return this.dimensions.min;
      case propertyType.VISIBILITY:
        return 0;
      case propertyType.FONTFAMILY:
        return 0;
      case propertyType.FONTSIZE:
        return this.fontSize.min;
      case propertyType.YPOSITION:
      case propertyType.XPOSITION:
        return this.position.min;
      case propertyType.LETTERSPACING:
        return this.letterSpacing.min;
      case propertyType.WORDSPACING:
        return this.wordSpacing.min;
      default:
        return 0;
    }
  },
  max: function(type) {
    switch(type) {
      case propertyType.WIDTH:
      case propertyType.HEIGHT:
        return this.dimensions.max;
      case propertyType.VISIBILITY:
        return 0;
      case propertyType.FONTFAMILY:
        return 0;
      case propertyType.FONTSIZE:
        return this.fontSize.max;
      case propertyType.YPOSITION:
      case propertyType.XPOSITION:
        return this.position.max;
      case propertyType.LETTERSPACING:
        return this.letterSpacing.max;
      case propertyType.WORDSPACING:
        return this.wordSpacing.max;
      default:
        return 0;
    }
  }
};

class Property {
  
  constructor(type, targetElement, value, step, min, max) {
    this.value = value;
    this.type = type;
    this.elem = targetElement;
    this.step = step || step === 0 ? step : defaults.step(this.type);
    this.min = min || min === 0 ? min : defaults.min(this.type);
    this.max = max || max === 0 ? max : defaults.max(this.type);
  }
  
  update(targetElement = this.elem) {
    switch(this.type) {
      case propertyType.VISIBILITY:
        targetElement.style.visibility = value > 0 ? "visible" : "hidden";
        break;
      case propertyType.FONTFAMILY:
        targetElement.style.fontFamily = fontFamily.find(this.value);
        break;
      case propertyType.FONTSIZE:
        targetElement.style.fontSize = this.value;
        break;
      case propertyType.YPOSITION:
        targetElement.setAttribute('y', this.value + '%');
        break;
      case propertyType.XPOSITION:
        targetElement.setAttribute('x', this.value + '%');
        break;
      case propertyType.WIDTH:
        targetElement.setAttribute('width', this.value + '%');
        targetElement.setAttribute('x', (100 - this.value)/2 + '%');
        break;
      case propertyType.HEIGHT:
        targetElement.setAttribute('height', this.value + '%');
        break;
      case propertyType.LETTERSPACING:
        targetElement.style.letterSpacing = this.value;
        break;
      case propertyType.WORDSPACING:
        targetElement.style.wordSpacing = this.value;
        break;
    }
  }
  
  increment() {
    if(this.type === propertyType.FONTFAMILY || this.type === propertyType.VISIBLE)
      return;
    this.value = Math.min(this.value + this.step, this.max);
    this.update(this.elem);
  }
  
  decrement() {
    if(propertyType.FONTFAMILY || propertyType.VISIBLE)
      return;
    this.value = Math.max(this.value - this.step, this.min);
    this.update(this.elem);
  }
  
  toggle() {
    if(!(this.type === propertyType.VISIBLE))
      return;
    this.value = this.value === 0 ? 1 : 0;
  }
  
}

function concat(stringArray) {
  let res = stringArray[0];
  let l = stringArray.length;
  for(let i = 1; i < l; i++)
    res += ' ' + stringArray[i];
  return res;
}

let sticker = {
  label: {
    value: "",
    font: new Property(propertyType.FONTFAMILY, labelElement, 0),
    size: new Property(propertyType.FONTSIZE, labelElement, 60),
    position: new Property(propertyType.YPOSITION, labelElement, 18),
    spacingLetter: new Property(propertyType.LETTERSPACING, labelElement, 0),
    spacingWord: new Property( propertyType.WORDSPACING, labelElement, 0 ),
    visible: true
  },
  upc: {
    value: "",
    font: new Property(propertyType.FONTFAMILY, upcElement, 0),
    size: new Property(propertyType.FONTSIZE, upcElement, 40),
    position: new Property(propertyType.YPOSITION, upcElement, 84),
    spacingLetter: new Property(propertyType.LETTERSPACING, upcElement, 0),
    spacingWord: new Property(propertyType.WORDSPACING, upcElement, 0),
    visible: true
  },
  barcode: {
    width: new Property(propertyType.WIDTH, barcodeElement, 90),
    height: new Property(propertyType.HEIGHT, barcodeElement, 45),
    position: new Property(propertyType.YPOSITION, barcodeElement, 30),
    svgWidth: 0,
    svg: ""
  },
  import: function(file) {
    let obj = JSON.parse(file);
    sticker.label.value = updateLabel(concat(obj.label[0]));
    sticker.label.font.value = obj.label[1];
    sticker.label.size.value = obj.label[2];
    sticker.label.position.value = obj.label[3];
    sticker.label.spacingLetter.value = obj.label[4];
    sticker.label.spacingWord.value = obj.label[5];
    sticker.label.visible = obj.label[6];
    
    sticker.upc.value = updateUPC(concat(obj.upc[0]));
    sticker.upc.font.value = obj.upc[1];
    sticker.upc.size.value = obj.upc[2];
    sticker.upc.position.value = obj.upc[3];
    sticker.upc.spacingLetter.value = obj.upc[4];
    sticker.upc.spacingWord.value = obj.upc[5];
    sticker.upc.visible = obj.upc[6];
    
    sticker.barcode.width.value = obj.barcode[0];
    sticker.barcode.height.value = obj.barcode[1];
    sticker.barcode.position.value = obj.barcode[2];
    
    labelFontSelect.options.selectedIndex = obj.label[1];
    upcFontSelect.options.selectedIndex = obj.upc[1];
    
    sticker.label.font.update();
    sticker.label.size.update();
    sticker.label.position.update();
    sticker.label.spacingLetter.update();
    sticker.label.spacingWord.update();
    sticker.upc.font.update();
    sticker.upc.size.update();
    sticker.upc.position.update();
    sticker.upc.spacingLetter.update();
    sticker.upc.spacingWord.update();
    sticker.barcode.width.update();
    sticker.barcode.height.update();
    sticker.barcode.position.update();
  },
  export: function() {
    let data = {
      label: [
        sticker.label.value.split(' '), 
        sticker.label.font.value, 
        sticker.label.size.value, 
        sticker.label.position.value, 
        sticker.label.spacingLetter.value, 
        sticker.label.spacingWord.value, 
        sticker.label.visible
      ],
      upc: [
        sticker.upc.value.split(' '), 
        sticker.upc.font.value,
        sticker.upc.size.value, 
        sticker.upc.position.value, 
        sticker.upc.spacingLetter.value, 
        sticker.upc.spacingWord.value, 
        sticker.upc.visible
      ],
      barcode: [
        sticker.barcode.width.value, 
        sticker.barcode.height.value, 
        sticker.barcode.position.value
      ]
    };
    let jsonData = 'data: application/json;charset=utf-8, ' + JSON.stringify(data);
    let a = document.createElement('a');
    a.href = jsonData;
    a.download = concat(data.label[0]) + '.bcd';
    
    a.click();
  }
};

//this is a relic modified from an earlier implementation, marked for refactor
let setup = {
  all: function(labelElem, upcElem, barcodeElem) {
    setup.label(labelElem);
    setup.upc(upcElem);
    setup.barcode(barcodeElem);
  },
  label: function(labelElem) {
    sticker.label.font.update(labelElem);
    sticker.label.size.update(labelElem);
    sticker.label.position.update(labelElem);
    sticker.label.spacingLetter.update(labelElem);
    sticker.label.spacingWord.update(labelElem);
  },
  upc: function(upcElem) {
    sticker.upc.font.update(upcElem);
    sticker.upc.size.update(upcElem);
    sticker.upc.position.update(upcElem);
    sticker.upc.spacingLetter.update(upcElem);
    sticker.upc.spacingWord.update(upcElem);
  },
  barcode: function(barcodeElem) {
    sticker.barcode.width.update(barcodeElem);
    sticker.barcode.height.update(barcodeElem);
    sticker.barcode.position.update(barcodeElem);
  }
}

function print(quantity)
{
  let l = printWindow.document.getElementById("label-name");
  let b = printWindow.document.getElementById("barcode");
  let u = printWindow.document.getElementById("label-upc");
  l.innerHTML = sticker.label.value;
  u.innerHTML = sticker.upc.value;
  b.innerHTML = sticker.barcode.svg;
  b.setAttribute("viewBox", "0 0 " + sticker.barcode.svgWidth + " 1");
  setup.all(l, u, b);
  
  let grid = printWindow.document.getElementById('grid-container');
  let result = '';
  for(let i = 0; i < quantity; i++)
    result += '<div><svg><use xlink:href="#sticker"/></svg></div>';
  grid.innerHTML = result;
  
  printWindow.focus();
  printWindow.print();
}

function toggleDisplay(elementID, visible)
{
  document.getElementById(elementID).style.display = visible ? "block" : "none";
}

function updateLabel(label)
{
  sticker.label.value = label;
  labelElement.innerHTML = label;
  labelInputSide.value   = label;
  labelInputHeader.value = label;
}

function updateUPC(upc)
{
  sticker.upc.value = upc;
  upcElement.innerHTML = upc;
  upcInputHeader.value = upc;
  upcInputSide.value   = upc;
  getBarcode(upc, "barcode");
}

function setVisibility(isVisible, target)
{
  target.style.visibility = isVisible ? "visible" : "hidden";
}

function blackBar(width, position)
{
  return '<use xlink:href="#bar-' + width + '" x="' + position + '" />';
}

function getBarcode(upc, barcodeId)
{
  let result = '';
  let totalWidth = 0;
  
  // get a string of widths
  let widths = '7';
  widths += code128b[104].widths;
  for(let i = 0; i < upc.length; i++)
    widths += widthsFromChar(upc[i]);
  widths += code128b[checkSymbol(upc)].widths;
  widths += code128b[108].widths;
  widths += '7'
  
  for(let i = 0; i < widths.length; i++)
  {
    let value = parseInt(widths[i]);
    
    if(i % 2 != 0)
      result += blackBar(value, totalWidth);
    
    totalWidth += value;
  }
  
  setViewBox(barcodeId, 0, 0, totalWidth, 1);
  sticker.barcode.svgWidth = totalWidth;
  document.getElementById(barcodeId).innerHTML = result;
  sticker.barcode.svg = result;
}

function setViewBox(svgElementId, xStart, yStart, xEnd, yEnd) 
{
  document.getElementById(svgElementId).setAttribute("viewBox", xStart + ' ' + yStart + ' ' + xEnd + ' ' + yEnd);
}

function widthsFromChar(char)
{
  for(let i = 0; i < code128b.length; i++)
  {
    if(char === code128b[i].char)
    {
      return code128b[i].widths;
    }
  }
  
  return '';
}

function checkSymbol(input)
{
  let checkValue = 103;
  for(let i = 0; i < input.length; i++)
    checkValue += (valueFromChar(input[i]) * (i + 1));
  return (checkValue % 103) + 1;
}

function valueFromChar(char)
{
  for(let i = 0; i < code128b.length; i++)
  {
    if(char.toString() == code128b[i].char.toString())
      return code128b[i].value;
  }
  return -1;
}

function showOptions()
{
  if(!optionsVisible)
  {
    document.getElementById("optionsMenu").style.width= "15em";
    document.getElementById("main-content").style.marginLeft= "15em"
    document.getElementById("main-inputs").style.opacity = "0";
  } 
  else
  {
    document.getElementById("optionsMenu").style.width= "0";
    document.getElementById("main-content").style.marginLeft= "0"
    document.getElementById("main-inputs").style.opacity = "1";
  }
  optionsVisible = !optionsVisible;
}

//Segment is a constructor for each barcode segment
function Segment(char, value, binary, widths)
{
  this.char = char;
  this.value = value;
  this.binary = binary;
  this.widths = widths;
}

let code128b = [
  new Segment(' ', 0, '11011001100', '212222'),
  new Segment('!', 1, '11001101100', '222122'),
  new Segment('"', 2, '11001100110', '222221'),
  new Segment('#', 3, '10010011000', '121223'),
  new Segment('$', 4, '10010001100', '121322'),
  new Segment('%', 5, '10001001100', '131222'),
  new Segment('&', 6, '10011001000', '122213'),
  new Segment("'", 7, '10011000100', '122312'),
  new Segment('(', 8, '10001100100', '132212'),
  new Segment(')', 9, '11001001000', '221213'),
  new Segment('*', 10, '11001000100', '221312'),
  new Segment('+', 11, '11000100100', '231212'),
  new Segment(',', 12, '10110011100', '112232'),
  new Segment('-', 13, '10011011100', '122132'),
  new Segment('.', 14, '10011001110', '122231'),
  new Segment('/', 15, '10111001100', '113222'),
  new Segment('0', 16, '10011101100', '123122'),
  new Segment('1', 17, '10011100110', '123221'),
  new Segment('2', 18, '11001110010', '223211'),
  new Segment('3', 19, '11001011100', '221132'),
  new Segment('4', 20, '11001001110', '221231'),
  new Segment('5', 21, '11011100100', '213212'),
  new Segment('6', 22, '11001110100', '223112'),
  new Segment('7', 23, '11101101110', '312131'),
  new Segment('8', 24, '11101001100', '311222'),
  new Segment('9', 25, '11100101100', '321122'),
  new Segment(':', 26, '11100100110', '321221'),
  new Segment(';', 27, '11101100100', '312212'),
  new Segment('<', 28, '11100110100', '322112'),
  new Segment('=', 29, '11100110010', '322211'),
  new Segment('>', 30, '11011011000', '212123'),
  new Segment('?', 31, '11011000110', '212321'),
  new Segment('@', 32, '11000110110', '232121'),
  new Segment('A', 33, '10100011000', '111323'),
  new Segment('B', 34, '10001011000', '131123'),
  new Segment('C', 35, '10001000110', '131321'),
  new Segment('D', 36, '10110001000', '112313'),
  new Segment('E', 37, '10001101000', '132113'),
  new Segment('F', 38, '10001100010', '132311'),
  new Segment('G', 39, '11010001000', '211313'),
  new Segment('H', 40, '11000101000', '231113'),
  new Segment('I', 41, '11000100010', '231311'),
  new Segment('J', 42, '10110111000', '112133'),
  new Segment('K', 43, '10110001110', '112331'),
  new Segment('L', 44, '10001101110', '132131'),
  new Segment('M', 45, '10111011000', '113123'),
  new Segment('N', 46, '10111000110', '113321'),
  new Segment('O', 47, '10001110110', '133121'),
  new Segment('P', 48, '11101110110', '313121'),
  new Segment('Q', 49, '11010001110', '211331'),
  new Segment('R', 50, '11000101110', '231131'),
  new Segment('S', 51, '11011101000', '213113'),
  new Segment('T', 52, '11011100010', '213311'),
  new Segment('U', 53, '11011101110', '213131'),
  new Segment('V', 54, '11101011000', '311123'),
  new Segment('W', 55, '11101000110', '311321'),
  new Segment('X', 56, '11100010110', '331121'),
  new Segment('Y', 57, '11101101000', '312113'),
  new Segment('Z', 58, '11101100010', '312311'),
  new Segment('[', 59, '11100011010', '332111'),
  new Segment('\\', 60, '11101111010', '314111'),
  new Segment(']', 61, '11001000010', '221411'),
  new Segment('^', 62, '11110001010', '431111'),
  new Segment('_', 63, '10100110000', '111224'),
  new Segment('`', 64, '10100001100', '111422'),
  new Segment('a', 65, '10010110000', '121124'),
  new Segment('b', 66, '10010000110', '121421'),
  new Segment('c', 67, '10000101100', '141122'),
  new Segment('d', 68, '10000100110', '141221'),
  new Segment('e', 69, '10110010000', '112214'),
  new Segment('f', 70, '10110000100', '112412'),
  new Segment('g', 71, '10011010000', '122114'),
  new Segment('h', 72, '10011000010', '122411'),
  new Segment('i', 73, '10000110100', '142112'),
  new Segment('j', 74, '10000110010', '142211'),
  new Segment('k', 75, '11000010010', '241211'),
  new Segment('l', 76, '11001010000', '221114'),
  new Segment('m', 77, '11110111010', '413111'), // what i got as a check digit for 0123456789
  new Segment('n', 78, '11000010100', '241112'), // valid check digit of 0123456789
  new Segment('o', 79, '10001111010', '134111'),
  new Segment('p', 80, '10100111100', '111242'),
  new Segment('q', 81, '10010111100', '121142'),
  new Segment('r', 82, '10010011110', '121241'),
  new Segment('s', 83, '10111100100', '114212'),
  new Segment('t', 84, '10011110100', '124112'),
  new Segment('u', 85, '10011110010', '124211'),
  new Segment('v', 86, '11110100100', '411212'),
  new Segment('w', 87, '11110010100', '421112'),
  new Segment('x', 88, '11110010010', '421211'),
  new Segment('y', 89, '11011011110', '212141'),
  new Segment('z', 90, '11011110110', '214121'),
  new Segment('{', 91, '11110110110', '412121'),
  new Segment('|', 92, '10101111000', '111143'),
  new Segment('}', 93, '10100011110', '111341'),
  new Segment('~', 94, '10001011110', '131141'),
  new Segment('', 95, '10111101000', '114113'),
  new Segment('', 96, '10111100010', '114311'),
  new Segment('', 97, '11110101000', '411113'),
  new Segment('', 98, '11110100010', '411311'),
  new Segment('', 99, '10111011110', '113141'),
  new Segment('', 100, '10111101110', '114131'),
  new Segment('', 101, '11101011110', '311141'),
  new Segment('', 102, '11110101110', '411131'),
  new Segment('', 103, '11010000100', '211412'),
  new Segment('', 104, '11010010000', '211214'), //start code
  new Segment('', 105, '11010011100', '211232'),
  new Segment('', 106, '11000111010', '233111'),
  new Segment('', 107, '11010111000', '211133'),
  new Segment('', 108, '1100011101011', '2331112') //full stop code
];