"use client";

import { AdvancedMetrics, ActionMetrics } from "@/lib/mock-data";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, Activity, DollarSign, Network, PackageX, Banknote, ShieldAlert, Users, Scale } from "lucide-react";

interface Props {
  advanced: AdvancedMetrics;
  action: ActionMetrics;
}

export function AdvancedMetricsPanel({ advanced, action }: Props) {
  return (
    <div className="space-y-6">
      {/* The Big Three (Hero Metrics) */}
      <h3 className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground pb-2 border-b border-border/50">
        Quantitative Impact (The "Hard" Numbers)
      </h3>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Effective Price Delta */}
        <Card className="shadow-none border border-border bg-card">
          <CardContent className="p-5">
            <div className="flex justify-between items-start">
              <span className="text-xs font-semibold text-muted-foreground">Effective Price Delta</span>
              <DollarSign className="w-4 h-4 text-primary opacity-70" />
            </div>
            <div className="mt-3">
              <span className="text-2xl font-bold font-mono">+{advanced.effective_price_delta}%</span>
            </div>
            <p className="text-[10px] text-muted-foreground mt-2 leading-tight">
              Total estimated increase in final retail cost.
            </p>
          </CardContent>
        </Card>

        {/* Trade Diversion Score */}
        <Card className="shadow-none border border-border bg-card">
          <CardContent className="p-5">
            <div className="flex justify-between items-start">
              <span className="text-xs font-semibold text-muted-foreground">Trade Diversion Score</span>
              <Network className="w-4 h-4 text-orange-500 opacity-70" />
            </div>
            <div className="mt-3">
              <span className="text-2xl font-bold font-mono">{advanced.trade_diversion_score}%</span>
            </div>
            <p className="text-[10px] text-muted-foreground mt-2 leading-tight">
              Trade volume likely to shift to a different country.
            </p>
          </CardContent>
        </Card>

        {/* Supply Chain Fragility Index */}
        <Card className="shadow-none border border-border bg-card">
          <CardContent className="p-5">
            <div className="flex justify-between items-start">
              <span className="text-xs font-semibold text-muted-foreground">Supply Chain Fragility</span>
              <ShieldAlert className="w-4 h-4 text-impact-high opacity-70" />
            </div>
            <div className="mt-3 flex items-baseline gap-1">
              <span className="text-2xl font-bold font-mono">{advanced.supply_chain_fragility}</span>
              <span className="text-xs text-muted-foreground font-mono">/10</span>
            </div>
            <div className="w-full bg-muted rounded-full h-1.5 mt-2">
              <div 
                className="bg-impact-high h-1.5 rounded-full" 
                style={{ width: `${(advanced.supply_chain_fragility / 10) * 100}%` }}
              />
            </div>
            <p className="text-[10px] text-muted-foreground mt-2 leading-tight">
              Vulnerability based on supply chain complexity.
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Ripple Metrics (Deep Dive) */}
        <Card className="shadow-none border border-border bg-card flex-1">
          <CardHeader className="p-4 pb-0 bg-muted/20 border-b border-border/50">
            <CardTitle className="text-xs font-semibold text-foreground uppercase tracking-wider flex items-center gap-2">
              <Activity className="w-3.5 h-3.5 text-primary" /> Ripple Metrics
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="grid grid-cols-2 divide-x divide-y divide-border/50">
              
              <div className="p-4 flex flex-col justify-center">
                <span className="text-[10px] font-medium text-muted-foreground uppercase mb-1">PCE Pass-Through</span>
                <span className="text-lg font-bold font-mono text-impact-high">{advanced.pce_pass_through}%</span>
                <span className="text-[9px] text-muted-foreground mt-0.5">Tax absorbed by consumer</span>
              </div>
              
              <div className="p-4 flex flex-col justify-center">
                <span className="text-[10px] font-medium text-muted-foreground uppercase mb-1">Input-Output Lag</span>
                <span className="text-lg font-bold font-mono">{advanced.input_output_lag_months} <span className="text-sm">mo</span></span>
                <span className="text-[9px] text-muted-foreground mt-0.5">Time to hit retail shelves</span>
              </div>
              
              <div className="p-4 flex flex-col justify-center">
                <span className="text-[10px] font-medium text-muted-foreground uppercase mb-1">Substitution Elast.</span>
                <span className="text-lg font-bold font-mono">{advanced.elasticity_of_substitution}</span>
                <span className="text-[9px] text-muted-foreground mt-0.5">Ease of replacing supplier</span>
              </div>
              
              <div className="p-4 flex flex-col justify-center">
                <span className="text-[10px] font-medium text-muted-foreground uppercase mb-1">US Rev Impact</span>
                <span className="text-lg font-bold font-mono text-primary">+${advanced.gov_revenue_impact_billions}B</span>
                <span className="text-[9px] text-muted-foreground mt-0.5">Tariff tax collected</span>
              </div>

            </div>
          </CardContent>
        </Card>

        {/* Action Metrics */}
        <Card className="shadow-none border border-border bg-card flex-1">
          <CardHeader className="p-4 pb-0 bg-muted/20 border-b border-border/50">
            <CardTitle className="text-xs font-semibold text-foreground uppercase tracking-wider flex items-center gap-2">
              <Scale className="w-3.5 h-3.5 text-primary" /> Action Metrics
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="grid grid-rows-2 divide-y divide-border/50 h-[calc(100%-41px)]">
              
              <div className="p-4 flex flex-col justify-center h-full">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-medium text-muted-foreground uppercase">Alt-Sourcing ROI</span>
                  <PackageX className="w-3.5 h-3.5 text-emerald-500" />
                </div>
                <div className="mt-2">
                  <span className="text-2xl font-bold font-mono text-emerald-500">${action.alt_sourcing_roi_millions}</span>
                  <span className="text-sm font-semibold font-mono text-emerald-500 ml-1">Million</span>
                </div>
                <span className="text-[10px] text-muted-foreground mt-1">Potential savings if switching to alternate suppliers.</span>
              </div>
              
              <div className="p-4 flex flex-col justify-center h-full">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-medium text-muted-foreground uppercase">Net Welfare Effect</span>
                  <Banknote className="w-3.5 h-3.5 text-muted-foreground" />
                </div>
                <div className="mt-2">
                  <span className={action.net_welfare_effect.includes("Loss") ? "text-xl font-bold text-impact-high" : "text-xl font-bold text-impact-low"}>
                    {action.net_welfare_effect}
                  </span>
                </div>
                <span className="text-[10px] text-muted-foreground mt-1">Overall economic health (Gov gain vs Consumer loss).</span>
              </div>

            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
