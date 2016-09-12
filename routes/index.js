var express = require('express');
var mongoose = require('mongoose')
var router = express.Router();
var request = require('request');

/*var sendLaunch = function() {
  request(
    { method: 'POST', 
    uri: 'https://android.googleapis.com/gcm/send',
    headers: {
        'Content-Type': 'application/json',
        'Authorization':'key=AIzaSyCZR1nZ3Wzi2qJJhlhMz3mD74yiskjAmE4'
    },
    body: JSON.stringify({
  "registration_ids" : ["1080513657347-95gs1co2j2snru91otauup2qgdrigv95.apps.googleusercontent.com"],
  "data" : {
    //TODO send actual data
    "message":"No , I am your king"
  },
  "time_to_live": 108
})
    }
  , function (error, response, body) {
	  //callback({'response':"Success"});
    console.log(body);
    }
  )
};*/


router.get('/', function(req, res, next) {
  setInterval(function () { 
      sendLaunch();
    }, 30000); 
  res.render('index', { title: 'Express' });
});

// GCM
// Registrations
var GcmRegistrationSchema = mongoose.Schema(require('../models/GcmRegistrationSchema'));
var registrations = mongoose.model('gcmregistrations', GcmRegistrationSchema);

router.get('/api/gcm/register', function(req, res) {
    console.log("Works !!! ");
});

router.post('/api/gcm/register', function(req, res) {
    console.log(req);
    var sender = new gcm.Sender("AIzaSyCZR1nZ3Wzi2qJJhlhMz3mD74yiskjAmE4");

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
    registrations.update({hardwareId : req.body.hardwareId},
         req.body, {upsert:true}, function(err, result) {
             if(!err) {
                 console.log(result);
                 res.json({ code: 201, message: 'registered successfully! :)' });
             } else {
                 console.log(err);
                 res.json({ code: 400, message: 'Couldn\'t register... :(' });
             }
         });
});

// Update registration (tokenId only) ////////////////////
router.put('/api/gcm/register', function(req, res) {
    var sender = new gcm.Sender("AIzaSyCZR1nZ3Wzi2qJJhlhMz3mD74yiskjAmE4");

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
