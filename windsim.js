// building canvas
var canvas = document.getElementById('WindCanvas');
const ctx = canvas.getContext("2d");


// functions to transform calculation coordinates (center (0,0), x-range [-8, 8], y-width [-5, 5])
function x2c(x) {
    return 100*(x+8)
}

function y2c(y) {
    return 100*(-y+5)
}


// parameters of the system


