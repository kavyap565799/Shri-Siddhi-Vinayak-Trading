'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  Upload,
  FileText,
  Sparkles,
  Trash2,
  Undo2,
  CheckCircle,
  AlertCircle,
  Plus,
  Loader2,
  Eye,
  EyeOff
} from 'lucide-react';
import { toast } from 'sonner';
import { createClient } from '@/lib/supabase/client';
import { uploadImage } from '@/lib/supabase/storage';
import { toSlug } from '@/lib/utils';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter
} from '@/components/ui/dialog';
import type { Brand, Category } from '@/types';

interface ExtractedProduct {
  id: string; // client-side temp id
  name: string;
  sku: string;
  description: string;
  category_slug_match: string;
  specifications: { key: string; value: string }[];
  images: string[];
  status: 'pending' | 'saving' | 'saved' | 'error';
  errorMessage?: string;
  selected: boolean;
  image_box?: { ymin: number; xmin: number; ymax: number; xmax: number } | null;
}

/**
 * Crops a portion of a base64 image and pads it to a 1:1 aspect ratio with a white background.
 * Bounding box coordinates are expected as percentages (0 to 100).
 */
const cropImageToSquare = (
  base64Data: string,
  mimeType: string,
  box: { ymin: number; xmin: number; ymax: number; xmax: number }
): Promise<Blob> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.src = `data:${mimeType};base64,${base64Data}`;

    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Could not get canvas context'));
          return;
        }

        // Convert percentage coordinates to pixels
        const x = (box.xmin / 100) * img.width;
        const y = (box.ymin / 100) * img.height;
        const w = ((box.xmax - box.xmin) / 100) * img.width;
        const h = ((box.ymax - box.ymin) / 100) * img.height;

        // Ensure dimensions are positive
        if (w <= 0 || h <= 0) {
          reject(new Error('Invalid crop dimensions'));
          return;
        }

        // Determine size of the 1:1 canvas
        const size = Math.max(w, h);
        canvas.width = size;
        canvas.height = size;

        // Fill background with white
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, size, size);

        // Center the cropped image in the square canvas
        const dx = (size - w) / 2;
        const dy = (size - h) / 2;

        ctx.drawImage(img, x, y, w, h, dx, dy, w, h);

        // Export as Blob
        canvas.toBlob(
          (blob) => {
            if (blob) {
              resolve(blob);
            } else {
              reject(new Error('Canvas toBlob failed'));
            }
          },
          'image/jpeg',
          0.9
        );
      } catch (err) {
        reject(err);
      }
    };

    img.onerror = () => {
      reject(new Error('Failed to load image for cropping'));
    };
  });
};

