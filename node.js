class node {

    constructor(num, time, sp, file, con) {
        this.num = num;
        this.time = time;
        this.sp = sp;

        this.r = window.innerWidth / 20;

        this.text = this.num.toString().concat("(", this.time.toString(), ")");

        this.col = createVector((this.num * 10) % 100, 100, 100);

        if (file)
            this.connections = con;
        else
            this.connections = [0];

        if (!file) {
            this.pos = createVector(mouseX, mouseY);
        }
        else {
            this.pos = createVector((this.num - 1) * (this.r / 2) + this.r + 300,
                (this.num % 3) * ((window.innerHeight - this.r) / 2) + this.r - (this.num % 3) * this.r / 2);
        }

        this.drag = false;

        this.inpTime = createInput(this.time.toString());
        this.checkboxSP = createCheckbox('', this.sp);
        this.inpConnections = createInput(this.connections.toString());
    }

    update() {
        this.text = this.num.toString().concat("(", this.time, ")");
        this.r = window.innerWidth / 20;

        let d = dist(mouseX, mouseY, this.pos.x, this.pos.y);
        if (d <= this.r / 2) {
            this.col.y = 0;
        } else {
            this.col.y = 100;
        }
    }

    body() {
        fill(this.col.x, this.col.y, this.col.z);
        stroke(0);
        strokeWeight(0);
        circle(this.pos.x, this.pos.y, this.r);

        fill(0);
        stroke(0, 0, 100);
        strokeWeight(2);
        textSize(window.innerWidth / 50);
        textAlign(CENTER, CENTER);
        text(this.text, this.pos.x, this.pos.y);
    }

    connect() {
        if (this.sp) return;

        this.connections.forEach(element => {

            let that = nodes[element - 1];
            if (typeof that === 'undefined') return;

            strokeWeight(4);
            stroke(this.col.x, this.col.y, this.col.z);

            let grad = drawingContext.createLinearGradient(this.pos.x, this.pos.y, that.pos.x, that.pos.y);
            grad.addColorStop(0, color(this.col.x, this.col.y, this.col.z));
            grad.addColorStop(1, color(that.col.x, that.col.y, that.col.z));

            drawingContext.strokeStyle = grad;
            drawingContext.fillStyle = grad;

            let off = this.r / 5;
            triangle(this.pos.x + off, this.pos.y + off, this.pos.x - off, this.pos.y - off, that.pos.x, that.pos.y);
            triangle(this.pos.x - off, this.pos.y + off, this.pos.x + off, this.pos.y - off, that.pos.x, that.pos.y);

            let grad2 = drawingContext.createLinearGradient(this.pos.x, this.pos.y, that.pos.x, that.pos.y);
            grad2.addColorStop(0, color(that.col.x, that.col.y, that.col.z));
            grad2.addColorStop(1, color(this.col.x, this.col.y, this.col.z));

            drawingContext.strokeStyle = grad2;

            line(this.pos.x, this.pos.y, that.pos.x, that.pos.y);

            push()
            let edge = this.r * 0.9;
            let angle = atan2(this.pos.y - that.pos.y, this.pos.x - that.pos.x);
            translate(that.pos.x, that.pos.y);
            rotate(angle - HALF_PI);
            triangle(-edge * 0.3, edge * 1.5, edge * 0.3, edge * 1.5, 0, edge * 0.5);
            pop()

        });
    }

    pressed(x, y) {
        let d = dist(x, y, this.pos.x, this.pos.y);
        if (d <= this.r / 2) {
            this.drag = true;
            this.col.z = 50;
            console.log("Pressed on " + this.num);
            return true;
        }
    }

    released() {
        this.drag = false;
        this.col.z = 100;
        return true;
    }

    move(x, y) {
        if (this.drag) {
            this.pos.x = x;
            this.pos.y = y;
        }
    }

    organise() {
        this.pos = createVector((this.num - 1) * (this.r / 2) + this.r + 300,
            (this.num % 3) * ((window.innerHeight - this.r) / 2) + this.r - (this.num % 3) * this.r / 2);
    }

    sim() {
        this.connections.forEach(element => {
            let that = nodes[element - 1];
            let force = p5.Vector.sub(that.pos, this.pos);
            let d = force.mag();
            force.setMag(0.25);
            if (d < 2 * this.r) {
                force.mult(-10);
            }
            this.pos.add(force);
        });
        this.checkBorder();
    }

    sim2() {
        nodes.forEach(node => {
            let force = p5.Vector.sub(node.pos, this.pos);
            let d = force.mag();
            force.setMag(0.25);
            if (d < 3 * this.r) {
                force.mult(-10);
            }
            this.pos.add(force);
        });
        this.checkBorder();
    }

    sim3() {
        nodes.forEach(node => {
            if (Math.abs(this.pos.x - node.pos.x) < this.r) this.pos.x += random(-10, 10);
            if (Math.abs(this.pos.y - node.pos.y) < this.r) this.pos.y += random(-10, 10);
        });
        this.checkBorder();
    }

    sim4() {
        this.connections.forEach(element => {
            let that = nodes[element - 1];
            nodes.forEach(node => {
                if (node.pos.x >= (this.pos.x - this.r / 2) &&
                    node.pos.x <= ((that.pos.x + that.r / 2) - (this.pos.x - this.r / 2))
                    ||
                    node.pos.y >= (this.pos.y + this.r / 2) &&
                    node.pos.y <= ((that.pos.y - that.r / 2) - (this.pos.y + this.r / 2))) {
                    node.pos.x += random(-node.r, node.r);
                    node.pos.y += random(-node.r, node.r);
                }
            });
        });
        this.checkBorder();
    }

    checkBorder() {
        if (this.pos.x <= menuSize) this.pos.x += menuSize + this.r;
        if (this.pos.x >= window.innerWidth - menuSize) this.pos.x -= this.r;
        if (this.pos.y <= 0) this.pos.y += this.r;
        if (this.pos.y >= window.innerHeight) this.pos.y -= this.r;
    }
}