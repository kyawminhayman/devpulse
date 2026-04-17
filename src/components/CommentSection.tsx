"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { addComment, deleteComment, getComments } from "@/app/actions/comment";

interface CommentSectionProps {
  postId: string;
}

export default function CommentSection({ postId }: CommentSectionProps) {
  const { data: session } = useSession();
  const [comments, setComments] = useState<any[]>([]);
  const [newComment, setNewComment] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    getComments(postId).then(setComments);
  }, [postId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || !session) return;
    
    setLoading(true);
    try {
      const comment = await addComment(postId, newComment);
      setComments([comment, ...comments]);
      setNewComment("");
    } catch (error) {
      console.error("Failed to add comment", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (commentId: string) => {
    try {
      await deleteComment(commentId);
      setComments(comments.filter(c => c.id !== commentId));
    } catch (error) {
      console.error("Failed to delete comment", error);
    }
  };

  return (
    <div className="mt-12">
      <h3 className="text-2xl font-bold text-slate-200 mb-6">Comments</h3>
      
      {session ? (
        <form onSubmit={handleSubmit} className="mb-8">
          <textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Add a comment..."
            className="w-full p-4 bg-[#111827] rounded-xl border border-slate-800 text-slate-200 focus:outline-none focus:border-indigo-500 mb-2"
            rows={3}
          />
          <button
            type="submit"
            disabled={loading || !newComment.trim()}
            className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-bold py-2 px-4 rounded transition-colors"
          >
            Post Comment
          </button>
        </form>
      ) : (
        <p className="text-slate-400 mb-8 border-l-4 border-indigo-500 pl-4 py-2 bg-slate-800/50">
          Please <a href="/login" className="text-indigo-400 hover:underline">login</a> to leave a comment.
        </p>
      )}

      <div className="space-y-6">
        {comments.map((comment) => (
          <div key={comment.id} className="bg-[#111827] p-5 rounded-xl border border-slate-800 shadow-sm flex flex-col md:flex-row md:justify-between items-start">
            <div>
              <div className="flex items-center space-x-2 mb-2">
                <span className="font-bold text-slate-300">{comment.user.name}</span>
                <span className="text-xs text-slate-500">{new Date(comment.createdAt).toLocaleDateString()}</span>
              </div>
              <p className="text-slate-300 whitespace-pre-wrap">{comment.content}</p>
            </div>
            {session && (session.user.role === "ADMIN" || session.user.id === comment.userId) && (
              <button
                onClick={() => handleDelete(comment.id)}
                className="mt-4 md:mt-0 text-sm text-red-500 hover:text-red-400"
              >
                Delete
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
