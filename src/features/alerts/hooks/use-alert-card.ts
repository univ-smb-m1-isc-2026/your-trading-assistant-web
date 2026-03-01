import { useState, useEffect, useRef } from 'react'
import type { Alert, AlertType, AlertDirection, UpdateAlertRequest } from '@/types/api'

interface UseAlertCardProps {
  alert: Alert
  onUpdate: (id: number, data: UpdateAlertRequest) => Promise<void>
  onDelete: (id: number) => Promise<void>
}

export interface UseAlertCardReturn {
  editing: boolean
  confirming: boolean
  submitting: boolean
  editForm: {
    type: AlertType
    direction: AlertDirection
    threshold: string
    recurring: boolean
    error: string | null
  }
  setField: {
    setType: (type: AlertType) => void
    setDirection: (direction: AlertDirection) => void
    setThreshold: (threshold: string) => void
    setRecurring: (recurring: boolean) => void
  }
  handlers: {
    startEdit: () => void
    cancelEdit: () => void
    saveEdit: () => Promise<void>
    deleteClick: () => void
    toggleActive: () => Promise<void>
  }
}

export function useAlertCard({ alert, onUpdate, onDelete }: UseAlertCardProps): UseAlertCardReturn {
  const [editing, setEditing] = useState(false)
  const [confirming, setConfirming] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const confirmTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  // ─── État d'édition ──────────────────────────────────────────────
  const [editType, setEditType] = useState<AlertType>(alert.type)
  const [editDirection, setEditDirection] = useState<AlertDirection>(alert.direction)
  const [editThreshold, setEditThreshold] = useState(String(alert.thresholdValue))
  const [editRecurring, setEditRecurring] = useState(alert.recurring)
  const [editError, setEditError] = useState<string | null>(null)

  // Cleanup du timer de confirmation au démontage
  useEffect(() => {
    return () => {
      if (confirmTimer.current) clearTimeout(confirmTimer.current)
    }
  }, [])

  function startEdit() {
    setEditType(alert.type)
    setEditDirection(alert.direction)
    setEditThreshold(String(alert.thresholdValue))
    setEditRecurring(alert.recurring)
    setEditError(null)
    setEditing(true)
  }

  function cancelEdit() {
    setEditing(false)
    setEditError(null)
  }

  async function saveEdit() {
    setEditError(null)
    const value = parseFloat(editThreshold)
    if (isNaN(value) || value <= 0) {
      setEditError('Le seuil doit être un nombre positif.')
      return
    }

    setSubmitting(true)
    try {
      const data: UpdateAlertRequest = {}
      if (editType !== alert.type) data.type = editType
      if (editDirection !== alert.direction) data.direction = editDirection
      if (value !== alert.thresholdValue) data.thresholdValue = value
      if (editRecurring !== alert.recurring) data.recurring = editRecurring

      // Ne rien envoyer si rien n'a changé
      if (Object.keys(data).length > 0) {
        await onUpdate(alert.id, data)
      }
      setEditing(false)
    } catch (err) {
      setEditError(err instanceof Error ? err.message : 'Erreur lors de la modification.')
    } finally {
      setSubmitting(false)
    }
  }

  function deleteClick() {
    if (confirming) {
      // Deuxième clic = confirmation
      if (confirmTimer.current) clearTimeout(confirmTimer.current)
      setConfirming(false)
      setSubmitting(true)
      void onDelete(alert.id).finally(() => setSubmitting(false))
    } else {
      // Premier clic = passage en mode confirmation
      setConfirming(true)
      confirmTimer.current = setTimeout(() => {
        setConfirming(false)
      }, 3000)
    }
  }

  async function toggleActive() {
    setSubmitting(true)
    try {
      await onUpdate(alert.id, { active: !alert.active })
    } finally {
      setSubmitting(false)
    }
  }

  return {
    editing,
    confirming,
    submitting,
    editForm: {
      type: editType,
      direction: editDirection,
      threshold: editThreshold,
      recurring: editRecurring,
      error: editError
    },
    setField: {
      setType: setEditType,
      setDirection: setEditDirection,
      setThreshold: setEditThreshold,
      setRecurring: setEditRecurring
    },
    handlers: {
      startEdit,
      cancelEdit,
      saveEdit,
      deleteClick,
      toggleActive
    }
  }
}
