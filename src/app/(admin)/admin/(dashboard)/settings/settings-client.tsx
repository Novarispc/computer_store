"use client";

import { useState, useTransition } from "react";
import { Trash2 } from "lucide-react";
import { updateStoreSettings } from "@/server/admin/settings";
import { AdminCard, Field, inputClass } from "@/components/admin/ui";
import { Button } from "@/components/ui";
import type { StoreSettings } from "@/lib/settings";
import type { Person } from "@data/company";

export function SettingsClient({ initial }: { initial: StoreSettings }) {
  const [store, setStore] = useState<StoreSettings>(initial);
  const [saved, setSaved] = useState(false);
  const [pending, startTransition] = useTransition();

  function updatePerson(i: number, patch: Partial<Person>) {
    setStore((s) => ({
      ...s,
      directory: s.directory.map((p, j) => (j === i ? { ...p, ...patch } : p)),
    }));
  }

  function removePerson(i: number) {
    setStore((s) => ({ ...s, directory: s.directory.filter((_, j) => j !== i) }));
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaved(false);
    startTransition(async () => {
      await updateStoreSettings(store);
      setSaved(true);
      window.setTimeout(() => setSaved(false), 1600);
    });
  }

  return (
    <form onSubmit={onSubmit} className="space-y-8">
      <AdminCard className="p-6">
        <h2 className="mb-5 font-display text-sm font-semibold">Store information</h2>
        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="Store name">
            <input
              value={store.name}
              onChange={(e) => setStore((s) => ({ ...s, name: e.target.value }))}
              required
              className={inputClass()}
            />
          </Field>
          <Field label="Tagline">
            <input
              value={store.tagline}
              onChange={(e) => setStore((s) => ({ ...s, tagline: e.target.value }))}
              className={inputClass()}
            />
          </Field>
        </div>
      </AdminCard>

      <AdminCard className="p-6">
        <h2 className="font-display text-sm font-semibold">Contact details</h2>
        <p className="mb-5 mt-1 text-xs text-muted-foreground">
          Used on the Contact page, in the footer, and on every quote confirmation.
        </p>
        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="Phone">
            <input
              id="settings-phone"
              value={store.primary.phone}
              onChange={(e) =>
                setStore((s) => ({ ...s, primary: { ...s.primary, phone: e.target.value } }))
              }
              className={inputClass()}
            />
          </Field>
          <Field label="Email">
            <input
              id="settings-email"
              type="email"
              value={store.primary.email}
              onChange={(e) =>
                setStore((s) => ({ ...s, primary: { ...s.primary, email: e.target.value } }))
              }
              className={inputClass()}
            />
          </Field>
          <Field label="WhatsApp number" hint="Digits and country code, e.g. +919447030932">
            <input
              id="settings-whatsapp"
              value={store.primary.whatsapp}
              onChange={(e) =>
                setStore((s) => ({ ...s, primary: { ...s.primary, whatsapp: e.target.value } }))
              }
              className={inputClass()}
            />
          </Field>
          <Field label="Opening hours">
            <input
              value={store.hours}
              onChange={(e) => setStore((s) => ({ ...s, hours: e.target.value }))}
              className={inputClass()}
            />
          </Field>
        </div>

        <div className="mt-5 grid gap-5 sm:grid-cols-2">
          <Field label="Address line 1">
            <input
              value={store.address.line1}
              onChange={(e) =>
                setStore((s) => ({ ...s, address: { ...s.address, line1: e.target.value } }))
              }
              className={inputClass()}
            />
          </Field>
          <Field label="Address line 2">
            <input
              value={store.address.line2}
              onChange={(e) =>
                setStore((s) => ({ ...s, address: { ...s.address, line2: e.target.value } }))
              }
              className={inputClass()}
            />
          </Field>
          <Field label="City">
            <input
              value={store.address.city}
              onChange={(e) =>
                setStore((s) => ({ ...s, address: { ...s.address, city: e.target.value } }))
              }
              className={inputClass()}
            />
          </Field>
          <Field label="State">
            <input
              value={store.address.state}
              onChange={(e) =>
                setStore((s) => ({ ...s, address: { ...s.address, state: e.target.value } }))
              }
              className={inputClass()}
            />
          </Field>
        </div>
      </AdminCard>

      <AdminCard className="p-6">
        <div className="mb-1 flex items-center justify-between">
          <h2 className="font-display text-sm font-semibold">Staff directory</h2>
        </div>
        <p className="mb-5 text-xs text-muted-foreground">
          Shown on the Contact page. Remove anyone who should not have their direct number listed
          publicly.
        </p>
        <div className="space-y-3">
          {store.directory.map((p, i) => (
            <div key={i} className="grid gap-2 sm:grid-cols-[1fr_1fr_1fr_auto] sm:items-end">
              <Field label="Department">
                <input
                  value={p.department}
                  onChange={(e) => updatePerson(i, { department: e.target.value })}
                  className={inputClass()}
                />
              </Field>
              <Field label="Name">
                <input
                  value={p.name}
                  onChange={(e) => updatePerson(i, { name: e.target.value })}
                  className={inputClass()}
                />
              </Field>
              <Field label="Phone">
                <input
                  value={p.phone ?? ""}
                  onChange={(e) => updatePerson(i, { phone: e.target.value })}
                  className={inputClass()}
                />
              </Field>
              <button
                type="button"
                onClick={() => removePerson(i)}
                aria-label={`Remove ${p.name} from directory`}
                className="mb-0.5 justify-self-start text-muted-foreground hover:text-danger sm:justify-self-center"
              >
                <Trash2 size={16} aria-hidden />
              </button>
            </div>
          ))}
        </div>
      </AdminCard>

      <AdminCard className="p-6">
        <h2 className="font-display text-sm font-semibold">Service lines</h2>
        <p className="mb-5 mt-1 text-xs text-muted-foreground">
          Shown on the Services and Contact pages. Separate multiple numbers with a comma.
        </p>
        <div className="space-y-3">
          {store.serviceLines.map((line, i) => (
            <div key={i} className="grid gap-2 sm:grid-cols-[1fr_2fr]">
              <Field label="Label">
                <input
                  value={line.label}
                  onChange={(e) =>
                    setStore((s) => ({
                      ...s,
                      serviceLines: s.serviceLines.map((l, j) =>
                        j === i ? { ...l, label: e.target.value } : l
                      ),
                    }))
                  }
                  className={inputClass()}
                />
              </Field>
              <Field label="Numbers">
                <input
                  value={line.numbers.join(", ")}
                  onChange={(e) =>
                    setStore((s) => ({
                      ...s,
                      serviceLines: s.serviceLines.map((l, j) =>
                        j === i
                          ? {
                              ...l,
                              numbers: e.target.value
                                .split(",")
                                .map((n) => n.trim())
                                .filter(Boolean),
                            }
                          : l
                      ),
                    }))
                  }
                  className={inputClass()}
                />
              </Field>
            </div>
          ))}
        </div>
      </AdminCard>

      {saved ? <p className="text-sm text-success">Saved.</p> : null}

      <Button type="submit" disabled={pending}>
        {pending ? "Saving…" : "Save settings"}
      </Button>
    </form>
  );
}