export default function BulkImportPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Auth & DB Data
  const [brands, setBrands] = useState<Brand[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loadingDb, setLoadingDb] = useState(true);

  // Configuration State
  const [apiKey, setApiKey] = useState('');
  const [showKey, setShowKey] = useState(false);
  const [selectedBrandId, setSelectedBrandId] = useState<string>('');
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('ai-detect');
  const [selectedModel, setSelectedModel] = useState<string>('gemini-2.5-flash');

  // New Brand Dialog State
  const [newBrandName, setNewBrandName] = useState('');
  const [newBrandDesc, setNewBrandDesc] = useState('');
  const [creatingBrand, setCreatingBrand] = useState(false);
  const [brandDialogOpen, setBrandDialogOpen] = useState(false);

  // File Upload State
  const [files, setFiles] = useState<{ file: File; base64: string; type: string }[]>([]);
  const [dragActive, setDragActive] = useState(false);

  // Extraction State
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisStep, setAnalysisStep] = useState('');
  const [extractedProducts, setExtractedProducts] = useState<ExtractedProduct[]>([]);

  // Bulk Insert & Undo State
  const [isSaving, setIsSaving] = useState(false);
  const [saveProgress, setSaveProgress] = useState({ current: 0, total: 0 });
  const [importedProductIds, setImportedProductIds] = useState<string[]>([]);
  const [hasImported, setHasImported] = useState(false);

  // Load configuration and DB data
  useEffect(() => {
    const savedKey = localStorage.getItem('gemini_api_key') || '';
    setApiKey(savedKey);

    const savedProducts = localStorage.getItem('bulk_import_extracted_products');
    if (savedProducts) {
      try {
        const parsed = JSON.parse(savedProducts);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setExtractedProducts(parsed);
          toast.success('Restored your previous import session!');
        }
      } catch (e) {
        console.error('Error restoring session:', e);
      }
    }

    const fetchData = async () => {
      try {
        const supabase = createClient();
        const [brandsRes, categoriesRes] = await Promise.all([
          supabase.from('brands').select('*').order('name'),
          supabase.from('categories').select('*').order('name'),
        ]);
        setBrands((brandsRes.data || []) as Brand[]);
        setCategories((categoriesRes.data || []) as Category[]);

        // Pre-select Taparia if it exists
        const taparia = brandsRes.data?.find((b: any) => b.name.toLowerCase() === 'taparia');
        if (taparia) {
          setSelectedBrandId(taparia.id);
        }
      } catch (err) {
        console.error('Error fetching brands/categories:', err);
        toast.error('Failed to load database schema');
      } finally {
        setLoadingDb(false);
      }
    };

    fetchData();
  }, []);

  // Auto-save extracted products to localStorage
  useEffect(() => {
    if (extractedProducts.length > 0) {
      localStorage.setItem('bulk_import_extracted_products', JSON.stringify(extractedProducts));
    } else {
      localStorage.removeItem('bulk_import_extracted_products');
    }
  }, [extractedProducts]);

  // Save key to local storage when changed
  const handleApiKeyChange = (val: string) => {
    setApiKey(val);
    localStorage.setItem('gemini_api_key', val);
  };

  // Change category globally for all extracted items
  const handleGlobalCategoryChange = (catId: string) => {
    setSelectedCategoryId(catId);
    if (catId !== 'ai-detect' && catId !== 'none') {
      const selectedCat = categories.find((c) => c.id === catId);
      const slug = selectedCat ? selectedCat.slug : '';
      setExtractedProducts((prev) =>
        prev.map((p) => ({ ...p, category_slug_match: slug }))
      );
    }
  };

  // Create Brand Inline
  const handleCreateBrand = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBrandName.trim()) return;

    setCreatingBrand(true);
    try {
      const supabase = createClient();
      const slug = toSlug(newBrandName.trim());

      const { data, error } = await supabase
        .from('brands')
        .insert({
          name: newBrandName.trim(),
          slug,
          description: newBrandDesc.trim() || null,
        })
        .select()
        .single();

      if (error) throw error;

      const createdBrand = data as Brand;
      setBrands((prev) => [...prev, createdBrand].sort((a, b) => a.name.localeCompare(b.name)));
      setSelectedBrandId(createdBrand.id);
      toast.success(`Brand "${createdBrand.name}" created successfully!`);
      setBrandDialogOpen(false);
      setNewBrandName('');
      setNewBrandDesc('');
    } catch (err: any) {
      console.error('Create brand error:', err);
      toast.error(err.message || 'Failed to create brand');
    } finally {
      setCreatingBrand(false);
    }
  };

  // Drag and Drop Handlers
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const base64String = reader.result as string;
        const base64Data = base64String.split(',')[1];
        resolve(base64Data);
      };
      reader.onerror = (error) => reject(error);
    });
  };

  const handleFiles = async (fileList: FileList | null) => {
    if (!fileList) return;

    const newFiles: typeof files = [];
    for (let i = 0; i < fileList.length; i++) {
      const file = fileList[i];
      if (file.type.startsWith('image/') || file.type === 'application/pdf') {
        try {
          const base64 = await fileToBase64(file);
          newFiles.push({ file, base64, type: file.type });
        } catch (err) {
          console.error('Error reading file:', err);
          toast.error(`Error reading ${file.name}`);
        }
      } else {
        toast.error(`File ${file.name} is not an image or PDF`);
      }
    }

    setFiles((prev) => [...prev, ...newFiles]);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      await handleFiles(e.dataTransfer.files);
    }
  };

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  // Invoke Gemini API Client-Side
  const startAIAnalysis = async () => {
    if (!apiKey) {
      toast.error('Please enter a Gemini API Key');
      return;
    }
    if (files.length === 0) {
      toast.error('Please upload at least one image or PDF');
      return;
    }

    setIsAnalyzing(true);
    setAnalysisStep('Initializing extraction...');
    setExtractedProducts([]);

    try {
      const results: ExtractedProduct[] = [];

      for (let i = 0; i < files.length; i++) {
        const fileObj = files[i];
        setAnalysisStep(`Processing file ${i + 1} of ${files.length}: "${fileObj.file.name}"...`);

        // Categories helper string to inject in prompt
        const categoriesList = categories
          .map((c) => `- ${c.slug}: ${c.name} (${c.description || 'No description'})`)
          .join('\n');

        const selectedBrand = brands.find((b) => b.id === selectedBrandId);
        const brandName = selectedBrand && selectedBrand.id !== 'none' && selectedBrand.id !== '' ? selectedBrand.name : '';

        const prompt = `You are an expert data entry assistant. Extract a list of products and their full details from the attached catalog page.
Analyze the details carefully.

Rules:
1. STRICT RULE: DO NOT extract any prices. Do NOT search for or include price display fields. Keep all price fields empty or null.
2. BRAND NAME INTEGRATION: The brand name is "${brandName}". You MUST prepend the brand name to each product's Name (e.g., "${brandName} 1/2\" Square Drive Deep Sockets" or "${brandName} Torque Wrenches Standard Type").
3. NAME CLEANING: Do NOT include catalog index prefixes or codes (such as "8. (A)", "8. (B)", "9. (A)", etc.) in the product Name.
4. TECHNICAL DETAILS RULE: Tailor the specifications keys to the product's type. You MUST extract relevant technical details based on the product type:
   * For Sockets & Wrenches: Extract keys like 'Drive Size', 'Material', 'Finish', 'Standard', 'Torque Range'.
   * For Pipe Wrenches: Extract keys like 'Length Range', 'Max Opening', 'Suitable Pipe Sizes', 'Material'.
   * For Hammers: Extract keys like 'Weight Range', 'Handle Material', 'Standard'.
   * Always include 'HSN Code' and 'Design No.' if they are mentioned anywhere on the page or table.
5. GROUPING RULE: Do not list each individual size or row of variant tables as a separate product. Instead, group all variants under their main product headers.
6. DESCRIPTION LAYOUT FORMAT: The description MUST contain:
   * A brief paragraph summarizing the product.
   * Two literal newline characters (\\n\\n) followed by the heading "Available Sizes:" or similar.
   * A newline character (\\n) followed by bulleted items (starting with bullet symbol •) on separate lines (each line separated by \\n).
   Example of description text value:
   "Professional-grade standard type torque wrenches designed for accurate torque application.\\n\\nAvailable Sizes:\\n• TW 100: 1/2\\" Drive, 20 - 100 Lb. Ft.\\n• TW 160: 1/2\\" Drive, 35 - 160 Lb. Ft."
7. SPECIFICATIONS: Extract general technical specifications. Do NOT leave this array empty. Populate it with relevant keys (e.g. 'HSN Code', 'Design No.', 'Standard', 'Material', 'Finish', 'Drive Size', etc.) as found in the catalog content.

Return the data matching the schema requested.`;

        const requestBody = {
          contents: [
            {
              parts: [
                { text: prompt },
                {
                  inlineData: {
                    mimeType: fileObj.type,
                    data: fileObj.base64
                  }
                }
              ]
            }
          ],
          generationConfig: {
            responseMimeType: "application/json",
            responseSchema: {
              type: "OBJECT",
              properties: {
                products: {
                  type: "ARRAY",
                  items: {
                    type: "OBJECT",
                    properties: {
                      name: { type: "STRING", description: `Name of the main product group prepended with the brand name. Since the brand is "${brandName}", prepend it, e.g., "${brandName} Torque Wrenches Standard Type". Do not include catalog indices like 8.(A).` },
                      sku: { type: "STRING", description: "Base SKU or model range, e.g., 'TW 100 - TW 2000' or '1271 - 1277' or 'WH 110 B - WH 800 B/C'." },
                      description: { type: "STRING", description: "A summary paragraph, followed by two literal newline characters (\\n\\n) and a header 'Available Sizes:', followed by bulleted items (each starting with a bullet symbol • on its own line separated by a literal newline \\n). Ensure to include actual \\n character escapes for formatting." },
                      category_slug_match: { type: "STRING", description: "The matching category slug from the provided list, e.g., 'hand-tools'" },
                      specifications: {
                        type: "ARRAY",
                        description: "List of general technical specs like HSN Code, Design No., Standard, Material, Finish, etc., extracted from the page. You MUST extract these keys if present. Do not put individual sizes here.",
                        items: {
                          type: "OBJECT",
                          properties: {
                            key: { type: "STRING", description: "The specification key, e.g., 'HSN Code', 'Design No.', 'Standard', 'Material', 'Finish'" },
                            value: { type: "STRING", description: "The specification value, e.g., '82041220', '161772', 'IS 4003 (Part II) 2026', 'Chrome Vanadium Steel'" }
                          },
                          required: ["key", "value"]
                        }
                      },
                      image_box: {
                        type: "OBJECT",
                        properties: {
                          ymin: { type: "NUMBER" },
                          xmin: { type: "NUMBER" },
                          ymax: { type: "NUMBER" },
                          xmax: { type: "NUMBER" }
                        },
                        required: ["ymin", "xmin", "ymax", "xmax"],
                        description: "Normalized bounding box coordinates (0 to 100) of the illustration image for this product."
                      }
                    },
                    required: ["name", "sku", "description", "category_slug_match"]
                  }
                }
              },
              required: ["products"]
            }
          }
        };

        const response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/${selectedModel}:generateContent?key=${apiKey}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(requestBody)
          }
        );

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.error?.message || `Gemini API returned status ${response.status}`);
        }

        const data = await response.json();
        const textContent = data.candidates?.[0]?.content?.parts?.[0]?.text;

        if (!textContent) {
          throw new Error('Gemini API returned an empty response');
        }

        const parsed = JSON.parse(textContent);
        if (parsed.products && Array.isArray(parsed.products)) {
          const fileProducts: ExtractedProduct[] = [];

          parsed.products.forEach((prod: any, index: number) => {
            fileProducts.push({
              id: `${i}-${index}-${Date.now()}`,
              name: prod.name || '',
              sku: prod.sku || '',
              description: (prod.description || '').replace(/\\n/g, '\n'),
              category_slug_match: prod.category_slug_match || '',
              specifications: prod.specifications || [],
              images: [],
              status: 'pending',
              selected: true,
              image_box: prod.image_box || null
            });
          });

          // Crop and upload images for these products
          if (fileObj.type.startsWith('image/')) {
            for (let idx = 0; idx < fileProducts.length; idx++) {
              const prod = fileProducts[idx];
              if (prod.image_box) {
                try {
                  setAnalysisStep(`Cropping image for: ${prod.name}...`);
                  const blob = await cropImageToSquare(fileObj.base64, fileObj.type, prod.image_box);

                  const fileExt = fileObj.type.split('/')[1] || 'jpg';
                  const fileName = `cropped-${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
                  
                  const croppedFile = new File([blob], fileName, { type: fileObj.type });
                  const publicUrl = await uploadImage(croppedFile, 'product-images', 'bulk-import');

                  prod.images = [publicUrl];
                } catch (cropErr) {
                  console.error(`Error auto-cropping for ${prod.name}:`, cropErr);
                }
              }
            }
          }

          results.push(...fileProducts);
        }
      }

      setExtractedProducts(results);
      toast.success(`AI successfully extracted ${results.length} products!`);
    } catch (err: any) {
      console.error('AI analysis error:', err);
      toast.error(`Analysis failed: ${err.message}`);
    } finally {
      setIsAnalyzing(false);
      setAnalysisStep('');
    }
  };

  // Individual Row Actions
  const handleUpdateProduct = (id: string, field: keyof ExtractedProduct, val: any) => {
    setExtractedProducts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, [field]: val } : p))
    );
  };

  const handleUpdateSpec = (prodId: string, specIndex: number, field: 'key' | 'value', val: string) => {
    setExtractedProducts((prev) =>
      prev.map((p) => {
        if (p.id !== prodId) return p;
        const newSpecs = [...p.specifications];
        newSpecs[specIndex][field] = val;
        return { ...p, specifications: newSpecs };
      })
    );
  };

  const handleAddSpec = (prodId: string) => {
    setExtractedProducts((prev) =>
      prev.map((p) => {
        if (p.id !== prodId) return p;
        return { ...p, specifications: [...p.specifications, { key: '', value: '' }] };
      })
    );
  };

  const handleRemoveSpec = (prodId: string, specIndex: number) => {
    setExtractedProducts((prev) =>
      prev.map((p) => {
        if (p.id !== prodId) return p;
        return { ...p, specifications: p.specifications.filter((_, i) => i !== specIndex) };
      })
    );
  };

  const handleRowImageUpload = async (prodId: string, filesList: FileList | null) => {
    if (!filesList || filesList.length === 0) return;

    toast.loading('Uploading product image...', { id: 'image-upload' });
    try {
      const file = filesList[0];
      const publicUrl = await uploadImage(file, 'product-images', 'bulk-import');

      setExtractedProducts((prev) =>
        prev.map((p) => {
          if (p.id !== prodId) return p;
          return { ...p, images: [...p.images, publicUrl] };
        })
      );

      toast.success('Product image uploaded!', { id: 'image-upload' });
    } catch (err: any) {
      console.error('Row image upload error:', err);
      toast.error(`Image upload failed: ${err.message}`, { id: 'image-upload' });
    }
  };

  const handleRowImagePaste = async (prodId: string) => {
    try {
      const clipboardItems = await navigator.clipboard.read();
      for (const item of clipboardItems) {
        for (const type of item.types) {
          if (type.startsWith('image/')) {
            const blob = await item.getType(type);
            const file = new File([blob], `pasted-image-${Date.now()}.${type.split('/')[1] || 'png'}`, { type });

            toast.loading('Uploading pasted image...', { id: 'image-paste' });
            const publicUrl = await uploadImage(file, 'product-images', 'bulk-import');

            setExtractedProducts((prev) =>
              prev.map((p) => {
                if (p.id !== prodId) return p;
                return { ...p, images: [...p.images, publicUrl] };
              })
            );

            toast.success('Pasted image uploaded successfully!', { id: 'image-paste' });
            return;
          }
        }
      }
      toast.error('No image found in clipboard. Please copy an image first.');
    } catch (err: any) {
      console.error('Clipboard paste failed:', err);
      toast.error('Failed to read clipboard. Please ensure clipboard access is granted.');
    }
  };

  const removeRowImage = (prodId: string, imageIndex: number) => {
    setExtractedProducts((prev) =>
      prev.map((p) => {
        if (p.id !== prodId) return p;
        return { ...p, images: p.images.filter((_, i) => i !== imageIndex) };
      })
    );
  };

  // Bulk Insert into Supabase
  const handleBulkInsert = async () => {
    const selectedProds = extractedProducts.filter((p) => p.selected);
    if (selectedProds.length === 0) {
      toast.error('No products selected for import');
      return;
    }

    setIsSaving(true);
    setSaveProgress({ current: 0, total: selectedProds.length });
    const successfullySavedIds: string[] = [];

    const supabase = createClient();

    for (let i = 0; i < selectedProds.length; i++) {
      const prod = selectedProds[i];
      setSaveProgress({ current: i + 1, total: selectedProds.length });

      // Update state to show saving
      setExtractedProducts((prev) =>
        prev.map((p) => (p.id === prod.id ? { ...p, status: 'saving' } : p))
      );

      try {
        // Resolve brand id
        const brandId = selectedBrandId || null;

        // Resolve category id
        let categoryId: string | null = null;
        if (selectedCategoryId === 'ai-detect') {
          const matchedCategory = categories.find((c) => c.slug === prod.category_slug_match);
          categoryId = matchedCategory ? matchedCategory.id : null;
        } else if (selectedCategoryId && selectedCategoryId !== 'none') {
          categoryId = selectedCategoryId;
        }

        // Format specifications
        const specifications: Record<string, string> = {};
        prod.specifications.forEach((s) => {
          if (s.key.trim()) specifications[s.key.trim()] = s.value.trim();
        });

        // Unique Slug Generation
        let slug = toSlug(prod.sku ? `${prod.name} ${prod.sku}` : prod.name);

        // Ensure slug uniqueness
        const { data: slugCheck } = await supabase
          .from('products')
          .select('id')
          .eq('slug', slug)
          .maybeSingle();

        if (slugCheck) {
          slug = `${slug}-${Math.floor(Math.random() * 1000)}`;
        }

        const insertPayload = {
          name: prod.name.trim(),
          slug,
          sku: prod.sku.trim() || null,
          description: prod.description.trim() || null,
          price_display: null, // Always empty/null as requested
          specifications: Object.keys(specifications).length ? specifications : null,
          brand_id: brandId,
          category_id: categoryId,
          images: prod.images,
          primary_image_url: prod.images[0] || null,
          is_featured: false,
          is_available: true,
        };

        const { data, error } = await supabase
          .from('products')
          .insert(insertPayload)
          .select('id')
          .single();

        if (error) throw error;

        successfullySavedIds.push(data.id);

        // Update state to saved
        setExtractedProducts((prev) =>
          prev.map((p) => (p.id === prod.id ? { ...p, status: 'saved' } : p))
        );
      } catch (err: any) {
        console.error(`Error saving product "${prod.name}":`, err);
        setExtractedProducts((prev) =>
          prev.map((p) =>
            p.id === prod.id ? { ...p, status: 'error', errorMessage: err.message || 'Failed to insert' } : p
          )
        );
      }
    }

    setImportedProductIds(successfullySavedIds);
    setHasImported(true);
    setIsSaving(false);

    if (successfullySavedIds.length === selectedProds.length) {
      toast.success(`Successfully imported all ${successfullySavedIds.length} products!`);
    } else {
      toast.warning(
        `Import complete: ${successfullySavedIds.length} succeeded, ${selectedProds.length - successfullySavedIds.length
        } failed.`
      );
    }
  };

  // Undo Import Action
  const handleUndoImport = async () => {
    if (importedProductIds.length === 0) return;

    toast.loading('Undoing import...', { id: 'undo-import' });
    try {
      const supabase = createClient();
      const { error } = await supabase.from('products').delete().in('id', importedProductIds);

      if (error) throw error;

      // Restore states
      setExtractedProducts((prev) =>
        prev.map((p) => {
          if (p.status === 'saved') {
            return { ...p, status: 'pending' };
          }
          return p;
        })
      );
      setImportedProductIds([]);
      setHasImported(false);
      toast.success('Import undone! Products removed and restored to list.', { id: 'undo-import' });
    } catch (err: any) {
      console.error('Undo import error:', err);
      toast.error(`Undo failed: ${err.message}`, { id: 'undo-import' });
    }
  };

  return (
    <div className="mx-auto max-w-6xl space-y-6 pb-20">
      {/* Navigation */}
      <div className="flex items-center justify-between">
        <Link
          href="/admin/products"
          className="inline-flex items-center gap-1 text-sm text-text-muted hover:text-navy transition-colors"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Products
        </Link>
        {hasImported && importedProductIds.length > 0 && (
          <Button
            onClick={handleUndoImport}
            variant="outline"
            className="border-red-200 text-red-600 hover:bg-red-50 flex items-center gap-1.5"
          >
            <Undo2 className="h-4 w-4" /> Undo Last Import ({importedProductIds.length} items)
          </Button>
        )}
      </div>

      {/* Header */}
      <div className="flex flex-col gap-1">
        <h1 className="font-[var(--font-heading)] text-3xl font-extrabold text-text-dark flex items-center gap-2">
          <Sparkles className="h-7 w-7 text-navy" /> AI Catalog Bulk Importer
        </h1>
        <p className="text-sm text-text-muted">
          Upload scan/images or PDF pages of catalogs to extract product details, edit them, and insert into database. Prices are automatically skipped.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Config Card */}
        <Card className="border-border-light shadow-sm bg-white">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-bold text-navy">Importer Config</CardTitle>
            <CardDescription className="text-xs">Setup Gemini API key and default mappings.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Gemini Key */}
            <div className="space-y-2">
              <Label htmlFor="gemini-key" className="text-xs font-semibold flex items-center justify-between">
                <span>Gemini API Key</span>
                <button
                  onClick={() => setShowKey(!showKey)}
                  className="text-[10px] text-text-muted hover:text-navy"
                >
                  {showKey ? <EyeOff className="h-3 w-3 inline" /> : <Eye className="h-3 w-3 inline" />} {showKey ? 'Hide' : 'Show'}
                </button>
              </Label>
              <Input
                id="gemini-key"
                type={showKey ? 'text' : 'password'}
                placeholder="AIzaSy..."
                value={apiKey}
                onChange={(e) => handleApiKeyChange(e.target.value)}
                className="h-9 text-xs"
              />
              <p className="text-[10px] text-text-muted">
                Stored securely in your local browser storage.
              </p>
            </div>

            <div className="space-y-2">
              <Label className="text-xs font-semibold">Gemini Model</Label>
              <Select value={selectedModel} onValueChange={(val) => setSelectedModel(val || 'gemini-2.5-flash')}>
                <SelectTrigger className="h-9 text-xs">
                  <SelectValue placeholder="Select model" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="gemini-2.5-flash">Gemini 2.5 Flash (Fastest)</SelectItem>
                  <SelectItem value="gemini-2.5-pro">Gemini 2.5 Pro (Detailed)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Brand Selector */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-xs font-semibold">Target Brand (Global)</Label>
                {/* Create brand trigger */}
                <Dialog open={brandDialogOpen} onOpenChange={setBrandDialogOpen}>
                  <DialogTrigger render={
                    <button className="text-[10px] text-navy font-bold hover:underline flex items-center gap-0.5">
                      <Plus className="h-2.5 w-2.5" /> Add Brand
                    </button>
                  } />
                  <DialogContent className="sm:max-w-[425px]">
                    <form onSubmit={handleCreateBrand}>
                      <DialogHeader>
                        <DialogTitle>Add New Brand</DialogTitle>
                        <DialogDescription>
                          Create a brand in the database (e.g. Taparia) before importing products.
                        </DialogDescription>
                      </DialogHeader>
                      <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                          <Label htmlFor="brand-name">Brand Name</Label>
                          <Input
                            id="brand-name"
                            value={newBrandName}
                            onChange={(e) => setNewBrandName(e.target.value)}
                            placeholder="e.g. Taparia"
                            required
                          />
                        </div>
                        <div className="grid gap-2">
                          <Label htmlFor="brand-desc">Description</Label>
                          <Textarea
                            id="brand-desc"
                            value={newBrandDesc}
                            onChange={(e) => setNewBrandDesc(e.target.value)}
                            placeholder="Brief description about the brand..."
                          />
                        </div>
                      </div>
                      <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => setBrandDialogOpen(false)}>
                          Cancel
                        </Button>
                        <Button type="submit" className="bg-navy hover:bg-navy-light text-white" disabled={creatingBrand}>
                          {creatingBrand ? 'Creating...' : 'Create Brand'}
                        </Button>
                      </DialogFooter>
                    </form>
                  </DialogContent>
                </Dialog>
              </div>
              {loadingDb ? (
                <div className="h-9 border border-input rounded-md animate-pulse bg-gray-50 flex items-center px-3">
                  <Loader2 className="h-4 w-4 animate-spin text-text-muted" />
                </div>
              ) : (
                <Select value={selectedBrandId} onValueChange={(val) => setSelectedBrandId(val || '')}>
                  <SelectTrigger className="h-9 text-xs">
                    <SelectValue placeholder="Select target brand" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">No brand</SelectItem>
                    {brands.map((b) => (
                      <SelectItem key={b.id} value={b.id}>
                        {b.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>

            {/* Category Override */}
            <div className="space-y-2">
              <Label className="text-xs font-semibold">Target Category</Label>
              {loadingDb ? (
                <div className="h-9 border border-input rounded-md animate-pulse bg-gray-50 flex items-center px-3">
                  <Loader2 className="h-4 w-4 animate-spin text-text-muted" />
                </div>
              ) : (
                <Select value={selectedCategoryId} onValueChange={(val) => handleGlobalCategoryChange(val || 'ai-detect')}>
                  <SelectTrigger className="h-9 text-xs">
                    <SelectValue placeholder="AI Match / Default override" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ai-detect">🤖 Match Automatically via AI</SelectItem>
                    <SelectItem value="none">No category</SelectItem>
                    {categories.map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
              <p className="text-[10px] text-text-muted">
                Choose a specific category to override AI matching and assign to all products.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Files List Card */}
        <Card className="border-border-light shadow-sm bg-white">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-bold text-navy">Files to Analyze</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Dropzone */}
            <div
              onDragEnter={handleDrag}
              onDragOver={handleDrag}
              onDragLeave={handleDrag}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all duration-200 ${dragActive
                  ? 'border-navy bg-navy/5 scale-[0.99]'
                  : 'border-border-light bg-bg-light hover:border-navy/40 hover:bg-navy/[0.01]'
                }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept="image/*,application/pdf"
                className="hidden"
                onChange={(e) => handleFiles(e.target.files)}
              />
              <Upload className="mx-auto h-8 w-8 text-text-muted mb-2 animate-pulse" />
              <p className="text-xs font-semibold text-text-dark">Drag & Drop Catalog Pages</p>
              <p className="text-[10px] text-text-muted mt-1">Accepts Images (JPG, PNG, WebP) and PDF</p>
            </div>

            {/* Files Table List */}
            {files.length > 0 && (
              <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                {files.map((fileObj, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-2 rounded-lg border border-border-light text-xs bg-bg-light/50"
                  >
                    <div className="flex items-center gap-2 truncate pr-2">
                      {fileObj.type === 'application/pdf' ? (
                        <FileText className="h-4 w-4 text-orange shrink-0" />
                      ) : (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={`data:${fileObj.type};base64,${fileObj.base64}`}
                          alt={fileObj.file.name}
                          className="h-6 w-6 rounded object-cover shrink-0 border"
                        />
                      )}
                      <span className="truncate font-medium text-text-dark">{fileObj.file.name}</span>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        removeFile(idx);
                      }}
                      className="text-red-500 hover:text-red-700 p-1 hover:bg-red-50 rounded"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Action Button */}
            <Button
              onClick={startAIAnalysis}
              disabled={isAnalyzing || files.length === 0 || !apiKey}
              className="w-full bg-navy hover:bg-navy-light text-white font-semibold flex items-center justify-center gap-1.5 h-10"
            >
              {isAnalyzing ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Analyzing...</span>
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" />
                  <span>Extract with AI ({files.length} pages)</span>
                </>
              )}
            </Button>

            {isAnalyzing && (
              <p className="text-[10px] text-navy font-medium text-center animate-pulse">
                {analysisStep}
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Full-width Review Table & Submit */}
      <div className="w-full space-y-6 mt-6">
        {extractedProducts.length === 0 ? (
          <Card className="border-border-light shadow-sm bg-white h-full flex flex-col justify-center items-center p-12 text-center">
            <Sparkles className="h-12 w-12 text-border-light mb-4" />
            <CardTitle className="text-lg text-text-dark font-bold">No Extracted Products Yet</CardTitle>
            <CardDescription className="max-w-md mt-2">
              Configure your API key and default brand on the left, upload catalog scans or PDF pages, and run the AI extraction. The extracted product records will appear here for review.
            </CardDescription>
          </Card>
        ) : (
          <Card className="border-border-light shadow-sm bg-white">
            <CardHeader className="pb-3 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-base font-bold text-navy">Review Extracted Products</CardTitle>
                <CardDescription className="text-xs">
                  Configure names, SKUs, and specifications before committing to database. All prices are omitted.
                </CardDescription>
              </div>
              {/* Total Selection Info */}
              <div className="text-xs bg-bg-light border border-border-light px-3 py-1.5 rounded-lg text-text-dark font-medium">
                Selected: {extractedProducts.filter((p) => p.selected).length} / {extractedProducts.length}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Bulk Actions */}
              <div className="flex gap-2 justify-end">
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-xs font-semibold text-text-muted hover:text-navy hover:bg-navy/5"
                  onClick={() => setExtractedProducts((prev) => prev.map((p) => ({ ...p, selected: true })))}
                >
                  Select All
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-xs font-semibold text-text-muted hover:text-red-500 hover:bg-red-50"
                  onClick={() => setExtractedProducts((prev) => prev.map((p) => ({ ...p, selected: false })))}
                >
                  Deselect All
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-xs font-semibold text-red-500 hover:text-red-600 hover:bg-red-50 flex items-center gap-1"
                  onClick={() => {
                    if (confirm("Are you sure you want to clear the entire table? This will delete all unsaved extracted products.")) {
                      setExtractedProducts([]);
                    }
                  }}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  <span>Clear Table</span>
                </Button>
              </div>

              {/* Main Table */}
              <div className="border border-border-light rounded-xl overflow-auto max-h-[600px] shadow-xs">
                <Table className="text-xs border-collapse">
                  <TableHeader className="bg-bg-light/60 sticky top-0 z-10 select-none">
                    <TableRow>
                      <TableHead className="w-[40px] text-center"></TableHead>
                      <TableHead className="min-w-[200px]">Product Name</TableHead>
                      <TableHead className="w-[120px]">SKU / Model</TableHead>
                      <TableHead className="w-[145px]">Category</TableHead>
                      <TableHead className="w-[110px] text-center">Product Photo</TableHead>
                      <TableHead className="min-w-[340px]">Specs & Details</TableHead>
                      <TableHead className="w-[95px] text-center">Status</TableHead>
                      <TableHead className="w-[50px]"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {extractedProducts.map((prod) => (
                      <TableRow 
                        key={prod.id} 
                        className={prod.selected 
                          ? 'bg-navy/[0.01] hover:bg-navy/[0.03] transition-colors border-b border-border-light/80' 
                          : 'opacity-70 bg-gray-50/20 hover:bg-gray-50/40 transition-colors border-b border-border-light/80'
                        }
                      >
                        {/* Selection Checkbox */}
                        <TableCell className="text-center p-3 align-top pt-4">
                          <input
                            type="checkbox"
                            checked={prod.selected}
                            onChange={(e) => handleUpdateProduct(prod.id, 'selected', e.target.checked)}
                            className="rounded border-gray-300 text-navy focus:ring-navy h-4 w-4 cursor-pointer"
                          />
                        </TableCell>

                        {/* Product Name */}
                        <TableCell className="p-3 align-top pt-3.5">
                          <Input
                            value={prod.name}
                            onChange={(e) => handleUpdateProduct(prod.id, 'name', e.target.value)}
                            className="text-xs font-semibold bg-white border-border-light focus-visible:ring-navy/20 focus-visible:border-navy/50 w-full"
                            placeholder="e.g. Taparia Spanner"
                          />
                        </TableCell>

                        {/* SKU */}
                        <TableCell className="p-3 align-top pt-3.5">
                          <Input
                            value={prod.sku}
                            onChange={(e) => handleUpdateProduct(prod.id, 'sku', e.target.value)}
                            className="text-xs bg-white font-mono border-border-light focus-visible:ring-navy/20 focus-visible:border-navy/50 w-full"
                            placeholder="e.g. DEP 6-7"
                          />
                        </TableCell>

                        {/* Category Selector */}
                        <TableCell className="p-3 align-top pt-3.5">
                          <Select
                            value={prod.category_slug_match || 'none'}
                            onValueChange={(v) => handleUpdateProduct(prod.id, 'category_slug_match', v === 'none' || v === null ? '' : v)}
                          >
                            <SelectTrigger className="text-xs bg-white border-border-light focus:ring-navy/20 focus:border-navy/50 w-full">
                              <SelectValue placeholder="Unmapped" />
                            </SelectTrigger>
                            <SelectContent className="text-xs">
                              <SelectItem value="none">No category</SelectItem>
                              {categories.map((c) => (
                                <SelectItem key={c.id} value={c.slug}>
                                  {c.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </TableCell>

                        {/* Images Column */}
                        <TableCell className="p-3 align-top text-center">
                          <div className="flex flex-col items-center gap-2">
                            {/* Preview uploaded images */}
                            {prod.images.length > 0 ? (
                              <div className="flex flex-wrap gap-1.5 justify-center">
                                {prod.images.map((img, idx) => (
                                  <div key={idx} className="relative group h-20 w-20 rounded-lg border border-border-light overflow-hidden bg-gray-50 shrink-0 shadow-sm transition-transform hover:scale-105">
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    <img src={img} alt="Product preview" className="h-full w-full object-contain" />
                                    <button
                                      onClick={() => removeRowImage(prod.id, idx)}
                                      className="absolute inset-0 bg-red-600/80 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                                      title="Remove image"
                                    >
                                      <Trash2 className="h-4 w-4" />
                                    </button>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              /* Placeholder when no image exists */
                              <div className="h-20 w-20 rounded-lg border border-dashed border-border-light bg-gray-50/50 flex flex-col items-center justify-center text-text-muted/40 shrink-0">
                                <span className="text-[10px] font-medium">No Image</span>
                              </div>
                            )}

                            {/* Upload and Paste button container */}
                            <div className="flex flex-col gap-1 w-20">
                              <label className="w-full border border-border-light hover:border-navy/40 rounded px-1.5 py-1 flex items-center justify-center gap-1 cursor-pointer bg-white text-[10px] font-bold text-text-dark hover:bg-gray-50 transition-colors h-7 shadow-xs">
                                <Upload className="h-3 w-3 shrink-0 text-text-muted" />
                                <span>Upload</span>
                                <input
                                  type="file"
                                  accept="image/*"
                                  className="hidden"
                                  onChange={(e) => handleRowImageUpload(prod.id, e.target.files)}
                                />
                              </label>
                              <button
                                type="button"
                                onClick={() => handleRowImagePaste(prod.id)}
                                className="w-full border border-border-light hover:border-navy/40 rounded px-1.5 py-1 flex items-center justify-center gap-1 cursor-pointer bg-white text-[10px] font-bold text-text-dark hover:bg-gray-50 transition-colors h-7 shadow-xs"
                              >
                                <Sparkles className="h-3 w-3 shrink-0 text-navy" />
                                <span>Paste</span>
                              </button>
                            </div>
                          </div>
                        </TableCell>

                        {/* Specs & description */}
                        <TableCell className="p-3 pb-5 align-top space-y-3">
                          {/* Description textarea */}
                          <div className="space-y-1">
                            <span className="text-[10px] font-bold text-text-muted">Description Summary</span>
                            <Textarea
                              value={prod.description}
                              onChange={(e) => handleUpdateProduct(prod.id, 'description', e.target.value)}
                              rows={5}
                              className="text-xs bg-white border-border-light min-h-[100px] p-2 leading-relaxed font-sans focus-visible:ring-navy/20 focus-visible:border-navy/50 w-full resize-y"
                              placeholder="Product description summary..."
                            />
                          </div>

                          {/* Specifications tags */}
                          <div className="space-y-1.5 pt-1.5 border-t border-gray-100">
                            <div className="flex items-center justify-between text-[10px] text-text-muted font-bold">
                              <span>Technical Specifications ({prod.specifications.length})</span>
                              <button
                                type="button"
                                onClick={() => handleAddSpec(prod.id)}
                                className="text-navy hover:text-navy-light hover:underline flex items-center gap-0.5 font-bold"
                              >
                                + Add Spec
                              </button>
                            </div>
                            <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                              {prod.specifications.map((spec, specIdx) => (
                                <div key={specIdx} className="flex gap-1 items-center">
                                  <Input
                                    value={spec.key}
                                    onChange={(e) => handleUpdateSpec(prod.id, specIdx, 'key', e.target.value)}
                                    placeholder="Spec Key"
                                    className="h-7 text-[10px] px-2 py-1 w-[90px] bg-white border-border-light shrink-0 font-medium focus-visible:ring-navy/20 focus-visible:border-navy/50"
                                  />
                                  <span className="text-text-muted text-xs">:</span>
                                  <Input
                                    value={spec.value}
                                    onChange={(e) => handleUpdateSpec(prod.id, specIdx, 'value', e.target.value)}
                                    placeholder="Value"
                                    className="h-7 text-[10px] px-2 py-1 flex-1 bg-white border-border-light focus-visible:ring-navy/20 focus-visible:border-navy/50"
                                  />
                                  <button
                                    type="button"
                                    onClick={() => handleRemoveSpec(prod.id, specIdx)}
                                    className="text-red-500 p-1 hover:bg-red-50 rounded shrink-0 transition-colors"
                                    title="Delete specification"
                                  >
                                    <Trash2 className="h-3.5 w-3.5" />
                                  </button>
                                </div>
                              ))}
                              {prod.specifications.length === 0 && (
                                <div className="text-[10px] text-text-muted/60 italic text-center py-1">
                                  No technical specifications extracted.
                                </div>
                              )}
                            </div>
                          </div>
                        </TableCell>

                        {/* Status */}
                        <TableCell className="p-3 text-center align-top pt-4">
                          {prod.status === 'pending' && (
                            <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-bold bg-gray-100 text-gray-600 border border-gray-200">
                              Pending
                            </span>
                          )}
                          {prod.status === 'saving' && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-navy/10 text-navy border border-navy/20 animate-pulse">
                              <Loader2 className="h-2.5 w-2.5 animate-spin" /> Saving
                            </span>
                          )}
                          {prod.status === 'saved' && (
                            <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-[10px] font-bold bg-green-100 text-green-700 border border-green-200">
                              <CheckCircle className="h-2.5 w-2.5 shrink-0" /> Saved
                            </span>
                          )}
                          {prod.status === 'error' && (
                            <span
                              title={prod.errorMessage}
                              className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-100 text-red-700 border border-red-200 cursor-help"
                            >
                              <AlertCircle className="h-2.5 w-2.5 shrink-0" /> Error
                            </span>
                          )}
                        </TableCell>

                        {/* Row Deletion */}
                        <TableCell className="p-3 text-center align-top pt-4">
                          <button
                            onClick={() => setExtractedProducts((prev) => prev.filter((p) => p.id !== prod.id))}
                            className="text-red-500 hover:text-red-700 p-1.5 hover:bg-red-50 rounded-lg transition-colors border border-transparent hover:border-red-200"
                            title="Remove row"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Save Execution Button */}
              <div className="pt-2 flex justify-between items-center">
                <div className="text-xs text-text-muted">
                  {isSaving && (
                    <span className="font-semibold text-navy animate-pulse">
                      Saving product {saveProgress.current} of {saveProgress.total}...
                    </span>
                  )}
                </div>
                <Button
                  onClick={handleBulkInsert}
                  disabled={isSaving || extractedProducts.filter((p) => p.selected).length === 0}
                  className="bg-navy hover:bg-navy-light text-white font-bold h-10 px-6 shadow"
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      <span>Saving ({saveProgress.current}/{saveProgress.total})</span>
                    </>
                  ) : (
                    <span>Save Selected Products ({extractedProducts.filter((p) => p.selected).length})</span>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
