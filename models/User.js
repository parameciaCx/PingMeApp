//NOTE: using mongoose because schema is a very simple way to make these objects when I'm using the MEAN(mongodb,express,angularjs, and nodejs) stack
var mongoose     = require('mongoose');
var Schema       = mongoose.Schema;

var UserSchema   = new Schema({
    name : {type:String,required:true},
    email: {type:String,unique:true,required:true},
    username: {type:String,unique:true,required:true},
    password: {type:String,required:true},
    token: {type:String},
    access:{type:String,default:1},
    tags:{type:Array,default:[]}
});

module.exports = mongoose.model('User', UserSchema);