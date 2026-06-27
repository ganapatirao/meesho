import { useState, useEffect, useRef } from 'react';
import { Search, Package, Folder, Tag } from 'lucide-react';
import { searchAPI } from '../services/api';

const SearchAutocomplete = ({ onSearch }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState(null);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const searchRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const debounceTimer = setTimeout(async () => {
      if (query.length >= 2) {
        setLoading(true);
        try {
          const response = await searchAPI.searchAll(query);
          if (response.data.success) {
            setResults(response.data.results);
            setIsOpen(true);
          }
        } catch (error) {
          setResults(null);
        } finally {
          setLoading(false);
        }
      } else {
        setResults(null);
        setIsOpen(false);
      }
    }, 300);

    return () => clearTimeout(debounceTimer);
  }, [query]);

  const handleResultClick = (type, item) => {
    setIsOpen(false);
    setQuery('');
    
    switch (type) {
      case 'product':
        window.location.href = `/product/${item.id}`;
        break;
      case 'category':
        window.location.href = `/shopping?categoryId=${encodeURIComponent(item.id)}`;
        break;
      case 'subcategory':
        window.location.href = `/shopping?subcategoryId=${encodeURIComponent(item.id)}`;
        break;
      default:
        break;
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (query.trim()) {
      onSearch(query);
      setIsOpen(false);
    }
  };

  const hasResults = results && (
    (results.products && results.products.length > 0) ||
    (results.categories && results.categories.length > 0) ||
    (results.subCategories && results.subCategories.length > 0)
  );

  return (
    <div ref={searchRef} className="relative w-full">
      <form onSubmit={handleSubmit}>
        <div className="relative">
          <input
            type="text"
            placeholder="Search for products, brands and more"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full px-5 py-3 pl-12 pr-14 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500 focus:shadow-lg transition-all shadow-sm bg-gray-100 text-gray-800 placeholder-gray-500"
          />
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <button
            type="submit"
            className="absolute right-2 top-1/2 -translate-y-1/2 bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white p-2 rounded-lg transition-all shadow-md"
          >
            <Search size={18} />
          </button>
        </div>
      </form>

      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-2xl z-50 max-h-96 overflow-y-auto">
          {loading && (
            <div className="p-4 text-center text-gray-500">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-500 mx-auto"></div>
            </div>
          )}

          {!loading && !hasResults && query.length >= 2 && (
            <div className="p-4 text-center text-gray-500">
              No results found
            </div>
          )}

          {!loading && hasResults && (
            <div className="py-2">
              {results.products && results.products.length > 0 && (
                <div className="mb-2">
                  <div className="px-4 py-2 bg-gray-100 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Products
                  </div>
                  {results.products.map((product) => (
                    <div
                      key={product.id}
                      onClick={() => handleResultClick('product', product)}
                      className="px-4 py-3 hover:bg-pink-50 cursor-pointer flex items-center gap-3 transition-colors"
                    >
                      {product.imageBase64 ? (
                        <img src={product.imageBase64} alt={product.name} className="w-10 h-10 object-cover rounded" />
                      ) : (
                        <div className="w-10 h-10 bg-gray-200 rounded flex items-center justify-center">
                          <Package size={20} className="text-gray-400" />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">{product.name}</p>
                        <p className="text-xs text-gray-500">{product.category} • ₹{product.price}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {results.categories && results.categories.length > 0 && (
                <div className="mb-2">
                  <div className="px-4 py-2 bg-gray-100 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Categories
                  </div>
                  {results.categories.map((category) => (
                    <div
                      key={category.id}
                      onClick={() => handleResultClick('category', category)}
                      className="px-4 py-3 hover:bg-pink-50 cursor-pointer flex items-center gap-3 transition-colors"
                    >
                      <div className="w-10 h-10 bg-purple-100 rounded flex items-center justify-center">
                        {category.icon ? (
                          <span className="text-lg">{category.icon}</span>
                        ) : (
                          <Folder size={20} className="text-purple-500" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">{category.name}</p>
                        <p className="text-xs text-gray-500">Category</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {results.subCategories && results.subCategories.length > 0 && (
                <div>
                  <div className="px-4 py-2 bg-gray-100 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Subcategories
                  </div>
                  {results.subCategories.map((subCategory) => (
                    <div
                      key={subCategory.id}
                      onClick={() => handleResultClick('subcategory', subCategory)}
                      className="px-4 py-3 hover:bg-pink-50 cursor-pointer flex items-center gap-3 transition-colors"
                    >
                      <div className="w-10 h-10 bg-pink-100 rounded flex items-center justify-center">
                        <Tag size={20} className="text-pink-500" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">{subCategory.name}</p>
                        <p className="text-xs text-gray-500">Subcategory</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SearchAutocomplete;
