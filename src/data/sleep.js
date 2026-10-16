/**
 * Numbers for the PPG sleep-staging figures, copied from the project's code
 * repository (github.com/SammamMahdi/Sleep-Detection). They come from its
 * evaluation logs and XAI exports, not from the papers' tables.
 */

// Top global feature importances per model (Code/Explainable AI/model_importances.csv).
// Scales differ between models (SVM uses a different importance measure), so the
// figure normalises each model to its own maximum.
export const IMPORTANCE = {
  RF: [["AVpw", 0.169], ["meanT1", 0.148], ["HFD_statistical", 0.128], ["HFD", 0.126], ["meanA1", 0.122], ["stdA1", 0.115]],
  XGB: [["AVpw", 0.312], ["HjorthComplexity_statistical", 0.119], ["meanT1", 0.114], ["maxValue_statistical", 0.105], ["stdIPTR", 0.105], ["shapeFactor_statistical", 0.094]],
  CatBoost: [["stdA1", 0.188], ["RMSSDppAmp", 0.159], ["HjorthComplexity", 0.157], ["meanT2", 0.155], ["stdIPAR", 0.15], ["HjorthComplexity_statistical", 0.139]],
  SVM: [["stdA1", 0.6], ["RMSSDppAmp", 0.427], ["SDSDppAmp", 0.377], ["SDppAmp", 0.375], ["SDSDpw", 0.338], ["stdT1", 0.324]],
};

// Short descriptions of the PPG features named above (base names; "_statistical"
// variants are the same quantity computed over the epoch's statistical summary).
export const GLOSS = {
  AVpw: "mean pulse width",
  SDpw: "pulse-width SD",
  SDSDpw: "SD of successive pulse-width differences",
  meanT1: "mean systolic time",
  meanT2: "mean diastolic time",
  stdT1: "systolic-time SD",
  meanA1: "mean systolic area",
  stdA1: "systolic-area SD",
  stdIPAR: "inflection-point area ratio SD",
  stdIPTR: "inflection-point time ratio SD",
  RMSSDppAmp: "RMSSD of peak amplitude",
  SDppAmp: "peak-amplitude SD",
  SDSDppAmp: "SD of successive amplitude differences",
  HFD: "Higuchi fractal dimension",
  HjorthComplexity: "Hjorth complexity",
  maxValue: "epoch maximum",
  shapeFactor: "waveform shape factor",
};

// 4-class accuracy on held-out data (Code/Approach 1|2 model evaluation.txt).
export const ACCURACY = {
  "approach 1": [["XGBoost", 74.8], ["CatBoost", 74.34], ["Random Forest", 72.5]],
  "approach 2": [["Random Forest", 73.42], ["CatBoost", 73.31], ["XGBoost", 73.17]],
};
