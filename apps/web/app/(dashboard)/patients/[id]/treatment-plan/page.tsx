"use client";

import React from "react";
import { useParams } from "next/navigation";
import { DentalArch } from "../../../../../components/dental-arch";
import { usePatient } from "../../../../../hooks/use-patient";

export default function TreatmentPlanPage() {
  const params = useParams();
  const id = params.id as string;
  const { data: patient, isLoading, updatePatient } = usePatient(id);

  const handleUpdate = (status: any) => {
    updatePatient({ id, patient: { dentalChart: status } });
  };

  if (isLoading) return <div>Loading...</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Piano di Cura & Odontogramma</h2>
      </div>
      
      <DentalArch 
        initialStatus={patient?.dentalChart || {}} 
        onUpdate={handleUpdate} 
      />
      
      <div className="mt-8">
        <h3 className="text-lg font-medium mb-4">Lista Trattamenti</h3>
        <p className="text-muted-foreground">Nessun trattamento pianificato.</p>
        {/* Here you would list treatments */}
      </div>
    </div>
  );
}
