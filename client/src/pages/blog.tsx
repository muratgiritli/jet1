import { useState } from "react";
import { Link, useRoute } from "wouter";
import { Clock, ChevronRight, ArrowLeft, Calendar, BookOpen } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import SEO, { SITE_DOMAIN, BREADCRUMB_JSONLD, FAQ_JSONLD, LOCAL_BUSINESS_JSONLD } from "@/components/SEO";
import { BLOG_POSTS, BLOG_CATEGORIES, type BlogPost } from "@/lib/blog-data";

const CATEGORY_COLORS: Record<string, string> = {
  "Kedi Bakımı": "bg-purple-100 text-purple-700",
  "Köpek Bakımı": "bg-amber-100 text-amber-700",
  "Genel Bakım": "bg-blue-100 text-blue-700",
  "Samsun Rehber": "bg-emerald-100 text-emerald-700",
};

function BlogListPage() {
  const [activeCategory, setActiveCategory] = useState("Tümü");
  const filtered = activeCategory === "Tümü"
    ? BLOG_POSTS
    : BLOG_POSTS.filter(p => p.category === activeCategory);

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-8">
      <SEO
        title="Pet Bakım Rehberi - Kedi Köpek Bakım İpuçları | JETGO Samsun"
        description="Kedi ve köpek bakımı rehberleri. Mama seçimi, beslenme ipuçları, sağlık önerileri ve Samsun'da evcil hayvan gezilecek yerler. JETGO Pet Shop blog."
        canonical={`${SITE_DOMAIN}/blog`}
        keywords="kedi bakımı, köpek bakımı, evcil hayvan rehberi, mama seçimi, kedi maması nasıl seçilir, köpek beslenmesi"
        jsonLd={[
          BREADCRUMB_JSONLD([
            { name: "Ana Sayfa", url: SITE_DOMAIN },
            { name: "Blog", url: `${SITE_DOMAIN}/blog` },
          ]),
          LOCAL_BUSINESS_JSONLD,
        ]}
      />

      <div className="bg-gradient-to-br from-[#6B3480] to-[#7c4dff] text-white py-10 md:py-14">
        <div className="max-w-4xl mx-auto px-4">
          <nav className="flex items-center gap-1 text-xs text-white/70 mb-4" data-testid="breadcrumb-blog">
            <Link href="/" className="hover:text-white">Ana Sayfa</Link>
            <ChevronRight className="w-3 h-3" />
            <span className="text-white">Blog</span>
          </nav>
          <div className="flex items-center gap-3 mb-2">
            <BookOpen className="w-8 h-8" />
            <h1 className="text-2xl md:text-4xl font-extrabold" data-testid="blog-h1">Pet Bakım Rehberi</h1>
          </div>
          <p className="text-sm md:text-base text-white/80 max-w-xl">
            Evcil hayvan bakımı, beslenme önerileri ve uzman rehberler
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6">
        <div className="flex gap-2 overflow-x-auto pb-3 scrollbar-hide mb-6" data-testid="blog-categories">
          {BLOG_CATEGORIES.map((cat) => (
            <button
              key={cat.slug}
              onClick={() => setActiveCategory(cat.name === "Tümü" ? "Tümü" : cat.name)}
              className={`px-4 py-2 rounded-full text-sm font-semibold whitespace-nowrap transition-colors ${
                (cat.name === "Tümü" ? activeCategory === "Tümü" : activeCategory === cat.name)
                  ? "bg-[#6B3480] text-white"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              }`}
              data-testid={`btn-blog-cat-${cat.slug}`}
            >
              {cat.name}
            </button>
          ))}
        </div>

        <div className="grid gap-4 md:grid-cols-2" data-testid="blog-grid">
          {filtered.map((post) => (
            <Link key={post.slug} href={`/blog/${post.slug}`}>
              <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer group" data-testid={`card-blog-${post.slug}`}>
                <CardContent className="p-5">
                  <div className="flex items-center gap-2 mb-3">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${CATEGORY_COLORS[post.category] || "bg-gray-100 text-gray-600"}`}>
                      {post.category}
                    </span>
                    <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                      <Clock className="w-3 h-3" />
                      {post.readTime}
                    </div>
                  </div>
                  <h2 className="text-base font-bold mb-2 group-hover:text-[#6B3480] transition-colors" data-testid={`text-blog-title-${post.slug}`}>
                    {post.title}
                  </h2>
                  <p className="text-sm text-muted-foreground line-clamp-2 mb-3">{post.excerpt}</p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                      <Calendar className="w-3 h-3" />
                      {new Date(post.date).toLocaleDateString("tr-TR", { day: "numeric", month: "long", year: "numeric" })}
                    </div>
                    <span className="text-xs font-semibold text-[#6B3480] group-hover:underline">
                      Devamını Oku →
                    </span>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            <p className="text-sm">Bu kategoride henüz içerik bulunmuyor.</p>
          </div>
        )}
      </div>
    </div>
  );
}

function BlogPostPage({ slug }: { slug: string }) {
  const post = BLOG_POSTS.find(p => p.slug === slug);

  if (!post) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground mb-4">Yazı bulunamadı.</p>
          <Link href="/blog">
            <Button variant="outline">Blog'a Dön</Button>
          </Link>
        </div>
      </div>
    );
  }

  const relatedPosts = (post.relatedSlugs || [])
    .map(s => BLOG_POSTS.find(p => p.slug === s))
    .filter(Boolean) as BlogPost[];

  const articleLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": post.title,
    "description": post.excerpt,
    "datePublished": post.date,
    "dateModified": post.date,
    "author": { "@type": "Organization", "name": "JETGO Pet Shop Samsun" },
    "publisher": {
      "@type": "Organization",
      "name": "JETGO Pet Shop Samsun",
      "logo": { "@type": "ImageObject", "url": `${SITE_DOMAIN}/favicon.webp` },
    },
    "mainEntityOfPage": { "@type": "WebPage", "@id": `${SITE_DOMAIN}/blog/${post.slug}` },
  };

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-8">
      <SEO
        title={post.metaTitle}
        description={post.metaDescription}
        canonical={`${SITE_DOMAIN}/blog/${post.slug}`}
        keywords={post.keywords}
        jsonLd={[
          articleLd,
          BREADCRUMB_JSONLD([
            { name: "Ana Sayfa", url: SITE_DOMAIN },
            { name: "Blog", url: `${SITE_DOMAIN}/blog` },
            { name: post.title, url: `${SITE_DOMAIN}/blog/${post.slug}` },
          ]),
          ...(post.faq ? [FAQ_JSONLD(post.faq.map(f => ({ question: f.q, answer: f.a })))] : []),
          LOCAL_BUSINESS_JSONLD,
        ]}
      />

      <div className="bg-gradient-to-br from-[#6B3480] to-[#7c4dff] text-white py-8 md:py-12">
        <div className="max-w-3xl mx-auto px-4">
          <nav className="flex items-center gap-1 text-xs text-white/70 mb-4 flex-wrap" data-testid="breadcrumb-post">
            <Link href="/" className="hover:text-white">Ana Sayfa</Link>
            <ChevronRight className="w-3 h-3" />
            <Link href="/blog" className="hover:text-white">Blog</Link>
            <ChevronRight className="w-3 h-3" />
            <span className="text-white">{post.title}</span>
          </nav>
          <div className="flex items-center gap-2 mb-3">
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${CATEGORY_COLORS[post.category] || "bg-white/20 text-white"}`}>
              {post.category}
            </span>
            <span className="text-xs text-white/70 flex items-center gap-1"><Clock className="w-3 h-3" /> {post.readTime}</span>
            <span className="text-xs text-white/70 flex items-center gap-1"><Calendar className="w-3 h-3" /> {new Date(post.date).toLocaleDateString("tr-TR", { day: "numeric", month: "long", year: "numeric" })}</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold" data-testid="blog-post-h1">{post.title}</h1>
        </div>
      </div>

      <article className="max-w-3xl mx-auto px-4 py-8">
        <p className="text-base text-muted-foreground leading-relaxed mb-8 font-medium">{post.excerpt}</p>

        {post.sections.map((section, i) => (
          <section key={i} className="mb-8">
            <h2 className="text-lg font-bold mb-3" data-testid={`blog-section-h2-${i}`}>{section.heading}</h2>
            {section.content.map((p, j) => (
              <p key={j} className="text-sm text-muted-foreground leading-relaxed mb-3">{p}</p>
            ))}
          </section>
        ))}

        {post.faq && post.faq.length > 0 && (
          <section className="mb-8">
            <h2 className="text-lg font-bold mb-4">Sıkça Sorulan Sorular</h2>
            <div className="space-y-3">
              {post.faq.map((item, i) => (
                <details key={i} className="group border rounded-lg overflow-hidden">
                  <summary className="flex items-center justify-between p-4 cursor-pointer font-medium text-sm hover:bg-muted/50 transition-colors">
                    {item.q}
                    <ChevronRight className="w-4 h-4 text-muted-foreground transition-transform group-open:rotate-90 shrink-0 ml-2" />
                  </summary>
                  <div className="px-4 pb-4 text-sm text-muted-foreground leading-relaxed">{item.a}</div>
                </details>
              ))}
            </div>
          </section>
        )}

        <section className="bg-gradient-to-r from-[#6B3480] to-[#7c4dff] rounded-2xl p-6 text-white text-center mb-8">
          <h3 className="text-lg font-bold mb-2">Evcil Dostunuz İçin Alışveriş Yapın</h3>
          <p className="text-sm text-white/80 mb-4">900+ ürün, aynı gün Samsun teslimat, kapıda ödeme.</p>
          <div className="flex gap-3 justify-center">
            <Link href="/kategori/kedi">
              <Button variant="secondary" size="sm" data-testid="blog-cta-kedi">Kedi Ürünleri</Button>
            </Link>
            <Link href="/kategori/kopek">
              <Button variant="secondary" size="sm" data-testid="blog-cta-kopek">Köpek Ürünleri</Button>
            </Link>
          </div>
        </section>

        {relatedPosts.length > 0 && (
          <section>
            <h3 className="text-base font-bold mb-3">İlgili Yazılar</h3>
            <div className="grid gap-3 md:grid-cols-2">
              {relatedPosts.map((rp) => (
                <Link key={rp.slug} href={`/blog/${rp.slug}`}>
                  <Card className="hover:shadow-md transition-shadow cursor-pointer">
                    <CardContent className="p-4">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${CATEGORY_COLORS[rp.category] || "bg-gray-100"}`}>{rp.category}</span>
                      <h4 className="text-sm font-bold mt-2">{rp.title}</h4>
                      <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{rp.excerpt}</p>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </section>
        )}

        <div className="mt-6">
          <Link href="/blog">
            <Button variant="outline" size="sm" data-testid="btn-back-blog">
              <ArrowLeft className="w-4 h-4 mr-1" /> Blog'a Dön
            </Button>
          </Link>
        </div>
      </article>
    </div>
  );
}

export function BlogListRoute() {
  return <BlogListPage />;
}

export function BlogPostRoute() {
  const [, params] = useRoute("/blog/:slug");
  const slug = params?.slug || "";
  return <BlogPostPage slug={slug} />;
}
