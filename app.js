var express = require('express');
var bodyParser = require('body-parser');
var path = require('path');
var mongojs = require('mongojs');
var db = mongojs('eve', ['invTypes'])
var ObjectID = mongojs.ObjectID;
var request = require('request');
var qs = require('querystring');
var session = require('express-session');
var asyncLoop = require('node-async-loop');

var app = express();

//View Engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
//Body Parser Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));

//Set session secret and max age
app.use(session({
  secret: 'keyboard cat'
}));

//Set Static path
app.use(express.static(path.join(__dirname, 'public')));


var url = 'https://login.eveonline.com/oauth/authorize?response_type=code&redirect_uri=http://localhost:3000/callback&client_id=78e34d0844ca473faeb4dd02f8df2db5&scope=characterAssetsRead'

var scope = ['corporationContactsRead',
'publicData',
'characterStatsRead',
'characterFittingsRead',
'characterFittingsWrite',
'characterContactsRead',
'characterContactsWrite',
'characterLocationRead',
'characterNavigationWrite',
'characterAssetsRead',
'characterCalendarRead',
'characterIndustryJobsRead',
'characterKillsRead',
'characterMailRead',
'characterMarketOrdersRead',
'characterMedalsRead',
'characterNotificationsRead',
'characterResearchRead',
'characterSkillsRead',
'characterAccountRead',
'characterContractsRead',
'characterBookmarksRead',
'characterChatChannelsRead',
'characterClonesRead',
'characterOpportunitiesRead',
'characterLoyaltyPointsRead',
'corporationWalletRead',
'corporationAssetsRead',
'corporationFactionalWarfareRead',
'corporationIndustryJobsRead',
'corporationKillsRead',
'corporationMembersRead',
'corporationMarketOrdersRead',
'fleetRead',
'fleetWrite',
'structureVulnUpdate',
'remoteClientUI',
'esi-calendar.respond_calendar_events.v1',
'esi-calendar.read_calendar_events.v1',
'esi-location.read_location.v1',
'esi-location.read_ship_type.v1',
'esi-mail.organize_mail.v1',
'esi-mail.read_mail.v1',
'esi-mail.send_mail.v1',
'esi-skills.read_skills.v1',
'esi-skills.read_skillqueue.v1',
'esi-wallet.read_character_wallet.v1',
'esi-wallet.read_corporation_wallet.v1',
'esi-search.search_structures.v1',
'esi-clones.read_clones.v1',
'esi-characters.read_contacts.v1',
'esi-universe.read_structures.v1',
'esi-bookmarks.read_character_bookmarks.v1',
'esi-killmails.read_killmails.v1',
'esi-corporations.read_corporation_membership.v1',
'esi-assets.read_assets.v1',
'esi-planets.manage_planets.v1',
'esi-fleets.read_fleet.v1',
'esi-fleets.write_fleet.v1',
'esi-ui.open_window.v1',
'esi-ui.write_waypoint.v1',
'esi-characters.write_contacts.v1',
'esi-fittings.read_fittings.v1',
'esi-fittings.write_fittings.v1',
'esi-markets.structure_markets.v1',
'esi-corporations.read_structures.v1',
'esi-corporations.write_structures.v1',
'esi-characters.read_loyalty.v1',
'esi-characters.read_opportunities.v1',
'esi-characters.read_chat_channels.v1',
'esi-characters.read_medals.v1',
'esi-characters.read_standings.v1',
'esi-characters.read_agents_research.v1',
'esi-industry.read_character_jobs.v1',
'esi-markets.read_character_orders.v1',
'esi-characters.read_blueprints.v1',
'esi-characters.read_corporation_roles.v1',
'esi-location.read_online.v1',
'esi-contracts.read_character_contracts.v1',
'esi-clones.read_implants.v1',
'esi-characters.read_fatigue.v1',
'esi-killmails.read_corporation_killmails.v1',
'esi-corporations.track_members.v1',
'esi-wallet.read_corporation_wallets.v1',
'esi-characters.read_notifications.v1',
'esi-corporations.read_divisions.v1',
'esi-corporations.read_contacts.v1',
'esi-assets.read_corporation_assets.v1',
'esi-corporations.read_titles.v1',
'esi-corporations.read_blueprints.v1',
'esi-bookmarks.read_corporation_bookmarks.v1',
'esi-contracts.read_corporation_contracts.v1',
'esi-corporations.read_standings.v1',
'esi-corporations.read_starbases.v1',
'esi-industry.read_corporation_jobs.v1',
'esi-markets.read_corporation_orders.v1',
'esi-corporations.read_container_logs.v1',
'esi-industry.read_character_mining.v1',
'esi-industry.read_corporation_mining.v1'];

