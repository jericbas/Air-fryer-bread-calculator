# Project Plan: Air-Fryer Bread Calculator (V1.2+)

## 🚀 Overall Goal
To finalize the calculation engine, deploy a polished V1.2 feature set (e.g., advanced ingredient substitutions or seasonal recipes), and ensure full production readiness for market launch.

## ✅ Status
*   **Core Architecture:** Complete (Service Layer implemented using `ICalculationEngine`).
*   **V1.1 Features:** Complete (Contextual Wizard UI).
*   **Next Milestone Target:** V1.2 Feature Implementation & Full Test Suite Coverage.

---
## 🗓️ Roadmap / Tasks
### [X] Stage 1: Initial Setup & Scaffolding (Completed)
*   Scaffolded core structure (`src/utils`, `src/types`, etc.).
*   Implemented initial calculation logic for basic bread profiles.

### [X] Stage 2: Advanced Substitutions & Logic (V1.2 Complete)
*   Implemented ingredient substitution rules (e.g., flax egg, sour cream).
*   Added complex dough stability analysis (Protein/Starch/Hydration ratios).

### [ ] Stage 3: End-to-End Testing & Edge Cases (Pending Final Pass)
*   Expand unit test coverage for all calculation methods using edge case inputs (zero weights, invalid types). *Current tests cover many cases but require deeper structural validation.*

### [ ] Stage 4: Component Integration & Refinement (To Do)
*   Connect the `useBreadCalculator` hook to a full React component tree.
*   Implement complex UI feedback for user-facing error handling and best practices advice.

### [X] Stage 5: Documentation, Deployment & Sync (Completed)
*   Updated `README.md` with installation/usage instructions.
*   Created `.github/workflows/deploy.yml` to automate linting, type-checking, building, and deployment on `main`.

## ⚙️ Technical Notes
*   **Constraint:** All development must remain confined to the `/juva/` scope.
*   **Tools:** Utilize `baking-calculator-workflow` skill for architectural guidance.
---
# 1. Clone  repo
git clone https://github.com/jericbas/Air-fryer-bread-calculator.git
cd Air-fryer-bread-calculator

(keeps the .git folder and your README)




Here is the complete project plan and refactored code to migrate your single-file application into a scalable, production-ready React application. We will strictly adhere to SOLID principles and use modern tooling.

---

### Phase 1: Setup & Configuration

Run these commands in your terminal to scaffold the project, utilizing Bun for fast dependency management and execution:

```bash
# 1. cd ir-fryer-bread-calculator

# 2. Install core dependencies
bun install
bun add lucide-react

# 3. Install Tailwind CSS and its peer dependencies
bun add -D tailwindcss postcss autoprefixer
bunx tailwindcss init -p

# 4. Install and initialize Biome JS (Replacing ESLint/Prettier)
bun add -D @biomejs/biome
bunx @biomejs/biome init

```

**`biome.json`**
Configure Biome for a React/TypeScript environment:

```json
{
  "$schema": "https://biomejs.dev/schemas/1.8.3/schema.json",
  "formatter": {
    "enabled": true,
    "formatWithErrors": false,
    "indentStyle": "space",
    "indentWidth": 2,
    "lineWidth": 100
  },
  "linter": {
    "enabled": true,
    "rules": {
      "recommended": true,
      "correctness": {
        "noUnusedVariables": "error",
        "useExhaustiveDependencies": "warn"
      },
      "style": {
        "useConst": "error"
      }
    }
  },
  "javascript": {
    "formatter": {
      "quoteStyle": "single",
      "jsxQuoteStyle": "double",
      "semicolons": "always"
    }
  }
}

```

**`tailwind.config.ts`**

```typescript
import type { Config } from 'tailwindcss';

export default {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {},
  },
  plugins: [],
} satisfies Config;

```

**`vite.config.ts`**
Set the base path so GitHub Pages serves your assets correctly.

```typescript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  base: '/air-fryer-bread-calc/', // Update to your exact GitHub repo name
});

```

---

