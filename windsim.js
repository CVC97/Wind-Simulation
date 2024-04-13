// building canvas
const canvas = document.getElementById('WindCanvas');
const ctx = canvas.getContext("2d");


// geometric classes
class PressureCenter {
    constructor (x, y, color) {

    }
}



// functions to transform calculation coordinates (center (0,0), x-range [-8, 8], y-width [-5, 5])
function x2c(x) {
    return 100*(x+8)
}

function y2c(y) {
    return 100*(-y+5)
}


// parameters of the system
x_high = 3
y_high = 0
x_low = -3
y_high = 0



ctx.beginPath();
ctx.arc(x2c(x_high), y2c(y_high), 50, 0, 2 * Math.PI);
ctx.strokeStyle = "#FC6255";
ctx.lineWidth = 4;
ctx.stroke();

ctx.font = "48px serif";
ctx.textAlign = "center";
ctx.textBaseline = "middle";
ctx.strokeStyle = "#FC6255";
ctx.strokeText("H", x2c(x_high+0.01), y2c(y_high-0.03));