import React, { useState, useEffect, useCallback } from 'react'
import { View, Text, Image, Textarea, Button, Picker, ScrollView } from '@tarojs/components'
import Taro, { useRouter, useDidShow } from '@tarojs/taro'
import classNames from 'classnames'
import type { RepairOrder, Announcement, RepairPhoto } from '@/types/repair'
import { useRepairStore } from '@/store/useRepairStore'
import { getAnnouncementById, getRelatedAnnouncements } from '@/data/mockAnnouncement'
import { formatDateTime, formatLocation, categoryMap } from '@/utils/format'
import StatusBadge from '@/components/StatusBadge'
import UrgencyBadge from '@/components/UrgencyBadge'
import Timeline from '@/components/Timeline'
import PhotoUpload from '@/components/PhotoUpload'
import StarRating from '@/components/StarRating'
import styles from './index.module.scss'

type RoleType = 'resident' | 'property'

const DetailPage: React.FC = () => {
  const router = useRouter()
  const orderId = router.params?.id
  const announcementId = router.params?.announcementId

  const orders = useRepairStore(state => state.orders)
  const maintainers = useRepairStore(state => state.maintainers)
  const currentRole = useRepairStore(state => state.currentRole)
  const setRole = useRepairStore(state => state.setRole)
  const acceptOrder = useRepairStore(state => state.acceptOrder)
  const assignMaintainer = useRepairStore(state => state.assignMaintainer)
  const addProcessRecord = useRepairStore(state => state.addProcessRecord)
  const completeOrder = useRepairStore(state => state.completeOrder)
  const updateExpectedTime = useRepairStore(state => state.updateExpectedTime)
  const supplementOrder = useRepairStore(state => state.supplementOrder)
  const rateOrder = useRepairStore(state => state.rateOrder)
  const urgeOrder = useRepairStore(state => state.urgeOrder)
  const confirmOrder = useRepairStore(state => state.confirmOrder)

  const order = orders.find(o => o.id === orderId) || null

  const [announcement, setAnnouncement] = useState<Announcement | null>(null)
  const [relatedAnnouncements, setRelatedAnnouncements] = useState<Announcement[]>([])
  const [role, setLocalRole] = useState<RoleType>(currentRole)
  const [showSupplementModal, setShowSupplementModal] = useState(false)
  const [supplementContent, setSupplementContent] = useState('')
  const [showProcessModal, setShowProcessModal] = useState(false)
  const [processContent, setProcessContent] = useState('')
  const [processPhotos, setProcessPhotos] = useState<RepairPhoto[]>([])
  const [showAssignModal, setShowAssignModal] = useState(false)
  const [selectedMaintainer, setSelectedMaintainer] = useState<string>('')
  const [showTimeModal, setShowTimeModal] = useState(false)
  const [expectedTime, setExpectedTime] = useState('')
  const [showRatingModal, setShowRatingModal] = useState(false)
  const [rating, setRating] = useState(0)
  const [ratingComment, setRatingComment] = useState('')
  const [completionPhotos, setCompletionPhotos] = useState<RepairPhoto[]>([])
  const [showCompletionModal, setShowCompletionModal] = useState(false)
  const [completionContent, setCompletionContent] = useState('')
  const [showUrgeModal, setShowUrgeModal] = useState(false)
  const [urgeRemark, setUrgeRemark] = useState('')

  useEffect(() => {
    setLocalRole(currentRole)
  }, [currentRole])

  const loadAnnouncement = useCallback(() => {
    if (announcementId) {
      const data = getAnnouncementById(announcementId)
      setAnnouncement(data || null)
      return
    }
    if (order) {
      const related = getRelatedAnnouncements(order.facilityType.id)
      setRelatedAnnouncements(related)
    }
  }, [announcementId, order])

  useEffect(() => {
    loadAnnouncement()
  }, [loadAnnouncement])

  useDidShow(() => {
    loadAnnouncement()
  })

  const handleAccept = () => {
    if (!order) return
    acceptOrder(order.id)
    Taro.showToast({ title: '接单成功', icon: 'success' })
  }

  const handleAssign = () => {
    if (!selectedMaintainer) {
      Taro.showToast({ title: '请选择维修人员', icon: 'none' })
      return
    }
    if (!order) return
    assignMaintainer(order.id, selectedMaintainer)
    setShowAssignModal(false)
    setSelectedMaintainer('')
    Taro.showToast({ title: '分派成功', icon: 'success' })
  }

  const handleProcess = () => {
    if (!processContent.trim()) {
      Taro.showToast({ title: '请填写处理记录', icon: 'none' })
      return
    }
    if (!order) return
    addProcessRecord(order.id, processContent.trim(), processPhotos)
    setShowProcessModal(false)
    setProcessContent('')
    setProcessPhotos([])
    Taro.showToast({ title: '记录已提交', icon: 'success' })
  }

  const handleComplete = () => {
    if (!completionContent.trim()) {
      Taro.showToast({ title: '请填写完工说明', icon: 'none' })
      return
    }
    if (!order) return
    completeOrder(order.id, completionContent.trim(), completionPhotos)
    setShowCompletionModal(false)
    setCompletionContent('')
    setCompletionPhotos([])
    Taro.showToast({ title: '已标记完成', icon: 'success' })
  }

  const handleConfirmComplete = () => {
    if (!order) return
    Taro.showModal({
      title: '确认完成',
      content: '确认维修已完成？确认后可以进行评价',
      success: (res) => {
        if (res.confirm) {
          confirmOrder(order.id)
          setShowRatingModal(true)
        }
      }
    })
  }

  const handleUrge = () => {
    if (!order) return
    urgeOrder(order.id, urgeRemark)
    setShowUrgeModal(false)
    setUrgeRemark('')
    Taro.showToast({ title: '已催单，请耐心等待', icon: 'success' })
  }

  const handleSubmitRating = () => {
    if (rating === 0) {
      Taro.showToast({ title: '请选择评分', icon: 'none' })
      return
    }
    if (!order) return
    rateOrder(order.id, rating, ratingComment)
    setShowRatingModal(false)
    setRating(0)
    setRatingComment('')
    Taro.showToast({ title: '评价成功', icon: 'success' })
  }

  const handleSupplement = () => {
    if (!supplementContent.trim()) {
      Taro.showToast({ title: '请输入补充说明', icon: 'none' })
      return
    }
    if (!order) return
    supplementOrder(order.id, supplementContent.trim())
    setShowSupplementModal(false)
    setSupplementContent('')
    Taro.showToast({ title: '已提交补充说明', icon: 'success' })
  }

  const handleUpdateTime = () => {
    if (!expectedTime) {
      Taro.showToast({ title: '请选择预计时间', icon: 'none' })
      return
    }
    if (!order) return
    updateExpectedTime(order.id, expectedTime)
    setShowTimeModal(false)
    setExpectedTime('')
    Taro.showToast({ title: '已更新预计时间', icon: 'success' })
  }

  const handleAnnouncementClick = (id: string) => {
    Taro.redirectTo({ url: `/pages/detail/index?announcementId=${id}` })
  }

  const handleRoleSwitch = () => {
    const newRole = role === 'resident' ? 'property' : 'resident'
    setLocalRole(newRole)
    setRole(newRole)
    Taro.showToast({
      title: `已切换到${newRole === 'resident' ? '住户' : '物业'}端`,
      icon: 'none'
    })
  }

  if (announcement) {
    const categoryInfo = categoryMap[announcement.category]
    return (
      <ScrollView className={styles.container} scrollY>
        <View className={styles.announcementDetail}>
          {announcement.coverImage && (
            <View className={styles.cover}>
              <Image src={announcement.coverImage} mode="aspectFill" />
            </View>
          )}
          <Text className={styles.title}>{announcement.title}</Text>
          <View className={styles.meta}>
            <View
              className={styles.categoryBadge}
              style={{
                background: `${categoryInfo?.color}15`,
                color: categoryInfo?.color
              }}
            >
              {categoryInfo?.label}
            </View>
            <Text>🏢 {announcement.publisher}</Text>
            <Text>📅 {formatDateTime(announcement.publishTime)}</Text>
          </View>
          <Text className={styles.content}>{announcement.content}</Text>
        </View>
        <View style={{ height: 80 }} />
      </ScrollView>
    )
  }

  if (!order) {
    return (
      <View className={styles.container}>
        <View className={styles.emptyState}>
          <Text className={styles.emptyIcon}>📭</Text>
          <Text className={styles.emptyText}>工单不存在</Text>
        </View>
      </View>
    )
  }

  const canAccept = role === 'property' && order.status === 'pending'
  const canAssign = role === 'property' && order.status === 'processing' && !order.assignedTo
  const canProcess = role === 'property' && order.status === 'processing' && order.assignedTo
  const canComplete = role === 'property' && order.status === 'processing' && order.assignedTo
  const canConfirmComplete = role === 'resident' && order.status === 'completed'
  const canUrge = role === 'resident' && (order.status === 'pending' || order.status === 'processing')
  const canSupplement = order.status !== 'rated'
  const canUpdateTime = role === 'property' && order.status === 'processing'

  return (
    <ScrollView className={styles.container} scrollY>
      <View
        style={{
          position: 'absolute',
          right: 32,
          top: 20,
          zIndex: 100,
          padding: '8rpx 24rpx',
          background: 'rgba(255,255,255,0.9)',
          borderRadius: 32,
          fontSize: 24,
          color: '#1677ff'
        }}
        onClick={handleRoleSwitch}
      >
        切换至{role === 'resident' ? '物业' : '住户'}端
      </View>

      <View className={styles.headerCard}>
        <View className={styles.headerTop}>
          <Text className={styles.title}>{order.title}</Text>
          <View className={styles.badges}>
            <StatusBadge status={order.status} />
            <UrgencyBadge urgency={order.urgency} />
            {order.urgeRecords && order.urgeRecords.length > 0 && (
              <View className={styles.urgeBadge}>
                ⏰ 催单{order.urgeRecords.length}次
              </View>
            )}
          </View>
        </View>
        <Text className={styles.orderNo}>工单号：{order.orderNo}</Text>
        {order.urgeRecords && order.urgeRecords.length > 0 && (
          <View className={styles.urgeInfo}>
            <Text className={styles.urgeIcon}>⏰</Text>
            <Text className={styles.urgeText}>
              最近催单：{formatDateTime(order.urgeRecords[order.urgeRecords.length - 1].time)}
              {order.urgeRecords[order.urgeRecords.length - 1].remark &&
                ` · ${order.urgeRecords[order.urgeRecords.length - 1].remark}`}
            </Text>
          </View>
        )}
        <View className={styles.infoRow}>
          <View className={styles.infoItem}>
            <Text>{order.facilityType.icon}</Text>
            <Text>{order.facilityType.name}</Text>
          </View>
          <View className={styles.infoItem}>
            <Text>📍</Text>
            <Text>{formatLocation(order.location)}</Text>
          </View>
          <View className={styles.infoItem}>
            <Text>📅</Text>
            <Text>{formatDateTime(order.submitTime)}</Text>
          </View>
        </View>
      </View>

      {order.rating && (
        <View className={styles.ratedSection}>
          <View className={styles.ratedHeader}>
            <Text className={styles.ratedIcon}>✅</Text>
            <Text className={styles.ratedTitle}>已评价</Text>
          </View>
          <StarRating value={order.rating} readOnly showText />
          {order.ratingComment && (
            <Text className={styles.ratedComment}>{order.ratingComment}</Text>
          )}
        </View>
      )}

      <View className={styles.section}>
        <View className={styles.sectionTitle}>
          <Text className={styles.sectionIcon}>📋</Text>
          <Text>问题描述</Text>
        </View>
        <View className={styles.infoGrid}>
          <View>
            <View className={styles.infoLabel}>报修人</View>
            <View className={styles.infoValue}>{order.submitter} · {order.submitterPhone}</View>
          </View>
          <View>
            <View className={styles.infoLabel}>问题描述</View>
            <View className={styles.infoValue}>{order.description}</View>
          </View>
        </View>
        {order.photos.length > 0 && (
          <View style={{ marginTop: 24 }}>
            <View className={styles.infoLabel}>照片凭证</View>
            <View className={styles.photos}>
              {order.photos.map(photo => (
                <View key={photo.id} className={styles.photoItem}>
                  <Image src={photo.url} mode="aspectFill" />
                </View>
              ))}
            </View>
          </View>
        )}
        {order.expectedTime && (
          <View style={{ marginTop: 24 }}>
            <View className={styles.infoLabel}>预计完成时间</View>
            <View className={styles.infoValue} style={{ color: '#1677ff' }}>
              {formatDateTime(order.expectedTime)}
            </View>
          </View>
        )}
        {order.assignedTo && (
          <View style={{ marginTop: 24 }}>
            <View className={styles.infoLabel}>维修人员</View>
            <View className={styles.infoValue}>{order.assignedTo}</View>
          </View>
        )}
        {order.completedTime && (
          <View style={{ marginTop: 24 }}>
            <View className={styles.infoLabel}>完工时间</View>
            <View className={styles.infoValue}>{formatDateTime(order.completedTime)}</View>
          </View>
        )}
      </View>

      <View className={styles.section}>
        <View className={styles.sectionTitle}>
          <Text className={styles.sectionIcon}>⏱️</Text>
          <Text>处理进度</Text>
        </View>
        <Timeline records={order.processingRecords} />
      </View>

      {relatedAnnouncements.length > 0 && (
        <View className={styles.section}>
          <View className={styles.sectionTitle}>
            <Text className={styles.sectionIcon}>📢</Text>
            <Text>同类问题公告</Text>
          </View>
          {relatedAnnouncements.map(a => (
            <View
              key={a.id}
              className={styles.announcementCard}
              onClick={() => handleAnnouncementClick(a.id)}
            >
              <Text className={styles.announcementIcon}>📋</Text>
              <View className={styles.announcementContent}>
                <Text className={styles.announcementTitle}>{a.title}</Text>
                <Text className={styles.announcementDesc}>{a.content}</Text>
              </View>
            </View>
          ))}
        </View>
      )}

      <View style={{ height: 120 }} />

      <View className={styles.footer}>
        {canAccept && (
          <Button className={styles.footerBtn} onClick={handleAccept}>
            接单
          </Button>
        )}
        {canAssign && (
          <Button className={styles.footerBtn} onClick={() => setShowAssignModal(true)}>
            分派维修人员
          </Button>
        )}
        {canProcess && (
          <View className={styles.actionRow}>
            <Button className={styles.halfBtn} onClick={() => setShowProcessModal(true)}>
              填写处理记录
            </Button>
            <Button
              className={classNames(styles.halfBtn, styles.primary)}
              onClick={() => setShowTimeModal(true)}
            >
              变更预计时间
            </Button>
          </View>
        )}
        {canComplete && (
          <Button
            className={classNames(styles.footerBtn, styles.success)}
            onClick={() => setShowCompletionModal(true)}
          >
            完工确认
          </Button>
        )}
        {canConfirmComplete && (
          <Button className={styles.footerBtn} onClick={handleConfirmComplete}>
            确认完成
          </Button>
        )}
        {canUrge && (
          <Button
            className={classNames(styles.footerBtn, styles.urgent)}
            onClick={() => setShowUrgeModal(true)}
          >
            催单
          </Button>
        )}
        {canSupplement && !canAccept && !canAssign && !canProcess && !canComplete && !canConfirmComplete && !canUrge && (
          <Button className={styles.footerBtn} onClick={() => setShowSupplementModal(true)}>
            补充说明
          </Button>
        )}
        {order.status === 'rated' && (
          <Button className={styles.footerBtn} disabled>
            已完成评价
          </Button>
        )}
      </View>

      {showSupplementModal && (
        <View className={styles.modalOverlay} onClick={() => setShowSupplementModal(false)}>
          <View className={styles.modalContent} onClick={e => e.stopPropagation()}>
            <Text className={styles.modalTitle}>补充说明</Text>
            <Textarea
              className={styles.modalInput}
              placeholder="请输入需要补充的内容..."
              value={supplementContent}
              onInput={e => setSupplementContent(e.detail.value)}
              maxlength={500}
            />
            <View className={styles.modalActions}>
              <Button
                className={classNames(styles.modalBtn, styles.cancel)}
                onClick={() => setShowSupplementModal(false)}
              >
                取消
              </Button>
              <Button
                className={classNames(styles.modalBtn, styles.confirm)}
                onClick={handleSupplement}
              >
                提交
              </Button>
            </View>
          </View>
        </View>
      )}

      {showProcessModal && (
        <View className={styles.modalOverlay} onClick={() => setShowProcessModal(false)}>
          <View className={styles.modalContent} onClick={e => e.stopPropagation()}>
            <Text className={styles.modalTitle}>填写处理记录</Text>
            <Textarea
              className={styles.modalInput}
              placeholder="请填写处理情况..."
              value={processContent}
              onInput={e => setProcessContent(e.detail.value)}
              maxlength={500}
            />
            <PhotoUpload photos={processPhotos} onChange={setProcessPhotos} maxCount={3} />
            <View className={styles.modalActions} style={{ marginTop: 24 }}>
              <Button
                className={classNames(styles.modalBtn, styles.cancel)}
                onClick={() => setShowProcessModal(false)}
              >
                取消
              </Button>
              <Button
                className={classNames(styles.modalBtn, styles.confirm)}
                onClick={handleProcess}
              >
                提交
              </Button>
            </View>
          </View>
        </View>
      )}

      {showAssignModal && (
        <View className={styles.modalOverlay} onClick={() => setShowAssignModal(false)}>
          <View className={styles.modalContent} onClick={e => e.stopPropagation()}>
            <Text className={styles.modalTitle}>选择维修人员</Text>
            {maintainers.map(m => (
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
                  👷 {m.name} {m.status === 'busy' && '（忙碌中）'}
                  <Text style={{
                    marginLeft: 12,
                    fontSize: 22,
                    color: m.status === 'free' ? '#52c41a' : '#faad14',
                    fontWeight: 400
                  }}>
                    {m.status === 'free' ? '空闲' : '忙碌'}
                  </Text>
                </View>
                <View style={{ fontSize: 24, color: '#86909c' }}>
                  特长：{m.specialty.join('、')}
                </View>
              </View>
            ))}
            <View className={styles.modalActions}>
              <Button
                className={classNames(styles.modalBtn, styles.cancel)}
                onClick={() => setShowAssignModal(false)}
              >
                取消
              </Button>
              <Button
                className={classNames(styles.modalBtn, styles.confirm)}
                onClick={handleAssign}
              >
                确认分派
              </Button>
            </View>
          </View>
        </View>
      )}

      {showTimeModal && (
        <View className={styles.modalOverlay} onClick={() => setShowTimeModal(false)}>
          <View className={styles.modalContent} onClick={e => e.stopPropagation()}>
            <Text className={styles.modalTitle}>变更预计完成时间</Text>
            <Picker
              mode="date"
              value={expectedTime.split('T')[0]}
              onChange={e => setExpectedTime(`${e.detail.value}T18:00:00`)}
            >
              <View className={styles.pickerValue}>
                <Text>{expectedTime ? formatDateTime(expectedTime) : '请选择日期'}</Text>
                <Text>▼</Text>
              </View>
            </Picker>
            <View className={styles.modalActions} style={{ marginTop: 32 }}>
              <Button
                className={classNames(styles.modalBtn, styles.cancel)}
                onClick={() => setShowTimeModal(false)}
              >
                取消
              </Button>
              <Button
                className={classNames(styles.modalBtn, styles.confirm)}
                onClick={handleUpdateTime}
              >
                确认
              </Button>
            </View>
          </View>
        </View>
      )}

      {showCompletionModal && (
        <View className={styles.modalOverlay} onClick={() => setShowCompletionModal(false)}>
          <View className={styles.modalContent} onClick={e => e.stopPropagation()}>
            <Text className={styles.modalTitle}>完工确认</Text>
            <Textarea
              className={styles.modalInput}
              placeholder="请填写完工说明..."
              value={completionContent}
              onInput={e => setCompletionContent(e.detail.value)}
              maxlength={500}
            />
            <PhotoUpload photos={completionPhotos} onChange={setCompletionPhotos} maxCount={3} />
            <View className={styles.modalActions} style={{ marginTop: 24 }}>
              <Button
                className={classNames(styles.modalBtn, styles.cancel)}
                onClick={() => setShowCompletionModal(false)}
              >
                取消
              </Button>
              <Button
                className={classNames(styles.modalBtn, styles.confirm)}
                onClick={handleComplete}
              >
                确认完工
              </Button>
            </View>
          </View>
        </View>
      )}

      {showRatingModal && (
        <View className={styles.modalOverlay} onClick={() => setShowRatingModal(false)}>
          <View className={styles.modalContent} onClick={e => e.stopPropagation()}>
            <Text className={styles.modalTitle}>服务评价</Text>
            <View className={styles.ratingSection}>
              <Text className={styles.ratingTitle}>请对本次服务进行评价</Text>
              <StarRating value={rating} onChange={setRating} showText />
            </View>
            <Textarea
              className={styles.commentInput}
              placeholder="请输入评价内容（选填）..."
              value={ratingComment}
              onInput={e => setRatingComment(e.detail.value)}
              maxlength={200}
            />
            <View className={styles.modalActions} style={{ marginTop: 24 }}>
              <Button
                className={classNames(styles.modalBtn, styles.cancel)}
                onClick={() => setShowRatingModal(false)}
              >
                取消
              </Button>
              <Button
                className={classNames(styles.modalBtn, styles.confirm)}
                onClick={handleSubmitRating}
              >
                提交评价
              </Button>
            </View>
          </View>
        </View>
      )}

      {showUrgeModal && (
        <View className={styles.modalOverlay} onClick={() => setShowUrgeModal(false)}>
          <View className={styles.modalContent} onClick={e => e.stopPropagation()}>
            <Text className={styles.modalTitle}>发起催单</Text>
            <Text className={styles.tipText}>
              您即将向物业发起催单，请填写催单说明：
            </Text>
            <Textarea
              className={styles.modalInput}
              placeholder="请输入催单说明（选填）..."
              value={urgeRemark}
              onInput={e => setUrgeRemark(e.detail.value)}
              maxlength={200}
            />
            <View className={styles.modalActions} style={{ marginTop: 24 }}>
              <Button
                className={classNames(styles.modalBtn, styles.cancel)}
                onClick={() => setShowUrgeModal(false)}
              >
                取消
              </Button>
              <Button
                className={classNames(styles.modalBtn, styles.confirm)}
                onClick={handleUrge}
              >
                确认催单
              </Button>
            </View>
          </View>
        </View>
      )}
    </ScrollView>
  )
}

export default DetailPage
