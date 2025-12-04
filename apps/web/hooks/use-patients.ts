import { useQuery } from "@tanstack/react-query";

interface Patient {
  id: string;
  firstName: string;
  lastName: string;
  cf?: string;
  tenantId: string;
  createdAt: string;
  updatedAt: string;
}

async function fetchPatients(): Promise<Patient[]> {
  // In a real application, you would fetch from your NestJS API.
  // This is a placeholder for demonstration.
  const response = await fetch("http://localhost:3001/patients"); // Adjust API endpoint as needed
  if (!response.ok) {
    throw new Error("Failed to fetch patients");
  }
  return response.json();
}

export function usePatients() {
  return useQuery<Patient[], Error>({
    queryKey: ["patients"],
    queryFn: fetchPatients,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}
