module.exports = {
    findUniqueHex: function (hex_pid, Model, id, callback){
        Model.findOne().where(id, hex_pid).exec(function (err, doc) {
            console.log('looking for '+hex_pid);
            if(err){
                console.log("return error");
                //something wrong with id lookup
                throw err;
            }
            else if(doc){
                console.log("returning " + hex_pid);
                //if item exists, change the hex
                return findUniqueHex(shortid.generate(), Model, id, callback);
            }
            else{
                console.log("this id is good: " + hex_pid);
                //return the hex without error
                callback(null, hex_pid);
            }
        });
    }
}