for(i=0;i<scope.length;i++){
  url+='%20'+scope[i];
};

app.get('/', function(req, res){
if(req.session.logged){
  res.render('index',{
    character_name:req.session.character.CharacterName,
    callback_url:'logged'
  });
}
else{
  res.render('index',{
    callback_url:url
  });
}
});

app.get('/logout', function(req, res){
  req.session.destroy(function(err){
    console.log(req.session);
    res.redirect('/');
  });
})

app.get('/market', function(req, res){
  
})

app.post('/fit', function(req, res){
  let name = req.body.fit.match(/\[([^\[\]]+)\]/g);
  let items =[];
  let lines = req.body.fit.split('\n');
  let fit ={};
  let i = 0;
  asyncLoop(lines, 1, function(line, next){
    line = line.replace(/\[([^\[\]]+)\]/g, '');
    line = line.replace(/,([^,]+)$/gm, '');
    line = line.replace(/(?:x)+(?:[0-9]+)$/gm, '');
    line = line.replace(/\r$/gm, '');
    if(line ===''){
      next();
    }else{
      line = line.trim()
      items.push(line);
      console.log(line);
      db.invTypes.findOne({typeName:line}, function(err, doc) {
       if(!err){
         console.log(doc.typeID);
         fit[i]={
           id:doc.typeID,
           itemName:line
         }
        }
        else{
          fit[i]={
            id:'Not Found',
            itemName:line
          }
           console.log(err);
         }
         i++;
         next();
      });
    }
  }, function (err){
    if(err){
      console.log(err);
      return;
    }
    console.log(fit);
    console.log('finished');
    if(req.session.logged){
      res.render('fit',{
        character_id:req.session.character.CharacterID,
        character_name:req.session.character.CharacterName,
        char_image_loc: req.session.character.portraits.px64x64,
        access_token: req.session.access_token,
        char_killmails: req.session.character.killmails,
        callback_url:'logged',
        name: name,
        fit : fit
      });
    }else{
      res.render('fit',{
        callback_url:url,
        name: name,
        fit : fit
      });
    }
  });
})

app.get('/dashboard', function(req, res){
  if(req.session.logged){
  res.render('callback',{
    character_id:req.session.character.CharacterID,
    character_name:req.session.character.CharacterName,
    char_image_loc: req.session.character.portraits.px64x64,
    access_token: req.session.access_token,
    char_killmails: req.session.character.killmails,
    callback_url:'logged'
  });
}else{
  res.redirect('/');
}
})

app.get('/killmail', function(req, res){
  if(req.session.logged){
    let killmailID=req.query.id;
    let killmailHash=req.query.hash;
    console.log(killmailID+' '+killmailHash);

    request({
     uri:'https://esi.tech.ccp.is/latest/killmails/'+killmailID+'/'+killmailHash+'/?datasource=tranquility',
     method:'GET'
   }, function (err, response, body){
     let killmailDetails=JSON.parse(body);
     let victim = killmailDetails.victim;
     db.invTypes.findOne({typeID:victim.ship_type_id.toString()}, function(err, doc) {
      if(!err){
        ship_name = doc.typeName;
      }
      else{
        console.log(err);
        res.render('error',{
          error:err,
          callback_url:url});
      }
    });
    let attacker_ids ='';
    for(var i=0; i<killmailDetails.attackers.length;i++){
      attacker_ids += '%2C' + killmailDetails.attackers[i].character_id ;

    }
    console.log(attacker_ids);
    request({
     uri:'https://esi.tech.ccp.is/latest/characters/names/?character_ids='+killmailDetails.victim.character_id+attacker_ids+'&datasource=tranquility',
     method:'GET'
    }, function (err, response, body){
     names = JSON.parse(body);
     for(j=0;j<killmailDetails.attackers.length;j++){
        for(i=0;i<names.length;i++){
          if(names[i].character_id === killmailDetails.victim.character_id){
            victim.name = names[i].character_name;
          }
          if(names[i].character_id ===killmailDetails.attackers[j].character_id ){
            killmailDetails.attackers[j].name = names[i].character_name;
            if(killmailDetails.attackers[j].final_blow === true){
              final_blow_char = killmailDetails.attackers[j];
              final_blow_char.name = names[i].character_name;
            }
          }
        }
      }
      //console.log(final_blow_char);
      res.render('killmail',{
          character_id:req.session.character.CharacterID,
          character_name:req.session.character.CharacterName,
          victim:victim,
          final_blow:final_blow_char,
          ship_type: ship_name,
          callback_url:'logged'
        });
   });
   });
}else{
  res.redirect('/');
}
})

