//NOTE: using mongoose because schema is a very simple way to make these objects when I'm using the MEAN(mongodb,express,angularjs, and nodejs) stack
var mongoose     = require('mongoose');
var Schema       = mongoose.Schema;

var TagsSchema   = new Schema({
    name : {type:String,required:true,unique:true},
    status: {type:String}
    // tags:{type:Array,default:[]}
});

module.exports = mongoose.model('Tags', TagsSchema);