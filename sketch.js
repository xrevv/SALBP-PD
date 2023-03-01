const menuSize = 300;

var data = [];
var nodes = [];
var press = false;
let index = 1;

let buttonReload;
let buttonReset;
let buttonValidate;
let buttonExport;
let buttonSimulate;
let buttonOrganise;
let buttonPop;

function setup() {

    frameRate(1000);

    canvas = createCanvas(windowWidth, windowHeight);
    canvas.drop(HandleFile);

    textSize(window.innerWidth / 50);
    textAlign(CENTER, CENTER);
    textStyle(BOLD);
    colorMode(HSB, 100);
    background(0, 0, 50);

    rectMode(CORNER);

    input = createFileInput(HandleFile);
    input.position(10, 10);

    buttonReload = createButton('Reload');
    buttonReload.position(220, 10);
    buttonReload.mousePressed(BttnReload);

    buttonReset = createButton('Reset');
    buttonReset.position(10, 40);
    buttonReset.mousePressed(BttnReset);

    buttonValidate = createButton('Validate');
    buttonValidate.position(75, 40);
    buttonValidate.mousePressed(BttnValidate);

    buttonExport = createButton('Export');
    buttonExport.position(145, 40);
    buttonExport.mousePressed(BttnExport);

    buttonOrganise = createButton('Organise');
    buttonOrganise.position(210, 40);
    buttonOrganise.mousePressed(BttnOrganise);

    buttonSimulate = createButton('AutoPlace (EXPERIMENTAL)');
    buttonSimulate.position(10, 70);
    buttonSimulate.mousePressed(BttnSimulation);

    buttonPop = createButton('Pop');
    buttonPop.position(240, 70);
    buttonPop.mousePressed(BttnPop);
}

function draw() {
    clear();

    fill(50);
    rect(0, 0, menuSize, height)

    nodes.forEach(node => {
        fill(0);
        stroke(0, 0, 100);
        strokeWeight(2);
        textSize(14)
        textAlign(LEFT, CENTER);
        textStyle(BOLD);

        text('Index     Time     Preds     Connections', 10, 110);

        text(node.num, 20, 100 + node.num * 25 + 10);

        node.inpTime.position(65, 100 + node.num * 25);
        node.inpTime.size(30);
        node.inpTime.input(ChangeTime);

        node.checkboxSP.changed(ChangeSP);
        node.checkboxSP.position(125, 100 + node.num * 25);

        node.inpConnections.position(175, 100 + node.num * 25);
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
    if (!press && mouseX > menuSize) {
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

function HandleFile(file) {
    nodes.forEach(node => {
        node.inpTime.hide();
        node.checkboxSP.hide();
        node.inpConnections.hide();
    });

    nodes.splice(0, nodes.length);
    data = file.data.split('\n');
    console.log(data);
    clear();
    maker();
    display();
}

// Buttons

function BttnReload() {
    nodes.forEach(node => {
        node.inpTime.hide();
        node.checkboxSP.hide();
        node.inpConnections.hide();
    });
    nodes.splice(0, nodes.length);

    clear();
    maker();
    display();
}

function BttnReset() {
    location.reload();
}

function BttnValidate() {

    if (nodes.length == 0) { alert('Brak elementów'); return; }

    let predsCheck = false;
    let cycleCheck = false;

    nodes.forEach(node => {
        if (node.time <= 0) { alert('Zły czas w ' + node.num); return; }
        if (node.connections <= 0) { alert('Brak połączenia w ' + node.num); return; }

        try {
            nodes.forEach(node => {
                if (cycleChecker(node.num - 1, node.num - 1)) cycleCheck = true;
            });
        } catch (error) {
            if (error instanceof RangeError) {
                cycleCheck = true;
            }
            else
                cycleCheck = false;
        }

        if (node.sp) predsCheck = true;
    });
    if (cycleCheck) { alert('Graf jest cykliczny'); return; }
    if (!predsCheck) { alert('Brak ostatniego zadania'); return; }

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
    let output = [];
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
    saveStrings(output, 'output.txt');
}

function BttnOrganise() {
    nodes.forEach(node => {
        node.organise();
    });
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

function BttnPop() {
    if (!nodes.length) return;

    nodes[nodes.length - 1].inpTime.hide();
    nodes[nodes.length - 1].checkboxSP.hide();
    nodes[nodes.length - 1].inpConnections.hide();
    index--;
    console.log('Delete node ' + index)
    nodes.pop();
}