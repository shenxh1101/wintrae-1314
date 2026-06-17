import React, { useState, useMemo, useCallback } from 'react'
import { View, Text, Button, ScrollView, Input, Picker } from '@tarojs/components'
import Taro, { usePullDownRefresh } from '@tarojs/taro'
import classNames from 'classnames'
import type { RepairOrder, Maintainer, RepairStatus, UrgencyLevel } from '@/types/repair'
import { useRepairStore, OrderFilters, facilityTypes } from '@/store/useRepairStore'
import { formatDateTime, formatLocation, urgencyMap, statusMap } from '@/utils/format'
import { buildings as buildingList } from '@/data/mockRepair'
import styles from './index.module.scss'

type TabFilter =
  | 'all'
  | 'pending'
  | 'processing'
  | 'completed'
  | 'urgent'
  | 'overdue'
  | 'urged'

const tabFilters: { key: TabFilter; label: string; className?: string }[] = [
  { key: 'all', label: '全部' },
  { key: 'pending', label: '待接单' },
  { key: 'processing', label: '处理中' },
  { key: 'completed', label: '待确认' },
  { key: 'urgent', label: '紧急工单', className: 'urgent' },
  { key: 'overdue', label: '超时风险', className: 'overdue' },
  { key: 'urged', label: '已催单', className: 'urged' }
]

const urgencyOptions: { key: UrgencyLevel | ''; label: string }[] = [
  { key: '', label: '全部紧急程度' },
  { key: 'critical', label: '非常紧急' },
  { key: 'urgent', label: '紧急' },
  { key: 'normal', label: '一般' }
]

const buildingOptions = [{ key: '', label: '全部楼栋' }, ...buildingList.map(b => ({ key: b, label: `${b}栋` }))]
const facilityOptions = [{ key: '', label: '全部设施类型' }, ...facilityTypes.map(f => ({ key: f.id, label: `${f.icon} ${f.name}` }))]

