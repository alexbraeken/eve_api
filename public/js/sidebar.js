var $char = {};

$(document).ready(function(){
  $('#loadingDiv').hide();
  getCharInfo();
});

//getCorp($char.corporation_id);
function getCharInfo(){
  var root='https://esi.tech.ccp.is/latest/characters/';
  var char_id=$('#sidebarList').data('id');
  var datasource = '/?datasource=tranquility';
  var url = root+char_id+datasource;
  console.log(url);
  $.ajax({
    url: url,
    method: 'GET',
    beforeSend: function(){
                       console.log('loading Character');
                   }
  }).then(function(char) {
    $('#loadingDiv').hide();
    $char = char;
    console.log($char);
    getCorpAlliance($char.corporation_id);
    getWallet(char_id);
    getSkillQ(char_id);
  });

}


function getCorpAlliance(corpID){
  var root = 'https://esi.tech.ccp.is/latest/corporations/';
  var corp_id= corpID;
  var datasource='/?datasource=tranquility';
  var url = root+corp_id+datasource;
  $.ajax({
    url: url,
    method: 'GET',
    beforeSend: function(){
                       console.log('loading Corporation');
                   }
  }).then(function(corp) {
    console.log(corp);
    console.log(corp.corporation_name);
    $('#loadingDiv').remove();
    $('#corp').replaceWith("<li id='corp' class='list-group-item' data-corpInfo='"+corp+"'>Corporation: "+corp.corporation_name+"</li>");
    getAlliance(corp.alliance_id);
  });
}

function getAlliance(allianceID){
  var root = 'https://esi.tech.ccp.is/latest/alliances/';
  var alliance_id= allianceID;
  var datasource='/?datasource=tranquility';
  var url = root+alliance_id+datasource;
  $.ajax({
    url: url,
    method: 'GET',
    beforeSend: function(){
                       console.log('loading Alliance');
                   }
  }).then(function(alliance) {
    console.log(alliance);
    console.log(alliance.alliance_name);
    $('#loadingDiv').remove();
    $('#alliance').replaceWith("<li id='alliance' class='list-group-item' data-allianceInfo='"+alliance+"'>Alliance: "+alliance.alliance_name+"</li>")
  });
}

function getWallet(charID){
  var root = 'https://esi.tech.ccp.is/latest/characters/';
  var token =$('#sidebarList').data('token');
  var datasource='/wallet/?datasource=tranquility';
  var authtoken = '&token=' + token;
  var url = root + charID + datasource + authtoken;

  $.ajax({
    url: url,
    method: 'GET'
  }).then(function(wallet){
      console.log(wallet);
      $('#wallet').replaceWith("<li id='wallet' class='list-group-item' data-wallet='"+wallet.toLocaleString()+"'>Wallet: "+wallet.toLocaleString()+" ISK</li>")
    })
}

function getSkillQ(charID){
  var root = 'https://esi.tech.ccp.is/latest/characters/';
  var datasource='/skillqueue/?datasource=tranquility';
  var token =$('#sidebarList').data('token');
  var authtoken = '&token=' + token;
  var url = root + charID + datasource + authtoken;

  $.ajax({
    url: url,
    method: 'GET'
  }).then(function(skillqueue){
      console.log(skillqueue, charID);
      var skillID = skillqueue[0].skill_id;
      var finishDate = skillqueue[0].finish_date;
      getSkillName(skillID);
      CountDownTimer(finishDate, 'skill_countdown');
    })
}

function getSkillName(skillID, finishDate){
  console.log(Date.parse(finishDate));
  var root = 'https://esi.tech.ccp.is/latest/universe/types/';
  var datasource='/?datasource=tranquility&language=en-us';
  var url = root + skillID + datasource;

  $.ajax({
    url: url,
    method: 'GET'
  }).then(function(skillInfo){
      console.log(skillInfo);
      $('#training').replaceWith("<li id='training' class='list-group-item' data-type_id='"+skillInfo+"'>Training: "+skillInfo.name+" </li>");
    })
}

function CountDownTimer(dt, id)
    {
        var end = new Date(dt);
        console.log(end);
        var _second = 1000;
        var _minute = _second * 60;
        var _hour = _minute * 60;
        var _day = _hour * 24;
        var timer;

        function showRemaining() {
            var now = new Date();
            var distance = end - now;
            console.log(distance);
            if (distance < 0) {

                clearInterval(timer);
                document.getElementById(id).innerHTML = 'EXPIRED!';

                return;
            }
            var days = Math.floor(distance / _day);
            var hours = Math.floor((distance % _day) / _hour);
            var minutes = Math.floor((distance % _hour) / _minute);
            var seconds = Math.floor((distance % _minute) / _second);

            document.getElementById('days').innerHTML = days + 'days ';
            document.getElementById('hours').innerHTML = hours + 'hrs ';
            document.getElementById('minutes').innerHTML = minutes + 'mins ';
            document.getElementById('seconds').innerHTML = seconds + 'secs';
        }

        timer = setInterval(showRemaining, 1000);
    }