### Phase 2: Domain Logic & Types (The "Core")

We apply the **Open/Closed Principle** and **Interface Segregation Principle** by isolating our domain types and calculation logic.

**`src/types/index.ts`**

```typescript
export type FlourType = 'ap' | 'bread' | 'wheat';
export type LiquidBase = 'water' | 'milk' | 'evap' | 'condensed';
export type Technique = 'none' | 'egg' | 'tangzhong';
export type MixinType = 'none' | 'Raisins (Pasas)' | 'Chocolate Chips' | 'Cheese (Cheddar/Edam)' | 'Mozzarella Cheese' | 'Mixed Nuts';

export interface RecipeConfig {
  flourWeight: number;
  flourType: FlourType;
  liquidBase: LiquidBase;
  technique: Technique;
  mixin: MixinType;
}

export interface CalculatedIngredients {
  mainFlour: number;
  mainLiquid: number;
  saltWeight: number;
  yeastWeight: number;
  oilWeight: number;
  sugarWeight: number;
  condensedWeight: number;
  mixinWeight: number;
  eggCount: number;
  tzFlour: number;
  tzLiquid: number;
  liquidName: string;
}

export interface DoughProfile {
  softness: number;
  richness: number;
  chewiness: number;
}

```

**`src/constants/recipeConfig.ts`**

```typescript
import { FlourType } from '../types';

export const HYDRATION_RATES: Record<FlourType, number> = {
  ap: 0.60,
  bread: 0.65,
  wheat: 0.73
};

export const BAKERS_PERCENTAGES = {
  OIL: 0.08,
  SUGAR: 0.08,
  SALT: 0.02,
  YEAST: 0.015,
  MIXIN: 0.20,
} as const;

```

**`src/utils/calculations.ts`**
Pure, easily testable functions holding all business logic (**Single Responsibility Principle**).

```typescript
import { HYDRATION_RATES, BAKERS_PERCENTAGES } from '../constants/recipeConfig';
import { RecipeConfig, CalculatedIngredients, DoughProfile } from '../types';

export const calculateIngredients = (config: RecipeConfig): CalculatedIngredients => {
  const { flourWeight: weight, flourType, liquidBase, technique } = config;
  
  const totalLiquid = weight * HYDRATION_RATES[flourType];
  const saltWeight = weight * BAKERS_PERCENTAGES.SALT;
  const yeastWeight = weight * BAKERS_PERCENTAGES.YEAST;
  const oilWeight = weight * BAKERS_PERCENTAGES.OIL;
  const mixinWeight = weight * BAKERS_PERCENTAGES.MIXIN;

  let sugarWeight = weight * BAKERS_PERCENTAGES.SUGAR;
  let condensedWeight = 0;
  let liquidName = 'Water';
  let baseLiquidAmount = totalLiquid;

  if (liquidBase === 'milk') {
    liquidName = 'Fresh Milk';
  } else if (liquidBase === 'evap') {
    liquidName = 'Evaporated (Evap)';
  } else if (liquidBase === 'condensed') {
    condensedWeight = weight * 0.20;
    sugarWeight = 0;
    baseLiquidAmount = baseLiquidAmount - (condensedWeight * 0.30);
  }

  let eggCount = 0;
  let tzFlour = 0;
  let tzLiquid = 0;
  let mainFlour = weight;
  let mainLiquid = baseLiquidAmount;

  if (technique === 'egg') {
    eggCount = Math.max(1, Math.round(weight / 400));
    const eggLiquid = eggCount * 50;
    mainLiquid = Math.max(0, mainLiquid - eggLiquid);
  } else if (technique === 'tangzhong') {
    tzFlour = weight * 0.05;
    tzLiquid = tzFlour * 5;
    mainFlour = weight - tzFlour;
    mainLiquid = Math.max(0, mainLiquid - tzLiquid);
  }

  return {
    mainFlour, mainLiquid, saltWeight, yeastWeight, oilWeight, sugarWeight,
    condensedWeight, mixinWeight, eggCount, tzFlour, tzLiquid, liquidName
  };
};

export const calculateProfile = (config: RecipeConfig): DoughProfile => {
  const { flourType, liquidBase, technique, mixin } = config;

  let softness = 2;
  if (technique === 'tangzhong') softness += 2;
  if (technique === 'egg') softness += 0.5;
  if (['milk', 'evap', 'condensed'].includes(liquidBase)) softness += 0.5;
  if (flourType === 'ap') softness += 0.5;

  let richness = 1;
  if (liquidBase === 'condensed') richness += 3;
  else if (['milk', 'evap'].includes(liquidBase)) richness += 1;
  if (technique === 'egg') richness += 1;
  if (mixin !== 'none') richness += 0.5;

  let chewiness = 1;
  if (flourType === 'bread') chewiness += 3;
  if (flourType === 'wheat') chewiness += 2;
  if (flourType === 'ap') chewiness += 1.5;
  if (technique === 'none') chewiness += 0.5;

  return {
    softness: Math.min(5, softness),
    richness: Math.min(5, richness),
    chewiness: Math.min(5, chewiness)
  };
};

// Formatting helpers
export const formatCups = (g: number) => `~${(g / 125).toFixed(1)} cups 🥛`;
export const formatTbsp = (g: number, density: number) => `~${(g / density).toFixed(1)} Tbsp 🥄`;
export const formatTsp = (g: number, density: number) => `~${(g / density).toFixed(1)} tsp 🤏`;
export const formatMl = (g: number) => `${Math.round(g)} mL 💧`;

```

