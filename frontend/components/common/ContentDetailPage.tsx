"use client";

import Image from "next/image";
import Link from "next/link";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";

interface ContentDetailPageProps {
  backHref: string;
  backLabel: string;
  eyebrow: string;
  title: string;
  description?: string;
  image?: string;
  content?: string;
  tags?: string[];
  date?: string;
  links?: { label: string; url: string }[];
}

export default function ContentDetailPage({
  backHref,
  backLabel,
  eyebrow,
  title,
  description,
  image,
  content,
  tags,
  date,
  links,
}: ContentDetailPageProps) {
  return (
    <main className="min-h-screen bg-[#f2f0ea] text-[#161719]">
      <section className="mx-auto max-w-7xl px-5 pb-20 pt-28 sm:px-8 lg:pb-28 lg:pt-36">
        <div className="mb-12 flex items-center justify-between border-b border-black/10 pb-6">
          <Link
            href={backHref}
            className="font-mono text-xs font-bold uppercase tracking-[0.22em] text-black/45 transition-colors hover:text-black"
          >
            {backLabel}
          </Link>
          {date && (
            <p className="font-mono text-xs uppercase tracking-[0.2em] text-black/40">
              {new Date(date).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })}
            </p>
          )}
        </div>

        <div className="grid gap-10 lg:grid-cols-[0.72fr_1.28fr]">
          <aside className="lg:sticky lg:top-28 lg:self-start">
            <p className="mb-6 font-mono text-xs uppercase tracking-[0.28em] text-black/45">{eyebrow}</p>
            <div className="flex flex-wrap gap-2">
              {(tags || []).map((tag) => (
                <span key={tag} className="border border-black/15 px-3 py-1.5 font-mono text-xs uppercase tracking-[0.14em] text-black/50">
                  {tag}
                </span>
              ))}
            </div>
          </aside>

          <article>
            <h1 className="max-w-5xl text-[clamp(3rem,8vw,7.8rem)] font-bold uppercase leading-[0.9] tracking-normal">
              {title}
            </h1>

            {description && (
              <p className="mt-8 max-w-3xl text-xl leading-9 text-black/65 md:text-2xl md:leading-10">
                {description}
              </p>
            )}

            {image && (
              <div className="relative mt-12 aspect-[16/9] w-full overflow-hidden bg-black/10">
                <Image src={image} alt={title} fill className="object-cover" priority sizes="(min-width: 1024px) 70vw, 100vw" />
              </div>
            )}

            {content && (
              <div className="prose prose-neutral mt-12 max-w-none prose-headings:font-mono prose-headings:uppercase prose-headings:tracking-normal prose-p:text-black/70 prose-li:text-black/70 prose-strong:text-black">
                <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw]}>
                  {content}
                </ReactMarkdown>
              </div>
            )}

            {links && links.length > 0 && (
              <div className="mt-12 flex flex-wrap gap-3 border-t border-black/10 pt-8">
                {links.map((link) => (
                  <a
                    key={link.url}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="border border-black/20 px-5 py-3 font-mono text-xs font-bold uppercase tracking-[0.18em] text-black transition-colors hover:bg-black hover:text-white"
                  >
                    {link.label}
                  </a>
                ))}
              </div>
            )}
          </article>
        </div>
      </section>
    </main>
  );
}
