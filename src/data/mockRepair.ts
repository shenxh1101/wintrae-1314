import type { RepairOrder, FacilityType, Maintainer } from '@/types/repair'

export const facilityTypes: FacilityType[] = [
  { id: '1', name: '水电维修', icon: '💡' },
  { id: '2', name: '管道疏通', icon: '🚿' },
  { id: '3', name: '电器维修', icon: '📺' },
  { id: '4', name: '门窗维修', icon: '🚪' },
  { id: '5', name: '墙面地面', icon: '🧱' },
  { id: '6', name: '公共设施', icon: '🏢' },
  { id: '7', name: '绿化养护', icon: '🌳' },
  { id: '8', name: '其他问题', icon: '📋' }
]

export const maintainers: Maintainer[] = [
  { id: '1', name: '张师傅', phone: '138****1234', specialty: ['水电维修', '电器维修'], status: 'free' },
  { id: '2', name: '李师傅', phone: '139****5678', specialty: ['管道疏通', '门窗维修'], status: 'busy' },
  { id: '3', name: '王师傅', phone: '137****9012', specialty: ['墙面地面', '公共设施'], status: 'free' },
  { id: '4', name: '赵师傅', phone: '136****3456', specialty: ['绿化养护', '其他问题'], status: 'free' }
]

export const buildings = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10']
export const units = ['1', '2', '3']
export const rooms = ['101', '102', '201', '202', '301', '302', '401', '402', '501', '502']

const baseTime = Date.now()

