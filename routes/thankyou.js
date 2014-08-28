exports.contact = function(req, res) {
  res.render('thankyou', {
  	title: 'Thanks for contacting us!',
    header: 'Thank You!',
    text: 'We appreciate you contacting us, we\'ll try to reply as soon as we can!'
  });
}