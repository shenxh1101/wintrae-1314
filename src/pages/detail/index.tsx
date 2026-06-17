import React, { useState, useEffect, useCallback } from 'react'
import { View, Text, Image, Textarea, Button, Picker, ScrollView } from '@tarojs/components'
import Taro, { useRouter, useDidShow } from '@tarojs/taro'
import classNames from 'classnames'
import type { RepairOrder, Announcement, ProcessingRecord, RepairPhoto, Maintainer } from '@/types/repair'
import { getRepairOrderById, mockRepairOrders, maintainers } from '@/data/mockRepair'
import { getAnnouncementById, getRelatedAnnouncements } from '@/data/mockAnnouncement'
import { formatDateTime, formatLocation, categoryMap, statusMap } from '@/utils/format'
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

  const [order, setOrder] = useState<RepairOrder | null>(null)
  const [announcement, setAnnouncement] = useState<Announcement | null>(null)
  const [relatedAnnouncements, setRelatedAnnouncements] = useState<Announcement[]>([])
  const [role, setRole] = useState<RoleType>('resident')
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

  const loadData = useCallback(() => {
    console.log('[DetailPage] 加载详情数据', { orderId, announcementId })
    
    if (announcementId) {
      const data = getAnnouncementById(announcementId)
      setAnnouncement(data || null)
      return
    }

    if (orderId) {
      const data = getRepairOrderById(orderId)
      setOrder(data || null)
      
      if (data) {
        const related = getRelatedAnnouncements(data.facilityType.id)
        setRelatedAnnouncements(related)
      }
    }
  }, [orderId, announcementId])

  useEffect(() => {
    loadData()
  }, [loadData])

  useDidShow(() => {
    loadData()
  })

  const updateOrder = (updater: (order: RepairOrder) => RepairOrder) => {
    if (!order) return
    const updated = updater(order)
    setOrder(updated)
    
    const index = mockRepairOrders.findIndex(o => o.id === order.id)
    if (index !== -1) {
      mockRepairOrders[index] = updated
    }
  }

  const addRecord = (record: Omit<ProcessingRecord, 'id' | 'time'>) => {
    const newRecord: ProcessingRecord = {
      ...record,
      id: `r_${Date.now()}`,
      time: new Date().toISOString()
    }
    
    updateOrder(prev => ({
      ...prev,
      processingRecords: [...prev.processingRecords, newRecord]
    }))
  }

  const handleAccept = () => {
    console.log('[DetailPage] 物业接单')
    updateOrder(prev => ({
      ...prev,
      status: 'processing',
      acceptedTime: new Date().toISOString()
    }))
    addRecord({
      type: 'accept',
      title: '物业接单',
      content: '物业已接单，正在安排维修人员',
      operator: '物业管理员',
      operatorRole: 'property'
    })
    Taro.showToast({ title: '接单成功', icon: 'success' })
  }

  const handleAssign = () => {
    if (!selectedMaintainer) {
      Taro.showToast({ title: '请选择维修人员', icon: 'none' })
      return
    }
    
    const maintainer = maintainers.find(m => m.id === selectedMaintainer)
    if (!maintainer) return
    
    console.log('[DetailPage] 分派维修人员:', maintainer.name)
    updateOrder(prev => ({
      ...prev,
      assignedTo: maintainer.name,
      assignedTime: new Date().toISOString()
    }))
    addRecord({
      type: 'assign',
      title: '分派维修人员',
      content: `已分派${maintainer.name}处理此工单`,
      operator: '物业管理员',
      operatorRole: 'property'
    })
    setShowAssignModal(false)
    setSelectedMaintainer('')
    Taro.showToast({ title: '分派成功', icon: 'success' })
  }

  const handleProcess = () => {
    if (!processContent.trim()) {
      Taro.showToast({ title: '请填写处理记录', icon: 'none' })
      return
    }
    
    console.log('[DetailPage] 填写处理记录')
    addRecord({
      type: 'process',
      title: '维修中',
      content: processContent.trim(),
      operator: order?.assignedTo || '维修人员',
      operatorRole: 'maintainer',
      photos: processPhotos.length > 0 ? [...processPhotos] : undefined
    })
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
    
    console.log('[DetailPage] 完工确认')
    updateOrder(prev => ({
      ...prev,
      status: 'completed',
      completedTime: new Date().toISOString()
    }))
    addRecord({
      type: 'complete',
      title: '维修完成',
      content: completionContent.trim(),
      operator: order?.assignedTo || '维修人员',
      operatorRole: 'maintainer',
      photos: completionPhotos.length > 0 ? [...completionPhotos] : undefined
    })
    setShowCompletionModal(false)
    setCompletionContent('')
    setCompletionPhotos([])
    Taro.showToast({ title: '已标记完成', icon: 'success' })
  }

  const handleConfirmComplete = () => {
    console.log('[DetailPage] 住户确认完成')
    Taro.showModal({
      title: '确认完成',
      content: '确认维修已完成？确认后可以进行评价',
      success: (res) => {
        if (res.confirm) {
          setShowRatingModal(true)
        }
      }
    })
  }

  const handleSubmitRating = () => {
    if (rating === 0) {
      Taro.showToast({ title: '请选择评分', icon: 'none' })
      return
    }
    
    console.log('[DetailPage] 提交评价:', { rating, ratingComment })
    updateOrder(prev => ({
      ...prev,
      status: 'rated',
      rating,
      ratingComment: ratingComment.trim(),
      ratedTime: new Date().toISOString()
    }))
    addRecord({
      type: 'rate',
      title: '住户评价',
      content: ratingComment.trim() || `评分${rating}星`,
      operator: '业主',
      operatorRole: 'resident'
    })
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
    
    console.log('[DetailPage] 住户补充说明')
    addRecord({
      type: 'supplement',
      title: '住户补充说明',
      content: supplementContent.trim(),
      operator: '业主',
      operatorRole: 'resident'
    })
    setShowSupplementModal(false)
    setSupplementContent('')
    Taro.showToast({ title: '已提交补充说明', icon: 'success' })
  }

  const handleUpdateTime = () => {
    if (!expectedTime) {
      Taro.showToast({ title: '请选择预计时间', icon: 'none' })
      return
    }
    
    console.log('[DetailPage] 变更预计时间:', expectedTime)
    const date = new Date(expectedTime)
    updateOrder(prev => ({
      ...prev,
      expectedTime: date.toISOString()
    }))
    addRecord({
      type: 'process',
      title: '变更预计完成时间',
      content: `预计完成时间变更为${formatDateTime(date.toISOString())}`,
      operator: '物业管理员',
      operatorRole: 'property'
    })
    setShowTimeModal(false)
    setExpectedTime('')
    Taro.showToast({ title: '已更新预计时间', icon: 'success' })
  }

  const handleAnnouncementClick = (id: string) => {
    console.log('[DetailPage] 查看相关公告:', id)
    Taro.redirectTo({ url: `/pages/detail/index?announcementId=${id}` })
  }

  const handleRoleSwitch = () => {
    const newRole = role === 'resident' ? 'property' : 'resident'
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
          </View>
        </View>
        <Text className={styles.orderNo}>工单号：{order.orderNo}</Text>
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
        {canSupplement && !canAccept && !canAssign && !canProcess && !canComplete && !canConfirmComplete && (
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
    </ScrollView>
  )
}

export default DetailPage
