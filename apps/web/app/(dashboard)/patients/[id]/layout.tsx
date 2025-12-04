import React from "react";
import { notFound } from "next/navigation";
import Link from "next/link";

interface PatientDetailLayoutProps {
  children: React.ReactNode;
  params: Promise<{ id: string }>;
}

// Placeholder for fetching patient details
async function getPatientDetails(id: string) {
  // In a real app, fetch patient data from your API
  // For now, return a dummy patient or null
  if (id === "123") {
    return {
      id: "123",
      firstName: "John",
      lastName: "Doe",
      cf: "JOHNDOE123",
      tenantId: "tenant1",
    };
  }
  return null;
}

export default async function PatientDetailLayout({ children, params }: PatientDetailLayoutProps) {
  const { id } = await params;
  const patient = await getPatientDetails(id);

  if (!patient) {
    notFound();
  }

  const tabs = [
    { name: "Anagrafica", href: `/patients/${id}` },
    { name: "Piano di Cura", href: `/patients/${id}/treatment-plan` },
    { name: "Files", href: `/patients/${id}/files` },
  ];

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-4">{patient.firstName} {patient.lastName}</h1>
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8" aria-label="Tabs">
          {tabs.map((tab) => (
            <Link
              key={tab.name}
              href={tab.href}
              className="whitespace-nowrap border-b-2 px-1 py-4 text-sm font-medium"
            >
              {tab.name}
            </Link>
          ))}
        </nav>
      </div>
      <div>{children}</div>
    </div>
  );
}
