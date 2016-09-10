    function formatDate(date) {
        var d = new Date(date),
            month = '' + (d.getMonth() + 1),
            day = '' + d.getDate(),
            year = d.getFullYear();

        if (month.length < 2) month = '0' + month;
        if (day.length < 2) day = '0' + day;

        return [year, month, day].join('-');
    }

        var getHistoricalData = function (stock){

            // console.log(stockArr);
            var endDate = formatDate(new Date());
            var startDate = new Date(endDate);
            startDate.setDate(startDate.getDate() - 7);
            var chartMinDate = startDate; //first day
            var chartMaxDate = formatDate(new Date()); //last day

            var historicalDataPerStock = [];

            var wsql = "select * from yahoo.finance.historicaldata where symbol = \"" + stock+ "\" and startDate = \"" + formatDate(new Date(startDate)) + "\" and endDate = \"" + endDate +"\"";
            var stockYQL = "https://query.yahooapis.com/v1/public/yql?q=" + encodeURIComponent(wsql) + "&format=json%20&diagnostics=true%20&env=store://datatables.org/alltableswithkeys%20&callback=";
            return $.getJSON(stockYQL);
        };

      $(document).ready(function() {
        
        var plotList = [];
        var endDate = formatDate(new Date());
        var startDate = new Date(endDate);
        startDate.setDate(startDate.getDate() - 7);
        var chartMinDate = startDate; //first day
        var chartMaxDate = formatDate(new Date()); //last day
        var chartColours = ['#96CA59', '#3F97EB', '#72c380', '#6f7a8a', '#f7cb38', '#5a8022', '#2c7282'];
        var tickSize = [1, "day"];
        var tformat = "%d/%m/%y";

        //graph options
        var options = {
          grid: {
            show: true,
            aboveData: true,
            color: "#3f3f3f",
            labelMargin: 10,
            axisMargin: 0,
            borderWidth: 0,
            borderColor: null,
            minBorderMargin: 5,
            clickable: true,
            hoverable: true,
            autoHighlight: true,
            mouseActiveRadius: 100
          },
          series: {
            lines: {
              show: true,
              fill: true,
              lineWidth: 2,
              steps: false
            },
            points: {
              show: true,
              radius: 4.5,
              symbol: "circle",
              lineWidth: 3.0
            }
          },
          legend: {
            position: "ne",
            margin: [0, -25],
            noColumns: 0,
            labelBoxBorderColor: null,
            labelFormatter: function(label, series) {
              // just add some space to labes
              return label + '&nbsp;&nbsp;';
            },
            width: 40,
            height: 1
          },
          colors: chartColours,
          shadowSize: 0,
          tooltip: true, //activate tooltip
          tooltipOpts: {
            content: "%s: %y.0",
            xDateFormat: "%d/%m",
            shifts: {
              x: -30,
              y: -50
            },
            defaultTheme: false
          },
          yaxis: {
            min: 0
          },
          xaxis: {
            mode: "time",
            minTickSize: tickSize,
            timeformat: tformat,
            min: chartMinDate,
            max: chartMaxDate
          }
        };


        $.each(['YHOO'], function(index, val) {
          getHistoricalData(val).done(function(data) {
            try {
              console.log("historicalData", data);

              var datePrice = [];
              $.each(data.query.results, function(key,value) {
                  $.each(value, function (index, Obj) {
                      datePrice.unshift([Obj.Date, parseFloat(Obj.Close).toFixed(2)]);
                      // console.log('historicalDataPerStock: ' + historicalDataPerStock);
                  });

                  plotList.push({
                    label: val,
                    data: datePrice,
                    lines: {
                      fillColor: "rgba(150, 202, 89, 0.12)"
                    },
                    points: {
                      fillColor: "#fff"
                    }
                  });
              });

              var plot = $.plot($("#placeholder33x"), 
                [
                  {
                    label: val,
                    data: [
                        [0, 5], [1, 10], [2, 15], [3, 20]
                    ],
                    lines: {
                      fillColor: "rgba(150, 202, 89, 0.12)"
                    },
                    points: {
                      fillColor: "#000"
                    }
                  }
                ], 
                options);

            }
            catch(err) {
                console.log(err);
            }
          });
        });