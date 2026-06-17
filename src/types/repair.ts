export type RepairStatus = 'pending' | 'processing' | 'completed' | 'confirming' | 'rated'

export type UrgencyLevel = 'normal' | 'urgent' | 'critical'

export type UserRole = 'resident' | 'property' | 'maintainer'

export interface FacilityType {
  id: string
  name: string
  icon: string
}

export interface BuildingInfo {
  building: string
  unit: string
  room: string
}

export interface RepairPhoto {
  id: string
  url: string
  thumbUrl?: string
}

export interface ProcessingRecord {
  id: string
  type: 'submit' | 'accept' | 'assign' | 'process' | 'complete' | 'confirm' | 'rate' | 'supplement' | 'urge'
  title: string
  content: string
  operator: string
  operatorRole: UserRole
  time: string
  photos?: RepairPhoto[]
}

export interface UrgeRecord {
  id: string
  time: string
  operator: string
  remark?: string
}

export interface RepairOrder {
  id: string
  orderNo: string
  title: string
  facilityType: FacilityType
  location: BuildingInfo
  description: string
  urgency: UrgencyLevel
  photos: RepairPhoto[]
  status: RepairStatus
  submitter: string
  submitterPhone: string
  submitTime: string
  expectedTime?: string
  acceptedTime?: string
  assignedTo?: string
  assignedTime?: string
  completedTime?: string
  confirmedTime?: string
  ratedTime?: string
  rating?: number
  ratingComment?: string
  processingRecords: ProcessingRecord[]
  urgeRecords: UrgeRecord[]
  relatedAnnouncements?: string[]
}

export interface Announcement {
  id: string
  title: string
  content: string
  category: 'notice' | 'maintenance' | 'safety' | 'activity'
  publishTime: string
  publisher: string
  isTop: boolean
  coverImage?: string
  relatedFacilityTypes?: string[]
}

export interface Maintainer {
  id: string
  name: string
  phone: string
  specialty: string[]
  status: 'free' | 'busy'
}
