import { IsobarField, PressureField } from "./field.js"
import { AirMass } from "./geometry.js"
import { Verlet } from "./verlet.js";
import { x2c, y2c, s2rho, s2omega, s2gamma, s2dt } from "./utilities.js";


// building canvas
export const canvas = document.getElementById("WindCanvas");
export const ctx = canvas.getContext("2d");

// global definitions
export const manim_red = "#FC6255";
export const manim_blue = "#58C4DD";



// ++++++++++ PARAMETER SECTION ++++++++++

// parameters of the pressure field
let high = 5                                    // pressure level of the 'high' (symbolic)
let low = -5                                    // pressure level of the 'low' (symbolic)

let high_center = [3.5, 0];                     // center of the 'high' (USER OPTION)
let low_center = [-3.5, 0];                     // center of the 'low' (USER OPTION)

let equilines = 15;                             // number of isobars minus 1 (USER OPTION)
let y_stretch = 0;                              // logarithmic zoom regarding the y-coordinate (USER OPTION, between 0 and 1)

// physical parameters of the system 
let rho = 0.003;                                // air density (USER OPTION)
let omega = 0.25;                               // angular velocity of the earth (USER OPTION)
let gamma = 0.3;                                // friction coefficient (USER OPTION)
let latitude = 45;                              // latitude in degrees (symbolic)

// integration parameters
let delta_t = 0.025;                            // stepsize of the numerical integration / animation speed (USER OPTION)

// initial condition
let new_x = parseFloat(document.getElementById("init_x").value);
let new_y = parseFloat(document.getElementById("init_y").value);
let new_vx = parseFloat(document.getElementById("init_vx").value);
let new_vy = parseFloat(document.getElementById("init_vy").value);

// animation checks
let bool_coriolis_force = 1;                    // bool: will coriolis force be considered (USER OPTION)
let bool_friction_force = 0;                    // bool: will friction force be considered (USER OPTION)

let animation_state = 0;                        // sets the animation state (0 for STOPPED, 1 for RUNNING)
let raf;                                        // animation handler


// parameter bundles
let phys_params = [rho, omega, gamma, latitude];
let force_params = [bool_coriolis_force, bool_friction_force];
let init_cstate_array = [x2c(new_x), y2c(new_y), 100*new_vx, -100*new_vy];



// ++++++++++ MAIN SECTION ++++++++++

// building the time-independent field
let pressure_field = new PressureField(ctx, high_center, low_center, high, low, phys_params, y_stretch);
let isobar_field = new IsobarField(ctx, pressure_field.get_pressure, equilines);


// saving the canvas background for new frame and reset
let save_image = new Image();
save_image.src = canvas.toDataURL("images/save_background.jpg");
let reset_image = new Image();
reset_image.src = canvas.toDataURL("images/reset_background.jpg");


// setting up the integratorand placing the air mass
let verlet = new Verlet(pressure_field, force_params, delta_t);
let air_mass = new AirMass(ctx, pressure_field, init_cstate_array, force_params)
air_mass.draw()


// ++++++++++ EVENT FUNCTIONS ++++++++++

// draws animation frame, moves animated objects to their next position obtained by calling the integrator 
function draw() {
    // clear canvas and load background image 
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(save_image, 0, 0);

    // construct new animation objects
    air_mass.state = verlet.step(air_mass.state);
    air_mass.draw();
    
    // make_base();
    raf = window.requestAnimationFrame(draw);
} 


// update pressure field and isobars and resetting air mass
function update_field() {
    equilines = parseInt(document.getElementById("number_equilines").value);
    y_stretch = parseInt(document.getElementById("y_stretch").value);
    console.log(y_stretch);
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // building the time-independent field
    pressure_field = new PressureField(ctx, high_center, low_center, high, low, phys_params, y_stretch);
    isobar_field = new IsobarField(ctx, pressure_field.get_pressure, equilines);

    // saving the canvas background for new frame and reset
    save_image = new Image();
    save_image.src = canvas.toDataURL("images/save_background.jpg");
    reset_image = new Image();
    reset_image.src = canvas.toDataURL("images/reset_background.jpg");

    // setting up the integratorand placing the air mass
    verlet = new Verlet(pressure_field, force_params, delta_t);
    air_mass = new AirMass(ctx, pressure_field, init_cstate_array, force_params);
    air_mass.draw();
}


// function to update physical parameters (updates pressure field) and new force parameters (updates integrator)
function update_params() {
    rho = s2rho(parseInt(document.getElementById("number_rho").value));
    omega = s2omega(parseInt(document.getElementById("number_omega").value));
    gamma = s2gamma(parseInt(document.getElementById("number_gamma").value));
    phys_params = [rho, omega, gamma, latitude];

    delta_t = s2dt(parseInt(document.getElementById("delta_t").value));

    pressure_field = new PressureField(ctx, high_center, low_center, high, low, phys_params, y_stretch);
    verlet = new Verlet(pressure_field, force_params, delta_t);
}



// ++++++++++ EVENT LISTENERS ++++++++++

// start button
document.getElementById("start_button").addEventListener("click", (event) => {
    if (animation_state == 0) {
        raf = window.requestAnimationFrame(draw);
        animation_state = 1;
        document.getElementById('start_button').innerHTML = "STOP";

        // parse new conditions
    } else {
        window.cancelAnimationFrame(raf);
        animation_state = 0;
        document.getElementById('start_button').innerHTML = "START";
    }
});


// save state button
document.getElementById("fix_state_button").addEventListener("click", (event) => {
    save_image.src = canvas.toDataURL("images/save_background.jpg");
});


// reset animation button
document.getElementById("reset_button").addEventListener("click", (event) => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(reset_image, 0, 0);
    save_image.src = canvas.toDataURL("images/save_background.jpg");
    
    // transfer resetted state to air mass and redraw
    new_x = parseFloat(document.getElementById("init_x").value);
    new_y = parseFloat(document.getElementById("init_y").value);
    new_vx = parseFloat(document.getElementById("init_vx").value);
    new_vy = parseFloat(document.getElementById("init_vy").value);
    air_mass.state = [x2c(new_x), y2c(new_y), 100*new_vx, -100*new_vy];
    console.log(air_mass.state);
    air_mass.draw();
});


// track slider interactions
document.getElementById("number_equilines").addEventListener("change", update_field);
document.getElementById("y_stretch").addEventListener("change", update_field);
document.getElementById("number_rho").addEventListener("change", update_params);
document.getElementById("number_omega").addEventListener("change", update_params);
document.getElementById("number_gamma").addEventListener("change", update_params);
document.getElementById("delta_t").addEventListener("change", update_params);