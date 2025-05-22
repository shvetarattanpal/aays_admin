"use client";

import { Table } from "@tanstack/react-table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface DataTableFilterProps<TData> {
  table: Table<TData>;
  columnId: string;
  options: string[];
}

export function DataTableFilter<TData>({ table, columnId, options }: DataTableFilterProps<TData>) {
  const column = table.getColumn(columnId);

  return (
    <Select onValueChange={(value) => column?.setFilterValue(value)} defaultValue="">
      <SelectTrigger className="w-[180px]">
        <SelectValue placeholder={`Filter ${columnId}`} />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="">All</SelectItem>
        {options.map((option) => (
          <SelectItem key={option} value={option}>
            {option}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}