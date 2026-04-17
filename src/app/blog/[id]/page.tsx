import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import LikeButton from "@/components/LikeButton";
import CommentSection from "@/components/CommentSection";

export default async function BlogPostPage({ params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  
  const post = await prisma.post.findUnique({
    where: { id: params.id },
    include: {
      author: true,
      _count: {
        select: { likes: true },
      },
      likes: session?.user ? { where: { userId: session.user.id } } : false,
    },
  });

  if (!post) {
    notFound();
  }

  const hasLiked = session?.user ? post.likes.length > 0 : false;

  return (
    <div className="max-w-3xl mx-auto p-6">
      {post.imageUrl && (
        <img src={post.imageUrl} alt={post.title} className="w-full h-64 md:h-96 object-cover rounded-xl mb-8 border border-slate-800" />
      )}
      
      <h1 className="text-4xl font-bold text-slate-100 mb-4">{post.title}</h1>
      
      <div className="flex justify-between items-center text-sm text-slate-400 mb-8 border-b border-slate-800 pb-4">
        <div>
          <span className="font-medium text-indigo-400">{post.author.name}</span>
          <span className="mx-2">•</span>
          <span>{new Date(post.createdAt).toLocaleDateString()}</span>
        </div>
        <div className="flex items-center space-x-4">
          <LikeButton postId={post.id} initialLikes={post._count.likes} initiallyLiked={hasLiked} />
        </div>
      </div>

      <div className="prose prose-invert prose-indigo max-w-none mb-12">
        <ReactMarkdown remarkPlugins={[remarkGfm]}>
          {post.content}
        </ReactMarkdown>
      </div>

      <CommentSection postId={post.id} />
    </div>
  );
}
