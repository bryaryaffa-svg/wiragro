"use client";

import Link from "next/link";
import { useEffect, useState, useTransition } from "react";

import { useAuth } from "@/components/auth-provider";
import { PermissionCodeInput } from "@/components/ui/permission-code-input";
import { StepWizard } from "@/components/ui/step-wizard";
import {
  type B2BInquiryInput,
  type B2BInquiryRequestedItemInput,
  submitB2BInquiry,
} from "@/lib/api";

type B2BInquiryFormProps = {
  sourcePage?: string;
  bundleSlug?: string;
  bundleTitle?: string;
  campaignSlug?: string;
  campaignTitle?: string;
  productSlug?: string;
  productName?: string;
  commoditySlug?: string;
  defaultCommodityFocus?: string;
  contextLabel?: string;
  contextTitle?: string;
  eyebrowLabel?: string;
  heading?: string;
  description?: string;
  submitLabel?: string;
  summaryPlaceholder?: string;
};

function buildDefaultRequestedItems(
  source: Pick<B2BInquiryFormProps, "bundleTitle" | "campaignTitle" | "productName">,
): B2BInquiryRequestedItemInput[] {
  if (source.productName) {
      return [
        {
          label: source.productName,
          qty: "",
          unit: "",
          notes: "Membahas kebutuhan dari produk ini.",
        },
      ];
  }

  if (source.bundleTitle) {
      return [
        {
          label: source.bundleTitle,
          qty: "",
          unit: "",
          notes: "Membahas volume atau penyesuaian paket ini.",
        },
      ];
  }

  if (source.campaignTitle) {
      return [
        {
          label: source.campaignTitle,
          qty: "",
          unit: "",
          notes: "Membahas kebutuhan yang datang dari campaign ini.",
        },
      ];
  }

  return [
    {
      label: "",
      qty: "",
      unit: "",
      notes: "",
    },
  ];
}

function buildInitialForm(
  props: Pick<
    B2BInquiryFormProps,
    | "sourcePage"
    | "bundleSlug"
    | "campaignSlug"
    | "productSlug"
    | "productName"
    | "commoditySlug"
    | "bundleTitle"
    | "campaignTitle"
    | "defaultCommodityFocus"
  >,
): B2BInquiryInput {
  return {
    buyerType: "kebun",
    businessName: "",
    contactName: "",
    phone: "",
    email: "",
    commodityFocus: props.defaultCommodityFocus ?? "",
    commoditySlug: props.commoditySlug,
    bundleSlug: props.bundleSlug,
    campaignSlug: props.campaignSlug,
    productSlug: props.productSlug,
    productName: props.productName,
    monthlyVolume: "",
    fulfillmentType: "delivery",
    preferredFollowUp: "whatsapp",
    budgetHint: "",
    needSummary: "",
    requestedItems: buildDefaultRequestedItems(props),
    notes: "",
    sourcePage: props.sourcePage ?? "/b2b",
  };
}

