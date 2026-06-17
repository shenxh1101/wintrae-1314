import type { RepairStatus, UrgencyLevel } from '@/types/repair'

export const statusMap: Record<RepairStatus, { label: string; color: string }> = {
  pending: { label: '待接单', color: '#faad14' },
  processing: { label: '处理中', color: '#1677ff' },
  completed: { label: '待确认', color: '#fa8c16' },
  confirming: { label: '待确认', color: '#fa8c16' },
  rated: { label: '已评价', color: '#86909c' }
}

export const urgencyMap: Record<UrgencyLevel, { label: string; color: string }> = {
  normal: { label: '一般', color: '#1677ff' },
  urgent: { label: '紧急', color: '#faad14' },
  critical: { label: '非常紧急', color: '#ff4d4f' }
}

export const categoryMap: Record<string, { label: string; color: string }> = {
  notice: { label: '通知', color: '#1677ff' },
  maintenance: { label: '维护', color: '#52c41a' },
  safety: { label: '安全', color: '#ff4d4f' },
  activity: { label: '活动', color: '#722ed1' }
}

export const formatTime = (dateStr: string): string => {
  const date = new Date(dateStr)
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)

  if (minutes < 1) return '刚刚'
  if (minutes < 60) return `${minutes}分钟前`
  if (hours < 24) return `${hours}小时前`
  if (days < 7) return `${days}天前`

  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export const formatDateTime = (dateStr: string): string => {
  const date = new Date(dateStr)
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const hour = String(date.getHours()).padStart(2, '0')
  const minute = String(date.getMinutes()).padStart(2, '0')
  return `${year}-${month}-${day} ${hour}:${minute}`
}

export const formatLocation = (location: { building: string; unit: string; room: string }): string => {
  return `${location.building}栋${location.unit}单元${location.room}室`
}

export const generateOrderNo = (): string => {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0')
  return `BX${year}${month}${day}${random}`
}
