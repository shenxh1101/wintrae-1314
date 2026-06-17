import React from 'react'
import { View, Text } from '@tarojs/components'
import classNames from 'classnames'
import styles from './index.module.scss'

interface StarRatingProps {
  value: number
  max?: number
  readOnly?: boolean
  showText?: boolean
  onChange?: (value: number) => void
}

const ratingTexts = ['', '非常差', '较差', '一般', '满意', '非常满意']

const StarRating: React.FC<StarRatingProps> = ({
  value,
  max = 5,
  readOnly = false,
  showText = false,
  onChange
}) => {
  const handleClick = (index: number) => {
    if (readOnly || !onChange) return
    onChange(index + 1)
  }

  return (
    <View className={styles.container}>
      {Array.from({ length: max }).map((_, index) => (
        <Text
          key={index}
          className={classNames(
            styles.star,
            index < value && styles.active,
            !readOnly && styles.clickable
          )}
          onClick={() => handleClick(index)}
        >
          ★
        </Text>
      ))}
      {showText && value > 0 && (
        <Text className={styles.text}>{ratingTexts[value]}</Text>
      )}
    </View>
  )
}

export default StarRating
