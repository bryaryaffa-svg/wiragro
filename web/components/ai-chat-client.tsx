"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { startTransition, useEffect, useRef, useState } from "react";

import { ArticleMiniCard } from "@/components/article-mini-card";
import { useAuth } from "@/components/auth-provider";
import { ProductMiniCard } from "@/components/product-mini-card";
import { VideoMiniCard } from "@/components/video-mini-card";
import { PrimaryButton, SecondaryButton } from "@/components/ui/button";
import { LoadingSkeleton } from "@/components/ui/loading-skeleton";
import { TrustBadge } from "@/components/ui/trust-badge";
import {
  type AiChatContext,
  type AiChatStructuredResponse,
  isPremiumAiUser,
  requestAiChatResponse,
} from "@/lib/ai-chat-adapter";
import { trackUiEvent } from "@/lib/analytics";
import type { ArticleSummaryPayload, ProductSummary } from "@/lib/api";
import type { EducationVideoResource } from "@/lib/education-content";
import {
  getSolutionCropOptions,
  getSolutionProblemOptions,
} from "@/lib/solution-experience";

type ChatMessage = {
  id: string;
  response?: AiChatStructuredResponse;
  role: "assistant" | "user";
  text?: string;
};

const DEFAULT_PROMPTS = [
  "Daun padi menguning",
  "Cabai keriting",
  "Hama wereng",
  "Buah rontok",
  "Pupuk apa yang cocok?",
  "Biaya pemupukan terlalu besar",
];

