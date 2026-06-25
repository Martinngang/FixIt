import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card"
import { Badge } from "./ui/badge"
import { Button } from "./ui/button"
import { Alert, AlertDescription } from "./ui/alert"
import { Skeleton } from "./ui/skeleton"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog"
import { Input } from "./ui/input"
import { Label } from "./ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select"
import { useToast } from "./ToastContext"
import {
  Boxes, Plus, Pencil, Trash2, RefreshCw, AlertCircle, AlertTriangle,
  Loader2, Minus, Truck, CheckCircle, PackageSearch,
} from 'lucide-react'
import { projectId } from "../utils/supabase/info"
import { EntityCard } from "./ui/entity-card"
import { StatusBadge } from "./ui/status-badge"
import { EmptyState } from "./ui/empty-state"

interface InventoryItem {
  id: string
  name: string
  category: string
  sku: string | null
  unit: string
  quantityOnHand: number
  reorderThreshold: number
  reorderQuantity: number
  supplier: string | null
  createdAt: string
  updatedAt: string
}

interface ReorderRequest {
  id: string
  itemId: string
  itemName: string
  quantityRequested: number
  supplier: string | null
  status: 'pending' | 'ordered' | 'received' | 'cancelled'
  triggeredBy: string
  relatedIssueId: string | null
  createdAt: string
  updatedAt: string
}

// Matches ISSUE_CATEGORIES in the backend utils/gemini.ts
const INVENTORY_CATEGORIES = [
  { en: 'Road & Transportation', fr: 'Routes et transport' },
  { en: 'Water & Utilities', fr: 'Eau et services publics' },
  { en: 'Parks & Recreation', fr: 'Parcs et loisirs' },
  { en: 'Public Safety', fr: 'Sécurité publique' },
  { en: 'Waste Management', fr: 'Gestion des déchets' },
  { en: 'Street Lighting', fr: 'Éclairage public' },
  { en: 'Public Buildings', fr: 'Bâtiments publics' },
  { en: 'Environmental', fr: 'Environnement' },
  { en: 'Other', fr: 'Autre' },
]

// Matches REORDER_STATUSES in the backend inventoryModel
const REORDER_STATUSES = ['pending', 'ordered', 'received', 'cancelled'] as const

