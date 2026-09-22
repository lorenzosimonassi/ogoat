"use client";

import { useMemo, useState } from "react";
import { useFormStatus } from "react-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { createCareer } from "@/actions";
import { POSITIONS, POSITION_LABEL } from "@/lib/game/constants";
import { suggestPlayerName, type CountryCode } from "@/lib/game/names";
import type { Foot } from "@/generated/prisma/client";

type Country = { id: string; name: string; code: string; flag: string };

const FOOT_OPTIONS: { value: Foot; label: string }[] = [
  { value: "RIGHT", label: "Destro" },
  { value: "LEFT", label: "Canhoto" },
  { value: "BOTH", label: "Ambidestro" },
];

export function CreateCareerForm({ countries }: { countries: Country[] }) {
  const [name, setName] = useState("");
  const [countryId, setCountryId] = useState(countries[0]?.id ?? "");
  const [position, setPosition] = useState(POSITIONS[POSITIONS.length - 1]);
  const [foot, setFoot] = useState<Foot>("RIGHT");

  const selectedCountry = useMemo(() => countries.find((c) => c.id === countryId), [countries, countryId]);

  function handleSuggestName() {
    const code = (selectedCountry?.code ?? "BRA") as CountryCode;
    setName(suggestPlayerName(Math.random, code));
  }

  return (
    <Card className="border-border/70">
      <CardContent>
        <form action={createCareer} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="name">Nome do jogador</Label>
            <div className="flex gap-2">
              <Input
                id="name"
                name="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ex: Kaique Silva"
                required
                maxLength={40}
              />
              <Button type="button" variant="outline" onClick={handleSuggestName}>
                Sugerir
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Nacionalidade</Label>
            <Select value={countryId} onValueChange={(value) => setCountryId(value ?? "")}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Selecione o país">
                  {(value: string) => {
                    const c = countries.find((country) => country.id === value);
                    return c ? `${c.flag} ${c.name}` : "Selecione o país";
                  }}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {countries.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.flag} {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <input type="hidden" name="countryId" value={countryId} />
          </div>

          <div className="space-y-2">
            <Label>Posição</Label>
            <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
              {POSITIONS.map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setPosition(p)}
                  className={cn(
                    "rounded-lg border px-3 py-2 text-sm font-medium transition-colors",
                    position === p
                      ? "border-primary bg-primary/15 text-primary"
                      : "border-border/60 bg-card/40 text-muted-foreground hover:border-primary/40",
                  )}
                >
                  {POSITION_LABEL[p]}
                </button>
              ))}
            </div>
            <input type="hidden" name="position" value={position} />
          </div>

          <div className="space-y-2">
            <Label>Pé preferido</Label>
            <div className="grid grid-cols-3 gap-2">
              {FOOT_OPTIONS.map((f) => (
                <button
                  key={f.value}
                  type="button"
                  onClick={() => setFoot(f.value)}
                  className={cn(
                    "rounded-lg border px-3 py-2 text-sm font-medium transition-colors",
                    foot === f.value
                      ? "border-primary bg-primary/15 text-primary"
                      : "border-border/60 bg-card/40 text-muted-foreground hover:border-primary/40",
                  )}
                >
                  {f.label}
                </button>
              ))}
            </div>
            <input type="hidden" name="foot" value={foot} />
          </div>

          <SubmitButton />
        </form>
      </CardContent>
    </Card>
  );
}

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" size="lg" className="w-full" disabled={pending}>
      {pending ? "Criando carreira..." : "Começar carreira"}
    </Button>
  );
}
