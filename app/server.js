// Required Modules
var express    = require("express");
var morgan     = require("morgan");
var bodyParser = require("body-parser");
var jwt        = require("jsonwebtoken");
var mongoose   = require("mongoose");
var app        = express();

var port = process.env.PORT || 3000;
var User     = require('./models/User');
var Tags     = require('./models/Tags');
// Connect to DB
var url = 'mongodb://localhost/zhan2410'
mongoose.connect(url);
app.use(express.static(__dirname + '/app'))
app.use('/bower_components',  express.static(__dirname + '/bower_components'));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(morgan("dev"));
app.use(function(req, res, next) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST');
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type, Authorization');
    next();
});

//Create CSR user
var CSUser = new User();
CSUser.name = "cservice";
CSUser.email = "csr@gmail.com";
CSUser.username = "csr";
CSUser.password = "admin";
// level 2 access indicates CSR user
CSUser.access = 2;
CSUser.save(function(err, user) {
	//creates a encoded user token string in base64URL  (so only authorized users can access this server) using json web token
    user.token = jwt.sign({name:user.name,access:user.access}, 'thiswillbeyoursecret');
    user.save(function(err, user1) {
        if(err)
            console.log(err);
        else
            console.log(user1)
    });
})


//Create Management user
var AdminUser = new User();
AdminUser.name = "management";
AdminUser.email = "mgmt@gmail.com";
AdminUser.username = "management";
AdminUser.password = "superadmin";
// level 3 access indicates management user
AdminUser.access = 3;
AdminUser.save(function(err, user) {
	//creates a encoded user token string in base64URL  (so only authorized users can access this server) using json web token
    user.token = jwt.sign({name:user.name,access:user.access}, 'thiswillbeyoursecret');
    user.save(function(err, user1) {
        if(err)
            console.log(err);
        else
            console.log(user1)
    });
})

app.get('/getuser',function(req,res){
    User.findOne({token:req.token},function(err,user){
        if(err)
            res.json({type:false,data:'Error Occured while getting user detail'});
        else 
            res.json({type:true,data:user});
    })
})
//service for Edit Profile
app.post('/setuser',ensureAuthorized,function(req,res){
    var user = req.body.setUser;var updatedDoc = {};
    if(user.name) {updatedDoc.name = user.name; }
    if(user.email) {updatedDoc.email = user.email; }
    if(user.username) {updatedDoc.username = user.username; }
    if(user.password) {updatedDoc.password = user.password; } 
    console.log(updatedDoc);
    User.findOneAndUpdate({token:req.token},{$set:updatedDoc},{new:true},function(err,user){
        if(err) {
            console.log(err);
            res.json({type:false,data:'your requested detail is already in used'});
        }
        else {

            res.json({type:true,data:user});
        }
    })
})

