$(document).ready(function(){

  $('.getAlliances').on('click', getAlliances);


$('body').on('click', '.getName', function(e){
    e.preventDefault();

    let id=$(this).data('id');

    getName(id);
});


function getAlliances(){
  var root = 'https://esi.tech.ccp.is/latest/alliances/?datasource=tranquility';
  $.ajax({
    url: root,
    method: 'GET'
  }).then(function(data_ids) {

    /*var url = 'https://esi.tech.ccp.is/latest/alliances/names/?alliance_ids=' + data_ids.join("%2C") + '&datasource=tranquility';*/

    for(i=0; i<data_ids.length; i++){
      $('.result').append("<li class='list-group-item'><a href='#' class='getName' id='"+data_ids[i]+"' data-id='"+data_ids[i]+"'>"+data_ids[i]+"</a></li>");
    }

});
}

function getName(id){
  var url = 'https://esi.tech.ccp.is/latest/alliances/names/?alliance_ids=' + id + '&datasource=tranquility';
  $.ajax({
    url: url,
    method: 'GET'
  }).then(function(name){
    $('#'+name[0].alliance_id).append('&nbsp<strong>'+name[0].alliance_name+'</strong>');
    console.log(name[0].alliance_name);
  });
}

});
