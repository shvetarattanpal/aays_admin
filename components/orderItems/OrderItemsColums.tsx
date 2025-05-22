"use client";

import { ColumnDef } from "@tanstack/react-table";
import Link from "next/link";
import { OrderItemType } from "@/lib/types";

export const columns: ColumnDef<OrderItemType>[] = [
  {
    accessorKey: "product",
    header: "Product",
    cell: ({ row }) => {
      const product = row.original.product;

      if (!product || !product._id) {
        return <span className="text-muted">Unknown Product</span>;
      }

      return (
        <Link
          href={`/products/${product._id}`}
          className="hover:text-red-1"
        >
          {product.title || "Untitled"}
        </Link>
      );
    },
  },
  {
    accessorKey: "color",
    header: "Color",
  },
  {
    accessorKey: "size",
    header: "Size",
  },
  {
    accessorKey: "quantity",
    header: "Quantity",
  },
];