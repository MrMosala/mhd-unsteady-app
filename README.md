# Unsteady MHD Nanofluid Couette Flow

## Transient Analysis Simulation

A comprehensive React application for simulating and visualizing **time-dependent (unsteady)** magnetohydrodynamic nanofluid Couette flow with viscous dissipation and Joule heating.

### 📚 Research Context

**Title:** Unsteady MHD Nanofluid Couette Flow with Heat Transfer  
**Candidate:** Mr. S.I. Mosala  
**Supervisor:** Prof. O.D. Makinde  
**Institution:** Nelson Mandela University  
**Date:** December 2025

---

## 🌟 Key Features

### Transient Simulation
- **Time-stepping solver** with implicit scheme
- **Playback controls** (play, pause, step, skip)
- **Real-time visualization** of flow development

### Parametric Studies
- Hartmann Number (Ha) effects on magnetic damping
- Reynolds Number (Re) - upper plate velocity
- Prandtl Number (Pr) - thermal diffusivity
- Eckert Number (Ec) - viscous dissipation
- Biot Number (Bi) - convective cooling
- Slip Parameter (λ) - boundary slip

### Nanofluid Properties
- Cu-Water (Copper nanoparticles)
- Al₂O₃-Water (Alumina)
- TiO₂-Water (Titanium dioxide)
- Customizable volume fraction

### Response Metrics
- τ₉₅ (95% response time)
- Overshoot percentage
- Settling time
- Damping classification

---

## 🔬 Governing Equations

### Unsteady Momentum Equation
```
A₄ ∂W/∂τ = A₁ ∂²W/∂η² - A₂·Ha²·W + G
```

### Unsteady Energy Equation
```
A₅·Pr ∂θ/∂τ = A₃ ∂²θ/∂η² + A₁·Pr·Ec·(∂W/∂η)² + A₂·Pr·Ec·Ha²·W²
```

### Boundary Conditions
- **Lower plate (η=0):** W=0 (no-slip), θ=1 (isothermal)
- **Upper plate (η=1):** W - λ·∂W/∂η = Re (slip), ∂θ/∂η + Bi·θ = 0 (convective)

---

## 🚀 Getting Started

### Prerequisites
- Node.js 16+ 
- npm or yarn

### Installation
```bash
# Extract the zip file
unzip mhd-unsteady-app.zip
cd mhd-unsteady-app

# Install dependencies
npm install

# Start development server
npm start
```

### Build for Production
```bash
npm run build
```

---

## 📱 Tabs Overview

| Tab | Description |
|-----|-------------|
| **Transient** | Main simulation with playback controls and Cf/Nu evolution |
| **Profiles** | Velocity and temperature profile development over time |
| **Energy** | Kinetic and thermal energy evolution analysis |
| **Presets** | Pre-configured scenarios for quick exploration |
| **Theory** | Mathematical formulation and equations |

---

## 🎮 Using the Simulation

1. **Open the Transient tab**
2. **Adjust parameters** using the floating control panel (⚙️ button)
3. **Press Play** to watch the transient response develop
4. **Observe** skin friction (Cf) and Nusselt number (Nu) evolution
5. **Check response metrics** (τ₉₅, overshoot, settling time)

---

## 📊 Physical Insights

### Effect of Hartmann Number (Ha)
- **Ha=0:** Pure viscous flow (Couette profile)
- **Ha>4:** Magnetic damping dominates (Hartmann layers)
- Higher Ha → Faster response, reduced overshoot

### Effect of Eckert Number (Ec)
- Higher Ec → More viscous dissipation → Temperature rise

### Effect of Biot Number (Bi)
- Higher Bi → Enhanced convective cooling at upper plate

---

## 🔧 Technical Details

- **Solver:** Spectral Quasi-Linearization Method (SQLM)
- **Spatial discretization:** Chebyshev collocation
- **Time integration:** Implicit scheme
- **Grid:** N=50 Chebyshev points (default)

---

## 📄 License

Academic use - Nelson Mandela University © 2025