---

### Phase 3: State Management (The "Hook")

Applying the **Dependency Inversion Principle**, the UI does not compute values; it simply consumes this hook.

**`src/hooks/useBreadCalculator.ts`**

```typescript
import { useState, useMemo } from 'react';
import { RecipeConfig, FlourType, LiquidBase, Technique, MixinType } from '../types';
import { calculateIngredients, calculateProfile } from '../utils/calculations';

export const useBreadCalculator = () => {
  const [config, setConfig] = useState<RecipeConfig>({
    flourWeight: 500,
    flourType: 'ap',
    liquidBase: 'water',
    technique: 'none',
    mixin: 'none'
  });

  const updateConfig = <K extends keyof RecipeConfig>(key: K, value: RecipeConfig[K]) => {
    setConfig((prev) => ({ ...prev, [key]: value }));
  };

  const ingredients = useMemo(() => calculateIngredients(config), [config]);
  const profile = useMemo(() => calculateProfile(config), [config]);

  return { config, updateConfig, ingredients, profile };
};

```

---

### Phase 4: UI Components (The "View")

**`src/components/ScoreBar.tsx`**

```tsx
import React from 'react';

interface Props {
  label: string;
  score: number;
  colorClass: string;
}

export const ScoreBar: React.FC<Props> = ({ label, score, colorClass }) => (
  <div className="space-y-1">
    <div className="flex justify-between text-xs font-semibold text-stone-600">
      <span className="uppercase tracking-wider">{label}</span>
      <span>{score.toFixed(1)} / 5</span>
    </div>
    <div className="h-2 w-full bg-stone-100 rounded-full overflow-hidden">
      <div 
        className={`h-full ${colorClass} transition-all duration-500 ease-out`} 
        style={{ width: `${(score / 5) * 100}%` }}
      />
    </div>
  </div>
);

```

**`src/components/SetupForm.tsx`**

