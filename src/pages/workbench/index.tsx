import React, { useState, useMemo, useCallback } from 'react'
import { View, Text, Button, ScrollView } from '@tarojs/components'
import Taro, { usePullDownRefresh } from '@tarojs/taro'
import classNames from 'classnames'
import type { RepairOrder, Maintainer } from '@/types/repair'
import { useRepairStore } from '@/store/useRepairStore'
import { formatDateTime, formatLocation, urgencyMap, statusMap } from '@/utils/format'
import styles from './index.module.scss'

type FilterType = 'all' | 'pending' | 'processing' | 'urgent' | 'overdue'

const filters: { key: FilterType; label: string; className?: string }[] = [
  { key: 'all', label: '全部' },
  { key: 'pending', label: '待接单' },
  { key: 'processing', label: '处理中' },
  { key: 'urgent', label: '紧急工单', className: 'urgent' },
  { key: 'overdue', label: '超时风险', className: 'overdue' }
]

const WorkbenchPage: React.FC = () => {
  const orders = useRepairStore(state => state.orders)
  const maintainers = useRepairStore(state => state.maintainers)
  const getUrgentOrders = useRepairStore(state => state.getUrgentOrders)
  const getOverdueRiskOrders = useRepairStore(state => state.getOverdueRiskOrders)
  const acceptOrder = useRepairStore(state => state.acceptOrder)
  const assignMaintainer = useRepairStore(state => state.assignMaintainer)
  const toggleMaintainerStatus = useRepairStore(state => state.toggleMaintainerStatus)
  const getServiceStats = useRepairStore(state => state.getServiceStats)

  const [activeFilter, setActiveFilter] = useState<FilterType>('all')
  const [showAssignModal, setShowAssignModal] = useState(false)
  const [assigningOrderId, setAssigningOrderId] = useState<string | null>(null)
  const [selectedMaintainer, setSelectedMaintainer] = useState<string>('')

  const stats = useMemo(() => {
    const urgentList = getUrgentOrders()
    const overdueList = getOverdueRiskOrders()
    return {
      all: orders.length,
      pending: orders.filter(o => o.status === 'pending').length,
      processing: orders.filter(o => o.status === 'processing').length,
      urgent: urgentList.length,
      overdue: overdueList.length
    }
  }, [orders, getUrgentOrders, getOverdueRiskOrders])

  const serviceStats = useMemo(() => getServiceStats(), [orders, getServiceStats])

  const filteredOrders = useMemo(() => {
    let result = [...orders]
    switch (activeFilter) {
      case 'pending':
        result = result.filter(o => o.status === 'pending')
        break
      case 'processing':
        result = result.filter(o => o.status === 'processing')
        break
      case 'urgent':
        result = getUrgentOrders()
        break
      case 'overdue':
        result = getOverdueRiskOrders()
        break
    }
    return result.sort((a, b) => {
      const urgencyOrder = { critical: 0, urgent: 1, normal: 2 }
      if (urgencyOrder[a.urgency] !== urgencyOrder[b.urgency]) {
        return urgencyOrder[a.urgency] - urgencyOrder[b.urgency]
      }
      return new Date(b.submitTime).getTime() - new Date(a.submitTime).getTime()
    })
  }, [orders, activeFilter, getUrgentOrders, getOverdueRiskOrders])

  const maintainerWithStats = useMemo(() => {
    return maintainers.map(m => {
      const activeOrders = orders.filter(o => o.assignedTo === m.name && o.status === 'processing')
      const closedOrders = orders.filter(o =>
        o.assignedTo === m.name && (o.status === 'completed' || o.status === 'rated')
      )
      const ratedOrders = closedOrders.filter(o => o.rating)
      const avgRating = ratedOrders.length > 0
        ? Number((ratedOrders.reduce((sum, o) => sum + (o.rating || 0), 0) / ratedOrders.length).toFixed(1))
        : 0
      return {
        ...m,
        activeCount: activeOrders.length,
        completedCount: closedOrders.length,
        avgRating
      }
    })
  }, [maintainers, orders])

  usePullDownRefresh(() => {
    setTimeout(() => {
      Taro.stopPullDownRefresh()
    }, 500)
  })

  const handleFilterChange = useCallback((filter: FilterType) => {
    setActiveFilter(filter)
  }, [])

  const handleOrderClick = useCallback((orderId: string) => {
    Taro.navigateTo({ url: `/pages/detail/index?id=${orderId}` })
  }, [])

  const handleAcceptOrder = useCallback((orderId: string) => {
    Taro.showModal({
      title: '确认接单',
      content: '确定要接取此工单吗？',
      success: (res) => {
        if (res.confirm) {
          acceptOrder(orderId)
          Taro.showToast({ title: '接单成功', icon: 'success' })
        }
      }
    })
  }, [acceptOrder])

  const handleOpenAssignModal = useCallback((orderId: string) => {
    setAssigningOrderId(orderId)
    setSelectedMaintainer('')
    setShowAssignModal(true)
  }, [])

  const handleConfirmAssign = useCallback(() => {
    if (!assigningOrderId || !selectedMaintainer) {
      Taro.showToast({ title: '请选择维修人员', icon: 'none' })
      return
    }
    assignMaintainer(assigningOrderId, selectedMaintainer)
    setShowAssignModal(false)
    setAssigningOrderId(null)
    setSelectedMaintainer('')
    Taro.showToast({ title: '分派成功', icon: 'success' })
  }, [assigningOrderId, selectedMaintainer, assignMaintainer])

  const handleToggleMaintainerStatus = useCallback((maintainerId: string, name: string) => {
    Taro.showActionSheet({
      itemList: ['设为空闲', '设为忙碌'],
      success: (res) => {
        const maintainer = maintainers.find(m => m.id === maintainerId)
        if (res.tapIndex === 0 && maintainer?.status !== 'free') {
          toggleMaintainerStatus(maintainerId)
          Taro.showToast({ title: `${name}已设为空闲`, icon: 'success' })
        } else if (res.tapIndex === 1 && maintainer?.status !== 'busy') {
          toggleMaintainerStatus(maintainerId)
          Taro.showToast({ title: `${name}已设为忙碌`, icon: 'success' })
        }
      }
    })
  }, [maintainers, toggleMaintainerStatus])

  const handleViewUrgent = useCallback(() => {
    setActiveFilter('urgent')
  }, [])

  const handleBatchAccept = useCallback(() => {
    const pendingOrders = orders.filter(o => o.status === 'pending')
    if (pendingOrders.length === 0) {
      Taro.showToast({ title: '暂无可接工单', icon: 'none' })
      return
    }
    Taro.showModal({
      title: '批量接单',
      content: `确定要接取全部 ${pendingOrders.length} 个待接单工单吗？`,
      success: (res) => {
        if (res.confirm) {
          pendingOrders.forEach(o => acceptOrder(o.id))
          Taro.showToast({ title: `已接取 ${pendingOrders.length} 单`, icon: 'success' })
        }
      }
    })
  }, [orders, acceptOrder])

  const isUrgent = (order: RepairOrder) => order.urgency === 'urgent' || order.urgency === 'critical'
  const isOverdue = (order: RepairOrder) => {
    if (order.status !== 'processing' || !order.expectedTime) return false
    const now = Date.now()
    const expected = new Date(order.expectedTime).getTime()
    return expected - now < 3600000 * 4
  }

  return (
    <ScrollView className={styles.container} scrollY>
      <View className={styles.summarySection}>
        <Text className={styles.summaryTitle}>今日工单概览</Text>
        <View className={styles.summaryGrid}>
          <View className={styles.summaryItem}>
            <Text className={styles.summaryNum}>{stats.all}</Text>
            <Text className={styles.summaryLabel}>总工单</Text>
          </View>
          <View className={styles.summaryItem}>
            <Text className={styles.summaryNum}>{stats.pending}</Text>
            <Text className={styles.summaryLabel}>待接单</Text>
          </View>
          <View className={styles.summaryItem}>
            <Text className={styles.summaryNum}>{stats.processing}</Text>
            <Text className={styles.summaryLabel}>处理中</Text>
          </View>
          <View className={styles.summaryItem}>
            <Text className={styles.summaryNum}>{serviceStats.avgRating || '--'}</Text>
            <Text className={styles.summaryLabel}>平均评分</Text>
          </View>
        </View>
      </View>

      <View className={styles.filterTabs}>
        {filters.map(filter => (
          <View
            key={filter.key}
            className={classNames(
              styles.filterTab,
              filter.className,
              activeFilter === filter.key && styles.active
            )}
            onClick={() => handleFilterChange(filter.key)}
          >
            <Text>{filter.label}</Text>
            <Text className={styles.tabCount}>{stats[filter.key]}</Text>
          </View>
        ))}
      </View>

      <View className={styles.maintainerSection}>
        <View className={styles.sectionHeader}>
          <Text className={styles.sectionTitle}>👷 维修人员状态</Text>
          <Text style={{ fontSize: 24, color: '#86909c' }}>点击可切换状态</Text>
        </View>
        <View className={styles.maintainerList}>
          {maintainerWithStats.map(m => (
            <View
              key={m.id}
              className={styles.maintainerItem}
              onClick={() => handleToggleMaintainerStatus(m.id, m.name)}
            >
              <View className={styles.maintainerInfo}>
                <Text className={styles.maintainerName}>{m.name}</Text>
                <Text className={styles.maintainerSpecialty}>
                  特长：{m.specialty.join('、')}
                </Text>
              </View>
              <View className={styles.maintainerStatus}>
                <View className={classNames(styles.statusBadge, m.status)}>
                  <View className={styles.statusDot} />
                  <Text>{m.status === 'free' ? '空闲' : '忙碌'}</Text>
                </View>
                <Text className={styles.maintainerCount}>
                  进行中 {m.activeCount} · 已完成 {m.completedCount}
                </Text>
              </View>
            </View>
          ))}
        </View>
      </View>

      <View className={styles.sectionHeader}>
        <Text className={styles.sectionTitle}>📋 工单列表</Text>
      </View>

      {filteredOrders.length > 0 ? (
        <View className={styles.orderList}>
          {filteredOrders.map(order => (
            <View
              key={order.id}
              className={classNames(
                styles.orderCard,
                isUrgent(order) && styles.urgent,
                isOverdue(order) && styles.overdue
              )}
              onClick={() => handleOrderClick(order.id)}
            >
              <View className={styles.orderHeader}>
                <Text className={styles.orderTitle}>{order.title}</Text>
                <View className={styles.orderBadges}>
                  {isOverdue(order) && (
                    <View className={classNames(styles.orderBadge, 'overdue')}>
                      超时风险
                    </View>
                  )}
                  {(order.urgency === 'urgent' || order.urgency === 'critical') && (
                    <View className={classNames(styles.orderBadge, order.urgency)}>
                      {urgencyMap[order.urgency].label}
                    </View>
                  )}
                  <View className={classNames(styles.orderBadge, order.status)}>
                    {statusMap[order.status].label}
                  </View>
                </View>
              </View>

              <View className={styles.orderMeta}>
                <View className={styles.orderMetaItem}>
                  <Text>{order.facilityType.icon}</Text>
                  <Text>{order.facilityType.name}</Text>
                </View>
                <View className={styles.orderMetaItem}>
                  <Text>📍</Text>
                  <Text>{formatLocation(order.location)}</Text>
                </View>
                <View className={styles.orderMetaItem}>
                  <Text>⏰</Text>
                  <Text>{formatDateTime(order.submitTime)}</Text>
                </View>
                {order.assignedTo && (
                  <View className={styles.orderMetaItem}>
                    <Text>👷</Text>
                    <Text>{order.assignedTo}</Text>
                  </View>
                )}
              </View>

              <Text className={styles.orderDesc}>{order.description}</Text>

              <View className={styles.orderActions}>
                <Button
                  className={classNames(styles.actionBtn, 'secondary')}
                  onClick={(e) => {
                    e.stopPropagation()
                    handleOrderClick(order.id)
                  }}
                >
                  查看详情
                </Button>
                {order.status === 'pending' && (
                  <Button
                    className={classNames(styles.actionBtn, 'primary')}
                    onClick={(e) => {
                      e.stopPropagation()
                      handleAcceptOrder(order.id)
                    }}
                  >
                    立即接单
                  </Button>
                )}
                {order.status === 'processing' && !order.assignedTo && (
                  <Button
                    className={classNames(styles.actionBtn, 'success')}
                    onClick={(e) => {
                      e.stopPropagation()
                      handleOpenAssignModal(order.id)
                    }}
                  >
                    分派人员
                  </Button>
                )}
              </View>
            </View>
          ))}
        </View>
      ) : (
        <View className={styles.emptyState}>
          <Text className={styles.emptyIcon}>📭</Text>
          <Text className={styles.emptyText}>暂无{filters.find(f => f.key === activeFilter)?.label}工单</Text>
          <Text className={styles.emptySubText}>切换筛选条件查看其他工单</Text>
        </View>
      )}

      <View style={{ height: 40 }} />

      <View className={styles.floatingActions}>
        {stats.urgent > 0 && (
          <View
            className={classNames(styles.floatingBtn, 'urgent')}
            onClick={handleViewUrgent}
          >
            <Text>⚠️{stats.urgent}</Text>
          </View>
        )}
        <View
          className={classNames(styles.floatingBtn, 'primary')}
          onClick={handleBatchAccept}
        >
          <Text>📥</Text>
        </View>
      </View>

      {showAssignModal && (
        <View
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'flex-end',
            zIndex: 999
          }}
          onClick={() => setShowAssignModal(false)}
        >
          <View
            style={{
              width: '100%',
              background: '#fff',
              borderRadius: '24rpx 24rpx 0 0',
              padding: 40,
              maxHeight: '70vh'
            }}
            onClick={e => e.stopPropagation()}
          >
            <Text style={{ fontSize: 32, fontWeight: 600, marginBottom: 32, textAlign: 'center' }}>
              选择维修人员
            </Text>
            {maintainers.filter(m => m.status === 'free').length === 0 ? (
              <View style={{ padding: '48rpx 0', textAlign: 'center' }}>
                <Text style={{ fontSize: 28, color: '#86909c' }}>暂无空闲维修人员</Text>
              </View>
            ) : (
              maintainers.filter(m => m.status === 'free').map(m => (
                <View
                  key={m.id}
                  style={{
                    padding: 24,
                    marginBottom: 16,
                    borderRadius: 12,
                    border: `2rpx solid ${selectedMaintainer === m.id ? '#1677ff' : '#e5e6eb'}`,
                    background: selectedMaintainer === m.id ? 'rgba(22,119,255,0.05)' : '#fff'
                  }}
                  onClick={() => setSelectedMaintainer(m.id)}
                >
                  <View style={{ fontWeight: 600, marginBottom: 8 }}>
                    👷 {m.name}
                  </View>
                  <View style={{ fontSize: 24, color: '#86909c' }}>
                    特长：{m.specialty.join('、')}
                  </View>
                </View>
              ))
            )}
            <View style={{ display: 'flex', gap: 16, marginTop: 32 }}>
              <Button
                style={{
                  flex: 1,
                  height: 80,
                  borderRadius: 12,
                  background: '#f2f3f5',
                  color: '#4e5969',
                  fontSize: 28
                }}
                onClick={() => setShowAssignModal(false)}
              >
                取消
              </Button>
              <Button
                style={{
                  flex: 1,
                  height: 80,
                  borderRadius: 12,
                  background: '#1677ff',
                  color: '#fff',
                  fontSize: 28
                }}
                onClick={handleConfirmAssign}
                disabled={!selectedMaintainer}
              >
                确认分派
              </Button>
            </View>
          </View>
        </View>
      )}
    </ScrollView>
  )
}

export default WorkbenchPage
