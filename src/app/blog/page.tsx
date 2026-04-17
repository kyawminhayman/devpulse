import { prisma } from "@/lib/prisma";
import Link from "next/link";

type Post = {
  id: string;
  title: string;
  content: string;
  imageUrl: string | null;
  createdAt: Date;
  author: {
    name: string | null;
  };
};

export default async function BlogPage({
  searchParams,
}: {
  searchParams: { search?: string };
}) {
  const search = searchParams.search || "";

  const posts: Post[] = await prisma.post.findMany({
    where: search
      ? {
          OR: [
            { title: { contains: search, mode: "insensitive" } },
            { content: { contains: search, mode: "insensitive" } },
          ],
        }
      : {},
    orderBy: { createdAt: "desc" },
    include: { author: true },
  });

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
        <h1 className="text-3xl font-bold text-indigo-400">All Posts</h1>

        <form className="flex w-full md:w-auto">
          <input
            type="text"
            name="search"
            defaultValue={search}
            placeholder="Search posts..."
            className="w-full md:w-64 p-2 bg-slate-800 rounded-l border border-slate-700 text-slate-200 focus:outline-none focus:border-indigo-500"
          />
          <button
            type="submit"
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded-r transition-colors"
          >
            Search
          </button>
        </form>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {posts.length === 0 ? (
          <p className="text-slate-400">No posts found.</p>
        ) : (
          posts.map((post) => (
            <Link key={post.id} href={`/blog/${post.id}`}>
              <div className="bg-[#111827] rounded-xl overflow-hidden shadow-lg border border-slate-800 hover:border-indigo-500 transition-colors h-full flex flex-col">
                {post.imageUrl && (
                  <img
                    src={post.imageUrl}
                    alt={post.title}
                    className="w-full h-48 object-cover"
                  />
                )}

                <div className="p-6 flex flex-col flex-grow">
                  <h2 className="text-xl font-bold text-slate-200 mb-2">
                    {post.title}
                  </h2>

                  <p className="text-sm text-slate-400 mb-4 line-clamp-3">
                    {post.content.slice(0, 150)}...
                  </p>

                  <div className="mt-auto flex justify-between items-center text-xs text-slate-500">
                    <span>{post.author.name}</span>
                    <span>
                      {new Date(post.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}