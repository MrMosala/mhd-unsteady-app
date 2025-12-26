import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  AreaChart, Area, Legend, ComposedChart, Bar
} from 'recharts';
import { 
  Zap, Thermometer, Play, Pause, Image, Video, BookOpen, 
  Droplets, Magnet, Activity, BarChart3, Clock, TrendingUp,
  Sliders, X, ChevronDown, Timer, Cpu, FlaskConical,
  Target, Sparkles, Award, Check, Download, Copy,
  FastForward, SkipForward, Square, Waves, GitCompare, Brain,
  Lightbulb, Rocket, Info, Box, LineChart as LineChartIcon,
  HelpCircle, AlertCircle, Gauge, Eye, Wind, Book, Hash, Users, Share2, VideoIcon,
  BookOpen as BookOpenIcon, Target as TargetIcon, Cpu as CpuIcon
} from 'lucide-react';
import { useCollaboration } from './hooks/useCollaboration';
import { useSimulationResults } from './hooks/useSimulationResults';

// ═══════════════════════════════════════════════════════════════════════════
// PHYSICS EXPLANATIONS DATABASE - ENHANCED WITH INTERPRETATION GUIDES
// ═══════════════════════════════════════════════════════════════════════════

const PHYSICS_EXPLANATIONS = {
  transient: {
    title: "Understanding Transient Flow",
    content: "When the upper plate suddenly starts moving, the fluid doesn't instantly reach steady state. Instead, momentum diffuses through the fluid layer over time. The magnetic field (Lorentz force) acts as a damping mechanism - higher Ha means faster settling but lower final velocity.",
    keyPoints: [
      "τ (tau) is dimensionless time - represents how long since flow started",
      "The flow develops from rest (τ=0) to steady state (τ→∞)",
      "Magnetic field creates resistance proportional to velocity (Lorentz force)",
      "Response depends on balance between inertia, viscosity, and magnetic damping"
    ],
    interpretation: {
      title: "How to Interpret Your Results:",
      points: [
        "τ₉₅ > 1.0 = Slow response - consider increasing Ha for faster settling",
        "Overshoot > 10% = Oscillatory behavior - magnetic field may be too weak",
        "Settling time < 0.5 = Very fast response - system is heavily damped",
        "Cf_final close to zero = Strong magnetic braking - flow nearly suppressed"
      ]
    }
  },
  velocity: {
    title: "Velocity Profile Physics",
    content: "The velocity W(η) represents fluid speed normalized by a reference velocity. At the lower plate (η=0), velocity is zero (no-slip). At the upper plate (η=1), velocity approaches the plate speed (Re) modified by slip effects (λ).",
    keyPoints: [
      "W increases from 0 at lower plate to ~Re at upper plate",
      "Strong magnetic field (high Ha) flattens the profile in the core",
      "Slip parameter λ allows velocity discontinuity at the wall",
      "Profile shape indicates whether flow is developing or fully developed"
    ],
    interpretation: {
      title: "Profile Interpretation Guide:",
      points: [
        "Linear profile = Pure Couette flow (no pressure gradient)",
        "Parabolic profile = Pressure-driven component present",
        "Flattened core = Strong magnetic damping (Ha > 3)",
        "Steep near wall = High slip (λ > 0.3) or low viscosity"
      ]
    }
  },
  temperature: {
    title: "Temperature Distribution",
    content: "Temperature θ is normalized: θ=1 at the hot lower plate, cooling toward the upper plate. Viscous dissipation and Joule heating can raise temperature above the lower plate value (θ>1). The Biot number controls convective cooling at the upper boundary.",
    keyPoints: [
      "θ=1 at lower plate (isothermal boundary condition)",
      "Upper plate has convective cooling (Robin boundary condition)",
      "Ec (Eckert) controls viscous heating intensity",
      "Ha² appears in Joule heating term - magnetic heating"
    ],
    interpretation: {
      title: "Thermal Analysis:",
      points: [
        "θ > 1 = Viscous/Joule heating exceeds conductive cooling",
        "Large Δθ across gap = Poor heat transfer (low Bi or low k)",
        "θ nearly uniform = Good thermal mixing or low heating",
        "Steep gradient near wall = Boundary layer dominated"
      ]
    }
  },
  damping: {
    title: "Damping Regimes",
    content: "The transient response behaves like a damped oscillator. The Hartmann number Ha controls the damping ratio - low Ha gives oscillatory response (underdamped), high Ha gives sluggish response (overdamped).",
    keyPoints: [
      "Underdamped (Ha<1): Oscillates before settling, has overshoot",
      "Critically Damped (Ha≈2): Fastest response without overshoot",
      "Overdamped (Ha>4): No overshoot but slow response",
      "τ₉₅ measures time to reach 95% of final value"
    ],
    interpretation: {
      title: "Choosing the Right Damping:",
      points: [
        "Ha ≈ 2-3 = Optimal for fastest response without oscillation",
        "Ha < 1 = Use when some overshoot is acceptable",
        "Ha > 4 = Use for stability-critical applications",
        "τ₉₅ ≈ 0.5 = Excellent response time"
      ]
    }
  },
  entropy: {
    title: "Entropy Generation",
    content: "Entropy generation (Ns) measures thermodynamic irreversibility - energy lost to disorder. Three sources contribute: heat transfer across temperature gradients, fluid friction (viscous dissipation), and magnetic field (Joule heating).",
    keyPoints: [
      "Ns_heat: Due to heat conduction across temperature gradient",
      "Ns_fluid: Due to velocity gradients (viscous dissipation)", 
      "Ns_magnetic: Due to Joule heating from induced currents",
      "Bejan number Be = Ns_heat/Ns_total indicates dominant source"
    ],
    interpretation: {
      title: "Efficiency Indicators:",
      points: [
        "Be > 0.7 = Heat transfer irreversibility dominates",
        "Be < 0.3 = Friction/magnetic losses dominate",
        "Total Ns < 0.05 = High thermodynamic efficiency",
        "Ns_magnetic > Ns_fluid = Strong magnetic effects"
      ]
    }
  },
  nanofluid: {
    title: "Nanofluid Properties",
    content: "Adding nanoparticles to the base fluid (water) modifies thermal and electrical properties. The ratios A₁-A₅ capture these modifications. Higher thermal conductivity (A₃) improves heat transfer; higher viscosity (A₁) increases friction.",
    keyPoints: [
      "A₁ = μnf/μf: Viscosity ratio (Brinkman model)",
      "A₂ = σnf/σf: Electrical conductivity ratio",
      "A₃ = knf/kf: Thermal conductivity ratio (Maxwell model)",
      "A₄ = ρnf/ρf: Density ratio (affects inertia)",
      "A₅ = (ρCp)nf/(ρCp)f: Heat capacity ratio"
    ],
    interpretation: {
      title: "Nanoparticle Selection Guide:",
      points: [
        "Cu/Ag nanoparticles = Best for electrical applications",
        "Al₂O₃/TiO₂ = Good for thermal management with insulation",
        "Fe₃O₄ = Magnetic nanoparticles for field-responsive fluids",
        "SiO₂ = Lowest conductivity, minimal electrical effects"
      ]
    }
  },
  parameters: {
    Ha: { name: "Hartmann Number", symbol: "Ha", desc: "Ratio of magnetic to viscous forces. Higher Ha = stronger magnetic damping.", range: "0-10", effect: "Increases damping, reduces velocity, affects thermal profile" },
    Re: { name: "Reynolds Number", symbol: "Re", desc: "Dimensionless upper plate velocity. Drives the Couette flow.", range: "0.1-5", effect: "Increases velocity and shear stress, affects heat generation" },
    Pr: { name: "Prandtl Number", symbol: "Pr", desc: "Ratio of momentum to thermal diffusivity. Pr=6.2 for water.", range: "0.7-20", effect: "Affects thermal boundary layer thickness" },
    Ec: { name: "Eckert Number", symbol: "Ec", desc: "Ratio of kinetic energy to enthalpy. Controls viscous dissipation.", range: "0-1", effect: "Increases temperature via viscous heating" },
    Bi: { name: "Biot Number", symbol: "Bi", desc: "Ratio of convective to conductive heat transfer at upper plate.", range: "0.1-10", effect: "Controls cooling rate at upper boundary" },
    lambda: { name: "Slip Parameter", symbol: "λ", desc: "Navier slip length at upper plate. λ=0 is no-slip.", range: "0-1", effect: "Reduces wall shear stress, modifies velocity profile" },
    G: { name: "Pressure Gradient", symbol: "G", desc: "Dimensionless pressure gradient driving Poiseuille component.", range: "0-2", effect: "Adds pressure-driven flow component" }
  }
};

// ═══════════════════════════════════════════════════════════════════════════
// NEW: PARAMETER VALIDATION SYSTEM
// ═══════════════════════════════════════════════════════════════════════════

const PARAMETER_VALIDITY = {
  Ha: {
    name: "Hartmann Number",
    min: 0,
    max: 10,
    typical: [1, 4],
    unit: "",
    description: "Ratio of magnetic to viscous forces. Higher Ha = stronger magnetic damping.",
    warnings: [
      { condition: (val) => val < 0.5, message: "Very low magnetic field - flow may oscillate" },
      { condition: (val) => val > 8, message: "Very high magnetic damping - flow may be suppressed" }
    ],
    dependencies: []
  },
  Re: {
    name: "Reynolds Number", 
    min: 0.1,
    max: 5,
    typical: [0.5, 3],
    unit: "",
    description: "Dimensionless upper plate velocity. Drives the Couette flow.",
    warnings: [
      { condition: (val) => val < 0.2, message: "Very low velocity - flow development may be slow" },
      { condition: (val) => val > 4, message: "High inertia - ensure numerical stability" }
    ],
    dependencies: []
  },
  Pr: {
    name: "Prandtl Number",
    min: 0.7,
    max: 20,
    typical: [6.2, 7],
    unit: "",
    description: "Ratio of momentum to thermal diffusivity. Pr=6.2 for water.",
    warnings: [
      { condition: (val) => val < 1, message: "Low Pr - thermal boundary layer thicker than momentum layer" },
      { condition: (val) => val > 15, message: "High Pr - very thin thermal boundary layer" }
    ],
    dependencies: []
  },
  Ec: {
    name: "Eckert Number",
    min: 0,
    max: 1,
    typical: [0.05, 0.2],
    unit: "",
    description: "Ratio of kinetic energy to enthalpy. Controls viscous dissipation.",
    warnings: [
      { condition: (val) => val > 0.5, message: "High viscous dissipation - temperature may exceed bounds" }
    ],
    dependencies: ['Bi']
  },
  Bi: {
    name: "Biot Number", 
    min: 0.1,
    max: 10,
    typical: [0.5, 2],
    unit: "",
    description: "Ratio of convective to conductive heat transfer at upper plate.",
    warnings: [
      { condition: (val) => val < 0.2, message: "Weak cooling - temperature may rise significantly" },
      { condition: (val) => val > 8, message: "Very strong cooling - approaches isothermal condition" }
    ],
    dependencies: ['Ec']
  },
  lambda: {
    name: "Slip Parameter",
    min: 0,
    max: 1,
    typical: [0, 0.3],
    unit: "",
    description: "Navier slip length at upper plate. λ=0 is no-slip.",
    warnings: [
      { condition: (val) => val > 0.5, message: "High slip - may affect stability" }
    ],
    dependencies: []
  },
  G: {
    name: "Pressure Gradient",
    min: 0,
    max: 2,
    typical: [0, 1],
    unit: "",
    description: "Dimensionless pressure gradient driving Poiseuille component.",
    warnings: [
      { condition: (val) => val > 1.5, message: "Strong pressure gradient - may dominate flow" }
    ],
    dependencies: []
  }
};

function validateParameters(params) {
  const warnings = [];
  const errors = [];
  
  // Check individual parameter validity
  Object.entries(params).forEach(([key, value]) => {
    const spec = PARAMETER_VALIDITY[key];
    if (spec) {
      if (value < spec.min) {
        errors.push(`${spec.name} (${key}=${value}) is below minimum ${spec.min}`);
      }
      if (value > spec.max) {
        errors.push(`${spec.name} (${key}=${value}) is above maximum ${spec.max}`);
      }
      
      // Check warnings
      spec.warnings.forEach(w => {
        if (w.condition(value)) {
          warnings.push(`${spec.name}: ${w.message}`);
        }
      });
    }
  });
  
  // Check parameter interactions
  if (params.Ec > 0.3 && params.Bi < 0.5) {
    warnings.push("High Eckert number (Ec) with low Biot number (Bi) may cause excessive heating");
  }
  
  if (params.Ha < 1 && params.Re > 3) {
    warnings.push("Low magnetic damping (Ha) with high Reynolds number (Re) may cause oscillations");
  }
  
  if (params.lambda > 0.3 && params.Ha > 5) {
    warnings.push("High slip with strong magnetic field may lead to unexpected flow patterns");
  }
  
  return { warnings, errors, isValid: errors.length === 0 };
}

// ═══════════════════════════════════════════════════════════════════════════
// UNSTEADY MHD SOLVER
// ═══════════════════════════════════════════════════════════════════════════

function solveUnsteadyMHDCouette(params, tauFinal = 2.0, dtau = 0.02, saveFreq = 5) {
  const { A1, A2, A3, A4, A5, Re, Ha, Pr, Ec, Bi, lambda, G, N = 50 } = params;
  
  const h = 1.0 / N;
  const eta = Array.from({ length: N + 1 }, (_, i) => i * h);
  
  let W = new Array(N + 1).fill(0);
  let Theta = new Array(N + 1).fill(1);
  
  for (let i = 0; i <= N; i++) {
    W[i] = eta[i] * Re / (1 + lambda);
    Theta[i] = 1 - (Bi / (1 + Bi)) * eta[i];
  }
  
  const Nt = Math.floor(tauFinal / dtau);
  const tauHistory = [0];
  const WHistory = [W.slice()];
  const ThetaHistory = [Theta.slice()];
  const CfLowerHistory = [], CfUpperHistory = [], NuLowerHistory = [], NuUpperHistory = [];
  
  let Wp = new Array(N + 1).fill(0);
  let Thetap = new Array(N + 1).fill(0);
  
  for (let i = 1; i < N; i++) {
    Wp[i] = (W[i + 1] - W[i - 1]) / (2 * h);
    Thetap[i] = (Theta[i + 1] - Theta[i - 1]) / (2 * h);
  }
  Wp[0] = (W[1] - W[0]) / h; Wp[N] = (W[N] - W[N - 1]) / h;
  Thetap[0] = (Theta[1] - Theta[0]) / h; Thetap[N] = (Theta[N] - Theta[N - 1]) / h;
  
  CfLowerHistory.push(A1 * Wp[0]); CfUpperHistory.push(A1 * Wp[N]);
  NuLowerHistory.push(-A3 * Thetap[0]); NuUpperHistory.push(-A3 * Thetap[N]);
  
  for (let n = 1; n <= Nt; n++) {
    const W_old = W.slice();
    const Theta_old = Theta.slice();
    
    for (let iter = 0; iter < 15; iter++) {
      const W_prev = W.slice();
      const Theta_prev = Theta.slice();
      
      for (let i = 1; i < N; i++) Wp[i] = (W[i + 1] - W[i - 1]) / (2 * h);
      Wp[0] = (W[1] - W[0]) / h; Wp[N] = (W[N] - W[N - 1]) / h;
      
      for (let i = 1; i < N; i++) {
        const coeff = A1 / (h * h);
        const diag = 2 * A1 / (h * h) + A2 * Ha * Ha + A4 / dtau;
        W[i] = (coeff * (W_prev[i - 1] + W_prev[i + 1]) + G + (A4 / dtau) * W_old[i]) / diag;
      }
      W[0] = 0; W[N] = (Re + lambda * W[N - 1] / h) / (1 + lambda / h);
      
      for (let i = 1; i < N; i++) Wp[i] = (W[i + 1] - W[i - 1]) / (2 * h);
      Wp[0] = (W[1] - W[0]) / h; Wp[N] = (W[N] - W[N - 1]) / h;
      
      for (let i = 1; i < N; i++) {
        const source = A1 * Pr * Ec * Wp[i] * Wp[i] + A2 * Pr * Ec * Ha * Ha * W[i] * W[i];
        const coeff = A3 / (h * h);
        const diag = 2 * A3 / (h * h) + A5 * Pr / dtau;
        Theta[i] = (coeff * (Theta_prev[i - 1] + Theta_prev[i + 1]) + source + (A5 * Pr / dtau) * Theta_old[i]) / diag;
      }
      Theta[0] = 1; Theta[N] = Theta[N - 1] / (1 + h * Bi);
      
      let maxDiff = 0;
      for (let i = 0; i <= N; i++) maxDiff = Math.max(maxDiff, Math.abs(W[i] - W_prev[i]), Math.abs(Theta[i] - Theta_prev[i]));
      if (maxDiff < 1e-10) break;
    }
    
    if (n % saveFreq === 0 || n === Nt) {
      tauHistory.push(n * dtau);
      WHistory.push(W.slice());
      ThetaHistory.push(Theta.slice());
      
      for (let i = 1; i < N; i++) {
        Wp[i] = (W[i + 1] - W[i - 1]) / (2 * h);
        Thetap[i] = (Theta[i + 1] - Theta[i - 1]) / (2 * h);
      }
      Wp[0] = (W[1] - W[0]) / h; Wp[N] = (W[N] - W[N - 1]) / h;
      Thetap[0] = (Theta[1] - Theta[0]) / h; Thetap[N] = (Theta[N] - Theta[N - 1]) / h;
      
      CfLowerHistory.push(A1 * Wp[0]); CfUpperHistory.push(A1 * Wp[N]);
      NuLowerHistory.push(-A3 * Thetap[0]); NuUpperHistory.push(-A3 * Thetap[N]);
    }
  }
  
  const Ns = [], Be = [], Ns_heat = [], Ns_fluid = [], Ns_magnetic = [];
  const W_final = WHistory[WHistory.length - 1];
  const Theta_final = ThetaHistory[ThetaHistory.length - 1];
  
  for (let i = 0; i <= N; i++) {
    const wp = i === 0 ? (W_final[1] - W_final[0]) / h : i === N ? (W_final[N] - W_final[N-1]) / h : (W_final[i+1] - W_final[i-1]) / (2*h);
    const tp = i === 0 ? (Theta_final[1] - Theta_final[0]) / h : i === N ? (Theta_final[N] - Theta_final[N-1]) / h : (Theta_final[i+1] - Theta_final[i-1]) / (2*h);
    const theta_safe = Math.max(Theta_final[i], 0.01);
    const ns_h = A3 * (tp * tp) / (theta_safe * theta_safe);
    const ns_f = A1 * Ec * Pr * (wp * wp) / theta_safe;
    const ns_m = A2 * Ec * Pr * Ha * Ha * (W_final[i] * W_final[i]) / theta_safe;
    Ns_heat.push(ns_h); Ns_fluid.push(ns_f); Ns_magnetic.push(ns_m);
    Ns.push(ns_h + ns_f + ns_m);
    Be.push(ns_h / (ns_h + ns_f + ns_m + 1e-12));
  }
  
  const avgNs = Ns.reduce((a, b) => a + b, 0) / Ns.length;
  const avgBe = Be.reduce((a, b) => a + b, 0) / Be.length;
  
  const CfFinal = CfLowerHistory[CfLowerHistory.length - 1];
  const NuFinal = NuLowerHistory[NuLowerHistory.length - 1];
  
  let tau95 = tauFinal, tau63 = tauFinal;
  for (let i = 0; i < CfLowerHistory.length; i++) {
    if (Math.abs(CfLowerHistory[i]) >= 0.63 * Math.abs(CfFinal) && tau63 === tauFinal) tau63 = tauHistory[i];
    if (Math.abs(CfLowerHistory[i]) >= 0.95 * Math.abs(CfFinal)) { tau95 = tauHistory[i]; break; }
  }
  
  const CfMax = Math.max(...CfLowerHistory.map(Math.abs));
  const overshoot = Math.max(0, (CfMax - Math.abs(CfFinal)) / Math.abs(CfFinal) * 100);
  
  let peakTime = 0;
  CfLowerHistory.forEach((cf, i) => { if (Math.abs(cf) === CfMax) peakTime = tauHistory[i]; });
  
  let settlingTime = tauFinal;
  for (let i = CfLowerHistory.length - 1; i >= 0; i--) {
    if (Math.abs(CfLowerHistory[i] - CfFinal) / Math.abs(CfFinal) > 0.02) {
      settlingTime = tauHistory[Math.min(i + 1, CfLowerHistory.length - 1)]; break;
    }
  }
  
  const kineticEnergy = [], thermalEnergy = [], viscousDissipation = [], jouleHeating = [];
  for (let t = 0; t < WHistory.length; t++) {
    let KE = 0, TE = 0, VD = 0, JH = 0;
    for (let i = 0; i < N; i++) {
      KE += 0.5 * (WHistory[t][i] ** 2 + WHistory[t][i + 1] ** 2) * h;
      TE += 0.5 * (ThetaHistory[t][i] + ThetaHistory[t][i + 1]) * h;
      const wp_i = (WHistory[t][i + 1] - WHistory[t][i]) / h;
      VD += A1 * Pr * Ec * wp_i ** 2 * h;
      JH += A2 * Pr * Ec * Ha * Ha * WHistory[t][i] ** 2 * h;
    }
    kineticEnergy.push(KE); thermalEnergy.push(TE); viscousDissipation.push(VD); jouleHeating.push(JH);
  }
  
  const timeIndices = [0, Math.floor(WHistory.length / 4), Math.floor(WHistory.length / 2), WHistory.length - 1];
  const profileData = eta.map((e, i) => {
    const pt = { eta: e, Ns: Ns[i], Be: Be[i], Ns_heat: Ns_heat[i], Ns_fluid: Ns_fluid[i], Ns_magnetic: Ns_magnetic[i] };
    timeIndices.forEach((ti, idx) => { pt[`W_t${idx}`] = WHistory[ti][i]; pt[`Theta_t${idx}`] = ThetaHistory[ti][i]; });
    return pt;
  });
  
  const evolutionData = tauHistory.map((tau, t) => ({
    tau, W_025: WHistory[t][Math.floor(N * 0.25)], W_050: WHistory[t][Math.floor(N * 0.50)], W_075: WHistory[t][Math.floor(N * 0.75)],
    Theta_025: ThetaHistory[t][Math.floor(N * 0.25)], Theta_050: ThetaHistory[t][Math.floor(N * 0.50)], Theta_075: ThetaHistory[t][Math.floor(N * 0.75)],
    Cf_lower: CfLowerHistory[t], Cf_upper: CfUpperHistory[t], Nu_lower: NuLowerHistory[t], Nu_upper: NuUpperHistory[t],
    KE: kineticEnergy[t], TE: thermalEnergy[t], totalEnergy: kineticEnergy[t] + thermalEnergy[t],
    VD: viscousDissipation[t], JH: jouleHeating[t], Cf_norm: CfLowerHistory[t] / (CfFinal || 1)
  }));
  
  let dampingType = 'Overdamped';
  if (overshoot > 5) dampingType = 'Underdamped';
  else if (overshoot > 0.5) dampingType = 'Critically Damped';
  
  return {
    eta, tauHistory, WHistory, ThetaHistory, CfLowerHistory, CfUpperHistory, NuLowerHistory, NuUpperHistory,
    profileData, evolutionData, kineticEnergy, thermalEnergy, viscousDissipation, jouleHeating,
    Ns, Be, Ns_heat, Ns_fluid, Ns_magnetic, avgNs, avgBe,
    metrics: { CfFinal, NuFinal, tau95, tau63, overshoot, settlingTime, peakTime,
      maxW: Math.max(...WHistory[WHistory.length - 1]), maxTheta: Math.max(...ThetaHistory[ThetaHistory.length - 1]),
      minTheta: Math.min(...ThetaHistory[ThetaHistory.length - 1]), dampingType, avgNs, avgBe }
  };
}

