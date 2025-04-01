export const listName = 'test';

export const defaultRating = 1150;
export const hcMax = 147;
export const beta = 1 / 1400;
export const K_0 = 20; // usually =32 but Norges Biljardforbund/cuescore uses 20 for some reason...
export const robustnessCoeff = 0.05; // coefficient for updating robustness (0.05 => 14 for med; 37 for high)
export const robustMedium = 0.5; // threshold for having "medium" robustness
export const robustHigh = 0.85;
export const defaultRounding = 5;
//export const KfactorFrameCoeff = 1.15; // feel free to experiment...
//export const KfactorMatchCoeff = 1; // feel free to experiment...

export const ratingNormFactor = 400;
/* // not used anymore as of feb2025
export const gammaMatch = 1/2; // gamma is the exponent (of the totalFrames) in the exponent in the equation for K-factor
export const gammaFrame = 1/3;
export const mNull = 0.5; // offset of exponent in the equation for K-factor: introduced to fix the overinflation of matches with only one frame
*/
const gamma = 32/20;
export const c_URS_match = 1;
export const c_URS_frame = gamma;
export const c_D_bestOf = 1;
export const c_D_justFrames = 0.8;
export const K_alpha_match = gamma/10;
export const K_alpha_frame = Math.sqrt(gamma)/10;
export const K_beta_match = 4*gamma/100;
export const K_beta_frame = -2*gamma/100;
export const K_epsilon_match = Math.pow(1/(4*gamma), 2);
export const K_epsilon_frame = Math.pow(0.5, 2);