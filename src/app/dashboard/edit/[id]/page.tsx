import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import PostEditor from "@/components/PostEditor";

export default async function EditPostPage({ params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect("/login");
  }

  const post = await prisma.post.findUnique({
    where: { id: params.id },
  });

  if (!post) {
    return <div className="p-6 text-center text-red-500">Post not found</div>;
  }

  if (post.authorId !== session.user.id && session.user.role !== "ADMIN") {
    return <div className="p-6 text-center text-red-500">Unauthorized</div>;
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold text-indigo-400 mb-8">Edit Post</h1>
      <PostEditor post={post} />
    </div>
  );
}
