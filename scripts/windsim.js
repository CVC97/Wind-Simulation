import {IsobarField, PressureField} from "./field.js"
import {AirMass} from "./geometry.js"
import {Verlet} from "./verlet.js";


// building canvas
const canvas = document.getElementById("WindCanvas");
const ctx = canvas.getContext("2d");


// global definitions
export const manim_red = "#FC6255";
export const manim_blue = "#58C4DD";


// global functions to transform calculation coordinates (center (0, 0), x-range [-8, 8], y-width [-5, 5])
export function x2c(x) {
    return 100*(x+8);
}

export function y2c(y) {
    return 100*(-y+5);
}



// ++++++++++ PARAMETER SECTION ++++++++++

// parameters of the pressure field
let high = 5                                    // pressure level of the 'high' (symbolic)
let low = -5                                    // pressure level of the 'low' (symbolic)

let high_center = [3.5, 0];                     // center of the 'high' (USER OPTION)
let low_center = [-3.5, 0];                     // center of the 'low' (USER OPTION)

let equilines = 23;                             // number of isobars minus 1 (USER OPTION)
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


let animation_state = 0;                        // sets the animation state (0 for STOPPED, 1 for RUNNING)
let start_botton_content = "START";             // displayed start button status: 


// parameter bundles
let phys_params = [rho, omega, gamma, latitude];
let force_params = [bool_coriolis_force, bool_friction_force];
let init_cstate_array = [x2c(init_state_array[0]), y2c(init_state_array[1]), 100*init_state_array[2], -100*init_state_array[3]];



// ++++++++++ MAIN SECTION ++++++++++

// draws animation frame, moves animated objects to their next position obtained by calling the integrator 
export function draw() {
    // clear canvas and load background image 
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(save_image, 0, 0);

    // construct new animation objects
    air_mass.state = verlet.step(air_mass.state, delta_t);
    air_mass.draw();

    // make_base();
    raf = window.requestAnimationFrame(draw);
} 


// building the time-independent field
const pressure_field = new PressureField(ctx, high_center, low_center, high, low, phys_params, y_stretch);
const isobar_field = new IsobarField(ctx, pressure_field.get_pressure, equilines);


// saving the canvas background for new frame and reset
let save_image = new Image();
save_image.src = canvas.toDataURL("images/save_background.jpg");
let reset_image = new Image();
reset_image.src = canvas.toDataURL("images/reset_background.jpg");


// setting up the integratorand placing the air mass
let verlet = new Verlet(pressure_field, force_params);
let air_mass = new AirMass(ctx, pressure_field, init_cstate_array, force_params)
air_mass.draw()


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
    
    // transfer resetted state to air mass and redraw
    air_mass.state = [x2c(init_state_array[0]), y2c(init_state_array[1]), 100*init_state_array[2], -100*init_state_array[3]];
    air_mass.draw();
});


// // FIX: AIR MASS now VISIBLE AT START
// let air_mass = AirMass(ctx, pressure_field)
// AirMass.draw();


// function update_input() {
//     new PressureCenter(0,0, manim_blue, "WHY??!?!?!");
//     equilines = parseInt(document.getElementById("number_equilines").value); 
//     console.log(equilines)
//     rho = parseInt(document.getElementById("number_rho").value); 

//     pressure_field = new PressureField();
//     isobar_field = new IsobarField(pressure_field.get_pressure, x_range = [-8, 8], y_range = [-5, 5], isobar_range = [-7, 7]);
// }

// // function show_image() {
// //     var img = document.createElement("img");
// //     img.src = "images/clown.jpg";
// //     img.width = 500;
// //     img.height = 500;
// //     document.body.appendChild(img);
// // }


// // connecting number input

// input_section.addEventListener("onkeypress", update_input);
// lightmode_check.addEventListener("lightmode", show_image);