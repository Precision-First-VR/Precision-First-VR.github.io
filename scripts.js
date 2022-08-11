const PROTOCOL = "HTTPS";
const HOST = "ismar5988.anonymitysubmission.com";
const AUTH_STR = "Basic Z3Vlc3Q6NTk4OA==";

var currentCMIN = 0;
var currentCMAX = 0.2;

const transpose = m => m[0].map((x,i) => m.map(x => x[i]))
const cap = string => string.charAt(0).toUpperCase() + string.slice(1);

const handleScaleUpdate = (event) => {
    let formData = new FormData(document.forms.scaleForm);
    let lowerBound = formData.get('lower-bound');
    let upperBound = formData.get('upper-bound');

    currentCMIN = lowerBound;
    currentCMAX = upperBound;
    const allGraphs = document.getElementById('allGraphs');
    for (let i = 0; i < allGraphs.children.length; i++) {
        if (allGraphs.children[i].id == "instruction-header" || allGraphs.children[i].id == "instructions"){
            continue;
        }
        let update = {
            'line.cmin': lowerBound,
            'line.cmax': upperBound
        };
        Plotly.restyle(allGraphs.children[i], update, 0);
    }
}

const handleSubmit = (event) => {
    
    let formData = new FormData(document.forms.selection);

    let baseUrl = PROTOCOL + "://" + HOST + "/dataset/";
    let participant = formData.get('participant-id');
    let inputMethod = formData.get('input-method');
    let curvature = formData.get('curvature');
    let slope = formData.get('slope-choice');
    let orientation = formData.get('orientation');
    let taskUrl = baseUrl + participant + '/' + 'task_' + inputMethod + '_' + curvature + '_' + slope + '_' + orientation + '.csv';
    let sketchUrl = baseUrl + participant + '/' + 'sketch_' + inputMethod + '_' + curvature + '_' + slope + '_' + orientation + '.csv';

    var myHeaders = new Headers();
    myHeaders.append("Authorization", AUTH_STR);
    
    var requestOptions = {
      method: 'GET',
      headers: myHeaders,
      redirect: 'follow'
    };
    
    Promise.all([
        fetch(sketchUrl, requestOptions).then(response => response.text())
        .then(result => {
            let obj = Papa.parse(result)['data'];
            for (var i = 0; i < obj.length; ++i) {
                for (var j = 0; j < 5; ++ j) {
                    obj[i][j] = parseFloat(obj[i][j])
                }
            }

            // obj is the N * 3 array which you would be using for data visualization.
            // for task data: it should be x, y, z;
            // for sketch data: it should be x, y, z, instantaneous_error, raw_speed_in_m_per_second;

            let obj_t = transpose(obj);
            return obj_t;
        }),
        fetch(taskUrl, requestOptions).then(response => response.text())
        .then(result => {
            let obj = Papa.parse(result)['data'];
            for (var i = 0; i < obj.length; ++i) {
                for (var j = 0; j < 3; ++ j) {
                    obj[i][j] = parseFloat(obj[i][j])
                }
            }

            // obj is the N * 3 array which you would be using for data visualization.
            // for task data: it should be x, y, z;
            // for sketch data: it should be x, y, z, instantaneous_error, raw_speed_in_m_per_second;

            let obj_t = transpose(obj);
            return obj_t;
        })
    ]).then(allResults => {
        // if (firstAdd){
        //     clearAllGraphs();
        //     firstAdd = false;
        // }
        let formData = new FormData(document.forms.selection);
        let participant = formData.get('participant-id');
        let inputMethod = formData.get('input-method');
        let curvature = formData.get('curvature');
        let slope = formData.get('slope-choice');
        let orientation = formData.get('orientation');
        let sketch_graph = {
            type: 'scatter3d',
            mode: 'lines',
            name: 'Sketch',
            x: allResults[0][0],
            y: allResults[0][1],
            z: allResults[0][2],
            opacity: 1,
            line: {
              width: 6,
              color: allResults[0][4],
              reversescale: false,
              showscale: true,
              colorscale: 'Portland',
              cmin: currentCMIN,
              cmax: currentCMAX,
            }
          };
        let task_graph = {
            type: 'scatter3d',
            mode: 'lines',
            name: 'Task',
            x: allResults[1][0],
            y: allResults[1][1],
            z: allResults[1][2],
            opacity: 1,
            line: {
                width: 6,
                color: '#000000',
                reversescale: false,
                showscale: false
            }
        };

        let newGID = Date.now().toString();
        let newDiv = document.createElement('div');
        newDiv.setAttribute('id', newGID);
        newDiv.setAttribute('class', "col-lg-6 col-md-6 col-sm-12 rounded");
        let allGraphs = document.getElementById('allGraphs');
        allGraphs.appendChild(newDiv);
        let titleText = '<b>Participant ' + participant.substring(1) + '</b><br><b>'
            + cap(inputMethod) + '</b><br><b>' + cap(curvature) + ' Curvature, ' + cap(slope) + ' Slope</b><br><b>' + orientation + ' Orientation</b><br>';
        let g_data = [sketch_graph, task_graph]
        Plotly.newPlot(newGID, g_data, {
                showlegend: false,
                scene: {
                    // aspectmode: 'cube',
                    aspectratio: {
                        x: 1,
                        y: 1,
                        z: 1
                    }
                },
                title: {
                    text: titleText,
                    font: {
                        size: 15
                    }
                },
                xaxis: {
                    title: {
                        text: 'x (m)',
                        font: {
                            size: 15,
                            family: 'Arial, serif',
                            color: 'black'
                        }
                    }
                },
                yaxis: {
                    title: {
                        text: 'y (m)',
                        font: {
                            size: 15,
                            family: 'Arial, serif',
                            color: 'black'
                        }
                    }
                },
                zaxis: {
                    title: {
                        text: 'z (m)',
                        font: {
                            size: 15,
                            family: 'Arial, serif',
                            color: 'black'
                        }
                    }
                }
            }, {
                responsive: true
            });
        })
      .catch(error => console.log('error', error));
}

