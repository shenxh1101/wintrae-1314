import React, { useState, useMemo } from 'react'
import { View, Text, Button, Swiper, SwiperItem, Image, ScrollView } from '@tarojs/components'
import Taro, { usePullDownRefresh } from '@tarojs/taro'
import classNames from 'classnames'
import type { Announcement, FacilityType } from '@/types/repair'
import { useRepairStore, facilityTypes } from '@/store/useRepairStore'
import { getAnnouncements } from '@/data/mockAnnouncement'
import { formatTime, categoryMap } from '@/utils/format'
import styles from './index.module.scss'

const HomePage: React.FC = () => {
  const orders = useRepairStore(state => state.orders)
  const getServiceStats = useRepairStore(state => state.getServiceStats)
  const getWeeklyTrend = useRepairStore(state => state.getWeeklyTrend)
  const currentRole = useRepairStore(state => state.currentRole)
  const [announcements] = useState<Announcement[]>(getAnnouncements())

  const stats = useMemo(() => ({
    pending: orders.filter(o => o.status === 'pending').length,
    processing: orders.filter(o => o.status === 'processing').length,
    completed: orders.filter(o => o.status === 'completed').length,
    rated: orders.filter(o => o.status === 'rated').length
  }), [orders])

  const serviceStats = useMemo(() => getServiceStats(), [orders, getServiceStats])
  const weeklyTrend = useMemo(() => getWeeklyTrend(), [orders, getWeeklyTrend])
  const trendMax = useMemo(() => {
    const m = Math.max(1, ...weeklyTrend.flatMap(d => [d.completed, d.confirmed, d.rated]))
    return m
  }, [weeklyTrend])

  usePullDownRefresh(() => {
    setTimeout(() => {
      Taro.stopPullDownRefresh()
    }, 500)
  })

  const handleQuickRepair = () => {
    console.log('[HomePage] 点击快捷报修')
    Taro.navigateTo({ url: '/pages/submit/index' })
  }

  const handleFacilityClick = (facility: FacilityType) => {
    console.log('[HomePage] 选择设施类型:', facility.name)
    Taro.navigateTo({ 
      url: `/pages/submit/index?facilityId=${facility.id}` 
    })
  }

  const handleOrderClick = (orderId: string) => {
    console.log('[HomePage] 查看工单详情:', orderId)
    Taro.navigateTo({ url: `/pages/detail/index?id=${orderId}` })
  }

  const handleAnnouncementClick = (announcementId: string) => {
    console.log('[HomePage] 查看公告详情:', announcementId)
    Taro.navigateTo({ 
      url: `/pages/detail/index?announcementId=${announcementId}` 
    })
  }

  const handleViewMoreOrders = () => {
    Taro.switchTab({ url: '/pages/list/index' })
  }

  const handleViewMoreAnnouncements = () => {
    Taro.switchTab({ url: '/pages/announcement/index' })
  }

  const handleWorkbench = () => {
    Taro.navigateTo({ url: '/pages/workbench/index' })
  }

  const handleRoleSwitch = () => {
    const newRole = currentRole === 'resident' ? 'property' : 'resident'
    useRepairStore.getState().setRole(newRole)
    Taro.showToast({
      title: `已切换到${newRole === 'resident' ? '住户' : '物业'}端`,
      icon: 'none'
    })
  }

  const bannerAnnouncements = announcements.filter(a => a.isTop).slice(0, 3)
  const latestAnnouncements = announcements.slice(0, 3)
  const myOrders = orders.slice(0, 3)

  return (
    <ScrollView className={styles.container} scrollY>
      <View className={styles.header}>
        <View className={styles.headerRow}>
          <View>
            <Text className={styles.greeting}>
              {currentRole === 'property' ? '您好，物业管理员' : '您好，业主'}
            </Text>
            <Text className={styles.subGreeting}>欢迎使用小区报修服务</Text>
          </View>
          <View className={styles.roleSwitch} onClick={handleRoleSwitch}>
            <Text className={styles.roleSwitchText}>
              切换至{currentRole === 'resident' ? '物业' : '住户'}
            </Text>
          </View>
        </View>
      </View>

      <View className={styles.quickEntry}>
        <View className={styles.entryCard} onClick={handleQuickRepair}>
          <Text className={styles.entryTitle}>📝 一键报修</Text>
          <Text className={styles.entryDesc}>快速提交公共设施报修申请，物业及时响应</Text>
          <Button className={styles.entryBtn} onClick={handleQuickRepair}>
            立即报修
          </Button>
        </View>
        {currentRole === 'property' && (
          <View className={styles.workbenchCard} onClick={handleWorkbench}>
            <View className={styles.workbenchHeader}>
              <Text className={styles.workbenchTitle}>🏢 物业工作台</Text>
              <Text className={styles.workbenchArrow}>→</Text>
            </View>
            <View className={styles.workbenchStats}>
              <View className={styles.workbenchStatItem}>
                <Text className={styles.workbenchStatNum} style={{ color: '#faad14' }}>
                  {stats.pending}
                </Text>
                <Text className={styles.workbenchStatLabel}>待接单</Text>
              </View>
              <View className={styles.workbenchStatItem}>
                <Text className={styles.workbenchStatNum} style={{ color: '#1677ff' }}>
                  {stats.processing}
                </Text>
                <Text className={styles.workbenchStatLabel}>处理中</Text>
              </View>
              <View className={styles.workbenchStatItem}>
                <Text className={styles.workbenchStatNum} style={{ color: '#ff4d4f' }}>
                  {serviceStats.avgRating > 0 ? serviceStats.avgRating : '--'}
                </Text>
                <Text className={styles.workbenchStatLabel}>平均评分</Text>
              </View>
            </View>
          </View>
        )}
      </View>

      {(currentRole === 'property' || serviceStats.totalRated > 0) && (
        <View className={styles.statsSection}>
          <View className={styles.sectionTitle}>
            <Text className={styles.titleText}>📊 服务统计</Text>
          </View>
          <View className={styles.serviceStatsCard}>
            <View className={styles.statsOverview}>
              <View className={styles.overviewItem}>
                <Text className={styles.overviewNum} style={{ color: '#faad14', fontSize: 48 }}>
                  ⭐ {serviceStats.avgRating || '--'}
                </Text>
                <Text className={styles.overviewLabel}>平均评分（共{serviceStats.totalRated}单评价）</Text>
              </View>
            </View>
            {serviceStats.maintainerRank.length > 0 && (
              <View className={styles.rankSection}>
                <Text className={styles.rankTitle}>👷 维修人员完成量</Text>
                {serviceStats.maintainerRank.map((m, idx) => (
                  <View key={m.name} className={styles.rankItem}>
                    <Text className={styles.rankIndex}>{idx + 1}</Text>
                    <Text className={styles.rankName}>{m.name}</Text>
                    <View className={styles.rankBarWrap}>
                      <View
                        className={styles.rankBar}
                        style={{
                          width: `${Math.min(100, (m.count / (serviceStats.maintainerRank[0]?.count || 1)) * 100)}%`
                        }}
                      />
                    </View>
                    <Text className={styles.rankCount}>{m.count}单</Text>
                    <Text className={styles.rankRating}>⭐{m.avgRating}</Text>
                  </View>
                ))}
              </View>
            )}
            {serviceStats.facilityRank.length > 0 && (
              <View className={styles.rankSection}>
                <Text className={styles.rankTitle}>🔧 常见报修类型</Text>
                {serviceStats.facilityRank.map((f, idx) => (
                  <View key={f.name} className={styles.rankItem}>
                    <Text className={styles.rankIndex}>{idx + 1}</Text>
                    <Text className={styles.rankName}>{f.name}</Text>
                    <View className={styles.rankBarWrap}>
                      <View
                        className={classNames(styles.rankBar, styles.facilityBar)}
                        style={{
                          width: `${Math.min(100, (f.count / (serviceStats.facilityRank[0]?.count || 1)) * 100)}%`
                        }}
                      />
                    </View>
                    <Text className={styles.rankCount}>{f.count}次</Text>
                  </View>
                ))}
              </View>
            )}
            <View className={styles.trendSection}>
              <View className={styles.trendHeader}>
                <Text className={styles.rankTitle}>📈 近 7 天闭环趋势</Text>
                <View className={styles.trendLegend}>
                  <View className={styles.legendItem}>
                    <View className={classNames(styles.legendDot, styles.completed)} />
                    <Text>完工</Text>
                  </View>
                  <View className={styles.legendItem}>
                    <View className={classNames(styles.legendDot, styles.confirmed)} />
                    <Text>确认</Text>
                  </View>
                  <View className={styles.legendItem}>
                    <View className={classNames(styles.legendDot, styles.rated)} />
                    <Text>评价</Text>
                  </View>
                </View>
              </View>
              <View className={styles.trendChart}>
                {weeklyTrend.map(d => (
                  <View key={d.date} className={styles.trendDay}>
                    <View className={styles.trendBars}>
                      <View className={styles.barWrap}>
                        <View
                          className={classNames(styles.trendBar, styles.completed)}
                          style={{ height: `${(d.completed / trendMax) * 100}%` }}
                        />
                      </View>
                      <View className={styles.barWrap}>
                        <View
                          className={classNames(styles.trendBar, styles.confirmed)}
                          style={{ height: `${(d.confirmed / trendMax) * 100}%` }}
                        />
                      </View>
                      <View className={styles.barWrap}>
                        <View
                          className={classNames(styles.trendBar, styles.rated)}
                          style={{ height: `${(d.rated / trendMax) * 100}%` }}
                        />
                      </View>
                    </View>
                    <View className={styles.trendDayMeta}>
                      <Text className={styles.trendLabel}>{d.label}</Text>
                      {d.avgRating > 0 && (
                        <Text className={styles.trendRating}>⭐{d.avgRating}</Text>
                      )}
                    </View>
                  </View>
                ))}
              </View>
            </View>
          </View>
        </View>
      )}

      <View className={styles.statsGrid}>
        <View className={styles.statItem} onClick={() => Taro.switchTab({ url: '/pages/list/index' })}>
          <Text className={styles.statNum}>{stats.pending}</Text>
          <Text className={styles.statLabel}>待接单</Text>
        </View>
        <View className={styles.statItem} onClick={() => Taro.switchTab({ url: '/pages/list/index' })}>
          <Text className={classNames(styles.statNum, { [styles.processing]: true })}>{stats.processing}</Text>
          <Text className={styles.statLabel}>处理中</Text>
        </View>
        <View className={styles.statItem} onClick={() => Taro.switchTab({ url: '/pages/list/index' })}>
          <Text className={styles.statNum} style={{ color: '#52c41a' }}>{stats.completed}</Text>
          <Text className={styles.statLabel}>已完成</Text>
        </View>
        <View className={styles.statItem} onClick={() => Taro.switchTab({ url: '/pages/list/index' })}>
          <Text className={styles.statNum} style={{ color: '#86909c' }}>{stats.rated}</Text>
          <Text className={styles.statLabel}>已评价</Text>
        </View>
      </View>

      <View className={styles.sectionTitle}>
        <Text className={styles.titleText}>设施类型</Text>
      </View>
      <View className={styles.facilityGrid}>
        {facilityTypes.map(facility => (
          <View
            key={facility.id}
            className={styles.facilityItem}
            onClick={() => handleFacilityClick(facility)}
          >
            <Text className={styles.facilityIcon}>{facility.icon}</Text>
            <Text className={styles.facilityName}>{facility.name}</Text>
          </View>
        ))}
      </View>

      {bannerAnnouncements.length > 0 && (
        <View className={styles.banner}>
          <Swiper
            className={styles.swiper}
            autoplay
            circular
            interval={3000}
            indicatorDots
            indicatorColor="rgba(255,255,255,0.5)"
            indicatorActiveColor="#ffffff"
          >
            {bannerAnnouncements.map(announcement => (
              <SwiperItem key={announcement.id}>
                <View
                  className={styles.slideItem}
                  onClick={() => handleAnnouncementClick(announcement.id)}
                >
                  <Image
                    src={announcement.coverImage || 'https://picsum.photos/id/1036/750/400'}
                    mode="aspectFill"
                  />
                  <View className={styles.slideOverlay}>
                    <Text className={styles.slideTitle}>{announcement.title}</Text>
                    <Text className={styles.slideTime}>{formatTime(announcement.publishTime)}</Text>
                  </View>
                </View>
              </SwiperItem>
            ))}
          </Swiper>
        </View>
      )}

      <View className={styles.sectionTitle}>
        <Text className={styles.titleText}>最新公告</Text>
        <Text className={styles.moreText} onClick={handleViewMoreAnnouncements}>查看更多 →</Text>
      </View>
      {latestAnnouncements.length > 0 ? (
        latestAnnouncements.map(announcement => {
          const categoryInfo = categoryMap[announcement.category]
          return (
            <View
              key={announcement.id}
              className={styles.noticeCard}
              onClick={() => handleAnnouncementClick(announcement.id)}
            >
              <View className={styles.noticeHeader}>
                <View
                  className={styles.noticeTag}
                  style={{
                    background: `${categoryInfo?.color}15`,
                    color: categoryInfo?.color
                  }}
                >
                  {categoryInfo?.label}
                </View>
                <Text className={styles.noticeTitle}>{announcement.title}</Text>
                {announcement.isTop && <View className={styles.noticeTop}>置顶</View>}
              </View>
              <Text className={styles.noticeContent}>{announcement.content}</Text>
              <Text className={styles.noticeTime}>{formatTime(announcement.publishTime)}</Text>
            </View>
          )
        })
      ) : (
        <View className={styles.emptyState}>
          <Text className={styles.emptyIcon}>📋</Text>
          <Text className={styles.emptyText}>暂无公告</Text>
        </View>
      )}

      <View className={styles.sectionTitle}>
        <Text className={styles.titleText}>我的工单</Text>
        <Text className={styles.moreText} onClick={handleViewMoreOrders}>查看更多 →</Text>
      </View>
      {myOrders.length > 0 ? (
        myOrders.map(order => (
          <View
            key={order.id}
            className={styles.noticeCard}
            onClick={() => handleOrderClick(order.id)}
          >
            <View className={styles.noticeHeader}>
              <View
                className={styles.noticeTag}
                style={{
                  background: order.status === 'pending' ? 'rgba(250,173,20,0.1)' :
                             order.status === 'processing' ? 'rgba(22,119,255,0.1)' :
                             order.status === 'completed' ? 'rgba(82,196,26,0.1)' :
                             'rgba(134,144,156,0.1)',
                  color: order.status === 'pending' ? '#faad14' :
                         order.status === 'processing' ? '#1677ff' :
                         order.status === 'completed' ? '#52c41a' :
                         '#86909c'
                }}
              >
                {order.status === 'pending' ? '待接单' :
                 order.status === 'processing' ? '处理中' :
                 order.status === 'completed' ? '已完成' : '已评价'}
              </View>
              <Text className={styles.noticeTitle}>{order.title}</Text>
            </View>
            <Text className={styles.noticeContent}>{order.description}</Text>
            <Text className={styles.noticeTime}>
              {order.facilityType.icon} {order.facilityType.name} · {formatTime(order.submitTime)}
            </Text>
          </View>
        ))
      ) : (
        <View className={styles.emptyState}>
          <Text className={styles.emptyIcon}>📭</Text>
          <Text className={styles.emptyText}>暂无工单记录</Text>
        </View>
      )}

      <View style={{ height: 120 }} />
    </ScrollView>
  )
}

export default HomePage
