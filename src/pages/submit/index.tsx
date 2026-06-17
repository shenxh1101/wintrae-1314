import React, { useState, useEffect, useCallback } from 'react'
import { View, Text, Input, Textarea, Picker, Button } from '@tarojs/components'
import Taro, { useRouter, useDidShow } from '@tarojs/taro'
import classNames from 'classnames'
import type { FacilityType, BuildingInfo, RepairPhoto, UrgencyLevel } from '@/types/repair'
import { facilityTypes, buildings, units, rooms, mockRepairOrders } from '@/data/mockRepair'
import { generateOrderNo } from '@/utils/format'
import PhotoUpload from '@/components/PhotoUpload'
import styles from './index.module.scss'

const SubmitPage: React.FC = () => {
  const router = useRouter()
  const preFacilityId = router.params?.facilityId

  const [selectedFacility, setSelectedFacility] = useState<FacilityType | null>(null)
  const [location, setLocation] = useState<BuildingInfo>({
    building: '',
    unit: '',
    room: ''
  })
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [urgency, setUrgency] = useState<UrgencyLevel>('normal')
  const [photos, setPhotos] = useState<RepairPhoto[]>([])
  const [phone, setPhone] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (preFacilityId) {
      const facility = facilityTypes.find(f => f.id === preFacilityId)
      if (facility) {
        setSelectedFacility(facility)
      }
    }
  }, [preFacilityId])

  useDidShow(() => {
    console.log('[SubmitPage] 页面显示')
  })

  const handleFacilitySelect = (facility: FacilityType) => {
    console.log('[SubmitPage] 选择设施类型:', facility.name)
    setSelectedFacility(facility)
  }

  const handleLocationChange = (field: keyof BuildingInfo, value: string) => {
    console.log('[SubmitPage] 位置变更:', field, value)
    setLocation(prev => ({ ...prev, [field]: value }))
  }

  const handleUrgencySelect = (level: UrgencyLevel) => {
    console.log('[SubmitPage] 选择紧急程度:', level)
    setUrgency(level)
  }

  const handlePhotosChange = (newPhotos: RepairPhoto[]) => {
    console.log('[SubmitPage] 图片变更:', newPhotos.length, '张')
    setPhotos(newPhotos)
  }

  const isFormValid = useCallback(() => {
    return (
      selectedFacility !== null &&
      location.building !== '' &&
      location.unit !== '' &&
      location.room !== '' &&
      title.trim() !== '' &&
      description.trim() !== '' &&
      phone.trim() !== ''
    )
  }, [selectedFacility, location, title, description, phone])

  const handleSubmit = async () => {
    if (!isFormValid()) {
      Taro.showToast({ title: '请填写完整信息', icon: 'none' })
      return
    }

    setSubmitting(true)
    console.log('[SubmitPage] 提交报修工单')

    try {
      const newOrder = {
        id: String(Date.now()),
        orderNo: generateOrderNo(),
        title: title.trim(),
        facilityType: selectedFacility!,
        location: { ...location },
        description: description.trim(),
        urgency,
        status: 'pending' as const,
        photos: [...photos],
        submitter: '业主',
        submitterPhone: phone,
        submitTime: new Date().toISOString(),
        processingRecords: [
          {
            id: `r_${Date.now()}`,
            type: 'submit' as const,
            title: '提交报修',
            content: `提交报修工单：${title.trim()}`,
            operator: '业主',
            operatorRole: 'resident' as const,
            time: new Date().toISOString()
          }
        ]
      }

      mockRepairOrders.unshift(newOrder)

      Taro.showToast({
        title: '提交成功',
        icon: 'success',
        duration: 2000
      })

      setTimeout(() => {
        Taro.redirectTo({ url: `/pages/detail/index?id=${newOrder.id}` })
      }, 2000)
    } catch (error) {
      console.error('[SubmitPage] 提交失败', error)
      Taro.showToast({ title: '提交失败，请重试', icon: 'none' })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <View className={styles.container}>
      <View className={styles.section}>
        <View className={styles.sectionTitle}>
          <Text className={styles.sectionIcon}>🔧</Text>
          <Text>设施类型</Text>
        </View>
        <View className={styles.formItem}>
          <View className={styles.label}>
            <Text className={styles.required}>*</Text>
            <Text>请选择报修设施类型</Text>
          </View>
          <View className={styles.facilityGrid}>
            {facilityTypes.map(facility => (
              <View
                key={facility.id}
                className={classNames(
                  styles.facilityItem,
                  selectedFacility?.id === facility.id && styles.selected
                )}
                onClick={() => handleFacilitySelect(facility)}
              >
                <Text className={styles.facilityIcon}>{facility.icon}</Text>
                <Text className={styles.facilityName}>{facility.name}</Text>
              </View>
            ))}
          </View>
        </View>
      </View>

      <View className={styles.section}>
        <View className={styles.sectionTitle}>
          <Text className={styles.sectionIcon}>📍</Text>
          <Text>位置信息</Text>
        </View>
        <View className={styles.locationRow}>
          <View className={styles.locationItem}>
            <View className={styles.label}>
              <Text className={styles.required}>*</Text>
              <Text>楼栋</Text>
            </View>
            <Picker
              mode="selector"
              range={buildings}
              value={buildings.indexOf(location.building)}
              onChange={(e) => handleLocationChange('building', buildings[e.detail.value])}
            >
              <View className={classNames(
                styles.pickerInput,
                location.building && styles.focused
              )}>
                <Text className={classNames(
                  styles.pickerValue,
                  !location.building && styles.pickerPlaceholder
                )}>
                  {location.building ? `${location.building}栋` : '请选择'}
                </Text>
                <Text className={styles.pickerArrow}>▼</Text>
              </View>
            </Picker>
          </View>
          <View className={styles.locationItem}>
            <View className={styles.label}>
              <Text className={styles.required}>*</Text>
              <Text>单元</Text>
            </View>
            <Picker
              mode="selector"
              range={units}
              value={units.indexOf(location.unit)}
              onChange={(e) => handleLocationChange('unit', units[e.detail.value])}
            >
              <View className={classNames(
                styles.pickerInput,
                location.unit && styles.focused
              )}>
                <Text className={classNames(
                  styles.pickerValue,
                  !location.unit && styles.pickerPlaceholder
                )}>
                  {location.unit ? `${location.unit}单元` : '请选择'}
                </Text>
                <Text className={styles.pickerArrow}>▼</Text>
              </View>
            </Picker>
          </View>
          <View className={styles.locationItem}>
            <View className={styles.label}>
              <Text className={styles.required}>*</Text>
              <Text>室号</Text>
            </View>
            <Picker
              mode="selector"
              range={rooms}
              value={rooms.indexOf(location.room)}
              onChange={(e) => handleLocationChange('room', rooms[e.detail.value])}
            >
              <View className={classNames(
                styles.pickerInput,
                location.room && styles.focused
              )}>
                <Text className={classNames(
                  styles.pickerValue,
                  !location.room && styles.pickerPlaceholder
                )}>
                  {location.room ? `${location.room}室` : '请选择'}
                </Text>
                <Text className={styles.pickerArrow}>▼</Text>
              </View>
            </Picker>
          </View>
        </View>
      </View>

      <View className={styles.section}>
        <View className={styles.sectionTitle}>
          <Text className={styles.sectionIcon}>📝</Text>
          <Text>问题描述</Text>
        </View>
        <View className={styles.formItem}>
          <View className={styles.label}>
            <Text className={styles.required}>*</Text>
            <Text>简要标题</Text>
          </View>
          <Input
            className={styles.input}
            placeholder="请输入问题标题（如：客厅灯不亮）"
            placeholderClass="inputPlaceholder"
            value={title}
            onInput={(e) => setTitle(e.detail.value)}
            maxlength={30}
          />
        </View>
        <View className={styles.formItem}>
          <View className={styles.label}>
            <Text className={styles.required}>*</Text>
            <Text>详细描述</Text>
          </View>
          <Textarea
            className={styles.textarea}
            placeholder="请详细描述问题情况，包括出现的现象、位置等信息..."
            placeholderClass="inputPlaceholder"
            value={description}
            onInput={(e) => setDescription(e.detail.value)}
            maxlength={500}
          />
          <View className={styles.textareaCount}>{description.length}/500</View>
        </View>
      </View>

      <View className={styles.section}>
        <View className={styles.sectionTitle}>
          <Text className={styles.sectionIcon}>📷</Text>
          <Text>上传照片</Text>
        </View>
        <View className={styles.formItem}>
          <View className={styles.label}>
            <Text>上传问题照片（可选，最多9张）</Text>
          </View>
          <PhotoUpload photos={photos} onChange={handlePhotosChange} maxCount={9} />
        </View>
      </View>

      <View className={styles.section}>
        <View className={styles.sectionTitle}>
          <Text className={styles.sectionIcon}>🚨</Text>
          <Text>紧急程度</Text>
        </View>
        <View className={styles.formItem}>
          <View className={styles.label}>
            <Text className={styles.required}>*</Text>
            <Text>请选择紧急程度</Text>
          </View>
          <View className={styles.urgencyOptions}>
            <View
              className={classNames(styles.urgencyOption, styles.normal, urgency === 'normal' && styles.selected)}
              onClick={() => handleUrgencySelect('normal')}
            >
              一般
            </View>
            <View
              className={classNames(styles.urgencyOption, styles.urgent, urgency === 'urgent' && styles.selected)}
              onClick={() => handleUrgencySelect('urgent')}
            >
              紧急
            </View>
            <View
              className={classNames(styles.urgencyOption, styles.critical, urgency === 'critical' && styles.selected)}
              onClick={() => handleUrgencySelect('critical')}
            >
              非常紧急
            </View>
          </View>
        </View>
      </View>

      <View className={styles.section}>
        <View className={styles.sectionTitle}>
          <Text className={styles.sectionIcon}>📱</Text>
          <Text>联系方式</Text>
        </View>
        <View className={styles.formItem}>
          <View className={styles.label}>
            <Text className={styles.required}>*</Text>
            <Text>联系电话</Text>
          </View>
          <Input
            className={styles.input}
            type="number"
            placeholder="请输入您的联系电话"
            placeholderClass="inputPlaceholder"
            value={phone}
            onInput={(e) => setPhone(e.detail.value)}
            maxlength={11}
          />
        </View>
      </View>

      <View className={styles.footer}>
        <Button
          className={styles.submitBtn}
          onClick={handleSubmit}
          disabled={submitting || !isFormValid()}
        >
          {submitting ? '提交中...' : '提交报修'}
        </Button>
      </View>
    </View>
  )
}

export default SubmitPage
