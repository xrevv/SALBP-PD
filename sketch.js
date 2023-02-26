var data = [];
var nodes = [];
var press = false;
let index = 1;

let buttonReset;
let buttonExport;
let buttonSimulate;
let buttonOrganise;

function setup() {

    frameRate(1000);

    createCanvas(windowWidth, windowHeight);
    textSize(window.innerWidth / 50);
    textAlign(CENTER, CENTER);
    textStyle(BOLD);
    colorMode(HSB, 100);
    background(0, 0, 50);

    rectMode(CORNER);

    input = createFileInput(BttnHandleFile);
    input.position(10, 10);

    buttonReset = createButton('Reset');
    buttonReset.position(10, 40);
    buttonReset.mousePressed(BttnReset);

    buttonExport = createButton('Export');
    buttonExport.position(100, 40);
    buttonExport.mousePressed(BttnExport);

    buttonOrganise = createButton('Organise');
    buttonOrganise.position(190, 40);
    buttonOrganise.mousePressed(BttnOrganise);

    buttonSimulate = createButton('AutoPlace (EXPERIMENTAL)');
    buttonSimulate.position(40, 70);
    buttonSimulate.mousePressed(BttnSimulation);
}

function draw() {
    clear();

    fill(50);
    rect(0, 0, 300, height)

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
        node.connection();
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
    if (!press && mouseX > 250) {
        console.log('New node')
        nodes.push(new node(index++, 3, false, false));
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

// Buttons

function BttnHandleFile(file) {
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

function BttnReset() {
    location.reload();
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