const translations = {
  en: {
    title: 'Inventory & Supply Chain',
    subtitle: 'Track parts and materials, and manage reorder requests for repair operations.',
    itemsTab: 'Inventory Items',
    reordersTab: 'Reorder Requests',
    refresh: 'Refresh',
    loading: 'Loading inventory...',
    loadError: 'Failed to load inventory data',
    addItem: 'Add Item',
    newItemTitle: 'Add Inventory Item',
    newItemDesc: 'Track a new part or material used in repairs.',
    editItemTitle: 'Edit Inventory Item',
    editItemDesc: 'Update details and stock level for this item.',
    nameLabel: 'Name',
    namePlaceholder: 'e.g. LED Streetlight Bulb',
    categoryLabel: 'Category',
    skuLabel: 'SKU',
    skuPlaceholder: 'Optional stock code',
    unitLabel: 'Unit',
    unitPlaceholder: 'e.g. unit, box, meter',
    quantityLabel: 'Quantity On Hand',
    reorderThresholdLabel: 'Reorder Threshold',
    reorderQuantityLabel: 'Reorder Quantity',
    supplierLabel: 'Supplier',
    supplierPlaceholder: 'Optional supplier name',
    submit: 'Add Item',
    submitting: 'Adding...',
    save: 'Save Changes',
    saving: 'Saving...',
    cancel: 'Cancel',
    edit: 'Edit',
    delete: 'Delete',
    noItems: 'No inventory items yet.',
    noItemsDesc: 'Add parts and materials used in repairs to start tracking stock levels.',
    noReorders: 'No reorder requests.',
    noReordersDesc: 'A reorder request is created automatically whenever an item drops to or below its reorder threshold.',
    lowStock: 'Low Stock',
    inStock: 'In Stock',
    onHand: 'on hand',
    reorderAt: 'Reorder at',
    reorderQty: 'Reorder qty',
    supplier: 'Supplier',
    created: 'Item created',
    updated: 'Item updated',
    deleted: 'Item deleted',
    stockAdjusted: 'Stock updated',
    statusUpdated: 'Reorder status updated',
    actionError: 'Action failed',
    createError: 'Failed to create item',
    updateError: 'Failed to update item',
    quantityRequested: 'Quantity requested',
    relatedIssue: 'Linked to issue',
    triggeredBy: 'Triggered by',
    system: 'System (automatic)',
    reorderStatuses: {
      pending: 'Pending',
      ordered: 'Ordered',
      received: 'Received',
      cancelled: 'Cancelled',
    } as Record<string, string>,
  },
  fr: {
    title: 'Inventaire et chaîne d’approvisionnement',
    subtitle: 'Suivez les pièces et matériaux, et gérez les demandes de réapprovisionnement pour les réparations.',
    itemsTab: 'Articles en stock',
    reordersTab: 'Réapprovisionnements',
    refresh: 'Actualiser',
    loading: 'Chargement de l’inventaire...',
    loadError: 'Échec du chargement des données d’inventaire',
    addItem: 'Ajouter un article',
    newItemTitle: 'Ajouter un article d’inventaire',
    newItemDesc: 'Suivre une nouvelle pièce ou un matériau utilisé pour les réparations.',
    editItemTitle: 'Modifier l’article',
    editItemDesc: 'Mettre à jour les détails et le niveau de stock de cet article.',
    nameLabel: 'Nom',
    namePlaceholder: 'ex. Ampoule de réverbère LED',
    categoryLabel: 'Catégorie',
    skuLabel: 'Référence (SKU)',
    skuPlaceholder: 'Code de stock optionnel',
    unitLabel: 'Unité',
    unitPlaceholder: 'ex. unité, boîte, mètre',
    quantityLabel: 'Quantité en stock',
    reorderThresholdLabel: 'Seuil de réapprovisionnement',
    reorderQuantityLabel: 'Quantité à commander',
    supplierLabel: 'Fournisseur',
    supplierPlaceholder: 'Nom du fournisseur (optionnel)',
    submit: 'Ajouter l’article',
    submitting: 'Ajout...',
    save: 'Enregistrer',
    saving: 'Enregistrement...',
    cancel: 'Annuler',
    edit: 'Modifier',
    delete: 'Supprimer',
    noItems: 'Aucun article en inventaire pour le moment.',
    noItemsDesc: 'Ajoutez les pièces et matériaux utilisés pour les réparations afin de suivre les niveaux de stock.',
    noReorders: 'Aucune demande de réapprovisionnement.',
    noReordersDesc: 'Une demande de réapprovisionnement est créée automatiquement lorsqu’un article atteint ou descend sous son seuil.',
    lowStock: 'Stock faible',
    inStock: 'En stock',
    onHand: 'en stock',
    reorderAt: 'Réapprovisionner à',
    reorderQty: 'Qté à commander',
    supplier: 'Fournisseur',
    created: 'Article créé',
    updated: 'Article mis à jour',
    deleted: 'Article supprimé',
    stockAdjusted: 'Stock mis à jour',
    statusUpdated: 'Statut du réapprovisionnement mis à jour',
    actionError: 'Action échouée',
    createError: 'Échec de la création de l’article',
    updateError: 'Échec de la mise à jour de l’article',
    quantityRequested: 'Quantité demandée',
    relatedIssue: 'Lié au problème',
    triggeredBy: 'Déclenché par',
    system: 'Système (automatique)',
    reorderStatuses: {
      pending: 'En attente',
      ordered: 'Commandé',
      received: 'Reçu',
      cancelled: 'Annulé',
    } as Record<string, string>,
  },
}


