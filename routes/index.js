var express = require('express');
var mongoose = require('mongoose')
var router = express.Router();
var gcm = require('node-gcm');
var request = require('request');
var launchesData = require('../data/launchesData');
var sender = new gcm.Sender("AIzaSyDKFQ2fKhJJLhrj5d9JvViUD3SebRheeh0");
var options = {
  user: 'admin',
  pass: 'admin'
}


mongoose.connect('mongodb://ds147985.mlab.com:47985/arrow' , options);


/*setInterval(function () { 
    getJson();
}, 2000);*/

router.get('/', function(req, res, next) { 
    console.log("------------ IM! HERE! BRO! ----------------");
  res.render('index', { title: 'Express' });
});

router.get('/stuff', function(req, res, next) { 
console.log("------------ IM HERE BRO ----------------");
  res.send({"code" : 200 , "msg" : "hello"});
});

function getJson() {
    //writeLog('getJson');
    request('http://www.oref.org.il/WarningMessages/Alert/alerts.json?v=1', function (error, response, body) {
    //Check for error
    if(error){
        return console.log('Error:', error);
    }

    //Check for right status code
    if(response.statusCode !== 200){
        return console.log('Invalid Status Code Returned:', response.statusCode);
    } 
    var hashLaunches = launchesData.hash;
    if (body.data != undefined) {
	    var launch = '{ "landTime" :' + parseInt(hashLaunches[body.data].time) + ', "polygon": ' + [[]] + ', "areaName": ' + body.data;
        return JSON.parse(launch);
    }
    return;
    });
}

// GCM
// Registrations
var GcmRegistrationSchema = mongoose.Schema(require('../models/GcmRegistrationSchema'));
var registrations = mongoose.model('gcmregistrations', GcmRegistrationSchema);

router.get('/api/gcm/register', function(req, res) {
    console.log("**************************************************");
    console.log("Works !!! ");
});

router.post('/api/gcm/register', function(req, res) {
    console.log(req.body);

     registrations.update({hardwareId : req.body.hardwareId},
          req.body, {upsert:true}, function(err, result) {
              if(!err) {
                  console.log(result);
                  res.json({ code: 201, message: 'registered successfully! :)' });
              } else {
                  console.log(err);
                  res.json({ code: 400, message: 'Couldn\'t register... :(' });
              }

              console.log(res.body);
              res.send();
          });
});

router.get('/api/users', function(req, res) {
    registrations.find(function (err, registrations) { 
        if(!err) {
            console.log("users are: " + registrations);
            res.json({ code: 201, message: 'registered successfully! :)' , data: registrations });
        } else {
            console.log(err);
            res.json({ code: 400, message: 'Couldn\'t register... :(' });
        }

        console.log(res.body);
        res.send();
    });
});


router.post('/api/gcm/push', function(req, res) {
    console.log("**************************************************"+req);
    var sender = new gcm.Sender("AIzaSyDKFQ2fKhJJLhrj5d9JvViUD3SebRheeh0");

    // Initialize Message object
    var message = new gcm.Message();
    message.addData('message', req.body.message);
    message.addData('title', req.body.title);
    message.addData('areaName', req.body.areaName);
    message.addData('landTime', req.body.landTime);
    console.log(message);
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

router.post('/api/gcm/pushes', function(req, res) {
    console.log("**************************************************"+req);

    registrations.find(function (err, registrations) {
        var sender = new gcm.Sender("AIzaSyDKFQ2fKhJJLhrj5d9JvViUD3SebRheeh0");

            // Initialize Message object
            var message = new gcm.Message();
            message.addData('message', req.body.message);
            message.addData('title', req.body.title);
            message.addData('areaName', req.body.areaName);
            message.addData('landTime', req.body.landTime);
            
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
    })
    
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
//end

module.exports = router;
