 $( document ).ready(function() {
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
  })
});
