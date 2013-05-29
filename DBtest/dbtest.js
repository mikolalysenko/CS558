var levelup = require("level");

var db = levelup("db/", function(err, value){console.log("error: " + err)});

db.put("key1", "4", function(err,val){console.log("error: " + err)});
console.log(db.get("key1", function(err, val){console.log("error: " + err)}));
db.close();
