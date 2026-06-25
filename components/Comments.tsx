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

export type CommentEntityType = 'issue' | 'idea'

interface Comment {
  id: string
  userId: string
  userName: string
  text: string
  createdAt: string
}

const translations = {
  en: {
    issue: { trigger: 'Comments', desc: 'Share context, discuss solutions, or show your support.' },
    idea: { trigger: 'Discuss', desc: 'Share feedback, refine the idea, or show your support.' },
    commentsTitle: 'Discussion',
    placeholder: 'Add a comment...',
    post: 'Post',
    posting: 'Posting...',
    loading: 'Loading comments...',
    noComments: 'No comments yet. Be the first to weigh in.',
    signInToComment: 'Sign in to join the discussion.',
    delete: 'Delete comment',
  },
  fr: {
    issue: { trigger: 'Commentaires', desc: 'Partagez du contexte, discutez de solutions ou montrez votre soutien.' },
    idea: { trigger: 'Discuter', desc: 'Partagez vos commentaires, affinez l\'idée ou montrez votre soutien.' },
    commentsTitle: 'Discussion',
    placeholder: 'Ajouter un commentaire...',
    post: 'Publier',
    posting: 'Publication...',
    loading: 'Chargement des commentaires...',
    noComments: 'Aucun commentaire pour le moment. Soyez le premier à réagir.',
    signInToComment: 'Connectez-vous pour participer à la discussion.',
    delete: 'Supprimer le commentaire',
  },
}

// Unified comment thread for both issues and ideas - the two entity types
// share the exact same comments API shape (just a different path segment),
// so this single component replaces what used to be two ~215-line files
// (IssueComments.tsx / IdeaComments.tsx) differing only in entityType.
export function Comments({
  entityType,
  entityId,
  session,
  language = 'en',
  tempRole,
}: {
  entityType: CommentEntityType
  entityId: string
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
  const entityCopy = t[entityType]
  const currentUserRole = tempRole || session?.user?.user_metadata?.role
  const isModerator = currentUserRole === 'admin'
  const commentsUrl = `https://${projectId}.supabase.co/functions/v1/make-server-accecacf/${entityType}s/${entityId}/comments`

  const fetchComments = async () => {
    try {
      setLoading(true)
      const response = await fetch(commentsUrl, { headers: { Authorization: `Bearer ${publicAnonKey}` } })
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
      const response = await fetch(commentsUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ text }),
      })
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

      const response = await fetch(`${commentsUrl}/${commentId}`, { method: 'DELETE', headers })
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
          <MessageSquare className="h-3.5 w-3.5" />
          {entityCopy.trigger}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>{t.commentsTitle}</DialogTitle>
          <DialogDescription>{entityCopy.desc}</DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto space-y-3 py-2">
          {loading ? (
            <p className="text-sm text-muted-foreground">{t.loading}</p>
          ) : comments.length === 0 ? (
            <p className="text-sm text-muted-foreground">{t.noComments}</p>
          ) : (
            comments.map((comment) => (
              <div key={comment.id} className="rounded-xl border border-border/50 bg-muted/30 p-3">
                <div className="flex items-center justify-between mb-1 gap-2">
                  <span className="text-sm font-medium text-foreground">{comment.userName}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">
                      {new Date(comment.createdAt).toLocaleString()}
                    </span>
                    {(comment.userId === session?.user?.id || isModerator) && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0 text-destructive hover:text-destructive hover:bg-destructive/10"
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
            />
            <div className="flex justify-end">
              <Button onClick={handlePost} disabled={posting || !text.trim()} size="sm">
                <Send className="h-4 w-4" />
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
