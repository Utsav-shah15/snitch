import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate, Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import useProducts from '../../products/hooks/useProducts';
import DashboardSidebar from '../components/DashboardSidebar';
import { generateDescription, suggestPrice } from '../../ai/services/ai.service';

const CATEGORIES = ['Tops', 'Bottoms', 'Footwear', 'Accessories'];
const SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'Free Size'];
const CONDITIONS = ['New', 'Like New', 'Good', 'Fair'];

const CreateListing = () => {
    const { id } = useParams(); // If present, we are in Edit mode
    const isEditMode = !!id;

    const { user } = useSelector((state) => state.auth);
    const navigate = useNavigate();
    const fileInputRef = useRef(null);

    const { createProduct, updateProduct, fetchProductById, currentProduct, loading, error } = useProducts();

    // Form fields
    const [fields, setFields] = useState({
        title: '',
        description: '',
        amount: '',
        category: 'Tops',
        size: 'M',
        condition: 'New',
        stock: '1',
        status: 'active',
    });

    const [selectedFiles, setSelectedFiles] = useState([]);
    const [previews, setPreviews] = useState([]);
    const [submitError, setSubmitError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    // AI States
    const [aiDescLoading, setAiDescLoading] = useState(false);
    const [aiPriceLoading, setAiPriceLoading] = useState(false);

    const handleAiDescription = async () => {
        if (!fields.title.trim()) {
            setSubmitError('Enter a product title first so AI can generate a description.');
            return;
        }
        setAiDescLoading(true);
        setSubmitError('');
        try {
            const data = await generateDescription({
                title: fields.title,
                category: fields.category,
                condition: fields.condition,
            });
            setFields((prev) => ({ ...prev, description: data.description }));
        } catch (err) {
            setSubmitError(err.response?.data?.error || err.message || 'Failed to generate description.');
        } finally {
            setAiDescLoading(false);
        }
    };

    const handleAiPrice = async () => {
        if (!fields.category) {
            setSubmitError('Select a category first.');
            return;
        }
        setAiPriceLoading(true);
        setSubmitError('');
        try {
            const data = await suggestPrice({
                title: fields.title,
                category: fields.category,
                condition: fields.condition,
                size: fields.size,
            });
            setFields((prev) => ({ ...prev, amount: data.suggestedPrice.toString() }));
        } catch (err) {
            setSubmitError(err.response?.data?.error || err.message || 'Failed to suggest price.');
        } finally {
            setAiPriceLoading(false);
        }
    };

    if (!user) return <Navigate to="/login" replace />;
    if (!user.isSeller) return <Navigate to="/become-seller" replace />;

    // Load existing product if in Edit mode
    useEffect(() => {
        if (isEditMode) {
            fetchProductById(id)
                .then((data) => {
                    const p = data.product;
                    const sellerId = p.seller?._id || p.seller?.id || p.seller;
                    const loggedInUserId = user?.id || user?._id;
                    if (sellerId !== loggedInUserId) {
                        // Not the owner
                        navigate('/dashboard/listings');
                        return;
                    }
                    setFields({
                        title: p.title,
                        description: p.description,
                        amount: p.price.amount.toString(),
                        category: p.category,
                        size: p.size,
                        condition: p.condition,
                        stock: p.stock.toString(),
                        status: p.status,
                    });
                    // Show existing images as previews
                    setPreviews(p.images.map((img) => img.url));
                })
                .catch(() => navigate('/dashboard/listings'));
        }
    }, [id, isEditMode]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFields((prev) => ({ ...prev, [name]: value }));
        setSubmitError('');
    };

    const handleFileChange = (e) => {
        const files = Array.from(e.target.files);
        if (files.length === 0) return;

        // Validation: Limit to max 7 images
        if (selectedFiles.length + files.length > 7) {
            setSubmitError('You can upload a maximum of 7 images.');
            return;
        }

        // Validate size (max 5MB)
        for (const file of files) {
            if (file.size > 5 * 1024 * 1024) {
                setSubmitError('Each image must be under 5 MB.');
                return;
            }
        }

        setSelectedFiles((prev) => [...prev, ...files]);

        // Create previews
        const newPreviews = files.map((file) => URL.createObjectURL(file));
        setPreviews((prev) => [...prev, ...newPreviews]);
        setSubmitError('');
    };

    const removeImage = (index) => {
        // If editing, removing an image from existing previews requires special handling
        // For simplicity, we clear previews and selected files to re-select
        setPreviews((prev) => prev.filter((_, i) => i !== index));
        setSelectedFiles((prev) => {
            // Adjust index if we mixed existing URLs and local blobs
            // For uploaded files, they don't map to local blobs directly, so we just filter local files
            const newFiles = [...prev];
            // Since previews contain existing URLs first, we calculate the local file index
            const localIndex = index - (previews.length - prev.length);
            if (localIndex >= 0) {
                newFiles.splice(localIndex, 1);
            }
            return newFiles;
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validation
        if (!fields.title.trim() || fields.title.length < 3) {
            setSubmitError('Title must be at least 3 characters.');
            return;
        }
        if (!fields.description.trim() || fields.description.length < 10) {
            setSubmitError('Description must be at least 10 characters.');
            return;
        }
        if (!fields.amount || Number(fields.amount) <= 0) {
            setSubmitError('Price must be greater than 0.');
            return;
        }
        if (!isEditMode && selectedFiles.length === 0) {
            setSubmitError('At least one product image is required.');
            return;
        }

        setIsSubmitting(true);
        setSubmitError('');

        const formData = new FormData();
        formData.append('title', fields.title.trim());
        formData.append('description', fields.description.trim());
        formData.append('amount', fields.amount);
        formData.append('category', fields.category);
        formData.append('size', fields.size);
        formData.append('condition', fields.condition);
        formData.append('stock', fields.stock);
        if (isEditMode) {
            formData.append('status', fields.status);
        }

        selectedFiles.forEach((file) => {
            formData.append('images', file);
        });

        try {
            if (isEditMode) {
                await updateProduct(id, formData);
            } else {
                await createProduct(formData);
            }
            navigate('/dashboard/listings');
        } catch (err) {
            setSubmitError(err.message || 'Failed to save listing');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#0a0a0a] text-white">
            <div className="flex">
                <DashboardSidebar />

                <main className="flex-1 p-6 lg:p-10 max-w-4xl">
                    <div className="mb-8">
                        <h1 className="font-serif text-2xl tracking-widest uppercase">
                            {isEditMode ? 'Edit Listing' : 'New Listing'}
                        </h1>
                        <p className="text-neutral-500 text-xs mt-1">
                            {isEditMode ? 'Update your product details' : 'Post a new item for sale in the marketplace'}
                        </p>
                    </div>

                    {(submitError || error) && (
                        <div className="bg-red-950/50 border border-red-900/50 p-4 text-xs text-red-400 mb-6">
                            {submitError || error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="bg-[#141414] border border-neutral-900 p-6 space-y-6">
                            {/* Title */}
                            <div>
                                <label className="text-[10px] font-semibold tracking-wider text-neutral-400 block mb-1.5 uppercase">Product Title</label>
                                <input
                                    type="text"
                                    name="title"
                                    value={fields.title}
                                    onChange={handleInputChange}
                                    placeholder="e.g. Vintage Oversized Denim Jacket"
                                    className="w-full bg-[#1c1c1c] border border-neutral-800 px-4 py-3 text-sm text-white placeholder-neutral-500 outline-none focus:border-neutral-500 transition-colors"
                                />
                            </div>

                            {/* Description */}
                            <div>
                                <div className="flex items-center justify-between mb-1.5">
                                    <label className="text-[10px] font-semibold tracking-wider text-neutral-400 uppercase">Description</label>
                                    <div className="flex items-center gap-2">
                                        {!fields.title.trim() && (
                                            <span className="text-[8px] text-neutral-600 font-bold uppercase tracking-wider">(Requires Title)</span>
                                        )}
                                        <button
                                            type="button"
                                            onClick={handleAiDescription}
                                            disabled={aiDescLoading || !fields.title.trim()}
                                            className={`flex items-center gap-1.5 text-[10px] font-bold tracking-wider px-3 py-1 rounded-full border transition-all cursor-pointer ${!fields.title.trim()
                                                ? 'border-neutral-800 text-neutral-600 cursor-not-allowed'
                                                : 'border-violet-800/50 text-violet-400 hover:bg-violet-950/30'
                                                }`}
                                            title={!fields.title.trim() ? "Please fill the Product Title first" : "Generate AI Description"}
                                        >
                                            {aiDescLoading ? (
                                                <div className="w-3 h-3 border-2 border-violet-600/30 border-t-violet-500 rounded-full animate-spin" />
                                            ) : (
                                                <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09Z" />
                                                </svg>
                                            )}
                                            AI Generate
                                        </button>
                                    </div>
                                </div>
                                <textarea
                                    name="description"
                                    value={fields.description}
                                    onChange={handleInputChange}
                                    placeholder="Describe the item's fit, quality, wear, and other details..."
                                    rows="5"
                                    className="w-full bg-[#1c1c1c] border border-neutral-800 px-4 py-3 text-sm text-white placeholder-neutral-500 outline-none focus:border-neutral-500 transition-colors resize-none"
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                {/* Price */}
                                <div>
                                    <div className="flex items-center justify-between mb-1.5">
                                        <label className="text-[10px] font-semibold tracking-wider text-neutral-400 uppercase">Price (INR)</label>
                                        <div className="flex items-center gap-1.5">
                                            {!fields.category && (
                                                <span className="text-[8px] text-neutral-600 font-bold uppercase tracking-wider">(Requires Category)</span>
                                            )}
                                            <button
                                                type="button"
                                                onClick={handleAiPrice}
                                                disabled={aiPriceLoading || !fields.category}
                                                className={`flex items-center gap-1 text-[10px] font-bold tracking-wider px-2.5 py-0.5 rounded-full border transition-all cursor-pointer ${!fields.category
                                                    ? 'border-neutral-800 text-neutral-600 cursor-not-allowed'
                                                    : 'border-emerald-800/50 text-emerald-400 hover:bg-emerald-950/30'
                                                    }`}
                                                title={!fields.category ? "Please select a Category first" : "Suggest AI Price"}
                                            >
                                                {aiPriceLoading ? (
                                                    <div className="w-3 h-3 border-2 border-emerald-600/30 border-t-emerald-500 rounded-full animate-spin" />
                                                ) : '💰'}
                                                Suggest
                                            </button>
                                        </div>
                                    </div>
                                    <input
                                        type="number"
                                        name="amount"
                                        value={fields.amount}
                                        onChange={handleInputChange}
                                        placeholder="₹"
                                        className="w-full bg-[#1c1c1c] border border-neutral-800 px-4 py-3 text-sm text-white placeholder-neutral-500 outline-none focus:border-neutral-500 transition-colors"
                                    />
                                </div>

                                {/* Category */}
                                <div>
                                    <label className="text-[10px] font-semibold tracking-wider text-neutral-400 block mb-1.5 uppercase">Category</label>
                                    <select
                                        name="category"
                                        value={fields.category}
                                        onChange={handleInputChange}
                                        className="w-full bg-[#1c1c1c] border border-neutral-800 px-4 py-3.5 text-sm text-white outline-none focus:border-neutral-500 transition-colors cursor-pointer"
                                    >
                                        {CATEGORIES.map((cat) => (
                                            <option key={cat} value={cat}>{cat}</option>
                                        ))}
                                    </select>
                                </div>

                                {/* Size */}
                                <div>
                                    <label className="text-[10px] font-semibold tracking-wider text-neutral-400 block mb-1.5 uppercase">Size</label>
                                    <select
                                        name="size"
                                        value={fields.size}
                                        onChange={handleInputChange}
                                        className="w-full bg-[#1c1c1c] border border-neutral-800 px-4 py-3.5 text-sm text-white outline-none focus:border-neutral-500 transition-colors cursor-pointer"
                                    >
                                        {SIZES.map((size) => (
                                            <option key={size} value={size}>{size}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                {/* Condition */}
                                <div>
                                    <label className="text-[10px] font-semibold tracking-wider text-neutral-400 block mb-1.5 uppercase">Condition</label>
                                    <select
                                        name="condition"
                                        value={fields.condition}
                                        onChange={handleInputChange}
                                        className="w-full bg-[#1c1c1c] border border-neutral-800 px-4 py-3.5 text-sm text-white outline-none focus:border-neutral-500 transition-colors cursor-pointer"
                                    >
                                        {CONDITIONS.map((cond) => (
                                            <option key={cond} value={cond}>{cond}</option>
                                        ))}
                                    </select>
                                </div>

                                {/* Stock */}
                                <div>
                                    <label className="text-[10px] font-semibold tracking-wider text-neutral-400 block mb-1.5 uppercase">Stock Quantity</label>
                                    <input
                                        type="number"
                                        name="stock"
                                        value={fields.stock}
                                        onChange={handleInputChange}
                                        min="1"
                                        className="w-full bg-[#1c1c1c] border border-neutral-800 px-4 py-3 text-sm text-white placeholder-neutral-500 outline-none focus:border-neutral-500 transition-colors"
                                    />
                                </div>

                                {/* Status (Edit Mode only) */}
                                {isEditMode && (
                                    <div>
                                        <label className="text-[10px] font-semibold tracking-wider text-neutral-400 block mb-1.5 uppercase">Status</label>
                                        <select
                                            name="status"
                                            value={fields.status}
                                            onChange={handleInputChange}
                                            className="w-full bg-[#1c1c1c] border border-neutral-800 px-4 py-3.5 text-sm text-white outline-none focus:border-neutral-500 transition-colors cursor-pointer"
                                        >
                                            <option value="active">Active (Listed)</option>
                                            <option value="draft">Draft (Hidden)</option>
                                            <option value="sold">Sold Out</option>
                                        </select>
                                    </div>
                                )}
                            </div>

                            {/* Image Upload */}
                            <div>
                                <label className="text-[10px] font-semibold tracking-wider text-neutral-400 block mb-1.5 uppercase">
                                    Product Images {isEditMode && '(Leave empty to keep existing images)'}
                                </label>

                                <div className="grid grid-cols-4 gap-4 mb-4">
                                    {previews.map((preview, index) => (
                                        <div key={index} className="aspect-square bg-neutral-900 border border-neutral-800 relative group overflow-hidden">
                                            <img src={preview} alt="Preview" className="w-full h-full object-cover" />
                                            <button
                                                type="button"
                                                onClick={() => removeImage(index)}
                                                className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center text-red-500 font-bold transition-opacity text-xs cursor-pointer"
                                            >
                                                Remove
                                            </button>
                                        </div>
                                    ))}

                                    {previews.length < 7 && (
                                        <button
                                            type="button"
                                            onClick={() => fileInputRef.current?.click()}
                                            className="aspect-square bg-[#1c1c1c] border border-dashed border-neutral-800 hover:border-neutral-600 flex flex-col items-center justify-center gap-2 text-neutral-500 hover:text-neutral-400 transition-colors cursor-pointer"
                                        >
                                            <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                                            </svg>
                                            <span className="text-[9px] font-bold uppercase tracking-wider">Upload</span>
                                        </button>
                                    )}
                                </div>

                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    onChange={handleFileChange}
                                    multiple
                                    accept="image/*"
                                    className="hidden"
                                />
                                <p className="text-[10px] text-neutral-500">
                                    Upload up to 7 images. Max size 5 MB per image. PNG, JPG, or WEBP.
                                </p>
                            </div>
                        </div>

                        {/* Submit Button */}
                        <div className="flex gap-4">
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="bg-white text-black text-xs font-bold tracking-[0.2em] px-8 py-4 hover:bg-neutral-200 transition-colors uppercase cursor-pointer disabled:bg-neutral-700 disabled:text-neutral-400 disabled:cursor-not-allowed flex items-center gap-2"
                            >
                                {isSubmitting ? 'Saving...' : isEditMode ? 'Update Listing' : 'Publish Listing'}
                            </button>
                            <button
                                type="button"
                                onClick={() => navigate('/dashboard/listings')}
                                className="bg-transparent border border-neutral-800 text-neutral-400 hover:text-white hover:border-neutral-600 text-xs font-bold tracking-[0.2em] px-8 py-4 transition-all uppercase cursor-pointer"
                            >
                                Cancel
                            </button>
                        </div>
                    </form>
                </main>
            </div>
        </div>
    );
};

export default CreateListing;
