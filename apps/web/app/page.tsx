import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-24">
      <h1 className="text-4xl font-bold mb-4">Dental SaaS V1</h1>
      <p className="text-xl text-slate-600 mb-8">Benvenuto nel tuo nuovo gestionale.</p>
      <Button>Clicca qui</Button>
    </div>
  );
}