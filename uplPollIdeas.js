module.exports = (function(){
  var c = {red:'e74c3c', orange:'e67e22', yellow:'e1c42f', green:'2ecc51', blue:'3498db', purple:'9b59b6', black:'34495e'};
  var arrUPLPolls = [
  //do a check: if (typeof p_q == 'undefined'){ p_q = c_text[0] vs. c_text[1]}
    {p_q: 'Creative or Logical?',         c_text:['Creative', 'Logical'],         c_hex:[c['red'], c['blue']]},
    // {p_q: 'Spontaneous or Analytical?',   c_text:['Spontaneous', 'Analytical'],   c_hex:[c['red'], c['blue']]}, // are these the same?
    {p_q: 'Intuition or Preparation?',    c_text:['Intuition', 'Preparation'],    c_hex:[c['red'], c['blue']]}, // are these the same?
    // {p_q: 'Hardworking or Intelligent?',  c_text:['Hardworking', 'Intelligent'],  c_hex:[c['red'], c['blue']]},
    // {p_q: 'Cunning or Honorable?',        c_text:['Cunning', 'Honorable'],        c_hex:[c['red'], c['blue']]},
    // {p_q: 'Trusting orSkeptic?',          c_text:['Trusting', 'Skeptic'],         c_hex:[c['red'], c['blue']]},
    {p_q: 'Liberal or Conservative?',     c_text:['Liberal', 'Conservative'],     c_hex:[c['red'], c['blue']]},
    // {p_q: 'Youthful or Mature?',          c_text:['Youthful', 'Mature'],          c_hex:[c['red'], c['blue']]},
    {p_q: 'Optimist or Pessimist?',       c_text:['Optimist', 'Pessimist'],       c_hex:[c['red'], c['blue']]},
    {p_q: 'Extrovert or Introvert?',      c_text:['Extrovert', 'Introvert'],      c_hex:[c['red'], c['blue']]},
    // {p_q: 'Brawn or Brain?',              c_text:['Brawn', 'Brain'],              c_hex:[c['red'], c['blue']]},
    // {p_q: 'Solo or Team?',                c_text:['Solo', 'Team'],                c_hex:[c['red'], c['blue']]},
    // {p_q: 'Fight or Flight?',             c_text:['Fight', 'Flight'],             c_hex:[c['red'], c['blue']]},
    // {p_q: 'Offense or Defense?',          c_text:['Offense', 'Defense'],          c_hex:[c['red'], c['blue']]},
    // {p_q: 'Strength or Speed?',           c_text:['Strength', 'Speed'],           c_hex:[c['red'], c['blue']]},
    {p_q: 'Fun?',                         c_text:['Yes', 'No'],                   c_hex:[c['green'], c['red']]},
    // {p_q: 'Attractive?',                  c_text:['Yes', 'No'],                   c_hex:[c['green'], c['red']]},
    // {p_q: 'Liar?',                        c_text:['Yes', 'No'],                   c_hex:[c['green'], c['red']]},
  ];
  return arrUPLPolls;
})();