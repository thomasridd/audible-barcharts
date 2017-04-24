/**
 * Created by Tom.Ridd on 15/04/2017.
 */
//
// (function() {
var ac;
var vco;

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

function playNoteForTime(note, time) {
    var time_max = 1;

    vco = ac.createOscillator();
    vco.type = "sine";
    vco.frequency.value = 300.0 + 50.0 * note;

    var vca = ac.createGain();
    vca.gain.value = 0;

    vco.connect(vca);
    vca.connect(ac.destination);
    vca.gain.setTargetAtTime(1, ac.currentTime, 0.015);
    vca.gain.setTargetAtTime(0, ac.currentTime + time * time_max, 0.015);

    vco.start(ac.currentTime);
    vco.stop(ac.currentTime + time * time_max + 0.1);
}

function playNoteForTimeAtVolume(note, time, volume) {
    var time_max = 1;

    vco = ac.createOscillator();
    vco.type = "sine";
    vco.frequency.value = 300.0 + 50.0 * note;

    var vca = ac.createGain();
    vca.gain.value = 0;

    vco.connect(vca);
    vca.connect(ac.destination);
    vca.gain.setTargetAtTime(volume, ac.currentTime, 0.015);
    vca.gain.setTargetAtTime(0, ac.currentTime + time * time_max, 0.015);

    vco.start(ac.currentTime);
    vco.stop(ac.currentTime + time * time_max + 0.1);
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
    speak(chart.series[series].name);
}

function speak(message){
    var msg = new SpeechSynthesisUtterance(
        message
    );
    msg.volume = 1;
    window.speechSynthesis.speak(msg);
}


function checkPoint(chart, series, point) {
    chart.tooltip.refresh(chart.series[series].data[point]);
    playNote(chart.series[series].data[point].y);
}

function checkBar(chart, series, point) {
    chart.tooltip.refresh(chart.series[series].data[point]);
    min = chart.yAxis[0].min
    max = chart.yAxis[0].max

    console.log(chart);
    value = (chart.series[series].data[point].y - min) / (max-min);
    playNoteForTimeAtVolume(1, value, 1)
}

function speakValue(chart, series, point) {
    value = chart.series[series].data[point].y;
    speak(value);
}
function speakPointLabel(chart, series, point) {
    speak(chart.series[series].data[point].category);
}
function speakSeriesLabel(chart, series, point){
    speak(chart.series[series].name);
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
        chart: {
            type:'bar'
        },
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
                events: {
                    click: function (e) {
                        point = e.point;
                        min = this.chart.yAxis[0].min;
                        max = this.chart.yAxis[0].max;
                        value = (point.y - min) / (max-min);

                        activePoint = point.index;
                        activeSeries = point.series.index;

                        playNoteForTimeAtVolume(1, value, 1);
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
                    break;

                case SPACE_KEY:
                    // SPACE
                    speakValue(chart, activeSeries, activePoint);
                    break;

                case LEFT_KEY:
                    // LEFT
                    speakPointLabel(chart, activeSeries, activePoint);
                    break;

                case UP_KEY:
                    // UP
                    if(activeSeries === 0 && activePoint === 0)
                        break;

                    activeSeries = activeSeries - 1;
                    if(activeSeries < 0 ) {
                        activeSeries = chart.series.length - 1;
                        activePoint = activePoint - 1;
                    }

                    checkBar(chart, activeSeries, activePoint);
                    break;

                case RIGHT_KEY:
                    // RIGHT
                    speakSeriesLabel(chart, activeSeries, activePoint);
                    break;

                case DOWN_KEY:
                    // DOWN
                    if((activePoint === (chart.series[0].length - 1)) && (activeSeries === (chart.series.length - 1))) {
                        break;
                    }

                    activeSeries = activeSeries + 1;
                    if(activeSeries >= chart.series.length) {
                        activeSeries = 0;
                        activePoint = activePoint + 1;
                    }

                    checkBar(chart, activeSeries, activePoint);
                    break;

            }

        })


    });
}

function drawAudibleStackedBarchart(data) {
    return Highcharts.chart('container', {
        chart: {
            type:'bar'
        },
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
            bar: {
                stacking: 'normal'
            },
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

    playDescription(chart);
}

function setupAudibleStackedBarChart(data, settings) {

    var chart = drawAudibleStackedBarchart(data);
    tempo = settings.tempo;

}

function setupAudibleChart(data, settings) {

    var chart = drawAudibleTimeseries(data);
    tempo = settings.tempo;

    playDescription(chart);
}

function playDescription(chart) {

    var title = chart.title.textStr;
    var xaxis = chart.xAxis[0].axisTitle.textStr;
    var yaxis = chart.yAxis[0].axisTitle.textStr;

    var start = chart.xAxis[0].categories[0];

    var str = 'You are in a bar graph. Title: ' + title + ', x-axis: ' + xaxis + '; y-axis: ' + yaxis + '.\n';
    str = str + 'Bars go horizontally.\n';
    str = str + 'Starting at ' + start + '.\n';
    str = str + 'Press up and down to switch between bars. \n';
    str = str + 'Press left to speak categories.\n';
    str = str + 'Press right to speak series.\n';
    str = str + 'Press space to speak data value.\n';

    var msg = new SpeechSynthesisUtterance(str);
    msg.volume = 1;
    window.speechSynthesis.speak(msg);
}