const API_BASE = `https://${projectId}.supabase.co/functions/v1/make-server-accecacf`

const EMPTY_FORM = {
  name: '',
  category: 'Other',
  sku: '',
  unit: '',
  quantityOnHand: '0',
  reorderThreshold: '0',
  reorderQuantity: '0',
  supplier: '',
}

export function Inventory({ session, language = 'en', tempRole }: {
  session: any
  language?: 'en' | 'fr'
  tempRole?: string | null
}) {
  const t = translations[language]
  const { addToast } = useToast()

  const [items, setItems] = useState<InventoryItem[]>([])
  const [reorders, setReorders] = useState<ReorderRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [actionId, setActionId] = useState('')

  const [itemDialogOpen, setItemDialogOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [itemForm, setItemForm] = useState(EMPTY_FORM)

  const authHeaders = (): Record<string, string> => {
    const headers: Record<string, string> = {}
    if (session?.access_token) headers['Authorization'] = `Bearer ${session.access_token}`
    if (tempRole) headers['X-Temp-Role'] = tempRole
    return headers
  }

  const fetchData = async () => {
    try {
      setLoading(true)
      setError('')

      const [itemsRes, reordersRes] = await Promise.all([
        fetch(`${API_BASE}/inventory`, { headers: authHeaders() }),
        fetch(`${API_BASE}/reorders`, { headers: authHeaders() }),
      ])

      if (!itemsRes.ok || !reordersRes.ok) throw new Error(t.loadError)

      const itemsData = await itemsRes.json()
      const reordersData = await reordersRes.json()

      setItems(itemsData.items || [])
      setReorders(reordersData.reorders || [])
    } catch (err: any) {
      console.error('Fetch inventory data error:', err)
      setError(err.message || t.loadError)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const openCreateDialog = () => {
    setEditingItem(null)
    setItemForm(EMPTY_FORM)
    setItemDialogOpen(true)
  }

  const openEditDialog = (item: InventoryItem) => {
    setEditingItem(item)
    setItemForm({
      name: item.name,
      category: item.category,
      sku: item.sku || '',
      unit: item.unit,
      quantityOnHand: String(item.quantityOnHand),
      reorderThreshold: String(item.reorderThreshold),
      reorderQuantity: String(item.reorderQuantity),
      supplier: item.supplier || '',
    })
    setItemDialogOpen(true)
  }

  const handleSubmitItem = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      setSubmitting(true)

      if (editingItem) {
        const res = await fetch(`${API_BASE}/inventory/${editingItem.id}`, {
          method: 'PATCH',
          headers: { ...authHeaders(), 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: itemForm.name,
            category: itemForm.category,
            sku: itemForm.sku,
            unit: itemForm.unit,
            reorderThreshold: Number(itemForm.reorderThreshold) || 0,
            reorderQuantity: Number(itemForm.reorderQuantity) || 0,
            supplier: itemForm.supplier,
          }),
        })
        const data = await res.json().catch(() => ({}))
        if (!res.ok) throw new Error(data.error || t.updateError)

        let updatedItem = data.item
        const newQuantity = Number(itemForm.quantityOnHand) || 0
        const delta = newQuantity - editingItem.quantityOnHand

        if (delta !== 0) {
          const adjustRes = await fetch(`${API_BASE}/inventory/${editingItem.id}/adjust`, {
            method: 'POST',
            headers: { ...authHeaders(), 'Content-Type': 'application/json' },
            body: JSON.stringify({ delta }),
          })
          const adjustData = await adjustRes.json().catch(() => ({}))
          if (!adjustRes.ok) throw new Error(adjustData.error || t.updateError)
          updatedItem = adjustData.item
        }

        setItems(prev => prev.map(i => i.id === updatedItem.id ? updatedItem : i))
        addToast(t.updated, 'success')
      } else {
        const res = await fetch(`${API_BASE}/inventory`, {
          method: 'POST',
          headers: { ...authHeaders(), 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: itemForm.name,
            category: itemForm.category,
            sku: itemForm.sku,
            unit: itemForm.unit,
            quantityOnHand: Number(itemForm.quantityOnHand) || 0,
            reorderThreshold: Number(itemForm.reorderThreshold) || 0,
            reorderQuantity: Number(itemForm.reorderQuantity) || 0,
            supplier: itemForm.supplier,
          }),
        })
        const data = await res.json().catch(() => ({}))
        if (!res.ok) throw new Error(data.error || t.createError)
        setItems(prev => [...prev, data.item].sort((a, b) => a.name.localeCompare(b.name)))
        addToast(t.created, 'success')
      }

      setItemDialogOpen(false)
      setEditingItem(null)
      setItemForm(EMPTY_FORM)

      // A low resulting stock level may have created a new reorder request.
      fetchData()
    } catch (err: any) {
      addToast(err.message || t.actionError, 'error')
    } finally {
      setSubmitting(false)
    }
  }

  const handleQuickAdjust = async (item: InventoryItem, delta: number) => {
    if (item.quantityOnHand + delta < 0) return

    try {
      setActionId(item.id)
      const res = await fetch(`${API_BASE}/inventory/${item.id}/adjust`, {
        method: 'POST',
        headers: { ...authHeaders(), 'Content-Type': 'application/json' },
        body: JSON.stringify({ delta }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(data.error || t.actionError)

      setItems(prev => prev.map(i => i.id === item.id ? data.item : i))

      if (data.item.quantityOnHand <= data.item.reorderThreshold) {
        const reordersRes = await fetch(`${API_BASE}/reorders`, { headers: authHeaders() })
        const reordersData = await reordersRes.json().catch(() => ({}))
        if (reordersRes.ok) setReorders(reordersData.reorders || [])
      }
    } catch (err: any) {
      addToast(err.message || t.actionError, 'error')
    } finally {
      setActionId('')
    }
  }

  const handleDeleteItem = async (itemId: string) => {
    try {
      setActionId(itemId)
      const res = await fetch(`${API_BASE}/inventory/${itemId}`, { method: 'DELETE', headers: authHeaders() })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(data.error || t.actionError)
      setItems(prev => prev.filter(i => i.id !== itemId))
      addToast(t.deleted, 'success')
    } catch (err: any) {
      addToast(err.message || t.actionError, 'error')
    } finally {
      setActionId('')
    }
  }

  const handleReorderStatus = async (reorderId: string, status: string) => {
    try {
      setActionId(reorderId)
      const res = await fetch(`${API_BASE}/reorders/${reorderId}/status`, {
        method: 'PATCH',
        headers: { ...authHeaders(), 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(data.error || t.actionError)
      setReorders(prev => prev.map(r => r.id === reorderId ? data.reorder : r))
      addToast(t.statusUpdated, 'success')

      // Marking a reorder 'received' restocks the item on the backend.
      if (status === 'received') fetchData()
    } catch (err: any) {
      addToast(err.message || t.actionError, 'error')
    } finally {
      setActionId('')
    }
  }

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString(language === 'fr' ? 'fr-FR' : 'en-US', { dateStyle: 'medium' })

  if (loading) {
    return (
      <div className="space-y-6 animate-fade-in">
        {[...Array(3)].map((_, i) => (
          <Card key={i}>
            <CardHeader>
              <Skeleton className="h-6 w-48" />
              <Skeleton className="h-4 w-32" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-16 w-full" />
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription className="flex flex-col sm:flex-row sm:items-center gap-2">
          {error}
          <Button variant="outline" size="sm" onClick={fetchData}>
            <RefreshCw className="h-4 w-4" />
            {t.refresh}
          </Button>
        </AlertDescription>
      </Alert>
    )
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-display font-bold text-foreground flex items-center gap-2">
          <Boxes className="h-6 w-6 text-primary" />
          {t.title}
        </h1>
        <p className="text-muted-foreground">{t.subtitle}</p>
      </div>

      <Tabs defaultValue="items" className="space-y-4">
        <TabsList className="grid w-full grid-cols-2 sm:inline-flex sm:w-auto">
          <TabsTrigger value="items" className="gap-1.5">
            <Boxes className="h-4 w-4" />
            <span>{t.itemsTab}</span>
          </TabsTrigger>
          <TabsTrigger value="reorders" className="gap-1.5">
            <Truck className="h-4 w-4" />
            <span>{t.reordersTab}</span>
            {reorders.filter(r => r.status === 'pending').length > 0 && (
              <Badge variant="warning">
                {reorders.filter(r => r.status === 'pending').length}
              </Badge>
            )}
          </TabsTrigger>
        </TabsList>

        {/* Inventory Items */}
        <TabsContent value="items" className="space-y-4">
          <div className="flex justify-end">
            <Dialog open={itemDialogOpen} onOpenChange={setItemDialogOpen}>
              <DialogTrigger asChild>
                <Button size="sm" onClick={openCreateDialog}>
                  <Plus className="h-4 w-4" />
                  {t.addItem}
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>{editingItem ? t.editItemTitle : t.newItemTitle}</DialogTitle>
                  <DialogDescription>
                    {editingItem ? t.editItemDesc : t.newItemDesc}
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmitItem} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="item-name">{t.nameLabel} *</Label>
                    <Input
                      id="item-name"
                      required
                      placeholder={t.namePlaceholder}
                      value={itemForm.name}
                      onChange={(e) => setItemForm(prev => ({ ...prev, name: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>{t.categoryLabel}</Label>
                    <Select value={itemForm.category} onValueChange={(value) => setItemForm(prev => ({ ...prev, category: value }))}>
                      <SelectTrigger>
                        <SelectValue placeholder={t.categoryLabel} />
                      </SelectTrigger>
                      <SelectContent>
                        {INVENTORY_CATEGORIES.map((cat) => (
                          <SelectItem key={cat.en} value={cat.en}>
                            {language === 'fr' ? cat.fr : cat.en}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="item-sku">{t.skuLabel}</Label>
                      <Input
                        id="item-sku"
                        placeholder={t.skuPlaceholder}
                        value={itemForm.sku}
                        onChange={(e) => setItemForm(prev => ({ ...prev, sku: e.target.value }))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="item-unit">{t.unitLabel}</Label>
                      <Input
                        id="item-unit"
                        placeholder={t.unitPlaceholder}
                        value={itemForm.unit}
                        onChange={(e) => setItemForm(prev => ({ ...prev, unit: e.target.value }))}
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="item-quantity">{t.quantityLabel}</Label>
                      <Input
                        id="item-quantity"
                        type="number"
                        min="0"
                        value={itemForm.quantityOnHand}
                        onChange={(e) => setItemForm(prev => ({ ...prev, quantityOnHand: e.target.value }))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="item-threshold">{t.reorderThresholdLabel}</Label>
                      <Input
                        id="item-threshold"
                        type="number"
                        min="0"
                        value={itemForm.reorderThreshold}
                        onChange={(e) => setItemForm(prev => ({ ...prev, reorderThreshold: e.target.value }))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="item-reorder-qty">{t.reorderQuantityLabel}</Label>
                      <Input
                        id="item-reorder-qty"
                        type="number"
                        min="0"
                        value={itemForm.reorderQuantity}
                        onChange={(e) => setItemForm(prev => ({ ...prev, reorderQuantity: e.target.value }))}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="item-supplier">{t.supplierLabel}</Label>
                    <Input
                      id="item-supplier"
                      placeholder={t.supplierPlaceholder}
                      value={itemForm.supplier}
                      onChange={(e) => setItemForm(prev => ({ ...prev, supplier: e.target.value }))}
                    />
                  </div>
                  <DialogFooter>
                    <Button type="submit" disabled={submitting}>
                      {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                      {submitting ? (editingItem ? t.saving : t.submitting) : (editingItem ? t.save : t.submit)}
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          {items.length === 0 ? (
            <Card>
              <CardContent>
                <EmptyState icon={PackageSearch} title={t.noItems} description={t.noItemsDesc} />
              </CardContent>
            </Card>
          ) : (
            items.map((item) => {
              const lowStock = item.quantityOnHand <= item.reorderThreshold
              return (
                <EntityCard
                  key={item.id}
                  title={item.name}
                  subtitle={`${item.category}${item.sku ? ` · SKU: ${item.sku}` : ''}`}
                  badges={[
                    <StatusBadge key="stock" kind="stock" value={lowStock ? 'low' : 'ok'} label={lowStock ? t.lowStock : t.inStock} />,
                  ]}
                  actions={[
                    { icon: Pencil, label: t.edit, onClick: () => openEditDialog(item) },
                    { icon: Trash2, label: t.delete, onClick: () => handleDeleteItem(item.id), variant: 'ghost', disabled: actionId === item.id },
                  ]}
                >
                  <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-8 w-8 p-0"
                        onClick={() => handleQuickAdjust(item, -1)}
                        disabled={actionId === item.id || item.quantityOnHand <= 0}
                      >
                        <Minus className="h-3.5 w-3.5" />
                      </Button>
                      <span className="font-medium text-foreground">
                        {item.quantityOnHand} {item.unit} {t.onHand}
                      </span>
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-8 w-8 p-0"
                        onClick={() => handleQuickAdjust(item, 1)}
                        disabled={actionId === item.id}
                      >
                        {actionId === item.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Plus className="h-3.5 w-3.5" />}
                      </Button>
                    </div>
                    <span>{t.reorderAt}: {item.reorderThreshold} {item.unit}</span>
                    <span>{t.reorderQty}: {item.reorderQuantity} {item.unit}</span>
                    {item.supplier && <span>{t.supplier}: {item.supplier}</span>}
                  </div>
                </EntityCard>
              )
            })
          )}
        </TabsContent>

        {/* Reorder Requests */}
        <TabsContent value="reorders" className="space-y-4">
          {reorders.length === 0 ? (
            <Card>
              <CardContent>
                <EmptyState icon={Truck} title={t.noReorders} description={t.noReordersDesc} />
              </CardContent>
            </Card>
          ) : (
            reorders.map((reorder) => (
              <Card key={reorder.id}>
                <CardHeader>
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
                    <div className="space-y-1">
                      <CardTitle>{reorder.itemName}</CardTitle>
                      <CardDescription>
                        {t.quantityRequested}: {reorder.quantityRequested}
                        {reorder.supplier ? ` · ${t.supplier}: ${reorder.supplier}` : ''}
                      </CardDescription>
                    </div>
                    <StatusBadge kind="reorder" value={reorder.status} label={t.reorderStatuses[reorder.status] || reorder.status} />
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                    <span>{t.triggeredBy}: {reorder.triggeredBy === 'system' ? t.system : reorder.triggeredBy}</span>
                    <span>{formatDate(reorder.createdAt)}</span>
                    {reorder.relatedIssueId && (
                      <Badge variant="outline">
                        {t.relatedIssue}: {reorder.relatedIssueId.slice(0, 8)}
                      </Badge>
                    )}
                  </div>

                  <div className="pt-2 border-t border-border">
                    <Select
                      value={reorder.status}
                      onValueChange={(value) => handleReorderStatus(reorder.id, value)}
                      disabled={actionId === reorder.id}
                    >
                      <SelectTrigger className="h-8 w-auto text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {REORDER_STATUSES.map((status) => (
                          <SelectItem key={status} value={status}>
                            {t.reorderStatuses[status] || status}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
