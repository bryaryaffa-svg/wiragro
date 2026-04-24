"use client";

import { useEffect, useState, useTransition } from "react";

import { useAuth } from "@/components/auth-provider";
import { type B2BInquiryInput, submitB2BInquiry } from "@/lib/api";

const DEFAULT_FORM: B2BInquiryInput = {
  buyerType: "kebun",
  businessName: "",
  contactName: "",
  phone: "",
  email: "",
  commodityFocus: "",
  monthlyVolume: "",
  fulfillmentType: "delivery",
  preferredFollowUp: "whatsapp",
  budgetHint: "",
  needSummary: "",
  notes: "",
  sourcePage: "/b2b",
};

export function B2BInquiryForm({
  sourcePage = "/b2b",
  bundleSlug,
  campaignSlug,
}: {
  sourcePage?: string;
  bundleSlug?: string;
  campaignSlug?: string;
}) {
  const { session, isReady } = useAuth();
  const [form, setForm] = useState<B2BInquiryInput>({
    ...DEFAULT_FORM,
    sourcePage,
    bundleSlug,
    campaignSlug,
  });
  const [feedback, setFeedback] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    if (!isReady || !session) {
      return;
    }

    setForm((current) => ({
      ...current,
      contactName: current.contactName || session.customer.full_name || "",
      phone: current.phone || session.customer.phone || "",
      email: current.email || session.customer.email || "",
    }));
  }, [isReady, session]);

  function updateField<Key extends keyof B2BInquiryInput>(key: Key, value: B2BInquiryInput[Key]) {
    setForm((current) => ({
      ...current,
      [key]: value,
    }));
  }

  return (
    <div className="b2b-inquiry-panel">
      <div className="b2b-inquiry-panel__intro">
        <span className="eyebrow-label">Lead capture</span>
        <h2>Kirim kebutuhan B2B tanpa menunggu flow quotation yang berat.</h2>
        <p>
          Isi ringkasannya, lalu tim toko bisa follow-up lewat kanal yang paling Anda pilih.
          Form ini dibuat untuk kebutuhan kebun, reseller, proyek, atau pembelian rutin.
        </p>
      </div>

      <form
        className="b2b-inquiry-form"
        onSubmit={(event) => {
          event.preventDefault();
          setFeedback(null);
          setIsSuccess(false);

          startTransition(async () => {
            try {
              const response = await submitB2BInquiry(form);
              setFeedback(
                `Inquiry masuk dengan status ${response.status}. Tim akan follow-up lewat ${response.preferred_follow_up}.`,
              );
              setIsSuccess(true);
              setForm((current) => ({
                ...DEFAULT_FORM,
                sourcePage,
                bundleSlug,
                campaignSlug,
                contactName: current.contactName,
                phone: current.phone,
                email: current.email,
              }));
            } catch (submitError) {
              setFeedback(
                submitError instanceof Error
                  ? submitError.message
                  : "Inquiry belum berhasil dikirim.",
              );
            }
          });
        }}
      >
        <label>
          <span>Jenis kebutuhan</span>
          <select
            onChange={(event) => updateField("buyerType", event.target.value as B2BInquiryInput["buyerType"])}
            value={form.buyerType}
          >
            <option value="kebun">Kebun / lahan</option>
            <option value="reseller">Reseller / kios</option>
            <option value="proyek">Proyek</option>
            <option value="rutin">Kebutuhan rutin</option>
          </select>
        </label>

        <label>
          <span>Nama bisnis</span>
          <input
            onChange={(event) => updateField("businessName", event.target.value)}
            placeholder="Contoh: Kios Tani Maju"
            value={form.businessName}
          />
        </label>

        <div className="b2b-inquiry-form__grid">
          <label>
            <span>Nama kontak</span>
            <input
              onChange={(event) => updateField("contactName", event.target.value)}
              required
              value={form.contactName}
            />
          </label>

          <label>
            <span>Nomor WhatsApp / telepon</span>
            <input
              onChange={(event) => updateField("phone", event.target.value)}
              required
              value={form.phone}
            />
          </label>
        </div>

        <div className="b2b-inquiry-form__grid">
          <label>
            <span>Email</span>
            <input
              onChange={(event) => updateField("email", event.target.value)}
              type="email"
              value={form.email}
            />
          </label>

          <label>
            <span>Fokus komoditas</span>
            <input
              onChange={(event) => updateField("commodityFocus", event.target.value)}
              placeholder="Contoh: cabai, padi, sayuran daun"
              value={form.commodityFocus}
            />
          </label>
        </div>

        <div className="b2b-inquiry-form__grid">
          <label>
            <span>Ritme / volume kebutuhan</span>
            <input
              onChange={(event) => updateField("monthlyVolume", event.target.value)}
              placeholder="Contoh: mingguan 20-30 sak"
              value={form.monthlyVolume}
            />
          </label>

          <label>
            <span>Preferensi fulfillment</span>
            <select
              onChange={(event) =>
                updateField("fulfillmentType", event.target.value as B2BInquiryInput["fulfillmentType"])
              }
              value={form.fulfillmentType}
            >
              <option value="delivery">Delivery</option>
              <option value="pickup">Pickup</option>
              <option value="mixed">Campuran</option>
            </select>
          </label>
        </div>

        <div className="b2b-inquiry-form__grid">
          <label>
            <span>Kanal follow-up</span>
            <select
              onChange={(event) =>
                updateField(
                  "preferredFollowUp",
                  event.target.value as B2BInquiryInput["preferredFollowUp"],
                )
              }
              value={form.preferredFollowUp}
            >
              <option value="whatsapp">WhatsApp</option>
              <option value="phone">Telepon</option>
              <option value="email">Email</option>
            </select>
          </label>

          <label>
            <span>Perkiraan budget</span>
            <input
              onChange={(event) => updateField("budgetHint", event.target.value)}
              placeholder="Contoh: 5-10 juta per bulan"
              value={form.budgetHint}
            />
          </label>
        </div>

        <label>
          <span>Ringkasan kebutuhan</span>
          <textarea
            onChange={(event) => updateField("needSummary", event.target.value)}
            placeholder="Jelaskan kebutuhan utama, komoditas, ritme pembelian, atau target proyek."
            required
            rows={5}
            value={form.needSummary}
          />
        </label>

        <label>
          <span>Catatan tambahan</span>
          <textarea
            onChange={(event) => updateField("notes", event.target.value)}
            placeholder="Opsional: lokasi, jam follow-up, permintaan bundling, atau catatan operasional."
            rows={3}
            value={form.notes}
          />
        </label>

        {feedback ? (
          <div className={`b2b-inquiry-form__feedback ${isSuccess ? "is-success" : "is-error"}`}>
            {feedback}
          </div>
        ) : null}

        <div className="b2b-inquiry-form__actions">
          <button className="btn btn-primary" disabled={isPending} type="submit">
            {isPending ? "Mengirim inquiry..." : "Kirim inquiry B2B"}
          </button>
          <p>
            Inquiry ini masuk ke jalur operasional untuk follow-up ringan, bukan proses tender
            penuh. Cocok untuk validasi awal dan pengumpulan kebutuhan.
          </p>
        </div>
      </form>
    </div>
  );
}