//Callback after Eve Login
app.get('/callback', function(req, res){
//redirect if already logged
  if (req.session.logged){
    res.redirect('/dashboard');
  }
  //else call oauth
  else{
    const code = req.query.code;
    const oauthURL = 'https://login.eveonline.com/oauth/token';
    var oauth = {
      "grant_type":"authorization_code",
        "code":code
    }
    console.log(JSON.stringify(oauth));
    //Post with auth code
    request({
      headers:{
        'Authorization': 'Basic NzhlMzRkMDg0NGNhNDczZmFlYjRkZDAyZjhkZjJkYjU6NXYzNGdtcXNUVTJGc2dHbGpCckltMUFZRWp5WEY2dEVvbXBxYUFmRQ==',
        'Content-Type':'application/json'
      },
      uri: oauthURL,
      body: JSON.stringify(oauth),
      method:'POST'
    }, function(err, response, body){
      var a_token = JSON.parse(body).access_token;
      req.session.access_token = JSON.parse(body).access_token;
      console.log(a_token);
      //Verify and get character
      request({
        headers:{
          'Authorization':'Bearer '+a_token
        },
        uri:'https://login.eveonline.com/oauth/verify',
        method:'GET'
      }, function(err, response, body){
        if(!err){
          //Save Character to session
          req.session.logged = true;
          req.session.character = JSON.parse(body);
          //Get Portrait
          request({
            uri:'https://esi.tech.ccp.is/latest/characters/'+req.session.character.CharacterID+'/portrait/?datasource=tranquility',
            method:'GET'
          }, function (err, response, body){
            if(!err){
              req.session.character.portraits = JSON.parse(body);
            }
            else{
              console.log(err);
              req.session.character.portraits = '/img/nopic.jpg';
            }
            //if no login error, redirect to dashboard
            getKillMails();
          });
      }else{
        //else render error page
        res.render('error',{
          error:err,
          callback_url:url});
      }
      });
    });
  }
  function getKillMails(){
  request({
    uri:'https://esi.tech.ccp.is/latest/characters/'+req.session.character.CharacterID+'/killmails/recent/?datasource=tranquility&max_count=20&token='+req.session.access_token,
    method:'GET'
  }, function (err, response, body){
    req.session.character.killmails = JSON.parse(body);
    let i=0;
        asyncLoop(req.session.character.killmails, function(killmail, next){
          request({
           uri:'https://esi.tech.ccp.is/latest/killmails/'+killmail.killmail_id+'/'+killmail.killmail_hash+'/?datasource=tranquility',
           method:'GET'
         }, function (err, response, body){
           if(!err){
             killmail.killDetails = JSON.parse(body);
             for(j=0; j<killmail.killDetails.attackers.length;j++){
               if(killmail.killDetails.attackers[j].final_blow === true){
                 killmail.killDetails.killer_id = killmail.killDetails.attackers[j].character_id;
               }
             }
              db.invTypes.findOne({typeID:killmail.killDetails.victim.ship_type_id.toString()}, function(err, doc) {
               if(!err){
                 killmail.killDetails.victim.ship_name = doc.typeName;
                 request({
                  uri:'https://esi.tech.ccp.is/latest/characters/names/?character_ids='+killmail.killDetails.victim.character_id+'%2C'+killmail.killDetails.killer_id+'&datasource=tranquility',
                  method:'GET'
                }, function (err, response, body){
                  killmail.killDetails.victim.name = JSON.parse(body)[0].character_name;
                  killmail.killDetails.killer_name = JSON.parse(body)[1].character_name;
                  if(i+1==req.session.character.killmails.length){
                   res.redirect('/dashboard');
                  }
                  i++;
                });
               }else{
                 console.log(err);
               }

             });
           }else{
             console.log(err);
             res.render('error',{
               error:err,
               callback_url:url});
           }
         })

         next();
       }, function (err){
         if(err){
           console.log(err);
           return;
         }
       });

        }
    )}

  })


app.listen(3000, function(){
  console.log('Server started on port 3000');
})
