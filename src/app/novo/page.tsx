import { CreateCareerForm } from "@/components/game/create-career-form";
import { getCountries } from "@/lib/queries";

export default async function NovoPage() {
  const countries = await getCountries();

  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-12 sm:py-16">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-extrabold tracking-tight">Crie seu jogador</h1>
        <p className="mt-2 text-muted-foreground">
          Aos 16 anos, você sai da base rumo ao profissional. Defina quem você é dentro de campo.
        </p>
      </div>
      <CreateCareerForm countries={countries} />
    </div>
  );
}
