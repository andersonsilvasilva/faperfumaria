"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import type { CouponActionState } from "@/modules/admin/coupons-actions";

interface CouponData {
  code: string;
  type: "PERCENTAGE" | "FIXED";
  value: unknown;
  minOrderValue: unknown;
  startsAt: Date | null;
  endsAt: Date | null;
  maxUses: number | null;
  maxUsesPerCustomer: number | null;
  isActive: boolean;
  categories: { categoryId: string }[];
  products: { product: { name: string } }[];
}

const initialState: CouponActionState = { status: "idle" };
const inputClass =
  "mt-1 h-10 w-full rounded-sm border border-fa-stone/40 px-3 text-sm focus:border-fa-gold focus:outline-none";
const labelClass = "text-xs font-medium text-fa-black/70";

function toDateInput(value: Date | null | undefined): string {
  return value ? value.toISOString().slice(0, 10) : "";
}

export function CouponForm({
  action,
  coupon,
  categoryOptions,
}: {
  action: (prevState: CouponActionState, formData: FormData) => Promise<CouponActionState>;
  coupon?: CouponData;
  categoryOptions: { id: string; name: string }[];
}) {
  const [state, formAction, isPending] = useActionState(action, initialState);
  const selectedCategoryIds = new Set(coupon?.categories.map((c) => c.categoryId) ?? []);

  return (
    <form action={formAction} className="max-w-lg space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className={labelClass} htmlFor="code">
            Código
          </label>
          <input
            id="code"
            name="code"
            required
            defaultValue={coupon?.code}
            className={`${inputClass} uppercase`}
            placeholder="BEMVINDO10"
          />
        </div>
        <div>
          <label className={labelClass} htmlFor="type">
            Tipo
          </label>
          <select id="type" name="type" defaultValue={coupon?.type ?? "PERCENTAGE"} className={inputClass}>
            <option value="PERCENTAGE">Percentual (%)</option>
            <option value="FIXED">Valor fixo (R$)</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className={labelClass} htmlFor="value">
            Valor do desconto
          </label>
          <input
            id="value"
            name="value"
            type="number"
            step="0.01"
            min="0"
            required
            defaultValue={coupon?.value?.toString()}
            className={inputClass}
          />
        </div>
        <div>
          <label className={labelClass} htmlFor="minOrderValue">
            Pedido mínimo (opcional)
          </label>
          <input
            id="minOrderValue"
            name="minOrderValue"
            type="number"
            step="0.01"
            min="0"
            defaultValue={coupon?.minOrderValue?.toString() ?? ""}
            className={inputClass}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className={labelClass} htmlFor="startsAt">
            Início (opcional)
          </label>
          <input
            id="startsAt"
            name="startsAt"
            type="date"
            defaultValue={toDateInput(coupon?.startsAt)}
            className={inputClass}
          />
        </div>
        <div>
          <label className={labelClass} htmlFor="endsAt">
            Validade (opcional)
          </label>
          <input
            id="endsAt"
            name="endsAt"
            type="date"
            defaultValue={toDateInput(coupon?.endsAt)}
            className={inputClass}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className={labelClass} htmlFor="maxUses">
            Limite total de usos (opcional)
          </label>
          <input
            id="maxUses"
            name="maxUses"
            type="number"
            min="1"
            defaultValue={coupon?.maxUses ?? ""}
            className={inputClass}
          />
        </div>
        <div>
          <label className={labelClass} htmlFor="maxUsesPerCustomer">
            Limite por cliente (opcional)
          </label>
          <input
            id="maxUsesPerCustomer"
            name="maxUsesPerCustomer"
            type="number"
            min="1"
            defaultValue={coupon?.maxUsesPerCustomer ?? ""}
            className={inputClass}
          />
        </div>
      </div>

      <div>
        <p className={labelClass}>Categorias elegíveis (vazio = todas)</p>
        <div className="mt-2 flex flex-wrap gap-3">
          {categoryOptions.map((category) => (
            <label key={category.id} className="flex items-center gap-2 text-sm text-fa-black/70">
              <input
                type="checkbox"
                name="categoryIds"
                value={category.id}
                defaultChecked={selectedCategoryIds.has(category.id)}
              />
              {category.name}
            </label>
          ))}
        </div>
      </div>

      <div>
        <label className={labelClass} htmlFor="productNames">
          Produtos elegíveis (nomes exatos, separados por vírgula — vazio = todos)
        </label>
        <input
          id="productNames"
          name="productNames"
          defaultValue={coupon?.products.map((p) => p.product.name).join(", ") ?? ""}
          className={inputClass}
        />
      </div>

      <label className="flex items-center gap-2 text-sm text-fa-black/70">
        <input type="checkbox" name="isActive" defaultChecked={coupon?.isActive ?? true} />
        Ativo
      </label>

      {state.status === "error" && <p className="text-sm text-red-600">{state.message}</p>}

      <Button type="submit" disabled={isPending}>
        {isPending ? "Salvando..." : "Salvar cupom"}
      </Button>
    </form>
  );
}