export function B2BInquiryForm({
  sourcePage = "/b2b",
  bundleSlug,
  bundleTitle,
  campaignSlug,
  campaignTitle,
  productSlug,
  productName,
  commoditySlug,
  defaultCommodityFocus,
  contextLabel,
  contextTitle,
  eyebrowLabel = "Inquiry B2B",
  heading = "Kirim kebutuhan B2B dengan format yang rapi.",
  description = "Isi ringkasannya, lalu tim Wiragro akan menindaklanjuti lewat kanal yang Anda pilih. Form ini cocok untuk kebutuhan kebun, reseller, proyek, atau pembelian rutin.",
  submitLabel = "Kirim inquiry B2B",
  summaryPlaceholder = "Jelaskan kebutuhan utama, komoditas, ritme pembelian, target proyek, atau keputusan yang ingin Anda ambil dari penawaran ini.",
}: B2BInquiryFormProps) {
  const { session, isReady } = useAuth();
  const [form, setForm] = useState<B2BInquiryInput>(() =>
    buildInitialForm({
      sourcePage,
      bundleSlug,
      campaignSlug,
      productSlug,
      productName,
      commoditySlug,
      bundleTitle,
      campaignTitle,
      defaultCommodityFocus,
    }),
  );
  const [feedback, setFeedback] = useState<string | null>(null);
  const [submittedInquiryNumber, setSubmittedInquiryNumber] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [permissionCode, setPermissionCode] = useState("");

  useEffect(() => {
    setForm((current) => ({
      ...current,
      sourcePage,
      bundleSlug,
      campaignSlug,
      productSlug,
      productName,
      commoditySlug,
      commodityFocus: current.commodityFocus || defaultCommodityFocus || "",
      requestedItems:
        current.requestedItems.length > 0
          ? current.requestedItems
          : buildDefaultRequestedItems({ bundleTitle, campaignTitle, productName }),
    }));
  }, [
    sourcePage,
    bundleSlug,
    campaignSlug,
    productSlug,
    productName,
    commoditySlug,
    bundleTitle,
    campaignTitle,
    defaultCommodityFocus,
  ]);

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

  function updateRequestedItem(
    index: number,
    key: keyof B2BInquiryRequestedItemInput,
    value: string,
  ) {
    setForm((current) => ({
      ...current,
      requestedItems: current.requestedItems.map((item, itemIndex) =>
        itemIndex === index
          ? {
              ...item,
              [key]: value,
            }
          : item,
      ),
    }));
  }

  function addRequestedItem() {
    setForm((current) => ({
      ...current,
      requestedItems: [
        ...current.requestedItems,
        {
          label: "",
          qty: "",
          unit: "",
          notes: "",
        },
      ],
    }));
  }

  function removeRequestedItem(index: number) {
    setForm((current) => {
      const nextItems = current.requestedItems.filter((_, itemIndex) => itemIndex !== index);

      return {
        ...current,
        requestedItems:
          nextItems.length > 0
            ? nextItems
            : buildDefaultRequestedItems({ bundleTitle, campaignTitle, productName }),
      };
    });
  }

  const contextBadges = [
    contextLabel && contextTitle ? `${contextLabel}: ${contextTitle}` : null,
    productName ? `Produk: ${productName}` : null,
    bundleTitle ? `Bundle: ${bundleTitle}` : null,
    campaignTitle ? `Campaign: ${campaignTitle}` : null,
    defaultCommodityFocus ? `Komoditas: ${defaultCommodityFocus}` : null,
  ].filter(Boolean);

  return (
    <div className="b2b-inquiry-panel" id="b2b-quote-form">
      <div className="b2b-inquiry-panel__intro">
        <span className="eyebrow-label">{eyebrowLabel}</span>
        <h2>{heading}</h2>
        <p>{description}</p>
        <StepWizard
          steps={[
            {
              description: "Isi komoditas, volume, dan item utama.",
              label: "Jelaskan kebutuhan",
              status: "current",
            },
            {
              description: "Wiragro membaca konteks dan kebutuhan pembelian.",
              label: "Tim review",
              status: "upcoming",
            },
            {
              description: "Lanjut ke penawaran, WhatsApp, atau akun khusus.",
              label: "Tindak lanjut",
              status: "upcoming",
            },
          ]}
        />
        {contextBadges.length ? (
          <div className="b2b-inquiry-context">
            <strong>Konteks yang ikut terkirim</strong>
            <div className="b2b-inquiry-context__badges">
              {contextBadges.map((badge) => (
                <span key={badge}>{badge}</span>
              ))}
            </div>
          </div>
        ) : null}
      </div>

      <form
        className="b2b-inquiry-form"
        onSubmit={(event) => {
          event.preventDefault();
          setFeedback(null);
          setIsSuccess(false);
          setSubmittedInquiryNumber(null);

          startTransition(async () => {
            try {
              const response = await submitB2BInquiry(
                {
                  ...form,
                  notes: [
                    (form.notes ?? "").trim(),
                    permissionCode.trim()
                      ? `Kode izin / kode kerja sama: ${permissionCode.trim()}`
                      : "",
                  ]
                    .filter(Boolean)
                    .join("\n\n"),
                },
                {
                accessToken: session?.access_token,
                },
              );
              setSubmittedInquiryNumber(response.inquiry_number);
              setFeedback(
                `Inquiry ${response.inquiry_number} masuk dengan status ${response.status_label.toLowerCase()}. Tim akan follow-up lewat ${response.preferred_follow_up}.`,
              );
              setIsSuccess(true);
              setForm((current) => {
                const nextBase = buildInitialForm({
                  sourcePage,
                  bundleSlug,
                  campaignSlug,
                  productSlug,
                  productName,
                  commoditySlug,
                  bundleTitle,
                  campaignTitle,
                  defaultCommodityFocus,
                });

                return {
                  ...nextBase,
                  contactName: current.contactName,
                  phone: current.phone,
                  email: current.email,
                  businessName: current.businessName,
                };
              });
              setPermissionCode("");
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
            onChange={(event) =>
              updateField("buyerType", event.target.value as B2BInquiryInput["buyerType"])
            }
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
                updateField(
                  "fulfillmentType",
                  event.target.value as B2BInquiryInput["fulfillmentType"],
                )
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

        <PermissionCodeInput value={permissionCode} onChange={setPermissionCode} />

        <div className="b2b-inquiry-items">
          <div className="b2b-inquiry-items__header">
            <div>
              <span className="eyebrow-label">Item kebutuhan</span>
              <strong>Susun kebutuhan utama agar tim Wiragro bisa menyiapkan penawaran awal.</strong>
            </div>
            <button className="btn btn-secondary" onClick={addRequestedItem} type="button">
              Tambah item
            </button>
          </div>

          <div className="b2b-inquiry-items__list">
            {form.requestedItems.map((item, index) => (
              <article className="b2b-inquiry-item" key={`requested-item-${index}`}>
                <div className="b2b-inquiry-item__grid">
                  <label className="form-grid__full">
                    <span>Nama item / kebutuhan</span>
                    <input
                      onChange={(event) => updateRequestedItem(index, "label", event.target.value)}
                      placeholder="Contoh: paket cabai, pupuk dasar, sprayer, atau kombinasi SKU"
                      required
                      value={item.label}
                    />
                  </label>

                  <label>
                    <span>Perkiraan qty</span>
                    <input
                      onChange={(event) => updateRequestedItem(index, "qty", event.target.value)}
                      placeholder="Contoh: 20"
                      value={item.qty}
                    />
                  </label>

                  <label>
                    <span>Satuan</span>
                    <input
                      onChange={(event) => updateRequestedItem(index, "unit", event.target.value)}
                      placeholder="Contoh: sak, botol, pak"
                      value={item.unit}
                    />
                  </label>

                  <label className="form-grid__full">
                    <span>Catatan item</span>
                    <textarea
                      onChange={(event) => updateRequestedItem(index, "notes", event.target.value)}
                      placeholder="Opsional: merek yang disukai, fase tanam, batas budget per item, atau kebutuhan setara."
                      rows={3}
                      value={item.notes}
                    />
                  </label>
                </div>
                <div className="b2b-inquiry-item__actions">
                  <button
                    className="btn btn-secondary"
                    onClick={() => removeRequestedItem(index)}
                    type="button"
                  >
                    Hapus item
                  </button>
                </div>
              </article>
            ))}
          </div>
        </div>

        <label>
          <span>Ringkasan kebutuhan</span>
          <textarea
            onChange={(event) => updateField("needSummary", event.target.value)}
            placeholder={summaryPlaceholder}
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
            <strong>{feedback}</strong>
            {isSuccess && session ? (
              <span>
                Status inquiry dan estimasi kebutuhan akan muncul di <Link href="/akun">akun Anda</Link>.
              </span>
            ) : null}
            {isSuccess && submittedInquiryNumber && !session ? (
              <span>
                Simpan nomor ini untuk referensi manual: <strong>{submittedInquiryNumber}</strong>.
              </span>
            ) : null}
          </div>
        ) : null}

        <div className="b2b-inquiry-form__actions">
          <button className="btn btn-primary" disabled={isPending} type="submit">
            {isPending ? "Mengirim inquiry..." : submitLabel}
          </button>
          <p>
            Tim Wiragro akan menindaklanjuti bila diperlukan. Form ini membantu kebutuhan,
            item utama, dan estimasi awal tercatat lebih rapi.
          </p>
          {session ? (
            <p>
              Karena Anda sudah login, inquiry ini otomatis ditautkan ke akun Anda agar
              status dan estimasi kebutuhan bisa dipantau lagi nanti.
            </p>
          ) : (
            <p>
              Login ke akun membuat status inquiry dan estimasi kebutuhan lebih mudah dipantau dari halaman akun.
            </p>
          )}
        </div>
      </form>
    </div>
  );
}
