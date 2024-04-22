import {manim_red, manim_blue} from "./windsim.js"



// ++++++++++ ANIMATED OBJECTS SECTION ++++++++++

// draws an arrow given start / end point, color, width, and stroke dash
class Arrow {
    constructor(ctx, start, end, color = "white", stroke_width = 4, stroke_dash = []) {
        this.cx_start = start[0];
        this.cy_start = start[1];
        this.cx_end = end[0];
        this.cy_end = end[1];

        ctx.beginPath();
        ctx.moveTo(this.cx_start, this.cy_start);
        ctx.lineTo(this.cx_end, this.cy_end);
        ctx.lineWidth = stroke_width;
        ctx.strokeStyle = color;
        ctx.setLineDash(stroke_dash);

        this.end_start_vector_length = Math.sqrt((this.cx_end-this.cx_start)**2 + (this.cy_end-this.cy_start)**2);
        this.tip_line_factor = 20;
        this.tip_line = [(this.cx_start-this.cx_end) / this.end_start_vector_length * this.tip_line_factor, (this.cy_start-this.cy_end) / this.end_start_vector_length * this.tip_line_factor];
        this.tip_line_angle = Math.PI / 6;

        ctx.moveTo(this.cx_end, this.cy_end);
        ctx.lineTo(
            this.cx_end + Math.cos(this.tip_line_angle)*this.tip_line[0] - Math.sin(this.tip_line_angle)*this.tip_line[1], 
            this.cy_end + Math.sin(this.tip_line_angle)*this.tip_line[0] + Math.cos(this.tip_line_angle)*this.tip_line[1]
        );
        ctx.moveTo(this.cx_end, this.cy_end);
        ctx.lineTo(
            this.cx_end + Math.cos(-this.tip_line_angle)*this.tip_line[0] - Math.sin(-this.tip_line_angle)*this.tip_line[1], 
            this.cy_end + Math.sin(-this.tip_line_angle)*this.tip_line[0] + Math.cos(-this.tip_line_angle)*this.tip_line[1]
        );
        ctx.stroke();
    }
}


// defined air block
function air_mass(ctx, state) {
    let sidelength = 30;
    let x = state[0];
    let y = state[1];

    ctx.beginPath();
    ctx.rect(x-sidelength/2, y-sidelength/2, sidelength, sidelength);
    ctx.lineWidth = 10;
    ctx.fillStyle = "white";
    ctx.globalAlpha = 1;
    ctx.fill();     
}


// arrow showing the current velocity
function speed_arrow(ctx, state, arrow_stretch) {
    let x = state[0];
    let y = state[1];
    let v_x = state[2];
    let v_y = state[3];

    new Arrow(ctx, [x, y], [x+v_x*arrow_stretch, y+v_y*arrow_stretch], "white", 4, [5, 5]);
}


// arrow for the pressure gradient force
function pgf_arrow(ctx, state, f_state, arrow_stretch) {
    let x = state[0];
    let y = state[1];
    let f_x = f_state[2];
    let f_y = f_state[3];
    
    new Arrow(ctx, [x, y], [x+f_x*arrow_stretch, y+f_y*arrow_stretch], manim_red);
}


// arrow for the coriolis force
function coriolis_arrow(ctx, state, f_state, arrow_stretch) {
    let x = state[0];
    let y = state[1];
    let f_x = f_state[2];
    let f_y = f_state[3];

    new Arrow(ctx, [x, y], [x+f_x*arrow_stretch, y+f_y*arrow_stretch], "grey");
}


// arrow for the friction force
function friction_arrow(ctx, state, f_state, arrow_stretch) {
    let x = state[0];
    let y = state[1];
    let f_x = f_state[2];
    let f_y = f_state[3];
    
    new Arrow(ctx, [x, y], [x+f_x*arrow_stretch, y+f_y*arrow_stretch], "black");

}


// arrow for the total force
function total_arrow(ctx, state, f_state, arrow_stretch) {
    let x = state[0];
    let y = state[1];
    let f_x = f_state[2];
    let f_y = f_state[3]; 

    new Arrow(ctx, [x, y], [x+f_x*arrow_stretch, y+f_y*arrow_stretch], "white");
}


// builds the air mass visible on the canvas for the respective used forces
export class AirMass {
    ctx;
    pressure_field;
    state;
    bool_coriolis_force;
    bool_friction_force;
    arrow_stretch;

    draw = this.draw.bind(this);

    constructor(ctx, pressure_field, state, force_params) {
        this.ctx = ctx;
        this.pressure_field = pressure_field;
        this.state = state;
        this.bool_coriolis_force = force_params[0];
        this.bool_friction_force = force_params[1];

        this.arrow_stretch = 12;

    }
    
    // draws the air mass
    draw() {
        let f_state_total = [];
        
        // draw air mass block
        this.air_mass = air_mass(this.ctx, this.state);
        
        // draw velocity arrow
        this.speed_arrow = speed_arrow(this.ctx, this.state, this.arrow_stretch);
        
        // draw pgf arrow and add pressure gradient to total force
        let f_state_pgf = this.pressure_field.get_pgf(this.state);
        this.pgf_arrow = pgf_arrow(this.ctx, this.state, f_state_pgf, this.arrow_stretch);
        for (let i = 0; i < 4; i += 1) {
            f_state_total[i] = f_state_pgf[i];
        }
        
        // if coriolis force is turned on: draw coriolis arrow and add coriolis force to the total one
        if (this.bool_coriolis_force) {
            let f_state_coriolis = this.pressure_field.get_coriolis_force(this.state);
            this.coriolis_arrow = coriolis_arrow(this.ctx, this.state, f_state_coriolis, this.arrow_stretch);
            for (let i = 0; i < 4; i += 1) {
                f_state_total[i] += f_state_coriolis[i];
            }
    
        }

        // if coriolis force is turned on: draw coriolis arrow and add friction force to the total one
        if (this.bool_friction_force) {
            let f_state_friction = this.pressure_field.get_friction_force(this.state);
            this.friction_arrow = friction_arrow(this.ctx, this.state, f_state_friction, this.arrow_stretch);
            for (let i = 0; i < 4; i += 1) {
                f_state_total[i] += f_state_friction[i];
            }
        }

        // draw total force arrow
        this.total_arrow = total_arrow(this.ctx, this.state, f_state_total, this.arrow_stretch);
    }
}