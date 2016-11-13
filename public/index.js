 $( document ).ready(function() {
  var selectedCompanies = []
  var selectedTicket = ""
  var companies = []
  $('.ui.dropdown').dropdown();
  $('#companies').dropdown({
    onAdd(value, text, $selectedItem) {
      selectedCompanies.push($selectedItem)
      selectedTicket = text
      console.log(selectedCompanies, selectedTicket)
      //NOTE: Will break if user deleted a selection
    },
    onRemove(value, text, $selectedItem) {
      selectedCompanies.splice($.inArray(value, selectedCompanies), 1);
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

  var editor = CodeMirror(document.getElementById("code"), {
    mode: "javascript",
    lineWrapping: true,
    lineNumbers: true,
    value: "AlgoTrader.stockUpdate = function(stock){\n  stock.sell(1);\n  stock.buy(1));\n };",
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
    $("#go_button").replaceWith('<button class="ui primary loading button" id="load_button">Loading</button>');
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
    $.ajax({
      type: "POST",
      url: "/api/algorithmSimulation",
      dataType: 'json',
      contentType: "application/json; charset=utf-8",
      success: function(data, text, xhr){
        if (xhr.status == 500){
          console.log("ERROR: " + JSON.stringify(data));
        } else {
          console.log(data)
        }
      },
      data: JSON.stringify(simulation_data)
    });
    $("#load_button").replaceWith('<button class="ui primary button" id="go_button">Go</button>');
  })
});