export const mockRepairOrders: RepairOrder[] = [
  {
    id: '1',
    orderNo: 'BX202606170001',
    title: '客厅灯不亮',
    facilityType: facilityTypes[0],
    location: { building: '3', unit: '2', room: '501' },
    description: '客厅主灯开关按了没反应，灯泡检查过是好的，可能是线路问题。已经影响晚上照明，麻烦尽快处理。',
    urgency: 'urgent',
    status: 'processing',
    photos: [
      { id: 'p1', url: 'https://picsum.photos/id/1/300/300' },
      { id: 'p2', url: 'https://picsum.photos/id/2/300/300' }
    ],
    submitter: '陈先生',
    submitterPhone: '138****8888',
    submitTime: new Date(baseTime - 3600000 * 5).toISOString(),
    acceptedTime: new Date(baseTime - 3600000 * 4).toISOString(),
    assignedTo: '张师傅',
    assignedTime: new Date(baseTime - 3600000 * 3.5).toISOString(),
    expectedTime: new Date(baseTime + 3600000 * 2).toISOString(),
    processingRecords: [
      {
        id: 'r1',
        type: 'submit',
        title: '提交报修',
        content: '提交报修工单：客厅灯不亮',
        operator: '陈先生',
        operatorRole: 'resident',
        time: new Date(baseTime - 3600000 * 5).toISOString()
      },
      {
        id: 'r2',
        type: 'accept',
        title: '物业接单',
        content: '物业管理员已接单，正在安排维修人员',
        operator: '物业管理员',
        operatorRole: 'property',
        time: new Date(baseTime - 3600000 * 4).toISOString()
      },
      {
        id: 'r3',
        type: 'assign',
        title: '分派维修人员',
        content: '已分派张师傅处理此工单',
        operator: '物业管理员',
        operatorRole: 'property',
        time: new Date(baseTime - 3600000 * 3.5).toISOString()
      },
      {
        id: 'r4',
        type: 'process',
        title: '维修中',
        content: '张师傅已到达现场，正在检查线路问题',
        operator: '张师傅',
        operatorRole: 'maintainer',
        time: new Date(baseTime - 3600000 * 2).toISOString()
      }
    ]
  },
  {
    id: '2',
    orderNo: 'BX202606170002',
    title: '厨房水龙头漏水',
    facilityType: facilityTypes[1],
    location: { building: '5', unit: '1', room: '302' },
    description: '厨房洗菜盆水龙头开关处漏水，关闭后仍有水滴，需要更换密封圈。',
    urgency: 'normal',
    status: 'pending',
    photos: [
      { id: 'p3', url: 'https://picsum.photos/id/3/300/300' }
    ],
    submitter: '李女士',
    submitterPhone: '139****9999',
    submitTime: new Date(baseTime - 3600000 * 2).toISOString(),
    processingRecords: [
      {
        id: 'r5',
        type: 'submit',
        title: '提交报修',
        content: '提交报修工单：厨房水龙头漏水',
        operator: '李女士',
        operatorRole: 'resident',
        time: new Date(baseTime - 3600000 * 2).toISOString()
      }
    ]
  },
  {
    id: '3',
    orderNo: 'BX202606160003',
    title: '电梯故障停运',
    facilityType: facilityTypes[5],
    location: { building: '2', unit: '2', room: '公共区域' },
    description: '2号楼2单元电梯今早突然停运，显示屏显示故障代码E02，高层住户上下楼很不方便。',
    urgency: 'critical',
    status: 'completed',
    photos: [
      { id: 'p4', url: 'https://picsum.photos/id/6/300/300' }
    ],
    submitter: '王先生',
    submitterPhone: '137****7777',
    submitTime: new Date(baseTime - 3600000 * 24).toISOString(),
    acceptedTime: new Date(baseTime - 3600000 * 23.5).toISOString(),
    assignedTo: '王师傅',
    assignedTime: new Date(baseTime - 3600000 * 23).toISOString(),
    completedTime: new Date(baseTime - 3600000 * 12).toISOString(),
    processingRecords: [
      {
        id: 'r6',
        type: 'submit',
        title: '提交报修',
        content: '提交报修工单：电梯故障停运',
        operator: '王先生',
        operatorRole: 'resident',
        time: new Date(baseTime - 3600000 * 24).toISOString()
      },
      {
        id: 'r7',
        type: 'accept',
        title: '物业接单',
        content: '紧急工单，已立即联系电梯维保公司',
        operator: '物业管理员',
        operatorRole: 'property',
        time: new Date(baseTime - 3600000 * 23.5).toISOString()
      },
      {
        id: 'r8',
        type: 'assign',
        title: '分派维修人员',
        content: '已联系专业电梯维修人员王师傅处理',
        operator: '物业管理员',
        operatorRole: 'property',
        time: new Date(baseTime - 3600000 * 23).toISOString()
      },
      {
        id: 'r9',
        type: 'process',
        title: '维修中',
        content: '检查发现是主板故障，已更换备用主板',
        operator: '王师傅',
        operatorRole: 'maintainer',
        time: new Date(baseTime - 3600000 * 18).toISOString(),
        photos: [
          { id: 'p5', url: 'https://picsum.photos/id/8/300/300' }
        ]
      },
      {
        id: 'r10',
        type: 'complete',
        title: '维修完成',
        content: '电梯已恢复正常运行，请居民放心使用',
        operator: '王师傅',
        operatorRole: 'maintainer',
        time: new Date(baseTime - 3600000 * 12).toISOString(),
        photos: [
          { id: 'p6', url: 'https://picsum.photos/id/9/300/300' }
        ]
      }
    ]
  },
  {
    id: '4',
    orderNo: 'BX202606150004',
    title: '防盗门门锁损坏',
    facilityType: facilityTypes[3],
    location: { building: '7', unit: '1', room: '201' },
    description: '入户防盗门的门锁转动不顺畅，有时钥匙插进去拔不出来，需要更换锁芯。',
    urgency: 'normal',
    status: 'rated',
    photos: [
      { id: 'p7', url: 'https://picsum.photos/id/119/300/300' }
    ],
    submitter: '张女士',
    submitterPhone: '136****6666',
    submitTime: new Date(baseTime - 3600000 * 48).toISOString(),
    acceptedTime: new Date(baseTime - 3600000 * 47).toISOString(),
    assignedTo: '李师傅',
    assignedTime: new Date(baseTime - 3600000 * 46).toISOString(),
    completedTime: new Date(baseTime - 3600000 * 30).toISOString(),
    ratedTime: new Date(baseTime - 3600000 * 28).toISOString(),
    rating: 5,
    ratingComment: '李师傅非常专业，上门也很准时，很快就换好了锁芯，服务态度很好！',
    processingRecords: [
      {
        id: 'r11',
        type: 'submit',
        title: '提交报修',
        content: '提交报修工单：防盗门门锁损坏',
        operator: '张女士',
        operatorRole: 'resident',
        time: new Date(baseTime - 3600000 * 48).toISOString()
      },
      {
        id: 'r12',
        type: 'accept',
        title: '物业接单',
        content: '已接单，正在安排维修人员',
        operator: '物业管理员',
        operatorRole: 'property',
        time: new Date(baseTime - 3600000 * 47).toISOString()
      },
      {
        id: 'r13',
        type: 'assign',
        title: '分派维修人员',
        content: '已分派李师傅处理此工单',
        operator: '物业管理员',
        operatorRole: 'property',
        time: new Date(baseTime - 3600000 * 46).toISOString()
      },
      {
        id: 'r14',
        type: 'complete',
        title: '维修完成',
        content: '已更换锁芯，门锁恢复正常使用',
        operator: '李师傅',
        operatorRole: 'maintainer',
        time: new Date(baseTime - 3600000 * 30).toISOString()
      },
      {
        id: 'r15',
        type: 'rate',
        title: '住户评价',
        content: '评分5星，非常满意！',
        operator: '张女士',
        operatorRole: 'resident',
        time: new Date(baseTime - 3600000 * 28).toISOString()
      }
    ]
  },
  {
    id: '5',
    orderNo: 'BX202606160005',
    title: '卫生间下水道堵塞',
    facilityType: facilityTypes[1],
    location: { building: '4', unit: '3', room: '401' },
    description: '卫生间地漏和马桶排水都很慢，洗澡后积水很久才能排完，怀疑是主管道堵塞。',
    urgency: 'urgent',
    status: 'pending',
    photos: [
      { id: 'p8', url: 'https://picsum.photos/id/160/300/300' }
    ],
    submitter: '刘先生',
    submitterPhone: '135****5555',
    submitTime: new Date(baseTime - 3600000 * 10).toISOString(),
    processingRecords: [
      {
        id: 'r16',
        type: 'submit',
        title: '提交报修',
        content: '提交报修工单：卫生间下水道堵塞',
        operator: '刘先生',
        operatorRole: 'resident',
        time: new Date(baseTime - 3600000 * 10).toISOString()
      }
    ]
  },
  {
    id: '6',
    orderNo: 'BX202606150006',
    title: '空调不制冷',
    facilityType: facilityTypes[2],
    location: { building: '1', unit: '2', room: '601' },
    description: '客厅空调开机后只出风不制冷，已清洗过滤网但问题依旧，可能需要加氟。',
    urgency: 'normal',
    status: 'processing',
    photos: [
      { id: 'p9', url: 'https://picsum.photos/id/201/300/300' }
    ],
    submitter: '周女士',
    submitterPhone: '134****4444',
    submitTime: new Date(baseTime - 3600000 * 36).toISOString(),
    acceptedTime: new Date(baseTime - 3600000 * 35).toISOString(),
    assignedTo: '张师傅',
    assignedTime: new Date(baseTime - 3600000 * 34).toISOString(),
    expectedTime: new Date(baseTime + 3600000 * 5).toISOString(),
    processingRecords: [
      {
        id: 'r17',
        type: 'submit',
        title: '提交报修',
        content: '提交报修工单：空调不制冷',
        operator: '周女士',
        operatorRole: 'resident',
        time: new Date(baseTime - 3600000 * 36).toISOString()
      },
      {
        id: 'r18',
        type: 'accept',
        title: '物业接单',
        content: '已接单，已安排维修人员联系您',
        operator: '物业管理员',
        operatorRole: 'property',
        time: new Date(baseTime - 3600000 * 35).toISOString()
      },
      {
        id: 'r19',
        type: 'assign',
        title: '分派维修人员',
        content: '已分派张师傅处理此工单',
        operator: '物业管理员',
        operatorRole: 'property',
        time: new Date(baseTime - 3600000 * 34).toISOString()
      },
      {
        id: 'r20',
        type: 'supplement',
        title: '住户补充说明',
        content: '补充：空调是去年买的，还在保修期内',
        operator: '周女士',
        operatorRole: 'resident',
        time: new Date(baseTime - 3600000 * 20).toISOString()
      }
    ]
  },
  {
    id: '7',
    orderNo: 'BX202606140007',
    title: '墙面脱落渗水',
    facilityType: facilityTypes[4],
    location: { building: '6', unit: '1', room: '102' },
    description: '主卧外墙墙面有脱落现象，下雨时墙角有渗水痕迹，需要重新做防水。',
    urgency: 'urgent',
    status: 'completed',
    photos: [
      { id: 'p10', url: 'https://picsum.photos/id/582/300/300' },
      { id: 'p11', url: 'https://picsum.photos/id/598/300/300' }
    ],
    submitter: '吴先生',
    submitterPhone: '133****3333',
    submitTime: new Date(baseTime - 3600000 * 72).toISOString(),
    acceptedTime: new Date(baseTime - 3600000 * 71).toISOString(),
    assignedTo: '王师傅',
    assignedTime: new Date(baseTime - 3600000 * 70).toISOString(),
    completedTime: new Date(baseTime - 3600000 * 24).toISOString(),
    processingRecords: [
      {
        id: 'r21',
        type: 'submit',
        title: '提交报修',
        content: '提交报修工单：墙面脱落渗水',
        operator: '吴先生',
        operatorRole: 'resident',
        time: new Date(baseTime - 3600000 * 72).toISOString()
      },
      {
        id: 'r22',
        type: 'accept',
        title: '物业接单',
        content: '已联系防水维修人员，将尽快上门处理',
        operator: '物业管理员',
        operatorRole: 'property',
        time: new Date(baseTime - 3600000 * 71).toISOString()
      },
      {
        id: 'r23',
        type: 'assign',
        title: '分派维修人员',
        content: '已分派王师傅处理此工单',
        operator: '物业管理员',
        operatorRole: 'property',
        time: new Date(baseTime - 3600000 * 70).toISOString()
      },
      {
        id: 'r24',
        type: 'process',
        title: '维修中',
        content: '已铲除空鼓墙面，正在做防水处理',
        operator: '王师傅',
        operatorRole: 'maintainer',
        time: new Date(baseTime - 3600000 * 48).toISOString()
      },
      {
        id: 'r25',
        type: 'complete',
        title: '维修完成',
        content: '防水处理完成，墙面已恢复，待干燥后可正常使用',
        operator: '王师傅',
        operatorRole: 'maintainer',
        time: new Date(baseTime - 3600000 * 24).toISOString()
      }
    ]
  },
  {
    id: '8',
    orderNo: 'BX202606160008',
    title: '健身器材损坏',
    facilityType: facilityTypes[5],
    location: { building: '健身区', unit: '公共区域', room: '公共区域' },
    description: '小区健身区的跑步机跑步带打滑，使用时有异响，存在安全隐患。',
    urgency: 'normal',
    status: 'pending',
    photos: [
      { id: 'p12', url: 'https://picsum.photos/id/225/300/300' }
    ],
    submitter: '孙女士',
    submitterPhone: '132****2222',
    submitTime: new Date(baseTime - 3600000 * 8).toISOString(),
    processingRecords: [
      {
        id: 'r26',
        type: 'submit',
        title: '提交报修',
        content: '提交报修工单：健身器材损坏',
        operator: '孙女士',
        operatorRole: 'resident',
        time: new Date(baseTime - 3600000 * 8).toISOString()
      }
    ]
  },
  {
    id: '9',
    orderNo: 'BX202606130009',
    title: '绿化树木修剪',
    facilityType: facilityTypes[6],
    location: { building: '中心花园', unit: '公共区域', room: '公共区域' },
    description: '中心花园有几棵树木枝叶过于茂盛，遮挡了一楼住户的阳光，且部分枯枝有掉落风险。',
    urgency: 'normal',
    status: 'rated',
    photos: [
      { id: 'p13', url: 'https://picsum.photos/id/230/300/300' }
    ],
    submitter: '郑先生',
    submitterPhone: '131****1111',
    submitTime: new Date(baseTime - 3600000 * 96).toISOString(),
    acceptedTime: new Date(baseTime - 3600000 * 95).toISOString(),
    assignedTo: '赵师傅',
    assignedTime: new Date(baseTime - 3600000 * 94).toISOString(),
    completedTime: new Date(baseTime - 3600000 * 60).toISOString(),
    ratedTime: new Date(baseTime - 3600000 * 58).toISOString(),
    rating: 4,
    ratingComment: '师傅工作很认真，修剪得很整齐，就是时间稍长了点。',
    processingRecords: [
      {
        id: 'r27',
        type: 'submit',
        title: '提交报修',
        content: '提交报修工单：绿化树木修剪',
        operator: '郑先生',
        operatorRole: 'resident',
        time: new Date(baseTime - 3600000 * 96).toISOString()
      },
      {
        id: 'r28',
        type: 'accept',
        title: '物业接单',
        content: '已接单，将安排绿化人员近期处理',
        operator: '物业管理员',
        operatorRole: 'property',
        time: new Date(baseTime - 3600000 * 95).toISOString()
      },
      {
        id: 'r29',
        type: 'assign',
        title: '分派维修人员',
        content: '已分派赵师傅处理此工单',
        operator: '物业管理员',
        operatorRole: 'property',
        time: new Date(baseTime - 3600000 * 94).toISOString()
      },
      {
        id: 'r30',
        type: 'complete',
        title: '修剪完成',
        content: '已完成树木修剪和枯枝清理，现场已打扫干净',
        operator: '赵师傅',
        operatorRole: 'maintainer',
        time: new Date(baseTime - 3600000 * 60).toISOString()
      },
      {
        id: 'r31',
        type: 'rate',
        title: '住户评价',
        content: '评分4星，满意',
        operator: '郑先生',
        operatorRole: 'resident',
        time: new Date(baseTime - 3600000 * 58).toISOString()
      }
    ]
  },
  {
    id: '10',
    orderNo: 'BX202606170010',
    title: '门禁系统故障',
    facilityType: facilityTypes[5],
    location: { building: '大门', unit: '公共区域', room: '公共区域' },
    description: '小区大门的人脸识别门禁经常识别失败，刷卡也偶尔失灵，进出很不方便。',
    urgency: 'urgent',
    status: 'processing',
    photos: [
      { id: 'p14', url: 'https://picsum.photos/id/160/300/300' }
    ],
    submitter: '冯先生',
    submitterPhone: '130****0000',
    submitTime: new Date(baseTime - 3600000 * 16).toISOString(),
    acceptedTime: new Date(baseTime - 3600000 * 15).toISOString(),
    assignedTo: '张师傅',
    assignedTime: new Date(baseTime - 3600000 * 14).toISOString(),
    expectedTime: new Date(baseTime + 3600000 * 10).toISOString(),
    processingRecords: [
      {
        id: 'r32',
        type: 'submit',
        title: '提交报修',
        content: '提交报修工单：门禁系统故障',
        operator: '冯先生',
        operatorRole: 'resident',
        time: new Date(baseTime - 3600000 * 16).toISOString()
      },
      {
        id: 'r33',
        type: 'accept',
        title: '物业接单',
        content: '已联系门禁系统供应商，将尽快上门检修',
        operator: '物业管理员',
        operatorRole: 'property',
        time: new Date(baseTime - 3600000 * 15).toISOString()
      },
      {
        id: 'r34',
        type: 'assign',
        title: '分派维修人员',
        content: '已分派张师傅配合供应商处理',
        operator: '物业管理员',
        operatorRole: 'property',
        time: new Date(baseTime - 3600000 * 14).toISOString()
      }
    ]
  }
]

export const getRepairOrders = () => mockRepairOrders

export const getRepairOrderById = (id: string) => mockRepairOrders.find(order => order.id === id)

export const getRepairOrdersByStatus = (status: string) => {
  if (status === 'all') return mockRepairOrders
  return mockRepairOrders.filter(order => order.status === status)
}