//settag increment userTag count if exist otherwise create a new one when user selects the tag
app.post('/settag',ensureAuthorized, function(req,res){
    console.log("settag method called")
    if(req.token) {
        var tagName = req.body.tagName;
        var tagVal = {tagName:tagName,count:1};
        User.findOneAndUpdate({$and:[ {token:req.token},{'tags.tagName':tagName}]},{'$inc':{'tags.$.count':1}},{safe:true,upsert:true,new:true},
        function(err,data){
            if(err || !data) {
                // console.log(err);
                User.findOneAndUpdate({token:req.token},{'$push':{'tags':tagVal}},{safe:true,upsert:true,new:true},function(err,data){
                    if(err) {
                        // console.log(err);
                        res.json({type:true,data:'error occured while adding your Tag'});
                    } else {
                        console.log("--Pushed new tag to the user document--");
                        res.json({type:true,data:'your tag added successfully'});
                        console.log(data.tags);
                    }
                })
                
            } else {
                console.log("-- tag Incemented successfully--");
                console.log(data.tags);
                res.json({type:true,data:'your tag added successfully'});
                
            }
        })
    }
})
// getvisual service gets the visual data for management user
app.get('/getvisual',ensureAuthorized,function(req,res){
    var tagList = [];
    Tags.find({},'name',function(err,data){
        if(err) {
            console.log(err);
            res.send(tagList);
        } else {
            data.forEach(function(element) {
                var tagElement = {};
                tagElement.count = 0;
                tagElement.tagName = element.name;
                tagList.push(tagElement);
            }, this);
            console.log(tagList)
    // var predefinedTags = [{tagName:'TV1',count:0},{tagName:'TV2',count:1},{tagName:'TV3',count:0},{tagName:'TV4',count:0}];
    User.findOne({token:req.token},function(err,data){
        if(err)
            console.log(err)
        else {
            console.log(data.access)
            if(data.access == 3 ) {
                User.find({},function(err,allUser){
                    var totalTagStatics = [];
                    tagList.forEach(function(staticTag) {//iterate each tag
                        var tagStatics = {};var tagCount = 0;
                        tagStatics.tagName = staticTag.tagName
                        allUser.forEach(function(eachUser) {
                            var matchedTag = eachUser.tags.filter(function(searchTag){
                                return searchTag.tagName == staticTag.tagName 
                            })
                            if(matchedTag.length > 0) {
                                tagCount = tagCount + matchedTag[0].count;
                            }
                        }, this);
                        tagStatics.count = tagCount;
                        totalTagStatics.push(tagStatics);
                        }, this);
                        console.log(totalTagStatics);
                        res.send(totalTagStatics);
                })

            } else {
                res.json({data: "you don't have admin rights"});
            }
        }
    });
        }
    })

})
//getusertag service fetches the user suggested tags 
app.get('/getusertag',ensureAuthorized,function(req,res){
    console.log("get tag method called")
    var token = req.token;
    console.log(req.token);
    User.findOne({token:token},function(err,data){
        if(err)
            console.log(err);
        else
            console.log(data.tags)
            res.send(data.tags);
    })
})
//gettag service fetches the tags associated with user
//access = 1 fetch only approved tags 
//access = 2 fetch only Suggested tags
//access - 3 fetch only moderatorsuggested tags
app.get('/gettag',ensureAuthorized,function(req,res){
    // var tags = [{tagName:'TV1',count:0},{tagName:'TV2',count:1},{tagName:'TV3',count:0},{tagName:'TV4',count:0}];
    var tagList = [];
    User.findOne({token:req.token},function(err,user){
        if(user.access == 1) {
            Tags.find({status:'approved'},'name',function(err,data){
                if(err) {console.log(err);res.json({type:false,data:"database error occured"});
                } else {
                    data.forEach(function(element) {var tagElement = {};tagElement.count = 0;
                        tagElement.tagName = element.name;tagList.push(tagElement);}, this);
                    console.log(tagList)
                    res.json({type:true,data:tagList});
                }
            })            
        } else if (user.access == 2) {
            Tags.find({status:'suggested'},'name',function(err,data){
                if(err) {console.log(err);res.json({type:false,data:"database error occured"});
                } else {
                    data.forEach(function(element) {var tagElement = {};tagElement.count = 0;
                        tagElement.tagName = element.name;tagList.push(tagElement);}, this);
                    console.log(tagList)
                    res.json({type:true,data:tagList});
                }
            })            

        } else if(user.access == 3) {
            Tags.find({status:'moderatorsuggested'},'name',function(err,data){
                if(err) {console.log(err);res.json({type:false,data:"database error occured"});
                } else {
                    data.forEach(function(element) {var tagElement = {};tagElement.count = 0;
                        tagElement.tagName = element.name;tagList.push(tagElement);}, this);
                    console.log(tagList)
                    res.json({type:true,data:tagList});
                }
            })            

        } else {
            res.json({type:false,data:"user access level not found"})
        }
    })
})
//savetag service save the user tags
//normal user submit suggested tag for approval 
//CSR(admin) user approves tags and forwards them to management
//Management(superadmin) users adds approved tags for use
app.post('/savetag',ensureAuthorized,function(req,res){
    var newTag = new Tags();
    newTag.name = req.body.tagName;
    console.log(req.body.tagName);
    var tagList = [];
    Tags.find({},'name',function(err,tagList1){
        // console.log(tagList1)
        tagList1.forEach(function(tag) {
            // console.log(tag);
            tagList.push(tag.name);                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     
        }, this);        
    console.log(tagList);    
        User.findOne({token:req.token},function(err,user){
            if(err)
                res.json({type:false,data:'Error Occured Please Try Again'});
            else {
                if(tagList.indexOf(req.body.tagName) > -1 && user.access == 1) {
                    res.json({type:false,data:'This Tag is already present'})
                } else if(user.access == 1) {
                    // newTag.status = 'suggested';
                    Tags.update({name:req.body.tagName},{$set:{status:'suggested'}},{new:true,upsert:true},function(err,data){
                        if(err) {
                            console.log(err);
                            res.json({type:false,data:'database error occured'})
                        }
                        else {
                            console.log(data)
                            res.json({type:true,data:'Tag Suggested to CSR Successfully'});
                        }
                    });
                } else if(user.access == 2) {
                    // newTag.status = 'moderatorsuggested';
                    Tags.update({name:req.body.tagName},{$set:{status:'moderatorsuggested'}},{new:true,upsert:true},function(err,data){
                        if(err)
                            console.log(err);
                        else {
                            console.log(data)
                            res.json({type:true,data:'Tag forwarded to Management Successfully'});
                        }
                    });

                } else if(user.access == 3) {
                    // newTag.status = 'approved';
                    Tags.update({name:req.body.tagName},{$set:{status:'approved'}},{new:true,upsert:true},function(err,data){
                        if(err)
                            console.log(err);
                        else {
                            console.log(data)
                            res.json({type:true,data:'Tag Added to System Successfully'});
                        }
                    });
                }
            }
        })
})
    })
	
	
	
