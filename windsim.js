// building canvas
const canvas = document.getElementById("WindCanvas");
const ctx = canvas.getContext("2d");


// definitions
const manim_red = "#FC6255";
const manim_blue = "#58C4DD";


// functions to transform calculation coordinates (center (0, 0), x-range [-8, 8], y-width [-5, 5])
function x2c(x) {
    return 100*(x+8);
}

function y2c(y) {
    return 100*(-y+5);
}



// ++++++++++ GEOMETRIC CLASSES SECTION ++++++++++

// draws a center of high / low pressure given natural coordinates, color, and content
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

// colors a pixel at canvas coordinates given color and opacity
class IsobarPixel {
    constructor(x_canvas, y_canvas, color, opacity) {
        ctx.beginPath();
        ctx.rect(x_canvas, y_canvas, 1, 1);
        ctx.fillStyle = color;
        ctx.globalAlpha = opacity / 16;
        ctx.fill();
    }
}

// draws an arrow given start / end point, color, width, and stroke dash
class Arrow {
    constructor(start, end, color = "white", stroke_width = 4, stroke_dash = []) {
        this.x_start = start[0];
        this.y_start = start[1];
        this.x_end = end[0];
        this.y_end = end[1];

        ctx.beginPath();
        ctx.moveTo(this.x_start, this.y_start);
        ctx.lineTo(this.x_end, this.y_end);
        ctx.lineWidth = stroke_width;
        ctx.strokeStyle = color;
        ctx.setLineDash(stroke_dash);

        this.end_start_vector_length = Math.sqrt((this.x_end-this.x_start)**2 + (this.y_end-this.y_start)**2);
        this.tip_line_factor = 20;
        this.tip_line = [(this.x_start-this.x_end) / this.end_start_vector_length * this.tip_line_factor, (this.y_start-this.y_end) / this.end_start_vector_length * this.tip_line_factor];
        this.tip_line_angle = Math.PI / 6;

        ctx.moveTo(this.x_end, this.y_end);
        ctx.lineTo(
            this.x_end + Math.cos(this.tip_line_angle)*this.tip_line[0] - Math.sin(this.tip_line_angle)*this.tip_line[1], 
            this.y_end + Math.sin(this.tip_line_angle)*this.tip_line[0] + Math.cos(this.tip_line_angle)*this.tip_line[1]
        );
        ctx.moveTo(this.x_end, this.y_end);
        ctx.lineTo(
            this.x_end + Math.cos(-this.tip_line_angle)*this.tip_line[0] - Math.sin(-this.tip_line_angle)*this.tip_line[1], 
            this.y_end + Math.sin(-this.tip_line_angle)*this.tip_line[0] + Math.cos(-this.tip_line_angle)*this.tip_line[1]
        );
        ctx.stroke();
    }
}

