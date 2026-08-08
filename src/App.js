import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  AreaChart, Area, Legend
} from 'recharts';
import {
  Zap, Thermometer, Play, Pause, Image, BookOpen,
  Droplets, Magnet, Activity, BarChart3, Clock, TrendingUp,
  Sliders, X, ChevronDown, Timer,
  Check, Download, Copy,
  FastForward, SkipForward, Square, Waves, GitCompare,
  Rocket, Info, Box,
  HelpCircle, AlertCircle, Eye, Wind, Book,
  Award, Cpu
} from 'lucide-react';
import katex from 'katex';
import 'katex/dist/katex.min.css';

// Render a LaTeX string to HTML with KaTeX. `block` uses display mode.
const TeX = ({ math, block = false }) => {
  const html = useMemo(() => {
    try {
      return katex.renderToString(math, { displayMode: block, throwOnError: false });
    } catch (e) {
      return math;
    }
  }, [math, block]);
  return <span className={block ? 'tex-block' : 'tex-inline'} dangerouslySetInnerHTML={{ __html: html }} />;
};

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
    content: "Temperature is measured as the dimensionless rise above ambient, θ = (T - Ta)/Ta. It starts at θ=0 at the fixed lower plate and grows inside the gap because viscous dissipation and Joule heating add energy to the fluid. The Biot number sets how strongly the upper plate convects that heat away.",
    keyPoints: [
      "θ=0 at the lower plate (fixed ambient temperature)",
      "Upper plate has convective cooling (Robin boundary condition)",
      "Ec (Eckert) controls viscous heating intensity",
      "Ha² appears in the Joule heating term (magnetic heating)"
    ],
    interpretation: {
      title: "Thermal Analysis:",
      points: [
        "Interior peak in θ = dissipation heating exceeds conductive removal",
        "Large peak θ = weak cooling (low Bi) or strong heating (high Ec, Re)",
        "θ nearly flat = low dissipation or strong convective cooling",
        "Steep gradient near a wall = boundary layer dominated"
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
    max: 7,
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
    max: 10,
    typical: [1, 10],
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
    max: 0.1,
    typical: [0, 0.1],
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
    max: 20,
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
    max: 10,
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

// Thomas algorithm: solve a tridiagonal system with sub-diagonal a, diagonal b,
// super-diagonal c and right-hand side d. Returns the solution vector x.
function solveTridiagonal(a, b, c, d) {
  const m = b.length;
  const cp = new Array(m), dp = new Array(m), x = new Array(m);
  cp[0] = c[0] / b[0];
  dp[0] = d[0] / b[0];
  for (let i = 1; i < m; i++) {
    const denom = b[i] - a[i] * cp[i - 1];
    cp[i] = c[i] / denom;
    dp[i] = (d[i] - a[i] * dp[i - 1]) / denom;
  }
  x[m - 1] = dp[m - 1];
  for (let i = m - 2; i >= 0; i--) x[i] = dp[i] - cp[i] * x[i + 1];
  return x;
}

// Closed-form steady velocity from Revision1 Eq. (exactsoln): the analytic
// solution of A1 W'' - A2 Ha^2 W + G = 0 with W(0)=0 and W(1)=Re-lambda*W'(1).
// Used to validate the transient solver in the t -> infinity limit.
function exactSteadyVelocity(eta, { A1, A2, Ha, G, Re, lambda }) {
  const k = Ha * Math.sqrt(A2 / A1);
  const p = G / (A2 * Ha * Ha);
  const C1 = -p;
  const C2 = (Re + p * (Math.cosh(k) - 1 + lambda * k * Math.sinh(k))) /
             (Math.sinh(k) + lambda * k * Math.cosh(k));
  return C1 * Math.cosh(k * eta) + C2 * Math.sinh(k * eta) + p;
}

function solveUnsteadyMHDCouette(params, tauFinal = 2.0, dtau = 0.02, saveFreq = 5) {
  const { A1, A2, A3, A4, A5, Re, Ha, Pr, Ec, Bi, lambda, G, N = 50 } = params;
  
  const h = 1.0 / N;
  const eta = Array.from({ length: N + 1 }, (_, i) => i * h);
  
  let W = new Array(N + 1).fill(0);
  // Initial condition from Revision1 Eq. (dimensionless BC): theta(eta,0) = 0.
  // The lower plate sits at ambient temperature, so the dimensionless
  // temperature starts at zero everywhere and rises through dissipation.
  let Theta = new Array(N + 1).fill(0);
    
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

    // Momentum: implicit (backward Euler in time) tridiagonal solve of
    // A4/dtau (W - W_old) = A1 W'' - A2 Ha^2 W + G. The system is linear and
    // does not depend on temperature, so a single direct solve is exact for
    // this step (no inner iteration needed) and unconditionally stable.
    {
      const a = new Array(N + 1).fill(0), b = new Array(N + 1).fill(0);
      const c = new Array(N + 1).fill(0), d = new Array(N + 1).fill(0);
      for (let i = 1; i < N; i++) {
        a[i] = -A1 / (h * h);
        b[i] = 2 * A1 / (h * h) + A2 * Ha * Ha + A4 / dtau;
        c[i] = -A1 / (h * h);
        d[i] = G + (A4 / dtau) * W_old[i];
      }
      // Lower plate no-slip: W(0) = 0.
      b[0] = 1; c[0] = 0; d[0] = 0;
      // Upper plate Navier slip: (1 + lambda/h) W[N] - (lambda/h) W[N-1] = Re.
      a[N] = -lambda / h; b[N] = 1 + lambda / h; d[N] = Re;
      W = solveTridiagonal(a, b, c, d);
    }

    // Velocity gradient (central interior, one-sided walls) for the source terms.
    for (let i = 1; i < N; i++) Wp[i] = (W[i + 1] - W[i - 1]) / (2 * h);
    Wp[0] = (W[1] - W[0]) / h; Wp[N] = (W[N] - W[N - 1]) / h;

    // Energy: implicit tridiagonal solve of
    // A5 Pr/dtau (Theta - Theta_old) = A3 Theta'' + viscous + Joule heating,
    // with the dissipation source evaluated from the velocity just solved.
    {
      const a = new Array(N + 1).fill(0), b = new Array(N + 1).fill(0);
      const c = new Array(N + 1).fill(0), d = new Array(N + 1).fill(0);
      for (let i = 1; i < N; i++) {
        const source = A1 * Pr * Ec * Wp[i] * Wp[i] + A2 * Pr * Ec * Ha * Ha * W[i] * W[i];
        a[i] = -A3 / (h * h);
        b[i] = 2 * A3 / (h * h) + A5 * Pr / dtau;
        c[i] = -A3 / (h * h);
        d[i] = source + (A5 * Pr / dtau) * Theta_old[i];
      }
      // Lower plate at ambient temperature: Theta(0) = 0.
      b[0] = 1; c[0] = 0; d[0] = 0;
      // Upper plate convective Robin: (1 + h*Bi) Theta[N] - Theta[N-1] = 0.
      a[N] = -1; b[N] = 1 + h * Bi; d[N] = 0;
      Theta = solveTridiagonal(a, b, c, d);
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
    // Dimensionless entropy generation number (Revision1 Eq. dimlessNs):
    // Ns = A3*(dtheta/deta)^2 + A1*Ec*Pr*(dW/deta)^2 + A2*Pr*Ec*Ha^2*W^2.
    // No division by local temperature: the ambient temperature Ta is already
    // absorbed into the nondimensional groups, so the denominators are constant.
    const ns_h = A3 * (tp * tp);
    const ns_f = A1 * Ec * Pr * (wp * wp);
    const ns_m = A2 * Ec * Pr * Ha * Ha * (W_final[i] * W_final[i]);
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
  // Transient evolution of the entropy generation number and Bejan number.
  // At each saved time we report the domain-averaged Ns and Be, plus the
  // peak Ns, so the flagship tab can show these irreversibility measures
  // developing in time alongside the skin friction and Nusselt number.
  const NsAvgHistory = [], NsMaxHistory = [], BeAvgHistory = [];
  for (let t = 0; t < WHistory.length; t++) {
    let KE = 0, TE = 0, VD = 0, JH = 0;
    let nsSum = 0, beSum = 0, nsMax = 0;
    for (let i = 0; i <= N; i++) {
      const Wt = WHistory[t], Tt = ThetaHistory[t];
      const wp = i === 0 ? (Wt[1] - Wt[0]) / h : i === N ? (Wt[N] - Wt[N - 1]) / h : (Wt[i + 1] - Wt[i - 1]) / (2 * h);
      const tp = i === 0 ? (Tt[1] - Tt[0]) / h : i === N ? (Tt[N] - Tt[N - 1]) / h : (Tt[i + 1] - Tt[i - 1]) / (2 * h);
      const ns_h = A3 * (tp * tp);
      const ns_f = A1 * Ec * Pr * (wp * wp);
      const ns_m = A2 * Ec * Pr * Ha * Ha * (Wt[i] * Wt[i]);
      const nsTot = ns_h + ns_f + ns_m;
      nsSum += nsTot; nsMax = Math.max(nsMax, nsTot);
      beSum += ns_h / (nsTot + 1e-12);
      if (i < N) {
        KE += 0.5 * (Wt[i] ** 2 + Wt[i + 1] ** 2) * h;
        TE += 0.5 * (Tt[i] + Tt[i + 1]) * h;
        const wp_i = (Wt[i + 1] - Wt[i]) / h;
        VD += A1 * Pr * Ec * wp_i ** 2 * h;
        JH += A2 * Pr * Ec * Ha * Ha * Wt[i] ** 2 * h;
      }
    }
    kineticEnergy.push(KE); thermalEnergy.push(TE); viscousDissipation.push(VD); jouleHeating.push(JH);
    NsAvgHistory.push(nsSum / (N + 1)); NsMaxHistory.push(nsMax); BeAvgHistory.push(beSum / (N + 1));
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
    Ns_avg: NsAvgHistory[t], Ns_max: NsMaxHistory[t], Be_avg: BeAvgHistory[t],
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

// ═══════════════════════════════════════════════════════════════════════════
// NANOPARTICLE DATABASE
// ═══════════════════════════════════════════════════════════════════════════

// Only the two nanoparticles used in the manuscript (MMNSA) are offered. The
// property values match the manuscript's thermophysical properties table
// (base fluid: water, rho_f=997.1, k_f=0.613, Cp_f=4179, sigma_f=5.5e-6).
const NANOPARTICLES = {
  'Cu': { name: 'Copper (Cu)', icon: '🟤', rho: 8933, k: 401, Cp: 385, sigma: 58e6, desc: 'High thermal and electrical conductivity' },
  'Al2O3': { name: 'Alumina (Al₂O₃)', icon: '⚪', rho: 3970, k: 40, Cp: 765, sigma: 1e-10, desc: 'Ceramic, electrically insulating' }
};

function computeNanofluidProperties(type, phi) {
  const rho_f = 997, k_f = 0.613, Cp_f = 4179, sigma_f = 5.5e-6;
  if (!NANOPARTICLES[type]) return { A1: 1.2, A2: 1.5, A3: 1.3, A4: 1.1, A5: 1.15 };
  const p = NANOPARTICLES[type];
  const A4 = ((1 - phi) * rho_f + phi * p.rho) / rho_f;
  const A1 = 1 / Math.pow(1 - phi, 2.5);
  const A3 = (p.k + 2*k_f - 2*phi*(k_f - p.k)) / (p.k + 2*k_f + phi*(k_f - p.k));
  const A5 = ((1 - phi) * rho_f * Cp_f + phi * p.rho * p.Cp) / (rho_f * Cp_f);
  const sr = p.sigma / sigma_f;
  const A2 = 1 + 3 * phi * (sr - 1) / (sr + 2 - phi * (sr - 1));
  return { A1, A2, A3, A4, A5 };
}

// ═══════════════════════════════════════════════════════════════════════════
// AI/ML ENGINE
// ═══════════════════════════════════════════════════════════════════════════
// ENHANCED FLOW VISUALIZATION COMPONENT
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
    
    let platePhase = 0;
    const drawBaseLayer = () => {
      const { ctx } = base;

      // Clear
      ctx.fillStyle = 'rgba(5,8,16,0.15)';
      ctx.fillRect(0, 0, width, height);

      // Upper (moving Couette) plate: solid bar plus scrolling chevrons that
      // advance at a rate proportional to Re, so the drive is visibly moving.
      ctx.fillStyle = 'rgba(139,92,246,0.85)';
      ctx.fillRect(0, 0, width, 5);
      platePhase = (platePhase + Math.max(0.15, params.Re * 0.6)) % 22;
      ctx.strokeStyle = 'rgba(255,255,255,0.85)';
      ctx.lineWidth = 2;
      for (let x = -22 + platePhase; x < width; x += 22) {
        ctx.beginPath();
        ctx.moveTo(x, 6);
        ctx.lineTo(x + 9, 11);
        ctx.stroke();
      }

      // Lower (stationary) plate
      ctx.fillStyle = 'rgba(236,72,153,0.7)';
      ctx.fillRect(0, height - 4, width, 4);

      // Grid lines
      ctx.strokeStyle = 'rgba(251,191,36,0.06)';
      ctx.setLineDash([4, 8]);
      ctx.lineWidth = 1;
      for (let x = 25; x < width; x += 40) {
        ctx.beginPath();
        ctx.moveTo(x, 12);
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
      ctx.fillStyle = 'rgba(255,255,255,0.95)';
      ctx.textAlign = 'left';
      ctx.fillText(`Moving Couette wall, Re=${params.Re.toFixed(1)} (η=1)`, 6, 24);

      ctx.fillStyle = 'rgba(236,72,153,0.9)';
      ctx.fillText('Stationary wall, ambient (η=0)', 6, height - 10);
      
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
          op: " = ",
          description: "Temporal inertia term - represents fluid acceleration over time",
          significance: "Higher A₄ means more resistance to change, slower transient response"
        },
        {
          id: "viscous",
          text: "A₁∂²W/∂η²",
          op: " − ",
          description: "Viscous diffusion - momentum spreading through viscosity",
          significance: "Dominant near walls, responsible for velocity profile development"
        },
        {
          id: "magnetic",
          text: "A₂Ha²W",
          op: " + ",
          description: "Lorentz force - magnetic damping proportional to velocity",
          significance: "Acts as distributed drag, stabilizes flow, prevents oscillations"
        },
        {
          id: "pressure",
          text: "G",
          op: "",
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
          op: " = ",
          description: "Thermal inertia - temperature change over time",
          significance: "Higher A₅ means slower thermal response"
        },
        {
          id: "conduction",
          text: "A₃∂²θ/∂η²",
          op: " + ",
          description: "Heat conduction through fluid",
          significance: "Primary heat transfer mechanism in stationary fluid"
        },
        {
          id: "viscous_heating",
          text: "A₁PrEc(∂W/∂η)²",
          op: " + ",
          description: "Viscous dissipation - mechanical energy converted to heat",
          significance: "Important at high shear rates, raises the interior temperature"
        },
        {
          id: "joule_heating",
          text: "A₂PrEcHa²W²",
          op: "",
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
          {eq.terms.map((term) => (
            <span
              key={term.id}
              className={`equation-term ${activeTerm === term.id ? 'active' : ''}`}
              onMouseEnter={() => setActiveTerm(term.id)}
              onMouseLeave={() => setActiveTerm(null)}
              onClick={() => setActiveTerm(activeTerm === term.id ? null : term.id)}
            >
              {term.text}
              {term.op && <span className="equation-op">{term.op}</span>}
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
          <span className="slider-value">{Number.isFinite(value) ? value.toFixed(3) : '--'}{unit}</span>
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
          {label} {info && <span className="info-icon" title={info}>ⓘ</span>}
          {paramErrors.length > 0 && <span className="validity-status validity-invalid">Invalid</span>}
          {isValid && !isTypical && paramWarnings.length === 0 && <span className="validity-status validity-warning">Atypical</span>}
          {isValid && isTypical && <span className="validity-status validity-valid">Typical</span>}
        </span>
        <span className="slider-value">{Number.isFinite(value) ? value.toFixed(3) : '--'}{unit}</span>
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
function App() {
  const [activeTab, setActiveTab] = useState('transient');
  const [controlsOpen, setControlsOpen] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [copied, setCopied] = useState(false);
  
  // Defaults are the Revision1 baseline case: Cu-Water at phi = 0.05 with
  // Ha=2, Ec=0.01, lambda=0.1, G=1, Re=5, Bi=0.5, Pr=6.82. The app therefore
  // opens on a parameter set that reproduces a named figure from the paper.
  const [params, setParams] = useState({
  ...computeNanofluidProperties('Cu', 0.05),
  Re: 5, Ha: 2.0, Pr: 6.82, Ec: 0.01, Bi: 0.5, lambda: 0.1, G: 1, N: 50
});
  const [tauFinal, setTauFinal] = useState(5.0);
  const [selectedNP, setSelectedNP] = useState('Cu');
  const [phi, setPhi] = useState(0.05);
  
  const [compareMode, setCompareMode] = useState(false);
  const [compareParams, setCompareParams] = useState({ ...params });

  // Flow visualization layer toggles and parameter validation feedback.
  const [showStreamlines, setShowStreamlines] = useState(true);
  const [showHeatmap, setShowHeatmap] = useState(true);
  const [showFieldLines, setShowFieldLines] = useState(true);
  const [validationResult, setValidationResult] = useState({ warnings: [], errors: [], isValid: true });
  const solution = useMemo(() => solveUnsteadyMHDCouette(params, tauFinal, 0.02, 5), [params, tauFinal]);

  // Live reproduction of the Revision1 exact-solution validation (Table and
  // Figure_ExactValidation): Cu-Water phi=0.10, Ha=0.1, G=1, Re=0.1, lambda=0.1.
  // Runs the app solver to large tau and compares to the closed-form steady
  // velocity. The maximum absolute error is measured, not hard coded.
  const exactValidation = useMemo(() => {
    const props = computeNanofluidProperties('Cu', 0.10);
    const P = { ...props, Re: 0.1, Ha: 0.1, Pr: 6.2, Ec: 0.01, Bi: 0.5, lambda: 0.1, G: 1, N: 100 };
    const sol = solveUnsteadyMHDCouette(P, 6.0, 0.02, 2);
    const Wfd = sol.WHistory[sol.WHistory.length - 1];
    let maxErr = 0;
    const data = sol.eta.map((e, i) => {
      const wex = exactSteadyVelocity(e, P);
      maxErr = Math.max(maxErr, Math.abs(Wfd[i] - wex));
      return { eta: e, exact: wex, app: Wfd[i] };
    });
    // Six-node benchmark table exactly as reported in Revision1 (W exact column).
    // The app value is read from the live solver; the error and PASS/FAIL are
    // computed here, not hard coded. Tolerance 1e-3 (the app FD error is ~3.5e-4).
    const paperExact = { 0: 0, 0.3: 0.118274, 0.5: 0.158756, 0.7: 0.168564, 0.9: 0.147703, 1.0: 0.125769 };
    const tol = 1e-3;
    const table = [0, 0.3, 0.5, 0.7, 0.9, 1.0].map((e) => {
      const idx = Math.round(e * P.N);
      const app = Wfd[idx];
      const paper = paperExact[e];
      const err = Math.abs(app - paper);
      return { eta: e, paper, app, err, pass: err < tol };
    });
    return { data: data.filter((_, i) => i % 4 === 0), maxErr, table, tol };
  }, []);
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
  
  const updateParam = useCallback((k, v) => setParams(prev => ({ ...prev, [k]: v })), []);
  const updateCompareParam = useCallback((k, v) => setCompareParams(prev => ({ ...prev, [k]: v })), []);
  const applyNP = useCallback((t) => { if (t === 'Custom') { setSelectedNP('Custom'); return; } const props = computeNanofluidProperties(t, phi); setParams(prev => ({ ...prev, ...props })); setSelectedNP(t); }, [phi]);
  const resetSim = () => { setCurrentTime(0); setIsPlaying(false); };
  const exitCompareMode = () => setCompareMode(false);

  const exportData = () => {
    const csv = ['tau,Cf_lower,Nu_lower,KE,TE', ...solution.evolutionData.map(d => `${d.tau},${d.Cf_lower},${d.Nu_lower},${d.KE},${d.TE}`)].join('\n');
    const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv' })); a.download = 'unsteady_mhd_data.csv'; a.click();
  };
  
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
                {Object.entries(NANOPARTICLES).map(([k, np]) => <option key={k} value={k}>{np.icon} {np.name}</option>)}
              </select>
            </div>
            <p className="np-desc">{NANOPARTICLES[selectedNP]?.desc}</p>
            <Slider label="φ (Volume %)" value={phi * 100} onChange={(v) => { setPhi(v / 100); applyNP(selectedNP); }} min={0} max={10} step={0.1} unit="%" />
            {/* The property ratios A1..A5 are computed from the particle and phi
                using the Brinkman, Maxwell and mixing models (they are not free
                controls). They are shown here read-only so the values are visible. */}
            <div className="derived-ratios">
              <span>A₁={params.A1.toFixed(3)}</span>
              <span>A₂={params.A2.toFixed(3)}</span>
              <span>A₃={params.A3.toFixed(3)}</span>
              <span>A₄={params.A4.toFixed(3)}</span>
              <span>A₅={params.A5.toFixed(3)}</span>
            </div>
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
      <div className="section-header">
        <h2><Clock size={28} /> Transient simulation</h2>
        <p>Watch the flow start from rest and relax to steady state. Press Play to advance dimensionless time τ; the readout below the controls shows the current τ. Defaults are the manuscript (MMNSA) baseline (Cu-Water, φ=0.05, Ha=2, Re=5, λ=0.1, G=1, Bi=0.5, Ec=0.01). Open the sliders (gear, lower right) to change parameters; the live plots show velocity, temperature, skin friction, Nusselt number, entropy generation, and the Bejan number.</p>
      </div>
      <PhysicsInfoBox topic="transient" />
      <ResultsPanel />

      {PlaybackControls()}

      <p className="viz-caption">
        You are looking down the channel between the two walls. The upper wall (top, moving) drives the flow at Re; the lower wall is stationary. The fluid starts from rest, momentum diffuses inward, and the profile relaxes to the steady Couette shape. Colour shows the temperature rising through viscous and Joule heating. Press Play to advance dimensionless time τ and watch both fields reach steady state, which is how you can see the model behaving physically.
      </p>

      {/* Visualization layer toggles */}
      <div className="viz-layer-toggles">
        <span className="viz-layer-label">Layers</span>
        <label><input type="checkbox" checked={showStreamlines} onChange={(e) => setShowStreamlines(e.target.checked)} /> Velocity arrows (length = local W)</label>
        <label><input type="checkbox" checked={showHeatmap} onChange={(e) => setShowHeatmap(e.target.checked)} /> Temperature heatmap (θ)</label>
        <label><input type="checkbox" checked={showFieldLines} onChange={(e) => setShowFieldLines(e.target.checked)} /> Magnetic field (uniform B₀)</label>
      </div>

      {/* Enhanced Flow Visualization */}
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
        <div className="chart-card"><div className="chart-header"><span className="dot amber"></span><h3>Entropy Generation Ns(τ)</h3></div><div className="chart-wrapper">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={solution.evolutionData} margin={{ top: 5, right: 10, bottom: 18, left: 6 }}><CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
              <XAxis dataKey="tau" stroke="rgba(255,255,255,0.5)" tick={{ fill: 'rgba(255,255,255,0.7)', fontSize: 11 }} label={{ value: 'τ (dimensionless time)', position: 'insideBottom', offset: -8, fill: 'rgba(255,255,255,0.6)', fontSize: 11 }} />
              <YAxis stroke="rgba(255,255,255,0.5)" tick={{ fill: 'rgba(255,255,255,0.7)', fontSize: 11 }} label={{ value: 'Ns', angle: -90, position: 'insideLeft', fill: 'rgba(255,255,255,0.6)', fontSize: 11 }} />
              <Tooltip content={<CustomTooltip />} /><Legend />
              <Line type="monotone" dataKey="Ns_avg" stroke="#0072B2" strokeWidth={2.5} dot={false} name="Ns (mean)" />
              <Line type="monotone" dataKey="Ns_max" stroke="#D55E00" strokeWidth={2} dot={false} name="Ns (peak)" />
            </LineChart>
          </ResponsiveContainer>
        </div></div>
        <div className="chart-card"><div className="chart-header"><span className="dot teal"></span><h3>Bejan Number Be(τ)</h3></div><div className="chart-wrapper">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={solution.evolutionData} margin={{ top: 5, right: 10, bottom: 18, left: 6 }}><CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
              <XAxis dataKey="tau" stroke="rgba(255,255,255,0.5)" tick={{ fill: 'rgba(255,255,255,0.7)', fontSize: 11 }} label={{ value: 'τ (dimensionless time)', position: 'insideBottom', offset: -8, fill: 'rgba(255,255,255,0.6)', fontSize: 11 }} />
              <YAxis domain={[0, 1]} stroke="rgba(255,255,255,0.5)" tick={{ fill: 'rgba(255,255,255,0.7)', fontSize: 11 }} label={{ value: 'Be', angle: -90, position: 'insideLeft', fill: 'rgba(255,255,255,0.6)', fontSize: 11 }} />
              <Tooltip content={<CustomTooltip />} /><Legend />
              <Line type="monotone" dataKey="Be_avg" stroke="#009E73" strokeWidth={2.5} dot={false} name="Be (mean)" />
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

  const renderVelocity = () => (
    <div className="section">
      <div className="section-header">
        <h2><Wind size={28} /> Velocity Field W(η, τ)</h2>
        <p>Dimensionless velocity across the gap. The lower plate is stationary (no-slip) and the upper plate drives the flow with Navier slip. The live checks below read the current solution at both walls.</p>
      </div>
      {(() => {
        const Nn = params.N || 50;
        const Wf = solution.WHistory[solution.WHistory.length - 1];
        const wPrime1 = (Wf[Nn] - Wf[Nn - 1]) * Nn;
        const slipTarget = params.Re - params.lambda * wPrime1;
        const okLower = Math.abs(Wf[0]) < 1e-9;
        const okUpper = Math.abs(Wf[Nn] - slipTarget) < 1e-6;
        return (
          <div className="physics-box">
            <h4><Activity size={18} /> Boundary condition check (steady state, live)</h4>
            <div className="metrics-grid">
              <div className="metric"><span className="metric-label">W(0) lower wall</span><span className="metric-value teal">{Wf[0].toFixed(6)}</span></div>
              <div className="metric"><span className="metric-label">W(1) upper wall</span><span className="metric-value purple">{Wf[Nn].toFixed(4)}</span></div>
              <div className="metric"><span className="metric-label">Re − λ W'(1) target</span><span className="metric-value pink">{slipTarget.toFixed(4)}</span></div>
              <div className="metric"><span className="metric-label">Both walls satisfied</span><span className="metric-value amber">{okLower && okUpper ? 'PASS' : 'check'}</span></div>
            </div>
            <div className="highlight purple">No-slip requires W(0)=0; the Navier slip condition requires W(1)=Re−λ W'(1). The upper wall value and its target agree to solver tolerance.</div>
          </div>
        );
      })()}
      <div className="dual-grid">
        <div className="chart-card"><div className="chart-header"><span className="dot teal"></span><h3>Velocity Profiles W(η) over time</h3></div><div className="chart-wrapper">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={solution.profileData} margin={{ top: 5, right: 12, bottom: 18, left: 6 }}><CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
              <XAxis dataKey="eta" stroke="rgba(255,255,255,0.5)" tick={{ fill: 'rgba(255,255,255,0.7)', fontSize: 11 }} label={{ value: 'η (gap coordinate)', position: 'insideBottom', offset: -8, fill: 'rgba(255,255,255,0.6)', fontSize: 11 }} />
              <YAxis stroke="rgba(255,255,255,0.5)" tick={{ fill: 'rgba(255,255,255,0.7)', fontSize: 11 }} label={{ value: 'W (dimensionless velocity)', angle: -90, position: 'insideLeft', fill: 'rgba(255,255,255,0.6)', fontSize: 11 }} />
              <Tooltip content={<CustomTooltip />} /><Legend />
              <Line type="monotone" dataKey="W_t0" stroke="#6b7280" strokeWidth={1.5} dot={false} name="τ=0 (initial)" />
              <Line type="monotone" dataKey="W_t1" stroke="#06b6d4" strokeWidth={2} dot={false} name="τ=early" />
              <Line type="monotone" dataKey="W_t2" stroke="#8b5cf6" strokeWidth={2} dot={false} name="τ=mid" />
              <Line type="monotone" dataKey="W_t3" stroke="#10b981" strokeWidth={2.5} dot={false} name="τ=final (steady)" />
            </LineChart>
          </ResponsiveContainer>
        </div></div>
        <div className="chart-card"><div className="chart-header"><span className="dot purple"></span><h3>Velocity W(τ) at Fixed η</h3></div><div className="chart-wrapper">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={solution.evolutionData} margin={{ top: 5, right: 12, bottom: 18, left: 6 }}><CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
              <XAxis dataKey="tau" stroke="rgba(255,255,255,0.5)" tick={{ fill: 'rgba(255,255,255,0.7)', fontSize: 11 }} label={{ value: 'τ (dimensionless time)', position: 'insideBottom', offset: -8, fill: 'rgba(255,255,255,0.6)', fontSize: 11 }} />
              <YAxis stroke="rgba(255,255,255,0.5)" tick={{ fill: 'rgba(255,255,255,0.7)', fontSize: 11 }} label={{ value: 'W (velocity)', angle: -90, position: 'insideLeft', fill: 'rgba(255,255,255,0.6)', fontSize: 11 }} />
              <Tooltip content={<CustomTooltip />} /><Legend />
              <Line type="monotone" dataKey="W_025" stroke="#06b6d4" strokeWidth={2} dot={false} name="η=0.25" />
              <Line type="monotone" dataKey="W_050" stroke="#8b5cf6" strokeWidth={2.5} dot={false} name="η=0.50" />
              <Line type="monotone" dataKey="W_075" stroke="#ec4899" strokeWidth={2} dot={false} name="η=0.75" />
            </LineChart>
          </ResponsiveContainer>
        </div></div>
      </div>
      <div className="contour-grid">
        <ContourPlot data={{ tau: solution.tauHistory, eta: solution.eta, values: solution.WHistory }} title="Velocity Contour W(η,τ)" colorScheme="purple" />
        <Surface3D data={{ values: solution.WHistory }} title="3D Velocity Surface W(η,τ)" colorScheme="purple" />
      </div>
      <PhysicsInfoBox topic="velocity" />
    </div>
  );

  const renderTemperature = () => (
    <div className="section">
      <div className="section-header">
        <h2><Thermometer size={28} /> Temperature Field θ(η, τ)</h2>
        <p>Dimensionless temperature rise above ambient, θ=(T−Ta)/Ta. It starts at zero, grows through viscous and Joule dissipation, and is cooled convectively at the upper wall (Biot condition).</p>
      </div>
      {(() => {
        const Nn = params.N || 50;
        const Tf = solution.ThetaHistory[solution.ThetaHistory.length - 1];
        const tPrime1 = (Tf[Nn] - Tf[Nn - 1]) * Nn;
        const robinResidual = tPrime1 + params.Bi * Tf[Nn];
        const okLower = Math.abs(Tf[0]) < 1e-9;
        const peak = Math.max(...Tf);
        return (
          <div className="physics-box">
            <h4><Activity size={18} /> Boundary condition check (steady state, live)</h4>
            <div className="metrics-grid">
              <div className="metric"><span className="metric-label">θ(0) lower wall</span><span className="metric-value teal">{Tf[0].toFixed(6)}</span></div>
              <div className="metric"><span className="metric-label">θ'(1) + Bi·θ(1) residual</span><span className="metric-value purple">{robinResidual.toExponential(2)}</span></div>
              <div className="metric"><span className="metric-label">Peak θ</span><span className="metric-value pink">{peak.toFixed(4)}</span></div>
              <div className="metric"><span className="metric-label">Both walls satisfied</span><span className="metric-value amber">{okLower && Math.abs(robinResidual) < 1e-3 ? 'PASS' : 'check'}</span></div>
            </div>
            <div className="highlight purple">The fixed lower wall requires θ(0)=0; the convective upper wall requires ∂θ/∂η(1)=−Bi·θ(1), so the residual θ'(1)+Bi·θ(1) is driven to zero.</div>
          </div>
        );
      })()}
      <div className="dual-grid">
        <div className="chart-card"><div className="chart-header"><span className="dot amber"></span><h3>Temperature Profiles θ(η) over time</h3></div><div className="chart-wrapper">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={solution.profileData} margin={{ top: 5, right: 12, bottom: 18, left: 6 }}><CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
              <XAxis dataKey="eta" stroke="rgba(255,255,255,0.5)" tick={{ fill: 'rgba(255,255,255,0.7)', fontSize: 11 }} label={{ value: 'η (gap coordinate)', position: 'insideBottom', offset: -8, fill: 'rgba(255,255,255,0.6)', fontSize: 11 }} />
              <YAxis stroke="rgba(255,255,255,0.5)" tick={{ fill: 'rgba(255,255,255,0.7)', fontSize: 11 }} label={{ value: 'θ (temperature rise)', angle: -90, position: 'insideLeft', fill: 'rgba(255,255,255,0.6)', fontSize: 11 }} />
              <Tooltip content={<CustomTooltip />} /><Legend />
              <Line type="monotone" dataKey="Theta_t0" stroke="#6b7280" strokeWidth={1.5} dot={false} name="τ=0 (initial)" />
              <Line type="monotone" dataKey="Theta_t1" stroke="#06b6d4" strokeWidth={2} dot={false} name="τ=early" />
              <Line type="monotone" dataKey="Theta_t2" stroke="#f59e0b" strokeWidth={2} dot={false} name="τ=mid" />
              <Line type="monotone" dataKey="Theta_t3" stroke="#ec4899" strokeWidth={2.5} dot={false} name="τ=final (steady)" />
            </LineChart>
          </ResponsiveContainer>
        </div></div>
        <div className="chart-card"><div className="chart-header"><span className="dot pink"></span><h3>Temperature θ(τ) at Fixed η</h3></div><div className="chart-wrapper">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={solution.evolutionData} margin={{ top: 5, right: 12, bottom: 18, left: 6 }}><CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
              <XAxis dataKey="tau" stroke="rgba(255,255,255,0.5)" tick={{ fill: 'rgba(255,255,255,0.7)', fontSize: 11 }} label={{ value: 'τ (dimensionless time)', position: 'insideBottom', offset: -8, fill: 'rgba(255,255,255,0.6)', fontSize: 11 }} />
              <YAxis stroke="rgba(255,255,255,0.5)" tick={{ fill: 'rgba(255,255,255,0.7)', fontSize: 11 }} label={{ value: 'θ (temperature rise)', angle: -90, position: 'insideLeft', fill: 'rgba(255,255,255,0.6)', fontSize: 11 }} />
              <Tooltip content={<CustomTooltip />} /><Legend />
              <Line type="monotone" dataKey="Theta_025" stroke="#06b6d4" strokeWidth={2} dot={false} name="η=0.25" />
              <Line type="monotone" dataKey="Theta_050" stroke="#ec4899" strokeWidth={2.5} dot={false} name="η=0.50" />
              <Line type="monotone" dataKey="Theta_075" stroke="#f59e0b" strokeWidth={2} dot={false} name="η=0.75" />
            </LineChart>
          </ResponsiveContainer>
        </div></div>
      </div>
      <div className="contour-grid">
        <ContourPlot data={{ tau: solution.tauHistory, eta: solution.eta, values: solution.ThetaHistory }} title="Temperature Contour θ(η,τ)" colorScheme="thermal" />
        <Surface3D data={{ values: solution.ThetaHistory }} title="3D Temperature Surface θ(η,τ)" colorScheme="thermal" />
      </div>
      <PhysicsInfoBox topic="temperature" />
    </div>
  );

  const renderEnergy = () => (
    <div className="section">
      <PhysicsInfoBox topic="entropy" />
      <ResultsPanel />
      <div className="chart-card"><div className="chart-header"><span className="dot amber"></span><h3>System Energy Evolution</h3></div><div className="chart-wrapper" style={{ height: '350px' }}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={solution.evolutionData} margin={{ top: 5, right: 12, bottom: 18, left: 6 }}>
            <defs>
              <linearGradient id="keGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.5}/><stop offset="95%" stopColor="#8b5cf6" stopOpacity={0.1}/></linearGradient>
              <linearGradient id="teGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#ec4899" stopOpacity={0.5}/><stop offset="95%" stopColor="#ec4899" stopOpacity={0.1}/></linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
            <XAxis dataKey="tau" stroke="rgba(255,255,255,0.5)" tick={{ fill: 'rgba(255,255,255,0.7)', fontSize: 11 }} label={{ value: 'τ (dimensionless time)', position: 'insideBottom', offset: -8, fill: 'rgba(255,255,255,0.6)', fontSize: 11 }} />
            <YAxis stroke="rgba(255,255,255,0.5)" tick={{ fill: 'rgba(255,255,255,0.7)', fontSize: 11 }} label={{ value: 'domain-integrated energy', angle: -90, position: 'insideLeft', fill: 'rgba(255,255,255,0.6)', fontSize: 11 }} />
            <Tooltip content={<CustomTooltip />} /><Legend />
            <Area type="monotone" dataKey="KE" stroke="#8b5cf6" strokeWidth={2} fill="url(#keGrad)" name="Kinetic Energy" />
            <Area type="monotone" dataKey="TE" stroke="#ec4899" strokeWidth={2} fill="url(#teGrad)" name="Thermal Energy" />
          </AreaChart>
        </ResponsiveContainer>
      </div></div>
      
      <div className="dual-grid">
        <div className="chart-card"><div className="chart-header"><span className="dot teal"></span><h3>Dissipation Sources</h3></div><div className="chart-wrapper">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={solution.evolutionData} margin={{ top: 5, right: 12, bottom: 18, left: 6 }}><CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
              <XAxis dataKey="tau" stroke="rgba(255,255,255,0.5)" tick={{ fill: 'rgba(255,255,255,0.7)', fontSize: 11 }} label={{ value: 'τ (dimensionless time)', position: 'insideBottom', offset: -8, fill: 'rgba(255,255,255,0.6)', fontSize: 11 }} />
              <YAxis stroke="rgba(255,255,255,0.5)" tick={{ fill: 'rgba(255,255,255,0.7)', fontSize: 11 }} label={{ value: 'dissipation rate', angle: -90, position: 'insideLeft', fill: 'rgba(255,255,255,0.6)', fontSize: 11 }} />
              <Tooltip content={<CustomTooltip />} /><Legend />
              <Line type="monotone" dataKey="VD" stroke="#14b8a6" strokeWidth={2} dot={false} name="Viscous Dissipation" />
              <Line type="monotone" dataKey="JH" stroke="#fbbf24" strokeWidth={2} dot={false} name="Joule Heating" />
            </LineChart>
          </ResponsiveContainer>
        </div></div>
        <div className="chart-card"><div className="chart-header"><span className="dot purple"></span><h3>Entropy Generation Ns(η)</h3></div><div className="chart-wrapper">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={solution.profileData} margin={{ top: 5, right: 12, bottom: 18, left: 6 }}><CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
              <XAxis dataKey="eta" stroke="rgba(255,255,255,0.5)" tick={{ fill: 'rgba(255,255,255,0.7)', fontSize: 11 }} label={{ value: 'η (gap coordinate)', position: 'insideBottom', offset: -8, fill: 'rgba(255,255,255,0.6)', fontSize: 11 }} />
              <YAxis stroke="rgba(255,255,255,0.5)" tick={{ fill: 'rgba(255,255,255,0.7)', fontSize: 11 }} label={{ value: 'Ns (entropy generation)', angle: -90, position: 'insideLeft', fill: 'rgba(255,255,255,0.6)', fontSize: 11 }} />
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

  // Curated paper figures reproduced from Revision1 (Pic/Figure_*.png), each
  // with the exact parameter set and the key finding from the manuscript.
  const paperFigures = [
    { id: 1, file: '/images/paper/Figure_1.png', title: 'Baseline and validation', caption: 'Baseline steady profiles, transient convergence of mid-plane velocity to steady state at tau approximately 0.58, and validation against four analytical limiting cases (max error 1.39e-4). Cu-Water, baseline parameters.' },
    { id: 2, file: '/images/paper/Figure_2.png', title: 'Transient evolution', caption: 'Velocity and temperature at seven time snapshots (tau = 0.05 to 5.0). Velocity settles by tau approximately 0.58 while temperature lags to tau approximately 2.0 because of Pr = 6.82.' },
    { id: 3, file: '/images/paper/Figure_3.png', title: 'Hartmann number effect', caption: 'Increasing Ha (0 to 7) flattens and suppresses velocity through Lorentz braking, yet raises temperature because Joule heating grows as Ha squared. Cu-Water is most affected.' },
    { id: 4, file: '/images/paper/Figure_4.png', title: 'Eckert number effect', caption: 'Velocity is independent of Ec (one-way coupling); temperature rises in direct proportion to Ec, the strongest thermal sensitivity in the model.' },
    { id: 5, file: '/images/paper/Figure_5.png', title: 'Volume fraction effect', caption: 'Higher nanoparticle loading (phi = 0 to 0.1) raises temperature through increased viscosity and, for Cu, increased Joule heating; velocity changes little at low phi.' },
    { id: 6, file: '/images/paper/Figure_6.png', title: 'Slip parameter effect', caption: 'Increasing Navier slip (lambda = 0 to 1) lets the fluid lag the plate, reducing velocity and temperature throughout the gap.' },
    { id: 8, file: '/images/paper/Figure_8.png', title: 'Reynolds number effect', caption: 'Velocity scales roughly linearly with Re (1 to 10); temperature grows faster than linearly because the dissipation sources scale with velocity squared.' },
    { id: 9, file: '/images/paper/Figure_9.png', title: 'Biot number effect', caption: 'Raising Bi (0.1 to 20) turns the upper plate from nearly insulating to nearly isothermal, suppressing temperature and shifting the peak inward.' },
    { id: 10, file: '/images/paper/Figure_10.png', title: 'Transient Cf and Nu', caption: 'Skin friction settles by tau approximately 0.6; Nusselt number keeps developing to tau approximately 2.0, reflecting the thermal lag at Pr = 6.82.' },
    { id: 11, file: '/images/paper/Figure_11.png', title: 'Hartmann effect on Cf and Nu', caption: 'Cf at the moving wall rises with Ha as gradients concentrate there while lower-wall Cf falls toward zero; Nu rises at both walls through Joule heating.' },
    { id: 18, file: '/images/paper/Figure_18.png', title: 'Hartmann effect on Ns and Be', caption: 'Entropy generation climbs steeply with Ha (peak Ns rises from about 1.4 to 68 for Cu-Water); lower-wall Bejan number tends to 1 as conduction irreversibility dominates.' },
    { id: 24, file: '/images/paper/Figure_24.png', title: 'Biot effect on Ns and Be', caption: 'Stronger cooling (higher Bi) lowers lower-wall entropy generation and Bejan number as the conduction irreversibility at the fixed wall is reduced.' },
  ];

  const renderValidation = () => (
    <div className="section">
      <div className="section-header">
        <h2><Award size={28} /> Validation against Manuscript (MMNSA)</h2>
        <p>Every number below is produced live by this app's own solver and compared to the manuscript. Nothing here is hard coded. Method: implicit finite-difference (Crank-Nicolson-type, tridiagonal) time marching to steady state; tolerance 1e-3 on the maximum absolute velocity error.</p>
      </div>

      <div className="chart-card" style={{ marginBottom: 'var(--space-lg)' }}>
        <div className="chart-header"><span className="dot teal"></span><h3>Check 1: transient solver vs closed-form steady solution</h3></div>
        <p className="figure-discussion" style={{ margin: '0 0 8px' }}>
          Cu-Water, φ=0.10, Ha=0.1, G=1, Re=0.1, λ=0.1. The app solver runs to large τ and is compared with the analytic steady solution (manuscript exact-solution equation). Measured maximum absolute error: <strong>{exactValidation.maxErr.toExponential(2)}</strong>. Manuscript value: 3.49e-4 (Crank-Nicolson). Tolerance 1e-3, so this check is <strong>{exactValidation.maxErr < 1e-3 ? 'PASS' : 'FAIL'}</strong>.
        </p>
        <div className="chart-wrapper" style={{ height: 320 }}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={exactValidation.data} margin={{ top: 8, right: 16, bottom: 22, left: 8 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
              <XAxis dataKey="eta" type="number" domain={[0, 1]} stroke="rgba(255,255,255,0.5)" tick={{ fill: 'rgba(255,255,255,0.7)', fontSize: 11 }} tickFormatter={(v) => v.toFixed(1)} label={{ value: 'η (gap coordinate)', position: 'insideBottom', offset: -8, fill: 'rgba(255,255,255,0.6)', fontSize: 11 }} />
              <YAxis stroke="rgba(255,255,255,0.5)" tick={{ fill: 'rgba(255,255,255,0.7)', fontSize: 11 }} label={{ value: 'W (velocity)', angle: -90, position: 'insideLeft', fill: 'rgba(255,255,255,0.6)', fontSize: 11 }} />
              <Tooltip content={<CustomTooltip />} /><Legend />
              <Line type="monotone" dataKey="exact" stroke="#0072B2" strokeWidth={2.5} dot={false} name="Closed-form (analytic)" />
              <Line type="monotone" dataKey="app" stroke="#D55E00" strokeWidth={0} dot={{ r: 3, fill: '#D55E00' }} name="App solver (τ→∞)" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="chart-card">
        <div className="chart-header"><span className="dot amber"></span><h3>Check 2: exact-solution benchmark table (Manuscript, MMNSA)</h3></div>
        <p className="figure-discussion" style={{ margin: '0 0 8px' }}>
          Cu-Water, φ=0.10, Ha=0.1, G=1, Re=0.1, λ=0.1. Paper W(η) exact column vs the live app solver at six gap locations. PASS if the per-node error is below the {exactValidation.tol.toExponential(0)} tolerance.
        </p>
        <div style={{ overflowX: 'auto' }}>
          <table className="validation-table">
            <thead>
              <tr><th>η</th><th>W paper (exact)</th><th>W app (live)</th><th>abs error</th><th>result</th></tr>
            </thead>
            <tbody>
              {exactValidation.table.map((r) => (
                <tr key={r.eta}>
                  <td>{r.eta.toFixed(1)}</td>
                  <td>{r.paper.toFixed(6)}</td>
                  <td>{r.app.toFixed(6)}</td>
                  <td>{r.err.toExponential(2)}</td>
                  <td style={{ color: r.pass ? '#10b981' : '#ef4444', fontWeight: 700 }}>{r.pass ? 'PASS' : 'FAIL'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="highlight purple" style={{ marginTop: '8px' }}>
          Source: manuscript (MMNSA) exact-solution validation table. The app uses finite difference (implicit tridiagonal); the manuscript uses Crank-Nicolson and BI-SQLM. Agreement at spectral-comparable accuracy confirms reproduction.
        </div>
      </div>
    </div>
  );

  const renderFigures = () => (
    <div className="section">
      <div className="section-header">
        <h2><Image size={28} /> Manuscript (MMNSA)</h2>
        <p>The published figures from the manuscript, each with the key finding. Live reproduction and error checks are in the Validation tab.</p>
      </div>
      <div className="figures-grid">
        {paperFigures.map((fig) => (
          <div key={fig.id} className="figure-card">
            <div className="figure-image">
              <img src={fig.file} alt={`Manuscript (MMNSA) Figure ${fig.id}: ${fig.title}`} loading="lazy" style={{ width: '100%', height: 'auto', display: 'block', background: '#fff', borderRadius: '8px' }} />
            </div>
            <div className="figure-content">
              <h3><span className="figure-number">Figure {fig.id}</span>{fig.title}</h3>
              <p className="figure-discussion">{fig.caption}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderTheory = () => (
    <div className="theory-section">
      <div className="theory-intro">
        <h2><BookOpen size={24} /> Model and Governing Equations</h2>
        <p>Unsteady, laminar, incompressible MHD Couette flow of a water-based
        nanofluid between two parallel plates a distance H apart. The lower plate
        is stationary at ambient temperature; the upper plate moves at speed U
        with Navier slip and convective (Robin) heat exchange. A uniform
        transverse magnetic field B₀ is applied. Every equation below matches the
        manuscript (MMNSA) exactly (Eqs. 8 to 13 and the nondimensionalisation).</p>
        <a className="pdf-download-btn" href="/MMNSA-D-26-00050.pdf" target="_blank" rel="noopener noreferrer">
          <Download size={16} /> Download the accepted manuscript (MMNSA-D-26-00050)
        </a>
      </div>
      <div className="theory-grid">
        <div className="theory-card full"><h3><Activity size={20} /> Dimensional Governing Equations</h3><div className="equation"><TeX block math={String.raw`\rho_{nf}\,\frac{\partial u}{\partial t} = -\frac{\partial P}{\partial x} + \mu_{nf}\,\frac{\partial^2 u}{\partial y^2} - \sigma_{nf}\,B_0^2\,u`} /><TeX block math={String.raw`(\rho C_p)_{nf}\,\frac{\partial T}{\partial t} = k_{nf}\,\frac{\partial^2 T}{\partial y^2} + \mu_{nf}\left(\frac{\partial u}{\partial y}\right)^2 + \sigma_{nf}\,B_0^2\,u^2`} /></div><p>Dimensional momentum and energy balances for the electrically conducting nanofluid between the plates: inertia, pressure gradient, viscous diffusion and the Lorentz force in momentum; and thermal inertia, conduction, viscous dissipation and Joule heating in energy. Here u is velocity, T temperature, t time, y the transverse coordinate, P pressure and B₀ the applied field.</p></div>
        <div className="theory-card full"><h3><Waves size={20} /> Dimensional Initial and Boundary Conditions</h3><div className="equation"><TeX block math={String.raw`\begin{aligned} &u(y,0)=0,\quad T(y,0)=T_a,\quad u(0,t)=0,\quad T(0,t)=T_a\\ &u(H,t)=U-\frac{\mu_f}{\beta}\frac{\partial u}{\partial y}(H,t),\quad -k_f\frac{\partial T}{\partial y}(H,t)=h_f\big[T(H,t)-T_a\big] \end{aligned}`} /></div><p>The fluid starts from rest at ambient temperature Ta. The lower plate is stationary and at Ta; the upper plate moves at U with Navier slip length coefficient β and exchanges heat convectively with coefficient h_f.</p></div>
        <div className="theory-card full"><h3><Timer size={20} /> Scaling Variables (dimensional to dimensionless)</h3><div className="equation"><TeX block math={String.raw`\begin{aligned} &W=\frac{uH}{\nu_f},\ \eta=\frac{y}{H},\ X=\frac{x}{H},\ \theta=\frac{T-T_a}{T_a},\ \tau=\frac{t\,\nu_f}{H^2},\ \nu_f=\frac{\mu_f}{\rho_f}\\ &\overline{P}=\frac{\rho_f H^2 P}{\mu_f^2},\ G=-\frac{\partial \overline{P}}{\partial X},\ Ns=\frac{E_G H^2}{k_f},\ A_i=\text{property ratios (below)} \end{aligned}`} /></div><p>Substituting these scales into the dimensional equations and dividing through gives the dimensionless system below. The five property ratios A₁ to A₅ collect the nanofluid corrections.</p></div>
        <div className="theory-card"><h3><Activity size={20} /> Dimensionless Momentum Equation</h3><div className="equation"><TeX block math={String.raw`A_4\,\frac{\partial W}{\partial \tau} = A_1\,\frac{\partial^2 W}{\partial \eta^2} - A_2\,Ha^2\,W + G`} /></div><p>Time-dependent velocity with inertia (A₄), viscous diffusion (A₁), Lorentz damping (A₂Ha²), and an axial pressure gradient (G). The Eckert number does not appear, so the momentum field is independent of the thermal field (one-way coupling).</p></div>
        <div className="theory-card"><h3><Thermometer size={20} /> Dimensionless Energy Equation</h3><div className="equation"><TeX block math={String.raw`A_5\,Pr\,\frac{\partial \theta}{\partial \tau} = A_3\,\frac{\partial^2 \theta}{\partial \eta^2} + A_1\,Pr\,Ec\left(\frac{\partial W}{\partial \eta}\right)^2 + A_2\,Pr\,Ec\,Ha^2\,W^2`} /></div><p>Temperature evolution with thermal inertia (A₅Pr), conduction (A₃), viscous dissipation, and Joule heating. Both source terms scale with Ec, so at Ec=0 the temperature stays at zero.</p></div>
        <div className="theory-card"><h3><Waves size={20} /> Initial and Boundary Conditions</h3><div className="equation"><TeX block math={String.raw`\begin{aligned} &\tau=0:\ W=0,\ \theta=0\\ &\eta=0:\ W=0,\ \theta=0\\ &\eta=1:\ W = Re - \lambda\,\frac{\partial W}{\partial \eta},\quad \frac{\partial \theta}{\partial \eta} = -Bi\,\theta \end{aligned}`} /></div><p>Start from rest at ambient. Lower plate fixed and at ambient temperature (θ=0). Upper plate moving with Navier slip (λ) and convective cooling (Biot number Bi). Temperature rises inside the gap only through dissipation.</p></div>
        <div className="theory-card"><h3><Timer size={20} /> Nondimensionalisation</h3><div className="equation"><TeX block math={String.raw`\begin{aligned} &W=\frac{uH}{\nu_f},\ \eta=\frac{y}{H},\ \theta=\frac{T-T_a}{T_a},\ \tau=\frac{t\,\nu_f}{H^2}\\ &Ha=HB_0\sqrt{\tfrac{\sigma_f}{\mu_f}},\ Re=\frac{UH}{\nu_f},\ Pr=\frac{\mu_f C_{pf}}{k_f}\\ &Ec=\frac{\nu_f^2}{H^2 C_{pf} T_a},\ \lambda=\frac{\mu_f}{\beta H},\ Bi=\frac{H h_f}{k_f} \end{aligned}`} /></div><p>Reference scales that reduce the dimensional balances to the dimensionless system above.</p></div>
        <div className="theory-card full"><h3><Droplets size={20} /> Nanofluid Property Models</h3><div className="equation-grid">
          <div className="eq"><TeX math={String.raw`A_1=\frac{\mu_{nf}}{\mu_f}=(1-\varphi)^{-2.5}`} /></div>
          <div className="eq"><TeX math={String.raw`A_4=\frac{\rho_{nf}}{\rho_f}=(1-\varphi)+\varphi\frac{\rho_s}{\rho_f}`} /></div>
          <div className="eq"><TeX math={String.raw`A_5=(1-\varphi)+\varphi\frac{(\rho C_p)_s}{(\rho C_p)_f}`} /></div>
          <div className="eq"><TeX math={String.raw`A_3=\frac{k_{nf}}{k_f}=\frac{k_s+2k_f-2\varphi(k_f-k_s)}{k_s+2k_f+\varphi(k_f-k_s)}`} /></div>
          <div className="eq"><TeX math={String.raw`A_2=\frac{\sigma_{nf}}{\sigma_f}=1+\frac{3(r-1)\varphi}{(r+2)-(r-1)\varphi},\ r=\frac{\sigma_s}{\sigma_f}`} /></div>
        </div><p>Brinkman viscosity (A₁), Maxwell conductivity ratios (A₂, A₃), and mixing rules for density (A₄) and heat capacity (A₅). Base fluid: water; nanoparticles: Cu and Al₂O₃.</p></div>
        <div className="theory-card full"><h3><BarChart3 size={20} /> Entropy Generation and Bejan Number</h3><div className="equation"><TeX block math={String.raw`Ns = \underbrace{A_3\left(\frac{\partial \theta}{\partial \eta}\right)^2}_{N_1\ \text{conduction}} + \underbrace{A_1\,Ec\,Pr\left(\frac{\partial W}{\partial \eta}\right)^2}_{N_2\ \text{friction}} + \underbrace{A_2\,Pr\,Ec\,Ha^2\,W^2}_{N_3\ \text{Joule}}`} /><TeX block math={String.raw`Be = \frac{N_1}{N_1+N_2+N_3} = \frac{1}{1+Q},\quad Q=\frac{N_2+N_3}{N_1}`} /></div><p>Dimensionless entropy generation number with no local-temperature denominator: the ambient temperature Ta is absorbed into the groups. Be → 1 when conduction irreversibility dominates; Be → 0 when friction and Joule heating dominate.</p></div>
        <div className="theory-card full"><h3><TrendingUp size={20} /> Wall Quantities</h3><div className="equation"><TeX block math={String.raw`C_f = A_1\left.\frac{\partial W}{\partial \eta}\right|_{\eta=0,1},\qquad Nu = A_3\left.\frac{\partial \theta}{\partial \eta}\right|_{\eta=0,1}`} /></div><p>Evaluated at both walls. The app reports the signed wall values so the lower-wall and upper-wall transport can be compared directly.</p></div>
      </div>
    </div>
  );

  // ── Quantum results: every number is quoted from Final_Code (primary) or
  //    Revision1 (paper), never recomputed in the browser. Both solvers run on
  //    the Qiskit Aer statevector simulator (not real hardware). ──
  const quantumResources = [
    { metric: 'Qubits', HHL: 11, VQLS: 2 },
    { metric: 'Transpiled depth', HHL: 43127, VQLS: 5 },
    { metric: 'Gate count', HHL: 371, VQLS: 8 },
  ];
  const quantumCompare = [
    { m: 'Relative error', hhl: '0.414%', vqls: '0.0072%', src: 'Final_Code phase3_metrics / Phase5_Table3', paper: 'MMNSA: 0.41% / 0.007%' },
    { m: 'Residual ‖Ax−b‖/‖b‖', hhl: 'N/A', vqls: '2.28e-4', src: 'Final_Code Phase5_Table3', paper: 'MMNSA: 1.65e-4 (VQLS residual is stochastic, run-to-run variance)' },
    { m: 'Total qubits', hhl: '11', vqls: '2', src: 'Final_Code', paper: 'MMNSA: 11 / 2' },
    { m: 'Transpiled depth', hhl: '43,127', vqls: '5', src: 'Final_Code phase3_metrics / Phase5_Table3', paper: 'MMNSA: 43,127 / 5' },
    { m: 'Gate count', hhl: '371', vqls: '8', src: 'Final_Code', paper: 'MMNSA: 371 / 8' },
    { m: 'Optimiser iterations', hhl: 'N/A', vqls: '168', src: 'Final_Code Phase5_Table2', paper: 'MMNSA: 168' },
    { m: 'NISQ hardware feasible', hhl: 'No', vqls: 'Yes', src: 'Final_Code Phase5_Table3', paper: 'MMNSA: No / Yes' },
    { m: 'Post-selection rate', hhl: '79.1%', vqls: 'N/A', src: 'Manuscript (reported)', paper: 'MMNSA: 79.1%' },
  ];
  const quantumDomain = [
    { eta: 0.25, exact: 0.103364, hhl: 1.13, vqls: 0.036 },
    { eta: 0.50, exact: 0.158762, hhl: 1.16, vqls: 0.021 },
    { eta: 0.75, exact: 0.166260, hhl: 0.16, vqls: 0.019 },
    { eta: 1.00, exact: 0.125771, hhl: 2.84, vqls: 0.024 },
  ];

  const renderQuantum = () => (
    <div className="section">
      <div className="section-header">
        <h2><Cpu size={28} /> Quantum linear solvers: HHL and VQLS</h2>
        <p>Every number on this tab is quoted from the project code in Final_Code or from the manuscript (MMNSA) and is marked as reported, not recomputed in the browser. Both solvers run on the Qiskit Aer statevector simulator, not real quantum hardware.</p>
      </div>

      <div className="dual-grid">
        <div className="physics-box">
          <h4><Cpu size={18} /> What HHL does</h4>
          <p>The Crank-Nicolson discretisation of the MHD momentum equation gives a linear system A x = b (a 4x4 demo system here, condition number κ = 5.92). HHL (Harrow-Hassidim-Lloyd) loads b as a quantum state, applies quantum phase estimation on e^(iAt) to read the eigenvalues, inverts them with a controlled rotation, then post-selects an ancilla qubit. It is exact in principle but deep: 11 qubits and a transpiled depth of 43,127 gates, which exceeds current hardware coherence, so it is run on a simulator.</p>
        </div>
        <div className="physics-box">
          <h4><Zap size={18} /> What VQLS does</h4>
          <p>VQLS (Variational Quantum Linear Solver) prepares a shallow parameterised ansatz V(θ)|0> on 2 qubits and uses the classical COBYLA optimiser to minimise a cost that vanishes when A x is proportional to b. It converged in 168 iterations to a relative error of 0.0072% with a transpiled depth of only 5 gates, which is why the paper identifies it as the NISQ-compatible choice.</p>
        </div>
      </div>

      <div className="chart-card">
        <div className="chart-header"><span className="dot purple"></span><h3>HHL vs VQLS: accuracy and resources</h3></div>
        <div style={{ overflowX: 'auto' }}>
          <table className="validation-table">
            <thead><tr><th>Metric</th><th>HHL</th><th>VQLS</th><th>Source</th></tr></thead>
            <tbody>
              {quantumCompare.map((r) => (
                <tr key={r.m}>
                  <td>{r.m}</td>
                  <td>{r.hhl}</td>
                  <td style={{ fontWeight: 700 }}>{r.vqls}</td>
                  <td style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{r.src}<br/>{r.paper}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="highlight purple" style={{ marginTop: '8px' }}>VQLS reaches a 58x smaller relative error than HHL (0.414% vs 0.0072%) with an 8625x shallower transpiled circuit (43,127 vs 5 gates). The VQLS residual differs slightly between sources (Final_Code 2.28e-4 vs manuscript 1.65e-4) because VQLS is a stochastic variational optimiser and each run converges to a slightly different point.</div>
        <div className="highlight teal" style={{ marginTop: '8px' }}>Why VQLS is NISQ-feasible and HHL is not: VQLS needs only 2 qubits and a transpiled depth of 5 gates, well within current device coherence, whereas the HHL circuit for the same system needs 11 qubits and depth 43,127, far beyond it. That is why the manuscript identifies VQLS as the near-term option.</div>
        <div className="highlight amber" style={{ marginTop: '8px' }}>Projected (not measured) scaling: the Final_Code complexity table (Phase4) is computed up to n=128; the manuscript extrapolates HHL's advantage over the classical direct solver to roughly 18,000x at n=1024, and about 2.3x over the classical conjugate-gradient method at the same size. These two figures are projected asymptotic estimates, not measured runs.</div>
      </div>

      <div className="chart-card">
        <div className="chart-header"><span className="dot teal"></span><h3>Circuit resources (log scale, reported)</h3></div>
        <div className="chart-wrapper" style={{ height: 300 }}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={quantumResources} margin={{ top: 8, right: 16, bottom: 18, left: 6 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
              <XAxis dataKey="metric" stroke="rgba(255,255,255,0.5)" tick={{ fill: 'rgba(255,255,255,0.7)', fontSize: 11 }} />
              <YAxis scale="log" domain={[1, 100000]} stroke="rgba(255,255,255,0.5)" tick={{ fill: 'rgba(255,255,255,0.7)', fontSize: 11 }} label={{ value: 'count (log)', angle: -90, position: 'insideLeft', fill: 'rgba(255,255,255,0.6)', fontSize: 11 }} />
              <Tooltip content={<CustomTooltip />} /><Legend />
              <Line type="monotone" dataKey="HHL" stroke="#D55E00" strokeWidth={0} dot={{ r: 6 }} name="HHL" />
              <Line type="monotone" dataKey="VQLS" stroke="#009E73" strokeWidth={0} dot={{ r: 6 }} name="VQLS" />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <p className="figure-discussion">Source: Final_Code phase3_metrics.csv and Phase5_Table3_Resources.csv.</p>
      </div>

      <div className="chart-card">
        <div className="chart-header"><span className="dot amber"></span><h3>Full-domain validation (four-node Galerkin, κ = 8.46)</h3></div>
        <p className="figure-discussion" style={{ margin: '0 0 8px' }}>Cu-Water, φ=0.10, Ha=0.1, G=1, Re=0.1, λ=0.1. Percent error of each solver against the exact solution (Final_Code Exact_Solution_Validation CSVs).</p>
        <div style={{ overflowX: 'auto' }}>
          <table className="validation-table">
            <thead><tr><th>η</th><th>W exact</th><th>HHL error</th><th>VQLS error</th></tr></thead>
            <tbody>
              {quantumDomain.map((r) => (
                <tr key={r.eta}>
                  <td>{r.eta.toFixed(2)}</td>
                  <td>{r.exact.toFixed(6)}</td>
                  <td>{r.hhl.toFixed(2)}%</td>
                  <td style={{ fontWeight: 700 }}>{r.vqls.toFixed(3)}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="highlight purple" style={{ marginTop: '8px' }}>HHL maximum error 2.84%, VQLS maximum error 0.036% (Final_Code). The manuscript (MMNSA) reports VQLS maximum 0.032%; the small difference is run-to-run variation of the stochastic variational optimiser. HHL errors match the manuscript exactly because HHL is deterministic with a fixed seed. Backend: Qiskit Aer statevector simulator (not hardware).</div>
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
              { id: 'velocity', icon: Wind, label: 'Velocity' },
              { id: 'temperature', icon: Thermometer, label: 'Temperature' },
              { id: 'energy', icon: Zap, label: 'Energy' },
              { id: 'validation', icon: Award, label: 'Validation' },
              { id: 'figures', icon: Image, label: 'Figures' },
              { id: 'theory', icon: BookOpen, label: 'Theory' },
              { id: 'quantum', icon: Cpu, label: 'Quantum' }
            ].map(t => (
              <button key={t.id} className={`nav-tab ${activeTab === t.id ? 'active' : ''}`} onClick={() => setActiveTab(t.id)}><t.icon size={16} /><span className="tab-label">{t.label}</span></button>
            ))}
          </nav>
        </div>
      </header>
      <main className="main">
        {activeTab === 'transient' && renderTransient()}
        {activeTab === 'velocity' && renderVelocity()}
        {activeTab === 'temperature' && renderTemperature()}
        {activeTab === 'energy' && renderEnergy()}
        {activeTab === 'validation' && renderValidation()}
        {activeTab === 'figures' && renderFigures()}
        {activeTab === 'theory' && renderTheory()}
        {activeTab === 'quantum' && renderQuantum()}
      </main>
      {FloatingControls()}
      <footer className="footer"><p>
        <strong>Research:</strong> Thermo-Entropic Analysis of Unsteady MHD Nanofluid Couette Flow<br/>
        <strong>Candidate:</strong> Mr S.I. Mosala | <strong>Supervisors:</strong> Prof. A. Muronga (Nelson Mandela University, primary) &amp; Prof. O.D. Makinde (Stellenbosch University, co-supervisor)<br/>
        Nelson Mandela University | 2026
      </p></footer>
    </div>
  );
}

export default App;