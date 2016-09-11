//var mongoose = require('mongoose');
var moment = require('moment');
var schema = mongoose.schema;

module.exports = function () {
    var Launch = new schema({
        // For the hololens
        /*start_x : String,
        start_y : String,
        fall_x : String,
        fall_y : String,*/
        // For the smartwatch
        polygon : [[Number]],
        areaName : String,
        landTime : Number
    });
    mongoose.model('Launch', Launch);
}

Launch.set('toJSON' , {
    transform: (doc, ret, option) => {
        //ret.createDate = moment(ret.createDate).format('DD-MM-YYYY HH:mm')

        return ret;
    }
})

Launch.statics.getById = function (id , _callback) {
    _callback = _callback || function () {};
    return this.findOne({_id: id} , _callback);
}


Launch.statics.getAll = function (id , _callback) {
    _callback = _callback || function () {};
    return this.find({} , _callback);
}

module.exports = mongoose.model("article" , Ariticle);