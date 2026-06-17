import type { Announcement } from '@/types/repair'

const baseTime = Date.now()

export const mockAnnouncements: Announcement[] = [
  {
    id: 'a1',
    title: '关于小区电梯定期维保的通知',
    content: `尊敬的各位业主：\n\n为保障小区电梯安全运行，物业服务中心将于2026年6月20日（周六）对全小区电梯进行例行维保。\n\n维保时间安排：\n- 1号楼：8:00-10:00\n- 2号楼：10:00-12:00\n- 3号楼：13:00-15:00\n- 4-6号楼：15:00-18:00\n\n维保期间电梯将暂停使用，请各位业主提前做好出行安排。如有紧急情况，请拨打物业24小时服务热线：400-888-8888。\n\n感谢您的理解与支持！\n\n物业服务中心\n2026年6月18日`,
    category: 'maintenance',
    publishTime: new Date(baseTime - 3600000 * 2).toISOString(),
    publisher: '物业服务中心',
    isTop: true,
    coverImage: 'https://picsum.photos/id/3/750/500',
    relatedFacilityTypes: ['6']
  },
  {
    id: 'a2',
    title: '夏季用电安全温馨提示',
    content: `尊敬的各位业主：\n\n夏季高温来临，空调、冰箱等电器使用频繁，为确保用电安全，物业服务中心温馨提示：\n\n1. 不要在一个电源插座上同时使用多个大功率电器\n2. 定期检查家中线路是否老化、破损\n3. 外出时记得关闭不必要的电器电源\n4. 空调温度建议设置在26℃以上，既环保又节能\n5. 如遇停电或电器故障，请及时联系物业\n\n物业服务中心已对小区公共区域电气设备进行了全面检查，确保安全运行。如您需要协助，请拨打服务热线：400-888-8888。\n\n物业服务中心\n2026年6月15日`,
    category: 'safety',
    publishTime: new Date(baseTime - 3600000 * 24).toISOString(),
    publisher: '物业服务中心',
    isTop: true,
    coverImage: 'https://picsum.photos/id/1/750/500',
    relatedFacilityTypes: ['1', '3']
  },
  {
    id: 'a3',
    title: '夏季常见电器故障及处理方法',
    content: `夏季是电器故障高发期，以下是常见问题及处理方法：\n\n一、空调不制冷\n1. 检查过滤网是否清洁\n2. 确认温度设置是否正确\n3. 如仍有问题，可能需要加氟，请联系物业报修\n\n二、冰箱冷藏室结冰\n1. 检查门封条是否密封良好\n2. 温度调节是否合适\n3. 定期除霜可提高制冷效率\n\n三、跳闸问题\n1. 同时使用多个大功率电器可能导致跳闸\n2. 先关闭部分电器，再尝试合闸\n3. 频繁跳闸请联系专业电工检修\n\n如需维修服务，请在"小区报修"小程序提交工单，我们将尽快安排专业人员处理。\n\n物业服务中心`,
    category: 'notice',
    publishTime: new Date(baseTime - 3600000 * 48).toISOString(),
    publisher: '物业服务中心',
    isTop: false,
    coverImage: 'https://picsum.photos/id/201/750/500',
    relatedFacilityTypes: ['1', '3']
  },
  {
    id: 'a4',
    title: '关于加强小区消防安全管理的通知',
    content: `尊敬的各位业主：\n\n为保障小区消防安全，物业服务中心将加强消防安全管理工作，具体措施如下：\n\n1. 严禁在楼道、楼梯间堆放杂物\n2. 严禁占用消防通道停放车辆\n3. 定期检查消防设施设备\n4. 下月将组织消防演练，请各位业主积极参与\n5. 家中建议配备灭火器、烟感报警器\n\n消防安全，人人有责。如发现消防安全隐患，请及时拨打物业24小时服务热线：400-888-8888。\n\n物业服务中心\n2026年6月10日`,
    category: 'safety',
    publishTime: new Date(baseTime - 3600000 * 72).toISOString(),
    publisher: '物业服务中心',
    isTop: false,
    coverImage: 'https://picsum.photos/id/6/750/500'
  },
  {
    id: 'a5',
    title: '小区暑期儿童活动安排',
    content: `亲爱的业主朋友们：\n\n暑假即将来临，为丰富小区儿童的假期生活，物业服务中心将举办系列暑期活动：\n\n一、"小小工程师"体验课\n- 时间：7月5日 上午9:00-11:00\n- 地点：小区会所多功能厅\n- 内容：简单水电知识学习、安全用电教育\n\n二、亲子DIY手工坊\n- 时间：7月12日 下午14:00-16:00\n- 地点：中心花园凉亭\n- 内容：环保手工制作\n\n三、消防安全小课堂\n- 时间：7月19日 上午9:00-11:00\n- 地点：消防控制室\n- 内容：消防知识学习、灭火器使用演练\n\n报名方式：请于6月30日前到物业服务中心报名，或拨打服务热线：400-888-8888。\n\n物业服务中心\n2026年6月8日`,
    category: 'activity',
    publishTime: new Date(baseTime - 3600000 * 96).toISOString(),
    publisher: '物业服务中心',
    isTop: false,
    coverImage: 'https://picsum.photos/id/338/750/500'
  },
  {
    id: 'a6',
    title: '常见水龙头漏水处理指南',
    content: `水龙头漏水是常见的家庭维修问题，以下是简单的处理方法：\n\n一、阀芯漏水\n1. 关闭进水阀门\n2. 拆下手柄，暴露阀芯\n3. 检查阀芯是否磨损，必要时更换\n4. 重新组装并测试\n\n二、连接部位漏水\n1. 检查连接螺帽是否松动\n2. 如有松动，用扳手适当拧紧\n3. 如仍漏水，可能需要更换密封圈\n\n三、出水管漏水\n1. 检查出水管连接处\n2. 更换老化的密封垫\n\n如自行处理困难，请在"小区报修"小程序提交工单，我们将安排专业人员上门维修。\n\n物业服务中心`,
    category: 'notice',
    publishTime: new Date(baseTime - 3600000 * 120).toISOString(),
    publisher: '物业服务中心',
    isTop: false,
    coverImage: 'https://picsum.photos/id/312/750/500',
    relatedFacilityTypes: ['2']
  },
  {
    id: 'a7',
    title: '关于小区公共设施维护的通知',
    content: `尊敬的各位业主：\n\n为提升小区居住环境，物业服务中心将于近期对以下公共设施进行维护：\n\n1. 健身器材维护保养（6月22日）\n2. 儿童游乐设施安全检查（6月23日）\n3. 园林绿化修剪（6月24-25日）\n4. 路灯照明系统巡检（6月26日）\n\n维护期间相关区域可能临时封闭，请各位业主注意避让。给您带来的不便，敬请谅解。\n\n如有任何疑问，请拨打物业服务热线：400-888-8888。\n\n物业服务中心\n2026年6月16日`,
    category: 'maintenance',
    publishTime: new Date(baseTime - 3600000 * 36).toISOString(),
    publisher: '物业服务中心',
    isTop: false,
    coverImage: 'https://picsum.photos/id/1036/750/500',
    relatedFacilityTypes: ['5', '6', '7']
  },
  {
    id: 'a8',
    title: '雨季房屋防水检查温馨提示',
    content: `尊敬的各位业主：\n\n目前已进入雨季，为避免房屋漏水问题影响您的生活，物业服务中心温馨提示：\n\n1. 检查窗边、阳台是否有渗水痕迹\n2. 清理阳台排水口，确保排水畅通\n3. 如发现墙面渗水、屋顶漏水等问题，请及时报修\n4. 低层住户注意检查地下室是否有积水\n\n物业服务中心已对小区公共区域防水设施进行全面检查。如您家中需要防水维修服务，请在"小区报修"小程序提交工单，我们将安排专业人员处理。\n\n紧急情况请拨打24小时服务热线：400-888-8888。\n\n物业服务中心`,
    category: 'notice',
    publishTime: new Date(baseTime - 3600000 * 60).toISOString(),
    publisher: '物业服务中心',
    isTop: false,
    coverImage: 'https://picsum.photos/id/582/750/500',
    relatedFacilityTypes: ['4', '5']
  }
]

export const getAnnouncements = () => mockAnnouncements

export const getAnnouncementById = (id: string) => mockAnnouncements.find(a => a.id === id)

export const getAnnouncementsByCategory = (category: string) => {
  if (category === 'all') return mockAnnouncements
  return mockAnnouncements.filter(a => a.category === category)
}

export const getRelatedAnnouncements = (facilityTypeId: string) => {
  return mockAnnouncements.filter(a => 
    a.relatedFacilityTypes?.includes(facilityTypeId)
  )
}
