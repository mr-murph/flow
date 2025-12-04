"use client";

import { useParams } from "next/navigation";
import { usePatient } from "../../../../hooks/use-patient";
import { Card, CardContent, CardHeader, CardTitle } from "../../../../components/ui/card";

export default function PatientPage() {
  const params = useParams();
  const id = params.id as string;
  const { data: patient, isLoading, error } = usePatient(id);

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error loading patient</div>;
  if (!patient) return <div>Patient not found</div>;

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">Anagrafica Paziente</h2>
      
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Dati Personali</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div>
              <span className="font-semibold">Nome:</span> {patient.firstName}
            </div>
            <div>
              <span className="font-semibold">Cognome:</span> {patient.lastName}
            </div>
            <div>
              <span className="font-semibold">Codice Fiscale:</span> {patient.cf || "-"}
            </div>
            <div>
              <span className="font-semibold">Creato il:</span> {new Date(patient.createdAt).toLocaleDateString()}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
