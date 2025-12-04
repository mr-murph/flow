"use client";

import React, { useState } from "react";
import { 
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
  Button,
  Label,
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from "./ui";

// ISO 3950 notation for teeth
const TEETH_UPPER = [
  18, 17, 16, 15, 14, 13, 12, 11, 21, 22, 23, 24, 25, 26, 27, 28
];
const TEETH_LOWER = [
  48, 47, 46, 45, 44, 43, 42, 41, 31, 32, 33, 34, 35, 36, 37, 38
];

interface DentalArchProps {
  initialStatus?: Record<string, any>;
  onUpdate?: (status: Record<string, any>) => void;
}

export function DentalArch({ initialStatus = {}, onUpdate }: DentalArchProps) {
  const [teethStatus, setTeethStatus] = useState<Record<string, any>>(initialStatus);
  const [selectedTooth, setSelectedTooth] = useState<number | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [currentCondition, setCurrentCondition] = useState("");

  const handleToothClick = (toothId: number) => {
    setSelectedTooth(toothId);
    setCurrentCondition(teethStatus[toothId]?.condition || "");
    setDialogOpen(true);
  };

  const handleSaveCondition = () => {
    if (selectedTooth) {
      const newStatus = {
        ...teethStatus,
        [selectedTooth]: { condition: currentCondition },
      };
      setTeethStatus(newStatus);
      if (onUpdate) {
        onUpdate(newStatus);
      }
    }
    setDialogOpen(false);
  };

  const getToothColor = (toothId: number) => {
    const condition = teethStatus[toothId]?.condition;
    switch (condition) {
      case "CARIE": return "fill-red-400";
      case "OTTURAZIONE": return "fill-blue-400";
      case "DEVITALIZZAZIONE": return "fill-gray-400";
      case "ESTRAZIONE": return "fill-black opacity-20";
      case "CORONA": return "fill-yellow-400";
      default: return "fill-white hover:fill-gray-100";
    }
  };

  const ToothPath = ({ id, cx, cy }: { id: number; cx: number; cy: number }) => (
    <g
      onClick={() => handleToothClick(id)}
      className="cursor-pointer transition-colors duration-200"
    >
      <circle
        cx={cx}
        cy={cy}
        r="15"
        stroke="currentColor"
        strokeWidth="2"
        className={`${getToothColor(id)}`}
      />
      <text
        x={cx}
        y={cy + 5}
        textAnchor="middle"
        className="text-[10px] select-none fill-slate-700 font-bold"
      >
        {id}
      </text>
    </g>
  );

  return (
    <div className="flex flex-col items-center gap-8 p-6 bg-slate-50 rounded-lg border">
      <h3 className="text-lg font-semibold">Odontogramma</h3>
      
      <svg width="600" height="300" viewBox="0 0 600 300" className="max-w-full">
        {/* Upper Arch */}
        <path d="M 50,100 Q 300,-50 550,100" fill="none" stroke="#cbd5e1" strokeWidth="2" />
        {TEETH_UPPER.map((id, index) => {
          // Calculate positions along a curve
          const x = 70 + index * 32; 
          const y = 100 - Math.sin((index / 15) * Math.PI) * 60;
          return <ToothPath key={id} id={id} cx={x} cy={y} />;
        })}

        {/* Lower Arch */}
        <path d="M 50,200 Q 300,350 550,200" fill="none" stroke="#cbd5e1" strokeWidth="2" />
        {TEETH_LOWER.map((id, index) => {
          const x = 70 + index * 32;
          const y = 200 + Math.sin((index / 15) * Math.PI) * 60;
          return <ToothPath key={id} id={id} cx={x} cy={y} />;
        })}
      </svg>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Dente {selectedTooth}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="condition" className="text-right">
                Condizione
              </Label>
              <Select value={currentCondition} onValueChange={setCurrentCondition}>
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Seleziona condizione" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="HEALTHY">Sano</SelectItem>
                  <SelectItem value="CARIE">Carie</SelectItem>
                  <SelectItem value="OTTURAZIONE">Otturazione</SelectItem>
                  <SelectItem value="DEVITALIZZAZIONE">Devitalizzazione</SelectItem>
                  <SelectItem value="ESTRAZIONE">Estratto/Mancante</SelectItem>
                  <SelectItem value="CORONA">Corona</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button onClick={handleSaveCondition}>Salva</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
