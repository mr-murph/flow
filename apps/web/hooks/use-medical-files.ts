"use client";

import { useQuery } from "@tanstack/react-query";

export interface MedicalFile {
  id: string;
  fileName: string;
  s3Key: string;
  mimeType: string;
  sizeBytes: number;
  patientId: string;
  uploadedBy: string;
  createdAt: string;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

async function fetchMedicalFiles(patientId: string): Promise<MedicalFile[]> {
  const token = localStorage.getItem("token");
  const headers: HeadersInit = token ? { Authorization: `Bearer ${token}` } : {};

  const response = await fetch(`${API_URL}/patients/${patientId}/files`, {
    headers,
  }); 
  if (!response.ok) {
    throw new Error("Failed to fetch medical files");
  }
  return response.json();
}

export function useMedicalFiles(patientId: string) {
  return useQuery<MedicalFile[], Error>({
    queryKey: ["patient-files", patientId],
    queryFn: () => fetchMedicalFiles(patientId),
    enabled: !!patientId,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}
