# Unsteady MHD Nanofluid Couette Flow

An interactive, browser-based simulator for transient (unsteady) magnetohydrodynamic
nanofluid Couette flow, with thermo-entropic analysis and a quantum linear-solver
comparison. It accompanies the manuscript "Thermo-Entropic Analysis of Unsteady MHD
Nanofluid Couette Flow" (MMNSA).

## What it does

The app solves the coupled, time-dependent momentum and energy equations for an
electrically conducting nanofluid between two parallel plates. The lower plate is
stationary and at ambient temperature; the upper plate moves with Navier slip and
exchanges heat convectively (a Robin condition). A uniform transverse magnetic field
brakes the flow through a Lorentz force and adds Joule heating. You can watch the flow
start from rest and relax to the steady Couette profile, and read off the derived
engineering quantities live.

## The science in brief

- Dimensionless momentum: `A4 dW/dtau = A1 d2W/deta2 - A2 Ha^2 W + G`
- Dimensionless energy: `A5 Pr dtheta/dtau = A3 d2theta/deta2 + A1 Pr Ec (dW/deta)^2 + A2 Pr Ec Ha^2 W^2`
- Initial and boundary conditions: start from rest at ambient; `W(0)=0, theta(0)=0`;
  `W(1)=Re - lambda dW/deta`; `dtheta/deta(1) = -Bi theta(1)`.
- Nanofluid properties: Brinkman viscosity, Maxwell conductivity ratios, and mixing
  rules for density and heat capacity. Base fluid: water. Nanoparticles: Cu and Al2O3.
- Entropy generation `Ns = A3 (dtheta/deta)^2 + A1 Ec Pr (dW/deta)^2 + A2 Pr Ec Ha^2 W^2`
  and the Bejan number `Be = N1 / (N1 + N2 + N3)`.

Parameters: Hartmann number Ha, Reynolds number Re, Prandtl number Pr, Eckert number Ec,
Biot number Bi, slip parameter lambda, pressure gradient G, and volume fraction phi.

## Tabs

| Tab | What it shows |
|-----|---------------|
| Transient | Animated channel with the moving Couette wall, plus live Cf, Nu, Ns and Be versus time |
| Velocity | W(eta) over time with live checks of the no-slip and Navier-slip wall conditions |
| Temperature | theta(eta) over time with live checks of the ambient and convective (Robin) wall conditions |
| Energy | Kinetic and thermal energy, viscous and Joule dissipation, and the entropy split |
| Validation | Live reproduction of the manuscript exact-solution benchmark with measured error and PASS or FAIL |
| Figures | The published manuscript figures with the key finding of each |
| Theory | Dimensional and dimensionless equations, scaling variables, property models, entropy and Bejan analysis (rendered with KaTeX), and a link to the accepted paper |
| Quantum | HHL and VQLS results for the discretised linear system, sourced from the manuscript and the project code |

## How it computes, and an honest note on methods

The app uses an implicit finite-difference solver (a Crank-Nicolson-type, tridiagonal
scheme) marched in time. This is chosen for speed and interactivity in the browser.

The research results in the manuscript use higher-accuracy spectral and Crank-Nicolson
methods (the Bivariate Spectral Quasilinearisation Method, BI-SQLM). The app reproduces
the manuscript exact-solution benchmark to a maximum absolute error of about 3.49e-4,
which is comparable to the manuscript solver's own truncation error, but the app should
be understood as an interactive companion, not the reference solver.

The quantum results shown in the Quantum tab (HHL and VQLS) are quoted from the project
code and the manuscript. They were produced on the Qiskit Aer statevector simulator, not
on real quantum hardware, and are labeled as such throughout.

## Tech stack

- React 18 (Create React App)
- Recharts for plotting
- KaTeX for equation rendering
- HTML canvas for the flow animation
- lucide-react for icons
- Supabase (optional) for the collaboration and save-results features; the app runs
  fully without it

## Run locally

```bash
npm install
npm start
```

Then open http://localhost:3000.

To create a production build:

```bash
npm run build
```

The optional collaboration and save-results features read Supabase credentials from a
local `.env` file (`REACT_APP_SUPABASE_URL` and `REACT_APP_SUPABASE_ANON_KEY`). The
`.env` file is gitignored and is not required to run or build the app; without it, those
two features simply stay offline.

## Credits

Candidate: Mr S.I. Mosala. Supervisors: Prof. A. Muronga (Nelson Mandela University,
primary) and Prof. O.D. Makinde (Stellenbosch University, co-supervisor).
Nelson Mandela University, 2026.
