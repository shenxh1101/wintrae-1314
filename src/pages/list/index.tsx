import React, { useState, useMemo } from 'react'
import { View, Text, ScrollView } from '@tarojs/components'
import Taro, { useDidShow, usePullDownRefresh } from '@tarojs/taro'
import classNames from 'classnames'
import type { RepairStatus } from '@/types/repair'
import { useRepairStore } from '@/store/useRepairStore'
import RepairCard from '@/components/RepairCard'
import styles from './index.module.scss'

type TabType = 'all' | RepairStatus

const tabs: { key: TabType; label: string }[] = [
  { key: 'all', label: '全部' },
  { key: 'pending', label: '待接单' },
  { key: 'processing', label: '处理中' },
  { key: 'completed', label: '已完成' },
  { key: 'rated', label: '已评价' }
]

const ListPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('all')
  const orders = useRepairStore(state => state.orders)

  usePullDownRefresh(() => {
    setTimeout(() => {
      Taro.stopPullDownRefresh()
    }, 500)
  })

  const filteredOrders = useMemo(() => {
    if (activeTab === 'all') return orders
    return orders.filter(o => o.status === activeTab)
  }, [orders, activeTab])

  const tabCounts = useMemo(() => ({
    all: orders.length,
    pending: orders.filter(o => o.status === 'pending').length,
    processing: orders.filter(o => o.status === 'processing').length,
    completed: orders.filter(o => o.status === 'completed').length,
    rated: orders.filter(o => o.status === 'rated').length
  }), [orders])

  const handleTabChange = (key: TabType) => {
    console.log('[ListPage] 切换Tab:', key)
    setActiveTab(key)
  }

  const handleOrderClick = (orderId: string) => {
    console.log('[ListPage] 查看工单详情:', orderId)
    Taro.navigateTo({ url: `/pages/detail/index?id=${orderId}` })
  }

  const handleAddOrder = () => {
    console.log('[ListPage] 新增工单')
    Taro.navigateTo({ url: '/pages/submit/index' })
  }

  return (
    <View className={styles.container}>
      <View className={styles.tabs}>
        {tabs.map(tab => (
          <View
            key={tab.key}
            className={classNames(styles.tabItem, activeTab === tab.key && styles.active)}
            onClick={() => handleTabChange(tab.key)}
          >
            <Text>{tab.label}</Text>
            {tabCounts[tab.key] > 0 && (
              <Text className={styles.tabCount}>{tabCounts[tab.key]}</Text>
            )}
          </View>
        ))}
      </View>

      <ScrollView className={styles.list} scrollY>
        {filteredOrders.length > 0 ? (
          filteredOrders.map(order => (
            <RepairCard
              key={order.id}
              order={order}
              onClick={() => handleOrderClick(order.id)}
            />
          ))
        ) : (
          <View className={styles.emptyState}>
            <Text className={styles.emptyIcon}>📭</Text>
            <Text className={styles.emptyText}>暂无工单</Text>
            <Text className={styles.emptySubText}>
              {activeTab === 'all' ? '您还没有提交过工单' : `当前没有${tabs.find(t => t.key === activeTab)?.label}的工单`}
            </Text>
          </View>
        )}
      </ScrollView>

      <View className={styles.floatingBtn} onClick={handleAddOrder}>
        <Text className={styles.btnIcon}>+</Text>
      </View>
    </View>
  )
}

export default ListPage
