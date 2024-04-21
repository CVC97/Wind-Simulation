// ++++++++++ UTILITY FUNCTIONS AND DEFINITIONS ++++++++++


// global functions to transform calculation coordinates (center (0, 0), x-range [-8, 8], y-width [-5, 5])
export function x2c(x) {
    return 50*(x+8);
}

export function y2c(y) {
    return 50*(-y+5);
}


// calculates slider outputs to animation parameters
export function s2ystretch(s_ystretch) {
    return 10**(s_ystretch/10);
    // return 1;
}


export function s2rho(s_rho) {
    return 0.003*10**(s_rho/10);
}

export function s2omega(s_omega) {
    return 0.25*10**(s_omega/10);
}

export function s2gamma(s_gamma) {
    return 0.3*10**(s_gamma/10);
}

export function s2dt(s_dt) {
    return 0.025*10**(s_dt/20);
}