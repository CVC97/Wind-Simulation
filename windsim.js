// building canvas
const canvas = document.getElementById('WindCanvas');
const ctx = canvas.getContext("2d");


// definitions
const manim_red = "#FC6255";
const manim_blue = "#58C4DD";


// functions to transform calculation coordinates (center (0, 0), x-range [-8, 8], y-width [-5, 5])
function x2c(x) {
    return 100*(x+8)
}

function y2c(y) {
    return 100*(-y+5)
}


// geometric classes
class PressureCenter {
    constructor(x, y, color, descriptor) {
        ctx.beginPath();
        ctx.arc(x2c(x), y2c(y), 50, 0, 2 * Math.PI);
        ctx.strokeStyle = color;
        ctx.lineWidth = 4;
        ctx.stroke();

        ctx.font = "48px serif";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.strokeStyle = color;
        ctx.strokeText(descriptor, x2c(x+0.01), y2c(y-0.03));
    }
}


class IsobarPixel {
    constructor(x_canvas, y_canvas, color, opacity) {
        ctx.beginPath();
        ctx.rect(x_canvas, y_canvas, 1, 1);
        ctx.fillStyle = color;
        ctx.globalAlpha = opacity / 16;
        ctx.fill();
    }
}


class Arrow {
    constructor(start, end, color) {

    }
}


class IsobarField {
    constructor(scalar_field, x_range = [-8, 8], y_range = [-5, 5], isobar_range = [-5, 5]) {
        this.x_canvas_min = x2c(x_range[0]);
        this.x_canvas_max = x2c(x_range[1]);
        this.y_canvas_min = y2c(y_range[0]);
        this.y_canvas_max = y2c(y_range[1]);

        
        const d_isobar = 0.005;                                                                 // proximity to the values of the isobars
        const isobar_increment = (isobar_range[1]-isobar_range[0]) / equilines;                 // increment between the individual isobars
        let isobar_array = [];                                                                  // declaring array containing the exact values of the isobars
        
        // constructing array with the exact isobar values
        for (let i_equiline = 0; i_equiline < equilines+1; i_equiline += 1) {
            isobar_array[i_equiline] = isobar_range[0] + i_equiline*isobar_increment;
        }
        
        // iterating through the pixels of the canvas
        for (let y = this.y_canvas_min; y > this.y_canvas_max; y -= 0.25) {
            for (let x = this.x_canvas_min; x < this.x_canvas_max; x += 0.25) {
                let scalar_field_value = scalar_field(x, y);                                    // calculating the value of the sclalar field at position (x, y)
                // iterating through the possible values for the isobars
                for (let i_equiline = 0; i_equiline < equilines+1; i_equiline += 1) {
                    let isobar_value = isobar_array[i_equiline];                                // accessing current array element (exact isobar value)
                    if (scalar_field_value > isobar_value-d_isobar && scalar_field_value < isobar_value+d_isobar) {
                        new IsobarPixel(x, y, manim_red, i_equiline/equilines);
                        new IsobarPixel(x, y, manim_blue, (equilines-i_equiline)/equilines);
                    }
                }
            }
        }
    }
}


// Verlet integrator
function verlet_step() {
    
}


// pressure field class
class PressureField {
    constructor() {
        this.x_high = high_center[0];
        this.y_high = high_center[1];
        this.x_low = low_center[0];
        this.y_low = low_center[1];

        // add centers of high and low pressure
        new PressureCenter(this.x_high, this.y_high, manim_red, "H");
        new PressureCenter(this.x_low, this.y_low, manim_blue, "L");
    } 
    // WARUM ERKENNT ER DIE THIS. VARIABLEN NICHT???!?!?!? JS HURENSOHN
    get_pressure(x, y) {
        const smoothing_factor = 10e-8;
        let pressure_high = high / (Math.sqrt(((x-x2c(high_center[0])) / 100)**2 + ((y-y2c(high_center[1])) / 100)**2) + smoothing_factor);
        let pressure_low = low / (Math.sqrt(((x-x2c(low_center[0])) / 100)**2 + ((y-y2c(low_center[1])) / 100)**2) + smoothing_factor);
        return pressure_high + pressure_low;
    } 

    get_pgf(state_array) {

    }

    get_coriolis_force(state_array) {
        
    }

    get_friction_force(state_array) {
        
    }
}



// parameters of the pressure field
let high = 5                            // pressure level of the 'high' (symbolic)
let low = -5                            // pressure level of the 'low' (symbolic)

let high_center = [4, 0];               // center of the 'high' (USER OPTION)
let low_center = [-4, 0];               // center of the 'low' (USER OPTION)

let equilines = 23;                     // number of isobars minus 1 (USER OPTION)


// parameters of the system 
let rho = 0.4;                          // air density (USER OPTION)
let gamma = 0.3;                        // friction coefficient (USER OPTION)
let omega = -0.6;                       // angular velocity of the earth (USER OPTION)
let latitude = 45;                      // latitude in degrees (symbolic)


// integration parameters
let dt = 0.01;                          // stepsize of the numerical integration
let t = 0;                              // starting time set to 0
let T_max = 20;                         // simulation duration (USER OPTION)

// initial condition
let state_array = [2, 1, 0, 0];         // initial state of the air mass (USER OPTION)




const pressure_field = new PressureField();
const isobar_field = new IsobarField(pressure_field.get_pressure, x_range = [-8, 8], y_range = [-5, 5], isobar_range = [-7, 7]);