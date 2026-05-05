import ContentDetailPage from "@/components/common/ContentDetailPage";
import { API_BASE_URL } from "@/services/authService";

const SERVER_API_BASE_URL = process.env.INTERNAL_API_URL || API_BASE_URL.replace("localhost:8001", "backend:8000");

interface BlogPostItem {
  id?: string;
  _id?: string;
  title: string;
  subtitle?: string;
  content?: string;
  cover_image?: string;
  tags?: string[];
  published_at?: string;
}

interface SiteCopySettings {
  detail_blog_back_label?: string;
  detail_blog_eyebrow?: string;
  detail_blog_not_found?: string;
}

function getAssetUrl(url?: string): string | undefined {
  if (!url || url.startsWith("http")) return url;
  return `${API_BASE_URL}${url}`;
}

async function getPost(id: string): Promise<BlogPostItem | null> {
  const response = await fetch(`${SERVER_API_BASE_URL}/api/blog/${id}`, { cache: "no-store" });
  if (!response.ok) return null;
  return response.json();
}

async function getSiteCopySettings(): Promise<SiteCopySettings> {
  const response = await fetch(`${SERVER_API_BASE_URL}/api/settings/site`, { cache: "no-store" });
  if (!response.ok) return {};
  return response.json();
}

export default async function BlogDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [post, settings] = await Promise.all([getPost(id), getSiteCopySettings()]);

  if (!post) {
    return <main className="min-h-screen bg-[#f2f0ea] px-8 pt-32 font-mono text-sm uppercase tracking-[0.2em] text-black/45">{settings.detail_blog_not_found || "Article not found"}</main>;
  }

  return (
    <ContentDetailPage
      backHref="/#blog"
      backLabel={settings.detail_blog_back_label || "Back to journal"}
      eyebrow={settings.detail_blog_eyebrow || "Journal"}
      title={post.title}
      description={post.subtitle}
      image={getAssetUrl(post.cover_image)}
      content={post.content}
      tags={post.tags}
      date={post.published_at}
    />
  );
}
