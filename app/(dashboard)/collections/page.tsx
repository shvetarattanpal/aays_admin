"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";

import { columns } from "@/components/collections/CollectionColumns";
import { DataTable } from "@/components/custom-ui/DataTable";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import Loader from "@/components/custom-ui/Loader";

const Collections = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [collections, setCollections] = useState([]);

  const getCollections = async () => {
    try {
      const res = await fetch("/api/collections", {
        method: "GET",
        headers: { "Content-Type": "application/json" },
        cache: "no-store", 
      });

      if (!res.ok) {
        throw new Error(`API Error: ${res.status} - ${res.statusText}`);
      }

      const data = await res.json();
      //console.log("Collections API Response:", data); // ✅ Debugging log

      setCollections(data || []);
    } catch (err) {
      console.error("[collections_GET] Error:", err);
    } finally {
      setLoading(false); 
    }
  };

  useEffect(() => {
    getCollections();
  }, []);

  return loading ? (
    <Loader />
  ) : (
    <div className="px-10 py-5">
      <div className="flex items-center justify-between">
        <p className="text-heading2-bold">Collections</p>
        <Button className="bg-blue-1 text-white" onClick={() => router.push("/collections/new")}>
          <Plus className="h-4 w-4 mr-2" />
          Create Collection
        </Button>
      </div>
      <Separator className="bg-grey-1 my-4" />
      {collections.length === 0 ? (
        <p className="text-body-bold text-center">No collections found.</p>
      ) : (
        <DataTable columns={columns} data={collections} searchKey="title" />
      )}
    </div>
  );
};

export default Collections;