var express = require('express');
var router = express.Router();

/* GET users listing. */
router.get('/', function(req, res, next) {
    setInterval(function () { 
      console.log('sent request!'); 
    }, 1000); 
    res.send("ok");
});

module.exports = router;
