"use client";

import * as React from "react";

import type { SimulationInput } from "@/lib/finance";
import { runSimulation } from "@/lib/finance";
import { Button } from "@/components/ui/button";
import { ScenarioForm } from "./scenario-form";
import { ScenarioResults } from "./scenario-results";
import { ComparisonTable } from "./comparison-table";
import { DEFAULT_SIMULATION_INPUT } from "./constants";

export function Simulator() {
  const [scenarioA, setScenarioA] = React.useState<SimulationInput>(DEFAULT_SIMULATION_INPUT);
  const [scenarioB, setScenarioB] = React.useState<SimulationInput | null>(null);

  const resultA = runSimulation(scenarioA);
  const resultB = scenarioB ? runSimulation(scenarioB) : null;

  return (
    <div className="flex flex-1 flex-col gap-6">
      <div className="flex justify-end">
        {scenarioB ? (
          <Button variant="outline" onClick={() => setScenarioB(null)}>
            Retirer le scénario B
          </Button>
        ) : (
          <Button variant="outline" onClick={() => setScenarioB({ ...scenarioA })}>
            Comparer avec un scénario B
          </Button>
        )}
      </div>

      <div className={scenarioB ? "grid grid-cols-1 gap-6 lg:grid-cols-2" : "flex flex-col gap-6"}>
        <div className="flex flex-col gap-6">
          <ScenarioForm
            title={scenarioB ? "Scénario A" : "Votre projet"}
            value={scenarioA}
            onChange={setScenarioA}
            idPrefix="a"
          />
          <ScenarioResults result={resultA} />
        </div>

        {scenarioB && (
          <div className="flex flex-col gap-6">
            <ScenarioForm title="Scénario B" value={scenarioB} onChange={setScenarioB} idPrefix="b" />
            <ScenarioResults result={resultB!} />
          </div>
        )}
      </div>

      {scenarioB && resultB && <ComparisonTable resultA={resultA} resultB={resultB} />}
    </div>
  );
}
