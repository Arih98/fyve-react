import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

const ProductEditor = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingProduct, setEditingProduct] = useState(null);
  const [activeTab, setActiveTab] = useState('product');
  const [showAddAttributeForm, setShowAddAttributeForm] = useState(false);
  const [editingAttribute, setEditingAttribute] = useState(null);
  const [newAttributeName, setNewAttributeName] = useState('');
  const [newAttributeValues, setNewAttributeValues] = useState('');
  const [showAddCategoryForm, setShowAddCategoryForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [openAccordions, setOpenAccordions] = useState({});
  const [openCategoryAccordions, setOpenCategoryAccordions] = useState({});
  const [openVariationAccordions, setOpenVariationAccordions] = useState({});
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    id: null,
    title: '',
    description: '',
    price: '',
    sku: '',
    gtin: '',
    product_type: 'simple',
    stock_quantity: 0,
    gallery: [],
    variations: [],
    categories: [],
    attributes: [],
    related_products: [],
  });

  const fetchStock = async (sku) => {
    if (!sku) return 0;
    try {
      const res = await fetch(`/api/get_inventory.php?sku=${encodeURIComponent(sku)}`);
      const data = await res.json();
      return data.stock_quantity ?? 0;
    } catch {
      return 0;
    }
  };

  const syncAllStock = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('No token found');
  
      const prodRes = await fetch('/api/get_products.php', {
        headers: { 'Authorization': `Bearer ${token}` },
      });
  
      console.log('get_products response status:', prodRes.status);
  
      if (!prodRes.ok) throw new Error(`Products fetch failed: HTTP ${prodRes.status}`);
  
      const prodData = await prodRes.json();
  
      console.log('get_products response data:', prodData);
  
      if (prodData.error) throw new Error(prodData.error);
  
      if (!Array.isArray(prodData) || prodData.length === 0) {
        setError('No products found');
        setProducts([]);
        return;
      }
  
      const updatedProducts = await Promise.all(prodData.map(async (product) => {
        let updatedProduct = { ...product };
        if (product.product_type === 'simple' && product.sku) {
          updatedProduct.stock_quantity = await fetchStock(product.sku);
        } else if (product.product_type === 'variable') {
          updatedProduct.variations = await Promise.all(
            JSON.parse(product.variations || '[]').map(async (v) => {
              if (v.sku) {
                return { ...v, stock_quantity: await fetchStock(v.sku) };
              }
              return v;
            })
          );
        }
        return updatedProduct;
      }));
  
      setProducts(updatedProducts);
      setError(null);
  
    } catch (err) {
      setError(`Failed to load: ${err.message}`);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };  

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token');
        console.log('Token used for get_products:', token);
        if (!token) throw new Error('No token found');
  
        const [catRes, prodRes] = await Promise.all([
          fetch('/api/manage_categories.php'),
          fetch('/api/get_products.php', {
            headers: { 'Authorization': `Bearer ${token}` },
          }),
        ]);
  
        console.log('get_products response status:', prodRes.status);
        if (!catRes.ok) throw new Error(`Categories fetch failed: HTTP ${catRes.status}`);
        if (!prodRes.ok) throw new Error(`Products fetch failed: HTTP ${prodRes.status}`);
  
        const [catData, prodData] = await Promise.all([catRes.json(), prodRes.json()]);
        console.log('get_products response:', prodData);
        if (prodData.error) throw new Error(prodData.error);
  
        setCategories(catData);
  
        const normalizedProducts = prodData.map(product => ({
          ...product,
          stock_quantity: product.stock_quantity || 0,
          related_products: JSON.parse(product.related_products || '[]').map(rel => typeof rel === 'string' ? { productId: rel } : rel),
          variations: JSON.parse(product.variations || '[]').map(variation => ({
            ...variation,
            title: variation.title || '',
            description: variation.description || '',
            attributes: Array.isArray(variation.attributes) ? variation.attributes : [],
            gallery: JSON.parse(variation.gallery || '[]'),
            related_products: (variation.related_products || []).map(rel => typeof rel === 'string' ? { productId: rel } : rel),
          })),
          gallery: JSON.parse(product.gallery || '[]'),
          categories: JSON.parse(product.categories || '[]'),
          attributes: JSON.parse(product.attributes || '[]'),
        }));
  
        setProducts(normalizedProducts);
      } catch (err) {
        setError(`Failed to load: ${err.message}`);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);  

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleGalleryChange = (e) => {
    const files = Array.from(e.target.files);
    setFormData({ ...formData, gallery: [...formData.gallery, ...files] });
  };

  const removeGalleryImage = (index) => {
    const updatedGallery = formData.gallery.filter((_, i) => i !== index);
    setFormData({ ...formData, gallery: updatedGallery });
  };

  const handleVariationChange = (index, field, value) => {
    const updatedVariations = [...formData.variations];
    updatedVariations[index] = { ...updatedVariations[index], [field]: value };
    setFormData({ ...formData, variations: updatedVariations });
  };

  const handleVariationGalleryChange = (varIndex, files) => {
    const updatedVariations = [...formData.variations];
    updatedVariations[varIndex] = { 
      ...updatedVariations[varIndex], 
      gallery: [...(updatedVariations[varIndex].gallery || []), ...Array.from(files)] 
    };
    setFormData({ ...formData, variations: updatedVariations });
  };

  const removeVariationGalleryImage = (varIndex, imgIndex) => {
    const updatedVariations = [...formData.variations];
    updatedVariations[varIndex].gallery = updatedVariations[varIndex].gallery.filter((_, i) => i !== imgIndex);
    setFormData({ ...formData, variations: updatedVariations });
  };

  const handleVariationAttributeChange = (varIndex, attrName, termName) => {
    const updatedVariations = [...formData.variations];
    const existingAttrIndex = updatedVariations[varIndex].attributes.findIndex(attr => attr.attribute_name === attrName);
    if (existingAttrIndex >= 0) {
      updatedVariations[varIndex].attributes[existingAttrIndex] = { attribute_name: attrName, term_name: termName };
    } else {
      updatedVariations[varIndex].attributes.push({ attribute_name: attrName, term_name: termName });
    }
    setFormData({ ...formData, variations: updatedVariations });
  };

  const handleCategoryChange = (catId, checked) => {
    let updatedCategories = [...(formData.categories || [])];
    if (checked) {
      updatedCategories.push(catId);
    } else {
      updatedCategories = updatedCategories.filter(id => id !== catId);
    }
    setFormData({ ...formData, categories: updatedCategories });
  };

  const addVariation = () => {
    const newIndex = formData.variations.length;
    setFormData({
      ...formData,
      variations: [
        ...formData.variations,
        {
          title: '',
          description: '',
          sku: '',
          gtin: '',
          price: '',
          stock_quantity: 0,
          gallery: [],
          related_products: [],
          attributes: formData.attributes.map(attr => ({ attribute_name: attr.name, term_name: `Any ${attr.name}` })),
        },
      ],
    });
    setOpenVariationAccordions(prev => ({ ...prev, [newIndex]: false }));
  };

  const duplicateVariation = (varIndex) => {
    const toDuplicate = formData.variations[varIndex];
    const duplicated = {
      ...toDuplicate,
      attributes: [...toDuplicate.attributes],
      gallery: [...toDuplicate.gallery],
      related_products: [...toDuplicate.related_products],
      sku: '',
      gtin: '',
      stock_quantity: '',
    };
    const updatedVariations = [
      ...formData.variations.slice(0, varIndex + 1),
      duplicated,
      ...formData.variations.slice(varIndex + 1),
    ];
    setFormData({ ...formData, variations: updatedVariations });
    const newAccordions = {};
    Object.keys(openVariationAccordions).forEach(key => {
      const oldIndex = parseInt(key);
      if (oldIndex < varIndex) {
        newAccordions[oldIndex] = openVariationAccordions[oldIndex];
      } else {
        newAccordions[oldIndex + 1] = openVariationAccordions[oldIndex];
      }
    });
    newAccordions[varIndex + 1] = false;
    setOpenVariationAccordions(newAccordions);
  };

  const removeVariation = (index) => {
    const updatedVariations = formData.variations.filter((_, i) => i !== index);
    setFormData({ ...formData, variations: updatedVariations });
    setOpenVariationAccordions(prev => {
      const newAccordions = { ...prev };
      delete newAccordions[index];
      return newAccordions;
    });
  };

  const handleEdit = async (product) => {
    try {
      const parseJSON = (str, defaultValue = []) => {
        if (str == null || typeof str !== 'string' || str.trim() === '') return defaultValue;
        try {
          return JSON.parse(str);
        } catch (e) {
          console.error(`JSON parse error for ${str}: ${e.message}`);
          return defaultValue;
        }
      };
  
      let newFormData = {
        id: product.id,
        title: product.title || '',
        description: product.description || '',
        price: product.price || '',
        sku: product.sku || '',
        gtin: product.gtin || '',
        product_type: product.product_type || 'simple',
        stock_quantity: product.stock_quantity || 0,
        gallery: parseJSON(product.gallery, []),
        related_products: parseJSON(product.related_products, []).map(rel => typeof rel === 'string' ? { productId: rel } : rel),
        variations: parseJSON(product.variations, []).map((v) => {
          const variationAttrs = parseJSON(product.attributes, []).map(attr => {
            const existingAttr = Array.isArray(v.attributes)
              ? v.attributes.find(a => a.attribute_name === attr.name)
              : null;
            return {
              attribute_name: attr.name,
              term_name: existingAttr ? existingAttr.term_name : `Any ${attr.name}`,
            };
          });
          return {
            title: v.title || '',
            description: v.description || '',
            sku: v.sku || '',
            gtin: v.gtin || '',
            price: v.price || '',
            stock_quantity: v.stock_quantity || 0,
            gallery: parseJSON(v.gallery, []),
            related_products: parseJSON(v.related_products, []).map(rel => typeof rel === 'string' ? { productId: rel } : rel),
            attributes: variationAttrs,
          };
        }),
        categories: parseJSON(product.categories, []),
        attributes: parseJSON(product.attributes, []),
      };
  
      if (newFormData.product_type === 'simple' && newFormData.sku) {
        const stock = await fetchStock(newFormData.sku);
        newFormData = { ...newFormData, stock_quantity: stock };
      } else if (newFormData.product_type === 'variable') {
        const promises = newFormData.variations.map(async (v, index) => {
          if (v.sku) {
            const stock = await fetchStock(v.sku);
            newFormData.variations[index].stock_quantity = stock;
          }
        });
        await Promise.all(promises);
      }
  
      setFormData(newFormData);
      setEditingProduct(product.id);
      setActiveTab('product');
      setOpenVariationAccordions(
        (newFormData.variations || []).reduce((acc, _, index) => ({ ...acc, [index]: false }), {})
      );
    } catch (err) {
      setError(`Failed to edit product: ${err.message}`);
    }
  };

  const cancelEdit = () => {
    setFormData({
      id: null,
      title: '',
      description: '',
      price: '',
      sku: '',
      gtin: '',
      product_type: 'simple',
      stock_quantity: 0,
      gallery: [],
      variations: [],
      categories: [],
      attributes: [],
      related_products: [],
    });
    setEditingProduct(null);
    setActiveTab('product');
    setShowAddAttributeForm(false);
    setEditingAttribute(null);
    setNewAttributeName('');
    setNewAttributeValues('');
    setShowAddCategoryForm(false);
    setEditingCategory(null);
    setNewCategoryName('');
    setOpenAccordions({});
    setOpenCategoryAccordions({});
    setOpenVariationAccordions({});
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('No token found');
      const productData = {
        id: formData.id || `prod_${Date.now()}`,
        title: formData.title,
        description: formData.description,
        price: formData.price,
        sku: formData.sku,
        gtin: formData.gtin,
        product_type: formData.product_type,
        stock_quantity: formData.stock_quantity,
        gallery: formData.gallery.filter(g => typeof g === 'string'),
        variations: formData.variations,
        categories: formData.categories,
        attributes: formData.attributes,
        related_products: formData.related_products,
      };
      const response = await fetch('/api/save_product.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(productData),
      });
      const data = await response.json();
      if (data.status === 'success') {
        const updatedProduct = {
          ...productData,
          gallery: productData.gallery,
          variations: productData.variations,
          categories: productData.categories,
          attributes: productData.attributes,
          related_products: productData.related_products,
        };
        let updatedProducts;
        if (formData.id) {
          updatedProducts = products.map(p => p.id === formData.id ? updatedProduct : p);
        } else {
          updatedProducts = [...products, updatedProduct];
        }
        setProducts(updatedProducts);
        cancelEdit();
      } else {
        setError(data.error || 'Failed to save product');
      }
    } catch (err) {
      setError(`Failed to save: ${err.message}`);
    }
  };

  const handleDragStart = (e, index) => {
    e.dataTransfer.setData('text/plain', index);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = async (e, index) => {
    e.preventDefault();
    const fromIndex = +e.dataTransfer.getData('text/plain');
    if (fromIndex !== index) {
      const reorderedProducts = [...products];
      const [movedProduct] = reorderedProducts.splice(fromIndex, 1);
      reorderedProducts.splice(index, 0, movedProduct);
      setProducts(reorderedProducts);
      try {
        const token = localStorage.getItem('token');
        if (!token) throw new Error('No token found');
        const orderData = reorderedProducts.map(product => product.id);
        const response = await fetch('/api/update_product_order.php', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({ order: orderData }),
        });
        const data = await response.json();
        if (data.error) throw new Error(data.error);
      } catch (err) {
        setError(`Failed to save order: ${err.message}`);
      }
    }
  };

  const handleAddOrUpdateAttribute = () => {
    if (!newAttributeName) {
      setError('Name required');
      return;
    }
    const separator = newAttributeValues.includes(',') ? ',' : '|';
    const terms = newAttributeValues.split(separator).map(t => t.trim()).filter(t => t).map((term, index) => ({
      id: String(index + 1),
      term_name: term
    }));
    let updatedAttributes = [...formData.attributes];
    if (editingAttribute) {
      updatedAttributes = updatedAttributes.filter(attr => attr.id !== editingAttribute.id);
    }
    const newId = String(updatedAttributes.length + 1);
    updatedAttributes.push({
      id: newId,
      name: newAttributeName,
      terms: terms
    });
    setFormData({ ...formData, attributes: updatedAttributes });
    setNewAttributeName('');
    setNewAttributeValues('');
    setShowAddAttributeForm(false);
    setEditingAttribute(null);
  };

  const handleDeleteAttribute = (attributeId) => {
    const updatedAttributes = formData.attributes.filter(attr => attr.id !== attributeId);
    setFormData({ ...formData, attributes: updatedAttributes });
    setOpenAccordions(prev => ({ ...prev, [attributeId]: false }));
  };

  const handleAddOrUpdateCategory = async () => {
    if (!newCategoryName) {
      setError('Name required');
      return;
    }
    try {
      if (editingCategory) {
        await fetch('/api/manage_categories.php', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ category_id: editingCategory.id }),
        });
      }
      const res = await fetch('/api/manage_categories.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ category_name: newCategoryName }),
      });
      const data = await res.json();
      if (data.status === 'success') {
        const catRes = await fetch('/api/manage_categories.php');
        const catData = await catRes.json();
        setCategories(catData);
        setNewCategoryName('');
        setShowAddCategoryForm(false);
        setEditingCategory(null);
      } else {
        setError(data.message || 'Failed to save category');
      }
    } catch (err) {
      setError(`Failed to save category: ${err.message}`);
    }
  };

  const handleDeleteCategory = async (categoryId) => {
    try {
      const res = await fetch('/api/manage_categories.php', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ category_id: categoryId }),
      });
      const data = await res.json();
      if (data.status === 'success') {
        const catRes = await fetch('/api/manage_categories.php');
        const catData = await catRes.json();
        setCategories(catData);
        setOpenCategoryAccordions(prev => ({ ...prev, [categoryId]: false }));
        setError(null);
      } else {
        setError(data.message || 'Failed to delete category');
      }
    } catch (err) {
      setError(`Failed to delete category: ${err.message}`);
    }
  };

  const handleDelete = async (id) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('No token found');
      const response = await fetch('/api/save_product.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ id, delete: true }),
      });
      const data = await response.json();
      if (data.status === 'success') {
        const updatedProducts = products.filter((p) => p.id !== id);
        setProducts(updatedProducts);
      } else {
        setError(data.error || 'Failed to delete product');
      }
    } catch (err) {
      setError(`Failed to delete: ${err.message}`);
    }
  };

  const handleEditAttribute = (attr) => {
    setEditingAttribute(attr);
    setNewAttributeName(attr.name);
    setNewAttributeValues(attr.terms.map(t => t.term_name).join(' | '));
    setShowAddAttributeForm(true);
  };

  const handleEditCategory = (cat) => {
    setEditingCategory(cat);
    setNewCategoryName(cat.name);
    setShowAddCategoryForm(true);
  };

  const toggleAccordion = (attrId) => {
    setOpenAccordions(prev => ({
      ...prev,
      [attrId]: !prev[attrId]
    }));
  };

  const toggleCategoryAccordion = (catId) => {
    setOpenCategoryAccordions(prev => ({
      ...prev,
      [catId]: !prev[catId]
    }));
  };

  const toggleVariationAccordion = (varIndex) => {
    setOpenVariationAccordions(prev => ({
      ...prev,
      [varIndex]: !prev[varIndex]
    }));
  };

  if (loading) return <div className="p-6 text-gray-600">Loading...</div>;
  if (error) return <div className="p-6 text-red-600">{error}</div>;

  return (
    <div className="container mx-auto p-6 bg-white-100 min-h-screen">
      <h2 className="text-3xl font-bold mb-6 text-gray-800">Product Management</h2>

      {!editingProduct && (
        <div className="bg-white rounded-lg shadow-md overflow-hidden mb-6">
          <div className="flex justify-between items-center p-4 border-b">
            <h3 className="text-xl font-semibold text-gray-800">All Products</h3>
            <div>
              <button
                onClick={() => setEditingProduct(0)}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition mr-2"
              >
                Add New Product
              </button>
              <button
                onClick={syncAllStock}
                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition"
              >
                Sync All Stock
              </button>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-white-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Title
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Price
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    SKU
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {products.map((product, index) => (
                  <tr 
                    key={product.id} 
                    className="hover:bg-gray-50" 
                    draggable="true"
                    onDragStart={(e) => handleDragStart(e, index)}
                    onDragOver={handleDragOver}
                    onDrop={(e) => handleDrop(e, index)}
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {product.title}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      ${product.price}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {product.sku || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {product.product_type}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => handleEdit(product)}
                        className="text-blue-600 hover:text-blue-800 mr-4"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(product.id)}
                        className="text-red-600 hover:text-red-800"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {editingProduct !== null && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-2xl font-semibold mb-6 text-gray-800">
            {formData.id ? 'Edit Product' : 'Add Product'}
          </h3>
          <div className="flex mb-4">
            <button
              onClick={() => setActiveTab('product')}
              className={`px-4 py-2 ${activeTab === 'product' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-800'} rounded-t-lg mr-2`}
            >
              Product Details
            </button>
            {formData.product_type === 'variable' && (
              <button
                onClick={() => setActiveTab('variations')}
                className={`px-4 py-2 ${activeTab === 'variations' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-800'} rounded-t-lg mr-2`}
              >
                Variations
              </button>
            )}
            <button
              onClick={() => setActiveTab('attributes')}
              className={`px-4 py-2 ${activeTab === 'attributes' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-800'} rounded-t-lg mr-2`}
            >
              Manage Attributes
            </button>
            <button
              onClick={() => setActiveTab('categories')}
              className={`px-4 py-2 ${activeTab === 'categories' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-800'} rounded-t-lg`}
            >
              Manage Categories
            </button>
          </div>
          {activeTab === 'product' || activeTab === 'variations' ? (
            <form onSubmit={handleSubmit}>
              {activeTab === 'product' && (
                <div className="mb-6">
                  <h4 className="text-lg font-medium text-gray-700 mb-4">General Information</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Title</label>
                      <input
                        type="text"
                        name="title"
                        value={formData.title}
                        onChange={handleInputChange}
                        className="mt-1 w-full p-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Price</label>
                      <input
                        type="number"
                        name="price"
                        value={formData.price}
                        onChange={handleInputChange}
                        className="mt-1 w-full p-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                        step="0.01"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">SKU</label>
                      <input
                        type="text"
                        name="sku"
                        value={formData.sku}
                        onChange={handleInputChange}
                        className="mt-1 w-full p-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">GTIN</label>
                      <input
                        type="text"
                        name="gtin"
                        value={formData.gtin}
                        onChange={handleInputChange}
                        className="mt-1 w-full p-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Product Type</label>
                      <select
                        name="product_type"
                        value={formData.product_type}
                        onChange={handleInputChange}
                        className="mt-1 w-full p-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="simple">Simple</option>
                        <option value="variable">Variable</option>
                      </select>
                    </div>
                    {formData.product_type === 'simple' && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Stock Quantity</label>
                        <input
                          type="number"
                          name="stock_quantity"
                          value={formData.stock_quantity}
                          onChange={handleInputChange}
                          className="mt-1 w-full p-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                    )}
                  </div>
                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700">Description</label>
                    <textarea
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      className="mt-1 w-full p-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                      rows="4"
                    />
                  </div>
                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700">Categories</label>
                    <div className="flex flex-wrap gap-4">
                      {categories.map((cat) => (
                        <label key={cat.id} className="flex items-center">
                          <input
                            type="checkbox"
                            checked={formData.categories.includes(cat.id)}
                            onChange={(e) => handleCategoryChange(cat.id, e.target.checked)}
                            className="mr-2"
                          />
                          {cat.name}
                        </label>
                      ))}
                    </div>
                  </div>
                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700">Gallery Images (for Single Product Page)</label>
                    <input
                      type="file"
                      multiple
                      onChange={handleGalleryChange}
                      className="mt-1 w-full p-2 border border-gray-300 rounded-lg"
                      accept="image/*"
                    />
                    <div className="mt-2 flex flex-wrap">
                      {formData.gallery.map((img, index) => (
                        <div key={index} className="m-1">
                          <img
                            src={img instanceof File ? URL.createObjectURL(img) : img}
                            alt={`Gallery ${index + 1}`}
                            className="w-32 rounded"
                          />
                          <button
                            type="button"
                            onClick={() => removeGalleryImage(index)}
                            className="text-red-600 hover:text-red-800"
                          >
                            Remove
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                  {formData.product_type === 'simple' && (
                    <div className="mt-4">
                      <label className="block text-sm font-medium text-gray-700">Related Products</label>
                      <select
                        multiple
                        value={formData.related_products || []}
                        onChange={(e) => {
                          const selected = Array.from(e.target.options).filter(o => o.selected).map(o => o.value);
                          setFormData({ ...formData, related_products: selected });
                        }}
                        className="mt-1 w-full p-2 border border-gray-300 rounded-lg"
                      >
                        {products.filter(p => p.id !== formData.id).map(p => (
                          <option key={p.id} value={p.id}>{p.title}</option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>
              )}
              {activeTab === 'variations' && formData.product_type === 'variable' && (
                <div className="mb-6">
                  <h4 className="text-lg font-medium text-gray-700 mb-4">Variations</h4>
                  {formData.variations.map((variation, varIndex) => (
                    <div key={varIndex} className="mb-4">
                      <div className="flex items-center">
                        <button
                          type="button"
                          onClick={() => toggleVariationAccordion(varIndex)}
                          className="flex-grow text-left bg-gray-200 p-3 rounded-lg hover:bg-gray-300 transition"
                        >
                          <span className="text-sm font-medium text-gray-700">
                            {variation.title || variation.sku || `Variation ${varIndex + 1}`}
                          </span>
                          <span className="float-right">{openVariationAccordions[varIndex] ? '−' : '+'}</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => duplicateVariation(varIndex)}
                          className="ml-2 bg-blue-500 text-white px-3 py-2 rounded-lg hover:bg-blue-600 transition"
                        >
                          Duplicate
                        </button>
                      </div>
                      {openVariationAccordions[varIndex] && (
                        <div className="mt-2 p-3 border border-gray-300 rounded-lg bg-gray-50">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <label className="block text-sm font-medium text-gray-700">Variation Title</label>
                              <input
                                type="text"
                                value={variation.title}
                                onChange={(e) => handleVariationChange(varIndex, 'title', e.target.value)}
                                className="mt-1 w-full p-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700">Variation Description</label>
                              <textarea
                                value={variation.description}
                                onChange={(e) => handleVariationChange(varIndex, 'description', e.target.value)}
                                className="mt-1 w-full p-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                                rows="3"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700">Variation SKU</label>
                              <input
                                type="text"
                                value={variation.sku}
                                onChange={(e) => handleVariationChange(varIndex, 'sku', e.target.value)}
                                className="mt-1 w-full p-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700">Variation GTIN</label>
                              <input
                                type="text"
                                value={variation.gtin}
                                onChange={(e) => handleVariationChange(varIndex, 'gtin', e.target.value)}
                                className="mt-1 w-full p-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700">Variation Price</label>
                              <input
                                type="number"
                                value={variation.price}
                                onChange={(e) => handleVariationChange(varIndex, 'price', e.target.value)}
                                className="mt-1 w-full p-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                                step="0.01"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700">Stock Quantity</label>
                              <input
                                type="number"
                                value={variation.stock_quantity}
                                onChange={(e) => handleVariationChange(varIndex, 'stock_quantity', e.target.value)}
                                className="mt-1 w-full p-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                              />
                            </div>
                          </div>
                          <div className="mt-4">
                            <label className="block text-sm font-medium text-gray-700">Variation Gallery Images</label>
                            <input
                              type="file"
                              multiple
                              onChange={(e) => handleVariationGalleryChange(varIndex, e.target.files)}
                              className="mt-1 w-full p-2 border border-gray-300 rounded-lg"
                              accept="image/*"
                            />
                            <div className="mt-2 flex flex-wrap">
                              {variation.gallery.map((img, index) => (
                                <div key={index} className="m-1">
                                  <img
                                    src={img instanceof File ? URL.createObjectURL(img) : img}
                                    alt={`Variation Gallery ${index + 1}`}
                                    className="w-32 rounded"
                                  />
                                  <button
                                    type="button"
                                    onClick={() => removeVariationGalleryImage(varIndex, index)}
                                    className="text-red-600 hover:text-red-800"
                                  >
                                    Remove
                                  </button>
                                </div>
                              ))}
                            </div>
                          </div>
                          <div className="mt-4">
                            <label className="block text-sm font-medium text-gray-700">Related Products</label>
                            {(() => {
                              const relatedOptions = products.filter(p => p.id !== formData.id).flatMap(p => {
                                if (p.product_type === 'simple') {
                                  const rel = {productId: p.id};
                                  return [
                                    <option key={JSON.stringify(rel)} value={JSON.stringify(rel)}>
                                      {p.title}
                                    </option>
                                  ];
                                } else {
                                  const colors = [...new Set(
                                    p.variations.map(v => v.attributes.find(a => a.attribute_name === 'Color')?.term_name)
                                      .filter(c => c && !c.startsWith('Any'))
                                  )];
                                  return colors.map(color => {
                                    const rel = {productId: p.id, selectedColor: color};
                                    return (
                                      <option key={JSON.stringify(rel)} value={JSON.stringify(rel)}>
                                        {p.title} - {color}
                                      </option>
                                    );
                                  });
                                }
                              });
                              return (
                                <select
                                  multiple
                                  value={(variation.related_products || []).map(JSON.stringify)}
                                  onChange={(e) => {
                                    const selected = Array.from(e.target.options).filter(o => o.selected).map(o => JSON.parse(o.value));
                                    handleVariationChange(varIndex, 'related_products', selected);
                                  }}
                                  className="mt-1 w-full p-2 border border-gray-300 rounded-lg"
                                >
                                  {relatedOptions}
                                </select>
                              );
                            })()}
                          </div>
                          <div className="mt-4">
                            <h5 className="text-sm font-medium text-gray-700 mb-2">Attributes</h5>
                            {formData.attributes.map((attr) => (
                              <div key={attr.id} className="flex space-x-4 mb-2">
                                <div className="w-full">
                                  <label className="block text-sm font-medium text-gray-700">{attr.name}</label>
                                  <select
                                    value={
                                      variation.attributes.find(a => a.attribute_name === attr.name)?.term_name ||
                                      `Any ${attr.name}`
                                    }
                                    onChange={(e) => handleVariationAttributeChange(varIndex, attr.name, e.target.value)}
                                    className="mt-1 w-full p-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                                  >
                                    <option value={`Any ${attr.name}`}>Any {attr.name}</option>
                                    {attr.terms.map((t) => (
                                      <option key={t.id} value={t.term_name}>
                                        {t.term_name}
                                      </option>
                                    ))}
                                  </select>
                                </div>
                              </div>
                            ))}
                          </div>
                          <button
                            type="button"
                            onClick={() => removeVariation(varIndex)}
                            className="mt-4 bg-red-600 text-white px-3 py-1 rounded-lg hover:bg-red-700 transition"
                          >
                            Remove Variation
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={addVariation}
                    className="mt-4 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition"
                  >
                    Add Variation
                  </button>
                </div>
              )}
              <div className="flex space-x-4">
                <button
                  type="submit"
                  className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition"
                >
                  {formData.id ? 'Update Product' : 'Add Product'}
                </button>
                <button
                  type="button"
                  onClick={cancelEdit}
                  className="bg-gray-600 text-white px-6 py-2 rounded-lg hover:bg-gray-700 transition"
                >
                  Cancel
                </button>
              </div>
            </form>
          ) : activeTab === 'attributes' ? (
            <div className="mb-6">
              <h4 className="text-lg font-medium text-gray-700 mb-4">Manage Attributes</h4>
              <button
                type="button"
                onClick={() => {
                  setShowAddAttributeForm(true);
                  setEditingAttribute(null);
                  setNewAttributeName('');
                  setNewAttributeValues('');
                }}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition mb-4"
              >
                Add new
              </button>
              {showAddAttributeForm && (
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700">Name</label>
                  <input
                    type="text"
                    value={newAttributeName}
                    onChange={(e) => setNewAttributeName(e.target.value)}
                    className="mt-1 w-full p-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                  />
                  <label className="block text-sm font-medium text-gray-700 mt-4">Values</label>
                  <textarea
                    value={newAttributeValues}
                    onChange={(e) => setNewAttributeValues(e.target.value)}
                    className="mt-1 w-full p-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                    rows="3"
                    placeholder="For sizes: 3Y, 4Y, 5Y | For colors: Sand | Ivory | Purple"
                  />
                  <button
                    type="button"
                    onClick={handleAddOrUpdateAttribute}
                    className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
                  >
                    {editingAttribute ? 'Update attribute' : 'Save attribute'}
                  </button>
                </div>
              )}
              {formData.attributes.map((attr) => (
                <div key={attr.id} className="mb-4">
                  <button
                    type="button"
                    onClick={() => toggleAccordion(attr.id)}
                    className="w-full text-left bg-gray-200 p-3 rounded-lg hover:bg-gray-300 transition"
                  >
                    <span className="text-sm font-medium text-gray-700">{attr.name}</span>
                    <span className="float-right">{openAccordions[attr.id] ? '−' : '+'}</span>
                  </button>
                  {openAccordions[attr.id] && (
                    <div className="mt-2 p-3 border border-gray-300 rounded-lg">
                      <p className="text-sm text-gray-600">Terms: {attr.terms.map(t => t.term_name).join(', ')}</p>
                      <div className="mt-2 flex space-x-4">
                        <button
                          type="button"
                          onClick={() => handleEditAttribute(attr)}
                          className="bg-blue-600 text-white px-3 py-1 rounded-lg hover:bg-blue-700 transition"
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteAttribute(attr.id)}
                          className="bg-red-600 text-white px-3 py-1 rounded-lg hover:bg-red-700 transition"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="mb-6">
              <h4 className="text-lg font-medium text-gray-700 mb-4">Manage Categories</h4>
              <button
                type="button"
                onClick={() => {
                  setShowAddCategoryForm(true);
                  setEditingCategory(null);
                  setNewCategoryName('');
                }}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition mb-4"
              >
                Add new
              </button>
              {showAddCategoryForm && (
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700">Name</label>
                  <input
                    type="text"
                    value={newCategoryName}
                    onChange={(e) => setNewCategoryName(e.target.value)}
                    className="mt-1 w-full p-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                  />
                  <button
                    type="button"
                    onClick={handleAddOrUpdateCategory}
                    className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
                  >
                    {editingCategory ? 'Update category' : 'Save category'}
                  </button>
                </div>
              )}
              {categories.map((cat) => (
                <div key={cat.id} className="mb-4">
                  <button
                    type="button"
                    onClick={() => toggleCategoryAccordion(cat.id)}
                    className="w-full text-left bg-gray-200 p-3 rounded-lg hover:bg-gray-300 transition"
                  >
                    <span className="text-sm font-medium text-gray-700">{cat.name}</span>
                    <span className="float-right">{openCategoryAccordions[cat.id] ? '−' : '+'}</span>
                  </button>
                  {openCategoryAccordions[cat.id] && (
                    <div className="mt-2 p-3 border border-gray-300 rounded-lg">
                      <div className="mt-2 flex space-x-4">
                        <button
                          type="button"
                          onClick={() => handleEditCategory(cat)}
                          className="bg-blue-600 text-white px-3 py-1 rounded-lg hover:bg-blue-700 transition"
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteCategory(cat.id)}
                          className="bg-red-600 text-white px-3 py-1 rounded-lg hover:bg-red-700 transition"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ProductEditor;