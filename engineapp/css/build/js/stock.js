
var getStocks = function () {
      
  var wsql = "select * from yahoo.finance.quotes where symbol in ('" + document.getElementById("stockSymbol").value.toUpperCase() + "')",
      stockYQL = 'https://query.yahooapis.com/v1/public/yql?q='+encodeURIComponent(wsql)+'&env=http%3A%2F%2Fdatatables.org%2Falltables.env&format=json&callback=?';
  
  return $.ajax({
    url: stockYQL,
    dataType: 'jsonp'
  });
};

var getStocksbySymbol = function (symbol) {
      
  var wsql = "select * from yahoo.finance.quotes where symbol in ('" + symbol + "')",
      stockYQL = 'https://query.yahooapis.com/v1/public/yql?q='+encodeURIComponent(wsql)+'&env=http%3A%2F%2Fdatatables.org%2Falltables.env&format=json&callback=?';
  
  return $.ajax({
    url: stockYQL,
    dataType: 'jsonp'
  });
};

function formatDate(date) {
    var d = new Date(date),
        month = '' + (d.getMonth() + 1),
        day = '' + d.getDate(),
        year = d.getFullYear();

    if (month.length < 2) month = '0' + month;
    if (day.length < 2) day = '0' + day;

    return [year, month, day].join('-');
}

var getHistoricalData = function (timeframe){

    var endDate = formatDate(new Date());
    var startDate = new Date(endDate);
    if(timeframe === 'week')
        startDate.setDate(startDate.getDate() - 7);
    else if (timeframe === 'month')
        startDate.setMonth(startDate.getMonth() - 1);
    else if (timeframe === 'year')
        startDate.setMonth(startDate.getMonth() - 12);

    // alert(formatDate(new Date(startDate)) + " AND " + endDate);

    var symbol = document.getElementById("stockSymbol").value;
    var wsql = "select * from yahoo.finance.historicaldata where symbol = \"" + symbol+ "\" and startDate = \"" + formatDate(new Date(startDate)) + "\" and endDate = \"" + endDate +"\"";
    var stockYQL = "https://query.yahooapis.com/v1/public/yql?q=" + encodeURIComponent(wsql) + "&format=json%20&diagnostics=true%20&env=store://datatables.org/alltableswithkeys%20&callback=";

    $.getJSON(stockYQL, function(data){

        try {
            console.log("historicalData", data);
            var dates = [];
            var close = [];
            $.each(data.query.results, function(key,value) {
                $.each(value, function (index, Obj) {
                    dates.unshift(Obj.Date);
                    close.unshift(parseFloat(Obj.Close).toFixed(2));
                });
            });

             console.log("dates", dates);
             console.log("close", close);

            Chart.defaults.global.legend = {
                enabled: false
            };


            $('#priceChart').remove(); // this is my <canvas> element
            $('#chart_container').append('<canvas id="priceChart"><canvas>');
            var ctx = document.getElementById("priceChart");

            var lineChart = new Chart(ctx, {
                type: 'line',
                data: {
                  labels: dates,
                  datasets: [{
                    label: "Close Price",
                    backgroundColor: "rgba(38, 185, 154, 0.31)",
                    borderColor: "rgba(38, 185, 154, 0.7)",
                    pointBorderColor: "rgba(38, 185, 154, 0.7)",
                    pointBackgroundColor: "rgba(38, 185, 154, 0.7)",
                    pointHoverBackgroundColor: "#fff",
                    pointHoverBorderColor: "rgba(220,220,220,1)",
                    pointBorderWidth: 1,
                    data: close,
                    lineTension: 0
                  }]
                }
            });

        }
        catch(err) {
            console.log(err);
        }
    });
}

