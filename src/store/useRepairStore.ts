import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import Taro from '@tarojs/taro'
import type { RepairOrder, ProcessingRecord, FacilityType, RepairPhoto, BuildingInfo, UrgencyLevel, Maintainer } from '@/types/repair'
import { mockRepairOrders, facilityTypes, maintainers as defaultMaintainers, buildings, units, rooms } from '@/data/mockRepair'
import { generateOrderNo } from '@/utils/format'

interface ServiceStats {
  avgRating: number
  totalRated: number
  maintainerRank: { name: string; count: number; avgRating: number }[]
  facilityRank: { name: string; count: number }[]
}

interface RepairState {
  orders: RepairOrder[]
  maintainers: Maintainer[]
  currentRole: 'resident' | 'property'

  getOrders: () => RepairOrder[]
  getOrderById: (id: string) => RepairOrder | undefined
  getOrdersByStatus: (status: string) => RepairOrder[]
  getUrgentOrders: () => RepairOrder[]
  getOverdueRiskOrders: () => RepairOrder[]

  addOrder: (data: {
    facilityType: FacilityType
    location: BuildingInfo
    title: string
    description: string
    urgency: UrgencyLevel
    photos: RepairPhoto[]
    phone: string
    submitter?: string
  }) => RepairOrder

  updateOrder: (id: string, updater: (order: RepairOrder) => RepairOrder) => void

  addProcessingRecord: (orderId: string, record: Omit<ProcessingRecord, 'id' | 'time'>) => void

  acceptOrder: (orderId: string) => void
  assignMaintainer: (orderId: string, maintainerId: string) => void
  updateExpectedTime: (orderId: string, time: string) => void
  addProcessRecord: (orderId: string, content: string, photos?: RepairPhoto[]) => void
  completeOrder: (orderId: string, content: string, photos?: RepairPhoto[]) => void
  supplementOrder: (orderId: string, content: string) => void
  rateOrder: (orderId: string, rating: number, comment?: string) => void

  setRole: (role: 'resident' | 'property') => void
  toggleMaintainerStatus: (maintainerId: string) => void

  getServiceStats: () => ServiceStats

  resetToDefault: () => void
}

const taroStorage = {
  getItem: (name: string) => {
    try {
      return Taro.getStorageSync(name)
    } catch {
      return null
    }
  },
  setItem: (name: string, value: string) => {
    try {
      Taro.setStorageSync(name, value)
    } catch {}
  },
  removeItem: (name: string) => {
    try {
      Taro.removeStorageSync(name)
    } catch {}
  }
}