// draws isobars for a given field, natural start / end coordinates, as well as range and number of isobars 
class IsobarField {
    constructor(scalar_field, x_range = [-8, 8], y_range = [-5, 5], isobar_range = [-5, 5], equilines = 13) {
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



// ++++++++++ PRESSURE FIELD CLASS ++++++++++

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
    // WARUM ERKENNT ER DIE THIS. VARIABLEN NICHT???!?!?!?
    get_pressure(x, y) {
        const smoothing_factor = 10e-8;
        let pressure_high = high / (Math.sqrt(((x-x2c(high_center[0])) / 100)**2 + ((y-y2c(high_center[1])) / 10**(2+y_stretch))**2) + smoothing_factor);
        let pressure_low = low / (Math.sqrt(((x-x2c(low_center[0])) / 100)**2 + ((y-y2c(low_center[1])) / 10**(2+y_stretch))**2) + smoothing_factor);
        return pressure_high + pressure_low;
    } 

    // calculates force array under influence of the pressure gradient force given the state of the air block
    get_pgf(state_array) {
        let x = state_array[0];
        let y = state_array[1];
        let v_x = state_array[2];
        let v_y = state_array[3];
        let dr = 0.001;
        let f_grad_x = -1/rho * (this.get_pressure(x+dr, y) - this.get_pressure(x-dr, y)) / (2*dr);
        let f_grad_y = -1/rho * (this.get_pressure(x, y+dr) - this.get_pressure(x, y-dr)) / (2*dr);
        return [v_x, v_y, f_grad_x, f_grad_y];
    }
    
    // calculates force array with respect to the coriolis force given a state
    get_coriolis_force(state_array) {
        let v_x = state_array[2];
        let v_y = state_array[3];
        let f_coriolis_x = -omega * v_y * 2*Math.sin(latitude * 2*Math.PI / 360);
        let f_coriolis_y = omega * v_x * 2*Math.sin(latitude * 2*Math.PI / 360);
        return [v_x, v_y, f_coriolis_x, f_coriolis_y];
    }

    // calculates force array with respect to the friction force given a state
    get_friction_force(state_array) {
        let v_x = state_array[2];
        let v_y = state_array[3];
        let f_gamma_x = -gamma * v_x;
        let f_gamma_y = -gamma * v_y;
        return [v_x, v_y, f_gamma_x, f_gamma_y];
    }
}



// ++++++++++ PARAMETER SECTION ++++++++++

// parameters of the pressure field
let high = 5                                    // pressure level of the 'high' (symbolic)
let low = -5                                    // pressure level of the 'low' (symbolic)

let high_center = [3.5, 0];                     // center of the 'high' (USER OPTION)
let low_center = [-3.5, 0];                     // center of the 'low' (USER OPTION)

let equilines = 13;                             // number of isobars minus 1 (USER OPTION)
let y_stretch = 0;                              // logarithmic zoom regarding the y-coordinate (USER OPTION, between 0 and 1)


// parameters of the system 
let rho = 0.003;                                // air density (USER OPTION)
let omega = 0.25;                               // angular velocity of the earth (USER OPTION)
let gamma = 0.3;                                // friction coefficient (USER OPTION)
let latitude = 45;                              // latitude in degrees (symbolic)


// integration parameters
let delta_t = 0.025;                            // stepsize of the numerical integration / animation speed (USER OPTION)


// initial condition
let init_state_array = [2, 1, 0, 0];            // initial state of the air mass (USER OPTION)


// animation checks
let bool_coriolis_force = 1;                    // bool: will coriolis force be considered (USER OPTION)
let bool_friction_force = 0;                    // bool: will friction force be considered (USER OPTION)
let arrow_stretch = 12;                         // stretches arrows with a consistent factor (symbolic)

let animation_state = 0;                        // sets the animation state (0 for STOPPED, 1 for RUNNING)
let start_botton_content = "START";             // displayed start button status: 



// ++++++++++ ANIMATED OBJECTS SECTION ++++++++++

const air_mass = {
    state: [x2c(init_state_array[0]), y2c(init_state_array[1]), 100*init_state_array[2], -100*init_state_array[3]],
    sidelength: 30,
    draw() {
        x = this.state[0];
        y = this.state[1];

        ctx.beginPath();
        ctx.rect(x-this.sidelength/2, y-this.sidelength/2, this.sidelength, this.sidelength);
        ctx.lineWidth = 10;
        ctx.fillStyle = "white";
        ctx.globalAlpha = 1;
        ctx.fill();     
    },
    
}

const speed_arrow = {
    state: [x2c(init_state_array[0]), y2c(init_state_array[1]), 100*init_state_array[2], -100*init_state_array[3]],
    draw() {
        let x = this.state[0];
        let y = this.state[1];
        let v_x = this.state[2];
        let v_y = this.state[3];

        new Arrow(start = [x, y], end = [x+v_x*arrow_stretch, y+v_y*arrow_stretch], color = "white", stroke_width = 4, stroke_dash = [5, 5]);
    }
}

const pgf_arrow = {
    state: [x2c(init_state_array[0]), y2c(init_state_array[1]), 100*init_state_array[2], -100*init_state_array[3]],
    draw() {
        let x = this.state[0];
        let y = this.state[1];
        let f_state = pressure_field.get_pgf(this.state);
        let f_x = f_state[2];
        let f_y = f_state[3];

        new Arrow(start = [x, y], end = [x+f_x*arrow_stretch, y+f_y*arrow_stretch], color = manim_red)
    }
}

const coriolis_arrow = {
    state: [x2c(init_state_array[0]), y2c(init_state_array[1]), 100*init_state_array[2], -100*init_state_array[3]],
    draw() {
        let x = this.state[0];
        let y = this.state[1];
        let f_state = pressure_field.get_coriolis_force(this.state);
        let f_x = f_state[2];
        let f_y = f_state[3];

        new Arrow(start = [x, y], end = [x+f_x*arrow_stretch, y+f_y*arrow_stretch], color = "#D3D3D3")
    }
} 

const friction_arrow = {
    state: [x2c(init_state_array[0]), y2c(init_state_array[1]), 100*init_state_array[2], -100*init_state_array[3]],
    draw() {
        let x = this.state[0];
        let y = this.state[1];
        let f_state = pressure_field.get_friction_force(this.state);
        let f_x = f_state[2];
        let f_y = f_state[3];

        new Arrow(start = [x, y], end = [x+f_x*arrow_stretch, y+f_y*arrow_stretch], color = "black")
    }
}

const total_arrow = {
    state: [x2c(init_state_array[0]), y2c(init_state_array[1]), 100*init_state_array[2], -100*init_state_array[3]],
    draw() {
        let x = this.state[0];
        let y = this.state[1];
        let f_state_pgf = pressure_field.get_pgf(this.state);
        let f_state_coriolis = pressure_field.get_coriolis_force(this.state);
        let f_state_friction = pressure_field.get_friction_force(this.state);
        let f_x = f_state_pgf[2];
        let f_y = f_state_pgf[3];

        if (bool_coriolis_force) {
            f_x += f_state_coriolis[2];
            f_y += f_state_coriolis[3];
        }
        if (bool_friction_force) {
            f_x += f_state_friction[2];
            f_y += f_state_friction[3];
        }

        new Arrow(start = [x, y], end = [x+f_x*arrow_stretch, y+f_y*arrow_stretch], color = "black")
    }
}



// ++++++++++ INTEGRATION AND FRAME STEPS ++++++++++

// Verlet integrator depending on the integration requests (coriolis / friction)
function verlet_step(state_array) {
    let a1_pgf = pressure_field.get_pgf(state_array);
    if (bool_coriolis_force) {
        let a1_coriolis_force = pressure_field.get_coriolis_force(state_array); 
        for (let i = 0; i < 4; i += 1) {
            a1_pgf[i] += a1_coriolis_force[i];
        }
    }  
    if (bool_friction_force) {
        let a1_friction_force = pressure_field.get_friction_force(state_array);
        for (let i = 0; i < 4; i += 1) {
            a1_pgf[i] += a1_friction_force[i];
        }   
    }
    state_array[0] += a1_pgf[0]*delta_t + a1_pgf[2]*delta_t**2/2;
    state_array[1] += a1_pgf[1]*delta_t + a1_pgf[3]*delta_t**2/2; 
    let a2_pgf = pressure_field.get_pgf(state_array);
    if (bool_coriolis_force) {
        let a2_coriolis_force = pressure_field.get_coriolis_force(state_array); 
        for (let i = 0; i < 4; i += 1) {
            a2_pgf[i] += a2_coriolis_force[i];
        }
    }  
    if (bool_friction_force) {
        let a2_friction_force = pressure_field.get_friction_force(state_array);
        for (let i = 0; i < 4; i += 1) {
            a2_pgf[i] += a2_friction_force[i];
        }   
    }
    state_array[2] += (a1_pgf[2] + a2_pgf[2]) * delta_t/2;
    state_array[3] += (a1_pgf[3] + a2_pgf[3]) * delta_t/2;
    return state_array;
}


// draws animation frame, moves animated objects to their next position obtained by calling the integrator 
function draw() {
    // clear canvas and load background image 
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(save_image, 0, 0);

    // construct new animation objects
    air_mass.draw();
    speed_arrow.draw();
    if (bool_coriolis_force) {
        pgf_arrow.draw();
        coriolis_arrow.draw();
    }
    if (bool_friction_force) {
        friction_arrow.draw();
    }
    total_arrow.draw();

    // get current state array and transfer it to the animation objects
    let state_array = verlet_step(air_mass.state);
    air_mass.state = state_array;
    speed_arrow.state = state_array;
    total_arrow.state = state_array;
    if (bool_coriolis_force) {
        pgf_arrow.state = state_array;
        coriolis_arrow.state = state_array;
    }
    if (bool_friction_force) {
        friction_arrow.state = state_array;
    }

    // make_base();
    raf = window.requestAnimationFrame(draw);
} 



// ++++++++++ MAIN SECTION ++++++++++

// building the time-independent field
const pressure_field = new PressureField();
const isobar_field = new IsobarField(pressure_field.get_pressure, x_range = [-8, 8], y_range = [-5, 5], isobar_range = [-7, 7]);

// saving the canvas background for new frame and reset
save_image = new Image();
save_image.src = canvas.toDataURL("images/save_background.jpg");
reset_image = new Image();
reset_image.src = canvas.toDataURL("images/reset_background.jpg");

// animation variables
let raf;
const start_button = document.getElementById("start_button");
document.getElementById('start_button').innerHTML = "START";
const fix_state_button = document.getElementById("fix_state_button");
const reset_button = document.getElementById("reset_button");

const lightmode_check = document.getElementById("lightmode");
const input_section = document.getElementById("input_section");

// start button
start_button.addEventListener("click", (e) => {
    if (animation_state == 0) {
        raf = window.requestAnimationFrame(draw);
        animation_state = 1;
        document.getElementById('start_button').innerHTML = "STOP";
    } else {
        window.cancelAnimationFrame(raf);
        animation_state = 0;
        document.getElementById('start_button').innerHTML = "START";
    }
});

// save state button
fix_state_button.addEventListener("click", (e) => {
    save_image.src = canvas.toDataURL("images/save_background.jpg");
});

// reset animation button
reset_button.addEventListener("click", (e) => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(reset_image, 0, 0);
    save_image.src = canvas.toDataURL("images/save_background.jpg");
    
    // reset state and transfer it to the animation objects
    state_array = [x2c(init_state_array[0]), y2c(init_state_array[1]), 100*init_state_array[2], -100*init_state_array[3]];
    air_mass.state = state_array;
    speed_arrow.state = state_array;
    total_arrow.state = state_array;
    if (bool_coriolis_force) {
        pgf_arrow.state = state_array;
        coriolis_arrow.state = state_array;
    }
    if (bool_friction_force) {
        friction_arrow.state = state_array;
    }
    
    // reconstruct new animation objects
    air_mass.draw();
    speed_arrow.draw();
    if (bool_coriolis_force) {
        pgf_arrow.draw();
        coriolis_arrow.draw();
    }
    if (bool_friction_force) {
        friction_arrow.draw();
    }
    total_arrow.draw();
});


// FIX: AIR MASS now VISIBLE AT START
air_mass.draw();
speed_arrow.draw();
if (bool_coriolis_force) {
    pgf_arrow.draw();
    coriolis_arrow.draw();
}
if (bool_friction_force) {
    friction_arrow.draw();
}
total_arrow.draw();


function update_input() {
    new PressureCenter(0,0, manim_blue, "WHY??!?!?!");
    equilines = parseInt(document.getElementById("number_equilines").value); 
    rho = parseInt(document.getElementById("number_rho").value); 

    pressure_field = new PressureField();
    isobar_field = new IsobarField(pressure_field.get_pressure, x_range = [-8, 8], y_range = [-5, 5], isobar_range = [-7, 7]);
}

// function show_image() {
//     var img = document.createElement("img");
//     img.src = "images/clown.jpg";
//     img.width = 500;
//     img.height = 500;
//     document.body.appendChild(img);
// }


// connecting number input

input_section.addEventListener("change", update_input);
lightmode_check.addEventListener("lightmode", show_image);