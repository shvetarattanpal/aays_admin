import { auth, clerkClient } from "@clerk/nextjs/server";
import { connectToDB } from "@/lib/mongoDB";
import Contact from "@/lib/models/Contact";
import { ContactDocument } from "@/lib/models/Contact";
import { format } from "date-fns";
import { redirect } from "next/navigation";

interface Props {
  searchParams: {
    page?: string;
    search?: string;
  };
}

export default async function AdminContactsPage({ searchParams }: Props) {
  const { userId } = auth();

  if (!userId) return redirect("/sign-in");

  const user = await clerkClient.users.getUser(userId);
  const isAdmin = user?.publicMetadata?.role === "admin";

  if (!isAdmin) return redirect("/unauthorized");

  const page = parseInt(searchParams.page || "1");
  const limit = 10;
  const search = searchParams.search || "";

  await connectToDB();

  const query = search
    ? {
        $or: [
          { name: { $regex: search, $options: "i" } },
          { email: { $regex: search, $options: "i" } },
        ],
      }
    : {};

  const total = await Contact.countDocuments(query);
  const contacts: ContactDocument[] = await Contact.find(query)
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(limit);

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Contact Submissions</h2>

      <form className="mb-4">
        <input
          type="text"
          name="search"
          placeholder="Search by name or email"
          defaultValue={search}
          className="border px-3 py-2 rounded"
        />
        <button className="ml-2 px-4 py-2 bg-black text-white rounded">Search</button>
      </form>

      <table className="w-full table-auto border-collapse border border-gray-300">
        <thead>
          <tr className="bg-gray-100">
            <th className="p-2 border">Name</th>
            <th className="p-2 border">Email</th>
            <th className="p-2 border">Message</th>
            <th className="p-2 border">Date</th>
          </tr>
        </thead>
        <tbody>
          {contacts.map((c) => (
            <tr key={String(c._id)}>
              <td className="p-2 border">{c.name}</td>
              <td className="p-2 border">{c.email}</td>
              <td className="p-2 border">{c.message}</td>
              <td className="p-2 border">
                {format(new Date(c.createdAt), "PPpp")}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="mt-4 flex justify-between items-center">
        <span>
          Page {page} of {Math.ceil(total / limit)}
        </span>
        <div className="space-x-2">
          {page > 1 && (
            <a href={`?page=${page - 1}&search=${search}`} className="underline">
              Previous
            </a>
          )}
          {page * limit < total && (
            <a href={`?page=${page + 1}&search=${search}`} className="underline">
              Next
            </a>
          )}
        </div>
      </div>
    </div>
  );
}