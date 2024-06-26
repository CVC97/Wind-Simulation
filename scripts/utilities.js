// ++++++++++ UTILITY FUNCTIONS AND DEFINITIONS ++++++++++


// global functions to transform calculation coordinates (center (0, 0), x-range [-8, 8], y-width [-5, 5])
export function x2c(x) {
    return 100*(x+8);
}

export function y2c(y) {
    return 100*(-y+5);
}


// global functions to calculate canvas coordinates to calculation coordinates
export function c2x(cx) {
    return cx / 100 - 8;
}

export function c2y(cy) {
    return -cy / 100 + 5;
}


// calculates slider outputs to animation parameters
export function s2ystretch(s_ystretch) {
    return 10**(s_ystretch/10);
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
    return 0.025*10**(s_dt/10);
}