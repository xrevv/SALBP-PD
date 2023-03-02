const menuSize = 300;

var data = [];
var nodes = [];
var press = false;

let index = 1;
let output = [];

let buttonReload;
let buttonValidate;
let buttonExport;
let buttonOrganise;
let buttonPop;
let buttonSimulate;

let buttonLoad;
let buttonRefresh;

let inpData;

function setup() {

    frameRate(1000);

    canvas = createCanvas(windowWidth, windowHeight);
    canvas.drop(HandleData);

    textFont('Open Sans');
    textSize(window.innerWidth / 50);
    textAlign(CENTER, CENTER);
    textStyle(BOLD);
    colorMode(HSB, 100);
    background(0, 0, 50);

    rectMode(CORNER);

    input = createFileInput(HandleData);
    input.position(10, 10);

    buttonReload = createButton('Wczytaj ponownie');
    buttonReload.position(10, 40);
    buttonReload.mousePressed(BttnReload);

    buttonValidate = createButton('Sprawdź');
    buttonValidate.position(10, 70);
    buttonValidate.mousePressed(BttnValidate);

    buttonExport = createButton('Eksportuj');
    buttonExport.position(10, 100);
    buttonExport.mousePressed(BttnExport);

    buttonOrganise = createButton('Organizuj');
    buttonOrganise.position(10, 130);
    buttonOrganise.mousePressed(BttnOrganise);

    buttonPop = createButton('Usuń ostatni element');
    buttonPop.position(10, 160);
    buttonPop.mousePressed(BttnPop);

    buttonSimulate = createButton('AutoPlace (EXPERIMENTAL)');
    buttonSimulate.position(10, 190);
    buttonSimulate.mousePressed(BttnSimulation);


    buttonLoad = createButton('Wczytaj');
    buttonLoad.position(width - menuSize + 10, 10);
    buttonLoad.mousePressed(BttnLoad);

    buttonRefresh = createButton('Odśwież');
    buttonRefresh.position(width - menuSize + 10, 40);
    buttonRefresh.mousePressed(BttnRefresh);

    inpData = select('#textfield')
    inpData.position(width - menuSize + 10, 70);
    inpData.size(menuSize - 25);

}

function draw() {
    clear();

    fill(25);
    noStroke();
    rect(0, 0, menuSize, height)
    rect(width - menuSize, 0, menuSize, height)

    fill(100);
    stroke(0, 0, 86)
    strokeWeight(2);
    rect(10, 11, menuSize - 20, 24, 6);

    nodes.forEach(node => {
        fill(100);
        stroke(0, 0, 0);
        strokeWeight(2);
        textSize(14)
        textAlign(LEFT, CENTER);
        textStyle(BOLD);

        text('Index     Time      Preds      Connections', 20, 250);

        text(node.num, 30, 250 + node.num * 25 + 10);

        node.inpTime.position(75, 250 + node.num * 25);
        node.inpTime.size(30);
        node.inpTime.input(ChangeTime);

        node.checkboxSP.changed(ChangeSP);
        node.checkboxSP.position(135, 250 + node.num * 25);

        node.inpConnections.position(185, 250 + node.num * 25);
        node.inpConnections.size(80);
        node.inpConnections.input(ChangeConnections);

        if (node.drag) {
            node.move(mouseX, mouseY);
        }
    });
    display();
}

function display() {
    nodes.forEach(node => {
        node.update();
        node.connect();
    });
    nodes.forEach(node => {
        node.body();
    });
}

// Mouse

function mousePressed() {
    nodes.forEach(node => {
        if (node.pressed(mouseX, mouseY))
            press = true;
    });
    if (!press && mouseX > menuSize && mouseX < width - menuSize) {
        console.log('New node ' + index)
        nodes.push(new node(index++, 0, false, false));
    }
}

function mouseReleased() {
    nodes.forEach(node => {
        if (node.released())
            press = false;
    });
}

function windowResized() {
    resizeCanvas(windowWidth, windowHeight);

    buttonLoad.position(width - menuSize + 10, 10);
    buttonRefresh.position(width - menuSize + 10, 40);
    inpData.position(width - menuSize + 10, 70);
}

// Changers

function ChangeTime() {
    nodes.forEach(node => {
        node.time = node.inpTime.value();
    });
}

function ChangeSP() {
    nodes.forEach(node => {
        node.sp = node.checkboxSP.checked();
    });
}

function ChangeConnections() {
    nodes.forEach(node => {
        node.connections = node.inpConnections.value().split(',');
    });
}

// Make from file

