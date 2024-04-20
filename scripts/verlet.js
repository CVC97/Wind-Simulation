// ++++++++++ INTEGRATION AND FRAME STEPS ++++++++++


// Verlet integrator depending on the integration requests (coriolis / friction)
export class Verlet {
    bool_coriolis_force;
    bool_friction_force;
    pressure_field;
    delta_t;

    step = this.step.bind(this);

    constructor(pressure_field, force_params, delta_t) {
        this.bool_coriolis_force = force_params[0];
        this.bool_friction_force = force_params[1];
        this.pressure_field = pressure_field;
        this.delta_t = delta_t;
    }

    step(state_array) {
        let a1_pgf = this.pressure_field.get_pgf(state_array);
        if (this.bool_coriolis_force) {
            let a1_coriolis_force = this.pressure_field.get_coriolis_force(state_array); 
            for (let i = 0; i < 4; i += 1) {
                a1_pgf[i] += a1_coriolis_force[i];
            }
        }  
        if (this.bool_friction_force) {
            let a1_friction_force = this.pressure_field.get_friction_force(state_array);
            for (let i = 0; i < 4; i += 1) {
                a1_pgf[i] += a1_friction_force[i];
            }   
        }
        state_array[0] += a1_pgf[0]*this.delta_t + a1_pgf[2]*this.delta_t**2/2;
        state_array[1] += a1_pgf[1]*this.delta_t + a1_pgf[3]*this.delta_t**2/2; 
        let a2_pgf = this.pressure_field.get_pgf(state_array);
        if (this.bool_coriolis_force) {
            let a2_coriolis_force = this.pressure_field.get_coriolis_force(state_array); 
            for (let i = 0; i < 4; i += 1) {
                a2_pgf[i] += a2_coriolis_force[i];
            }
        }  
        if (this.bool_friction_force) {
            let a2_friction_force = this.pressure_field.get_friction_force(state_array);
            for (let i = 0; i < 4; i += 1) {
                a2_pgf[i] += a2_friction_force[i];
            }   
        }
        state_array[2] += (a1_pgf[2] + a2_pgf[2]) * this.delta_t/2;
        state_array[3] += (a1_pgf[3] + a2_pgf[3]) * this.delta_t/2;
        return state_array;
    }
}