const clearAllGraphs = () => {
    let allGraphs = document.getElementById('allGraphs');
    allGraphs.innerHTML = '';
}

const initialGraphs = () => {
    var myHeaders = new Headers();
    myHeaders.append("Authorization", AUTH_STR);
    
    var requestOptions = {
      method: 'GET',
      headers: myHeaders,
      redirect: 'follow'
    };
    initialSketchURLS = ['https://ismar5988.anonymitysubmission.com/dataset/p1/sketch_controller_large_large_Left Right.csv', 'https://ismar5988.anonymitysubmission.com/dataset/p1/sketch_handpinch_large_large_Left Right.csv', 'https://ismar5988.anonymitysubmission.com/dataset/p1/sketch_handpoint_large_large_Left Right.csv', 'https://ismar5988.anonymitysubmission.com/dataset/p1/sketch_pen_large_large_Left Right.csv']
    initialTaskURLS = ['https://ismar5988.anonymitysubmission.com/dataset/p1/task_controller_large_large_Left Right.csv', 'https://ismar5988.anonymitysubmission.com/dataset/p1/task_handpinch_large_large_Left Right.csv', 'https://ismar5988.anonymitysubmission.com/dataset/p1/task_handpoint_large_large_Left Right.csv', 'https://ismar5988.anonymitysubmission.com/dataset/p1/task_pen_large_large_Left Right.csv'];
    initialInputs = ['controller', 'handpinch', 'handpoint', 'pen'];
    
    for (let initialGNum = 0; initialGNum < 4; initialGNum++){
        let sketchUrl = initialSketchURLS[initialGNum];
        let taskUrl = initialTaskURLS[initialGNum];
        let inputMethod = initialInputs[initialGNum];
        Promise.all([
            fetch(sketchUrl, requestOptions).then(response => response.text())
            .then(result => {
                let obj = Papa.parse(result)['data'];
                for (var i = 0; i < obj.length; ++i) {
                    for (var j = 0; j < 5; ++ j) {
                        obj[i][j] = parseFloat(obj[i][j])
                    }
                }

                // obj is the N * 3 array which you would be using for data visualization.
                // for task data: it should be x, y, z;
                // for sketch data: it should be x, y, z, instantaneous_error, raw_speed_in_m_per_second;

                let obj_t = transpose(obj);
                return obj_t;
            }),
            fetch(taskUrl, requestOptions).then(response => response.text())
            .then(result => {
                let obj = Papa.parse(result)['data'];
                for (var i = 0; i < obj.length; ++i) {
                    for (var j = 0; j < 3; ++ j) {
                        obj[i][j] = parseFloat(obj[i][j])
                    }
                }

                // obj is the N * 3 array which you would be using for data visualization.
                // for task data: it should be x, y, z;
                // for sketch data: it should be x, y, z, instantaneous_error, raw_speed_in_m_per_second;

                let obj_t = transpose(obj);
                return obj_t;
            })
        ]).then(allResults => {
            // if (firstAdd){
            //     clearAllGraphs();
            //     firstAdd = false;
            // }
            
            let sketch_graph = {
                type: 'scatter3d',
                mode: 'lines',
                name: 'Sketch',
                x: allResults[0][0],
                y: allResults[0][1],
                z: allResults[0][2],
                opacity: 1,
                line: {
                width: 6,
                color: allResults[0][4],
                reversescale: false,
                showscale: true,
                colorscale: 'Portland',
                cmin: currentCMIN,
                cmax: currentCMAX,
                }
            };
            let task_graph = {
                type: 'scatter3d',
                mode: 'lines',
                name: 'Task',
                x: allResults[1][0],
                y: allResults[1][1],
                z: allResults[1][2],
                opacity: 1,
                line: {
                    width: 6,
                    color: '#000000',
                    reversescale: false,
                    showscale: false
                }
            };

            let newGID = Date.now().toString();
            let newDiv = document.createElement('div');
            newDiv.setAttribute('id', newGID);
            newDiv.setAttribute('class', "col-lg-6 col-md-6 col-sm-12 rounded");
            let allGraphs = document.getElementById('allGraphs');
            allGraphs.appendChild(newDiv);
            let titleText = '<b>Participant 1' + '</b><br><b>'
                + cap(inputMethod) + '</b><br><b>' + 'Large Curvature, ' + 'Large Slope</b><br><b>' + 'Left Right Orientation</b><br>';
            let g_data = [sketch_graph, task_graph]
            Plotly.newPlot(newGID, g_data, {
                    showlegend: false,
                    scene: {
                        // aspectmode: 'cube',
                        aspectratio: {
                            x: 1,
                            y: 1,
                            z: 1
                        }
                    },
                    title: {
                        text: titleText,
                        font: {
                            size: 15
                        }
                    },
                    xaxis: {
                        title: {
                            text: 'x (m)',
                            font: {
                                size: 15,
                                family: 'Arial, serif',
                                color: 'black'
                            }
                        }
                    },
                    yaxis: {
                        title: {
                            text: 'y (m)',
                            font: {
                                size: 15,
                                family: 'Arial, serif',
                                color: 'black'
                            }
                        }
                    },
                    zaxis: {
                        title: {
                            text: 'z (m)',
                            font: {
                                size: 15,
                                family: 'Arial, serif',
                                color: 'black'
                            }
                        }
                    }
                }, {
                    responsive: true
                });
            })
        .catch(error => console.log('error', error));
    }
}

window.addEventListener('load', initialGraphs);
