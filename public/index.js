 $( document ).ready(function() {

  var portfolioHistory = {
    labels: [],
    data: [],
    accountReturn: [],
    indexReturn: []
  }

  var stockPrices = []
  var selectedCompanies = []
  var ticketSelection = []
  var companies = []
  $('#languages').dropdown();
  $('#companies').dropdown({
    onAdd(text, value, $selectedItem) {
      selectedCompanies.push(value)
      ticketSelection.push(text);
      console.log(text, value)
      //NOTE: Will break if user deleted a selection
    },
    onRemove(text, value, $selectedItem) {
      selectedCompanies.splice($.inArray(value, selectedCompanies), 1);
      ticketSelection.splice($.inArray(text, selectedCompanies), 1);
      console.log(text, value, $selectedItem)
    }
  }); 

  $.ajax({
    url: "/api/stocks",
  }).done(function(data) {
    companies = data
    companies.forEach(function(stock) {
      $('#append_here').append('<div class="item" data-value="'  + stock.Symbol + '">' + stock.Name + "</div>")
    })
  });

  CodeMirror.commands.autocomplete = function(cm) {
    CodeMirror.showHint(cm, CodeMirror.hint.html);
  }

  $("#myTab li:eq(1) a").tab('show');

  var editor = CodeMirror(document.getElementById("code"), {
    mode: "javascript",
    lineWrapping: true,
    lineNumbers: true,
    value: "AlgoTrader.stockUpdate = function(stock){\n  stock.sell(1);\n  stock.buy(1);\n };",
    styleActiveLine: true,
    matchBrackets: true,
    extraKeys: {
      "Ctrl-Space": "autocomplete"
    }
  });
  $today= new Date();
  $yesterday= new Date($today);
  $yesterday.setDate($today.getDate()-1);
  var $dd=$yesterday.getDate();
  var $MM=$yesterday.getMonth()+1;
  var $yyyy=$yesterday.getFullYear();
  if($dd<10){$dd='0'+dd} if($MM<10){$mm='0'+$mm} $yesterday = $MM+'/'+$dd+'/'+$yyyy;
  $('.datetimepicker').datetimepicker({
    locale:{
      format: 'MM/dd/yyyy',
      language: 'en-US'
    },
   startDate: '01/01/2008',
   endDate: $yesterday
  });
  
  $("#go_button").click(function(e) {
    $("#go_button").replaceWith('<button class="ui primary loading button" id="load_button">Loading</button>');

    var stocks = []
    for (var i = 0; i < ticketSelection.length; i++) {
      stocks.push({
        company: selectedCompanies[i],
        ticket: ticketSelection[i]
      })
    }

    var simulation_data = {
      stocks: stocks,
      startingCash: $("#cash").val(),
      startTime: $('#_start').val(),
      endTime: $('#_end').val(),
      code: editor.getValue(" ")
    }
    console.log(JSON.stringify(simulation_data));
    $.ajax({
      type: "POST",
      url: "/api/algorithmSimulation",
      dataType: 'json',
      contentType: "application/json; charset=utf-8",
      success: function(data, text, xhr){
        if (xhr.status == 500){
          console.log("ERROR: " + JSON.stringify(data));
        } else {
          data.portfolioHistory.forEach(function(item) {
            portfolioHistory.labels.push(item.time)
            portfolioHistory.data.push(item.value)
            portfolioHistory.indexReturn.push(item.indexReturn)
            portfolioHistory.accountReturn.push(item.accountReturn)
          });

          var stockLabels = [];
          var stockData = []
          data.tradingData.forEach(function(item){
            stockLabels = []
            stockData = []
            item.trades.forEach(function(trade) {
              stockLabels.push(trade["Time"][0])
              stockData.push(trade["TWAP"][0])
            })
            stockPrices.push({
              ticker: item.ticker[0],
              labels: stockLabels,
              data: stockData
            })
          })
          console.log(data)
          prepareGraph();
        }
         $("#load_button").replaceWith('<button class="ui primary button" id="go_button">Go</button>');
      },
      data: JSON.stringify(simulation_data)
    });
   
  })

  function prepareGraph(){
    $("#results").css("visibility", "visible");
    // Portfilio Performance
    var portfolioValCtx = document.getElementById("portfolioValueCanvas").getContext("2d");
    var portfolioValChart = new Chart(portfolioValCtx, {
      type: 'line',
      data: {
        labels: portfolioHistory.labels,
        datasets: [{
          label: 'Time',
          data: portfolioHistory.data,
          borderColor: [
              'rgb(39, 169, 198)',
          ],
          fill: true
        }]
      },
    });
    var portfolioReturnsCtx = document.getElementById("portfolioReturnsCanvas").getContext("2d");
    var portfolioValChart = new Chart(portfolioReturnsCtx, {
      type: 'line',
      data: {
        labels: portfolioHistory.labels,
        datasets: [
          {
            label: 'Portfolio Return',
            data: portfolioHistory.accountReturn,
            borderColor:'rgb(39, 169, 198)',
            backgroundColor:'rgb(39, 169, 198, 0.1)',
            fill: true
          },
          {
            label: 'S&P500 ETF Return',
            data: portfolioHistory.indexReturn,
            borderColor: 'rgb(43, 188, 145)',
            backgroundColor: 'rgb(43, 188, 145, 0.1)',
            fill: true
          }
        ]
      },
    });
    // Stock performance
    $('#stockTabs').html("");
    $("#stockTabContent").html("");
    stockPrices.forEach(function(item, idx) {
      let contentClass = idx == 0 ? 'tab-pane fade in active' : 'tab-pane fade';
      $('#stockTabs').append("<li><a data-toggle='tab' href='#" + item.ticker + "'>" + item.ticker + "</a></li>");
      $('#stockTabContent').append("<div id='" + item.ticker + "' class='" + contentClass + "'><canvas id='" + item.ticker + "ID'></canvas></div>")
      let chart = new Chart(document.getElementById(item.ticker + "ID").getContext("2d"), {
        type: 'line',
        data: {
          labels: item.labels,
          datasets: [
            {
              label: 'TWAP',
              data: item.data,
              borderColor:'rgb(39, 169, 198)',
              fill: false
            },
          ]
        },
      })
    });
    // Scroll to the results
    var target = $("#results")
    $('html,body').animate({
      scrollTop: target.offset().top
    }, 1000);
  }
});
