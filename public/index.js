 $( document ).ready(function() {
  var selectedCompanies = []
  var ticketSelection = []
  var companies = []
  $('.ui.dropdown').dropdown();
  $('#companies').dropdown({
    /*
    onChange(text, value, $selectedItem)
    {
      selectedCompanies.push($selectedItem)
      selectedTicket =text
      console.log(text, value, $selectedItem)
    }*/
    
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
          console.log(data)
        }
         $("#load_button").replaceWith('<button class="ui primary button" id="go_button">Go</button>');
      },
      data: JSON.stringify(simulation_data)
    });
   
  })
});
