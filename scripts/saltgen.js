//Part 1: Checking the password

var get_hashed_password = function (password, salt) {
    var crypto = require('crypto');
    var salted_password = crypto.createHash('sha256').update(password+salt).digest('base64');
    return salted_password;
}


//ex.  Verifying user's input
input_password = 'typed_in_password'

//Query for user's "salt"
salt = 'salt_from_database_for_that_user'

console.log(get_hashed_password(input_password, salt));

//Compare hashed password with that in the database


//Part2: Creating the password
var generate_salt = function () {
    var salt_len = 20;
    var chars = '0123456789abcdefghijklmnopqurstuvwxyzABCDEFGHIJKLMNOPQURSTUVWXYZ'
    var num_chars = chars.length;
    var salt = '';
    for (var i = 0; i < salt_len; i++) {
        var j = Math.floor(Math.random() * num_chars);
        salt += chars[j];
    }
    return salt;
}


// When creating new user, generate salt, generate the password from salt, and save it
salt = generate_salt();
console.log(salt);
console.log(get_hashed_password('phong_password', salt));

module.exports = {
    get_hashed_password: get_hashed_password,
    generate_salt: generate_salt
}