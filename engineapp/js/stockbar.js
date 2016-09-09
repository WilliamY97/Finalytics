
////////////////////////////////////////
// Get stock data via YQL query
var getStocks = function () {
      
  var wsql = "select * from yahoo.finance.quotes where symbol in ('YHOO', 'AAPL', 'GOOG')",
      stockYQL = 'https://query.yahooapis.com/v1/public/yql?q='+encodeURIComponent(wsql)+'&env=http%3A%2F%2Fdatatables.org%2Falltables.env&format=json&callback=?';
  
  return $.ajax({
    url: stockYQL,
    dataType: 'jsonp'
  });
};


////////////////////////////////////////
// Format Numbers
var getRepString = function (rep) {
  rep = rep+''; // coerce to string
  if (rep >= 1000000000) {
    return (rep / 1000000000).toFixed(1).replace(/\.0$/, '') + 'G';
  } else if (rep >= 1000000) {
    return (rep / 1000000).toFixed(1).replace(/\.0$/, '') + 'M';
  } else if (rep >= 1000) {
    return (rep / 1000).toFixed(1).replace(/\.0$/, '') + 'K';
  } else {
    return rep; 
  }
}


////////////////////////////////////////
// Replace children with [data-replace] attribute given a data object
function dataReplace(data) {
  
  $('#stockMQ').append("<span class=\"Symbol\"><b class=\"Stat\"><i data-replace='Symbol'>" + data.Symbol + "</i>:<i data-replace='StockExchange'>" + data.StockExchange + " </i></b><b class=\"Label\">( <i data-replace='Name'>" + data.Name.replace(/\W/gi, ' ') + "</i> )</b></span>");
  $('#stockMQ').append("<span class=\"Price\"><b class=\"Label\">Last Price</b> <b class=\"Stat\">$<i data-replace='LastTradePriceOnly'>" + data.LastTradePriceOnly + "</i></b></span>");
  $('#stockMQ').append("<span class=\"Change\"><b class=\"Label\">Change</b> <b class=\"Stat\"><i data-replace='Change'>" + data.Change + "</i></b> <b class=\"Stat\">(<i data-replace='ChangeinPercent'>" + data.ChangeinPercent + "</i>)</b></span>");
  $('#stockMQ').append("<span class=\"Volume\"><b class=\"Label\">Volume</b> <b class=\"Stat\" data-replace='Volume'>" + getRepString(data.Volume) + "</b></span>");
  $('#stockMQ').append("<span class=\"MarketCapitalization\"><b class=\"Label\">Mkt Cap</b> <b class=\"Stat\">$<i data-replace=\"MarketCapitalization\">" + data.MarketCapitalization + "</i></b></span>");
  $('#stockMQ').append("<span class=\"LastUpdated\"><b class=\"Label\">Last Trade</b> <b class=\"Stat\"><i data-replace='LastTradeDate'>" + data.LastTradeDate + "</i><i data-replace=\"LastTradeTime\">" + data.LastTradeTime + "</i> </b></span>");
}

////////////////////////////////////////
// Update on Click
function loadData(){
  
  var _this = this;
  var $this = $(this);
  var _uniqueID = "stockLoad.unique"+Math.floor(Math.random() * (100 - 1) + 1);
  
  $this
    .removeClass("is-Loaded")
    .addClass("is-Loading");
  
  if ( $this.hasClass("is-Visible") ) {
    $this.css("-webkit-animation-play-state", "running");
  }
  
  console.log("Triggering AJAX... ");
  
  getStocks().done(function(data){
    console.log("AJAX Returned.",data);
    for (var stock in data.query.results.quote)
    {
      dataReplace(data.query.results.quote[stock]);
    }
        $('.marquee').marquee({
        //speed in milliseconds of the marquee
        duration: 25000,
        //gap in pixels between the tickers
        gap: 0,
        //time in milliseconds before the marquee will start animating
        delayBeforeStart: 0,
        //'left' or 'right'
        direction: 'left',
        //true or false - should the marquee be duplicated to show an effect of continues flow
        duplicated: true
    });
  });
};

window.onload = function() {
  loadData();
};

