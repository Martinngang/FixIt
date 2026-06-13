import { useState, useEffect } from 'react'
import { Button } from "./ui/button"
import { Textarea } from "./ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog"
import { MessageSquare, Send, Trash2 } from 'lucide-react'
import { projectId, publicAnonKey } from "../utils/supabase/info"

interface Comment {
  id: string
  ideaId: string
  userId: string
  userName: string
  text: string
  createdAt: string
}

const translations = {
  en: {
    comments: 'Discuss',
    commentsTitle: 'Discussion',
    commentsDesc: 'Share feedback, refine the idea, or show your support.',
    placeholder: 'Add a comment...',
    post: 'Post',
    posting: 'Posting...',
    loading: 'Loading comments...',
    noComments: 'No comments yet. Be the first to weigh in.',
    signInToComment: 'Sign in to join the discussion.',
    delete: 'Delete comment',
  },
  fr: {
    comments: 'Discuter',
    commentsTitle: 'Discussion',
    commentsDesc: 'Partagez vos commentaires, affinez l\'idée ou montrez votre soutien.',
    placeholder: 'Ajouter un commentaire...',
    post: 'Publier',
    posting: 'Publication...',
    loading: 'Chargement des commentaires...',
    noComments: 'Aucun commentaire pour le moment. Soyez le premier à réagir.',
    signInToComment: 'Connectez-vous pour participer à la discussion.',
    delete: 'Supprimer le commentaire',
  },
}

export function IdeaComments({
  ideaId,
  session,
  language = 'en',
  tempRole,
}: {
  ideaId: string
  session: any
  language?: 'en' | 'fr'
  tempRole?: string | null
}) {
  const [open, setOpen] = useState(false)
  const [comments, setComments] = useState<Comment[]>([])
  const [loading, setLoading] = useState(false)
  const [text, setText] = useState('')
  const [posting, setPosting] = useState(false)
  const [deletingId, setDeletingId] = useState('')

  const t = translations[language]
  const currentUserRole = tempRole || session?.user?.user_metadata?.role
  const isModerator = currentUserRole === 'admin'

  const fetchComments = async () => {
    try {
      setLoading(true)
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-accecacf/ideas/${ideaId}/comments`,
        { headers: { Authorization: `Bearer ${publicAnonKey}` } }
      )
      if (!response.ok) return
      const data = await response.json()
      setComments(data.comments || [])
    } catch (err) {
      console.error('Fetch comments error:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (open) fetchComments()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open])

  const handlePost = async () => {
    if (!text.trim() || !session?.access_token) return

    try {
      setPosting(true)
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-accecacf/ideas/${ideaId}/comments`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({ text }),
        }
      )
      if (!response.ok) return
      const data = await response.json()
      setComments(prev => [...prev, data.comment])
      setText('')
    } catch (err) {
      console.error('Post comment error:', err)
    } finally {
      setPosting(false)
    }
  }

  const handleDelete = async (commentId: string) => {
    if (!session?.access_token) return

    try {
      setDeletingId(commentId)
      const headers: Record<string, string> = {
        Authorization: `Bearer ${session.access_token}`,
      }
      if (tempRole) headers['X-Temp-Role'] = tempRole

      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-accecacf/ideas/${ideaId}/comments/${commentId}`,
        { method: 'DELETE', headers }
      )
      if (!response.ok) return
      setComments(prev => prev.filter(comment => comment.id !== commentId))
    } catch (err) {
      console.error('Delete comment error:', err)
    } finally {
      setDeletingId('')
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="h-7 px-2">
          <MessageSquare className="h-3.5 w-3.5 mr-1" />
          {t.comments}
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-card border-border max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-foreground">{t.commentsTitle}</DialogTitle>
          <DialogDescription className="text-muted-foreground">{t.commentsDesc}</DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto space-y-3 py-2">
          {loading ? (
            <p className="text-sm text-muted-foreground">{t.loading}</p>
          ) : comments.length === 0 ? (
            <p className="text-sm text-muted-foreground">{t.noComments}</p>
          ) : (
            comments.map((comment) => (
              <div key={comment.id} className="border border-border rounded-lg p-3 bg-background">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium text-foreground">{comment.userName}</span>
                  <div className="flex items-center space-x-2">
                    <span className="text-xs text-muted-foreground">
                      {new Date(comment.createdAt).toLocaleString()}
                    </span>
                    {(comment.userId === session?.user?.id || isModerator) && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0 text-destructive hover:text-destructive hover:bg-muted"
                        onClick={() => handleDelete(comment.id)}
                        disabled={deletingId === comment.id}
                        title={t.delete}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    )}
                  </div>
                </div>
                <p className="text-sm text-foreground whitespace-pre-wrap">{comment.text}</p>
              </div>
            ))
          )}
        </div>

        {session?.access_token ? (
          <div className="space-y-2 pt-2 border-t border-border">
            <Textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder={t.placeholder}
              rows={2}
              className="bg-background border-border text-foreground"
            />
            <div className="flex justify-end">
              <Button onClick={handlePost} disabled={posting || !text.trim()} size="sm">
                <Send className="h-4 w-4 mr-2" />
                {posting ? t.posting : t.post}
              </Button>
            </div>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground pt-2 border-t border-border">{t.signInToComment}</p>
        )}
      </DialogContent>
    </Dialog>
  )
}
