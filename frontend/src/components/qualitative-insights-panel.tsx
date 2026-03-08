"use client";

import { QualitativeData } from "@/lib/mock-data";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, AlertCircle, Briefcase, Info } from "lucide-react";
import { cn } from "@/lib/utils";

interface Props {
  data: QualitativeData;
}

export function QualitativeInsightsPanel({ data }: Props) {
  return (
    <div className="space-y-6">
      <h3 className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground pb-2 border-b border-border/50">
        Qualitative Impact (The "Story")
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Corporate Exposure */}
        <Card className="shadow-none border border-border bg-card">
          <CardHeader className="p-4 pb-3">
            <CardTitle className="text-xs font-semibold text-foreground uppercase tracking-wider flex items-center gap-2">
              <Briefcase className="w-4 h-4 text-primary" /> Corporate Exposure
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="space-y-3">
              {data.top_companies.map((company, idx) => (
                <div key={idx} className="flex items-center justify-between p-2.5 rounded-md bg-muted/40 border border-border/50">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded bg-background border border-border flex items-center justify-center font-bold text-xs">
                      {company.name.charAt(0)}
                    </div>
                    <span className="text-sm font-semibold">{company.name}</span>
                  </div>
                  <div className={cn(
                    "px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider",
                    company.exposure === "Critical" ? "bg-impact-high/10 text-impact-high border border-impact-high/20" :
                    company.exposure === "High" ? "bg-impact-mid/10 text-orange-500 border border-orange-500/20" :
                    "bg-impact-low/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
                  )}>
                    {company.exposure}
                  </div>
                </div>
              ))}
            </div>
            <p className="text-[10px] text-muted-foreground mt-3 flex gap-1.5 items-start">
              <Info className="w-3.5 h-3.5 shrink-0" />
              Major Canadian/Global entities heavily integrated into the impacted cross-border supply chains.
            </p>
          </CardContent>
        </Card>

        {/* Risk & Logistics Tags */}
        <div className="space-y-4 flex flex-col">
          <Card className="shadow-none border border-border bg-card flex-1">
            <CardHeader className="p-4 pb-2">
              <CardTitle className="text-xs font-semibold text-foreground uppercase tracking-wider flex items-center gap-2">
                <Users className="w-4 h-4 text-primary" /> Job Risk Level
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-1 flex flex-col justify-center">
              <span className="text-xl font-bold text-foreground">{data.job_risk_level}</span>
              <p className="text-[11px] text-muted-foreground mt-1">
                Estimated impact on the Canadian labor force within this sector.
              </p>
            </CardContent>
          </Card>

          <Card className="shadow-none border border-border bg-card flex-1">
            <CardHeader className="p-4 pb-2">
              <CardTitle className="text-xs font-semibold text-foreground uppercase tracking-wider flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-primary" /> Substitution Ease
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-1 flex flex-col justify-center">
              <div className="flex gap-2">
                {["Easy", "Moderate", "Hard"].map((lvl) => (
                  <span key={lvl} className={cn(
                    "px-3 py-1 rounded bg-muted text-xs font-semibold border",
                    lvl === data.substitution_ease 
                      ? "bg-primary text-primary-foreground border-primary" 
                      : "border-border/60 text-muted-foreground opacity-50"
                  )}>
                    {lvl}
                  </span>
                ))}
              </div>
              <p className="text-[11px] text-muted-foreground mt-2">
                Difficulty of sourcing materials globally outside affected lines.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
