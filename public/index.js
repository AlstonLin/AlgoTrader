 $( document ).ready(function() {

  var portfolioHistory = {
    labels: [],
    data: []
  }

  var selectedCompanies = []
  var selectedTicket = ""
  var companies = []
  $('.ui.dropdown').dropdown();
  $('#companies').dropdown({
    onChange: function(text, value, $selectedItem) {
      selectedCompanies.push($selectedItem)
      selectedTicket = text
      console.log(selectedCompanies, selectedTicket)
      //NOTE: Will break if user deleted a selection
    },
  }); 

  $.ajax({
    url: "/api/stocks",
  }).done(function(data) {
    companies = data
    companies.forEach(function(stock) {
      $('#append_here').append("<div class='item' data-value='"  + stock.Symbol + "'>" + stock.Name + "</div>")
    })
  });

  CodeMirror.commands.autocomplete = function(cm) {
    CodeMirror.showHint(cm, CodeMirror.hint.html);
  }

  var editor = CodeMirror(document.getElementById("code"), {
    mode: "javascript",
    lineWrapping: true,
    lineNumbers: true,
    styleActiveLine: true,
    matchBrackets: true,
    extraKeys: {
      "Ctrl-Space": "autocomplete"
    }
  });
  $('.datetimepicker').datetimepicker({
    format: 'MM/dd/yyyy',
    language: 'en-US'
  });
  
  $("#go_button").click(function(e) {
    var ticketSelection = selectedTicket.split(",")
    var stocks = []
    for (var i = 0; i<ticketSelection.length; i++) {
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
      console.log(JSON.stringify(simulation_data))
      $.ajax({
        type: "POST",
        url: "/api/algorithmSimulation",
        dataType: 'json',
        contentType: "application/json; charset=utf-8",
        success: function(data){
          //sessionStorage.setItem('algoTrainerResults', JSON.stringify(data))
          console.log(data)

          data.portfolioHistory.forEach(function (item) {
              portfolioHistory.labels.push(item.time)
              portfolioHistory.data.push(item.value)
          })
          prepareGraph()
          //window.location.href = "/results.html"
        },
        data: JSON.stringify(simulation_data)
      });
      console.log(JSON.stringify(simulation_data))
  })

  function prepareGraph(){
    $("#results").append("<div class='container'><h3>Results</h3><div class='row'><div class='col-xs-6'><canvas id='chart1' width='100' height='100'></canvas></div><canvas id='chart2' width='100' height='100'></canvas></div></div>")

    var ctx = document.getElementById("chart1").getContext("2d");
    ctx.canvas.width = 200;
    ctx.canvas.height = 200;
    var myChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: portfolioHistory.labels,
            datasets: [{
                label: 'Time',
                data: portfolioHistory.data,
                borderColor: [
                    'rgb(39, 169, 198)',
                ],
                fill: false
            }]
        },
    });
    var target = $("#chart1")
    $('html,body').animate({
          scrollTop: target.offset().top
        }, 1000);
  }
});
