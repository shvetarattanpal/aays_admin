"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

import { Separator } from "../ui/separator";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "../ui/textarea";
import ImageUpload from "../custom-ui/ImageUpload";
import Delete from "../custom-ui/Delete";
import MultiText from "../custom-ui/MultiText";
import MultiSelect from "../custom-ui/MultiSelect";
import Loader from "../custom-ui/Loader";
import { CollectionType, ProductType } from "@/lib/types";

const formSchema = z.object({
  title: z.string().min(2).max(50),
  description: z.string().min(2).max(500).trim(),
  media: z.array(z.string()),
  imageUrl: z.string().min(1, "Image URL is required"),
  category: z.string().min(1, "Category is required"),
  subCategory: z.string().min(1, "SubCategory is required"),
  collections: z.array(z.string()),
  tags: z.array(z.string()),
  sizes: z.array(z.string()),
  colors: z.array(z.string()),
  price: z.coerce.number().min(0.1),
  expense: z.coerce.number().min(0.1),
});

const categoryToSubCategories: Record<string, string[]> = {
  Men: [
    "Shorts",
    "Shirts",
    "T-Shirts",
    "Tanks",
    "Pants/Jeans",
    "Joggers",
    "Trackpants",
    "Tracksuits",
    "Gym Tshirts",
    "Night Suits",
    "Jackets",
    "Sweatshirts",
    "Sweaters",
    "Gym Bottomwear",
    "Coats",
    "Blazers",
  ],
  Women: [
    "Tops",
    "Dresses",
    "Shorts/Skirt",
    "Shirts",
    "T-Shirts",
    "Jumpsuits",
    "Leggings",
    "Joggers/Pants/Jeans",
    "Night Suits",
    "Sports Bottomwear",
    "Sports Topwear",
    "Top & Bottom Sets",
    "Jackets",
    "Sweatshirts",
    "Sweaters",
    "Capes/Shrug/Ponchos",
    "Coats",
    "Blazers/Waistcoats",
  ],
};

interface ProductFormProps {
  initialData?: ProductType | null;
}

