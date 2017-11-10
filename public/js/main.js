$(document).ready(function(){

$('.getAlliances').on('click', getAlliances);

var table = $('#killmails').DataTable();

$('#killmails tbody').on('click', 'tr', function () {
    let id= $(this).data('id');
    let hash = $(this).data('hash');
    var data = table.row( this ).data();
    data.push(id);
    data.push(hash);
    location.href = "/killmail?id="+data[4]+'&hash='+data[5];
} );

$('body').on('click', '.getName', function(e){
    e.preventDefault();

    let id=$(this).data('id');

    getName(id);
});



$( "#sellOrderStation" ).change(function() {
  let regionID = $(this).find(':selected').data('regionid');
  let stationID = $(this).find(':selected').data('stationid');
  let items ='';
  $("#buySellTable > tbody > tr").each(function(){
    let itemID = $(this).find(".itemID").html();
    let self = this;
    getStationOrders(regionID, stationID, itemID, 'sell', self);
  });
});

$( "#buyOrderStation" ).change(function() {
  let regionID = $(this).find(':selected').data('regionid');
  let stationID = $(this).find(':selected').data('stationid');
  let items ='';
  $("#buySellTable > tbody > tr").each(function(){
    let itemID = $(this).find(".itemID").html();
    let self = this;
    getStationOrders(regionID, stationID, itemID, 'buy', self);
  });
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

function getStationOrders(regionID, stationID, itemID, buySell, self){
  var url = 'https://esi.tech.ccp.is/latest/markets/'+regionID+'/orders/?datasource=tranquility&order_type='+buySell+'&page=1&type_id='+itemID;
  $.ajax({
    url: url,
    method: 'GET',
    beforeSend: function(){
      return 'hello';
    }
  }).done(function(orders){
    if(buySell === 'sell'){
      let minPriceOrder=orders[0];
      for(let i = 1; i<orders.length;i++){
        if(orders[i].price < minPriceOrder.price){
          minPriceOrder = orders[i];
        }
      }
      $(self).find('.sellTd').data('price', minPriceOrder.price);
      $(self).find('.sellTd').html(new Intl.NumberFormat().format(minPriceOrder.price));
    }
    else{
      let maxPriceOrder=orders[0];
      for(let i = 1; i<orders.length;i++){
        if(orders[i].price > maxPriceOrder.price){
          maxPriceOrder = orders[i];
        }
      }
      $(self).find('.buyTd').data('price', maxPriceOrder.price);
      $(self).find('.buyTd').html(new Intl.NumberFormat().format(maxPriceOrder.price));
    }
  }).done(function(){
        let buyOrder = $(self).find(".buyTd").data('price');
        let sellOrder = $(self).find(".sellTd").data('price');
        $(self).find('.relDiff').html(Math.floor((100-(100/sellOrder)*buyOrder))+'%');
    });
  };

});