function maker() {
    let size = data[data.length - 1] == '' ? data.length - 1 : data.length;
    for (let i = 0; i < size; i++) {

        let splitString = split(data[i], " ");
        index = splitString[1];
        let dur = splitString[2];

        let sp = data[i].split('"')[1] == "preds" ? true : false;

        let connections = data[i].split(" [").pop().split("]")[0].split(", ");

        console.log(index, dur, sp, connections);

        nodes.push(new node(index, dur, sp, true, connections));
    }
    index++;
}

function HandleData(input) {
    nodes.forEach(node => {
        node.inpTime.hide();
        node.checkboxSP.hide();
        node.inpConnections.hide();
    });

    nodes = [];

    index = -1;

    if (input.data)
        data = input.data.split('\n');
    else
        data = input.split('\n');

    console.log(data);

    clear();
    maker();
    display();
}

function updateOutput() {
    if (!nodes.length) return;

    output = [];
    nodes.forEach(node => {
        let con = '';
        if (node.connections.length > 1)
            for (let index = 0; index < node.connections.length; index++) {
                if (index == node.connections.length - 1)
                    con += node.connections[index];
                else
                    con += (node.connections[index] + ', ');
            }
        else
            con += node.connections[0];
        output.push('Op ' + node.num + ' ' + node.time + ' ' + (node.sp == true ? '"preds"' : '"succs"') + ' [' + con + '],');
    });
    output[output.length - 1] = output[output.length - 1].slice(0, -1).trim();
}

// Buttons

function BttnReload() {
    nodes.forEach(node => {
        node.inpTime.hide();
        node.checkboxSP.hide();
        node.inpConnections.hide();
    });
    nodes.splice(0, nodes.length);
    index = 0;

    clear();
    maker();
    display();
}

function BttnValidate() {

    if (nodes.length == 0) { alert('Brak elementów'); throw "exit"; }

    let predsCheck = false;
    let predsCheck2 = 0;
    let cycleCheck = false;

    nodes.forEach(node => {
        if (node.time <= 0) { alert('Zły czas w ' + node.num); throw "exit"; }
        if (node.connections <= 0) { alert('Brak połączenia w ' + node.num); throw "exit"; }

        if (node.sp) {
            predsCheck = true;

            node.connections.forEach(element => {
                nodes[element - 1].connections.forEach(element2 => {
                    if (node.num == element2) predsCheck2++;
                });
            });
            if (predsCheck2 != node.connections.length) { alert('Brak połączeń preds w ' + node.num); throw "exit"; }
            predsCheck2 = 0;
        }

        try {
            nodes.forEach(node => {
                if (cycleChecker(node.num - 1, node.num - 1)) cycleCheck = true;
            });
        } catch (error) {
            if (error instanceof RangeError) cycleCheck = true;
            else cycleCheck = false;
        }
    });
    if (cycleCheck) { alert('Graf jest cykliczny'); throw "exit"; }
    if (!predsCheck) { alert('Brak ostatniego zadania'); throw "exit"; }

    alert('Wszystko OK');
}

function cycleChecker(pos, pos2) {
    if (!nodes[pos2].sp)
        nodes[pos].connections.forEach(element => {
            if (nodes[pos].num == element.num) return true;
            else cycleChecker(pos2, element - 1);
        });
}

function BttnExport() {
    updateOutput();
    saveStrings(output, 'output.txt');
}

function BttnOrganise() {
    nodes.forEach(node => {
        node.organise();
    });
}

function BttnPop() {
    if (!nodes.length) return;

    nodes[nodes.length - 1].inpTime.hide();
    nodes[nodes.length - 1].checkboxSP.hide();
    nodes[nodes.length - 1].inpConnections.hide();
    index--;
    console.log('Delete node ' + index)
    nodes.pop();
}

function BttnSimulation() {
    // for (let index = 0; index < 10; index++) {
    //     nodes.forEach(node => {
    //         node.sim();
    //     });
    // }
    // for (let index = 0; index < 10; index++) {
    //     nodes.forEach(node => {
    //         node.sim2();
    //     });
    // }
    // for (let index = 0; index < 10; index++) {
    //     nodes.forEach(node => {
    //         node.sim3();
    //     });
    // }
    // for (let index = 0; index < 5; index++) {
    nodes.forEach(node => {
        node.sim4();
    });
    // }
}

function BttnLoad() {
    console.log(inpData.value().split('\n'));
    HandleData(inpData.value());
}

function BttnRefresh() {
    updateOutput();
    inpData.value('');
    inpData.value(output.join('\n'));
}