export const useRepairStore = create<RepairState>()(
  persist(
    (set, get) => ({
      orders: [...mockRepairOrders].sort((a, b) => new Date(b.submitTime).getTime() - new Date(a.submitTime).getTime()),
      maintainers: [...defaultMaintainers],
      currentRole: 'resident',

      getOrders: () => get().orders,

      getOrderById: (id) => get().orders.find(o => o.id === id),

      getOrdersByStatus: (status) => {
        const orders = get().orders
        if (status === 'all') return orders
        return orders.filter(o => o.status === status)
      },

      getUrgentOrders: () => get().orders.filter(o => o.urgency === 'urgent' || o.urgency === 'critical'),

      getOverdueRiskOrders: () => {
        const now = Date.now()
        return get().orders.filter(o => {
          if (o.status !== 'processing' || !o.expectedTime) return false
          const expected = new Date(o.expectedTime).getTime()
          return expected - now < 3600000 * 4
        })
      },

      addOrder: (data) => {
        const newOrder: RepairOrder = {
          id: `o_${Date.now()}`,
          orderNo: generateOrderNo(),
          title: data.title.trim(),
          facilityType: data.facilityType,
          location: { ...data.location },
          description: data.description.trim(),
          urgency: data.urgency,
          photos: [...data.photos],
          status: 'pending',
          submitter: data.submitter || '业主',
          submitterPhone: data.phone,
          submitTime: new Date().toISOString(),
          processingRecords: [
            {
              id: `r_${Date.now()}`,
              type: 'submit',
              title: '提交报修',
              content: `提交报修工单：${data.title.trim()}`,
              operator: data.submitter || '业主',
              operatorRole: 'resident',
              time: new Date().toISOString()
            }
          ]
        }
        set(state => ({
          orders: [newOrder, ...state.orders]
        }))
        return newOrder
      },

      updateOrder: (id, updater) => {
        set(state => ({
          orders: state.orders.map(o => o.id === id ? updater(o) : o)
        }))
      },

      addProcessingRecord: (orderId, record) => {
        const newRecord: ProcessingRecord = {
          ...record,
          id: `r_${Date.now()}`,
          time: new Date().toISOString()
        }
        get().updateOrder(orderId, prev => ({
          ...prev,
          processingRecords: [...prev.processingRecords, newRecord]
        }))
      },

      acceptOrder: (orderId) => {
        get().updateOrder(orderId, prev => ({
          ...prev,
          status: 'processing',
          acceptedTime: new Date().toISOString()
        }))
        get().addProcessingRecord(orderId, {
          type: 'accept',
          title: '物业接单',
          content: '物业已接单，正在安排维修人员',
          operator: '物业管理员',
          operatorRole: 'property'
        })
      },

      assignMaintainer: (orderId, maintainerId) => {
        const maintainer = get().maintainers.find(m => m.id === maintainerId)
        if (!maintainer) return

        get().updateOrder(orderId, prev => ({
          ...prev,
          assignedTo: maintainer.name,
          assignedTime: new Date().toISOString()
        }))
        get().addProcessingRecord(orderId, {
          type: 'assign',
          title: '分派维修人员',
          content: `已分派${maintainer.name}处理此工单`,
          operator: '物业管理员',
          operatorRole: 'property'
        })
        set(state => ({
          maintainers: state.maintainers.map(m =>
            m.id === maintainerId ? { ...m, status: 'busy' as const } : m
          )
        }))
      },

      updateExpectedTime: (orderId, time) => {
        get().updateOrder(orderId, prev => ({
          ...prev,
          expectedTime: new Date(time).toISOString()
        }))
        get().addProcessingRecord(orderId, {
          type: 'process',
          title: '变更预计完成时间',
          content: `预计完成时间变更为${new Date(time).toLocaleString('zh-CN')}`,
          operator: '物业管理员',
          operatorRole: 'property'
        })
      },

      addProcessRecord: (orderId, content, photos) => {
        const order = get().getOrderById(orderId)
        get().addProcessingRecord(orderId, {
          type: 'process',
          title: '维修中',
          content: content.trim(),
          operator: order?.assignedTo || '维修人员',
          operatorRole: 'maintainer',
          photos: photos && photos.length > 0 ? [...photos] : undefined
        })
      },

      completeOrder: (orderId, content, photos) => {
        const order = get().getOrderById(orderId)
        get().updateOrder(orderId, prev => ({
          ...prev,
          status: 'completed',
          completedTime: new Date().toISOString()
        }))
        get().addProcessingRecord(orderId, {
          type: 'complete',
          title: '维修完成',
          content: content.trim(),
          operator: order?.assignedTo || '维修人员',
          operatorRole: 'maintainer',
          photos: photos && photos.length > 0 ? [...photos] : undefined
        })
        if (order?.assignedTo) {
          set(state => ({
            maintainers: state.maintainers.map(m =>
              m.name === order.assignedTo ? { ...m, status: 'free' as const } : m
            )
          }))
        }
      },

      supplementOrder: (orderId, content) => {
        get().addProcessingRecord(orderId, {
          type: 'supplement',
          title: '住户补充说明',
          content: content.trim(),
          operator: '业主',
          operatorRole: 'resident'
        })
      },

      rateOrder: (orderId, rating, comment) => {
        get().updateOrder(orderId, prev => ({
          ...prev,
          status: 'rated',
          rating,
          ratingComment: comment?.trim(),
          ratedTime: new Date().toISOString()
        }))
        get().addProcessingRecord(orderId, {
          type: 'rate',
          title: '住户评价',
          content: comment?.trim() || `评分${rating}星`,
          operator: '业主',
          operatorRole: 'resident'
        })
      },

      setRole: (role) => set({ currentRole: role }),

      toggleMaintainerStatus: (maintainerId) => {
        set(state => ({
          maintainers: state.maintainers.map(m =>
            m.id === maintainerId ? { ...m, status: m.status === 'free' ? 'busy' as const : 'free' as const } : m
          )
        }))
      },

      getServiceStats: () => {
        const orders = get().orders
        const ratedOrders = orders.filter(o => o.rating && o.status === 'rated')
        const closedOrders = orders.filter(o => o.status === 'completed' || o.status === 'rated')

        const avgRating = ratedOrders.length > 0
          ? Number((ratedOrders.reduce((sum, o) => sum + (o.rating || 0), 0) / ratedOrders.length).toFixed(1))
          : 0

        const maintainerMap = new Map<string, { count: number; totalRating: number }>()
        const facilityMap = new Map<string, number>()

        closedOrders.forEach(o => {
          if (o.facilityType) {
            facilityMap.set(o.facilityType.name, (facilityMap.get(o.facilityType.name) || 0) + 1)
          }
          if (o.assignedTo && (o.status === 'completed' || o.status === 'rated')) {
            const current = maintainerMap.get(o.assignedTo) || { count: 0, totalRating: 0 }
            current.count++
            if (o.rating) {
              current.totalRating += o.rating
            }
            maintainerMap.set(o.assignedTo, current)
          }
        })

        const maintainerRank = Array.from(maintainerMap.entries())
          .map(([name, data]) => ({
            name,
            count: data.count,
            avgRating: data.count > 0 ? Number((data.totalRating / data.count).toFixed(1)) : 0
          }))
          .sort((a, b) => b.count - a.count)

        const facilityRank = Array.from(facilityMap.entries())
          .map(([name, count]) => ({ name, count }))
          .sort((a, b) => b.count - a.count)
          .slice(0, 5)

        return {
          avgRating,
          totalRated: ratedOrders.length,
          totalClosed: closedOrders.length,
          maintainerRank,
          facilityRank
        }
      },

      resetToDefault: () => {
        set({
          orders: [...mockRepairOrders].sort((a, b) => new Date(b.submitTime).getTime() - new Date(a.submitTime).getTime()),
          maintainers: [...defaultMaintainers]
        })
      }
    }),
    {
      name: 'repair-storage',
      storage: createJSONStorage(() => taroStorage),
      partialize: (state) => ({
        orders: state.orders,
        maintainers: state.maintainers,
        currentRole: state.currentRole
      })
    }
  )
)

export { facilityTypes, buildings, units, rooms }
