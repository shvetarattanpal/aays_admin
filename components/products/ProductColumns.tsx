"use client";

import { ColumnDef } from "@tanstack/react-table";
import Delete from "../custom-ui/Delete";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { ProductType } from "@/lib/types";

export const columns: ColumnDef<ProductType>[] = [
  {
    accessorKey: "title",
    header: "Title",
    cell: ({ row }) => (
      <Link
        href={`/products/${row.original._id}`}
        className="hover:text-red-500 transition-colors"
      >
        {row.original.title}
      </Link>
    ),
  },
  {
    accessorKey: "category",
    header: "Category",
    cell: ({ row }) => (
      <span className="capitalize">{row.original.category || "N/A"}</span>
    ),
  },
  {
    accessorKey: "subCategory",
    header: "SubCategory",
    cell: ({ row }) => (
      <Badge variant="secondary" className="capitalize">
        {row.original.subCategory || "N/A"}
      </Badge>
    ),
    filterFn: (row, id, value) => row.getValue(id) === value,
    sortingFn: (a, b) =>
      (a.getValue("subCategory") as string)?.localeCompare(
        b.getValue("subCategory") as string
      ),
  },
  {
    accessorKey: "collections",
    header: "Collections",
    cell: ({ row }) => {
      const collections = row.original.collections || [];
      return collections.length > 0
        ? collections.map((c) => c.title).join(", ")
        : "None";
    },
  },
  {
    accessorKey: "price",
    header: "Price ($)",
    cell: ({ row }) => row.original.price?.toFixed(2) || "0.00",
  },
  {
    accessorKey: "expense",
    header: "Expense ($)",
    cell: ({ row }) => row.original.expense?.toFixed(2) || "0.00",
  },
  {
    id: "actions",
    header: "Actions",
    cell: ({ row }) => <Delete item="product" id={row.original._id} />,
  },
];