const WorkbenchPage: React.FC = () => {
  const orders = useRepairStore(state => state.orders)
  const maintainers = useRepairStore(state => state.maintainers)
  const getFilteredOrders = useRepairStore(state => state.getFilteredOrders)
  const getUrgedOrders = useRepairStore(state => state.getUrgedOrders)
  const getPendingConfirmOrders = useRepairStore(state => state.getPendingConfirmOrders)
  const acceptOrder = useRepairStore(state => state.acceptOrder)
  const assignMaintainer = useRepairStore(state => state.assignMaintainer)
  const toggleMaintainerStatus = useRepairStore(state => state.toggleMaintainerStatus)
  const getServiceStats = useRepairStore(state => state.getServiceStats)

  const [activeTab, setActiveTab] = useState<TabFilter>('all')
  const [keyword, setKeyword] = useState('')
  const [building, setBuilding] = useState('')
  const [facilityType, setFacilityType] = useState('')
  const [urgency, setUrgency] = useState<UrgencyLevel | ''>('')
  const [maintainerName, setMaintainerName] = useState('')
  const [showFilterPanel, setShowFilterPanel] = useState(false)
  const [showAssignModal, setShowAssignModal] = useState(false)
  const [assigningOrderId, setAssigningOrderId] = useState<string | null>(null)
  const [selectedMaintainer, setSelectedMaintainer] = useState<string>('')

  const currentFilters: OrderFilters = useMemo(() => {
    const f: OrderFilters = {
      keyword,
      building,
      facilityType,
      urgency: urgency || undefined,
      maintainerName: maintainerName || undefined,
      status: (activeTab as OrderFilters['status']) || 'all'
    }
    return f
  }, [keyword, building, facilityType, urgency, maintainerName, activeTab])

  const filteredOrders = useMemo(() => getFilteredOrders(currentFilters), [currentFilters, getFilteredOrders])

  const topStats = useMemo(() => {
    const scope = filteredOrders
    const scopeAll = orders
    return {
      total: scopeAll.length,
      pending: scopeAll.filter(o => o.status === 'pending').length,
      processing: scopeAll.filter(o => o.status === 'processing').length,
      pendingConfirm: scopeAll.filter(o => o.status === 'completed').length,
      avgRating: getServiceStats().avgRating || '--',
      filteredCount: scope.length,
      urgentInScope: scope.filter(o => o.urgency === 'urgent' || o.urgency === 'critical').length,
      urgedInScope: scope.filter(o => (o.urgeRecords?.length || 0) > 0).length,
      pendingConfirmInScope: scope.filter(o => o.status === 'completed').length
    }
  }, [filteredOrders, orders, getServiceStats])

  const serviceStats = useMemo(() => getServiceStats(), [orders, getServiceStats])

  const maintainerOptions = useMemo(
    () => [{ key: '', label: '全部维修人员' }, ...maintainers.map(m => ({ key: m.name, label: m.name }))],
    [maintainers]
  )

  const maintainerWithStats = useMemo(() => {
    return maintainers.map(m => {
      const activeOrders = orders.filter(o => o.assignedTo === m.name && o.status === 'processing')
      const ratedOrders = orders.filter(o => o.assignedTo === m.name && o.status === 'rated' && o.rating)
      const avgRating = ratedOrders.length > 0
        ? Number((ratedOrders.reduce((sum, o) => sum + (o.rating || 0), 0) / ratedOrders.length).toFixed(1))
        : 0
      return {
        ...m,
        activeCount: activeOrders.length,
        completedCount: ratedOrders.length,
        avgRating
      }
    })
  }, [maintainers, orders])

  usePullDownRefresh(() => {
    setTimeout(() => {
      Taro.stopPullDownRefresh()
    }, 500)
  })

  const handleTabChange = useCallback((tab: TabFilter) => {
    setActiveTab(tab)
  }, [])

  const handleResetFilters = useCallback(() => {
    setKeyword('')
    setBuilding('')
    setFacilityType('')
    setUrgency('')
    setMaintainerName('')
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

  const handleBatchAccept = useCallback(() => {
    const pendingOrders = filteredOrders.filter(o => o.status === 'pending')
    if (pendingOrders.length === 0) {
      Taro.showToast({ title: '当前筛选下暂无可接工单', icon: 'none' })
      return
    }
    Taro.showModal({
      title: '批量接单',
      content: `确定要接取筛选范围内 ${pendingOrders.length} 个待接单工单吗？`,
      success: (res) => {
        if (res.confirm) {
          pendingOrders.forEach(o => acceptOrder(o.id))
          Taro.showToast({ title: `已接取 ${pendingOrders.length} 单`, icon: 'success' })
        }
      }
    })
  }, [filteredOrders, acceptOrder])

  const isUrgent = (order: RepairOrder) => order.urgency === 'urgent' || order.urgency === 'critical'
  const isOverdue = (order: RepairOrder) => {
    if (order.status !== 'processing' || !order.expectedTime) return false
    const now = Date.now()
    const expected = new Date(order.expectedTime).getTime()
    return expected - now < 3600000 * 4
  }
  const isUrged = (order: RepairOrder) => (order.urgeRecords?.length || 0) > 0

  const tabCounts = useMemo(() => ({
    all: orders.length,
    pending: orders.filter(o => o.status === 'pending').length,
    processing: orders.filter(o => o.status === 'processing').length,
    completed: orders.filter(o => o.status === 'completed').length,
    urgent: orders.filter(o => o.urgency === 'urgent' || o.urgency === 'critical').length,
    overdue: getFilteredOrders({ status: 'overdue' }).length,
    urged: getUrgedOrders().length
  }), [orders, getFilteredOrders, getUrgedOrders])

  return (
    <ScrollView className={styles.container} scrollY>
      <View className={styles.summarySection}>
        <Text className={styles.summaryTitle}>今日工单概览</Text>
        <View className={styles.summaryGrid}>
          <View className={styles.summaryItem}>
            <Text className={styles.summaryNum}>{topStats.total}</Text>
            <Text className={styles.summaryLabel}>总工单</Text>
          </View>
          <View className={styles.summaryItem}>
            <Text className={styles.summaryNum}>{topStats.pending}</Text>
            <Text className={styles.summaryLabel}>待接单</Text>
          </View>
          <View className={styles.summaryItem}>
            <Text className={styles.summaryNum}>{topStats.processing}</Text>
            <Text className={styles.summaryLabel}>处理中</Text>
          </View>
          <View className={styles.summaryItem}>
            <Text className={styles.summaryNum}>{topStats.pendingConfirm}</Text>
            <Text className={styles.summaryLabel}>待确认</Text>
          </View>
          <View className={styles.summaryItem}>
            <Text className={styles.summaryNum}>{topStats.avgRating}</Text>
            <Text className={styles.summaryLabel}>平均评分</Text>
          </View>
        </View>
        <View className={styles.filteredMeta}>
          <Text>当前筛选：匹配 {topStats.filteredCount} 单</Text>
          {topStats.urgentInScope > 0 && (
            <Text className={styles.urgentMeta}>· 紧急 {topStats.urgentInScope}</Text>
          )}
          {topStats.urgedInScope > 0 && (
            <Text className={styles.urgedMeta}>· 催单 {topStats.urgedInScope}</Text>
          )}
          {topStats.pendingConfirmInScope > 0 && (
            <Text className={styles.pendingConfirmMeta}>· 待确认 {topStats.pendingConfirmInScope}</Text>
          )}
        </View>
      </View>

      <View className={styles.searchRow}>
        <View className={styles.searchInputWrap}>
          <Text className={styles.searchIcon}>🔍</Text>
          <Input
            className={styles.searchInput}
            placeholder="搜索标题/描述/单号/报修人"
            value={keyword}
            onInput={e => setKeyword(e.detail.value)}
            confirmType="search"
          />
        </View>
        <View
          className={classNames(styles.filterToggle, showFilterPanel && styles.active)}
          onClick={() => setShowFilterPanel(v => !v)}
        >
          <Text>筛选</Text>
          <Text className={styles.filterIcon}>▼</Text>
        </View>
      </View>

      {showFilterPanel && (
        <View className={styles.filterPanel}>
          <View className={styles.filterRow}>
            <Text className={styles.filterLabel}>楼栋</Text>
            <Picker
              mode="selector"
              range={buildingOptions.map(o => o.label)}
              rangeKey="label"
              onChange={e => setBuilding(buildingOptions[Number(e.detail.value)].key)}
            >
              <View className={styles.filterPicker}>
                <Text>{buildingOptions.find(o => o.key === building)?.label || '全部楼栋'}</Text>
                <Text className={styles.pickerArrow}>▼</Text>
              </View>
            </Picker>
          </View>

          <View className={styles.filterRow}>
            <Text className={styles.filterLabel}>设施类型</Text>
            <Picker
              mode="selector"
              range={facilityOptions.map(o => o.label)}
              rangeKey="label"
              onChange={e => setFacilityType(facilityOptions[Number(e.detail.value)].key)}
            >
              <View className={styles.filterPicker}>
                <Text>{facilityOptions.find(o => o.key === facilityType)?.label || '全部设施类型'}</Text>
                <Text className={styles.pickerArrow}>▼</Text>
              </View>
            </Picker>
          </View>

          <View className={styles.filterRow}>
            <Text className={styles.filterLabel}>紧急程度</Text>
            <Picker
              mode="selector"
              range={urgencyOptions.map(o => o.label)}
              onChange={e => setUrgency(urgencyOptions[Number(e.detail.value)].key as UrgencyLevel | '')}
            >
              <View className={styles.filterPicker}>
                <Text>{urgencyOptions.find(o => o.key === urgency)?.label || '全部紧急程度'}</Text>
                <Text className={styles.pickerArrow}>▼</Text>
              </View>
            </Picker>
          </View>

          <View className={styles.filterRow}>
            <Text className={styles.filterLabel}>维修人员</Text>
            <Picker
              mode="selector"
              range={maintainerOptions.map(o => o.label)}
              onChange={e => setMaintainerName(maintainerOptions[Number(e.detail.value)].key)}
            >
              <View className={styles.filterPicker}>
                <Text>{maintainerOptions.find(o => o.key === maintainerName)?.label || '全部维修人员'}</Text>
                <Text className={styles.pickerArrow}>▼</Text>
              </View>
            </Picker>
          </View>

          <View className={styles.filterActions}>
            <Button className={styles.filterReset} onClick={handleResetFilters}>重置</Button>
            <Button className={styles.filterClose} onClick={() => setShowFilterPanel(false)}>收起</Button>
          </View>
        </View>
      )}

      <View className={styles.filterTabs}>
        {tabFilters.map(filter => (
          <View
            key={filter.key}
            className={classNames(
              styles.filterTab,
              filter.className,
              activeTab === filter.key && styles.active
            )}
            onClick={() => handleTabChange(filter.key)}
          >
            <Text>{filter.label}</Text>
            <Text className={styles.tabCount}>{tabCounts[filter.key]}</Text>
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
                  进行中 {m.activeCount} · 已评价 {m.completedCount}
                  {m.avgRating > 0 && ` · ⭐${m.avgRating}`}
                </Text>
              </View>
            </View>
          ))}
        </View>
      </View>

      <View className={styles.sectionHeader}>
        <Text className={styles.sectionTitle}>📋 工单列表</Text>
        <Text className={styles.resultCount}>共 {filteredOrders.length} 条</Text>
      </View>

      {filteredOrders.length > 0 ? (
        <View className={styles.orderList}>
          {filteredOrders.map(order => (
            <View
              key={order.id}
              className={classNames(
                styles.orderCard,
                isUrgent(order) && styles.urgent,
                isOverdue(order) && styles.overdue,
                isUrged(order) && styles.urged
              )}
              onClick={() => handleOrderClick(order.id)}
            >
              <View className={styles.orderHeader}>
                <Text className={styles.orderTitle}>{order.title}</Text>
                <View className={styles.orderBadges}>
                  {isUrged(order) && (
                    <View className={classNames(styles.orderBadge, 'urged')}>
                      ⏰ 催单{order.urgeRecords.length}次
                    </View>
                  )}
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
                  <View className={classNames(styles.orderMetaItem, styles.maintainerMeta)}>
                    <Text>👷</Text>
                    <Text>{order.assignedTo}</Text>
                  </View>
                )}
              </View>

              {isUrged(order) && order.urgeRecords.length > 0 && (
                <View className={styles.urgeInfo}>
                  <Text className={styles.urgeIcon}>⏰</Text>
                  <Text className={styles.urgeText}>
                    最近催单：{formatDateTime(order.urgeRecords[order.urgeRecords.length - 1].time)}
                  </Text>
                </View>
              )}

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
                {order.status === 'completed' && (
                  <Button
                    className={classNames(styles.actionBtn, 'warning')}
                    onClick={(e) => {
                      e.stopPropagation()
                      handleOrderClick(order.id)
                    }}
                  >
                    跟进确认
                  </Button>
                )}
              </View>
            </View>
          ))}
        </View>
      ) : (
        <View className={styles.emptyState}>
          <Text className={styles.emptyIcon}>📭</Text>
          <Text className={styles.emptyText}>暂无匹配条件的工单</Text>
          <Text className={styles.emptySubText}>试试调整筛选条件</Text>
        </View>
      )}

      <View style={{ height: 40 }} />

      <View className={styles.floatingActions}>
        {tabCounts.urged > 0 && (
          <View
            className={classNames(styles.floatingBtn, 'urged')}
            onClick={() => handleTabChange('urged')}
          >
            <Text>⏰{tabCounts.urged}</Text>
          </View>
        )}
        {tabCounts.completed > 0 && (
          <View
            className={classNames(styles.floatingBtn, 'confirm')}
            onClick={() => handleTabChange('completed')}
          >
            <Text>✅{tabCounts.completed}</Text>
          </View>
        )}
        {tabCounts.urgent > 0 && (
          <View
            className={classNames(styles.floatingBtn, 'urgent')}
            onClick={() => handleTabChange('urgent')}
          >
            <Text>⚠️{tabCounts.urgent}</Text>
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
