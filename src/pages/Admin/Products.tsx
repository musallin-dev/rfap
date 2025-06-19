import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  Eye, 
  X,
  Upload,
  Save
} from 'lucide-react';
import { 
  getAllProducts, 
  createProduct, 
  updateProduct, 
  deleteProduct, 
  Product 
} from '../../services/firebaseService';
import { uploadToImgBB } from '../../services/imgbbService';

interface Addon {
  name: string;
  price: number;
}

interface FormData {
  name: string;
  price: number;
  description: string;
  images: string[];
  video: string;
  category: string;
  stock: number;
  addons: Addon[];
}

const AdminProducts: React.FC = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit' | 'view'>('create');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [uploading, setUploading] = useState(false);
  
  const [formData, setFormData] = useState<FormData>({
    name: '',
    price: 0,
    description: '',
    images: [],
    video: '',
    category: '',
    stock: 0,
    addons: []
  });

  useEffect(() => {
    const isLoggedIn = localStorage.getItem('adminLoggedIn');
    if (!isLoggedIn) {
      navigate('/admin');
      return;
    }

    fetchProducts();
  }, [navigate]);

  const fetchProducts = async () => {
    try {
      const productsData = await getAllProducts();
      setProducts(productsData);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      price: 0,
      description: '',
      images: [],
      video: '',
      category: '',
      stock: 0,
      addons: []
    });
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleCreateProduct = () => {
    resetForm();
    setModalMode('create');
    setSelectedProduct(null);
    setShowModal(true);
  };

  const handleEditProduct = (product: Product) => {
    setFormData({
      name: product.name,
      price: product.price,
      description: product.description,
      images: product.images,
      video: product.video || '',
      category: product.category,
      stock: product.stock,
      addons: product.addons || []
    });
    setModalMode('edit');
    setSelectedProduct(product);
    setShowModal(true);
  };

  const handleViewProduct = (product: Product) => {
    setSelectedProduct(product);
    setModalMode('view');
    setShowModal(true);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploading(true);
      const imageUrl = await uploadToImgBB(file);
      setFormData(prev => ({
        ...prev,
        images: [...prev.images, imageUrl]
      }));
    } catch (error) {
      console.error('Error uploading image:', error);
      alert('Image upload failed');
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const removeImage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  const addAddon = () => {
    setFormData(prev => ({
      ...prev,
      addons: [...prev.addons, { name: '', price: 0 }]
    }));
  };

  const updateAddon = (index: number, field: keyof Addon, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      addons: prev.addons.map((addon, i) => 
        i === index ? { ...addon, [field]: value } : addon
      )
    }));
  };

  const removeAddon = (index: number) => {
    setFormData(prev => ({
      ...prev,
      addons: prev.addons.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (modalMode === 'create') {
        await createProduct({
          ...formData,
          extraFields: {
            deliveryNote: '',
            jerseyName: '',
            jerseyNumber: ''
          }
        });
      } else if (modalMode === 'edit' && selectedProduct) {
        await updateProduct(selectedProduct.id, formData);
      }
      
      fetchProducts();
      setShowModal(false);
      resetForm();
    } catch (error) {
      console.error('Error saving product:', error);
      alert('Failed to save product');
    }
  };

  const handleDeleteProduct = async (productId: string) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        await deleteProduct(productId);
        fetchProducts();
      } catch (error) {
        console.error('Error deleting product:', error);
        alert('Failed to delete product');
      }
    }
  };

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center py-6 gap-4">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/admin/dashboard')}
                className="flex items-center space-x-2 text-gray-600 hover:text-gray-900"
              >
                <ArrowLeft className="w-5 h-5" />
                <span className="hidden sm:inline">Back to Dashboard</span>
              </button>
              <h1 className="text-xl sm:text-3xl font-bold text-gray-900">Product Management</h1>
            </div>
            <button
              onClick={handleCreateProduct}
              className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 w-full sm:w-auto justify-center"
            >
              <Plus className="w-5 h-5" />
              <span>Add Product</span>
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search */}
        <div className="bg-white rounded-lg shadow p-4 sm:p-6 mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Products Grid */}
        {filteredProducts.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <p className="text-gray-600 text-lg">No products found</p>
            <button
              onClick={handleCreateProduct}
              className="mt-4 flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 mx-auto"
            >
              <Plus className="w-5 h-5" />
              <span>Create your first product</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {filteredProducts.map((product) => (
              <div key={product.id} className="bg-white rounded-lg shadow-md overflow-hidden flex flex-col h-full">
                <div className="aspect-video bg-gray-200">
                  {product.images.length > 0 ? (
                    <img
                      src={product.images[0]}
                      alt={product.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                      No Image
                    </div>
                  )}
                </div>
                
                <div className="p-4 flex flex-col flex-grow">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2 truncate">{product.name}</h3>
                  <p className="text-gray-600 text-sm mb-2">{product.category}</p>
                  <div className="flex justify-between items-center mb-4 mt-auto">
                    <span className="text-xl font-bold text-green-600">৳{product.price}</span>
                    <span className={`text-sm px-2 py-1 rounded-full ${
                      product.stock > 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {product.stock > 0 ? `In Stock (${product.stock})` : 'Out of Stock'}
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      onClick={() => handleViewProduct(product)}
                      className="flex flex-col sm:flex-row items-center justify-center space-x-0 sm:space-x-1 bg-gray-100 text-gray-700 px-2 py-2 rounded hover:bg-gray-200 text-sm"
                    >
                      <Eye className="w-4 h-4" />
                      <span className="hidden sm:inline">View</span>
                    </button>
                    <button
                      onClick={() => handleEditProduct(product)}
                      className="flex flex-col sm:flex-row items-center justify-center space-x-0 sm:space-x-1 bg-blue-100 text-blue-700 px-2 py-2 rounded hover:bg-blue-200 text-sm"
                    >
                      <Edit className="w-4 h-4" />
                      <span className="hidden sm:inline">Edit</span>
                    </button>
                    <button
                      onClick={() => handleDeleteProduct(product.id)}
                      className="flex flex-col sm:flex-row items-center justify-center space-x-0 sm:space-x-1 bg-red-100 text-red-700 px-2 py-2 rounded hover:bg-red-200 text-sm"
                    >
                      <Trash2 className="w-4 h-4" />
                      <span className="hidden sm:inline">Delete</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg w-full max-w-2xl md:max-w-4xl max-h-[90vh] overflow-y-auto">
              <div className="p-4 sm:p-6">
                <div className="flex justify-between items-center mb-4 sm:mb-6">
                  <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
                    {modalMode === 'create' ? 'Add New Product' : 
                     modalMode === 'edit' ? 'Edit Product' : 'Product Details'}
                  </h2>
                  <button
                    onClick={() => setShowModal(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>

                {modalMode === 'view' && selectedProduct ? (
                  <div className="space-y-4 sm:space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                      <div>
                        <h3 className="text-lg font-semibold mb-3">Product Information</h3>
                        <div className="space-y-2">
                          <p><strong>Name:</strong> {selectedProduct.name}</p>
                          <p><strong>Price:</strong> ৳{selectedProduct.price}</p>
                          <p><strong>Category:</strong> {selectedProduct.category}</p>
                          <p><strong>Stock:</strong> {selectedProduct.stock}</p>
                        </div>
                      </div>
                      
                      <div>
                        <h3 className="text-lg font-semibold mb-3">Images</h3>
                        <div className="grid grid-cols-2 gap-2">
                          {selectedProduct.images.map((image, index) => (
                            <div key={index} className="relative aspect-square">
                              <img
                                src={image}
                                alt={`Product ${index + 1}`}
                                className="w-full h-full object-cover rounded"
                              />
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <h3 className="text-lg font-semibold mb-3">Description</h3>
                      <div 
                        className="prose max-w-none"
                        dangerouslySetInnerHTML={{ __html: selectedProduct.description }}
                      />
                    </div>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Product Name *
                        </label>
                        <input
                          type="text"
                          value={formData.name}
                          onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                          required
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Price (৳) *
                        </label>
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          value={formData.price}
                          onChange={(e) => setFormData(prev => ({ ...prev, price: Number(e.target.value) }))}
                          required
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Category *
                        </label>
                        <input
                          type="text"
                          value={formData.category}
                          onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                          required
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Stock *
                        </label>
                        <input
                          type="number"
                          min="0"
                          value={formData.stock}
                          onChange={(e) => setFormData(prev => ({ ...prev, stock: Number(e.target.value) }))}
                          required
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Description (HTML) *
                      </label>
                      <textarea
                        value={formData.description}
                        onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                        rows={4}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Video URL (Optional)
                      </label>
                      <input
                        type="url"
                        value={formData.video}
                        onChange={(e) => setFormData(prev => ({ ...prev, video: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Images *
                      </label>
                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept="image/*"
                          onChange={handleImageUpload}
                          className="hidden"
                          id="image-upload"
                        />
                        <label
                          htmlFor="image-upload"
                          className="flex flex-col sm:flex-row items-center justify-center space-y-2 sm:space-y-0 sm:space-x-2 cursor-pointer"
                        >
                          <Upload className="w-5 h-5 text-gray-400" />
                          <span className="text-gray-600 text-center">
                            {uploading ? 'Uploading...' : 'Click to upload image (Max 4)'}
                          </span>
                        </label>
                        
                        {formData.images.length > 0 && (
                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-4">
                            {formData.images.map((image, index) => (
                              <div key={index} className="relative aspect-square">
                                <img
                                  src={image}
                                  alt={`Product ${index + 1}`}
                                  className="w-full h-full object-cover rounded"
                                />
                                <button
                                  type="button"
                                  onClick={() => removeImage(index)}
                                  className="absolute top-1 right-1 bg-red-600 text-white rounded-full p-1"
                                >
                                  <X className="w-3 h-3" />
                                </button>
                              </div>
                            ))}
                          </div>
                        )}
                        <p className="text-xs text-gray-500 mt-2 text-center">
                          Supported formats: JPG, PNG, WEBP. Max size: 2MB
                        </p>
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between items-center mb-4">
                        <label className="block text-sm font-medium text-gray-700">
                          Add-ons (Optional)
                        </label>
                        <button
                          type="button"
                          onClick={addAddon}
                          className="flex items-center space-x-1 bg-green-600 text-white px-3 py-1 rounded text-sm"
                        >
                          <Plus className="w-4 h-4" />
                          <span>Add Addon</span>
                        </button>
                      </div>
                      
                      {formData.addons.map((addon, index) => (
                        <div key={index} className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2 mb-2">
                          <input
                            type="text"
                            placeholder="Addon name"
                            value={addon.name}
                            onChange={(e) => updateAddon(index, 'name', e.target.value)}
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg"
                          />
                          <div className="flex space-x-2">
                            <input
                              type="number"
                              placeholder="Price"
                              min="0"
                              step="0.01"
                              value={addon.price}
                              onChange={(e) => updateAddon(index, 'price', Number(e.target.value))}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                            />
                            <button
                              type="button"
                              onClick={() => removeAddon(index)}
                              className="bg-red-600 text-white px-3 py-2 rounded-lg min-w-[40px]"
                            >
                              <X className="w-4 h-4 mx-auto" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="flex flex-col sm:flex-row justify-end space-y-3 sm:space-y-0 sm:space-x-4 pt-4">
                      <button
                        type="button"
                        onClick={() => setShowModal(false)}
                        className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="flex items-center justify-center space-x-2 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
                        disabled={uploading}
                      >
                        <Save className="w-4 h-4" />
                        <span>{modalMode === 'create' ? 'Create Product' : 'Update Product'}</span>
                      </button>
                    </div>
                  </form>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminProducts;