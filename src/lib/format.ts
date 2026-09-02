const currencyFormatter = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});

type Numeric = number | string | { toString(): string };

export function formatPrice(value: Numeric) {
  return currencyFormatter.format(Number(value.toString()));
}

export function formatInstallments(value: Numeric, installments = 3) {
  const total = Number(value.toString());
  const perInstallment = total / installments;
  return `${installments}x de ${formatPrice(perInstallment)} sem juros`;
}
