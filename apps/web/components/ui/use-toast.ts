"use client"

// Simplified toast hook for rapid development
export function useToast() {
  const toast = ({ title, description, variant }: { title: string, description?: string, variant?: "default" | "destructive" }) => {
    console.log(`[Toast] ${title}: ${description}`);
    if (variant === "destructive") {
        alert(`${title}\n${description}`);
    } else {
        // Optional: Implement a real toast overlay if needed, but console/alert is fine for MVP
    }
  }
  return { toast }
}
