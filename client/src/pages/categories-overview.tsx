import { Link } from "wouter";
import { motion } from "framer-motion";
import catDog from "@/assets/images/cat-dog.webp";
import catCat from "@/assets/images/cat-cat.webp";
import catBird from "@/assets/images/cat-bird.webp";
import catRabbit from "@/assets/images/cat-rabbit.webp";

const CATEGORIES = [
  { name: "Köpek", image: catDog, href: "/kategori/kopek" },
  { name: "Kedi", image: catCat, href: "/kategori/kedi" },
  { name: "Kuş", image: catBird, href: "/kategori/kus" },
  { name: "Kemirgen", image: catRabbit, href: "/kategori/kemirgen" },
];

export default function CategoriesOverview() {
  return (
    <div className="min-h-screen bg-background pb-20 md:pb-8">
      <div className="max-w-lg mx-auto px-3 py-4">
        <h1 className="text-lg font-bold mb-4 text-center" data-testid="text-categories-title">
          Kategoriler
        </h1>

        <div className="grid grid-cols-2 gap-3">
          {CATEGORIES.map((cat, i) => (
            <motion.div
              key={cat.name}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.05 * i }}
            >
              <Link href={cat.href}>
                <div className="cursor-pointer" data-testid={`card-cat-${cat.name}`}>
                  <div className="rounded-xl overflow-hidden aspect-square shadow-sm">
                    <img
                      src={cat.image}
                      alt={cat.name}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                  </div>
                  <p className="text-center font-bold text-lg mt-1.5" style={{ color: "#333" }}>
                    {cat.name}
                  </p>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
