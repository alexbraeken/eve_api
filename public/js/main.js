$(document).ready(function(){

$('.getAlliances').on('click', getAlliances);

let table = $('#killmails').DataTable();
let canvas = $("#myChart").get(0);
let ctx = canvas.getContext("2d");

$('#killmails tbody').on('click', 'tr', function () {
    let id= $(this).data('id');
    let hash = $(this).data('hash');
    let data = table.row( this ).data();
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
    getStationMinMaxOrder(regionID, stationID, itemID, 'sell', self);
  });
});

$( "#buyOrderStation" ).change(function() {
  let regionID = $(this).find(':selected').data('regionid');
  let stationID = $(this).find(':selected').data('stationid');
  let items ='';
  $("#buySellTable > tbody > tr").each(function(){
    let itemID = $(this).find(".itemID").html();
    let self = this;
    getStationMinMaxOrder(regionID, stationID, itemID, 'buy', self);
  });
});

$(".sellTd").click(function(){
  if($(".sellTd").html()){
    let regionID = $("#sellOrderStation").find(':selected').data('regionid');
    let stationID = $("#sellOrderStation").find(':selected').data('stationid');
    let stationName = $("#sellOrderStation").find(':selected').text();
    let itemID = $(this).closest('tr').find(".itemID").html();
    let itemName = $(this).closest('tr').find(".itemName").html();

    getRegionOrdersHistory(regionID, itemID);

    $("#modalHeader").html(itemName+"30 Day Order History in "+stationName+" region:");
    $("#myModal").css("display", "block");
  }
});

$(".buyTd").click(function(){
  if($(".buyTd").html()){
    let regionID = $("#sellOrderStation").find(':selected').data('regionid');
    let stationID = $("#sellOrderStation").find(':selected').data('stationid');
    let stationName = $("#buyOrderStation").find(':selected').text();
    let itemID = $(this).closest('tr').find(".itemID").html();
    let itemName = $(this).closest('tr').find(".itemName").html();
    getRegionOrdersHistory(regionID, itemID);

    $("#modalHeader").html(itemName+"30 Day Order History in "+stationName+" region:");
    $("#myModal").css("display", "block");
  }
});

$("#close").click(function(){
  $("#myModal").css("display", "none");
});

$(window).click(function(event){
  console.log("clicked "+ event.target.className);
  if(event.target.className == "modal"){
      $("#myModal").css("display", "none");
  }
})


function getAlliances(){
  let url = 'https://esi.tech.ccp.is/latest/alliances/?datasource=tranquility';
  $.ajax({
    url: url,
    method: 'GET'
  }).then(function(data_ids) {

    /*var url = 'https://esi.tech.ccp.is/latest/alliances/names/?alliance_ids=' + data_ids.join("%2C") + '&datasource=tranquility';*/

    for(let i=0; i<data_ids.length; i++){
      $('.result').append("<li class='list-group-item'><a href='#' class='getName' id='"+data_ids[i]+"' data-id='"+data_ids[i]+"'>"+data_ids[i]+"</a></li>");
    }

});
}

function getName(id){
  let url = 'https://esi.tech.ccp.is/latest/alliances/names/?alliance_ids=' + id + '&datasource=tranquility';
  $.ajax({
    url: url,
    method: 'GET'
  }).then(function(name){
    $('#'+name[0].alliance_id).append('&nbsp<strong>'+name[0].alliance_name+'</strong>');
    console.log(name[0].alliance_name);
  });
}

function getStationMinMaxOrder(regionID, stationID, itemID, buySell, self){
  let url = 'https://esi.tech.ccp.is/latest/markets/'+regionID+'/orders/?datasource=tranquility&order_type='+buySell+'&page=1&type_id='+itemID;
  $.ajax({
    url: url,
    method: 'GET',
  }).done(function(orders){
    if(buySell === 'sell'){
      let minPriceOrder=orders[0];
      for(let i = 1; i<orders.length;i++){
        if(orders[i].location_id === stationID){
          if(orders[i].price < minPriceOrder.price){
            minPriceOrder = orders[i];
          }
        }
      }
      $(self).find('.sellTd').data('price', minPriceOrder);
      $(self).find('.sellTd').html(new Intl.NumberFormat().format(minPriceOrder.price));
    }
    else{
      let maxPriceOrder=orders[0];
      for(let i = 1; i<orders.length;i++){
        if(orders[i].location_id === stationID){
          if(orders[i].price > maxPriceOrder.price){
            maxPriceOrder = orders[i];
          }
        }
      }
      $(self).find('.buyTd').data('order', maxPriceOrder);
      $(self).find('.buyTd').html(new Intl.NumberFormat().format(maxPriceOrder.price));
    }
  }).done(function(){
        if($(self).find(".buyTd").data('order') &&  $(self).find(".sellTd").data('price')){
          let buyOrder = $(self).find(".buyTd").data('order').price;
          let sellOrder = $(self).find(".sellTd").data('price').price;
          $(self).find('.relDiff').html(Math.floor((100-(100/sellOrder)*buyOrder))+'%');
        }
    });
  }
  function  getRegionOrdersHistory(regionID, itemID){
      let url = 'https://esi.tech.ccp.is/latest/markets/'+regionID+'/history/?datasource=tranquility&type_id='+itemID;
      $.ajax({
        url: url,
        method: 'GET',
      }).done(function(orders){
        console.log(orders.length);
        renderChart(orders);
      });
  }

function renderChart(data){
  let minDate = new Date();
  historyLength = 30;
  minDate.setDate((new Date()).getDate()-historyLength);

  let day = [], xLabel = [];
  for(let i = 0; i<historyLength; i++){
    day[i]=new Date();
    day[i].setDate((new Date()).getDate()-i);
    xLabel.unshift(day[i].toDateString());
  }

  let iskData =[], qtyData =[];
  for(let i=0; i<data.length; i++){
    if(Date.parse(data[i].date)>=minDate){
      iskData.push(data[i].average);
      qtyData.push(data[i].volume);
    }
  }
  console.log(xLabel);
  if(window.chart != null){
    window.chart.destroy();
  }
  window.chart = new Chart(canvas,{
      type: 'bar',
      data: {
          labels: xLabel,
          datasets: [{
              label: 'Volume',
              yAxisID: 'right-y-axis',
              data: qtyData,
              borderWidth: 1
          },{
          label: 'ISK',
          yAxisID: 'left-y-axis',
          data: iskData,
          type: 'line',
          borderColor: 'rgba(255,99,132,1)',
          backgroundColor: 'rgba(0, 0, 0, 0)'
        }]
      },
      options: {
          scales: {
              yAxes: [{
                id: 'left-y-axis',
                type: 'linear',
                position: 'left',
                  ticks: {
                      beginAtZero:true
                  }
              },{
                id: 'right-y-axis',
                type: 'linear',
                position: 'right',
                ticks: {
                    beginAtZero:true
                }
              }
            ]
          },
          elements:{
            line:{
              tension:0
            }
          }
      }
    });
}

});