function numberWithCommas(x) {
  return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

var getStats = function () {
    var stockYQL = 'https://query1.finance.yahoo.com/v10/finance/quoteSummary/' + document.getElementById("stockSymbol").value + '?formatted=true&crumb=3EkOrBcb9HX&lang=en-US&region=US&modules=defaultKeyStatistics%2CfinancialData%2CcalendarEvents&corsDomain=finance.yahoo.com';
    
    return $.ajax({
        url: stockYQL,
        dataType: 'jsonp'
    });
};

var getNews = function (company) {
    var $nytHeaderElem = $('#nytimes-header');
    var $nytElem = $('#nytimes-articles');
    $nytElem.text("");

    var nytimesUrl = 'http://api.nytimes.com/svc/search/v2/articlesearch.json?q=' + company + '&sort=newest&api-key=c2e884fe2a014ed4a5d4eea086b34180';
    $.getJSON(nytimesUrl, function(data){
        console.log("AJAX return for NY Times News", data)

        $nytHeaderElem.text('New York Times Articles About ' + company);
        articles = data.response.docs;
        for(var i = 0; i < articles.length; i++)
        {
            var article = articles[i];
            $nytElem.append('<li class="article">' + '<a href="' + article.web_url +'">' + article.headline.main + '</a><a>' + ' -- ' + article.pub_date + '</a>' + '<p>' + article.snippet + '</p>' + '</li>');
        };
    }).error(function(e){
        $nytElem.text('New York Times Articles Could Not Be Loaded');
    });
}


function getQuote() {
    getStocks().done(function(data){
        console.log("AJAX for quotes Returned.",data);
        
        var content = data.query.results.quote;
        if (content.Name != null) 
        {
            $('#summary').find('#name').text(content.Name);
            $('#summary').find('#symbol').text(content.Symbol);
            $('#summary').find('#stockExchange').text(content.StockExchange);
            $('#summary').find('#lastTradePriceOnly').text(content.LastTradePriceOnly);
            $('#summary').find('#change').text(content.Change);
            $('#summary').find('#changeInPercent').text("(" + content.ChangeinPercent + ")");
            $('#summary').find('#previousClose').text(content.PreviousClose);
            $('#summary').find('#open').text(content.Open);
            $('#summary').find('#bid').text(content.Bid);
            $('#summary').find('#ask').text(content.Ask);
            $('#summary').find('#daysLow').text(content.DaysLow);
            $('#summary').find('#daysHigh').text(content.DaysHigh);
            $('#summary').find('#yearLow').text(content.YearLow);
            $('#summary').find('#yearHigh').text(content.YearHigh);
            $('#summary').find('#volume').text(content.Volume);
            
            if(content.Change >= 0)
            {
                $('#summary').find('#change').css({"color": "green"});
                $('#summary').find('#changeInPercent').css({"color": "green"});
            }
            else
            {
                $('#summary').find('#change').css({"color": "red"});
                $('#summary').find('#changeInPercent').css({"color": "red"});
            }
            
            var elem = document.getElementById('master_panel');
            elem.style.visibility = 'visible';
            getHistoricalData('month');
            getNews(content.Name);
        }
        else
        {
            alert('Invalid Stock Symbol.');
        }
    });

    /*getStats().done(function(data){
        console.log("AJAX for stats Returned.", data);
        var content = data.quoteSummary.result[0];

        var color;
        if(content.financialData.recommendationKey === "buy")
            color = "green";
        else
            color = "red";

        if (data.quoteSummary.error == null) 
        {
            $('#summary_content').append("<div class=\"row\">"
                            +               "<div class=\"col-md-3 col-xs-12 widget widget_tally_box\">"
                            +                   "<div class=\"x_panel\">"
                            +                       "<div class=\"x_title\">"
                            +                           "<h3 class=\"title-inline\">" + "Key Stats" + "</h3>"            
                            +                       "</div>"
                            +                       "<div>"
                            +                           "<h2 class=\"title-inline\">" + "Recommend: </h2><span class=\"" + color + " rec-inline\">" + content.financialData.recommendationKey + "</span>"
                            +                       "</div>"
                            +                       "<div class=\"x_content\">"
                            +                           "<div>"
                            +                               "<ul class=\"list-inline widget_tally\">"
                            +                                   "<li>"
                            +                                       "<p>"
                            +                                           "<span class=\"stock_attr\">Beta</span>"
                            +                                           "<span class=\"stock_val\">" + content.defaultKeyStatistics.beta.fmt + "</span>"
                            +                                           "<span class=\"stock_attr\">Share Outstanding</span>"
                            +                                           "<span class=\"stock_val\">" + content.defaultKeyStatistics.sharesOutstanding.fmt + "</span>"
                            +                                           "<span class=\"stock_attr\">Book Value</span>"
                            +                                           "<span class=\"stock_val\">$" + content.defaultKeyStatistics.bookValue.fmt + "</span>"
                            +                                           "<span class=\"stock_attr\">Enterprise Value</span>"
                            +                                           "<span class=\"stock_val\">$" + content.defaultKeyStatistics.enterpriseValue.fmt + "</span>"
                            +                                           "<span class=\"stock_attr\">EBITDA</span>"
                            +                                           "<span class=\"stock_val\">$" + content.financialData.ebitda.fmt + "</span>"
                            +                                           "<span class=\"stock_attr\">EV To EBITDA</span>"
                            +                                           "<span class=\"stock_val\">" + content.defaultKeyStatistics.enterpriseToEbitda.fmt + "</span>"
                            +                                           "<span class=\"stock_attr\">Current Ratio</span>"
                            +                                           "<span class=\"stock_val\">" + content.financialData.currentRatio.fmt + "</span>"
                            +                                           "<span class=\"stock_attr\">Quick Ratio</span>"
                            +                                           "<span class=\"stock_val\">" + content.financialData.quickRatio.fmt + "</span>"
                            +                                           "<span class=\"stock_attr\">Debt To Equity</span>"
                            +                                           "<span class=\"stock_val\">" + content.financialData.debtToEquity.fmt + "</span>"
                            +                                           "<span class=\"stock_attr\">EBITDA</span>"
                            +                                           "<span class=\"stock_val\">$" + content.financialData.ebitda.fmt + "</span>"
                            +                                           "<span class=\"stock_attr\">Free Cashflow</span>"
                            +                                           "<span class=\"stock_val\">$" + content.financialData.freeCashflow.fmt + "</span>"
                            +                                           "<span class=\"stock_attr\">Gross Profits</span>"
                            +                                           "<span class=\"stock_val\">$" + content.financialData.grossProfits.fmt + "</span>"
                            +                                           "<span class=\"stock_attr\">Total Cash</span>"
                            +                                           "<span class=\"stock_val\">$" + content.financialData.totalCash.fmt + "</span>"
                            +                                           "<span class=\"stock_attr\">Total Debt</span>"
                            +                                           "<span class=\"stock_val\">$" + content.financialData.totalDebt.fmt + "</span>"
                            +                                           "<span class=\"stock_attr\">Total Revenue</span>"
                            +                                           "<span class=\"stock_val\">$" + content.financialData.totalRevenue.fmt + "</span>"
                            +                                       "</p>"
                            +                                   "</li>"
                            +                               "</ul>"
                            +                           "</div>"
                            +                       "</div>"
                            +                   "</div>"
                            +               "</div>"
                            +           "</div>"
                );
        }
        else
        {
            alert('Fail to get stats.');
        }
    });
    */
}

window.onload = function() {
    var symbolArr = ['^GSPC', '^RUT', '^IXIC', 'CLQ16.NYM', 'GCQ16.CMX', '^TNX'];

    getStocksbySymbol(symbolArr.join()).done(function(data){
        console.log("AJAX for quotes Returned.",data);
        var content = data.query.results.quote;

        $('.tile_stats_count').find('.count_top').each(function(data){

            var arrow;
            if(content[data].Change >= 0)
            {
                $(this).parent().find('.count_bottom').css({"color": "green"});
                arrow = "<i class=\"fa fa-sort-asc\"></i>";
            }
            else
            {
                $(this).parent().find('.count_bottom').css({"color": "red"});
                arrow = "<i class=\"fa fa-sort-desc\"></i>";
            }
            var price = parseFloat(content[data].LastTradePriceOnly).toFixed(2);
            var change = parseFloat(content[data].Change).toFixed(2);
            var change_percent = parseFloat(content[data].ChangeinPercent).toFixed(2);

            $(this).parent().find('.count').text(price);
            $(this).parent().find('.count_bottom').text(change + " (" + change_percent + ")  ");
            $(this).parent().find('.count_bottom').append(arrow);
        });
    });   
};


