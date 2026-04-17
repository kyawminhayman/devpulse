import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { deletePost } from "../actions/post";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return null; // Handled by middleware
  }

  const posts = await prisma.post.findMany({
    where: session.user.role === "ADMIN" ? {} : { authorId: session.user.id },
    orderBy: { createdAt: "desc" },
    include: { author: true },
  });

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-indigo-400">Dashboard</h1>
        <Link
          href="/dashboard/create"
          className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded"
        >
          Create Post
        </Link>
      </div>

      <div className="space-y-4">
        {posts.length === 0 ? (
          <p className="text-slate-400">No posts found.</p>
        ) : (
          posts.map((post) => (
            <div key={post.id} className="bg-slate-800 p-4 rounded-lg shadow border border-slate-700 flex justify-between items-center">
              <div>
                <h2 className="text-xl font-bold text-slate-200">{post.title}</h2>
                <p className="text-sm text-slate-400">
                  {new Date(post.createdAt).toLocaleDateString()}
                  {session.user.role === "ADMIN" && post.authorId !== session.user.id && (
                    <span className="ml-2 text-indigo-400">by {post.author.name}</span>
                  )}
                </p>
              </div>
              <div className="flex space-x-2">
                <Link
                  href={`/dashboard/edit/${post.id}`}
                  className="bg-slate-700 hover:bg-slate-600 text-white py-1 px-3 rounded text-sm"
                >
                  Edit
                </Link>
                <form action={async () => {
                  "use server";
                  await deletePost(post.id);
                }}>
                  <button
                    type="submit"
                    className="bg-red-600 hover:bg-red-700 text-white py-1 px-3 rounded text-sm"
                  >
                    Delete
                  </button>
                </form>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