```tsx
import React from 'react';
import { Scale, Milk, Feather, Calculator } from 'lucide-react';
import { RecipeConfig, FlourType, LiquidBase, Technique, MixinType } from '../types';

interface Props {
  config: RecipeConfig;
  updateConfig: <K extends keyof RecipeConfig>(key: K, value: RecipeConfig[K]) => void;
}

export const SetupForm: React.FC<Props> = ({ config, updateConfig }) => {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-orange-100 p-6">
      <h2 className="text-xl font-semibold text-amber-900 mb-6 flex items-center gap-2">
        <Calculator size={20} className="text-amber-500" />
        Recipe Setup
      </h2>
      <div className="space-y-4">
        
        {/* Flour Input */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-stone-700">Flour (grams)</label>
          <div className="relative">
            <input
              type="number"
              value={config.flourWeight}
              onChange={(e) => updateConfig('flourWeight', Number(e.target.value))}
              className="w-full pl-10 pr-2 py-2.5 rounded-xl border border-stone-200 focus:border-amber-500 focus:ring-2 outline-none"
            />
            <Scale className="absolute left-3 top-3 text-stone-400" size={18} />
          </div>
        </div>

        {/* Flour Type */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-stone-700">Flour Type</label>
          <select
            value={config.flourType}
            onChange={(e) => updateConfig('flourType', e.target.value as FlourType)}
            className="w-full px-3 py-2.5 rounded-xl border border-stone-200 focus:border-amber-500 focus:ring-2 outline-none bg-white"
          >
            <option value="ap">All-Purpose</option>
            <option value="bread">Bread Flour</option>
            <option value="wheat">Whole Wheat</option>
          </select>
        </div>

        {/* Technique, Liquid Base, and Add-ins follow the exact same simplified structure... */}
      </div>
    </div>
  );
};

```

**`src/App.tsx`**
Wire everything together cleanly.

```tsx
import React from 'react';
import { Wheat } from 'lucide-react';
import { useBreadCalculator } from './hooks/useBreadCalculator';
import { SetupForm } from './components/SetupForm';
import { ScoreBar } from './components/ScoreBar';
// Import other separated components here...

const App: React.FC = () => {
  const { config, updateConfig, ingredients, profile } = useBreadCalculator();

  return (
    <div className="min-h-screen bg-orange-50 text-stone-800 p-4 md:p-8 font-sans">
      <div className="max-w-5xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="text-center space-y-2 mb-8">
          <div className="inline-flex items-center justify-center p-3 bg-amber-500 rounded-full text-white mb-2 shadow-lg">
            <Wheat size={32} />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-amber-900 tracking-tight">Air Fryer Bread Calculator</h1>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          <div className="xl:col-span-1 space-y-6">
            <SetupForm config={config} updateConfig={updateConfig} />
            
            {/* Dough Profile UI */}
            <div className="bg-stone-800 rounded-2xl p-6 text-stone-100">
              <h2 className="text-lg font-semibold text-white mb-5">Predicted Dough Profile</h2>
              <ScoreBar label="Pillowy Softness" score={profile.softness} colorClass="bg-blue-400" />
              <ScoreBar label="Richness & Flavor" score={profile.richness} colorClass="bg-yellow-400" />
              <ScoreBar label="Chewiness (Gluten)" score={profile.chewiness} colorClass="bg-orange-500" />
            </div>
          </div>

          <div className="xl:col-span-2 space-y-6">
            {/* Render <IngredientsList ingredients={ingredients} /> 
              Render <SmartInstructions ingredients={ingredients} config={config} /> 
              Render <SourcesFooter />
            */}
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;

```

---

### Phase 5: GitHub Pages Deployment

Create a GitHub Actions workflow file to handle Biome linting, TypeScript type-checking, Vite building, and deployment.

**`.github/workflows/deploy.yml`**

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: ["main"]
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: "pages"
  cancel-in-progress: true

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Setup Bun
        uses: oven-sh/setup-bun@v1
        with:
          bun-version: latest

      - name: Install Dependencies
        run: bun install

      - name: Lint and Format with Biome
        run: bunx @biomejs/biome ci ./src

      - name: Type Check
        run: bunx tsc --noEmit

      - name: Build Vite App
        run: bun run build

      - name: Upload artifact
        uses: actions/upload-pages-artifact@v3
        with:
          path: ./dist

  deploy:
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    needs: build
    runs-on: ubuntu-latest
    steps:
      - name: Deploy to GitHub Pages
        id: deployment
        uses: actions/deploy-pages@v4

```
>>>>>>> develop
