var arrIMG = {}; //hold imgur images

var arrUPLPolls = [
  'Spontaneous or Analytical?',
  'Hardworking or Intelligent?',
  'Liberal or Conservative?',
  'Optimist or Pessimist?',
  'Extrovert or Introvert?',
  'Brain or Brawn?',
  'Is this person fun to be around?',
  'Is this person a liar?',
];

//currently makes the share images and sends to imgur
function makeShare(_text){
  for (var i=0; i<arrUPLPolls.length; i++){
    var dataURL = drawShare("@"+_text+": "+arrUPLPolls[i]);
    arrIMG[arrUPLPolls[i]] = dataURL;
  }
  return arrIMG;
}

function fragmentText(c, text, maxWidth) {
  var words = text.split(' ');
  for (var i = 0; i < (words.length - 1); i++) {
    words[i] = words[i] + " ";
  }
  var lines = [],
    line = "";
  if (c.measureText(text).width < maxWidth) {
    return [text];
  }
  while (words.length > 0) {
    while (c.measureText(words[0]).width >= maxWidth) {
      var tmp = words[0];
      words[0] = tmp.slice(0, -1);
      if (words.length > 1) {
        words[1] = tmp.slice(-1) + words[1];
      } else {
        words.push(tmp.slice(-1));
      }
    }
    if (c.measureText(line + words[0]).width < maxWidth) {
      //quotes are the spacer at end of line
      line += words.shift() + "";
    } else {
      lines.push(line);
      line = "";
    }
    if (words.length === 0) {
      lines.push(line);
    }
  }
  return lines;
}

//draw function occurs every keystroke
function drawShare(text) {

  var canvas = document.createElement('canvas');
  var c = canvas.getContext('2d');

  //THIS IS ALSO IN PUBLIC/NEWPOLL.JS!! IF YOU CHANGE THIS YOU HAVE TO CHANGE IT THERE TOO. MAKE THIS MORE MODULAR PLZ
  //canvas setup
  // var fontFamily = "Segoe UI",
  var fontFamily = "Segoe UI, Helvetica",
    fontSize = "36px",
    fontColour = "#ab3792",
    maxlines = 9 + 1,
    padding_side = 50,
    width = +(canvas.width = 700), // fb uses 94:49 ratio. wtfff?
    height = +(canvas.height = 364);
  // height = +(canvas.height = (parseInt(fontSize)*maxlines)+20);

  var speaker = "kingpoll.com";

  //global vars
  // var colors = ['#339933'];
  var colors = ['#b80000', //dark-red
    '#e74c3c', //red
    '#e67e22', //orange
    '#d1b41f', //yellow
    '#339933', //dark-green
    '#2ecc51', //green
    '#009999', //teal
    '#3498db', //pale-blue
    '#0099ff', //blue
    '#6666ff', //blue-purple
    '#cf7ccf', //pink
    '#9b59b6', //purple
    '#34495e', //black
    'grey'
  ]; //grey

  var bg_color = colors[Math.floor(Math.random() * colors.length)];
  fontColour = (bg_color == "black") ? "#fffffe" : "#fffffe";

  var grad = c.createRadialGradient(width / 2, height / 2, 0, width / 2, height / 2, width * 0.8);
  grad.addColorStop(0, bg_color);
  grad.addColorStop(1, '#000000');

  c.clearRect(0, 0, width, height);
  c.fillStyle = grad;
  c.fillRect(0, 0, width, height);
  c.font = "bold " + fontSize + " " + fontFamily;
  c.textAlign = "center";
  c.fillStyle = fontColour;
  var lines = fragmentText(c, text, width - parseInt(fontSize, 0) - padding_side);
  var v_offset = maxlines - lines.length;
  var v_offset_div = 2;
  lines.forEach(function(line, i) {
    if ((i === 0) && (i === (lines.length - 1))) {
      c.fillText("\"" + line + "\"", width / 2, ((i + v_offset / v_offset_div + 1) * parseInt(fontSize, 0)) - 10);
    } else if (i === 0) {
      c.fillText("\"" + line, width / 2, ((i + v_offset / v_offset_div + 1) * parseInt(fontSize, 0)) - 10);
    } else if (i === (lines.length - 1)) {
      c.fillText(line + "\"", width / 2, ((i + v_offset / v_offset_div + 1) * parseInt(fontSize, 0)) - 10);
    } else {
      c.fillText(line, width / 2, ((i + v_offset / v_offset_div + 1) * parseInt(fontSize, 0)) - 10);
    }
  });
  c.textAlign = "right";
  c.font = "bold " + (parseInt(fontSize) - 16) + "px" + " " + fontFamily;
  //c.fillText('kingpoll.com/p/abcdefgxyz123', width-5, height-10);
  //if(speaker.value){
  c.fillText("- " + speaker, width - 25, height - 20);
  //}
  c.imageSmoothingEnabled = true;
  return canvas.toDataURL('image/jpeg');
}