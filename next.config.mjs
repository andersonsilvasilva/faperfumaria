/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    // Hospedagem compartilhada (ex.: Hostinger) reporta a contagem de CPUs do host físico, não
    // a fração real alocada para a conta — sem isso o build tenta abrir dezenas de workers e
    // estoura o limite de processos do plano (EAGAIN ao spawnar worker). Ver docs/deployment.md.
    cpus: 2,
  },
};

export default nextConfig;
