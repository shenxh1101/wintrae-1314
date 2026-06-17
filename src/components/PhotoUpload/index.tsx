import React from 'react'
import { View, Image } from '@tarojs/components'
import Taro from '@tarojs/taro'
import type { RepairPhoto } from '@/types/repair'
import styles from './index.module.scss'

interface PhotoUploadProps {
  photos: RepairPhoto[]
  onChange: (photos: RepairPhoto[]) => void
  maxCount?: number
}

const PhotoUpload: React.FC<PhotoUploadProps> = ({ 
  photos, 
  onChange, 
  maxCount = 9 
}) => {
  const handleChooseImage = async () => {
    try {
      const remainCount = maxCount - photos.length
      if (remainCount <= 0) {
        Taro.showToast({ title: `最多上传${maxCount}张`, icon: 'none' })
        return
      }

      const res = await Taro.chooseImage({
        count: remainCount,
        sizeType: ['compressed'],
        sourceType: ['album', 'camera']
      })

      const newPhotos: RepairPhoto[] = res.tempFilePaths.map((url, index) => ({
        id: `photo_${Date.now()}_${index}`,
        url
      }))

      onChange([...photos, ...newPhotos])
      console.log('[PhotoUpload] 选择图片成功', newPhotos.length, '张')
    } catch (error) {
      console.error('[PhotoUpload] 选择图片失败', error)
    }
  }

  const handleDelete = (id: string) => {
    onChange(photos.filter(p => p.id !== id))
  }

  return (
    <View className={styles.container}>
      {photos.map((photo) => (
        <View key={photo.id} className={styles.photoItem}>
          <Image src={photo.url} mode="aspectFill" />
          <View className={styles.deleteBtn} onClick={() => handleDelete(photo.id)}>
            ×
          </View>
        </View>
      ))}
      {photos.length < maxCount && (
        <View className={styles.uploadBtn} onClick={handleChooseImage}>
          <View className={styles.uploadIcon}>+</View>
          <View className={styles.uploadText}>添加图片</View>
        </View>
      )}
    </View>
  )
}

export default PhotoUpload
