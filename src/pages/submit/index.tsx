import React, { useState, useEffect, useCallback } from 'react'
import { View, Text, Input, Textarea, Picker, Button } from '@tarojs/components'
import Taro, { useRouter } from '@tarojs/taro'
import classNames from 'classnames'
import type { FacilityType, BuildingInfo, RepairPhoto, UrgencyLevel } from '@/types/repair'
import { useRepairStore, facilityTypes, buildings, units, rooms } from '@/store/useRepairStore'
import PhotoUpload from '@/components/PhotoUpload'
import styles from './index.module.scss'

interface FormErrors {
  facilityType?: string
  building?: string
  unit?: string
  room?: string
  title?: string
  description?: string
  phone?: string
}

const SubmitPage: React.FC = () => {
  const router = useRouter()
  const preFacilityId = router.params?.facilityId
  const addOrder = useRepairStore(state => state.addOrder)

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
  const [errors, setErrors] = useState<FormErrors>({})
  const [touched, setTouched] = useState<Record<string, boolean>>({})

  useEffect(() => {
    if (preFacilityId) {
      const facility = facilityTypes.find(f => f.id === preFacilityId)
      if (facility) {
        setSelectedFacility(facility)
      }
    }
  }, [preFacilityId])

  const validateField = useCallback((field: keyof FormErrors, value?: any): string | undefined => {
    switch (field) {
      case 'facilityType':
        if (!value) return '请选择设施类型'
        return undefined
      case 'building':
        if (!value) return '请选择楼栋'
        return undefined
      case 'unit':
        if (!value) return '请选择单元'
        return undefined
      case 'room':
        if (!value) return '请选择室号'
        return undefined
      case 'title':
        if (!value?.trim()) return '请输入问题标题'
        if (value.trim().length < 2) return '标题至少2个字符'
        if (value.trim().length > 30) return '标题不能超过30个字符'
        return undefined
      case 'description':
        if (!value?.trim()) return '请输入详细描述'
        if (value.trim().length < 5) return '描述至少5个字符，便于物业了解情况'
        if (value.trim().length > 500) return '描述不能超过500个字符'
        return undefined
      case 'phone':
        if (!value?.trim()) return '请输入联系电话'
        if (!/^1[3-9]\d{9}$/.test(value.trim())) return '请输入正确的手机号码'
        return undefined
      default:
        return undefined
    }
  }, [])

  const validateAll = useCallback((): { valid: boolean; errors: FormErrors } => {
    const newErrors: FormErrors = {}
    newErrors.facilityType = validateField('facilityType', selectedFacility)
    newErrors.building = validateField('building', location.building)
    newErrors.unit = validateField('unit', location.unit)
    newErrors.room = validateField('room', location.room)
    newErrors.title = validateField('title', title)
    newErrors.description = validateField('description', description)
    newErrors.phone = validateField('phone', phone)

    const hasErrors = Object.values(newErrors).some(v => v !== undefined)
    setErrors(newErrors)
    setTouched({
      facilityType: true,
      building: true,
      unit: true,
      room: true,
      title: true,
      description: true,
      phone: true
    })
    return { valid: !hasErrors, errors: newErrors }
  }, [validateField, selectedFacility, location, title, description, phone])

  const handleFieldTouch = useCallback((field: keyof FormErrors) => {
    setTouched(prev => ({ ...prev, [field]: true }))
    let value: any
    switch (field) {
      case 'facilityType':
        value = selectedFacility
        break
      case 'building':
        value = location.building
        break
      case 'unit':
        value = location.unit
        break
      case 'room':
        value = location.room
        break
      case 'title':
        value = title
        break
      case 'description':
        value = description
        break
      case 'phone':
        value = phone
        break
    }
    const error = validateField(field, value)
    setErrors(prev => ({ ...prev, [field]: error }))
  }, [validateField, selectedFacility, location, title, description, phone])

  const handleFacilitySelect = (facility: FacilityType) => {
    setSelectedFacility(facility)
    setTouched(prev => ({ ...prev, facilityType: true }))
    setErrors(prev => ({ ...prev, facilityType: undefined }))
  }

  const handleLocationChange = (field: keyof BuildingInfo, value: string) => {
    setLocation(prev => ({ ...prev, [field]: value }))
    setTouched(prev => ({ ...prev, [field]: true }))
    const error = validateField(field, value)
    setErrors(prev => ({ ...prev, [field]: error }))
  }

  const handleUrgencySelect = (level: UrgencyLevel) => {
    setUrgency(level)
  }

  const handlePhotosChange = (newPhotos: RepairPhoto[]) => {
    setPhotos(newPhotos)
  }

  const handleTitleChange = (value: string) => {
    setTitle(value)
    if (touched.title) {
      setErrors(prev => ({ ...prev, title: validateField('title', value) }))
    }
  }

  const handleDescriptionChange = (value: string) => {
    setDescription(value)
    if (touched.description) {
      setErrors(prev => ({ ...prev, description: validateField('description', value) }))
    }
  }

  const handlePhoneChange = (value: string) => {
    setPhone(value)
    if (touched.phone) {
      setErrors(prev => ({ ...prev, phone: validateField('phone', value) }))
    }
  }

  const handleSubmit = async () => {
    const { valid, errors: latestErrors } = validateAll()
    if (!valid) {
      const missingItems = Object.entries(latestErrors)
        .filter(([, v]) => v !== undefined)
        .map(([k]) => {
          const labelMap: Record<string, string> = {
            facilityType: '设施类型',
            building: '楼栋',
            unit: '单元',
            room: '室号',
            title: '问题标题',
            description: '详细描述',
            phone: '联系电话'
          }
          return labelMap[k] || k
        })
      const msg = missingItems.length > 0
        ? `请补全以下内容：${missingItems.join('、')}`
        : '请填写完整信息'
      Taro.showModal({
        title: '信息不完整',
        content: msg,
        showCancel: false,
        confirmText: '好的'
      })
      return
    }

    setSubmitting(true)

    try {
      const newOrder = addOrder({
        facilityType: selectedFacility!,
        location: { ...location },
        title: title.trim(),
        description: description.trim(),
        urgency,
        photos: [...photos],
        phone: phone.trim(),
        submitter: '业主'
      })

      Taro.showToast({
        title: '提交成功',
        icon: 'success',
        duration: 1500
      })

      setTimeout(() => {
        Taro.redirectTo({ url: `/pages/detail/index?id=${newOrder.id}` })
      }, 1500)
    } catch (error) {
      console.error('[SubmitPage] 提交失败', error)
      Taro.showToast({ title: '提交失败，请重试', icon: 'none' })
    } finally {
      setSubmitting(false)
    }
  }

  const showError = (field: keyof FormErrors) => touched[field] && errors[field]

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
                  selectedFacility?.id === facility.id && styles.selected,
                  showError('facilityType') && styles.errorBorder
                )}
                onClick={() => handleFacilitySelect(facility)}
              >
                <Text className={styles.facilityIcon}>{facility.icon}</Text>
                <Text className={styles.facilityName}>{facility.name}</Text>
              </View>
            ))}
          </View>
          {showError('facilityType') && (
            <Text className={styles.errorText}>{errors.facilityType}</Text>
          )}
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
              onCancel={() => handleFieldTouch('building')}
            >
              <View className={classNames(
                styles.pickerInput,
                location.building && styles.focused,
                showError('building') && styles.errorBorder
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
            {showError('building') && (
              <Text className={styles.errorText}>{errors.building}</Text>
            )}
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
              onCancel={() => handleFieldTouch('unit')}
            >
              <View className={classNames(
                styles.pickerInput,
                location.unit && styles.focused,
                showError('unit') && styles.errorBorder
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
            {showError('unit') && (
              <Text className={styles.errorText}>{errors.unit}</Text>
            )}
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
              onCancel={() => handleFieldTouch('room')}
            >
              <View className={classNames(
                styles.pickerInput,
                location.room && styles.focused,
                showError('room') && styles.errorBorder
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
            {showError('room') && (
              <Text className={styles.errorText}>{errors.room}</Text>
            )}
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
            className={classNames(styles.input, showError('title') && styles.errorBorder)}
            placeholder="请输入问题标题（如：客厅灯不亮）"
            placeholderClass="inputPlaceholder"
            value={title}
            onInput={(e) => handleTitleChange(e.detail.value)}
            onBlur={() => handleFieldTouch('title')}
            maxlength={30}
          />
          {showError('title') && (
            <Text className={styles.errorText}>{errors.title}</Text>
          )}
        </View>
        <View className={styles.formItem}>
          <View className={styles.label}>
            <Text className={styles.required}>*</Text>
            <Text>详细描述</Text>
          </View>
          <Textarea
            className={classNames(styles.textarea, showError('description') && styles.errorBorder)}
            placeholder="请详细描述问题情况，包括出现的现象、位置等信息..."
            placeholderClass="inputPlaceholder"
            value={description}
            onInput={(e) => handleDescriptionChange(e.detail.value)}
            onBlur={() => handleFieldTouch('description')}
            maxlength={500}
          />
          <View className={styles.textareaCount}>{description.length}/500</View>
          {showError('description') && (
            <Text className={styles.errorText}>{errors.description}</Text>
          )}
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
            className={classNames(styles.input, showError('phone') && styles.errorBorder)}
            type="number"
            placeholder="请输入您的联系电话"
            placeholderClass="inputPlaceholder"
            value={phone}
            onInput={(e) => handlePhoneChange(e.detail.value)}
            onBlur={() => handleFieldTouch('phone')}
            maxlength={11}
          />
          {showError('phone') && (
            <Text className={styles.errorText}>{errors.phone}</Text>
          )}
        </View>
      </View>

      <View className={styles.footer}>
        <Button
          className={styles.submitBtn}
          onClick={handleSubmit}
          disabled={submitting}
        >
          {submitting ? '提交中...' : '提交报修'}
        </Button>
      </View>
    </View>
  )
}

export default SubmitPage
