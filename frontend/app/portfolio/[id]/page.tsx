import ContentDetailPage from "@/components/common/ContentDetailPage";
import { API_BASE_URL } from "@/services/authService";

const SERVER_API_BASE_URL = process.env.INTERNAL_API_URL || API_BASE_URL.replace("localhost:8001", "backend:8000");

interface PortfolioItem {
  id?: string;
  _id?: string;
  title: string;
  description?: string;
  image_url?: string;
  content?: string;
  links?: { label: string; url: string }[];
  tags?: string[];
  created_at?: string;
}

interface SiteCopySettings {
  detail_portfolio_back_label?: string;
  detail_portfolio_eyebrow?: string;
  detail_portfolio_not_found?: string;
}

function getAssetUrl(url?: string): string | undefined {
  if (!url) return "/placeholder.svg";
  if (url.startsWith("http")) return url;
  if (url.startsWith("/static/")) return `${API_BASE_URL}${url}`;
  return `${API_BASE_URL}${url}`;
}

async function getPortfolioItem(id: string): Promise<PortfolioItem | null> {
  const response = await fetch(`${SERVER_API_BASE_URL}/api/portfolio/${id}`, { cache: "no-store" });
  if (!response.ok) return null;
  return response.json();
}

async function getSiteCopySettings(): Promise<SiteCopySettings> {
  const response = await fetch(`${SERVER_API_BASE_URL}/api/settings/site`, { cache: "no-store" });
  if (!response.ok) return {};
  return response.json();
}

export default async function PortfolioDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [item, settings] = await Promise.all([getPortfolioItem(id), getSiteCopySettings()]);

  if (!item) {
    return <main className="min-h-screen bg-[#f2f0ea] px-8 pt-32 font-mono text-sm uppercase tracking-[0.2em] text-black/45">{settings.detail_portfolio_not_found || "Project not found"}</main>;
  }

  return (
    <ContentDetailPage
      backHref="/#portfolio"
      backLabel={settings.detail_portfolio_back_label || "Back to portfolio"}
      eyebrow={settings.detail_portfolio_eyebrow || "Case study"}
      title={item.title}
      description={item.description}
      image={getAssetUrl(item.image_url)}
      content={item.content}
      tags={item.tags}
      date={item.created_at}
      links={item.links}
    />
  );
}