function createMessageId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function prettify(value?: string | null) {
  if (!value) {
    return null;
  }

  return value
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function getCropLabel(value?: string | null) {
  return (
    getSolutionCropOptions().find((item) => item.id === value)?.label ??
    prettify(value)
  );
}

function getProblemLabel(value?: string | null) {
  return (
    getSolutionProblemOptions().find((item) => item.id === value)?.label ??
    prettify(value)
  );
}

function buildNextHref(search: string) {
  const target = search ? `/ai-chat?${search}` : "/ai-chat";
  return `/masuk?next=${encodeURIComponent(target)}`;
}

function buildContextPrompts(context: AiChatContext) {
  const cropLabel = getCropLabel(context.crop);
  const problemLabel = getProblemLabel(context.problem);

  if (cropLabel && problemLabel) {
    return [`${cropLabel} mengalami ${problemLabel.toLowerCase()}`];
  }

  if (context.product) {
    return [`Saya ingin konsultasi produk ${prettify(context.product)}`];
  }

  return [];
}

function buildGreeting(context: AiChatContext) {
  const cropLabel = getCropLabel(context.crop);
  const problemLabel = getProblemLabel(context.problem);
  const productLabel = prettify(context.product);

  if (cropLabel && problemLabel) {
    return `Halo, saya sudah menyiapkan konteks ${cropLabel.toLowerCase()} dengan masalah ${problemLabel.toLowerCase()}. Ceritakan kondisi lapangannya agar saya bantu susun arahan awal.`;
  }

  if (productLabel) {
    return `Halo, saya bisa bantu menjelaskan konteks produk ${productLabel.toLowerCase()} dan menghubungkannya ke masalah tanaman yang paling dekat.`;
  }

  return "Halo, ceritakan masalah tanaman Anda. Contoh: daun cabai menguning, padi terserang wereng, atau tanaman kurang subur.";
}

function StructuredAnswer({ response }: { response: AiChatStructuredResponse }) {
  return (
    <div className="ai-chat-structured">
      <p className="ai-chat-structured__summary">{response.summary}</p>

      <div className="ai-chat-structured__sections">
        <section className="ai-chat-structured__section">
          <h3>A. Dugaan masalah awal</h3>
          <p>{response.diagnosis}</p>
        </section>

        <section className="ai-chat-structured__section">
          <h3>B. Gejala yang perlu dicek</h3>
          <ul className="plain-list">
            {response.checks.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </section>

        <section className="ai-chat-structured__section">
          <h3>C. Langkah penanganan</h3>
          <ol className="plain-list">
            {response.steps.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ol>
        </section>
      </div>

      {response.products.length ? (
        <section className="ai-chat-structured__section">
          <h3>D. Produk rekomendasi</h3>
          <div className="ai-chat-card-grid">
            {response.products.map((product) => (
              <ProductMiniCard key={product.id} product={product} />
            ))}
          </div>
        </section>
      ) : null}

      {(response.articles.length || response.videos.length) ? (
        <div className="ai-chat-structured__split">
          {response.articles.length ? (
            <section className="ai-chat-structured__section">
              <h3>E. Artikel terkait</h3>
              <div className="ai-chat-card-grid">
                {response.articles.map((article) => (
                  <ArticleMiniCard article={article} key={article.slug} />
                ))}
              </div>
            </section>
          ) : null}

          {response.videos.length ? (
            <section className="ai-chat-structured__section">
              <h3>F. Video terkait</h3>
              <div className="ai-chat-card-grid">
                {response.videos.map((video) => (
                  <VideoMiniCard key={video.id} video={video} />
                ))}
              </div>
            </section>
          ) : null}
        </div>
      ) : null}

      <p className="ai-chat-disclaimer">{response.disclaimer}</p>
    </div>
  );
}

export function AIChatClient({
  articles,
  context,
  products,
  videos,
}: {
  articles: ArticleSummaryPayload[];
  context: AiChatContext;
  products: ProductSummary[];
  videos: EducationVideoResource[];
}) {
  const searchParams = useSearchParams();
  const { isReady, session } = useAuth();
  const [draft, setDraft] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSending, setIsSending] = useState(false);
  const [lastPrompt, setLastPrompt] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: createMessageId(),
      role: "assistant",
      text: buildGreeting(context),
    },
  ]);
  const threadEndRef = useRef<HTMLDivElement | null>(null);
  const quickPrompts = [...buildContextPrompts(context), ...DEFAULT_PROMPTS].slice(0, 6);
  const contextPills = [
    context.crop ? `Tanaman: ${getCropLabel(context.crop)}` : null,
    context.problem ? `Masalah: ${getProblemLabel(context.problem)}` : null,
    context.product ? `Produk: ${prettify(context.product)}` : null,
  ].filter(Boolean) as string[];
  const loginHref = buildNextHref(searchParams.toString());
  const canUsePremium = isPremiumAiUser(session);

  useEffect(() => {
    threadEndRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [error, isSending, messages]);

  async function submitPrompt(nextPrompt: string) {
    const trimmed = nextPrompt.trim();

    if (!trimmed || !canUsePremium) {
      return;
    }

    setDraft("");
    setError(null);
    setLastPrompt(trimmed);
    trackUiEvent("ask_ai", {
      crop: context.crop ?? null,
      problem: context.problem ?? null,
      product: context.product ?? null,
      prompt: trimmed,
      surface: "ai_chat",
    });
    setMessages((current) => [
      ...current,
      {
        id: createMessageId(),
        role: "user",
        text: trimmed,
      },
    ]);
    setIsSending(true);

    try {
      const response = await requestAiChatResponse({
        articles,
        context,
        message: trimmed,
        products,
        videos,
      });

      startTransition(() => {
        setMessages((current) => [
          ...current,
          {
            id: createMessageId(),
            role: "assistant",
            response,
          },
        ]);
      });
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "AI belum bisa menjawab saat ini. Coba lagi atau gunakan halaman Solusi.",
      );
    } finally {
      setIsSending(false);
    }
  }

  if (!isReady) {
    return (
      <LoadingSkeleton
        cards={2}
        eyebrow="Menyiapkan AI Pertanian"
        title="Menyiapkan akses premium dan konteks chat..."
      />
    );
  }

  if (!session) {
    return (
      <section className="ai-chat-gate">
        <span className="eyebrow-label">AI premium</span>
        <h1>Masuk untuk menggunakan AI Pertanian</h1>
        <p>
          Login diperlukan agar rekomendasi, riwayat percakapan, dan akses premium tetap
          terhubung dengan akun Wiragro Anda.
        </p>
        {contextPills.length ? (
          <div className="ai-chat-context-pills">
            {contextPills.map((item) => (
              <span key={item}>{item}</span>
            ))}
          </div>
        ) : null}
        <div className="ai-chat-gate__actions">
          <PrimaryButton href={loginHref}>Masuk / Daftar</PrimaryButton>
          <SecondaryButton href="/solusi">Buka Solusi</SecondaryButton>
        </div>
      </section>
    );
  }

  if (!canUsePremium) {
    return (
      <section className="ai-chat-gate ai-chat-gate--premium">
        <div className="ai-chat-gate__badge">
          <TrustBadge icon="ai" label="Premium Feature" tone="accent" />
        </div>
        <h1>AI Pertanian adalah fitur premium</h1>
        <p>
          Dapatkan arahan awal untuk masalah tanaman, rekomendasi produk, dan edukasi
          yang relevan dalam satu percakapan yang lebih terarah.
        </p>
        {contextPills.length ? (
          <div className="ai-chat-context-pills">
            {contextPills.map((item) => (
              <span key={item}>{item}</span>
            ))}
          </div>
        ) : null}
        <div className="ai-chat-gate__actions">
          <PrimaryButton href="/kontak">Upgrade</PrimaryButton>
          <SecondaryButton href="/kontak">Hubungi Admin</SecondaryButton>
          <SecondaryButton href="/belanja/paket">Lihat Paket</SecondaryButton>
        </div>
      </section>
    );
  }

  return (
    <section className="ai-chat-shell">
      <div className="ai-chat-shell__header">
        <div>
          <span className="eyebrow-label">Premium assistant</span>
          <h1>AI Pertanian Wiragro</h1>
          <p>
            Jelaskan masalah tanaman Anda untuk mendapatkan dugaan awal, langkah
            penanganan, produk relevan, dan edukasi lanjutan.
          </p>
        </div>
        <TrustBadge icon="ai" label="Premium" tone="accent" />
      </div>

      {contextPills.length ? (
        <div className="ai-chat-context-pills">
          {contextPills.map((item) => (
            <span key={item}>{item}</span>
          ))}
        </div>
      ) : null}

      <div className="ai-chat-thread" role="log" aria-live="polite">
        {messages.map((message) => (
          <article
            className={`ai-chat-message ai-chat-message--${message.role}`}
            key={message.id}
          >
            <div className={`ai-chat-bubble ai-chat-bubble--${message.role}`}>
              {message.response ? <StructuredAnswer response={message.response} /> : <p>{message.text}</p>}
            </div>
          </article>
        ))}

        {messages.length === 1 ? (
          <section className="ai-chat-quick-prompts">
            <strong>Prompt cepat</strong>
            <div className="ai-chat-quick-prompts__list">
              {quickPrompts.map((prompt) => (
                <button
                  disabled={isSending}
                  key={prompt}
                  onClick={() => {
                    void submitPrompt(prompt);
                  }}
                  type="button"
                >
                  {prompt}
                </button>
              ))}
            </div>
          </section>
        ) : null}

        {isSending ? (
          <div className="ai-chat-loading">
            <div className="ai-chat-typing" aria-hidden="true">
              <span />
              <span />
              <span />
            </div>
            <div className="ai-chat-recommendation-skeleton" aria-hidden="true">
              <div />
              <div />
            </div>
          </div>
        ) : null}

        {error ? (
          <div className="ai-chat-error">
            <strong>AI belum bisa menjawab saat ini. Coba lagi atau gunakan halaman Solusi.</strong>
            <div className="ai-chat-error__actions">
              <button
                className="btn btn-primary"
                onClick={() => {
                  if (lastPrompt) {
                    void submitPrompt(lastPrompt);
                  }
                }}
                type="button"
              >
                Coba lagi
              </button>
              <Link className="btn btn-secondary" href="/solusi">
                Buka Solusi
              </Link>
            </div>
          </div>
        ) : null}

        <div ref={threadEndRef} />
      </div>

      <form
        className="ai-chat-input-dock"
        onSubmit={(event) => {
          event.preventDefault();
          void submitPrompt(draft);
        }}
      >
        <label className="sr-only" htmlFor="ai-chat-input">
          Ceritakan masalah tanaman Anda
        </label>
        <button
          aria-label="Fitur lampiran gambar belum tersedia"
          className="ai-chat-input-dock__attach"
          disabled
          title="Lampiran gambar akan segera hadir"
          type="button"
        >
          +
        </button>
        <textarea
          aria-label="Pertanyaan untuk AI Pertanian"
          id="ai-chat-input"
          onChange={(event) => setDraft(event.target.value)}
          placeholder="Contoh: daun cabai menguning setelah hujan, hama wereng di padi, atau pupuk apa yang cocok..."
          rows={2}
          value={draft}
        />
        <button className="btn btn-primary" disabled={isSending || !draft.trim()} type="submit">
          {isSending ? "Memproses..." : "Kirim"}
        </button>
      </form>
    </section>
  );
}