const ProductForm: React.FC<ProductFormProps> = ({ initialData }) => {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [collections, setCollections] = useState<CollectionType[]>([]);

  const getCollections = async () => {
    try {
      const res = await fetch("/api/collections", {
        method: "GET",
      });
      const data = await res.json();
      setCollections(data);
      setLoading(false);
    } catch (err) {
      console.log("[collections_GET]", err);
      toast.error("Something went wrong! Please try again.");
    }
  };

  const form = useForm<z.infer<typeof formSchema>>({
  resolver: zodResolver(formSchema),
  defaultValues: initialData
    ? {
        ...initialData,
        media: initialData.media || [],
        imageUrl: initialData.imageUrl || initialData.media?.[0] || "",
        collections: initialData.collections?.map((c) => c._id) || [],
      }
    : {
        title: "",
        description: "",
        media: [],
        imageUrl: "",
        category: "",
        subCategory: "",
        collections: [],
        tags: [],
        sizes: [],
        colors: [],
        price: 0.1,
        expense: 0.1,
      },
});

  const selectedCategory = form.watch("category");
  const selectedSubCategory = form.watch("subCategory");

  useEffect(() => {
    if (selectedCategory && categoryToSubCategories[selectedCategory]) {
      const firstSubCategory = categoryToSubCategories[selectedCategory][0];
      if (
        !categoryToSubCategories[selectedCategory].includes(selectedSubCategory)
      ) {
        form.setValue("subCategory", firstSubCategory);
      }
    } else {
      form.setValue("subCategory", "");
    }
  }, [selectedCategory, form]);

  const [images, setImages] = useState<string[]>(form.getValues("media") || []);

useEffect(() => {
  const subscription = form.watch((values) => {
    if (values.media) {
      setImages(values.media as string[]);
    }
  });

  return () => subscription.unsubscribe?.(); // clean up
}, [form]);

  useEffect(() => {
    const getCollections = async () => {
      try {
        const res = await fetch("/api/collections");
        const data = await res.json();
        setCollections(data);
      } catch (err) {
        console.error("[collections_GET]", err);
        toast.error("Failed to fetch collections.");
      } finally {
        setLoading(false);
      }
    };
    getCollections();
  }, []);

  const handleMediaChange = (
    newImages: string[] | ((prev: string[]) => string[])
  ) => {
    setImages((prev) => {
      const updated =
        typeof newImages === "function" ? newImages(prev) : newImages;
      const uniqueImages = Array.from(new Set(updated));
      form.setValue("media", uniqueImages);

      if (!form.getValues("imageUrl") && uniqueImages.length > 0) {
        form.setValue("imageUrl", uniqueImages[0]);
      }

      return uniqueImages;
    });
  };

  const handleRemoveImage = (url: string) => {
    setImages((prev) => {
      const updated = prev.filter((img) => img !== url);
      form.setValue("media", updated);

      if (form.getValues("imageUrl") === url) {
        form.setValue("imageUrl", updated[0] || "");
      }

      return updated;
    });
  };

  const handleKeyPress = (
    e:
      | React.KeyboardEvent<HTMLInputElement>
      | React.KeyboardEvent<HTMLTextAreaElement>
  ) => {
    if (e.key === "Enter") {
      e.preventDefault();
    }
  };

  const onSubmit = async (data: any) => {
    console.log("Submitting product:", data);

    if (!Array.isArray(data.media) || data.media.length === 0) {
      toast.error("Please upload at least one image.");
      return;
    }

    if (!data.imageUrl) {
      data.imageUrl = data.media[0];
    }

    const dedupedMedia = Array.from(new Set(data.media));

    const finalMedia = dedupedMedia.filter((url) => url !== data.imageUrl);
    finalMedia.unshift(data.imageUrl); 

    data.media = finalMedia;

    try {
      setLoading(true);

      const isEditing = !!initialData;
      const url = isEditing
        ? `/api/products/${initialData._id}`
        : "/api/products";
      const method = isEditing ? "PATCH" : "POST";

      console.log("Final data being submitted:", data);

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText);
      }

      toast.success(
        `Product ${isEditing ? "updated" : "created"} successfully!`
      );
      router.push("/products");
    } catch (error) {
      console.error("[ProductForm] Save Error:", error);
      toast.error("Failed to save product.");
    } finally {
      setLoading(false);
    }
  };

  return loading ? (
    <Loader />
  ) : (
    <div className="p-10">
      {initialData ? (
        <div className="flex items-center justify-between">
          <p className="text-heading2-bold">Edit Product</p>
          <Delete id={initialData._id} item="product" />
        </div>
      ) : (
        <p className="text-heading2-bold">Create Product</p>
      )}
      <Separator className="bg-grey-1 mt-4 mb-7" />
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Title</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Title"
                    {...field}
                    onKeyDown={handleKeyPress}
                  />
                </FormControl>
                <FormMessage className="text-red-1" />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Description</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Description"
                    {...field}
                    rows={5}
                    onKeyDown={handleKeyPress}
                  />
                </FormControl>
                <FormMessage className="text-red-1" />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="media"
            render={() => (
              <FormItem>
                <FormLabel>Images</FormLabel>
                <FormControl>
                  <ImageUpload
                    value={images}
                    onChange={handleMediaChange}
                    onRemove={handleRemoveImage}
                  />
                </FormControl>
                <FormMessage className="text-red-1" />
              </FormItem>
            )}
          />

          <div className="md:grid md:grid-cols-3 gap-8">
            <FormField
              control={form.control}
              name="price"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Price ($)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="Price"
                      {...field}
                      onKeyDown={handleKeyPress}
                    />
                  </FormControl>
                  <FormMessage className="text-red-1" />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="expense"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Expense ($)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="Expense"
                      {...field}
                      onKeyDown={handleKeyPress}
                    />
                  </FormControl>
                  <FormMessage className="text-red-1" />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Category</FormLabel>
                  <FormControl>
                    <select {...field} className="border p-2 rounded w-full">
                      <option value="">Select a category</option>
                      {Object.keys(categoryToSubCategories).map((category) => (
                        <option key={category} value={category}>
                          {category}
                        </option>
                      ))}
                    </select>
                  </FormControl>
                  <FormMessage className="text-red-500" />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="subCategory"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>SubCategory</FormLabel>
                  <FormControl>
                    <select
                      {...field}
                      disabled={!selectedCategory}
                      className="border p-2 rounded w-full"
                    >
                      <option value="">Select a subcategory</option>
                      {selectedCategory &&
                        categoryToSubCategories[selectedCategory]?.map(
                          (sub) => (
                            <option key={sub} value={sub}>
                              {sub}
                            </option>
                          )
                        )}
                    </select>
                  </FormControl>
                  <FormMessage className="text-red-500" />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="tags"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tags</FormLabel>
                  <FormControl>
                    <MultiText
                      placeholder="Tags"
                      value={field.value}
                      onChange={(tag) => field.onChange([...field.value, tag])}
                      onRemove={(tagToRemove) =>
                        field.onChange([
                          ...field.value.filter((tag) => tag !== tagToRemove),
                        ])
                      }
                    />
                  </FormControl>
                  <FormMessage className="text-red-1" />
                </FormItem>
              )}
            />
            {collections.length > 0 && (
              <FormField
                control={form.control}
                name="collections"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Collections</FormLabel>
                    <FormControl>
                      <MultiSelect
                        placeholder="Select collections"
                        collections={collections}
                        value={field.value || []}
                        onChange={(updatedValues) => {
                          console.log(
                            "🟢 Updating selected collections:",
                            updatedValues
                          );
                          field.onChange(updatedValues);
                        }}
                        onRemove={(removedValue) => {
                          console.log("❌ Removed collection:", removedValue);
                          field.onChange(
                            field.value.filter((id) => id !== removedValue)
                          );
                        }}
                      />
                    </FormControl>
                    <FormMessage className="text-red-500" />
                  </FormItem>
                )}
              />
            )}

            <FormField
              control={form.control}
              name="colors"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Colors</FormLabel>
                  <FormControl>
                    <MultiText
                      placeholder="Colors"
                      value={field.value}
                      onChange={(color) =>
                        field.onChange([...field.value, color])
                      }
                      onRemove={(colorToRemove) =>
                        field.onChange([
                          ...field.value.filter(
                            (color) => color !== colorToRemove
                          ),
                        ])
                      }
                    />
                  </FormControl>
                  <FormMessage className="text-red-1" />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="sizes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Sizes</FormLabel>
                  <FormControl>
                    <MultiText
                      placeholder="Sizes"
                      value={field.value}
                      onChange={(size) =>
                        field.onChange([...field.value, size])
                      }
                      onRemove={(sizeToRemove) =>
                        field.onChange([
                          ...field.value.filter(
                            (size) => size !== sizeToRemove
                          ),
                        ])
                      }
                    />
                  </FormControl>
                  <FormMessage className="text-red-1" />
                </FormItem>
              )}
            />
          </div>

          <div className="flex gap-10">
            <Button type="submit" className="bg-blue-1 text-white">
              Submit
            </Button>
            <Button
              type="button"
              onClick={() => router.push("/products")}
              className="bg-blue-1 text-white"
            >
              Discard
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
};

export default ProductForm;