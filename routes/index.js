var express = require('express');
var mongoose = require('mongoose')
var router = express.Router();
var gcm = require('node-gcm');
var request = require('request');

var options = {
  user: 'admin',
  pass: 'admin'
}

mongoose.connect('mongodb://ds147985.mlab.com:47985/arrow' , options);

router.get('/', function(req, res, next) {
  //setInterval(function () { 
  //    sendLaunch();
  //  }, 30000); 
  res.render('index', { title: 'Express' });
});

/*var getJson = function () {
    //writeLog('getJson');
    $.ajax({
        url: "http://oref.co.il/WarningMessages/Alert/alerts.json?v=1",
        dataType: "json",
        cache: true,//true,
        success: function (data) {
            //writeLog("getJson : success : data = " + data.data);
            // To Do : send launch
        },
        error: function (requestObject, error, errorThrown) {
            //writeLog("getJson : error : data = " + errorThrown);
            return;
        }
    });
}*/

// GCM
// Registrations
var GcmRegistrationSchema = mongoose.Schema(require('../models/GcmRegistrationSchema'));
var registrations = mongoose.model('gcmregistrations', GcmRegistrationSchema);

router.get('/api/gcm/register', function(req, res) {
    console.log("Works !!! ");
});

router.post('/api/gcm/register', function(req, res) {
     registrations.update({hardwareId : req.body.hardwareId},
          req.body, {upsert:true}, function(err, result) {
              if(!err) {
                  console.log(result);
                  res.json({ code: 201, message: 'registered successfully! :)' });
              } else {
                  console.log(err);
                  res.json({ code: 400, message: 'Couldn\'t register... :(' });
              }
              res.send();
          });
});

router.get('/api/users', function(req, res) {
    registrations.find(function (err, registrations) { 
        console.log("users are: " + registrations);
    });
});


router.post('/api/gcm/push', function(req, res) {
    console.log("**************************************************"+req);
    var sender = new gcm.Sender("AIzaSyDKFQ2fKhJJLhrj5d9JvViUD3SebRheeh0");

    // Initialize Message object
    var message = new gcm.Message();
    message.addData('message', req.body.message);
    
    // Add the registration tokens of the devices you want to send to
    var registrationTokens = [];
    registrationTokens.push(req.body.registrationTokenId);
    
    // Send the message
    // ... trying only once
    sender.send(message, { registrationTokens: registrationTokens },10, function(err, response) {
        if(err) console.error(err);
        else {
            console.log(response);
            // res.json(response);
        }
    });
});

// Update registration (tokenId only) ////////////////////
router.put('/api/gcm/register', function(req, res) {
    var sender = new gcm.Sender("AIzaSyDKFQ2fKhJJLhrj5d9JvViUD3SebRheeh0");

    // Initialize Message object
    var message = new gcm.Message();
    message.addData('message', "No , i am the king");
    
    // Add the registration tokens of the devices you want to send to
    var registrationTokens = [];
    registrationTokens.push(req.body.registrationTokenId);
    

    // Send the message
    // ... trying only once
    sender.send(message, { registrationTokens: registrationTokens },10, function(err, response) {
        if(err) console.error(err);
        else {
            console.log(response);
            // res.json(response);
        }
    });
    registrations.update({hardwareId : req.body.hardwareId}, req.body, function(err, result) {
            // If everything's alright
        if (!err && result.ok === 1) {
            res.json({ code: 200});
        } else {
            res.json({error: 'something went wrong..'});
            console.log(err, result);
        }
    });
});


// Get registration
router.get('/api/gcm/registrations/:hardwareId', function(req, res, next) {
    registrations.findOne({hardwareId : req.params.hardwareId},function (err, registration) {
        if (err) return console.error(err);
        res.setHeader('Content-Type', 'application/json');
        res.json(registration);
    });
});

var sendLaunch = function() {
  registrations.find(function (err, registrations) {
          if (err)
              return console.error(err);
          else if (registrations.length > 0) {
              // Set up the sender with marshaldevs@gmail.com API key
              var sender = new gcm.Sender(config.serverApi);

              // Initialize Message object
              var message = new gcm.Message();
              message.addData('message', "No , i am the king");
              
              // Add the registration tokens of the devices you want to send to
              var registrationTokens = [];
              registrations.forEach(function(registration){
                  registrationTokens.push(registration.registrationTokenId);
              });

              // Send the message
              // ... trying only once
              sender.send(message, { registrationTokens: registrationTokens },10, function(err, response) {
                  if(err) console.error(err);
                  else {
                      console.log(response);
                      // res.json(response);
                  }
              });
          } else
              console.log('No GCM Registrations');
              // res.json({noGcmRegistrations:true});
      });
} 

module.exports = router;
