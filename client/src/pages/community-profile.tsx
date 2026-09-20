import { Link } from "wouter";
import SEO, { SITE_DOMAIN } from "@/components/SEO";
import CommunityLayout from "@/components/community/CommunityLayout";
import { POSTS } from "@/lib/community-feed";
import { useCustomer } from "@/contexts/CustomerContext";
import { useAuthPrompt } from "@/components/community/AuthPrompt";

export default function CommunityProfilePage() {
  const { isLoggedIn, customer } = useCustomer();
  const { openAuthPrompt } = useAuthPrompt();

  return (
    <CommunityLayout>
      <SEO
        title="Profil — YourPoodle"
        description="YourPoodle profilin ve paylaşımların."
        canonical={`${SITE_DOMAIN}/profil`}
      />
      <div className="px-4 pt-6 text-center">
        <div className="mx-auto w-20 h-20 rounded-full overflow-hidden ring-2 ring-[#D9D0EC] bg-[#F3EFFA]">
          <img src="/assets/poodle-face.jpg" alt="" className="w-full h-full object-cover" />
        </div>
        <h1 className="mt-3 text-lg font-extrabold text-[#1C1B1F]" data-testid="text-profile-name">
          {isLoggedIn ? customer?.name || "Üye" : "Misafir"}
        </h1>
        <p className="text-[13px] text-[#6B6573] mt-1">
          {isLoggedIn
            ? "Poodle topluluğundaki profilin."
            : "Giriş yapınca gönderilerin ve kayıtların burada görünür."}
        </p>
        {isLoggedIn ? (
          <Link
            href="/hesabim"
            className="mt-4 inline-flex h-10 px-4 items-center rounded-full border border-[#D9D0EC] text-sm font-semibold text-[#5B4B86]"
            data-testid="link-account-settings"
          >
            Hesap ayarları
          </Link>
        ) : (
          <div className="mt-4 flex justify-center gap-2">
            <button
              type="button"
              onClick={openAuthPrompt}
              className="h-10 px-4 rounded-full bg-[#8E7CC3] text-white text-sm font-semibold"
              data-testid="btn-profile-login"
            >
              Giriş yap
            </button>
            <Link
              href="/giris?tab=register&redirect=/profil"
              className="h-10 px-4 rounded-full border border-[#D9D0EC] bg-[#F6F3FB] text-[#5B4B86] text-sm font-semibold inline-flex items-center"
              data-testid="btn-profile-register"
            >
              Üye ol
            </Link>
          </div>
        )}
      </div>
      <section className="mt-6 px-3">
        <h2 className="text-[13px] font-bold text-[#1C1B1F] mb-2">Topluluk paylaşımları</h2>
        <div className="grid grid-cols-3 gap-1">
          {POSTS.map((post) => (
            <img
              key={post.id}
              src={post.image}
              alt={post.dogName}
              className="aspect-square w-full object-cover bg-[#F3EFFA]"
            />
          ))}
        </div>
      </section>
    </CommunityLayout>
  );
}