//denytag service removes the tag from suggestions (denies the addition of the tag)
//for CSR and Manamgement, tag gets removed the same way for both users
 app.post('/denytag',ensureAuthorized,function(req,res){
     console.log("In side denytag API call")
     User.findOne({token:req.token},function(err,user){
         if(err)
            res.json({type:false,data:'database error occured'})
        else {
            if(user.access == 2 || user.access ==3) {
                Tags.findOne({name:req.body.tagName}).remove(function(err){
                    if(!err) {
                        res.json({type:false,data:'Tag removed Successfully' })
                    } else {
                        res.json({type:false,data:'database error occured' })
                    }
                })
            } else {
                res.json({type:false,data:'You dont have priviledges to perform this operation!' })
            }
        }
     })
 })   

//isadmin service to check whether user is admin or not(CSR and Management are admins)
app.get('/isadmin',ensureAuthorized,function(req,res){
    console.log("isAdmin service call");
    User.findOne({token:req.token},function(err,data){
        if(err)
            console.log(err)
        else {
            console.log(data.access)
            if(data.access == 3 || data.access == 2) {
                res.send(true)
            } else {
                res.send(false);
            }
        }
    });
})
//authenticate service for login 
app.post('/authenticate', function(req, res) {
    User.findOne({email: req.body.email, password: req.body.password}, function(err, user) {
        if (err) {
            res.json({
                type: false,
                data: "Error occured: " + err
            });
        } else {
            if (user) {
               res.json({
                    type: true,
                    data: user.name,
                    access:user.access,
                    token: user.token
                }); 
				
			//if authentication fails
            } else {
                res.json({
                    type: false,
                    data: "Incorrect email/password"
                });    
            }
        }
    });
});

//signin service for new users
//Automatically signs in if account successfully created
app.post('/signin', function(req, res) {
    console.log(req.body)
    User.findOne({$or:[{email: req.body.email}, {username:req.body.username}]}, function(err, user) {
        if (err) {
            res.json({
                type: false,
                data: "Error occured: " + err
            });
        } else {
                if (user) {
                res.json({
                    type: false,
                    data: "User already exists!"
                });
            } else {
                var userModel = new User();
                console.log(userModel);
                userModel.name = req.body.name;
                userModel.email = req.body.email;
                userModel.username = req.body.email;
                userModel.password = req.body.password;
                
                userModel.save(function(err, user) {
                    user.token = jwt.sign({name:user.name,access:user.access}, 'thiswillbeyoursecret');
                    user.save(function(err, user1) {
                        res.json({
                            type: true,
                            data: user1.name,
                            access:user.access,
                            token: user1.token,
                        });
                    });
                })
            }
        }
    });
});
//getme fetches the loggedin user details
app.get('/getme', ensureAuthorized, function(req, res) {
    console.log("/m service called")
    User.findOne({token: req.token}, function(err, user) {
        if (err) {
            res.json({
                type: false,
                data: "Error occured: " + err
            });
        } else {
            res.json({
                type: true,
                data: user
            });
        }
    });
});
//checking wether user is logged in 
function ensureAuthorized(req, res, next) {
    console.log("ensure auth called")
    var bearerToken;
    var bearerHeader = req.headers["authorization"];
    console.log(bearerHeader)
    if (typeof bearerHeader !== 'undefined') {
        var bearer = bearerHeader.split(" ");
        bearerToken = bearer[1];
        req.token = bearerToken;
        next();
    } else {
        //if user is logged out before submitting authorized action
        res.json({type:false,data:'You are not authorized'})
    }
}

process.on('uncaughtException', function(err) {
    console.log(err);
});

app.get("/", function(req, res) {
    res.sendFile("./app/index.html");
});
app.get("/show", function(req, res) {
    res.sendFile("./app/index.html",{ root: __dirname });
});
app.get("/me",function(req, res) {
    res.sendFile("./app/index.html",{ root: __dirname });
});
app.get("/signin", function(req, res) {
    res.sendFile("./app/index.html",{ root: __dirname });
});
app.get("/signup", function(req, res) {
    res.sendFile("./app/index.html",{ root: __dirname });
});
app.get("/tag", function(req, res) {
    res.sendFile("./app/index.html",{ root: __dirname });
});


// Start Server
app.listen(port, function () {
    console.log( "Express server listening on port " + port);
});