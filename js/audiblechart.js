/**
 * Created by Tom.Ridd on 15/04/2017.
 */
//
// (function() {
var ac;
if('webkitAudioContext' in window) {
    ac = new webkitAudioContext();
} else {
    ac = new AudioContext();
}

var tempo = 360;
var activePoint = 0;
var activeSeries = 0;

const ENTER_KEY = 13;
const UP_KEY = 38;
const DOWN_KEY = 40;
const LEFT_KEY = 37;
const RIGHT_KEY = 39;
const SPACE_KEY = 32;

function playTune(tune) {
    var sequence = new AcMusic.Sequence( ac, tempo );

    for(note in tune) {
        frequency = 300.00 + tune[note];
        sequence.push(new AcMusic.Note(frequency + ' q'))
    }
    sequence.loop = false;
    sequence.smoothing = 0.25;
    sequence.gain.gain.value = 0.1;
    sequence.play();
}

function playNote(note) {
    frequency = 300.00 + note;
    var sequence = new AcMusic.Sequence( ac, tempo );
    sequence.push(new AcMusic.Note(frequency + ' q'));
    sequence.loop = false;
    sequence.gain.gain.value = 0.1;
    sequence.play();
}

function playSeries(chart, series) {
    var msg = new SpeechSynthesisUtterance(
        'Series ... ' +
        chart.series[series].name + ' ... '
    );
    msg.volume = 1;
    msg.onend = function (event) {
        // When message is finished play the sequence
        var sequence = new AcMusic.Sequence( ac, tempo );

        for(point in chart.series[series].points) {
            frequency = 300.00 + chart.series[series].points[point].y;
            sequence.push(new AcMusic.Note(frequency + ' q'))
        }
        sequence.loop = false;
        sequence.smoothing = 0.5;
        sequence.gain.gain.value = 0.1;
        sequence.play();
    };

    window.speechSynthesis.speak(msg);
}

function speakPoint(chart, series, point) {
    var msg = new SpeechSynthesisUtterance(
        chart.series[series].data[point].category + ' ... ' +
        chart.series[series].name + ' ... ' +
        chart.series[series].data[point].y
    );
    msg.volume = 1;
    console.log(voices);
    msg.voice = voices[10];
    window.speechSynthesis.speak(msg);
}

function speakSeries(chart, series) {
    var msg = new SpeechSynthesisUtterance(
        chart.series[series].name
    );
    msg.volume = 1;
    window.speechSynthesis.speak(msg);
}



function checkPoint(chart, series, point) {
    chart.tooltip.refresh(chart.series[series].data[point]);
    playNote(chart.series[series].data[point].y);
}

function drawAudibleTimeseries(data) {
    return Highcharts.chart('container', {
        title: {
            text: data.title
        },
        xAxis: {
            categories: data.categories,
            title: {
                text: data.x_label
            }
        },
        yAxis: {
            title: {
                text: data.y_label
            }
        },
        plotOptions: {
            series: {
                cursor: 'pointer',
                point: {
                    events: {
                        click: function () {
                            activePoint = this.index;
                            activeSeries = this.series.index;

                            playNote(this.y);
                        }
                    }
                }
            }
        },

        series: data.series

    }, function(chart){

        $(document).keydown(function(e){
            switch(e.which) {
                case ENTER_KEY:
                    // ENTER
                    playSeries(chart, activeSeries);
                    break;

                case SPACE_KEY:
                    // SPACE
                    speakPoint(chart, activeSeries, activePoint);
                    break;

                case LEFT_KEY:
                    // LEFT
                    if(activePoint>0)
                        activePoint--;
                    checkPoint(chart, activeSeries, activePoint)
                    break;

                case UP_KEY:
                    // UP
                    activeSeries = activeSeries - 1;
                    if(activeSeries < 0 ) { activeSeries = chart.series.length - 1; }

                    checkPoint(chart, activeSeries, activePoint);
                    break;

                case RIGHT_KEY:
                    // RIGHT
                    if(activePoint+1 < chart.series[activeSeries].data.length)
                        activePoint++;

                    checkPoint(chart, activeSeries, activePoint);
                    break;

                case DOWN_KEY:
                    // DOWN
                    activeSeries = activeSeries + 1;
                    if(activeSeries >= chart.series.length) { activeSeries = 0; }

                    checkPoint(chart, activeSeries, activePoint);
                    break;

            }

        })


    });
}

function drawAudibleBarchart(data) {
    return Highcharts.chart('container', {
        title: {
            text: data.title
        },
        xAxis: {
            categories: data.categories,
            title: {
                text: data.x_label
            }
        },
        yAxis: {
            title: {
                text: data.y_label
            }
        },
        plotOptions: {
            series: {
                cursor: 'pointer',
                point: {
                    events: {
                        click: function () {
                            // activePoint = this.index;
                            // activeSeries = this.series.index;
                            //
                            // playNote(this.y);
                        }
                    }
                }
            }
        },

        series: data.series

    });
}


function setupAudibleBarChart(data, settings) {

    var chart = drawAudibleBarchart(data);
    tempo = settings.tempo;

}


function setupAudibleChart(data, settings) {

    var chart = drawAudibleTimeseries(data);
    tempo = settings.tempo;

    playSeries(chart, 0);
}
