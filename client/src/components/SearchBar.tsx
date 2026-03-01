import { useState, useEffect, useRef } from "react";
import { useLocation } from "wouter";
import { Search, X } from "lucide-react";
import type { Product } from "@shared/schema";
import ProductImage from "@/components/ProductImage";
import { productUrl } from "@/lib/data";

export default function SearchBar() {
  const [, setLocation] = useLocation();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const debounceTimer = useRef<NodeJS.Timeout | null>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [isOpen]);

  // Debounced search
  useEffect(() => {
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    if (query.length < 2) {
      setResults([]);
      setIsOpen(false);
      return;
    }

    setLoading(true);
    debounceTimer.current = setTimeout(async () => {
      try {
        const response = await fetch(`/api/products/search?q=${encodeURIComponent(query)}`);
        const data = await response.json();
        setResults(Array.isArray(data) ? data : []);
        setIsOpen(true);
      } catch (error) {
        console.error("Search error:", error);
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 300);
  }, [query]);

  const handleClear = () => {
    setQuery("");
    setResults([]);
    setIsOpen(false);
  };

  const handleResultClick = (product: Product) => {
    setLocation(productUrl(product.id, product.name));
    setQuery("");
    setResults([]);
    setIsOpen(false);
  };

  return (
    <div ref={containerRef} className="relative w-full">
      <div className="flex items-center gap-2 bg-white rounded-md border border-gray-200 px-3 py-2 shadow-sm">
        <Search className="w-4 h-4 text-gray-400 flex-shrink-0" />
        <input
          type="text"
          placeholder="Ürün ara..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => query.length >= 2 && setIsOpen(true)}
          data-testid="input-search"
          className="flex-1 outline-none text-sm placeholder-gray-400"
        />
        {query && (
          <button
            onClick={handleClear}
            className="flex-shrink-0 p-0.5 hover:bg-gray-100 rounded"
            aria-label="Clear search"
          >
            <X className="w-4 h-4 text-gray-400" />
          </button>
        )}
      </div>

      {isOpen && (
        <div
          data-testid="search-results-dropdown"
          className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-md shadow-lg z-50 max-h-96 overflow-y-auto"
        >
          {loading && (
            <div className="px-4 py-3 text-center text-sm text-gray-500">
              Aranıyor...
            </div>
          )}
          {!loading && results.length === 0 && (
            <div className="px-4 py-3 text-center text-sm text-gray-500">
              Sonuç bulunamadı
            </div>
          )}
          {!loading && results.length > 0 && (
            <ul>
              {results.map((product) => (
                <li key={product.id}>
                  <button
                    onClick={() => handleResultClick(product)}
                    data-testid={`search-result-item-${product.id}`}
                    className="w-full flex gap-3 items-start px-4 py-2 hover:bg-gray-50 text-left"
                  >
                    <ProductImage
                      src={product.img}
                      alt={product.name}
                      className="w-10 h-10 object-cover rounded flex-shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 line-clamp-2">
                        {product.name}
                      </p>
                      <p className="text-sm font-semibold text-green-600 mt-0.5">
                        ₺{product.price.toFixed(0)}
                      </p>
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