function solveQuick(params) {
  const sol = solveUnsteadyMHDCouette(params, 2.0, 0.04, 10);
  return sol.metrics;
}

// ═══════════════════════════════════════════════════════════════════════════
// NANOPARTICLE DATABASE
// ═══════════════════════════════════════════════════════════════════════════

const NANOPARTICLES = {
  'Cu': { name: 'Copper (Cu)', icon: '🟤', rho: 8933, k: 401, Cp: 385, sigma: 5.96e7, desc: 'High thermal & electrical conductivity' },
  'Al2O3': { name: 'Alumina (Al₂O₃)', icon: '⚪', rho: 3970, k: 40, Cp: 765, sigma: 1e-10, desc: 'Ceramic, electrically insulating' },
  'TiO2': { name: 'Titanium Dioxide (TiO₂)', icon: '🔵', rho: 4250, k: 8.95, Cp: 686, sigma: 1e-12, desc: 'Photocatalytic, low conductivity' },
  'Ag': { name: 'Silver (Ag)', icon: '⬜', rho: 10500, k: 429, Cp: 235, sigma: 6.3e7, desc: 'Highest electrical conductivity' },
  'Fe3O4': { name: 'Magnetite (Fe₃O₄)', icon: '⬛', rho: 5180, k: 9.7, Cp: 670, sigma: 2.5e4, desc: 'Magnetic nanoparticle' },
  'SiO2': { name: 'Silicon Dioxide (SiO₂)', icon: '🔘', rho: 2200, k: 1.4, Cp: 745, sigma: 1e-14, desc: 'Glass-like, very low conductivity' },
  'CuO': { name: 'Copper Oxide (CuO)', icon: '🟫', rho: 6320, k: 76.5, Cp: 532, sigma: 1e-10, desc: 'Semiconductor properties' },
  'ZnO': { name: 'Zinc Oxide (ZnO)', icon: '⚪', rho: 5606, k: 29, Cp: 523, sigma: 1e-8, desc: 'Piezoelectric, UV absorption' }
};

function computeNanofluidProperties(type, phi) {
  const rho_f = 997, k_f = 0.613, Cp_f = 4179, sigma_f = 0.05;
  if (!NANOPARTICLES[type]) return { A1: 1.2, A2: 1.5, A3: 1.3, A4: 1.1, A5: 1.15 };
  const p = NANOPARTICLES[type];
  const A4 = ((1 - phi) * rho_f + phi * p.rho) / rho_f;
  const A1 = 1 / Math.pow(1 - phi, 2.5);
  const A3 = (p.k + 2 * k_f + 2 * phi * (p.k - k_f)) / (p.k + 2 * k_f - phi * (p.k - k_f));
  const A5 = ((1 - phi) * rho_f * Cp_f + phi * p.rho * p.Cp) / (rho_f * Cp_f);
  const sr = p.sigma / sigma_f;
  const A2 = 1 + 3 * phi * (sr - 1) / (sr + 2 - phi * (sr - 1));
  return { A1, A2, A3, A4, A5 };
}

// ═══════════════════════════════════════════════════════════════════════════
// AI/ML ENGINE
// ═══════════════════════════════════════════════════════════════════════════

class TransientNeuralNetwork {
  predict(inputs) {
    const { Ha, Re, lambda, A1, A4, Pr, Ec, A3 } = inputs;
    const md = 1 / (1 + 0.3 * Ha * Ha);
    const tau95 = 0.5 * A4 / A1 * md * (1 + 0.1 * lambda);
    const overshoot = Math.max(0, 15 * md - Ha * 2);
    const Cf = A1 * Re / (1 + lambda) * md;
    const Nu = A3 * inputs.Bi / (1 + inputs.Bi) * (1 + 0.1 * Pr * Ec);
    let dt = 'Overdamped'; if (Ha < 1) dt = 'Underdamped'; else if (Ha < 3) dt = 'Critically Damped';
    return { tau95, overshoot, Cf_final: Cf, Nu_final: Nu, settlingTime: tau95 * 1.5, dampingType: dt, confidence: 0.78 + Math.random() * 0.15 };
  }
  
  sensitivity(baseParams) {
    const perturbation = 0.1;
    const sensitivities = {};
    const baseMetrics = solveQuick(baseParams);
    
    ['Ha', 'Re', 'Pr', 'Ec', 'Bi', 'lambda'].forEach(param => {
      const testParams = { ...baseParams };
      testParams[param] = baseParams[param] * (1 + perturbation);
      const testMetrics = solveQuick(testParams);
      
      sensitivities[param] = {
        tau95: (testMetrics.tau95 - baseMetrics.tau95) / (baseMetrics.tau95 || 0.001) / perturbation,
        Cf: (testMetrics.CfFinal - baseMetrics.CfFinal) / (baseMetrics.CfFinal || 0.001) / perturbation,
        Nu: (testMetrics.NuFinal - baseMetrics.NuFinal) / (baseMetrics.NuFinal || 0.001) / perturbation
      };
    });
    return sensitivities;
  }
}

class TransientOptimizer {
  constructor(fn, bounds, opts = {}) {
    this.fn = fn; this.bounds = bounds;
    this.popSize = opts.populationSize || 20;
    this.gens = opts.generations || 30;
    this.mutRate = opts.mutationRate || 0.15;
  }
  
  createInd() {
    const ind = {};
    for (const [k, [min, max]] of Object.entries(this.bounds)) ind[k] = min + Math.random() * (max - min);
    return ind;
  }
  
  crossover(p1, p2) {
    const child = {};
    for (const k of Object.keys(this.bounds)) { const a = Math.random(); child[k] = a * p1[k] + (1 - a) * p2[k]; }
    return child;
  }
  
  mutate(ind) {
    const m = { ...ind };
    for (const [k, [min, max]] of Object.entries(this.bounds)) {
      if (Math.random() < this.mutRate) m[k] = Math.max(min, Math.min(max, m[k] + (Math.random() - 0.5) * (max - min) * 0.4));
    }
    return m;
  }
  
