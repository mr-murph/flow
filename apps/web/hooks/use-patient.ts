import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

interface Patient {
  id: string;
  firstName: string;
  lastName: string;
  cf?: string;
  dentalChart?: any; // JSON
  tenantId: string;
  createdAt: string;
  updatedAt: string;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

async function fetchPatient(id: string): Promise<Patient> {
  const token = localStorage.getItem("token"); // Assuming auth token storage
  const headers: HeadersInit = token ? { "Authorization": `Bearer ${token}` } : {};
  
  const response = await fetch(`${API_URL}/patients/${id}`, { headers });
  if (!response.ok) {
    throw new Error("Failed to fetch patient");
  }
  return response.json();
}

async function updatePatient(data: { id: string; patient: Partial<Patient> }): Promise<Patient> {
  const token = localStorage.getItem("token");
  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...(token ? { "Authorization": `Bearer ${token}` } : {}),
  };

  const response = await fetch(`${API_URL}/patients/${data.id}`, {
    method: "PATCH",
    headers,
    body: JSON.stringify(data.patient),
  });

  if (!response.ok) {
    throw new Error("Failed to update patient");
  }
  return response.json();
}

export function usePatient(id: string) {
  const queryClient = useQueryClient();

  const query = useQuery<Patient, Error>({
    queryKey: ["patient", id],
    queryFn: () => fetchPatient(id),
    enabled: !!id,
  });

  const mutation = useMutation({
    mutationFn: updatePatient,
    onSuccess: (updatedPatient) => {
      queryClient.setQueryData(["patient", id], updatedPatient);
    },
  });

  return { ...query, updatePatient: mutation.mutate };
}
