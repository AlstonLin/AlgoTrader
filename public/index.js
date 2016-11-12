 $( document ).ready(function() {
  var selectedCompanies = []
  var selectedTicket = ""
  var companies = []
  $('.ui.dropdown').dropdown({
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
    format: 'dd/MM/yyyy',
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
        startingMoney: $("#cash").val(),
        startTime: $('#_start').val(),
        endTime:$('#_end').val(),
        code: editor.getValue(" ")
      }
      console.log(simulation_data)
      $.ajax({
        url:"/api/algorithmSimulation",
        type:"POST",
        data: simulation_data,
        success: function(data){
          console.log(data)
        },
      })
      console.log(simulation_data)
  })

  // {
  //   "stocks": [
  //     {
  //       "company": "Google",
  //       "ticket": "GOOG"
  //     },
  //     {
  //       "company": "Yahoo",
  //       "ticket": "YHOO"
  //     }
  //     ],
  //   "startTime": "09/09/2014",
  //   "endTime": "09/30/2014",
  //   "startingMoney": 500,
  //   "code": "AlgoTrader.stockUpdate = function(stock){return 'ALSTON'};"
  // }  
});