import type { Metadata } from "next";
import { listStoreSettings } from "@/modules/admin/settings-queries";
import { SettingForm } from "@/components/admin/settings/setting-form";
import { MaintenanceToggleForm } from "@/components/admin/settings/maintenance-toggle-form";
import { getMaintenanceMode } from "@/modules/settings/maintenance";

export const metadata: Metadata = {
  title: "Configurações | Admin",
};

export const dynamic = "force-dynamic";

export default async function AdminSettingsPage() {
  const [settings, maintenance] = await Promise.all([listStoreSettings(), getMaintenanceMode()]);

  return (
    <div className="max-w-2xl">
      <h1 className="font-display text-2xl text-fa-black">Configurações</h1>
      <p className="mt-1 text-sm text-fa-black/60">
        Configurações gerais da loja, guardadas como chave/valor (JSON). Ex.: preços de entrega
        local (<code>local_delivery_pricing</code>).
      </p>

      <section className="mt-8 rounded-sm border border-fa-gold/40 bg-fa-gold/5 p-6">
        <h2 className="font-display text-lg text-fa-black">Modo de manutenção</h2>
        <div className="mt-3">
          <MaintenanceToggleForm maintenance={maintenance} />
        </div>
      </section>

      <div className="mt-8 space-y-8">
        {settings.map((setting) => (
          <section
            key={setting.id}
            className="rounded-sm border border-fa-stone/15 bg-fa-white p-6 shadow-[0_20px_45px_-30px_rgba(11,11,11,0.4)]"
          >
            <h2 className="font-display text-lg text-fa-black">{setting.key}</h2>
            <div className="mt-3">
              <SettingForm settingKey={setting.key} initialValue={JSON.stringify(setting.value, null, 2)} />
            </div>
          </section>
        ))}

        <section className="rounded-sm border border-dashed border-fa-stone/30 p-6">
          <h2 className="font-display text-lg text-fa-black">Nova configuração</h2>
          <div className="mt-3">
            <SettingForm />
          </div>
        </section>
      </div>
    </div>
  );
}
