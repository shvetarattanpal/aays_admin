"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Plus } from "lucide-react";
import Loader from "@/components/custom-ui/Loader";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { DataTable } from "@/components/custom-ui/DataTable";
import { columns } from "@/components/products/ProductColumns";
import { ProductType } from "@/lib/types";

const Products = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState<ProductType[]>([]);

  const getProducts = async () => {
    try {
      const res = await fetch("/api/products", { method: "GET" });
      if (!res.ok) {
        throw new Error(`API Error: ${res.status} - ${res.statusText}`);
      }
      const data = await res.json();
      setProducts(data || []);
    } catch (err) {
      console.error("[products_GET]", err);
    } finally {
      setLoading(false);
    }
  };  

  useEffect(() => {
    getProducts();
  }, []);

  return loading ? (
    <Loader />
  ) : (
    <div className="px-10 py-5">
      <div className="flex items-center justify-between">
        <p className="text-heading2-bold">Products</p>
        <Button
          className="bg-blue-1 text-white"
          onClick={() => router.push("/products/new")}
        >
          <Plus className="h-4 w-4 mr-2" />
          Create Product
        </Button>
      </div>
      <Separator className="bg-grey-1 my-4" />
      {products.length > 0 ? (
        <DataTable columns={columns} data={products} searchKey="title" />
      ) : (
        <p className="text-body-bold text-center mt-4">No products found.</p>
      )}
    </div>
  );
};

export default Products;