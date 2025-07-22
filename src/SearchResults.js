// New SearchResults.js
import React, { useState, useEffect, useContext } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { ProductsContext } from './App';
import { motion } from 'framer-motion';
import './Products.css';

const SearchResults = () => {
  const { products, categories } = useContext(ProductsContext);
  const categoriesMap = categories.reduce((acc, cat) => { acc[cat.id] = cat; return acc; }, {});
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q')?.toLowerCase() || '';
  const [display, setDisplay] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const productsPerPage = 12;
  const navigate = useNavigate();

  useEffect(() => {
    const filteredProducts = query ? products.filter(p => {
      const words = query.split(/\s+/);
      const title = p.title.toLowerCase();
      const cats = p.categories.map(id => categoriesMap[id]?.name.toLowerCase() || '');
      return words.every(w => title.includes(w) || cats.some(c => c.includes(w)));
    }) : products;

    const flattened = filteredProducts.flatMap(product => {
      if (product.product_type !== 'variable') return [{...product, displayId: product.id, gallery: product.gallery}];
      let colorVariants = product.variations.reduce((acc, variation) => {
        const colorAttr = variation.attributes?.find(a => a.attribute_name === 'Color')?.term_name;
        if (colorAttr && !colorAttr.startsWith('Any')) {
          acc.push({
            displayId: `${product.id}-${colorAttr}`,
            parentId: product.id,
            title: variation.title || `${product.title} - ${colorAttr}`,
            price: variation.price || product.price,
            selectedColor: colorAttr,
            gallery: variation.gallery,
          });
        }
        return acc;
      }, []);
      if (colorVariants.length === 0) colorVariants.push({
        displayId: `${product.id}-default`,
        parentId: product.id,
        title: product.title,
        price: product.variations[0]?.price || product.price,
        selectedColor: null,
        gallery: product.variations[0]?.gallery || product.gallery,
      });
      return colorVariants;
    });
    setDisplay(flattened);
  }, [query, products, categoriesMap]);

  const handleProductClick = (item) => navigate(`/product/${item.parentId}`, { state: { initialColor: item.selectedColor } });

  const idxLast = currentPage * productsPerPage;
  const idxFirst = idxLast - productsPerPage;
  const currentDisplay = display.slice(idxFirst, idxLast);
  const totalPages = Math.ceil(display.length / productsPerPage);

  if (!display.length) return <div>No results for "{query}"</div>;

  return (
    <div className="products-container">
      <div className="products-grid">
        {currentDisplay.map(item => (
          <div key={item.displayId} onClick={() => handleProductClick(item)} className="product-card">
            <motion.img layoutId={`product-image-${item.displayId}`} src={item.gallery[0] || '/api/Uploads/fallback-image.png'} alt={item.title} className="product-image" />
            <div className="product-info">
              <h3>{item.title}</h3>
              <p>${item.price}</p>
            </div>
          </div>
        ))}
      </div>
      <div className="pagination">
        {Array.from({ length: totalPages }, (_, i) => (
          <button key={i + 1} onClick={() => setCurrentPage(i + 1)} className={currentPage === i + 1 ? 'pagination-button-active' : 'pagination-button-inactive'}>
            {i + 1}
          </button>
        ))}
      </div>
    </div>
  );
};

export default SearchResults;