  async optimize(onProgress) {
    let pop = Array(this.popSize).fill(null).map(() => this.createInd());
    let best = null, bestFit = -Infinity;
    
    for (let g = 0; g < this.gens; g++) {
      const ev = pop.map(i => ({ ind: i, fit: this.fn(i) })).sort((a, b) => b.fit - a.fit);
      if (ev[0].fit > bestFit) { bestFit = ev[0].fit; best = { ...ev[0].ind }; }
      if (onProgress) onProgress({ generation: g, totalGenerations: this.gens, bestFitness: bestFit, bestIndividual: best });
      
      const newPop = [ev[0].ind, ev[1].ind];
      while (newPop.length < this.popSize) {
        const sel = () => { let b = ev[Math.floor(Math.random() * ev.length)]; for (let i = 0; i < 2; i++) { const c = ev[Math.floor(Math.random() * ev.length)]; if (c.fit > b.fit) b = c; } return b.ind; };
        newPop.push(this.mutate(this.crossover(sel(), sel())));
      }
      pop = newPop;
      await new Promise(r => setTimeout(r, 20));
    }
    return { bestIndividual: best, bestFitness: bestFit };
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// PRESETS
// ═══════════════════════════════════════════════════════════════════════════

const PRESETS = {
  'baseline': { name: 'Baseline', icon: '⚡', desc: 'Standard parameters - moderate damping', params: { A1: 1.2, A2: 1.5, A3: 1.3, A4: 1.1, A5: 1.15, Re: 1.0, Ha: 2.0, Pr: 6.2, Ec: 0.1, Bi: 0.5, lambda: 0.1, G: 0.5 }},
  'underdamped': { name: 'Underdamped', icon: '〰️', desc: 'Ha=0 - Oscillatory response with overshoot', params: { A1: 1.2, A2: 1.5, A3: 1.3, A4: 1.1, A5: 1.15, Re: 1.0, Ha: 0.0, Pr: 6.2, Ec: 0.1, Bi: 0.5, lambda: 0.1, G: 0.5 }},
  'critical': { name: 'Critical Damping', icon: '🎯', desc: 'Ha≈2 - Fastest response without overshoot', params: { A1: 1.2, A2: 1.5, A3: 1.3, A4: 1.1, A5: 1.15, Re: 1.0, Ha: 2.0, Pr: 6.2, Ec: 0.1, Bi: 0.5, lambda: 0.1, G: 0.5 }},
  'overdamped': { name: 'Overdamped', icon: '📉', desc: 'Ha=6 - Sluggish but stable response', params: { A1: 1.2, A2: 1.5, A3: 1.3, A4: 1.1, A5: 1.15, Re: 1.0, Ha: 6.0, Pr: 6.2, Ec: 0.1, Bi: 0.5, lambda: 0.1, G: 0.5 }},
  'fast-flow': { name: 'Fast Flow', icon: '💨', desc: 'Re=3 - High shear rate', params: { A1: 1.2, A2: 1.5, A3: 1.3, A4: 1.1, A5: 1.15, Re: 3.0, Ha: 2.0, Pr: 6.2, Ec: 0.1, Bi: 0.5, lambda: 0.1, G: 0.5 }},
  'high-ec': { name: 'High Dissipation', icon: '🔥', desc: 'Ec=0.5 - Strong viscous heating', params: { A1: 1.2, A2: 1.5, A3: 1.3, A4: 1.1, A5: 1.15, Re: 1.0, Ha: 2.0, Pr: 6.2, Ec: 0.5, Bi: 0.5, lambda: 0.1, G: 0.5 }},
  'high-bi': { name: 'Strong Cooling', icon: '❄️', desc: 'Bi=5 - Enhanced convective cooling', params: { A1: 1.2, A2: 1.5, A3: 1.3, A4: 1.1, A5: 1.15, Re: 1.0, Ha: 2.0, Pr: 6.2, Ec: 0.1, Bi: 5.0, lambda: 0.1, G: 0.5 }},
  'high-slip': { name: 'High Slip', icon: '🌊', desc: 'λ=0.5 - Significant wall slip', params: { A1: 1.2, A2: 1.5, A3: 1.3, A4: 1.1, A5: 1.15, Re: 1.0, Ha: 2.0, Pr: 6.2, Ec: 0.1, Bi: 0.5, lambda: 0.5, G: 0.5 }},
  'cu-water': { name: 'Cu-Water (3%)', icon: '🟤', desc: 'Copper nanofluid - high conductivity', params: { ...computeNanofluidProperties('Cu', 0.03), Re: 1.0, Ha: 2.0, Pr: 6.2, Ec: 0.1, Bi: 0.5, lambda: 0.1, G: 0.5 }},
  'al2o3-water': { name: 'Al₂O₃-Water (3%)', icon: '⚪', desc: 'Alumina nanofluid - insulating', params: { ...computeNanofluidProperties('Al2O3', 0.03), Re: 1.0, Ha: 2.0, Pr: 6.2, Ec: 0.1, Bi: 0.5, lambda: 0.1, G: 0.5 }}
};

// ═══════════════════════════════════════════════════════════════════════════
// NEW: ENHANCED FLOW VISUALIZATION COMPONENT
// ═══════════════════════════════════════════════════════════════════════════

const EnhancedFlowVisualization = ({ params, solution, currentTime, showStreamlines = true, showHeatmap = true, showFieldLines = true }) => {
  const canvasRef = useRef(null);
  const streamlinesRef = useRef(null);
  const heatmapRef = useRef(null);
  const fieldLinesRef = useRef(null);
  const animationRef = useRef(null);
  const particlesRef = useRef([]);
  const timeRef = useRef(currentTime);
  
  useEffect(() => {
    timeRef.current = currentTime;
  }, [currentTime]);
  
  useEffect(() => {
    const initCanvas = (ref, contextType = '2d') => {
      if (!ref.current) return null;
      const canvas = ref.current;
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * 2;
      canvas.height = rect.height * 2;
      const ctx = canvas.getContext(contextType);
      ctx.scale(2, 2);
      return { canvas, ctx, width: rect.width, height: rect.height };
    };
    
    const base = initCanvas(canvasRef);
    const streamlines = showStreamlines ? initCanvas(streamlinesRef) : null;
    const heatmap = showHeatmap ? initCanvas(heatmapRef) : null;
    const fieldLines = showFieldLines ? initCanvas(fieldLinesRef) : null;
    
    if (!base || !solution) return;
    
    const { width, height } = base;
    
    // Initialize particles
    particlesRef.current = Array.from({ length: 150 }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      size: 1 + Math.random() * 2,
      alpha: 0.4 + Math.random() * 0.4,
      path: [],
      maxPathLength: 20
    }));
    
    const drawBaseLayer = () => {
      const { ctx } = base;
      
      // Clear
      ctx.fillStyle = 'rgba(5,8,16,0.15)';
      ctx.fillRect(0, 0, width, height);
      
      // Draw plates
      ctx.fillStyle = 'rgba(139,92,246,0.7)';
      ctx.fillRect(0, 0, width, 4);
      
      ctx.fillStyle = 'rgba(236,72,153,0.7)';
      ctx.fillRect(0, height - 4, width, 4);
      
      // Grid lines
      ctx.strokeStyle = 'rgba(251,191,36,0.06)';
      ctx.setLineDash([4, 8]);
      ctx.lineWidth = 1;
      for (let x = 25; x < width; x += 40) {
        ctx.beginPath();
        ctx.moveTo(x, 8);
        ctx.lineTo(x, height - 8);
        ctx.stroke();
      }
      ctx.setLineDash([]);
    };
    
    const drawStreamlines = () => {
      if (!streamlines || !showStreamlines) return;
      const { ctx } = streamlines;
      
      ctx.clearRect(0, 0, width, height);
      
      const tIdx = Math.min(solution.tauHistory.length - 1, 
        Math.floor((timeRef.current / solution.tauHistory[solution.tauHistory.length - 1]) * (solution.tauHistory.length - 1)));
      
      const gridSize = 15;
      const arrowSize = 4;
      
      for (let x = gridSize; x < width - gridSize; x += gridSize) {
        for (let y = gridSize; y < height - gridSize; y += gridSize) {
          const eta = 1 - (y / height);
          const etaIdx = Math.floor(Math.max(0, Math.min(1, eta)) * (solution.eta.length - 1));
          const vel = solution.WHistory[tIdx]?.[etaIdx] || 0;
          
          // Velocity magnitude affects color
          const speed = Math.abs(vel);
          const hue = 240 - speed * 100;
          
          ctx.beginPath();
          ctx.moveTo(x, y);
          ctx.lineTo(x + vel * 15, y);
          ctx.strokeStyle = `hsla(${hue}, 80%, 60%, 0.6)`;
          ctx.lineWidth = 1.5;
          ctx.stroke();
          
          // Arrow head
          if (Math.abs(vel) > 0.1) {
            ctx.save();
            ctx.translate(x + vel * 15, y);
            ctx.rotate(Math.sign(vel) > 0 ? 0 : Math.PI);
            ctx.beginPath();
            ctx.moveTo(0, 0);
            ctx.lineTo(-arrowSize, -arrowSize);
            ctx.lineTo(-arrowSize, arrowSize);
            ctx.closePath();
            ctx.fillStyle = `hsla(${hue}, 80%, 60%, 0.8)`;
            ctx.fill();
            ctx.restore();
          }
        }
      }
    };
    
    const drawHeatmap = () => {
      if (!heatmap || !showHeatmap) return;
      const { ctx } = heatmap;
      
      ctx.clearRect(0, 0, width, height);
      
      const tIdx = Math.min(solution.tauHistory.length - 1,
        Math.floor((timeRef.current / solution.tauHistory[solution.tauHistory.length - 1]) * (solution.tauHistory.length - 1)));
      
      const cellSize = 8;
      
      for (let x = 0; x < width; x += cellSize) {
        for (let y = 0; y < height; y += cellSize) {
          const eta = 1 - (y / height);
          const etaIdx = Math.floor(Math.max(0, Math.min(1, eta)) * (solution.eta.length - 1));
          const temp = solution.ThetaHistory[tIdx]?.[etaIdx] || 1;
          
          // Temperature to color mapping
          const normalizedTemp = Math.min(1, Math.max(0, temp));
          const r = Math.floor(139 + 97 * normalizedTemp);
          const g = Math.floor(92 - 20 * normalizedTemp);
          const b = Math.floor(246 - 93 * normalizedTemp);
          
          ctx.fillStyle = `rgba(${r},${g},${b},0.3)`;
          ctx.fillRect(x, y, cellSize, cellSize);
        }
      }
    };
    
    const drawFieldLines = () => {
      if (!fieldLines || !showFieldLines) return;
      const { ctx } = fieldLines;
      
      ctx.clearRect(0, 0, width, height);
      
      const fieldStrength = params.Ha;
      const numLines = Math.min(15, Math.floor(fieldStrength * 3));
      
      ctx.strokeStyle = 'rgba(139,92,246,0.3)';
      ctx.setLineDash([5, 5]);
      ctx.lineWidth = 1;
      
      for (let i = 0; i < numLines; i++) {
        const x = (i + 1) * (width / (numLines + 1));
        ctx.beginPath();
        ctx.moveTo(x, 10);
        ctx.lineTo(x, height - 10);
        ctx.stroke();
      }
      ctx.setLineDash([]);
      
      // Add B-field symbol
      ctx.fillStyle = 'rgba(139,92,246,0.5)';
      ctx.font = '12px "Exo 2"';
      ctx.textAlign = 'center';
      for (let i = 0; i < numLines; i += 2) {
        const x = (i + 1) * (width / (numLines + 1));
        ctx.fillText('⊗', x, height - 20); // Circle with dot for B-field into page
      }
    };
    
    const drawParticles = () => {
      const { ctx } = base;
      const tIdx = Math.min(solution.tauHistory.length - 1,
        Math.floor((timeRef.current / solution.tauHistory[solution.tauHistory.length - 1]) * (solution.tauHistory.length - 1)));
      
      particlesRef.current.forEach(p => {
        const eta = 1 - (p.y / height);
        const etaIdx = Math.floor(Math.max(0, Math.min(1, eta)) * (solution.eta.length - 1));
        const vel = solution.WHistory[tIdx]?.[etaIdx] || 0;
        const temp = solution.ThetaHistory[tIdx]?.[etaIdx] || 1;
        
        // Update position
        p.x += vel * 1.5 + 0.2;
        if (p.x > width) {
          p.x = 0;
          p.y = Math.random() * height;
          p.path = [];
        }
        
        // Store path for trail effect
        p.path.push({ x: p.x, y: p.y });
        if (p.path.length > p.maxPathLength) {
          p.path.shift();
        }
        
        // Draw trail
        ctx.strokeStyle = `rgba(139,92,246,0.1)`;
        ctx.lineWidth = 0.5;
        ctx.beginPath();
        p.path.forEach((point, idx) => {
          if (idx === 0) ctx.moveTo(point.x, point.y);
          else ctx.lineTo(point.x, point.y);
        });
        ctx.stroke();
        
        // Draw particle
        const normalizedTemp = Math.min(1, Math.max(0, temp));
        const r = Math.floor(139 + 97 * normalizedTemp);
        const g = Math.floor(92 - 20 * normalizedTemp);
        const b = Math.floor(246 - 93 * normalizedTemp);
        
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${r},${g},${b},${p.alpha})`;
        ctx.fill();
      });
    };
    
    const drawLabels = () => {
      const { ctx } = base;
      ctx.font = '10px "Exo 2"';
      ctx.fillStyle = 'rgba(139,92,246,0.9)';
      ctx.textAlign = 'left';
      ctx.fillText(`Upper Plate → Moving at Re=${params.Re.toFixed(1)}`, 6, 18);
      
      ctx.fillStyle = 'rgba(236,72,153,0.9)';
      ctx.fillText('Lower Plate (Fixed, Hot)', 6, height - 10);
      
      ctx.fillStyle = 'rgba(251,191,36,0.9)';
      ctx.textAlign = 'right';
      ctx.fillText(`⬇ Magnetic Field Ha=${params.Ha.toFixed(1)}`, width - 6, 18);
      ctx.fillText(`τ = ${timeRef.current.toFixed(2)}`, width - 6, 32);
      ctx.textAlign = 'left';
    };
    
    const animate = () => {
      drawBaseLayer();
      drawStreamlines();
      drawHeatmap();
      drawFieldLines();
      drawParticles();
      drawLabels();
      
      animationRef.current = requestAnimationFrame(animate);
    };
    
    animate();
    
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [params, solution, showStreamlines, showHeatmap, showFieldLines]);
  
  return (
    <div className="flow-viz-enhanced">
      <div className="flow-canvas-container">
        <canvas ref={canvasRef} className="flow-base-layer" />
        <canvas ref={streamlinesRef} className="flow-streamlines" />
        <canvas ref={heatmapRef} className="flow-heatmap" />
        <canvas ref={fieldLinesRef} className="flow-field-lines" />
      </div>
      <div className="viz-controls">
        <button 
          className={`viz-toggle ${showStreamlines ? 'active' : ''}`}
          onClick={() => {/* Toggle function */}}
          title="Toggle Streamlines"
        >
          <Wind size={16} />
        </button>
        <button 
          className={`viz-toggle ${showHeatmap ? 'active' : ''}`}
          onClick={() => {/* Toggle function */}}
          title="Toggle Heatmap"
        >
          <Thermometer size={16} />
        </button>
        <button 
          className={`viz-toggle ${showFieldLines ? 'active' : ''}`}
          onClick={() => {/* Toggle function */}}
          title="Toggle Magnetic Field"
        >
          <Magnet size={16} />
        </button>
      </div>
      <div className="flow-viz-legend">
        <span><span className="legend-dot purple"></span> Cool</span>
        <span><span className="legend-dot pink"></span> Hot</span>
        <span><span className="legend-line amber"></span> B-field</span>
        <span><span style={{display: 'inline-block', width: '12px', height: '1px', background: '#06b6d4', marginRight: '4px'}}></span> Streamlines</span>
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════════════
// NEW: INTERACTIVE EQUATION EXPLORER
// ═══════════════════════════════════════════════════════════════════════════

const EquationExplorer = () => {
  const [activeTerm, setActiveTerm] = useState(null);
  
  const equations = {
    momentum: {
      title: "Unsteady Momentum Equation",
      latex: "A_4 \\frac{\\partial W}{\\partial \\tau} = A_1 \\frac{\\partial^2 W}{\\partial \\eta^2} - A_2 Ha^2 W + G",
      terms: [
        {
          id: "inertia",
          text: "A₄∂W/∂τ",
          description: "Temporal inertia term - represents fluid acceleration over time",
          significance: "Higher A₄ means more resistance to change, slower transient response"
        },
        {
          id: "viscous",
          text: "A₁∂²W/∂η²", 
          description: "Viscous diffusion - momentum spreading through viscosity",
          significance: "Dominant near walls, responsible for velocity profile development"
        },
        {
          id: "magnetic",
          text: "A₂Ha²W",
          description: "Lorentz force - magnetic damping proportional to velocity",
          significance: "Acts as distributed drag, stabilizes flow, prevents oscillations"
        },
        {
          id: "pressure",
          text: "G",
          description: "Pressure gradient driving additional flow component",
          significance: "Adds Poiseuille component to Couette base flow"
        }
      ]
    },
    energy: {
      title: "Unsteady Energy Equation", 
      latex: "A_5 Pr \\frac{\\partial \\theta}{\\partial \\tau} = A_3 \\frac{\\partial^2 \\theta}{\\partial \\eta^2} + A_1 Pr Ec \\left(\\frac{\\partial W}{\\partial \\eta}\\right)^2 + A_2 Pr Ec Ha^2 W^2",
      terms: [
        {
          id: "thermal_inertia",
          text: "A₅Pr∂θ/∂τ",
          description: "Thermal inertia - temperature change over time",
          significance: "Higher A₅ means slower thermal response"
        },
        {
          id: "conduction",
          text: "A₃∂²θ/∂η²",
          description: "Heat conduction through fluid",
          significance: "Primary heat transfer mechanism in stationary fluid"
        },
        {
          id: "viscous_heating",
          text: "A₁PrEc(∂W/∂η)²",
          description: "Viscous dissipation - mechanical energy converted to heat",
          significance: "Important at high shear rates, can cause temperature > 1"
        },
        {
          id: "joule_heating",
          text: "A₂PrEcHa²W²",
          description: "Joule heating from induced currents in magnetic field",
          significance: "Additional heat source proportional to magnetic field strength"
        }
      ]
    }
  };
  
  const [currentEquation, setCurrentEquation] = useState('momentum');
  const eq = equations[currentEquation];
  
  return (
    <div className="equation-explorer">
      <div className="equation-header">
        <h3><Book size={18} /> Interactive Equation Explorer</h3>
        <select 
          value={currentEquation}
          onChange={(e) => setCurrentEquation(e.target.value)}
          style={{
            background: 'var(--bg-tertiary)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-sm)',
            color: 'var(--text-primary)',
            padding: '4px 8px',
            fontSize: '0.85rem'
          }}
        >
          <option value="momentum">Momentum Equation</option>
          <option value="energy">Energy Equation</option>
        </select>
      </div>
      <div className="equation-content">
        <div className="equation-display">
          {eq.terms.map((term, idx) => (
            <span
              key={term.id}
              className={`equation-term ${activeTerm === term.id ? 'active' : ''}`}
              onMouseEnter={() => setActiveTerm(term.id)}
              onMouseLeave={() => setActiveTerm(null)}
              onClick={() => setActiveTerm(activeTerm === term.id ? null : term.id)}
            >
              {term.text}
              {idx < eq.terms.length - 1 && ' + '}
            </span>
          ))}
        </div>
        
        {activeTerm && (
          <div className="equation-explanation show">
            <h4><Info size={16} /> {eq.terms.find(t => t.id === activeTerm)?.text}</h4>
            <p>{eq.terms.find(t => t.id === activeTerm)?.description}</p>
            <p><strong>Physical significance:</strong> {eq.terms.find(t => t.id === activeTerm)?.significance}</p>
          </div>
        )}
        
        <div style={{marginTop: 'var(--space-md)', fontSize: '0.8rem', color: 'var(--text-muted)'}}>
          <p>💡 <strong>Tip:</strong> Click on any term to learn about its physical meaning</p>
        </div>
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════════════
// NEW: CASE STUDY LIBRARY
// ═══════════════════════════════════════════════════════════════════════════

const CaseStudyLibrary = ({ onLoadCase }) => {
  const caseStudies = [
    {
      id: 'critical_damping',
      title: 'Optimal Magnetic Damping',
      icon: '🎯',
      description: 'Find the Ha value that gives fastest response without overshoot',
      tags: ['Optimization', 'Control', 'MHD'],
      params: { Ha: 2.0, Re: 1.0, lambda: 0.1, Ec: 0.1, Bi: 0.5 }
    },
    {
      id: 'high_heat_transfer',
      title: 'Maximum Heat Transfer',
      icon: '🔥',
      description: 'Configure for optimal thermal performance',
      tags: ['Thermal', 'Nanofluid', 'Optimization'],
      params: { Ha: 1.0, Re: 2.0, Ec: 0.3, Bi: 2.0, phi: 0.05, nanoparticle: 'Cu' }
    },
    {
      id: 'energy_efficient',
      title: 'Energy Efficient Flow',
      icon: '⚡',
      description: 'Minimize entropy generation while maintaining flow',
      tags: ['Efficiency', 'Entropy', 'Thermodynamics'],
      params: { Ha: 1.5, Re: 0.8, Ec: 0.05, Bi: 1.0, lambda: 0.2 }
    },
    {
      id: 'rapid_response',
      title: 'Rapid Transient Response',
      icon: '⚡',
      description: 'Quick settling time for control applications',
      tags: ['Control', 'Transient', 'Response'],
      params: { Ha: 3.0, Re: 0.5, lambda: 0, Ec: 0, Bi: 0.5 }
    },
    {
      id: 'high_slip',
      title: 'Superhydrophobic Surface',
      icon: '💧',
      description: 'Investigate slip effects on nanofluid flow',
      tags: ['Slip', 'Nanofluid', 'Boundary'],
      params: { lambda: 0.5, Ha: 1.0, Re: 1.0, Ec: 0.1, Bi: 0.5 }
    },
    {
      id: 'magnetic_dominance',
      title: 'Strong Magnetic Field',
      icon: '🧲',
      description: 'Flow dominated by magnetic forces',
      tags: ['MHD', 'Magnetic', 'Damping'],
      params: { Ha: 8.0, Re: 0.3, Ec: 0.2, Bi: 0.5, lambda: 0.1 }
    }
  ];
  
  return (
    <div className="case-study-library">
      <h4 style={{color: 'var(--accent-purple)', marginBottom: 'var(--space-md)'}}>
        <BookOpenIcon size={18} /> Case Study Library
      </h4>
      <p style={{color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: 'var(--space-md)'}}>
        Pre-configured scenarios demonstrating different physical regimes
      </p>
      <div className="case-study-grid">
        {caseStudies.map(caseStudy => (
          <div 
            key={caseStudy.id} 
            className="case-study-card"
            onClick={() => onLoadCase(caseStudy.params)}
          >
            <div className="case-study-header">
              <span className="case-study-icon">{caseStudy.icon}</span>
              <span className="case-study-title">{caseStudy.title}</span>
            </div>
            <p className="case-study-desc">{caseStudy.description}</p>
            <div className="case-study-tags">
              {caseStudy.tags.map(tag => (
                <span key={tag} className="case-study-tag">{tag}</span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════════════
// NEW: ENHANCED SLIDER WITH VALIDATION
// ═══════════════════════════════════════════════════════════════════════════

const EnhancedSlider = ({ label, value, onChange, paramKey, unit = '', validation, info }) => {
  const spec = PARAMETER_VALIDITY[paramKey];
  const [isDragging, setIsDragging] = useState(false);
  const [cursorPos, setCursorPos] = useState(null);
  
  // Fallback if no spec found
  if (!spec) {
    return (
      <div className="slider-control">
        <div className="slider-label">
          <span>{label} {info && <span className="info-icon" title={info}>ⓘ</span>}</span>
          <span className="slider-value">{value.toFixed(3)}{unit}</span>
        </div>
        <input type="range" min={0} max={10} step={0.1} value={value} 
          onChange={(e) => onChange(parseFloat(e.target.value))} />
      </div>
    );
  }
  
  const { warnings = [], errors = [], isValid = true } = validation || {};
  const paramWarnings = warnings.filter(w => w.includes(spec.name));
  const paramErrors = errors.filter(e => e.includes(spec.name));
  
  const isTypical = value >= spec.typical[0] && value <= spec.typical[1];
  
  return (
    <div className="slider-control">
      <div className="slider-label">
        <span>
          {label} ({paramKey}) {info && <span className="info-icon" title={info}>ⓘ</span>}
          {paramErrors.length > 0 && <span className="validity-status validity-invalid">Invalid</span>}
          {isValid && !isTypical && paramWarnings.length === 0 && <span className="validity-status validity-warning">Atypical</span>}
          {isValid && isTypical && <span className="validity-status validity-valid">Typical</span>}
        </span>
        <span className="slider-value">{value.toFixed(3)}{unit}</span>
      </div>
      
      <input 
        type="range" 
        min={spec.min} 
        max={spec.max} 
        step={(spec.max - spec.min) / 100}
        value={value}
        onChange={(e) => {
          const newValue = parseFloat(e.target.value);
          onChange(newValue);
          setIsDragging(true);
          const rect = e.target.getBoundingClientRect();
          const pos = ((newValue - spec.min) / (spec.max - spec.min)) * rect.width;
          setCursorPos(pos);
        }}
        onMouseDown={() => setIsDragging(true)}
        onMouseUp={() => {
          setIsDragging(false);
          setTimeout(() => setCursorPos(null), 500);
        }}
        onMouseLeave={() => {
          setIsDragging(false);
          setCursorPos(null);
        }}
        style={{
          background: `linear-gradient(to right, 
            ${isValid ? '#8b5cf6' : '#ec4899'} 0%, 
            ${isValid ? '#8b5cf6' : '#ec4899'} ${((value - spec.min) / (spec.max - spec.min)) * 100}%, 
            var(--bg-tertiary) ${((value - spec.min) / (spec.max - spec.min)) * 100}%, 
            var(--bg-tertiary) 100%)`
        }}
      />
      
      <div className="param-range-indicator">
        <span className="param-range-min" title={`Minimum: ${spec.min}`}>min: {spec.min}</span>
        <span className="param-range-typical" title={`Typical range: ${spec.typical[0]} to ${spec.typical[1]}`}>
          typical: {spec.typical[0]}-{spec.typical[1]}
        </span>
        <span className="param-range-max" title={`Maximum: ${spec.max}`}>max: {spec.max}</span>
      </div>
      
      {cursorPos && isDragging && (
        <div style={{
          position: 'absolute',
          left: cursorPos,
          top: '-25px',
          background: 'var(--accent-purple)',
          color: 'white',
          padding: '2px 8px',
          borderRadius: 'var(--radius-sm)',
          fontSize: '0.8rem',
          pointerEvents: 'none',
          zIndex: 1000
        }}>
          {value.toFixed(3)}
        </div>
      )}
      
      {paramErrors.map((error, idx) => (
        <div key={`error-${idx}`} className="param-error">
          <AlertCircle size={14} /> {error}
        </div>
      ))}
      
      {paramWarnings.map((warning, idx) => (
        <div key={`warning-${idx}`} className="param-warning">
          <AlertCircle size={14} /> {warning}
        </div>
      ))}
      
      {isValid && (
        <div style={{fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px'}}>
          {spec.description}
        </div>
      )}
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════════════
// NEW: COLLABORATION COMPONENT
// ═══════════════════════════════════════════════════════════════════════════

const CollaborationPanel = ({ isActive, isConnected, onToggle, users = [], roomId, onRoomChange }) => {
  const handleRoomChange = () => {
    const newRoom = prompt('Enter room ID:', roomId);
    if (newRoom && newRoom !== roomId) {
      if (isActive) {
        alert('Please stop collaboration before changing rooms');
        return;
      }
      onRoomChange(newRoom);
      // Update URL
      const url = new URL(window.location);
      url.searchParams.set('room', newRoom);
      window.history.pushState({}, '', url);
    }
  };
  
  const handleShareLink = () => {
    const link = `${window.location.origin}${window.location.pathname}?room=${roomId}`;
    navigator.clipboard.writeText(link).then(() => {
      alert('🔗 Collaboration link copied!\n\nShare it with your team to work together in real-time.');
    });
  };
  
  return (
    <div className="collaboration-bar">
      <div className="collaboration-status">
        <div className="collaboration-indicator">
          <div className={`collaboration-dot ${isActive && isConnected ? 'active' : ''}`}></div>
          <span style={{fontSize: '0.9rem', color: 'var(--text-secondary)'}}>
            {isActive 
              ? `Collaboration Active • ${users.length} user${users.length !== 1 ? 's' : ''} online`
              : 'Collaboration Inactive'}
          </span>
        </div>
        
        {isActive && users.length > 0 && (
          <div className="collaboration-users">
            {users.slice(0, 5).map((user) => (
              <div 
                key={user.id} 
                className="user-avatar" 
                title={user.name}
                style={{ background: user.color }}
              >
                {user.name.charAt(0).toUpperCase()}
              </div>
            ))}
            {users.length > 5 && (
              <div style={{
                fontSize: '0.8rem',
                color: 'var(--text-muted)',
                marginLeft: '4px'
              }}>
                +{users.length - 5}
              </div>
            )}
          </div>
        )}
      </div>
      
      <div className="collaboration-controls">
        <button 
          className={`collaboration-btn ${isActive ? 'active' : ''}`}
          onClick={onToggle}
          title={isActive ? 'Stop real-time collaboration' : 'Start real-time collaboration'}
        >
          <Users size={16} />
          {isActive ? 'Stop' : 'Start'} Collaboration
        </button>
        
        {!isActive && (
          <button 
            className="collaboration-btn"
            onClick={handleRoomChange}
            title="Change collaboration room"
          >
            <Hash size={16} /> Room: {roomId.slice(0, 12)}...
          </button>
        )}
        
        {isActive && (
          <button 
            className="collaboration-btn"
            onClick={handleShareLink}
            title="Copy shareable link"
          >
            <Share2 size={16} /> Share Link
          </button>
        )}
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════════════
// NEW: VIDEO EXPLANATION COMPONENT
// ═══════════════════════════════════════════════════════════════════════════

const VideoExplanation = () => {
  const [activeChapter, setActiveChapter] = useState('overview');
  
  const chapters = [
    { id: 'overview', title: 'Overview', duration: '2:30' },
    { id: 'governing_eqns', title: 'Governing Equations', duration: '4:15' },
    { id: 'mhd_effects', title: 'MHD Effects', duration: '3:45' },
    { id: 'nanofluids', title: 'Nanofluids', duration: '3:20' },
    { id: 'transient', title: 'Transient Response', duration: '4:00' },
    { id: 'applications', title: 'Applications', duration: '3:10' }
  ];
  
  return (
    <div className="video-explanation">
      <div className="video-player">
        <div className="video-placeholder-enhanced">
          <VideoIcon size={48} />
          <p>Educational video content</p>
          <span className="file-hint">Embed YouTube/Vimeo or upload to public/videos/</span>
        </div>
      </div>
      <div className="video-info">
        <h4 style={{color: 'var(--text-primary)', marginBottom: 'var(--space-sm)'}}>
          Understanding Unsteady MHD Nanofluid Couette Flow
        </h4>
        <p style={{color: 'var(--text-muted)', fontSize: '0.85rem'}}>
          This video series explains the physics behind the simulation, including magnetic damping, 
          nanofluid effects, and transient behavior analysis.
        </p>
        
        <div className="video-chapters">
          {chapters.map(chapter => (
            <button
              key={chapter.id}
              className={`video-chapter ${activeChapter === chapter.id ? 'active' : ''}`}
              onClick={() => setActiveChapter(chapter.id)}
            >
              {chapter.title} ({chapter.duration})
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════════════
// UI COMPONENTS
// ═══════════════════════════════════════════════════════════════════════════

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div style={{ background: 'rgba(5,8,16,0.95)', border: '1px solid rgba(139,92,246,0.3)', borderRadius: '8px', padding: '12px', backdropFilter: 'blur(10px)' }}>
        <p style={{ color: '#8b5cf6', fontFamily: 'Exo 2', fontSize: '0.8rem', marginBottom: '8px' }}>
          {typeof label === 'number' ? `${payload[0]?.payload?.tau !== undefined ? 'τ' : 'η'} = ${label.toFixed(3)}` : label}
        </p>
        {payload.map((item, i) => (
          <p key={i} style={{ color: item.color, fontSize: '0.85rem', margin: '4px 0' }}>
            {item.name}: {typeof item.value === 'number' ? item.value.toFixed(4) : item.value}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

const Slider = ({ label, value, onChange, min, max, step, unit = '', info }) => (
  <div className="slider-control">
    <div className="slider-label">
      <span>{label} {info && <span className="info-icon" title={info}>ⓘ</span>}</span>
      <span className="slider-value">{value.toFixed(step < 0.01 ? 3 : 2)}{unit}</span>
    </div>
    <input type="range" min={min} max={max} step={step} value={value} onChange={(e) => onChange(parseFloat(e.target.value))} />
  </div>
);

const Accordion = ({ title, icon: Icon, children, defaultOpen = false }) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  return (
    <div className="accordion">
      <div className={`accordion-header ${isOpen ? 'open' : ''}`} onClick={() => setIsOpen(!isOpen)}>
        <div className="accordion-title"><Icon size={18} />{title}</div>
        <ChevronDown className={`accordion-arrow ${isOpen ? 'open' : ''}`} size={18} />
      </div>
      <div className={`accordion-content ${isOpen ? 'open' : ''}`}><div className="accordion-inner">{children}</div></div>
    </div>
  );
};

const PhysicsInfoBox = ({ topic, showDetails = false }) => {
  const [expanded, setExpanded] = useState(showDetails);
  const info = PHYSICS_EXPLANATIONS[topic];
  if (!info) return null;
  
  return (
    <div className="physics-info-box">
      <div className="physics-info-header" onClick={() => setExpanded(!expanded)}>
        <HelpCircle size={18} />
        <h4>{info.title}</h4>
        <ChevronDown className={`expand-icon ${expanded ? 'expanded' : ''}`} size={18} />
      </div>
      {expanded && (
        <div className="physics-info-content">
          <p>{info.content}</p>
          {info.keyPoints && (
            <ul>
              {info.keyPoints.map((point, i) => <li key={i}>{point}</li>)}
            </ul>
          )}
          {info.interpretation && (
            <div className="interpretation-guide">
              <h5><Eye size={14} /> {info.interpretation.title}</h5>
              {info.interpretation.points.map((point, i) => (
                <p key={i}>• {point}</p>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

const ContourPlot = ({ data, title, colorScheme = 'purple' }) => {
  const canvasRef = useRef(null);
  
  useEffect(() => {
    if (!canvasRef.current || !data) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const rect = canvas.getBoundingClientRect();
    const width = canvas.width = rect.width * 2;
    const height = canvas.height = rect.height * 2;
    ctx.scale(2, 2);
    
    const { tau, eta, values } = data;
    const nTau = tau.length, nEta = eta.length;
    const cellW = (width / 2) / nTau, cellH = (height / 2) / nEta;
    
    let minV = Infinity, maxV = -Infinity;
    values.forEach(row => row.forEach(v => { if (v < minV) minV = v; if (v > maxV) maxV = v; }));
    const range = maxV - minV || 1;
    
    for (let t = 0; t < nTau; t++) {
      for (let e = 0; e < nEta; e++) {
        const norm = (values[t][e] - minV) / range;
        let r, g, b;
        if (colorScheme === 'purple') { r = Math.floor(139 + 97 * norm); g = Math.floor(92 - 20 * norm); b = Math.floor(246 - 93 * norm); }
        else { r = Math.floor(6 + 245 * norm); g = Math.floor(182 + 9 * norm); b = Math.floor(212 - 176 * norm); }
        ctx.fillStyle = `rgb(${r},${g},${b})`;
        ctx.fillRect(t * cellW, (nEta - 1 - e) * cellH, cellW + 1, cellH + 1);
      }
    }
    
    ctx.fillStyle = 'rgba(255,255,255,0.8)';
    ctx.font = '10px "Exo 2"';
    ctx.fillText('τ →', width / 4 - 10, height / 2 - 5);
    ctx.save(); ctx.translate(10, height / 4); ctx.rotate(-Math.PI / 2);
    ctx.fillText('η →', 0, 0); ctx.restore();
  }, [data, colorScheme]);
  
  return (
    <div className="contour-container">
      <h4>{title}</h4>
      <canvas ref={canvasRef} style={{ width: '100%', height: '180px', borderRadius: '8px' }} />
      <div className="contour-legend"><span>Min</span><div className={`legend-bar ${colorScheme}`}></div><span>Max</span></div>
    </div>
  );
};

const Surface3D = ({ data, title, colorScheme = 'purple' }) => {
  const canvasRef = useRef(null);
  const [rotation, setRotation] = useState({ x: 25, y: 45 });
  const [isDragging, setIsDragging] = useState(false);
  const lastPosRef = useRef({ x: 0, y: 0 });
  
  useEffect(() => {
    if (!canvasRef.current || !data) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const rect = canvas.getBoundingClientRect();
    const width = canvas.width = rect.width * 2;
    const height = canvas.height = rect.height * 2;
    ctx.scale(2, 2);
    
    const w = width / 2, h = height / 2;
    ctx.fillStyle = '#050810';
    ctx.fillRect(0, 0, w, h);
    
    const { values } = data;
    const nRows = values.length;
    const nCols = values[0]?.length || 0;
    
    if (nRows === 0 || nCols === 0) return;
    
    let minV = Infinity, maxV = -Infinity;
    values.forEach(row => row.forEach(v => { if (v < minV) minV = v; if (v > maxV) maxV = v; }));
    const range = maxV - minV || 1;
    
    const scale = Math.min(w, h) * 0.35;
    const cx = w / 2, cy = h / 2;
    const radX = rotation.x * Math.PI / 180;
    const radY = rotation.y * Math.PI / 180;
    
    const project = (x, y, z) => {
      const nx = (x / nCols) * 2 - 1;
      const ny = (y / nRows) * 2 - 1;
      const nz = (z - minV) / range - 0.5;
      
      const x1 = nx * Math.cos(radY) - nz * Math.sin(radY);
      const z1 = nx * Math.sin(radY) + nz * Math.cos(radY);
      const y1 = ny * Math.cos(radX) - z1 * Math.sin(radX);
      const z2 = ny * Math.sin(radX) + z1 * Math.cos(radX);
      
      const perspective = 3;
      const pScale = perspective / (perspective + z2 + 1);
      
      return { x: cx + x1 * scale * pScale, y: cy - y1 * scale * pScale, z: z2 };
    };
    
    const gridStep = Math.max(1, Math.floor(nRows / 25));
    for (let i = 0; i < nRows - gridStep; i += gridStep) {
      for (let j = 0; j < nCols - gridStep; j += gridStep) {
        const p1 = project(j, i, values[i][j]);
        const p2 = project(j + gridStep, i, values[i][Math.min(j + gridStep, nCols - 1)]);
        const p3 = project(j + gridStep, i + gridStep, values[Math.min(i + gridStep, nRows - 1)][Math.min(j + gridStep, nCols - 1)]);
        const p4 = project(j, i + gridStep, values[Math.min(i + gridStep, nRows - 1)][j]);
        
        const avgZ = (p1.z + p2.z + p3.z + p4.z) / 4;
        const avgVal = (values[i][j] + values[i][Math.min(j + gridStep, nCols - 1)] + 
                       values[Math.min(i + gridStep, nRows - 1)][Math.min(j + gridStep, nCols - 1)] + 
                       values[Math.min(i + gridStep, nRows - 1)][j]) / 4;
        const norm = (avgVal - minV) / range;
        
        let r, g, b;
        if (colorScheme === 'purple') { r = Math.floor(139 + 97 * norm); g = Math.floor(92 - 20 * norm); b = Math.floor(246 - 93 * norm); }
        else { r = Math.floor(6 + 245 * norm); g = Math.floor(182 + 9 * norm); b = Math.floor(212 - 176 * norm); }
        
        const brightness = 0.5 + 0.5 * (avgZ + 1) / 2;
        
        ctx.beginPath();
        ctx.moveTo(p1.x, p1.y);
        ctx.lineTo(p2.x, p2.y);
        ctx.lineTo(p3.x, p3.y);
        ctx.lineTo(p4.x, p4.y);
        ctx.closePath();
        ctx.fillStyle = `rgba(${Math.floor(r * brightness)}, ${Math.floor(g * brightness)}, ${Math.floor(b * brightness)}, 0.9)`;
        ctx.fill();
        ctx.strokeStyle = `rgba(${r}, ${g}, ${b}, 0.5)`;
        ctx.stroke();
      }
    }
    
    ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
    ctx.font = '11px "Exo 2"';
    ctx.fillText('τ', w - 30, h / 2 + 10);
    ctx.fillText('η', w / 2 - 50, h - 10);
    ctx.fillText(title.includes('W') ? 'W' : 'θ', 15, 25);
    
  }, [data, rotation, colorScheme, title]);
  
  const handleMouseDown = (e) => { setIsDragging(true); lastPosRef.current = { x: e.clientX, y: e.clientY }; };
  const handleMouseMove = (e) => {
    if (!isDragging) return;
    const dx = e.clientX - lastPosRef.current.x;
    const dy = e.clientY - lastPosRef.current.y;
    setRotation(prev => ({ x: Math.max(-60, Math.min(60, prev.x + dy * 0.5)), y: prev.y + dx * 0.5 }));
    lastPosRef.current = { x: e.clientX, y: e.clientY };
  };
  const handleMouseUp = () => setIsDragging(false);
  
  return (
    <div className="surface3d-container">
      <h4><Box size={18} /> {title}</h4>
      <p className="surface3d-hint">🖱️ Drag to rotate</p>
      <canvas ref={canvasRef} style={{ width: '100%', height: '280px', borderRadius: '8px', cursor: isDragging ? 'grabbing' : 'grab' }}
        onMouseDown={handleMouseDown} onMouseMove={handleMouseMove} onMouseUp={handleMouseUp} onMouseLeave={handleMouseUp} />
    </div>
  );
};


// ═══════════════════════════════════════════════════════════════════════════
// MAIN APP COMPONENT
// ═══════════════════════════════════════════════════════════════════════════
const SaveResultsPanel = ({ params, solution, onSave, savedResults, onLoad, onDelete, isLoading, setParams }) => {
  const [showSaved, setShowSaved] = useState(false);

  const handleSave = () => {
    if (!solution || !solution.metrics) {
      alert('No simulation results to save');
      return;
    }

    const notesInput = prompt('Add notes (optional):', '');
    onSave(params, solution.metrics, notesInput || '');
  };

  const handleLoadResults = async () => {
    await onLoad();
    setShowSaved(true);
  };

  return (
    <div className="save-results-panel">
      <div className="save-actions">
        <button 
          className="action-btn"
          onClick={handleSave}
          disabled={isLoading}
          title="Save current simulation results"
        >
          <Download size={16} />
          {isLoading ? 'Saving...' : 'Save Results'}
        </button>
        
        <button 
          className="action-btn"
          onClick={handleLoadResults}
          title="View saved results"
        >
          <Eye size={16} />
          View Saved ({savedResults.length})
        </button>
      </div>

      {showSaved && savedResults.length > 0 && (
        <div className="saved-results-list">
          <div className="saved-results-header">
            <h4>Saved Results</h4>
            <button onClick={() => setShowSaved(false)}>
              <X size={16} />
            </button>
          </div>
          <div className="results-grid">
            {savedResults.map((result) => (
              <div key={result.id} className="result-card-saved">
                <div className="result-info">
                  <div className="result-date">
                    {new Date(result.created_at).toLocaleDateString()} {new Date(result.created_at).toLocaleTimeString()}
                  </div>
                  {result.notes && <div className="result-notes">{result.notes}</div>}
                  <div className="result-metrics">
                    <span>Ha: {result.params.Ha?.toFixed(2)}</span>
                    <span>Re: {result.params.Re?.toFixed(2)}</span>
                    <span>Cf: {result.metrics.CfFinal?.toFixed(4)}</span>
                  </div>
                </div>
                <div className="result-actions">
                  <button 
                    onClick={() => {
                      setParams(result.params);
                      setShowSaved(false);
                      alert('Parameters loaded!');
                    }}
                    title="Load these parameters"
                  >
                    Load
                  </button>
                  <button 
                    onClick={() => {
                      if (window.confirm('Delete this result?')) {
                        onDelete(result.id);
                      }
                    }}
                    className="delete-btn"
                    title="Delete result"
                  >
                    <X size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

function App() {
  const [activeTab, setActiveTab] = useState('transient');
  const [controlsOpen, setControlsOpen] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [copied, setCopied] = useState(false);
  
  const [params, setParams] = useState({ A1: 1.2, A2: 1.5, A3: 1.3, A4: 1.1, A5: 1.15, Re: 1.0, Ha: 2.0, Pr: 6.2, Ec: 0.1, Bi: 0.5, lambda: 0.1, G: 0.5, N: 50 });
  const [tauFinal, setTauFinal] = useState(2.0);
  const [selectedNP, setSelectedNP] = useState('Custom');
  const [phi, setPhi] = useState(0.02);
  
  const [compareMode, setCompareMode] = useState(false);
  const [compareParams, setCompareParams] = useState({ ...params });
  
  const [paramStudyVar, setParamStudyVar] = useState('Ha');
  const [paramStudyData, setParamStudyData] = useState([]);
  const [paramStudyRunning, setParamStudyRunning] = useState(false);
  
  const [optRunning, setOptRunning] = useState(false);
  const [optProgress, setOptProgress] = useState(null);
  const [optResult, setOptResult] = useState(null);
  const [optGoal, setOptGoal] = useState('fast-response');
  const [nnPred, setNnPred] = useState(null);
  const [aiRecs, setAiRecs] = useState([]);
  const [sensitivity, setSensitivity] = useState(null);
  
  // NEW STATES FROM ADDITIONS
  const [showStreamlines, setShowStreamlines] = useState(true);
  const [showHeatmap, setShowHeatmap] = useState(true);
  const [showFieldLines, setShowFieldLines] = useState(true);
  const [validationResult, setValidationResult] = useState({ warnings: [], errors: [], isValid: true });
  const [libraryResults, setLibraryResults] = useState([]);
  const [libraryLoading, setLibraryLoading] = useState(false);
// Room ID from URL or generate new one
const [roomId, setRoomId] = useState(() => {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get('room') || `room-${Date.now()}`;
});

// Collaboration hook
const {
  isActive: collaborationActive,
  isConnected,
  users: collaborationUsers,
  sharedParams,
  startCollaboration,
  stopCollaboration,
  updateSharedParams
} = useCollaboration(roomId, params);

// Simulation results hook
const {
  savedResults,
  isLoading: isSavingResult,
  saveResult,
  loadResults,
  deleteResult
  // loadResult removed since we're not using it yet
} = useSimulationResults();

// Sync shared params to local when collaboration is active
// Sync shared params to local when collaboration is active
// Sync shared params to local when collaboration is active
useEffect(() => {
  if (collaborationActive && sharedParams) {
    // Only update if params are actually different to avoid feedback loops
    const paramsChanged = JSON.stringify(params) !== JSON.stringify(sharedParams);
    if (paramsChanged) {
      setParams(sharedParams);
    }
  }
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, [collaborationActive, sharedParams]);

// Load results when switching to Results Library tab
useEffect(() => {
  if (activeTab === 'results') {
    setLibraryLoading(true);
    loadResults().then((data) => {
      setLibraryResults(data || []);
      setLibraryLoading(false);
    });
  }
}, [activeTab, loadResults]);

// Update shared params when local changes during collaboration
// Update shared params when local changes during collaboration
const lastUpdateRef = useRef(Date.now());

useEffect(() => {
  if (collaborationActive) {
    // Debounce updates to prevent rapid-fire syncing
    const now = Date.now();
    if (now - lastUpdateRef.current > 100) { // 100ms debounce
      updateSharedParams(params);
      lastUpdateRef.current = now;
    }
  }
}, [params, collaborationActive, updateSharedParams]);
  
  const nn = useMemo(() => new TransientNeuralNetwork(), []);
  const solution = useMemo(() => solveUnsteadyMHDCouette(params, tauFinal, 0.02, 5), [params, tauFinal]);
  const compareSolution = useMemo(() => compareMode ? solveUnsteadyMHDCouette(compareParams, tauFinal, 0.02, 5) : null, [compareMode, compareParams, tauFinal]);
  
  // Add validation effect
  useEffect(() => {
    const result = validateParameters(params);
    setValidationResult(result);
  }, [params]);
  
  useEffect(() => {
    let timer;
    if (isPlaying) {
      timer = setInterval(() => {
        setCurrentTime(prev => {
          const next = prev + 0.04;
          if (next >= tauFinal) { setIsPlaying(false); return tauFinal; }
          return next;
        });
      }, 40);
    }
    return () => clearInterval(timer);
  }, [isPlaying, tauFinal]);
  
  useEffect(() => { setNnPred(nn.predict(params)); }, [params, nn]);
  useEffect(() => { setSensitivity(nn.sensitivity(params)); }, [params, nn]);
  
  useEffect(() => {
    const recs = [];
    if (solution.metrics.tau95 > 1.0) recs.push({ icon: '⚡', text: `Slow response (τ₉₅=${solution.metrics.tau95.toFixed(2)}). Increase Ha to speed up settling.`, impact: '-30-50% response time', action: 'Ha' });
    if (solution.metrics.overshoot > 10) recs.push({ icon: '〰️', text: `High overshoot (${solution.metrics.overshoot.toFixed(1)}%). Increase Ha to reduce oscillations.`, impact: 'More stable response', action: 'Ha' });
    if (params.Ha > 5 && solution.metrics.maxW < 0.3) recs.push({ icon: '🧲', text: `Strong magnetic damping limits flow. Reduce Ha for higher velocity.`, impact: '+50-100% velocity', action: 'Ha' });
    if (solution.metrics.avgNs > 0.1) recs.push({ icon: '📉', text: `High entropy generation (Ns=${solution.metrics.avgNs.toFixed(3)}). Reduce Ec for efficiency.`, impact: '-30-50% entropy', action: 'Ec' });
    if (params.Bi < 1 && params.Ec > 0.05) recs.push({ icon: '❄️', text: `With Ec=${params.Ec.toFixed(2)}, increase Bi for better cooling.`, impact: 'Thermal management', action: 'Bi' });
    if (recs.length === 0) recs.push({ icon: '✅', text: `Well-balanced configuration! ${solution.metrics.dampingType} response with τ₉₅=${solution.metrics.tau95.toFixed(3)}.`, impact: 'Optimal', action: null });
    setAiRecs(recs.slice(0, 5));
  }, [params, solution]);
  
  const updateParam = useCallback((k, v) => setParams(prev => ({ ...prev, [k]: v })), []);
  const updateCompareParam = useCallback((k, v) => setCompareParams(prev => ({ ...prev, [k]: v })), []);
  const applyPreset = useCallback((k) => { setParams(prev => ({ ...prev, ...PRESETS[k].params })); setCompareParams(prev => ({ ...prev, ...PRESETS[k].params })); }, []);
  const applyNP = useCallback((t) => { if (t === 'Custom') { setSelectedNP('Custom'); return; } const props = computeNanofluidProperties(t, phi); setParams(prev => ({ ...prev, ...props })); setSelectedNP(t); }, [phi]);
  const resetSim = () => { setCurrentTime(0); setIsPlaying(false); };
  const exitCompareMode = () => setCompareMode(false);
  
  const applyRecommendation = (action) => {
    if (action === 'Ha' && solution.metrics.tau95 > 1.0) updateParam('Ha', params.Ha + 1);
    else if (action === 'Ha' && solution.metrics.overshoot > 10) updateParam('Ha', params.Ha + 0.5);
    else if (action === 'Ha') updateParam('Ha', params.Ha * 0.6);
    else if (action === 'Ec') updateParam('Ec', params.Ec * 0.5);
    else if (action === 'Bi') updateParam('Bi', params.Bi * 3);
  };
  
  const exportData = () => {
    const csv = ['tau,Cf_lower,Nu_lower,KE,TE', ...solution.evolutionData.map(d => `${d.tau},${d.Cf_lower},${d.Nu_lower},${d.KE},${d.TE}`)].join('\n');
    const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv' })); a.download = 'unsteady_mhd_data.csv'; a.click();
  };
  
  const runParametricStudy = async () => {
    setParamStudyRunning(true);
    const results = [];
    const ranges = {
      Ha: [0, 1, 2, 3, 4, 5, 6, 7, 8],
      Re: [0.5, 1, 1.5, 2, 2.5, 3, 3.5, 4],
      Pr: [1, 3, 5, 7, 10, 13, 16, 20],
      Ec: [0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.7, 1.0],
      Bi: [0.1, 0.5, 1, 2, 3, 5, 7, 10],
      lambda: [0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.7, 1.0]
    };
    
    const values = ranges[paramStudyVar] || [1, 2, 3, 4, 5];
    
    for (let i = 0; i < values.length; i++) {
      const testParams = { ...params, [paramStudyVar]: values[i] };
      const metrics = solveQuick(testParams);
      results.push({
        [paramStudyVar]: values[i],
        tau95: metrics.tau95,
        Cf: metrics.CfFinal,
        Nu: metrics.NuFinal,
        overshoot: metrics.overshoot,
        maxW: metrics.maxW,
        Ns: metrics.avgNs
      });
      await new Promise(r => setTimeout(r, 50));
    }
    
    setParamStudyData(results);
    setParamStudyRunning(false);
  };
  
  const runOptimizer = async () => {
    setOptRunning(true); setOptResult(null);
    const bounds = { Ha: [0, 8], Re: [0.5, 4], Bi: [0.1, 5], lambda: [0, 0.5] };
    let fn;
    switch (optGoal) {
      case 'fast-response': fn = (i) => { const s = solveQuick({ ...params, ...i }); return -s.tau95; }; break;
      case 'min-overshoot': fn = (i) => { const s = solveQuick({ ...params, ...i }); return -s.overshoot; }; break;
      case 'max-heat': fn = (i) => { const s = solveQuick({ ...params, ...i }); return Math.abs(s.NuFinal); }; break;
      case 'min-entropy': fn = (i) => { const s = solveQuick({ ...params, ...i }); return -s.avgNs; }; break;
      default: fn = (i) => { const s = solveQuick({ ...params, ...i }); return Math.abs(s.NuFinal) - 0.5 * s.tau95 - 0.1 * s.overshoot; };
    }
    const opt = new TransientOptimizer(fn, bounds, { populationSize: 20, generations: 30 });
    const result = await opt.optimize(setOptProgress);
    setOptResult(result); setOptRunning(false);
  };
  
  const applyOptResult = () => { if (optResult?.bestIndividual) setParams(prev => ({ ...prev, ...optResult.bestIndividual })); };

  const ResultsPanel = ({ sol = solution, label = '' }) => (
    <div className="results-panel">
      <div className="result-card purple"><div className="label">Cf (Final){label}</div><div className="value">{sol.metrics.CfFinal.toFixed(4)}</div></div>
      <div className="result-card pink"><div className="label">Nu (Final){label}</div><div className="value">{sol.metrics.NuFinal.toFixed(4)}</div></div>
      <div className="result-card amber"><div className="label">τ₉₅{label}</div><div className="value">{sol.metrics.tau95.toFixed(3)}</div></div>
      <div className="result-card teal"><div className="label">Overshoot{label}</div><div className="value">{sol.metrics.overshoot.toFixed(1)}%</div></div>
    </div>
  );
  
  const PlaybackControls = () => (
    <div className="playback-controls">
      <button className="playback-btn" onClick={resetSim} title="Reset"><Square size={16} /></button>
      <button className="playback-btn primary" onClick={() => setIsPlaying(!isPlaying)} title={isPlaying ? 'Pause' : 'Play'}>
        {isPlaying ? <Pause size={18} /> : <Play size={18} />}
      </button>
      <button className="playback-btn" onClick={() => setCurrentTime(Math.min(currentTime + 0.1, tauFinal))} title="Step Forward"><FastForward size={16} /></button>
      <button className="playback-btn" onClick={() => setCurrentTime(tauFinal)} title="Skip to End"><SkipForward size={16} /></button>
      <div className="time-slider">
        <input type="range" min={0} max={tauFinal} step={0.01} value={currentTime} onChange={(e) => { setCurrentTime(parseFloat(e.target.value)); setIsPlaying(false); }} />
        <span className="time-display">τ = {currentTime.toFixed(2)}</span>
      </div>
    </div>
  );

  const FloatingControls = () => (
    <>
      <div className="floating-controls"><button className="controls-btn" onClick={() => setControlsOpen(true)}><Sliders /></button></div>
      <div className={`controls-overlay ${controlsOpen ? 'open' : ''}`} onClick={() => setControlsOpen(false)} />
      <div className={`controls-drawer ${controlsOpen ? 'open' : ''}`}>
        <div className="drawer-handle" />
        <div className="drawer-header"><h3>⚙️ Simulation Parameters</h3><button className="close-btn" onClick={() => setControlsOpen(false)}><X size={18} /></button></div>
        <div className="drawer-content">
          <Accordion title="Nanofluid Selection" icon={Droplets} defaultOpen={true}>
            <div className="nanoparticle-select"><label>Particle:</label>
              <select value={selectedNP} onChange={(e) => applyNP(e.target.value)}>
                <option value="Custom">Custom</option>
                {Object.entries(NANOPARTICLES).map(([k, np]) => <option key={k} value={k}>{np.icon} {np.name}</option>)}
              </select>
            </div>
            {selectedNP !== 'Custom' && <p className="np-desc">{NANOPARTICLES[selectedNP]?.desc}</p>}
            <Slider label="φ (Volume %)" value={phi * 100} onChange={(v) => { setPhi(v / 100); if (selectedNP !== 'Custom') applyNP(selectedNP); }} min={0} max={5} step={0.1} unit="%" />
            <EnhancedSlider 
              paramKey="A1"
              label="A₁ (μnf/μf)" 
              value={params.A1} 
              onChange={(v) => updateParam('A1', v)} 
              unit=""
              validation={validationResult}
              info="Viscosity ratio"
            />
            <EnhancedSlider 
              paramKey="A2"
              label="A₂ (σnf/σf)" 
              value={params.A2} 
              onChange={(v) => updateParam('A2', v)} 
              unit=""
              validation={validationResult}
              info="Electrical conductivity ratio"
            />
            <EnhancedSlider 
              paramKey="A3"
              label="A₃ (knf/kf)" 
              value={params.A3} 
              onChange={(v) => updateParam('A3', v)} 
              unit=""
              validation={validationResult}
              info="Thermal conductivity ratio"
            />
          </Accordion>
          <Accordion title="Flow Parameters" icon={Magnet} defaultOpen={true}>
            <EnhancedSlider 
              paramKey="Ha"
              label="Hartmann Number (Ha)" 
              value={params.Ha} 
              onChange={(v) => updateParam('Ha', v)} 
              unit=""
              validation={validationResult}
              info="Ratio of magnetic to viscous forces"
            />
            <EnhancedSlider 
              paramKey="Re"
              label="Reynolds Number (Re)" 
              value={params.Re} 
              onChange={(v) => updateParam('Re', v)} 
              unit=""
              validation={validationResult}
              info="Dimensionless upper plate velocity"
            />
            <EnhancedSlider 
              paramKey="G"
              label="Pressure Gradient (G)" 
              value={params.G} 
              onChange={(v) => updateParam('G', v)} 
              unit=""
              validation={validationResult}
              info="Drives Poiseuille component"
            />
            <EnhancedSlider 
              paramKey="lambda"
              label="Slip Parameter (λ)" 
              value={params.lambda} 
              onChange={(v) => updateParam('lambda', v)} 
              unit=""
              validation={validationResult}
              info="Navier slip length"
            />
          </Accordion>
          <Accordion title="Thermal Parameters" icon={Thermometer}>
            <EnhancedSlider 
              paramKey="Pr"
              label="Prandtl Number (Pr)" 
              value={params.Pr} 
              onChange={(v) => updateParam('Pr', v)} 
              unit=""
              validation={validationResult}
              info="Momentum to thermal diffusivity ratio"
            />
            <EnhancedSlider 
              paramKey="Ec"
              label="Eckert Number (Ec)" 
              value={params.Ec} 
              onChange={(v) => updateParam('Ec', v)} 
              unit=""
              validation={validationResult}
              info="Kinetic energy to enthalpy ratio"
            />
            <EnhancedSlider 
              paramKey="Bi"
              label="Biot Number (Bi)" 
              value={params.Bi} 
              onChange={(v) => updateParam('Bi', v)} 
              unit=""
              validation={validationResult}
              info="Convective to conductive heat transfer ratio"
            />
          </Accordion>
          <Accordion title="Time Settings" icon={Clock}>
            <Slider label="τ_final" value={tauFinal} onChange={setTauFinal} min={0.5} max={5} step={0.1} />
          </Accordion>
          <Accordion title="Actions" icon={Rocket}>
            <div className="quick-actions">
              <button className="action-btn" onClick={exportData}><Download size={16} /> Export CSV</button>
              <button className="action-btn" onClick={() => { navigator.clipboard.writeText(JSON.stringify(params, null, 2)); setCopied(true); setTimeout(() => setCopied(false), 2000); }}>
                {copied ? <Check size={16} /> : <Copy size={16} />} {copied ? 'Copied!' : 'Copy Params'}
              </button>
              <button className={`action-btn ${compareMode ? 'active' : ''}`} onClick={() => { setCompareMode(!compareMode); setCompareParams({ ...params }); }}>
                <GitCompare size={16} /> {compareMode ? 'Exit Compare' : 'Compare Mode'}
              </button>
            </div>
          </Accordion>
        </div>
      </div>
    </>
  );

  // ═══════════════════════════════════════════════════════════════════════════
  // RENDER TAB CONTENT
  // ═══════════════════════════════════════════════════════════════════════════

  const renderTransient = () => (
    <div className="section">
      {/* NEW: Collaboration Panel */}
      <CollaborationPanel 
        isActive={collaborationActive}
        isConnected={isConnected}
        onToggle={() => {
          if (collaborationActive) {
            stopCollaboration();
          } else {
            startCollaboration();
          }
        }}
  users={collaborationUsers}
  roomId={roomId}
  onRoomChange={setRoomId}
/>

      
      <PhysicsInfoBox topic="transient" />
      <ResultsPanel />
        <SaveResultsPanel
          params={params}
          solution={solution}
          onSave={saveResult}
          savedResults={savedResults}
          onLoad={loadResults}
          onDelete={deleteResult}
          isLoading={isSavingResult}
          setParams={setParams}
        />

      <PlaybackControls />
      
      {/* NEW: Visualization controls */}
      <div style={{
        display: 'flex',
        gap: 'var(--space-sm)',
        marginBottom: 'var(--space-md)',
        padding: 'var(--space-sm)',
        background: 'var(--bg-tertiary)',
        borderRadius: 'var(--radius-md)'
      }}>
        <label style={{display: 'flex', alignItems: 'center', gap: 'var(--space-xs)', fontSize: '0.85rem'}}>
          <input 
            type="checkbox" 
            checked={showStreamlines} 
            onChange={(e) => setShowStreamlines(e.target.checked)}
          />
          Streamlines
        </label>
        <label style={{display: 'flex', alignItems: 'center', gap: 'var(--space-xs)', fontSize: '0.85rem'}}>
          <input 
            type="checkbox" 
            checked={showHeatmap} 
            onChange={(e) => setShowHeatmap(e.target.checked)}
          />
          Temperature Heatmap
        </label>
        <label style={{display: 'flex', alignItems: 'center', gap: 'var(--space-xs)', fontSize: '0.85rem'}}>
          <input 
            type="checkbox" 
            checked={showFieldLines} 
            onChange={(e) => setShowFieldLines(e.target.checked)}
          />
          Magnetic Field Lines
        </label>
      </div>
      
      {/* NEW: Enhanced Flow Visualization */}
      <EnhancedFlowVisualization 
        params={params}
        solution={solution}
        currentTime={currentTime}
        showStreamlines={showStreamlines}
        showHeatmap={showHeatmap}
        showFieldLines={showFieldLines}
      />
      
      {compareMode && (
        <div className="comparison-section">
          <div className="comparison-header">
            <h3><GitCompare size={20} /> Comparison Mode</h3>
            <button className="exit-compare-btn" onClick={exitCompareMode}><X size={16} /> Exit Compare</button>
          </div>
          <div className="comparison-grid">
            <div className="comparison-card">
              <h4>Configuration A (Current)</h4>
              <ResultsPanel sol={solution} label=" A" />
              <div className="comparison-params">
                <span>Ha={params.Ha.toFixed(1)}</span>
                <span>Re={params.Re.toFixed(1)}</span>
                <span>Pr={params.Pr.toFixed(1)}</span>
                <span>Ec={params.Ec.toFixed(2)}</span>
                <span>Bi={params.Bi.toFixed(1)}</span>
                <span>λ={params.lambda.toFixed(2)}</span>
              </div>
              <div className="comparison-sliders">
                <EnhancedSlider 
                  paramKey="Ha"
                  label="Ha" 
                  value={params.Ha} 
                  onChange={(v) => updateParam('Ha', v)} 
                  unit=""
                  validation={validationResult}
                />
                <EnhancedSlider 
                  paramKey="Re"
                  label="Re" 
                  value={params.Re} 
                  onChange={(v) => updateParam('Re', v)} 
                  unit=""
                  validation={validationResult}
                />
                <EnhancedSlider 
                  paramKey="Pr"
                  label="Pr" 
                  value={params.Pr} 
                  onChange={(v) => updateParam('Pr', v)} 
                  unit=""
                  validation={validationResult}
                />
                <EnhancedSlider 
                  paramKey="Ec"
                  label="Ec" 
                  value={params.Ec} 
                  onChange={(v) => updateParam('Ec', v)} 
                  unit=""
                  validation={validationResult}
                />
                <EnhancedSlider 
                  paramKey="Bi"
                  label="Bi" 
                  value={params.Bi} 
                  onChange={(v) => updateParam('Bi', v)} 
                  unit=""
                  validation={validationResult}
                />
                <EnhancedSlider 
                  paramKey="lambda"
                  label="λ" 
                  value={params.lambda} 
                  onChange={(v) => updateParam('lambda', v)} 
                  unit=""
                  validation={validationResult}
                />
              </div>
            </div>
            <div className="comparison-card">
              <h4>Configuration B (Comparison)</h4>
              {compareSolution && <ResultsPanel sol={compareSolution} label=" B" />}
              <div className="comparison-params">
                <span>Ha={compareParams.Ha.toFixed(1)}</span>
                <span>Re={compareParams.Re.toFixed(1)}</span>
                <span>Pr={compareParams.Pr.toFixed(1)}</span>
                <span>Ec={compareParams.Ec.toFixed(2)}</span>
                <span>Bi={compareParams.Bi.toFixed(1)}</span>
                <span>λ={compareParams.lambda.toFixed(2)}</span>
              </div>
              <div className="comparison-sliders">
                <EnhancedSlider 
                  paramKey="Ha"
                  label="Ha" 
                  value={compareParams.Ha} 
                  onChange={(v) => updateCompareParam('Ha', v)} 
                  unit=""
                  validation={validationResult}
                />
                <EnhancedSlider 
                  paramKey="Re"
                  label="Re" 
                  value={compareParams.Re} 
                  onChange={(v) => updateCompareParam('Re', v)} 
                  unit=""
                  validation={validationResult}
                />
                <EnhancedSlider 
                  paramKey="Pr"
                  label="Pr" 
                  value={compareParams.Pr} 
                  onChange={(v) => updateCompareParam('Pr', v)} 
                  unit=""
                  validation={validationResult}
                />
                <EnhancedSlider 
                  paramKey="Ec"
                  label="Ec" 
                  value={compareParams.Ec} 
                  onChange={(v) => updateCompareParam('Ec', v)} 
                  unit=""
                  validation={validationResult}
                />
                <EnhancedSlider 
                  paramKey="Bi"
                  label="Bi" 
                  value={compareParams.Bi} 
                  onChange={(v) => updateCompareParam('Bi', v)} 
                  unit=""
                  validation={validationResult}
                />
                <EnhancedSlider 
                  paramKey="lambda"
                  label="λ" 
                  value={compareParams.lambda} 
                  onChange={(v) => updateCompareParam('lambda', v)} 
                  unit=""
                  validation={validationResult}
                />
              </div>
            </div>
          </div>
          {compareSolution && (
            <div className="comparison-charts">
              <div className="chart-card">
                <div className="chart-header"><span className="dot purple"></span><h3>Cf Comparison</h3></div>
                <div className="chart-wrapper">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart><CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                      <XAxis dataKey="tau" type="number" domain={[0, tauFinal]} stroke="rgba(255,255,255,0.5)" tick={{ fill: 'rgba(255,255,255,0.7)', fontSize: 11 }} />
                      <YAxis stroke="rgba(255,255,255,0.5)" tick={{ fill: 'rgba(255,255,255,0.7)', fontSize: 11 }} />
                      <Tooltip content={<CustomTooltip />} /><Legend />
                      <Line data={solution.evolutionData} type="monotone" dataKey="Cf_lower" stroke="#8b5cf6" strokeWidth={2.5} dot={false} name="Cf (A)" />
                      <Line data={compareSolution.evolutionData} type="monotone" dataKey="Cf_lower" stroke="#fbbf24" strokeWidth={2.5} strokeDasharray="5 5" dot={false} name="Cf (B)" />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
      
      <div className="dual-grid">
        <div className="chart-card"><div className="chart-header"><span className="dot purple"></span><h3>Skin Friction Cf(τ)</h3></div><div className="chart-wrapper">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={solution.evolutionData}><CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
              <XAxis dataKey="tau" stroke="rgba(255,255,255,0.5)" tick={{ fill: 'rgba(255,255,255,0.7)', fontSize: 11 }} />
              <YAxis stroke="rgba(255,255,255,0.5)" tick={{ fill: 'rgba(255,255,255,0.7)', fontSize: 11 }} />
              <Tooltip content={<CustomTooltip />} /><Legend />
              <Line type="monotone" dataKey="Cf_lower" stroke="#8b5cf6" strokeWidth={2.5} dot={false} name="Cf (Lower)" />
              <Line type="monotone" dataKey="Cf_upper" stroke="#ec4899" strokeWidth={2} dot={false} name="Cf (Upper)" />
            </LineChart>
          </ResponsiveContainer>
        </div></div>
        <div className="chart-card"><div className="chart-header"><span className="dot pink"></span><h3>Nusselt Number Nu(τ)</h3></div><div className="chart-wrapper">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={solution.evolutionData}><CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
              <XAxis dataKey="tau" stroke="rgba(255,255,255,0.5)" tick={{ fill: 'rgba(255,255,255,0.7)', fontSize: 11 }} />
              <YAxis stroke="rgba(255,255,255,0.5)" tick={{ fill: 'rgba(255,255,255,0.7)', fontSize: 11 }} />
              <Tooltip content={<CustomTooltip />} /><Legend />
              <Line type="monotone" dataKey="Nu_lower" stroke="#ec4899" strokeWidth={2.5} dot={false} name="Nu (Lower)" />
              <Line type="monotone" dataKey="Nu_upper" stroke="#8b5cf6" strokeWidth={2} dot={false} name="Nu (Upper)" />
            </LineChart>
          </ResponsiveContainer>
        </div></div>
      </div>
      
      <div className="physics-box">
        <h4><Clock size={18} /> Transient Response Metrics</h4>
        <div className="metrics-grid">
          <div className="metric"><span className="metric-label">Time Constant (τ₆₃)</span><span className="metric-value purple">{solution.metrics.tau63.toFixed(3)}</span></div>
          <div className="metric"><span className="metric-label">Response Time (τ₉₅)</span><span className="metric-value pink">{solution.metrics.tau95.toFixed(3)}</span></div>
          <div className="metric"><span className="metric-label">Peak Time</span><span className="metric-value amber">{solution.metrics.peakTime.toFixed(3)}</span></div>
          <div className="metric"><span className="metric-label">Settling (2%)</span><span className="metric-value teal">{solution.metrics.settlingTime.toFixed(3)}</span></div>
        </div>
        <div className="damping-indicator">
          <span className="damping-label">Damping Classification:</span>
          <span className={`damping-badge ${solution.metrics.dampingType.toLowerCase().replace(' ', '-')}`}>{solution.metrics.dampingType}</span>
        </div>
        <PhysicsInfoBox topic="damping" />
      </div>
      
      {/* NEW: Equation Explorer */}
      <EquationExplorer />
    </div>
  );

  const renderProfiles = () => (
    <div className="section">
      <PhysicsInfoBox topic="velocity" />
      <ResultsPanel />
      <div className="dual-grid">
        <div className="chart-card"><div className="chart-header"><span className="dot purple"></span><h3>Velocity W(τ) at Fixed η</h3></div><div className="chart-wrapper">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={solution.evolutionData}><CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
              <XAxis dataKey="tau" stroke="rgba(255,255,255,0.5)" tick={{ fill: 'rgba(255,255,255,0.7)', fontSize: 11 }} />
              <YAxis stroke="rgba(255,255,255,0.5)" tick={{ fill: 'rgba(255,255,255,0.7)', fontSize: 11 }} />
              <Tooltip content={<CustomTooltip />} /><Legend />
              <Line type="monotone" dataKey="W_025" stroke="#06b6d4" strokeWidth={2} dot={false} name="η=0.25" />
              <Line type="monotone" dataKey="W_050" stroke="#8b5cf6" strokeWidth={2.5} dot={false} name="η=0.50" />
              <Line type="monotone" dataKey="W_075" stroke="#ec4899" strokeWidth={2} dot={false} name="η=0.75" />
            </LineChart>
          </ResponsiveContainer>
        </div></div>
        <div className="chart-card"><div className="chart-header"><span className="dot pink"></span><h3>Temperature θ(τ) at Fixed η</h3></div><div className="chart-wrapper">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={solution.evolutionData}><CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
              <XAxis dataKey="tau" stroke="rgba(255,255,255,0.5)" tick={{ fill: 'rgba(255,255,255,0.7)', fontSize: 11 }} />
              <YAxis stroke="rgba(255,255,255,0.5)" tick={{ fill: 'rgba(255,255,255,0.7)', fontSize: 11 }} />
              <Tooltip content={<CustomTooltip />} /><Legend />
              <Line type="monotone" dataKey="Theta_025" stroke="#06b6d4" strokeWidth={2} dot={false} name="η=0.25" />
              <Line type="monotone" dataKey="Theta_050" stroke="#ec4899" strokeWidth={2.5} dot={false} name="η=0.50" />
              <Line type="monotone" dataKey="Theta_075" stroke="#fbbf24" strokeWidth={2} dot={false} name="η=0.75" />
            </LineChart>
          </ResponsiveContainer>
        </div></div>
      </div>
      
      <PhysicsInfoBox topic="temperature" />
      
      <div className="dual-grid">
        <div className="chart-card"><div className="chart-header"><span className="dot teal"></span><h3>Velocity Profiles W(η)</h3></div><div className="chart-wrapper">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={solution.profileData}><CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
              <XAxis dataKey="eta" stroke="rgba(255,255,255,0.5)" tick={{ fill: 'rgba(255,255,255,0.7)', fontSize: 11 }} />
              <YAxis stroke="rgba(255,255,255,0.5)" tick={{ fill: 'rgba(255,255,255,0.7)', fontSize: 11 }} />
              <Tooltip content={<CustomTooltip />} /><Legend />
              <Line type="monotone" dataKey="W_t0" stroke="#6b7280" strokeWidth={1.5} dot={false} name="τ=0 (initial)" />
              <Line type="monotone" dataKey="W_t1" stroke="#06b6d4" strokeWidth={2} dot={false} name="τ=early" />
              <Line type="monotone" dataKey="W_t2" stroke="#8b5cf6" strokeWidth={2} dot={false} name="τ=mid" />
              <Line type="monotone" dataKey="W_t3" stroke="#10b981" strokeWidth={2.5} dot={false} name="τ=final" />
            </LineChart>
          </ResponsiveContainer>
        </div></div>
        <div className="chart-card"><div className="chart-header"><span className="dot amber"></span><h3>Temperature Profiles θ(η)</h3></div><div className="chart-wrapper">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={solution.profileData}>
              <defs><linearGradient id="thetaGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#ec4899" stopOpacity={0.4}/><stop offset="95%" stopColor="#ec4899" stopOpacity={0.05}/></linearGradient></defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
              <XAxis dataKey="eta" stroke="rgba(255,255,255,0.5)" tick={{ fill: 'rgba(255,255,255,0.7)', fontSize: 11 }} />
              <YAxis stroke="rgba(255,255,255,0.5)" tick={{ fill: 'rgba(255,255,255,0.7)', fontSize: 11 }} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="Theta_t3" stroke="#ec4899" strokeWidth={2.5} fill="url(#thetaGrad)" name="θ (final)" />
            </AreaChart>
          </ResponsiveContainer>
        </div></div>
      </div>
      
      <div className="contour-grid">
        <ContourPlot data={{ tau: solution.tauHistory, eta: solution.eta, values: solution.WHistory }} title="Velocity Contour W(η,τ)" colorScheme="purple" />
        <ContourPlot data={{ tau: solution.tauHistory, eta: solution.eta, values: solution.ThetaHistory }} title="Temperature Contour θ(η,τ)" colorScheme="thermal" />
      </div>
      
      <div className="surface3d-grid">
        <Surface3D data={{ values: solution.WHistory }} title="3D Velocity Surface W(η,τ)" colorScheme="purple" />
        <Surface3D data={{ values: solution.ThetaHistory }} title="3D Temperature Surface θ(η,τ)" colorScheme="thermal" />
      </div>
    </div>
  );

  const renderEnergy = () => (
    <div className="section">
      <PhysicsInfoBox topic="entropy" />
      <ResultsPanel />
      <div className="chart-card"><div className="chart-header"><span className="dot amber"></span><h3>System Energy Evolution</h3></div><div className="chart-wrapper" style={{ height: '350px' }}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={solution.evolutionData}>
            <defs>
              <linearGradient id="keGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.5}/><stop offset="95%" stopColor="#8b5cf6" stopOpacity={0.1}/></linearGradient>
              <linearGradient id="teGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#ec4899" stopOpacity={0.5}/><stop offset="95%" stopColor="#ec4899" stopOpacity={0.1}/></linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
            <XAxis dataKey="tau" stroke="rgba(255,255,255,0.5)" tick={{ fill: 'rgba(255,255,255,0.7)', fontSize: 11 }} />
            <YAxis stroke="rgba(255,255,255,0.5)" tick={{ fill: 'rgba(255,255,255,0.7)', fontSize: 11 }} />
            <Tooltip content={<CustomTooltip />} /><Legend />
            <Area type="monotone" dataKey="KE" stroke="#8b5cf6" strokeWidth={2} fill="url(#keGrad)" name="Kinetic Energy" />
            <Area type="monotone" dataKey="TE" stroke="#ec4899" strokeWidth={2} fill="url(#teGrad)" name="Thermal Energy" />
          </AreaChart>
        </ResponsiveContainer>
      </div></div>
      
      <div className="dual-grid">
        <div className="chart-card"><div className="chart-header"><span className="dot teal"></span><h3>Dissipation Sources</h3></div><div className="chart-wrapper">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={solution.evolutionData}><CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
              <XAxis dataKey="tau" stroke="rgba(255,255,255,0.5)" tick={{ fill: 'rgba(255,255,255,0.7)', fontSize: 11 }} />
              <YAxis stroke="rgba(255,255,255,0.5)" tick={{ fill: 'rgba(255,255,255,0.7)', fontSize: 11 }} />
              <Tooltip content={<CustomTooltip />} /><Legend />
              <Line type="monotone" dataKey="VD" stroke="#14b8a6" strokeWidth={2} dot={false} name="Viscous Dissipation" />
              <Line type="monotone" dataKey="JH" stroke="#fbbf24" strokeWidth={2} dot={false} name="Joule Heating" />
            </LineChart>
          </ResponsiveContainer>
        </div></div>
        <div className="chart-card"><div className="chart-header"><span className="dot purple"></span><h3>Entropy Generation Ns(η)</h3></div><div className="chart-wrapper">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={solution.profileData}><CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
              <XAxis dataKey="eta" stroke="rgba(255,255,255,0.5)" tick={{ fill: 'rgba(255,255,255,0.7)', fontSize: 11 }} />
              <YAxis stroke="rgba(255,255,255,0.5)" tick={{ fill: 'rgba(255,255,255,0.7)', fontSize: 11 }} />
              <Tooltip content={<CustomTooltip />} /><Legend />
              <Area type="monotone" dataKey="Ns_heat" stackId="1" stroke="#ec4899" fill="#ec489933" name="Heat Transfer" />
              <Area type="monotone" dataKey="Ns_fluid" stackId="1" stroke="#8b5cf6" fill="#8b5cf633" name="Fluid Friction" />
              <Area type="monotone" dataKey="Ns_magnetic" stackId="1" stroke="#fbbf24" fill="#fbbf2433" name="Magnetic" />
            </AreaChart>
          </ResponsiveContainer>
        </div></div>
      </div>
      
      <div className="physics-box">
        <h4><Activity size={18} /> Energy Balance & Second Law Analysis</h4>
        <div className="metrics-grid">
          <div className="metric"><span className="metric-label">Final KE</span><span className="metric-value purple">{solution.kineticEnergy[solution.kineticEnergy.length - 1].toFixed(4)}</span></div>
          <div className="metric"><span className="metric-label">Final TE</span><span className="metric-value pink">{solution.thermalEnergy[solution.thermalEnergy.length - 1].toFixed(4)}</span></div>
          <div className="metric"><span className="metric-label">Avg Entropy Ns</span><span className="metric-value amber">{solution.avgNs.toFixed(4)}</span></div>
          <div className="metric"><span className="metric-label">Bejan Number Be</span><span className="metric-value teal">{solution.avgBe.toFixed(4)}</span></div>
        </div>
        <div className="highlight purple">
          <strong>Bejan Number Interpretation:</strong> Be = {solution.avgBe.toFixed(3)} → 
          {solution.avgBe > 0.5 ? ' Heat transfer irreversibility dominates (conduction losses)' : ' Friction/magnetic irreversibility dominates (viscous & Joule heating losses)'}
        </div>
      </div>
    </div>
  );

  const renderParametric = () => (
    <div className="section">
      <div className="section-header">
        <h2><LineChartIcon size={28} /> Parametric Study</h2>
        <p>Analyze how individual parameters affect transient response</p>
      </div>
      
      <div className="parametric-controls">
        <div className="param-select">
          <label>Parameter to Vary:</label>
          <select value={paramStudyVar} onChange={(e) => setParamStudyVar(e.target.value)}>
            <option value="Ha">Ha (Hartmann Number)</option>
            <option value="Re">Re (Reynolds Number)</option>
            <option value="Pr">Pr (Prandtl Number)</option>
            <option value="Ec">Ec (Eckert Number)</option>
            <option value="Bi">Bi (Biot Number)</option>
            <option value="lambda">λ (Slip Parameter)</option>
          </select>
        </div>
        <button className={`run-study-btn ${paramStudyRunning ? 'running' : ''}`} onClick={runParametricStudy} disabled={paramStudyRunning}>
          {paramStudyRunning ? <><div className="spinner"></div>Computing...</> : <><Gauge size={18} />Run Study</>}
        </button>
      </div>
      
      <div className="param-info-card">
        <Info size={20} />
        <div>
          <strong>{PHYSICS_EXPLANATIONS.parameters[paramStudyVar]?.name}</strong>
          <p>{PHYSICS_EXPLANATIONS.parameters[paramStudyVar]?.desc}</p>
        </div>
      </div>
      
      {paramStudyData.length > 0 && (
        <>
          <div className="dual-grid">
            <div className="chart-card">
              <div className="chart-header"><span className="dot purple"></span><h3>Response Time τ₉₅ vs {paramStudyVar}</h3></div>
              <div className="chart-wrapper">
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart data={paramStudyData}><CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                    <XAxis dataKey={paramStudyVar} stroke="rgba(255,255,255,0.5)" tick={{ fill: 'rgba(255,255,255,0.7)', fontSize: 11 }} />
                    <YAxis stroke="rgba(255,255,255,0.5)" tick={{ fill: 'rgba(255,255,255,0.7)', fontSize: 11 }} />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="tau95" fill="#8b5cf6" fillOpacity={0.6} name="τ₉₅" />
                    <Line type="monotone" dataKey="tau95" stroke="#ec4899" strokeWidth={2} dot={{ fill: '#ec4899' }} name="Trend" />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
            </div>
            <div className="chart-card">
              <div className="chart-header"><span className="dot pink"></span><h3>Skin Friction Cf vs {paramStudyVar}</h3></div>
              <div className="chart-wrapper">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={paramStudyData}><CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                    <XAxis dataKey={paramStudyVar} stroke="rgba(255,255,255,0.5)" tick={{ fill: 'rgba(255,255,255,0.7)', fontSize: 11 }} />
                    <YAxis stroke="rgba(255,255,255,0.5)" tick={{ fill: 'rgba(255,255,255,0.7)', fontSize: 11 }} />
                    <Tooltip content={<CustomTooltip />} />
                    <Line type="monotone" dataKey="Cf" stroke="#ec4899" strokeWidth={2.5} dot={{ fill: '#ec4899', r: 4 }} name="Cf" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
          
          <div className="dual-grid">
            <div className="chart-card">
              <div className="chart-header"><span className="dot amber"></span><h3>Heat Transfer Nu vs {paramStudyVar}</h3></div>
              <div className="chart-wrapper">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={paramStudyData}><CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                    <XAxis dataKey={paramStudyVar} stroke="rgba(255,255,255,0.5)" tick={{ fill: 'rgba(255,255,255,0.7)', fontSize: 11 }} />
                    <YAxis stroke="rgba(255,255,255,0.5)" tick={{ fill: 'rgba(255,255,255,0.7)', fontSize: 11 }} />
                    <Tooltip content={<CustomTooltip />} />
                    <Line type="monotone" dataKey="Nu" stroke="#fbbf24" strokeWidth={2.5} dot={{ fill: '#fbbf24', r: 4 }} name="Nu" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
            <div className="chart-card">
              <div className="chart-header"><span className="dot teal"></span><h3>Overshoot % vs {paramStudyVar}</h3></div>
              <div className="chart-wrapper">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={paramStudyData}>
                    <defs><linearGradient id="ovGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#14b8a6" stopOpacity={0.5}/><stop offset="95%" stopColor="#14b8a6" stopOpacity={0.1}/></linearGradient></defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                    <XAxis dataKey={paramStudyVar} stroke="rgba(255,255,255,0.5)" tick={{ fill: 'rgba(255,255,255,0.7)', fontSize: 11 }} />
                    <YAxis stroke="rgba(255,255,255,0.5)" tick={{ fill: 'rgba(255,255,255,0.7)', fontSize: 11 }} />
                    <Tooltip content={<CustomTooltip />} />
                    <Area type="monotone" dataKey="overshoot" stroke="#14b8a6" fill="url(#ovGrad)" name="Overshoot %" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
          
          <div className="study-summary">
            <h4><AlertCircle size={18} /> Key Observations for {PHYSICS_EXPLANATIONS.parameters[paramStudyVar]?.name}</h4>
            <ul>
              {paramStudyVar === 'Ha' && <>
                <li>τ₉₅ decreases with Ha - magnetic damping speeds up settling</li>
                <li>Cf decreases with Ha - Lorentz force opposes motion</li>
                <li>Overshoot decreases with Ha - transition from underdamped to overdamped</li>
                <li>Critical damping occurs around Ha ≈ 2</li>
              </>}
              {paramStudyVar === 'Re' && <>
                <li>Cf increases linearly with Re - direct proportionality</li>
                <li>Higher Re means faster upper plate, more momentum transfer</li>
                <li>τ₉₅ relatively constant - response time independent of driving velocity</li>
              </>}
              {paramStudyVar === 'Pr' && <>
                <li>Pr affects thermal boundary layer thickness</li>
                <li>Higher Pr means thinner thermal layer, steeper gradients</li>
                <li>Nu increases with Pr - enhanced thermal convection</li>
              </>}
              {paramStudyVar === 'Ec' && <>
                <li>Ec controls viscous dissipation heating</li>
                <li>Higher Ec can cause temperature to exceed θ=1</li>
                <li>Entropy generation increases with Ec</li>
              </>}
              {paramStudyVar === 'Bi' && <>
                <li>Higher Bi means stronger convective cooling at upper plate</li>
                <li>Nu increases with Bi - enhanced heat transfer</li>
                <li>Temperature profile steepens near upper boundary</li>
              </>}
              {paramStudyVar === 'lambda' && <>
                <li>λ=0 is no-slip; higher λ allows wall slip</li>
                <li>Cf decreases with λ - reduced wall shear stress</li>
                <li>Slip affects velocity profile near upper boundary</li>
              </>}
            </ul>
          </div>
        </>
      )}
    </div>
  );

  const renderAILab = () => (
    <div className="section">
      <div className="ai-lab-header"><div className="ai-lab-title"><Brain size={32} /><div><h2>Transient AI Laboratory</h2><p>Machine Learning Tools for Response Analysis & Optimization</p></div></div></div>
      
      <div className="ai-section">
        <div className="ai-section-header"><Cpu size={20} /><h3>Neural Network Predictions</h3><span className="ai-badge">Real-time</span></div>
        <p className="ai-description">Physics-informed neural network predicts transient response characteristics.</p>
        <div className="nn-predictions-grid">
          <div className="nn-card"><div className="nn-label">Predicted τ₉₅</div><div className="nn-value purple">{nnPred?.tau95.toFixed(3)}</div><div className="nn-actual">Actual: {solution.metrics.tau95.toFixed(3)}</div></div>
          <div className="nn-card"><div className="nn-label">Predicted Overshoot</div><div className="nn-value pink">{nnPred?.overshoot.toFixed(1)}%</div><div className="nn-actual">Actual: {solution.metrics.overshoot.toFixed(1)}%</div></div>
          <div className="nn-card"><div className="nn-label">Predicted Cf</div><div className="nn-value amber">{nnPred?.Cf_final.toFixed(4)}</div><div className="nn-actual">Actual: {solution.metrics.CfFinal.toFixed(4)}</div></div>
          <div className="nn-card"><div className="nn-label">Damping Type</div><div className="nn-value teal">{nnPred?.dampingType}</div><div className="nn-actual">Actual: {solution.metrics.dampingType}</div></div>
        </div>
      </div>
      
      <div className="ai-section">
        <div className="ai-section-header"><BarChart3 size={20} /><h3>Sensitivity Analysis</h3><span className="ai-badge gold">Physics</span></div>
        <p className="ai-description">How sensitive are outputs to each parameter? (normalized ∂output/∂input)</p>
        {sensitivity && (
          <div className="sensitivity-chart">
            <ResponsiveContainer width="100%" height={200}>
              <ComposedChart data={Object.entries(sensitivity).map(([param, vals]) => ({ param, ...vals }))}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                <XAxis dataKey="param" stroke="rgba(255,255,255,0.5)" tick={{ fill: 'rgba(255,255,255,0.7)', fontSize: 11 }} />
                <YAxis stroke="rgba(255,255,255,0.5)" tick={{ fill: 'rgba(255,255,255,0.7)', fontSize: 11 }} />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Bar dataKey="tau95" fill="#8b5cf6" name="τ₉₅ sensitivity" />
                <Bar dataKey="Cf" fill="#ec4899" name="Cf sensitivity" />
                <Bar dataKey="Nu" fill="#fbbf24" name="Nu sensitivity" />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
      
      <div className="ai-section">
        <div className="ai-section-header"><Lightbulb size={20} /><h3>Smart Recommendations</h3><span className="ai-badge gold">AI</span></div>
        <div className="recommendations-list">
          {aiRecs.map((r, i) => (
            <div key={i} className="recommendation-card">
              <span className="rec-icon">{r.icon}</span>
              <div className="rec-content">
                <p>{r.text}</p>
                <span className="rec-impact">{r.impact}</span>
              </div>
              {r.action && <button className="rec-action-btn" onClick={() => applyRecommendation(r.action)}>Apply</button>}
            </div>
          ))}
        </div>
      </div>
      
      <div className="ai-section">
        <div className="ai-section-header"><Target size={20} /><h3>Genetic Algorithm Optimizer</h3><span className="ai-badge pink">Evolution</span></div>
        <p className="ai-description">Evolutionary optimization to find best parameters for your goals.</p>
        <div className="optimizer-controls">
          <div className="optimizer-goal"><label>Optimization Goal:</label>
            <select value={optGoal} onChange={(e) => setOptGoal(e.target.value)} disabled={optRunning}>
              <option value="fast-response">⚡ Fastest Response (Min τ₉₅)</option>
              <option value="min-overshoot">📉 Minimum Overshoot</option>
              <option value="max-heat">🔥 Maximum Heat Transfer (Nu)</option>
              <option value="min-entropy">🌀 Minimum Entropy Generation</option>
              <option value="balanced">⚖️ Balanced Performance</option>
            </select>
          </div>
          <button className={`optimizer-btn ${optRunning ? 'running' : ''}`} onClick={runOptimizer} disabled={optRunning}>
            {optRunning ? <><div className="spinner"></div>Evolving...</> : <><Sparkles size={18} />Run Optimizer</>}
          </button>
        </div>
        {optProgress && (<div className="optimizer-progress"><div className="progress-bar"><div className="progress-fill" style={{ width: `${(optProgress.generation / optProgress.totalGenerations) * 100}%` }}></div></div><div className="progress-stats"><span>Generation {optProgress.generation}/{optProgress.totalGenerations}</span><span>Best Fitness: {optProgress.bestFitness?.toFixed(4)}</span></div></div>)}
        {optResult && (<div className="optimizer-result"><div className="result-header"><Award size={24} /><h4>Optimization Complete!</h4></div><div className="optimal-params"><h5>Optimal Parameters Found:</h5><div className="params-grid">{Object.entries(optResult.bestIndividual).map(([k, v]) => (<div key={k} className="param-item"><span className="param-key">{k}</span><span className="param-value">{v.toFixed(3)}</span></div>))}</div></div><button className="apply-btn" onClick={applyOptResult}><Check size={18} />Apply These Parameters</button></div>)}
      </div>
      
      <div className="ai-section">
        <div className="ai-section-header"><Activity size={20} /><h3>Damping Regime Classifier</h3></div>
        <div className="chart-wrapper" style={{ height: '200px' }}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={solution.evolutionData}><CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
              <XAxis dataKey="tau" stroke="rgba(255,255,255,0.5)" tick={{ fill: 'rgba(255,255,255,0.7)', fontSize: 10 }} />
              <YAxis domain={[0, 1.3]} stroke="rgba(255,255,255,0.5)" tick={{ fill: 'rgba(255,255,255,0.7)', fontSize: 10 }} />
              <Tooltip content={<CustomTooltip />} />
              <Line type="monotone" dataKey="Cf_norm" stroke="#8b5cf6" strokeWidth={2.5} dot={false} name="Cf/Cf∞" />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <div className="damping-info">
          <p><strong>Current Regime:</strong> <span className={`damping-badge ${solution.metrics.dampingType.toLowerCase().replace(' ', '-')}`}>{solution.metrics.dampingType}</span></p>
          <p>Ha = {params.Ha.toFixed(1)} → Magnetic damping ∝ Ha². {params.Ha < 1 ? 'Low damping - expect oscillations.' : params.Ha > 4 ? 'High damping - sluggish response.' : 'Near critical damping - optimal zone.'}</p>
        </div>
      </div>
    </div>
  );

  const renderPresets = () => (
    <div className="section">
      <div className="presets-header"><h2><FlaskConical size={28} /> Quick Presets</h2><p>Pre-configured scenarios demonstrating different physical regimes</p></div>
      <div className="presets-grid">
        {Object.entries(PRESETS).map(([k, p]) => (<button key={k} className="preset-card" onClick={() => applyPreset(k)}><span className="preset-icon">{p.icon}</span><div className="preset-info"><h4>{p.name}</h4><p>{p.desc}</p></div></button>))}
      </div>
      <PhysicsInfoBox topic="nanofluid" showDetails={true} />
    </div>
  );

  // NEW: Education Tab
  const renderEducationTab = () => (
    <div className="section">
      <div className="section-header">
        <h2><BookOpen size={28} /> Educational Content</h2>
        <p>Interactive learning materials for MHD nanofluid flow</p>
      </div>
      
      <VideoExplanation />
      <CaseStudyLibrary onLoadCase={(caseParams) => {
        setParams(prev => ({ ...prev, ...caseParams }));
      }} />
      <EquationExplorer />
      
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: 'var(--space-lg)',
        marginTop: 'var(--space-lg)'
      }}>
        <div className="physics-box">
          <h4><TargetIcon size={18} /> Learning Objectives</h4>
          <ul>
            <li>Understand the physics of magnetohydrodynamic (MHD) flows</li>
            <li>Analyze transient response characteristics</li>
            <li>Compare nanoparticle effects on heat transfer</li>
            <li>Interpret entropy generation for thermodynamic efficiency</li>
            <li>Apply knowledge to engineering design problems</li>
          </ul>
        </div>
        
        <div className="physics-box">
          <h4><CpuIcon size={18} /> Interactive Exercises</h4>
          <ul>
            <li>Find the optimal Ha for critical damping</li>
            <li>Maximize heat transfer with nanofluids</li>
            <li>Minimize entropy generation</li>
            <li>Compare Cu vs Al₂O₃ performance</li>
            <li>Investigate slip boundary effects</li>
          </ul>
        </div>
      </div>
    </div>
  );

const renderVideos = () => {
  const videos = [
    {
      id: 1,
      file: '/videos/Laminar_Turbulant_Numerical_Solutions.mp4',
      title: 'Laminar vs Turbulent Flow: Numerical Solutions',
      description: 'This visualization contrasts laminar and turbulent flow regimes, demonstrating the fundamental difference in flow structure. Laminar flow exhibits smooth, orderly fluid motion with predictable streamlines, while turbulent flow shows chaotic, three-dimensional fluctuations. The numerical approaches shown highlight why different methods are needed: laminar flows can be solved with spectral or finite difference methods (as in our MHD Couette problem), while turbulent flows require Reynolds-Averaged Navier-Stokes (RANS), Large Eddy Simulation (LES), or Direct Numerical Simulation (DNS).',
      importance: 'Understanding this distinction is critical because our unsteady MHD Couette flow operates in the laminar regime (low Re), allowing precise spectral solutions. The transition to turbulence would require entirely different numerical treatments and could invalidate our current assumptions about flow structure.',
      relevance: 'MHD Research Context',
      context: 'At the Reynolds numbers (Re ≤ 5) studied in our research, the flow remains laminar with well-defined velocity profiles. The magnetic field (Hartmann number) provides additional stabilization, further suppressing turbulent transition. This allows our spectral quasilinearization method to achieve machine precision (10⁻¹⁰ accuracy).'
    },
    {
      id: 2,
      file: '/videos/Fluid_Mechanics_Equations.mp4',
      title: 'Couette Flow: Problem Formulation and Assumptions',
      description: 'This educational animation demonstrates classical Couette flow - the canonical problem of fluid motion between parallel plates. The top plate moves with velocity U while the bottom plate remains stationary, creating a linear velocity gradient in simple cases. The video walks through the problem setup, showing how to reduce the full Navier-Stokes equations to a simplified form using key assumptions: steady flow, incompressibility, and fully developed conditions.',
      importance: 'Couette flow is the foundation of our research problem. By understanding the classical isothermal case, we can appreciate how adding magnetic fields (MHD), nanofluids, thermal effects, and transient behavior increases complexity. The assumptions shown in this video guide which terms we retain in our governing equations.',
      relevance: 'Direct Application to Research',
      context: 'Our unsteady MHD nanofluid Couette flow extends this classical problem by adding: (1) time dependence (∂/∂t terms), (2) Lorentz force from magnetic field (Ha² terms), (3) nanofluid property ratios (A₁-A₅), (4) viscous dissipation and Joule heating (Ec terms), and (5) slip boundary conditions (λ parameter). Each addition requires careful treatment in the numerical scheme.'
    },
    {
      id: 3,
      file: '/videos/Entropy.mp4',
      title: 'Entropy: The Second Law of Thermodynamics',
      description: 'Entropy quantifies the irreversibility and disorder in a thermodynamic system. This video explains entropy generation from a fundamental perspective: whenever energy transformations occur (heat transfer across temperature gradients, fluid friction, electrical resistance), some useful energy is irreversibly converted to thermal energy at ambient temperature. The Second Law states that total entropy can never decrease in an isolated system.',
      importance: 'In fluid mechanics and heat transfer, minimizing entropy generation is equivalent to maximizing system efficiency. Every irreversible process - whether viscous dissipation in flow, heat conduction across finite temperature differences, or Joule heating from electrical currents - generates entropy and represents lost work potential (exergy destruction).',
      relevance: 'Entropy Generation Analysis (Chapter 7)',
      context: 'Our research calculates three entropy sources: (1) Ns_heat from temperature gradients (thermal irreversibility), (2) Ns_fluid from velocity gradients (viscous friction), and (3) Ns_magnetic from Joule heating (electromagnetic irreversibility). The Bejan number Be = Ns_heat/Ns_total identifies which mechanism dominates. For our baseline case, Be ≈ 0.34, meaning friction and magnetic effects slightly outweigh thermal irreversibility - critical for optimizing MHD device efficiency.'
    },
    {
      id: 4,
      file: '/videos/Heat_Transfer_Conduction_Convection.mp4',
      title: 'Heat Transfer Mechanisms: Conduction and Convection',
      description: 'Heat transfer occurs through three mechanisms: conduction (molecular energy transfer in stationary media), convection (energy transport by fluid motion), and radiation (electromagnetic waves). This video focuses on conduction and convection, showing how Fourier\'s law (q = -k∇T) governs conduction, while convection combines fluid motion with conduction. The convective heat transfer coefficient h relates surface heat flux to temperature difference: q = h(T_surface - T_fluid).',
      importance: 'Understanding the distinction between conduction and convection is essential for analyzing thermal boundary layers. In our problem, both mechanisms operate simultaneously: conduction dominates near walls where velocity gradients are steep, while convection becomes important in the core flow. The Prandtl number Pr determines the relative thickness of momentum and thermal boundary layers.',
      relevance: 'Thermal Analysis and Nusselt Number',
      context: 'Our thermal energy equation includes: (1) conduction term (A₃∂²θ/∂η²), (2) convective effects implicitly through the transient term (A₅Pr∂θ/∂τ), and (3) heat generation from viscous dissipation (A₁PrEc(∂W/∂η)²) and Joule heating (A₂PrEcHa²W²). The Nusselt number Nu quantifies the enhancement of heat transfer beyond pure conduction. The Biot number Bi at the upper plate represents convective cooling: Bi = hL/k.'
    },
    {
      id: 5,
      file: '/videos/chip_refrigerant_cooling.mp4',
      title: 'Microfluidic Cooling: Thermal Management of Microchips',
      description: 'Modern electronics face critical thermal management challenges as transistor densities increase. This video demonstrates microfluidic cooling strategies where coolant flows through microchannels etched into or beneath heat-generating components. The small length scales enhance heat transfer (higher surface-to-volume ratio) but introduce challenges: increased pressure drop, entrance effects, and potential flow instabilities. Nanofluids - fluids containing nanometer-sized particles - offer enhanced thermal conductivity for improved cooling performance.',
      importance: 'This represents a key practical application of nanofluid heat transfer research. By suspending high-conductivity nanoparticles (Cu, Al₂O₃, carbon nanotubes) in base fluids like water or ethylene glycol, thermal conductivity can increase 20-40% at modest volume fractions. However, viscosity also increases, raising pumping power requirements - a critical tradeoff.',
      relevance: 'Nanofluid Application Context',
      context: 'Our research directly applies to microfluidic thermal management. The nanofluid property ratios we study (A₃ = k_nf/k_f for thermal conductivity, A₁ = μ_nf/μ_f for viscosity) determine the performance tradeoff. Our results show that Cu and Al₂O₃ nanoparticles at φ=5% increase Nu by ~40% (better cooling) but increase Cf by ~12% (higher pumping power). The magnetic field (MHD) adds another control mechanism: applying a magnetic field can reduce flow velocity near walls, potentially preventing hot spots.'
    },
    {
      id: 6,
      file: '/videos/mhd_flow_visualization.mp4',
      title: 'MHD Flow: Magnetohydrodynamics and Applications',
      description: 'Magnetohydrodynamics (MHD) studies the interaction between magnetic fields and electrically conducting fluids. When a conducting fluid moves through a magnetic field, it induces electrical currents (Faraday\'s law), which in turn generate Lorentz forces (J × B) that oppose the motion. This video visualizes how magnetic fields can control, pump, or brake fluid flow without mechanical contact - enabling applications in metallurgy, nuclear fusion, electromagnetic pumps, and flow meters.',
      importance: 'MHD provides contactless flow control with no moving parts, crucial for handling corrosive fluids, liquid metals, or ionized gases. The Hartmann number Ha measures the ratio of magnetic forces to viscous forces: Ha = BL√(σ/μ). At Ha > 1, magnetic forces dominate, fundamentally altering flow structure. In fusion reactors, MHD suppresses turbulence in liquid metal blankets; in continuous casting, it controls molten steel flow.',
      relevance: 'Core of Our MHD Research',
      context: 'Our unsteady MHD Couette flow investigates how magnetic fields affect transient response. Key findings: (1) At Ha=0 (no field), the flow is underdamped with overshoot. (2) At Ha≈2-3, critically damped - fastest approach to steady state without oscillation. (3) At Ha>5, overdamped - sluggish response but high stability. The magnetic damping time scale τ_mag ~ A₄/(A₂Ha²) governs transient behavior. The Lorentz force term -A₂Ha²W acts as distributed resistance, extracting kinetic energy and converting it to Joule heat, which appears in our entropy generation analysis (Ns_magnetic term).'
    }
  ];

  return (
    <div className="section">
      <div className="section-header">
        <h2><Video size={28} /> Educational Videos</h2>
        <p>Fundamental concepts in fluid mechanics, heat transfer, and magnetohydrodynamics</p>
      </div>
      
      <div className="video-library">
        {videos.map((vid) => (
          <div key={vid.id} className="video-card-enhanced">
            <div className="video-player-container">
              <video 
                controls 
                preload="metadata"
                className="video-player"
                onPlay={(e) => {
                  const overlay = e.target.parentElement.querySelector('.video-poster-overlay');
                  if (overlay) overlay.style.display = 'none';
                }}
                onPause={(e) => {
                  const overlay = e.target.parentElement.querySelector('.video-poster-overlay');
                  if (overlay && e.target.currentTime === 0) overlay.style.display = 'flex';
                }}
              >
                <source src={vid.file} type="video/mp4" />
                Your browser does not support the video tag.
              </video>
              <div className="video-poster-overlay">
                <div className="video-poster-content">
                  <div className="play-icon-large">
                    <Play size={64} />
                  </div>
                  <span className="video-title-overlay">{vid.title}</span>
                  <span className="video-duration">Click to play • Video {vid.id}</span>
                </div>
              </div>
            </div>
            
            <div className="video-content-enhanced">
              <div className="video-header-info">
                <h3>
                  <span className="video-number">Video {vid.id}</span>
                  {vid.title}
                </h3>
              </div>
              
              <div className="video-description-section">
                <div className="description-block">
                  <h4><BookOpen size={16} /> Overview</h4>
                  <p>{vid.description}</p>
                </div>
                
                <div className="description-block importance">
                  <h4><Lightbulb size={16} /> Physical Significance</h4>
                  <p>{vid.importance}</p>
                </div>
                
                <div className="description-block context">
                  <h4><Target size={16} /> {vid.relevance}</h4>
                  <p>{vid.context}</p>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const renderFigures = () => {
  const figures = [
    {
      id: 1,
      file: '/images/Validation_Unsteady_Steady.png',
      title: 'Validation: Unsteady → Steady Convergence',
      discussion: 'This figure validates the unsteady solver by comparing the final steady-state solution (τ→∞) with the dedicated steady-state solver. The velocity and temperature profiles show excellent agreement (errors < 10⁻¹⁰), confirming that the transient solver correctly converges to steady state. The convergence plots for Cf and Nu demonstrate asymptotic approach to steady values, while the solver residuals achieve machine precision (10⁻¹⁰), validating the numerical implementation of the Spectral Quasilinearization Method.'
    },
    {
      id: 2,
      file: '/images/Combined_Parameter_Effects.png',
      title: 'Combined Parameter Effects: Ha vs Re Interaction',
      discussion: 'This comprehensive study reveals the interaction between magnetic damping (Ha) and flow inertia (Re). The Cf heatmap shows that increasing Ha suppresses skin friction across all Re values, while Nu increases with both parameters due to enhanced convection. The cross-plot demonstrates that magnetic damping effects are more pronounced at higher Reynolds numbers, where the Lorentz force must overcome stronger inertial effects. This analysis is crucial for optimizing MHD flow control applications.'
    },
    {
      id: 3,
      file: '/images/Eckert_Number_effect.png',
      title: 'Eckert Number Effect: Viscous Dissipation Heating',
      discussion: 'The Eckert number (Ec) quantifies the ratio of kinetic energy to enthalpy. At Ec=0, pure conduction dominates with minimal heat transfer enhancement. As Ec increases to 0.5, viscous dissipation becomes significant, causing Nu to increase four-fold. The normalized response curves show that higher Ec accelerates thermal development, with the system reaching steady state faster. This has important implications for high-speed flows and thermal management systems where viscous heating cannot be neglected.'
    },
    {
      id: 4,
      file: '/images/Energy_Evaluation.png',
      title: 'Energy Evolution: Conservation and Dissipation',
      discussion: 'This analysis confirms energy conservation in the system. Kinetic energy (KE) rapidly saturates as velocity reaches steady state, while thermal energy (TE) increases linearly due to continuous heating from viscous and Joule dissipation. The total energy evolution shows physically correct positive growth. The dissipation split reveals that viscous dissipation contributes ~50% and Joule heating ~50% to total irreversibility, with viscous effects dominating initially (75%) before settling to equilibrium. This validates the thermodynamic consistency of the model.'
    },
    {
      id: 5,
      file: '/images/Enhanced_Unsteady_Solution.png',
      title: 'Enhanced Unsteady Solution: Complete Picture',
      discussion: 'This comprehensive visualization presents all key aspects of the unsteady MHD problem. The velocity evolution shows monotonic approach to steady state at different heights (η), while temperature exhibits non-monotonic behavior due to competing heat sources. The final profiles demonstrate the characteristic Couette velocity distribution and temperature stratification. Contour plots reveal the spatio-temporal development of both fields, with the 3D surfaces providing intuitive understanding of the solution topology. The normalized response and rate of change plots confirm exponential convergence, characteristic of overdamped systems with Ha=2.'
    },
    {
      id: 6,
      file: '/images/Entropy_Analysis.png',
      title: 'Entropy Generation Analysis: Second Law Thermodynamics',
      discussion: 'The entropy generation distribution shows peak irreversibility near the lower plate where velocity gradients are steepest. The integrated entropy evolution reveals that thermal irreversibility initially dominates (Be≈0.7), but friction and Joule heating become comparable at steady state (Be≈0.34), indicating balanced dissipation mechanisms. Parametric studies show entropy decreases with Ha (due to reduced velocity gradients) but increases dramatically with Ec (viscous heating). The final Bejan number Be=0.335 confirms that friction irreversibility slightly dominates in this configuration, critical for thermodynamic optimization of MHD devices.'
    },
    {
      id: 7,
      file: '/images/Grid_Convergence.png',
      title: 'Grid Convergence: Spectral Accuracy',
      discussion: 'The spectral collocation method demonstrates exponential convergence - a hallmark of spectral methods for smooth solutions. At N=20, the solution achieves 10-digit accuracy (error~10⁻¹⁰), confirming spectral convergence. Beyond N=40, round-off errors dominate, showing the practical limit of double-precision arithmetic. The computational cost grows quadratically with N, but the extreme accuracy at modest grid sizes (N=50 chosen for production runs) makes spectral methods ideal for this smooth MHD problem. This validates the choice of Chebyshev collocation over finite difference methods.'
    },
    {
      id: 8,
      file: '/images/Hartman_Number_Effect.png',
      title: 'Hartmann Number Effect: Magnetic Damping Regimes',
      discussion: 'This study reveals three distinct damping regimes: (1) Ha=0: underdamped with ~0.85% overshoot, (2) Ha=2-4: critically damped with minimal overshoot and fastest response (τ₉₅≈0.15), and (3) Ha>6: overdamped with no overshoot but sluggish response (τ₉₅≈0.05). The normalized response curves transition from oscillatory to monotonic as Ha increases. The final Cf values decrease nonlinearly with Ha², confirming the quadratic Lorentz force relationship. The response time comparison shows Ha≈2-3 provides optimal control - fast settling without oscillations - making it ideal for MHD flow regulation applications.'
    },
    {
      id: 9,
      file: '/images/Limiting_Case_Compareson.png',
      title: 'Limiting Cases Validation',
      discussion: 'This systematic validation tests the code against known analytical and limiting solutions: (1) Ha=0 recovers classical Couette flow with linear velocity, (2) Ec=0 eliminates viscous heating showing pure conduction, (3) λ=0 enforces no-slip condition, (4) G=0 removes pressure-driven component, (5) Bi→∞ approaches isothermal upper boundary, and (6) Re=0 gives Poiseuille flow from pressure gradient alone. All cases match theoretical expectations with machine precision, confirming the versatility and correctness of the numerical implementation across the entire parameter space.'
    },
    {
      id: 10,
      file: '/images/Nanao_Particle_Comparison.png',
      title: 'Nanoparticle Comparison: Cu vs Al₂O₃',
      discussion: 'Copper (Cu) and alumina (Al₂O₃) nanoparticles show nearly identical behavior in friction and heat transfer metrics. Both exhibit linear enhancement with volume fraction φ: increasing from φ=0% to φ=10% raises Cf by ~20% (due to increased viscosity) and Nu by ~75% (enhanced thermal conductivity). The performance map reveals Cu and Al₂O₃ follow the same trajectory, suggesting that for this flow regime, the nanoparticle type is less important than the volume fraction. The slight Cu advantage (2-3% higher k) is negligible compared to viscosity penalties. This finding suggests Al₂O₃ may be preferred due to lower cost and better stability.'
    },
    {
      id: 11,
      file: '/images/Overshoot_Damping_Analysis.png',
      title: 'Overshoot & Damping Classification',
      discussion: 'This detailed analysis characterizes the transient overshoot phenomenon. The absolute response shows clear overshoot only for Ha<2, while normalized curves reveal the approach to unity (final value). Peak overshoot occurs at Ha≈6 with ~0.85% excess, while critically damped behavior (Ha≈2-3) minimizes overshoot while maintaining fast response. The time-to-peak decreases exponentially with Ha, and settling time follows similar trends. The phase plane trajectories spiral for low Ha (underdamped) and curve smoothly for high Ha (overdamped). The overshoot vs settling time plot identifies the optimal zone: Ha=2-3 provides the best compromise between speed and stability for control applications.'
    },
    {
      id: 12,
      file: '/images/Prand_Number_Effect.png',
      title: 'Prandtl Number Effect: Thermal Diffusion',
      discussion: 'The Prandtl number (Pr) quantifies the relative thickness of momentum and thermal boundary layers. At Pr=0.7 (gases), thermal diffusion dominates, resulting in thick thermal layers and low Nu≈0.4. For Pr=6.2 (water), the thermal layer is much thinner than the momentum layer, increasing Nu≈0.95. High-Pr fluids (Pr=15, oils) have very thin thermal boundary layers, further enhancing heat transfer to Nu≈1.38. The evolution curves show that higher Pr fluids reach thermal steady state more slowly due to lower thermal diffusivity. This demonstrates the critical role of working fluid selection in MHD heat exchangers.'
    },
    {
      id: 13,
      file: '/images/Reynold_Number_Effect.png',
      title: 'Reynolds Number Effect: Flow Inertia',
      discussion: 'Reynolds number represents the dimensionless upper plate velocity. The evolution curves show that higher Re leads to proportionally higher final skin friction - Cf increases linearly with Re (slope≈-0.5), confirming the direct relationship between plate speed and wall shear stress. The normalized response curves collapse onto a single trajectory, indicating that Re does not affect the transient dynamics (τ₉₅ remains constant). This separation of timescale and amplitude is characteristic of linear systems and confirms that the magnetic damping timescale (governed by Ha) is independent of the driving velocity. This simplifies control system design for MHD applications.'
    },
    {
      id: 14,
      file: '/images/Time_step_Convergence.png',
      title: 'Time Step Convergence: Temporal Accuracy',
      discussion: 'The temporal discretization study confirms first-order accuracy of the implicit Euler method. As time step Δτ decreases, the solution converges linearly (error ∝ Δτ) to the exact value Cf=-0.6596966422. The convergence plot on log-log scale shows a slope of 1.0, verifying first-order temporal accuracy. At Δτ=0.001, the error is ~10⁻⁶, sufficient for most applications. While higher-order methods (RK4, BDF2) could reduce errors further, the implicit Euler scheme provides excellent stability for stiff MHD problems with strong magnetic damping. The chosen Δτ=0.02 balances accuracy and computational efficiency for parametric studies.'
    }
  ];

  return (
    <div className="section">
      <div className="section-header">
        <h2><Image size={28} /> Research Figures</h2>
        <p>Comprehensive visual analysis of unsteady MHD nanofluid Couette flow</p>
      </div>
      
      <div className="figures-gallery">
        {figures.map((fig) => (
          <div key={fig.id} className="figure-card">
            <div className="figure-image-container">
              <img 
                src={fig.file} 
                alt={fig.title}
                className="figure-image"
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.nextSibling.style.display = 'flex';
                }}
              />
              <div className="figure-placeholder" style={{ display: 'none' }}>
                <Image size={48} />
                <span>Fig {fig.id}</span>
              </div>
            </div>
            <div className="figure-content">
              <h3>
                <span className="figure-number">Figure {fig.id}</span>
                {fig.title}
              </h3>
              <p className="figure-discussion">{fig.discussion}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
const renderResultsLibrary = () => {
  if (libraryLoading) {
    return (
      <div className="section">
        <div className="section-header">
          <h2><Award size={28} /> Results Library</h2>
          <p>Loading your saved simulations...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="section">
      <div className="section-header">
        <h2><Award size={28} /> Results Library</h2>
        <p>Browse and manage your saved simulation results</p>
      </div>

      {libraryResults.length === 0 ? (
        <div className="physics-box" style={{ textAlign: 'center', padding: 'var(--space-xl)' }}>
          <Award size={48} style={{ color: 'var(--accent-purple)', opacity: 0.3, marginBottom: 'var(--space-md)' }} />
          <h3 style={{ color: 'var(--text-secondary)', marginBottom: 'var(--space-sm)' }}>No Saved Results Yet</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            Run a simulation and click "Save Results" to start building your library
          </p>
        </div>
      ) : (
        <div className="results-library-grid">
          {libraryResults.map((result, index) => (
            <div key={result.id} className="library-result-card">
              <div className="library-card-header">
                <span className="result-number">#{libraryResults.length - index}</span>
                <span className="result-date">
                  {new Date(result.created_at).toLocaleDateString('en-US', { 
                    month: 'short', 
                    day: 'numeric', 
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </span>
              </div>

              {result.notes && (
                <div className="library-notes">
                  <strong>Notes:</strong> {result.notes}
                </div>
              )}

              <div className="library-params">
                <h4>Parameters:</h4>
                <div className="param-tags">
                  <span className="param-tag">Ha = {result.params.Ha?.toFixed(2)}</span>
                  <span className="param-tag">Re = {result.params.Re?.toFixed(2)}</span>
                  <span className="param-tag">Pr = {result.params.Pr?.toFixed(2)}</span>
                  <span className="param-tag">Ec = {result.params.Ec?.toFixed(2)}</span>
                  <span className="param-tag">Bi = {result.params.Bi?.toFixed(2)}</span>
                  <span className="param-tag">λ = {result.params.lambda?.toFixed(2)}</span>
                </div>
              </div>

              <div className="library-metrics">
                <h4>Results:</h4>
                <div className="metrics-row">
                  <div className="metric-item">
                    <span className="metric-label">Cf (Final)</span>
                    <span className="metric-value purple">{result.metrics.CfFinal?.toFixed(4)}</span>
                  </div>
                  <div className="metric-item">
                    <span className="metric-label">Nu (Final)</span>
                    <span className="metric-value pink">{result.metrics.NuFinal?.toFixed(4)}</span>
                  </div>
                  <div className="metric-item">
                    <span className="metric-label">τ₉₅</span>
                    <span className="metric-value amber">{result.metrics.tau95?.toFixed(3)}</span>
                  </div>
                  <div className="metric-item">
                    <span className="metric-label">Overshoot</span>
                    <span className="metric-value teal">{result.metrics.overshoot?.toFixed(1)}%</span>
                  </div>
                </div>
              </div>

              <div className="library-actions">
                <button 
                  className="library-btn load-btn"
                  onClick={() => {
                    setParams(result.params);
                    setActiveTab('transient');
                    alert('✅ Parameters loaded! Switched to Transient tab.');
                  }}
                >
                  <Download size={14} /> Load Parameters
                </button>
                <button 
                  className="library-btn export-btn"
                  onClick={() => {
                    const dataStr = JSON.stringify(result, null, 2);
                    const dataBlob = new Blob([dataStr], { type: 'application/json' });
                    const url = URL.createObjectURL(dataBlob);
                    const link = document.createElement('a');
                    link.href = url;
                    link.download = `mhd-result-${result.id}.json`;
                    link.click();
                  }}
                >
                  <Download size={14} /> Export JSON
                </button>
                <button 
                  className="library-btn delete-btn"
                  onClick={() => {
                    if (window.confirm('Delete this result permanently?')) {
                      deleteResult(result.id).then(() => {
                        setLibraryResults(prev => prev.filter(r => r.id !== result.id));
                      });
                    }
                  }}
                >
                  <X size={14} /> Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
  const renderTheory = () => (
    <div className="theory-section">
      <div className="theory-grid">
        <div className="theory-card"><h3><Activity size={20} /> Unsteady Momentum Equation</h3><div className="equation">A₄ ∂W/∂τ = A₁ ∂²W/∂η² - A₂·Ha²·W + G</div><p>Time-dependent velocity with inertia (A₄), viscous diffusion (A₁), Lorentz damping (Ha²), and pressure gradient (G).</p></div>
        <div className="theory-card"><h3><Thermometer size={20} /> Unsteady Energy Equation</h3><div className="equation">A₅·Pr ∂θ/∂τ = A₃ ∂²θ/∂η² + A₁·Pr·Ec·(W')² + A₂·Pr·Ec·Ha²·W²</div><p>Temperature evolution with thermal inertia (A₅), conduction (A₃), viscous dissipation, and Joule heating.</p></div>
        <div className="theory-card"><h3><Waves size={20} /> Boundary Conditions</h3><div className="equation">η=0: W=0, θ=1 (no-slip, isothermal)<br/>η=1: W-λW'=Re, θ'+Bi·θ=0 (slip, convective)</div><p>Lower plate: fixed, hot. Upper plate: moving with slip, convective cooling.</p></div>
        <div className="theory-card"><h3><Timer size={20} /> Response Metrics</h3><div className="equation">τ₆₃ = time to 63% | τ₉₅ = time to 95%<br/>Overshoot = (Max - Final) / Final × 100%</div><p>Standard transient response characterization from control theory.</p></div>
        <div className="theory-card full"><h3><Droplets size={20} /> Nanofluid Property Ratios</h3><div className="equation-grid"><div className="eq">A₁ = μₙf/μf</div><div className="eq">A₂ = σₙf/σf</div><div className="eq">A₃ = kₙf/kf</div><div className="eq">A₄ = ρₙf/ρf</div><div className="eq">A₅ = (ρCp)ₙf/(ρCp)f</div></div><p>A₄ and A₅ are crucial for transient behavior - they represent fluid inertia and thermal capacitance.</p></div>
        <div className="theory-card full"><h3><BarChart3 size={20} /> Entropy Generation</h3><div className="equation">Ns = A₃(θ')²/θ² + A₁·Ec·Pr·(W')²/θ + A₂·Ec·Pr·Ha²·W²/θ<br/>Bejan Number: Be = Ns,heat / Ns,total</div><p>Three sources: heat conduction, viscous friction, magnetic (Joule). Be &gt; 0.5 means heat transfer irreversibility dominates.</p></div>
      </div>
    </div>
  );

  return (
    <div className="app">
      <header className="header">
        <div className="header-content">
          <div className="logo"><div className="logo-icon"><Waves size={24} /></div><div className="logo-text"><h1>Unsteady MHD Nanofluid</h1><p>Transient Couette Flow Analysis</p></div></div>
          <nav className="nav">
            {[
              { id: 'transient', icon: Clock, label: 'Transient' },
              { id: 'profiles', icon: TrendingUp, label: 'Profiles' },
              { id: 'energy', icon: Zap, label: 'Energy' },
              { id: 'parametric', icon: LineChartIcon, label: 'Parametric' },
              { id: 'ailab', icon: Brain, label: 'AI Lab' },
              { id: 'education', icon: BookOpen, label: 'Education' }, 
              { id: 'results', icon: Award, label: 'Results Library' },
              { id: 'presets', icon: FlaskConical, label: 'Presets' },
              { id: 'videos', icon: Video, label: 'Videos' },
              { id: 'figures', icon: Image, label: 'Figures' },
              { id: 'theory', icon: BookOpen, label: 'Theory' }
            ].map(t => (
              <button key={t.id} className={`nav-tab ${activeTab === t.id ? 'active' : ''}`} onClick={() => setActiveTab(t.id)}><t.icon size={16} /><span className="tab-label">{t.label}</span></button>
            ))}
          </nav>
        </div>
      </header>
      <main className="main">
        {activeTab === 'transient' && renderTransient()}
        {activeTab === 'profiles' && renderProfiles()}
        {activeTab === 'energy' && renderEnergy()}
        {activeTab === 'parametric' && renderParametric()}
        {activeTab === 'ailab' && renderAILab()}
        {activeTab === 'education' && renderEducationTab()} {/* NEW */}
        {activeTab === 'results' && renderResultsLibrary()}
        {activeTab === 'presets' && renderPresets()}
        {activeTab === 'videos' && renderVideos()}
        {activeTab === 'figures' && renderFigures()}
        {activeTab === 'theory' && renderTheory()}
      </main>
      <FloatingControls />
      <footer className="footer"><p><strong>Research:</strong> Unsteady MHD Nanofluid Couette Flow with Heat Transfer | <strong>Candidate:</strong> Mr. S.I. Mosala | <strong>Supervisor:</strong> Prof. O.D. Makinde | Nelson Mandela University | 2025</p></footer>
    </div>
  );
}

export default App;