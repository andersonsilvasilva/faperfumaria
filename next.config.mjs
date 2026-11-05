/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    // AVIF/WebP redimensionados sob demanda (o navegador recebe só o tamanho de que precisa).
    formats: ["image/avif", "image/webp"],
    // Arquivos de /uploads têm nome UUID (nunca são sobrescritos), então cache longo é seguro.
    minimumCacheTTL: 31536000,
  },
  experimental: {
    // Hospedagem compartilhada (ex.: Hostinger) reporta a contagem de CPUs do host físico, não
    // a fração real alocada para a conta — sem isso o build tenta abrir dezenas de workers e
    // estoura o limite de processos do plano (EAGAIN ao spawnar worker). Ver docs/deployment.md.
    cpus: 2,
  },
};

export default nextConfig;
