export interface CepAddress {
  logradouro: string;
  bairro: string;
  localidade: string;
  uf: string;
}

/** Busca endereço por CEP direto do navegador (ViaCEP libera CORS). Usar só em Client Components. */
export async function lookupCepClient(digits: string): Promise<CepAddress | null> {
  try {
    const response = await fetch(`https://viacep.com.br/ws/${digits}/json/`);
    if (!response.ok) return null;
    const data = await response.json();
    if (data.erro) return null;
    return {
      logradouro: data.logradouro ?? "",
      bairro: data.bairro ?? "",
      localidade: data.localidade ?? "",
      uf: data.uf ?? "",
    };
  } catch {
    return null;
  }
}
