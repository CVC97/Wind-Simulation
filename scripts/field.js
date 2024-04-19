// ++++++++++ PRESSURE FIELD CLASSES ++++++++++

import {x2c, y2c, manim_red, manim_blue} from "./windsim.js"


// draws a center of high / low pressure given natural coordinates, color, and content
class PressureCenter {
    constructor(ctx, x, y, color, descriptor) {
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
    constructor(ctx, cx, cy, color, opacity) {
        ctx.beginPath();
        ctx.rect(cx, cy, 1, 1);
        ctx.fillStyle = color;
        ctx.globalAlpha = opacity / 16;
        ctx.fill();
    }
}


// draws isobars for a given field, natural start / end coordinates, as well as range and number of isobars 
export class IsobarField {
    constructor(ctx, scalar_field, equilines = 13, x_range = [-8, 8], y_range = [-5, 5], isobar_range = [-5, 5]) {
        this.cx_canvas_min = x2c(x_range[0]);
        this.cx_canvas_max = x2c(x_range[1]);
        this.cy_canvas_min = y2c(y_range[0]);
        this.cy_canvas_max = y2c(y_range[1]);

        const d_isobar = 0.005;                                                                 // proximity to the values of the isobars
        const isobar_increment = (isobar_range[1]-isobar_range[0]) / equilines;                 // increment between the individual isobars
        let isobar_array = [];                                                                  // declaring array containing the exact values of the isobars
        
        // constructing array with the exact isobar values
        for (let i_equiline = 0; i_equiline < equilines+1; i_equiline += 1) {
            isobar_array[i_equiline] = isobar_range[0] + i_equiline*isobar_increment;
        }
        
        // iterating through the pixels of the canvas
        for (let cy = this.cy_canvas_min; cy > this.cy_canvas_max; cy -= 0.25) {
            for (let cx = this.cx_canvas_min; cx < this.cx_canvas_max; cx += 0.25) {
                let scalar_field_value = scalar_field(cx, cy);                                    // calculating the value of the sclalar field at position (x, y)
                // iterating through the possible values for the isobars
                for (let i_equiline = 0; i_equiline < equilines+1; i_equiline += 1) {
                    let isobar_value = isobar_array[i_equiline];                                // accessing current array element (exact isobar value)
                    if (scalar_field_value > isobar_value-d_isobar && scalar_field_value < isobar_value+d_isobar) {
                        new IsobarPixel(ctx, cx, cy, manim_red, i_equiline/equilines);
                        new IsobarPixel(ctx, cx, cy, manim_blue, (equilines-i_equiline)/equilines);
                    }
                }
            }
        }
    }
}


// pressure field class: organizes subclasses, provides forces
export class PressureField {
    x_high;
    y_high;
    x_low;
    y_low;
    cx_high;
    cy_high;
    cx_low;
    cy_low;
    high;
    low;
    y_stretch;

    // binding methods because javascript is retarded
    get_pressure = this.get_pressure.bind(this);
    get_pgf = this.get_pgf.bind(this);
    get_coriolis_force = this.get_coriolis_force.bind(this);
    get_friction_force = this.get_friction_force.bind(this);

    constructor(ctx, high_center, low_center, high, low, phys_params, y_stretch) {
        this.x_high = high_center[0];
        this.y_high = high_center[1];
        this.x_low = low_center[0];
        this.y_low = low_center[1];

        this.cx_high = x2c(this.x_high);
        this.cy_high = y2c(this.y_high);
        this.cx_low = x2c(this.x_low);
        this.cy_low = y2c(this.y_low);

        this.high = high;
        this.low = low;

        this.rho = phys_params[0];
        this.omega = phys_params[1];
        this.gamme = phys_params[2];
        this.latitude = phys_params[3];

        this.y_stretch = y_stretch / 10;

        // add centers of high and low pressure
        new PressureCenter(ctx, this.x_high, this.y_high, manim_red, "H");
        new PressureCenter(ctx, this.x_low, this.y_low, manim_blue, "L");
    } 

    // WARUM ERKENNT ER DIE THIS. VARIABLEN NICHT???!?!?!?
    get_pressure(x, y) {
        const smoothing_factor = 10e-8;
        let pressure_high = this.high / (Math.sqrt(((x-this.cx_high) / 100)**2 + ((y-this.cy_high) / 10**(2+this.y_stretch))**2) + smoothing_factor);
        let pressure_low = this.low / (Math.sqrt(((x-this.cx_low) / 100)**2 + ((y-this.cy_low) / 10**(2+this.y_stretch))**2) + smoothing_factor);
        return pressure_high + pressure_low;
    } 

    // calculates force array under influence of the pressure gradient force given the state of the air block
    get_pgf(state_array) {
        let x = state_array[0];
        let y = state_array[1];
        let v_x = state_array[2];
        let v_y = state_array[3];
        let dr = 0.001;
        let f_grad_x = -1/this.rho * (this.get_pressure(x+dr, y) - this.get_pressure(x-dr, y)) / (2*dr);
        let f_grad_y = -1/this.rho * (this.get_pressure(x, y+dr) - this.get_pressure(x, y-dr)) / (2*dr);
        return [v_x, v_y, f_grad_x, f_grad_y];
    }
    
    // calculates force array with respect to the coriolis force given a state
    get_coriolis_force(state_array) {
        let v_x = state_array[2];
        let v_y = state_array[3];
        let f_coriolis_x = -this.omega * v_y * 2*Math.sin(this.latitude * 2*Math.PI / 360);
        let f_coriolis_y = this.omega * v_x * 2*Math.sin(this.latitude * 2*Math.PI / 360);
        return [v_x, v_y, f_coriolis_x, f_coriolis_y];
    }

    // calculates force array with respect to the friction force given a state
    get_friction_force(state_array) {
        let v_x = state_array[2];
        let v_y = state_array[3];
        let f_gamma_x = -this.gamma * v_x;
        let f_gamma_y = -this.gamma * v_y;
        return [v_x, v_y, f_gamma_x, f_gamma_y];
    }
}
