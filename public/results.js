var data = window.algoTrainerResults;

sessionStorage.getItem('algoTrainerResults')


var ctx = document.getElementById("chart1").getContext("2d");
ctx.canvas.width = 200;
ctx.canvas.height = 200;
var myChart = new Chart(ctx, {
    type: 'line',
    data: {
        labels: ["Red", "Blue", "Yellow", "Green", "Purple", "Orange"],
        datasets: [{
            label: '# of Votes',
            data: [12, 19, 3, 5, 2, 3],
            borderColor: [
                'rgb(39, 169, 198)',
            ],
            fill: false
        }]
    },
    options: {
        scales: {
            yAxes: [{
                ticks: {
                    beginAtZero:true
                }
            }]
        }
    }
});