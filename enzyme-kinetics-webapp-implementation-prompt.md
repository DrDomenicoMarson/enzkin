# Enzyme Kinetics Web App — Implementation Prompt

Build a fully offline, frontend-only, single-page web app for teaching enzyme kinetics. The app should run locally in the browser, with no backend and no external API/database calls at runtime. Use a polished academic-style desktop-first interface. A React + TypeScript + Vite stack is preferred, but you are free to suggest alternatives.



## Objective

The app simulates initial-rate enzyme kinetic experiments for predefined enzyme–substrate pairs stored in a local embedded database. Students should be able to select one enzyme–substrate system, choose substrate concentrations, run repeated simulated measurements, collect replicate data, visualize the results, fit the kinetics, inspect residuals, and export the resulting dataset.

## Core Scientific Scope

### Database unit

Each database entry must represent **one enzyme–substrate pair**, not just an enzyme.

### Supported kinetic models in v1

1. **Plain Michaelis–Menten**
2. **Substrate inhibition** using a standard model such as:

\[
v = \frac{V_{max}[S]}{K_m + [S] + [S]^2/K_i}
\]

Each database entry must explicitly declare which kinetic model it uses.

### Units

- Substrate concentration: **mM**
- Rate: **µmol/min**

### Experimental scope

- Initial-rate experiments only
- No time-course/progress-curve simulation
- One enzyme–substrate system per session
- Students vary only **substrate concentration**
- Enzyme concentration remains **implicit and fixed** within each database entry for v1

## Local Embedded Database

Create a local starter database with about **10–30 curated enzyme–substrate entries**.

Each entry must include at minimum:

- `id` (unique identifier)
- `enzymeName`
- `substrateName`
- `modelType` (`"mm"` or `"substrate_inhibition"`)
- `Km`
- `Vmax`

For substrate inhibition entries, also include:

- `Ki`

The schema must also support **optional flexible metadata**, which may differ between entries. Examples:

- EC number
- organism/source
- pH
- temperature
- assay notes
- literature note
- citation/reference text
- unit note

Metadata completeness does **not** need to be uniform across all entries.

The database should be local and only lightly hidden. Strong obfuscation is unnecessary.

## Experiment Workflow

The student should be able to:

1. Select one enzyme–substrate entry for the current session
2. Choose a substrate concentration
3. Press **Run experiment** to generate **one replicate** measurement at that concentration
4. Repeat the process to generate additional replicates at the same concentration or at other concentrations

### Important behavior

- Replicates are mandatory in the intended workflow
- No manual entry of points is needed
- The session remains tied to one enzyme–substrate entry only

## Simulation / Noise Model

Each simulated measured rate should be based on the hidden theoretical rate from the selected kinetic model, then perturbed with an internal fixed noise model designed to feel experimentally realistic.

The noise model should include:

- **heteroscedastic random noise**
- **higher relative uncertainty near the detection limit**
- **rare mild outliers**, roughly on the order of **~1 outlier per 30 measurements on average**
- automatic prevention of impossible outputs such as **negative rates**

The noise model should be **internally fixed** and **not user-configurable**.

### Detection warning

If substrate concentration is very low and the signal is near the detection limit, the app should still generate a measurement but flag it with a warning such as:

> Substrate concentration very low: reaction likely near detection limit; measured rate may be unreliable.

## User Interface

The app should be a **single-page interface** with a polished academic-style layout.

A sensible layout includes:

- controls for enzyme–substrate selection and substrate concentration input
- a **Run experiment** button
- a live experimental data table
- a main rate-vs-substrate plot
- a fit/results area

A tabbed or segmented layout is acceptable to keep the interface clean.

### Suggested tabs/sections

- **Main kinetics view**: controls, raw data table, MM/substrate inhibition plot, fit button, fit results
- **Residuals**: residual plot after fitting
- **Lineweaver–Burk**: pedagogical secondary view
- **Metadata**: local database information for the selected enzyme–substrate pair

## Experimental Data Table

The live table should log **every generated measurement**.

Each row should include at least:

- session identifier
- enzyme–substrate entry identifier
- substrate concentration
- measured rate
- replicate index or timestamp
- unreliable/detection-warning flag if applicable

### Table functionality

- Must support **delete row**
- Manual edit is **not required**
- Manual point entry is **not required**

## Main Plot

