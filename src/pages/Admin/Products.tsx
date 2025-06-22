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
  Save,
  Image as ImageIcon,
  XCircle,
  Package,
  DollarSign,
  ChevronRight
} from 'lucide-react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
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
  id: string;
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
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  
  const [formData, setFormData] = useState<FormData>({
    id: '',
    name: '',
    price: 0,
    description: '',
    images: [],
    video: '',
    category: '',
    stock: 0,
    addons: []
  });

  // Rich text editor modules
  const modules = {
    toolbar: [
      [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ 'color': [] }, { 'background': [] }],
      [{ 'list': 'ordered'}, { 'list': 'bullet' }],
      [{ 'indent': '-1'}, { 'indent': '+1' }],
      [{ 'align': [] }],
      ['link', 'image'],
      ['clean']
    ],
  };

  const formats = [
    'header', 'bold', 'italic', 'underline', 'strike',
    'color', 'background', 'list', 'bullet', 'indent',
    'align', 'link', 'image'
  ];

  useEffect(() => {
    const isLoggedIn = localStorage.getItem('adminLoggedIn');
    if (!isLoggedIn) {
      navigate('/admin');
      return;
    }

    fetchProducts();
    
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [navigate]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
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
      id: '',
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

  const generateProductId = () => {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substr(2, 5);
    return `p_${timestamp}_${random}`;
  };

  const handleCreateProduct = () => {
    resetForm();
    setFormData(prev => ({ ...prev, id: generateProductId() }));
    setModalMode('create');
    setSelectedProduct(null);
    setShowModal(true);
  };

  const handleEditProduct = (product: Product) => {
    setFormData({
      id: product.id,
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

    if (formData.images.length >= 4) {
      alert('Maximum 4 images allowed');
      return;
    }

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
    
    if (!formData.id.trim()) {
      alert('Product ID is required');
      return;
    }

    if (formData.images.length === 0) {
      alert('At least one image is required');
      return;
    }

    try {
      setIsSubmitting(true);
      
      // Check if product ID already exists (for create mode)
      if (modalMode === 'create') {
        const existingProduct = products.find(p => p.id === formData.id);
        if (existingProduct) {
          alert('Product ID already exists. Please use a different ID.');
          return;
        }
      }

      if (modalMode === 'create') {
        await createProduct({
          ...formData,
          extraFields: {
            deliveryNote: '',
            jerseyName: '',
            jerseyNumber: '',
            jerseySize: ''
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
    } finally {
      setIsSubmitting(false);
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
    product.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-gray-50 to-gray-100">
        <div className="text-center space-y-4">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-8 h-8 bg-blue-500 rounded-full animate-ping"></div>
            </div>
          </div>
          <p className="text-gray-600 font-medium">Loading products...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
      {/* Floating Header */}
      <header className={`sticky top-0 z-20 bg-white shadow-md transition-all duration-300 ${isScrolled ? 'py-3' : 'py-5'} rounded-b-2xl`}>
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <button
                onClick={() => navigate('/admin/dashboard')}
                className="flex items-center space-x-1 text-indigo-600 hover:text-indigo-800"
              >
                <ArrowLeft className="w-5 h-5" />
                <span className="hidden sm:inline font-medium">Dashboard</span>
              </button>
              <h1 className="text-xl font-bold text-gray-900">Product Management</h1>
            </div>
            
            <button
              onClick={handleCreateProduct}
              className="flex items-center space-x-1 bg-gradient-to-r from-blue-600 to-indigo-700 text-white px-3 py-2 rounded-xl hover:shadow-lg transition-all"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">Add Product</span>
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Search */}
        <div className="bg-white rounded-2xl shadow-sm p-5 mb-6">
          <div className="relative">
            <div className="absolute left-3 top-3 text-gray-400">
              <Search className="w-5 h-5" />
            </div>
            <input
              type="text"
              placeholder="Search products by name, category, or ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
            />
          </div>
        </div>

        {/* Products Grid */}
        {filteredProducts.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm p-8 text-center border border-gray-200">
            <div className="mx-auto h-16 w-16 rounded-full bg-indigo-100 flex items-center justify-center mb-4">
              <Package className="h-8 w-8 text-indigo-600" />
            </div>
            <p className="text-gray-600 text-lg mb-4">No products found</p>
            <button
              onClick={handleCreateProduct}
              className="flex items-center space-x-2 bg-gradient-to-r from-blue-600 to-indigo-700 text-white px-5 py-2.5 rounded-xl hover:shadow-lg transition-all mx-auto"
            >
              <Plus className="w-4 h-4" />
              <span>Create your first product</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredProducts.map((product) => (
              <div 
                key={product.id} 
                className="bg-white rounded-2xl shadow-sm overflow-hidden flex flex-col h-full border border-gray-200 hover:shadow-md transition-all duration-200 transform hover:-translate-y-1"
              >
                <div className="aspect-video bg-gradient-to-br from-gray-100 to-gray-200 relative">
                  {product.images.length > 0 ? (
                    <img
                      src={product.images[0]}
                      alt={product.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                      <ImageIcon className="h-12 w-12" />
                    </div>
                  )}
                  <div className="absolute top-3 right-3 bg-white/80 backdrop-blur-sm px-2 py-1 rounded-lg text-xs font-medium">
                    ID: {product.id.substring(0, 6)}...
                  </div>
                </div>
                
                <div className="p-4 flex flex-col flex-grow">
                  <div className="flex-grow">
                    <h3 className="text-lg font-semibold text-gray-900 mb-1 truncate">{product.name}</h3>
                    <p className="text-gray-600 text-sm mb-3">{product.category}</p>
                  </div>
                  
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-xl font-bold text-blue-600">৳{product.price}</span>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      product.stock > 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {product.stock > 0 ? `Stock: ${product.stock}` : 'Out of Stock'}
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      onClick={() => handleViewProduct(product)}
                      className="flex flex-col items-center justify-center space-y-1 bg-gray-100 text-gray-700 p-2 rounded-lg hover:bg-gray-200 text-xs transition-colors"
                      aria-label="View product"
                    >
                      <Eye className="w-4 h-4" />
                      <span>View</span>
                    </button>
                    <button
                      onClick={() => handleEditProduct(product)}
                      className="flex flex-col items-center justify-center space-y-1 bg-blue-100 text-blue-700 p-2 rounded-lg hover:bg-blue-200 text-xs transition-colors"
                      aria-label="Edit product"
                    >
                      <Edit className="w-4 h-4" />
                      <span>Edit</span>
                    </button>
                    <button
                      onClick={() => handleDeleteProduct(product.id)}
                      className="flex flex-col items-center justify-center space-y-1 bg-red-100 text-red-700 p-2 rounded-lg hover:bg-red-200 text-xs transition-colors"
                      aria-label="Delete product"
                    >
                      <Trash2 className="w-4 h-4" />
                      <span>Delete</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[90dvh] overflow-y-auto shadow-2xl">
              <div className="sticky top-0 bg-white z-10 border-b border-gray-200">
                <div className="flex justify-between items-center p-4 sm:p-6">
                  <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
                    {modalMode === 'create' ? 'Add New Product' : 
                     modalMode === 'edit' ? 'Edit Product' : 'Product Details'}
                  </h2>
                  <button
                    onClick={() => setShowModal(false)}
                    className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100 transition-colors"
                    aria-label="Close modal"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>
              </div>

              <div className="p-4 sm:p-6">
                {modalMode === 'view' && selectedProduct ? (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Product Info Card */}
                      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-5 border border-blue-100">
                        <h3 className="text-lg font-semibold mb-4 text-indigo-700 flex items-center">
                          <Package className="w-5 h-5 text-indigo-600 mr-2" />
                          Product Information
                        </h3>
                        <div className="space-y-3">
                          <div>
                            <p className="text-sm text-gray-500">ID</p>
                            <p className="font-medium">{selectedProduct.id}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">Name</p>
                            <p className="font-medium">{selectedProduct.name}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">Price</p>
                            <p className="font-medium text-blue-600">৳{selectedProduct.price}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">Category</p>
                            <p className="font-medium">{selectedProduct.category}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">Stock</p>
                            <p className={`font-medium ${
                              selectedProduct.stock > 0 ? 'text-green-600' : 'text-red-600'
                            }`}>
                              {selectedProduct.stock}
                            </p>
                          </div>
                        </div>
                      </div>
                      
                      {/* Images Card */}
                      <div className="bg-gradient-to-br from-emerald-50 to-cyan-50 rounded-xl p-5 border border-emerald-100">
                        <h3 className="text-lg font-semibold mb-4 text-emerald-700 flex items-center">
                          <ImageIcon className="w-5 h-5 text-emerald-600 mr-2" />
                          Images
                        </h3>
                        <div className="grid grid-cols-2 gap-3">
                          {selectedProduct.images.map((image, index) => (
                            <div key={index} className="relative aspect-square rounded-lg overflow-hidden border border-gray-200 group">
                              <img
                                src={image}
                                alt={`Product ${index + 1}`}
                                className="w-full h-full object-cover"
                              />
                              <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                    
                    {/* Description Card */}
                    <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl p-5 border border-amber-100">
                      <h3 className="text-lg font-semibold mb-4 text-amber-700 flex items-center">
                        <Edit className="w-5 h-5 text-amber-600 mr-2" />
                        Description
                      </h3>
                      <div 
                        className="prose max-w-none bg-white p-4 rounded-lg border border-gray-200"
                        dangerouslySetInnerHTML={{ __html: selectedProduct.description }}
                      />
                    </div>

                    {/* Addons Card */}
                    {selectedProduct.addons && selectedProduct.addons.length > 0 && (
                      <div className="bg-gradient-to-br from-purple-50 to-violet-50 rounded-xl p-5 border border-purple-100">
                        <h3 className="text-lg font-semibold mb-4 text-purple-700 flex items-center">
                          <DollarSign className="w-5 h-5 text-purple-600 mr-2" />
                          Add-ons
                        </h3>
                        <div className="space-y-3">
                          {selectedProduct.addons.map((addon, index) => (
                            <div key={index} className="flex justify-between items-center p-3 bg-white rounded-lg border border-purple-200">
                              <span className="font-medium">{addon.name}</span>
                              <span className="font-semibold text-blue-600">৳{addon.price}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                      {/* ID Field */}
                      <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700">
                          Product ID *
                        </label>
                        <input
                          type="text"
                          value={formData.id}
                          onChange={(e) => setFormData(prev => ({ ...prev, id: e.target.value }))}
                          required
                          disabled={modalMode === 'edit'}
                          className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent disabled:bg-gray-100 transition"
                          placeholder="e.g., p1, jersey-001"
                        />
                        {modalMode === 'edit' && (
                          <p className="text-xs text-gray-500 mt-1">Product ID cannot be changed</p>
                        )}
                      </div>

                      {/* Name Field */}
                      <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700">
                          Product Name *
                        </label>
                        <input
                          type="text"
                          value={formData.name}
                          onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                          required
                          className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                        />
                      </div>

                      {/* Price Field */}
                      <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700">
                          Price (৳) *
                        </label>
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          value={formData.price}
                          onChange={(e) => setFormData(prev => ({ ...prev, price: Number(e.target.value) }))}
                          required
                          className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                        />
                      </div>

                      {/* Category Field */}
                      <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700">
                          Category *
                        </label>
                        <input
                          type="text"
                          value={formData.category}
                          onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                          required
                          className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                        />
                      </div>

                      {/* Stock Field */}
                      <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700">
                          Stock *
                        </label>
                        <input
                          type="number"
                          min="0"
                          value={formData.stock}
                          onChange={(e) => setFormData(prev => ({ ...prev, stock: Number(e.target.value) }))}
                          required
                          className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                        />
                      </div>

                      {/* Video URL Field */}
                      <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700">
                          Video URL (Optional)
                        </label>
                        <input
                          type="url"
                          value={formData.video}
                          onChange={(e) => setFormData(prev => ({ ...prev, video: e.target.value }))}
                          className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                          placeholder="https://example.com/video.mp4"
                        />
                      </div>
                    </div>

                    {/* Description Field */}
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-gray-700">
                        Description (Rich Text) *
                      </label>
                      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                        <ReactQuill
                          theme="snow"
                          value={formData.description}
                          onChange={(value) => setFormData(prev => ({ ...prev, description: value }))}
                          modules={modules}
                          formats={formats}
                          className="h-40 mb-12 rounded-b-xl"
                        />
                      </div>
                    </div>

                    {/* Images Field */}
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-gray-700">
                        Images * (Max 4)
                      </label>
                      <div className="border-2 border-dashed border-gray-300 rounded-xl p-5">
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept="image/*"
                          onChange={handleImageUpload}
                          className="hidden"
                          id="image-upload"
                          disabled={formData.images.length >= 4 || uploading}
                        />
                        <label
                          htmlFor="image-upload"
                          className={`flex flex-col items-center justify-center space-y-2 text-center p-5 rounded-lg cursor-pointer transition-all ${
                            formData.images.length >= 4 
                              ? 'cursor-not-allowed bg-gray-100 text-gray-400' 
                              : 'bg-blue-50 text-blue-600 hover:bg-blue-100'
                          } ${uploading ? 'opacity-70' : ''}`}
                        >
                          {uploading ? (
                            <div className="flex flex-col items-center">
                              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-2"></div>
                              <span>Uploading...</span>
                            </div>
                          ) : (
                            <>
                              <Upload className="w-8 h-8" />
                              <span className="font-medium">
                                {formData.images.length >= 4 
                                  ? 'Maximum 4 images reached' 
                                  : 'Click or drag to upload images'}
                              </span>
                              <p className="text-sm text-gray-500">
                                Supported formats: JPG, PNG, WEBP. Max size: 2MB
                              </p>
                            </>
                          )}
                        </label>
                        
                        {formData.images.length > 0 && (
                          <div className="mt-4">
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                              {formData.images.map((image, index) => (
                                <div key={index} className="relative aspect-square rounded-lg overflow-hidden border border-gray-200 group">
                                  <img
                                    src={image}
                                    alt={`Product ${index + 1}`}
                                    className="w-full h-full object-cover"
                                  />
                                  <button
                                    type="button"
                                    onClick={() => removeImage(index)}
                                    className="absolute top-2 right-2 bg-red-600 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                                    aria-label="Remove image"
                                  >
                                    <XCircle className="w-4 h-4" />
                                  </button>
                                  <div className="absolute bottom-0 left-0 right-0 bg-black/70 text-white text-xs p-1 text-center">
                                    Image {index + 1}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Addons Field */}
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <label className="block text-sm font-medium text-gray-700">
                          Add-ons (Optional)
                        </label>
                        <button
                          type="button"
                          onClick={addAddon}
                          className="flex items-center space-x-1 bg-green-600 text-white px-3 py-1.5 rounded-lg text-sm hover:bg-green-700 transition-colors"
                        >
                          <Plus className="w-4 h-4" />
                          <span>Add Addon</span>
                        </button>
                      </div>
                      
                      {formData.addons.length > 0 && (
                        <div className="bg-gray-50 rounded-xl p-4 space-y-3">
                          {formData.addons.map((addon, index) => (
                            <div key={index} className="grid grid-cols-1 sm:grid-cols-[1fr_120px_40px] gap-2">
                              <div>
                                <label className="text-xs text-gray-500 mb-1">Addon name</label>
                                <input
                                  type="text"
                                  placeholder="e.g., Name printing"
                                  value={addon.name}
                                  onChange={(e) => updateAddon(index, 'name', e.target.value)}
                                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                />
                              </div>
                              
                              <div>
                                <label className="text-xs text-gray-500 mb-1">Price (৳)</label>
                                <input
                                  type="number"
                                  placeholder="0.00"
                                  min="0"
                                  step="0.01"
                                  value={addon.price}
                                  onChange={(e) => updateAddon(index, 'price', Number(e.target.value))}
                                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                />
                              </div>
                              
                              <div className="flex items-end">
                                <button
                                  type="button"
                                  onClick={() => removeAddon(index)}
                                  className="w-full h-[42px] bg-red-100 text-red-700 flex items-center justify-center rounded-lg hover:bg-red-200 transition"
                                  aria-label="Remove addon"
                                >
                                  <X className="w-4 h-4" />
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-col sm:flex-row justify-end space-y-3 sm:space-y-0 sm:space-x-4 pt-4 border-t border-gray-200">
                      <button
                        type="button"
                        onClick={() => setShowModal(false)}
                        className="px-5 py-2.5 border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50 transition"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="flex items-center justify-center space-x-2 bg-gradient-to-r from-blue-600 to-indigo-700 text-white px-5 py-2.5 rounded-xl hover:shadow-lg transition-all disabled:opacity-70"
                        disabled={uploading || isSubmitting}
                      >
                        {isSubmitting ? (
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        ) : (
                          <Save className="w-4 h-4" />
                        )}
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