The primary plot must show **rate vs substrate concentration** using all collected raw experimental points.

Requirements:

- Replicates at the same concentration should all be visible
- The fitted curve should be visually distinct from raw points
- Additional highlighting (e.g. outliers) is optional, not mandatory

## Fitting Workflow

The app must include a **Fit curve** button.

### Important behavior

- Fitting happens **only when the user presses the button**
- Fitting must **not** update automatically after every new point

### Weighted nonlinear regression

Use weighted nonlinear regression based on **replicate-derived variance from the student’s own data**.

Recommended procedure:

1. Group data by substrate concentration
2. Compute the mean measured rate for each concentration
3. Compute the sample standard deviation `σ` for replicates at each concentration
4. Fit the appropriate model to the grouped mean rates using weights:

\[
w_i = \frac{1}{\sigma_i^2}
\]

### Safeguards for variance estimation

Because variance estimates can be unstable with very few replicates, implement safeguards such as:

- show a warning if there are too few replicated concentrations for a stable weighted fit
- require at least **2 replicates** at a concentration before using that concentration in the weighted fit, or use a clearly documented fallback minimum-variance rule
- prevent infinite or numerically extreme weights

### Parameter constraints

Fit parameters must be constrained to physically meaningful values:

- `Km > 0`
- `Vmax > 0`
- `Ki > 0` for substrate inhibition entries

If a stable positive fit is not possible, show a warning such as:

> Fit unstable or physically implausible. Collect more data or improve concentration coverage.

### Displayed fit outputs

Show at least:

- estimated `Km`
- estimated `Vmax`
- estimated `Ki` when applicable

### Out of scope

- Do **not** include confidence intervals

## Residual Analysis

After fitting, include a **residual plot** in a separate panel or tab if needed for cleanliness.

## Lineweaver–Burk View

Include a separate **Lineweaver–Burk** plot in another tab or section.

Important:

- this is for **teaching/visualization only**
- it must **not** replace the main weighted nonlinear regression workflow

## Session Controls

Include both:

- **New experiment** — starts a fresh session on a selected enzyme–substrate pair
- **Reset experiment** — clears the current session’s collected data

Each session must have a unique **session identifier**.

## CSV Export

CSV export is required.

### Exported content

Export **experimental data only**, not hidden true parameters.

However, the export must include:

- session identifier
- enzyme–substrate entry identifier

This ensures the data can later be linked back to the local database.

### Export options

The user must be able to choose:

- field separator (default: `,`)
- decimal separator (default: `.`)
- optional filename

If the user does not specify a filename, generate a sensible default automatically.

### Validation

Prevent ambiguous export settings, such as choosing the same symbol for both:

- field separator
- decimal separator

## Technical Constraints

- Fully frontend-only
- No backend
- No runtime external database access
- No runtime web/API dependency
- Must function fully offline in the browser after local build/run
- Desktop-first design
- Tablet tolerance is a bonus, not a priority

## Recommended Tech Stack

Preferred stack:

- **React**
- **TypeScript**
- **Vite**

The solution should be modular, maintainable, and easy to run locally for teaching use.

## Acceptance Criteria

The implementation is successful if:

1. A student can select one enzyme–substrate pair from a local embedded database
2. The student can enter a substrate concentration and generate one simulated replicate per click
3. Multiple replicates at the same concentration can be collected
4. A live table logs all measurements and allows row deletion
5. A main plot displays rate vs substrate concentration using all raw points
6. Very low-signal points are flagged as unreliable but still recorded
7. The app can fit the collected data only when the user presses **Fit curve**
8. The fit uses weighted nonlinear regression with replicate-derived variance
9. Positive parameter constraints are enforced
10. Residuals are displayed after fitting
11. A separate Lineweaver–Burk view is available for pedagogy
12. The session can be reset or restarted with a new session ID
13. Experimental data can be exported to CSV with configurable field and decimal separators
14. The app works fully offline after local setup
15. The initial local database contains roughly 10–30 curated enzyme–substrate entries, including mostly Michaelis–Menten examples and a smaller number of substrate-inhibition examples

## Optional Nice-to-Haves

If time permits, consider:

- polished academic typography and spacing
- explanatory tooltips for Km, Vmax, Ki, residuals, and Lineweaver–Burk
- simple validation around concentration input ranges
- optional visual marker for suspected outliers
- metadata viewer with literature note/reference text for the selected database entry
