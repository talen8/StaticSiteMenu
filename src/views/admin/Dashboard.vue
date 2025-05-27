<template>
  <div class="p-6">
    <!-- 添加消息组件 -->
    <Message ref="messageRef" />

    <!-- 统计卡片 -->
    <h2 class="text-xl font-semibold text-center md:text-left mb-4">数据概览</h2>
    <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
      <div class="bg-blue-100 p-4 rounded-lg">
        <h3 class="font-medium">收录网站</h3>
        <p class="text-2xl font-bold">{{ totalSites }}</p>
        <p class="text-sm" :class="todayNewSites >= 0 ? 'text-blue-600' : 'text-red-600'">
          今日 {{ todayNewSites >= 0 ? '+' : '' }}{{ todayNewSites }}
        </p>
        <p class="text-sm" :class="yesterdayNewSites >= 0 ? 'text-blue-600' : 'text-red-600'">
          昨日 {{ yesterdayNewSites >= 0 ? '+' : '' }}{{ yesterdayNewSites }}
        </p>
      </div>
      <div class="bg-yellow-100 p-4 rounded-lg">
        <h3 class="font-medium">分类数量</h3>
        <p class="text-2xl font-bold">{{ totalCategories }}</p>
        <p class="text-sm" :class="todayNewCategories >= 0 ? 'text-yellow-600' : 'text-red-600'">
          今日 {{ todayNewCategories >= 0 ? '+' : '' }}{{ todayNewCategories }}
        </p>
        <p
          class="text-sm"
          :class="yesterdayNewCategories >= 0 ? 'text-yellow-600' : 'text-red-600'"
        >
          昨日 {{ yesterdayNewCategories >= 0 ? '+' : '' }}{{ yesterdayNewCategories }}
        </p>
      </div>
      <div class="bg-green-100 p-4 rounded-lg">
        <h3 class="font-medium">访问次数</h3>
        <p class="text-2xl font-bold">{{ totalVisits }}</p>
        <p class="text-sm" :class="todayNewVisits >= 0 ? 'text-green-600' : 'text-red-600'">
          今日 {{ todayNewVisits >= 0 ? '+' : '' }}{{ todayNewVisits }}
        </p>
        <p class="text-sm" :class="yesterdayNewVisits >= 0 ? 'text-green-600' : 'text-red-600'">
          昨日 {{ yesterdayNewVisits >= 0 ? '+' : '' }}{{ yesterdayNewVisits }}
        </p>
      </div>
      <div class="bg-purple-100 p-4 rounded-lg">
        <h3 class="font-medium">用户数量</h3>
        <p class="text-2xl font-bold">{{ totalUsers }}</p>
        <p class="text-sm" :class="todayNewUsers >= 0 ? 'text-purple-600' : 'text-red-600'">
          今日 {{ todayNewUsers >= 0 ? '+' : '' }}{{ todayNewUsers }}
        </p>
        <p class="text-sm" :class="yesterdayNewUsers >= 0 ? 'text-purple-600' : 'text-red-600'">
          昨日 {{ yesterdayNewUsers >= 0 ? '+' : '' }}{{ yesterdayNewUsers }}
        </p>
      </div>
    </div>

    <!-- 趋势图 -->
    <div class="mt-8 bg-white rounded-lg shadow p-6">
      <div class="flex justify-between items-center mb-4">
        <div class="flex items-center space-x-4">
          <h3 class="text-lg font-medium">
            {{ currentTrend === 'visits' ? '访问趋势' : '收录趋势' }}
          </h3>
          <button
            class="p-1 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors"
            :title="currentTrend === 'visits' ? '切换到收录趋势' : '切换到访问趋势'"
            @click="toggleTrend"
          >
            <i class="fas fa-exchange-alt"></i>
          </button>
        </div>
        <div class="flex space-x-2">
          <button
            v-for="period in timePeriods"
            :key="period.value"
            class="px-3 py-1 text-sm border rounded"
            :class="currentPeriod === period.value ? 'bg-blue-500 text-white' : 'hover:bg-gray-50'"
            @click="changeTimePeriod(period.value)"
          >
            {{ period.label }}
          </button>
        </div>
      </div>
      <div ref="chartRef" class="h-64"></div>
    </div>

    <!-- 数据统计 -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
      <!-- 热门站点 -->
      <div class="bg-white rounded-lg shadow p-6">
        <div class="flex justify-between items-center mb-4">
          <h3 class="text-lg font-medium">热门站点</h3>
          <div class="flex space-x-2">
            <button
              class="px-3 py-1 text-sm border rounded"
              :class="hotSitesType === 'seven' ? 'bg-blue-500 text-white' : 'hover:bg-gray-50'"
              @click="changeHotSitesType('seven')"
            >
              七日
            </button>
            <button
              class="px-3 py-1 text-sm border rounded"
              :class="hotSitesType === 'total' ? 'bg-blue-500 text-white' : 'hover:bg-gray-50'"
              @click="changeHotSitesType('total')"
            >
              总计
            </button>
          </div>
        </div>
        <div ref="hotSitesChartRef" class="h-64"></div>
      </div>

      <!-- 最近提交 -->
      <div class="bg-white rounded-lg shadow p-6">
        <div class="flex justify-between items-center mb-4">
          <h3 class="text-lg font-medium">最近提交</h3>
        </div>
        <div class="grid grid-cols-2 gap-4">
          <div
            v-for="site in recentSubmissions"
            :key="site.id"
            class="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
            @click="editSite(site)"
          >
            <div class="flex items-center space-x-3 flex-1 min-w-0">
              <img
                :src="site.favicon_url || defaultIcon"
                :alt="site.name"
                class="w-6 h-6 rounded bg-white object-contain border border-gray-100 flex-shrink-0"
                @error="handleImageError"
              />
              <div class="min-w-0 flex-1">
                <p class="font-medium text-sm truncate max-w-[120px]" :title="site.name">
                  {{ site.name }}
                </p>
                <p
                  class="text-xs text-gray-500 truncate max-w-[120px]"
                  :title="site.category?.name || '未分类'"
                >
                  {{ site.category?.name || '未分类' }}
                </p>
              </div>
            </div>
            <span
              :class="[
                'px-2 py-1 text-xs rounded-full ml-2 flex-shrink-0',
                site.status === 'pending'
                  ? 'bg-yellow-100 text-yellow-800'
                  : site.status === 'approved'
                    ? 'bg-green-100 text-green-800'
                    : 'bg-red-100 text-red-800'
              ]"
            >
              {{
                site.status === 'pending'
                  ? '待审核'
                  : site.status === 'approved'
                    ? '已通过'
                    : '已拒绝'
              }}
            </span>
          </div>

          <!-- 查看更多卡片 -->
          <router-link
            to="/admin/sites"
            class="flex items-center justify-center p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer border-2 border-dashed border-gray-200"
          >
            <div class="text-center">
              <i class="fas fa-ellipsis-h text-gray-400 text-xl mb-2"></i>
              <p class="text-sm text-gray-500">查看更多</p>
            </div>
          </router-link>
        </div>
        <div v-if="recentSubmissions.length === 0" class="text-center text-gray-500 py-4">
          暂无提交记录
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { LineChart, BarChart, PieChart } from 'echarts/charts'
import {
  TitleComponent,
  TooltipComponent,
  GridComponent,
  LegendComponent
} from 'echarts/components'
import * as echarts from 'echarts/core'
import { CanvasRenderer } from 'echarts/renderers'
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'

import Message from '@/components/admin/Message.vue'
import { supabase } from '@/lib/supabase'

// 注册必要的组件
echarts.use([
  TitleComponent,
  TooltipComponent,
  GridComponent,
  LegendComponent,
  LineChart,
  BarChart,
  PieChart,
  CanvasRenderer
])

// 统计数据
const totalSites = ref(0)
const totalVisits = ref(0)
const totalCategories = ref(0)
const totalUsers = ref(0)
const todayNewSites = ref(0)
const todayNewVisits = ref(0)
const todayNewCategories = ref(0)
const todayNewUsers = ref(0)
const yesterdayNewSites = ref(0)
const yesterdayNewVisits = ref(0)
const yesterdayNewCategories = ref(0)
const yesterdayNewUsers = ref(0)

// 图表相关
const chartRef = ref(null)
let chart = null
const currentPeriod = ref('month')
const currentTrend = ref('visits')
const timePeriods = [
  { label: '本周', value: 'week' },
  { label: '本月', value: 'month' },
  { label: '全年', value: 'year' }
]

// 访问数据
const visitData = ref({
  daily: [],
  total: []
})

// 热门站点相关
const hotSitesChartRef = ref(null)
let hotSitesChart = null
const hotSitesType = ref('seven')
const hotSitesData = ref([])

// 最近提交相关
const recentSubmissions = ref([])

// 添加消息引用
const messageRef = ref(null)

// 初始化状态管理
const router = useRouter()
const defaultIcon = '/images/default/default-icon.svg'

// 加载统计数据
const loadStats = async () => {
  try {
    // 获取今日和昨日的时间
    const today = new Date()
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)

    // 格式化日期为 YYYY-MM-DD
    const formatDate = (date) => {
      return date.toISOString().split('T')[0]
    }

    const todayStr = formatDate(today)
    const yesterdayStr = formatDate(yesterday)

    // 使用单个查询获取所有统计数据
    const { data, error } = await supabase.rpc('get_dashboard_stats', {
      today_date: todayStr,
      yesterday_date: yesterdayStr
    })

    if (error) {
      console.error('数据库查询错误:', error)
      throw error
    }

    // 获取第一条记录（因为返回的是数组）
    const stats = data[0]

    // 更新统计数据
    totalSites.value = stats.total_sites || 0
    totalVisits.value = stats.total_visits || 0
    totalCategories.value = stats.total_categories || 0
    totalUsers.value = stats.total_users || 0

    todayNewSites.value = stats.today_sites || 0
    todayNewVisits.value = stats.today_visits || 0
    todayNewCategories.value = stats.today_categories || 0
    todayNewUsers.value = stats.today_users || 0

    yesterdayNewSites.value = stats.yesterday_sites || 0
    yesterdayNewVisits.value = stats.yesterday_visits || 0
    yesterdayNewCategories.value = stats.yesterday_categories || 0
    yesterdayNewUsers.value = stats.yesterday_users || 0
  } catch (error) {
    console.error('加载统计数据失败:', error)
  }
}

// 切换趋势类型
const toggleTrend = () => {
  currentTrend.value = currentTrend.value === 'visits' ? 'sites' : 'visits'
  loadTrendData()
}

// 加载趋势数据
const loadTrendData = async () => {
  try {
    const now = new Date()
    let startDate = new Date()

    // 根据当前选择的时间段设置开始日期
    switch (currentPeriod.value) {
      case 'week':
        startDate.setDate(now.getDate() - 7)
        break
      case 'month':
        startDate.setDate(1)
        break
      case 'year':
        startDate.setMonth(0)
        startDate.setDate(1)
        break
    }

    // 根据当前趋势类型选择数据表
    const tableName = currentTrend.value === 'visits' ? 'site_visits' : 'sites'
    const timeField = currentTrend.value === 'visits' ? 'visit_time' : 'created_at'

    // 获取数据
    const { data: records } = await supabase
      .from(tableName)
      .select(timeField)
      .gte(timeField, startDate.toISOString())
      .order(timeField)

    // 生成日期范围
    const dateRange = []
    const currentDate = new Date()
    let tempDate = new Date(startDate)

    while (tempDate <= currentDate) {
      const key =
        currentPeriod.value === 'year'
          ? `${tempDate.getFullYear()}-${String(tempDate.getMonth() + 1).padStart(2, '0')}`
          : tempDate.toISOString().split('T')[0]
      dateRange.push(key)

      if (currentPeriod.value === 'year') {
        tempDate.setMonth(tempDate.getMonth() + 1)
      } else {
        tempDate.setDate(tempDate.getDate() + 1)
      }
    }

    // 初始化数据
    const dailyData = new Map()
    const totalData = new Map()
    dateRange.forEach((date) => {
      dailyData.set(date, 0)
      totalData.set(date, 0)
    })

    // 填充实际数据
    records.forEach((record) => {
      const date = new Date(record[timeField])
      const key =
        currentPeriod.value === 'year'
          ? `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
          : date.toISOString().split('T')[0]

      dailyData.set(key, (dailyData.get(key) || 0) + 1)
    })

    // 计算累计数据
    let cumulativeTotal = 0
    dateRange.forEach((date) => {
      cumulativeTotal += dailyData.get(date)
      totalData.set(date, cumulativeTotal)
    })

    // 更新图表数据
    visitData.value = {
      daily: dateRange.map((date) => ({
        date,
        count: dailyData.get(date)
      })),
      total: dateRange.map((date) => ({
        date,
        count: totalData.get(date)
      }))
    }

    updateChart()
  } catch (error) {
    console.error('加载趋势数据失败:', error)
  }
}

// 更新图表
const updateChart = () => {
  if (!chart) return

  const option = {
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'cross',
        label: {
          backgroundColor: '#6a7985'
        }
      }
    },
    legend: {
      data: [
        currentTrend.value === 'visits' ? '每日访问量' : '每日收录量',
        currentTrend.value === 'visits' ? '累计访问量' : '累计收录量'
      ]
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: visitData.value.daily.map((item) => item.date),
      axisLabel: {
        formatter: (value) => {
          if (currentPeriod.value === 'year') {
            const [year, month] = value.split('-')
            const index = visitData.value.daily.findIndex((item) => item.date === value)
            return index === 0 ? `${year}-${month}` : month
          } else {
            const [year, month, day] = value.split('-')
            const index = visitData.value.daily.findIndex((item) => item.date === value)
            return index === 0 ? `${year}-${month}-${day}` : `${month}-${day}`
          }
        }
      }
    },
    yAxis: [
      {
        type: 'value',
        name: currentTrend.value === 'visits' ? '每日访问量' : '每日收录量',
        position: 'left',
        axisLine: {
          show: true,
          lineStyle: {
            color: '#5470c6'
          }
        },
        axisLabel: {
          formatter: '{value}'
        }
      },
      {
        type: 'value',
        name: currentTrend.value === 'visits' ? '累计访问量' : '累计收录量',
        position: 'right',
        axisLine: {
          show: true,
          lineStyle: {
            color: '#91cc75'
          }
        },
        axisLabel: {
          formatter: '{value}'
        }
      }
    ],
    series: [
      {
        name: currentTrend.value === 'visits' ? '每日访问量' : '每日收录量',
        type: 'line',
        yAxisIndex: 0,
        data: visitData.value.daily.map((item) => item.count),
        smooth: true,
        lineStyle: {
          width: 2,
          color: '#5470c6'
        },
        itemStyle: {
          color: '#5470c6'
        }
      },
      {
        name: currentTrend.value === 'visits' ? '累计访问量' : '累计收录量',
        type: 'line',
        yAxisIndex: 1,
        data: visitData.value.total.map((item) => item.count),
        smooth: true,
        lineStyle: {
          width: 2,
          color: '#91cc75'
        },
        itemStyle: {
          color: '#91cc75'
        }
      }
    ]
  }

  chart.setOption(option)
}

// 切换时间周期
const changeTimePeriod = (period) => {
  currentPeriod.value = period
  loadTrendData()
}

// 初始化图表
const initChart = () => {
  if (chartRef.value) {
    chart = echarts.init(chartRef.value)
    loadTrendData()
  }
}

// 加载热门站点数据
const loadHotSitesData = async () => {
  try {
    const { data, error } = await supabase.rpc(
      hotSitesType.value === 'seven' ? 'get_hot_sites_seven_days' : 'get_hot_sites_total'
    )

    if (error) throw error

    hotSitesData.value = data
    updateHotSitesChart()
  } catch (error) {
    console.error('加载热门站点数据失败:', error)
  }
}

// 更新热门站点图表
const updateHotSitesChart = () => {
  if (!hotSitesChart) return

  // 1. 只显示前10个热门站点，第11个为"其它站点"
  const processedData = hotSitesData.value.slice(0, 10)
  const otherSites = hotSitesData.value.slice(10)
  if (otherSites.length > 0) {
    const otherValue = otherSites.reduce(
      (sum, item) => sum + (hotSitesType.value === 'seven' ? item.seven_day_heat : item.total_heat),
      0
    )
    processedData.push({
      site_name: '其它站点',
      seven_day_heat: otherValue,
      total_heat: otherValue
    })
  }

  const option = {
    tooltip: {
      trigger: 'item',
      formatter: '{b}: {c} ({d}%)'
    },
    series: [
      {
        name: hotSitesType.value === 'seven' ? '七日热度' : '总计热度',
        type: 'pie',
        radius: ['50%', '80%'],
        center: ['50%', '50%'],
        roseType: 'area',
        itemStyle: {
          borderRadius: 8
        },
        label: {
          show: true
        },
        emphasis: {
          label: {
            show: true
          }
        },
        data: processedData.map((item) => ({
          name: item.site_name,
          value: hotSitesType.value === 'seven' ? item.seven_day_heat : item.total_heat
        }))
      }
    ],
    grid: {
      left: '0%',
      right: 0,
      top: 0,
      bottom: 0
    }
  }

  hotSitesChart.setOption(option)
}

// 切换热门站点类型
const changeHotSitesType = (type) => {
  hotSitesType.value = type
  loadHotSitesData()
}

// 初始化热门站点图表
const initHotSitesChart = () => {
  if (hotSitesChartRef.value) {
    hotSitesChart = echarts.init(hotSitesChartRef.value)
    loadHotSitesData()
  }
}

// 监听窗口大小变化
const handleResize = () => {
  chart?.resize()
  hotSitesChart?.resize()
}

onMounted(() => {
  initChart()
  initHotSitesChart()
  loadStats()
  loadRecentSubmissions()
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  chart?.dispose()
  hotSitesChart?.dispose()
  window.removeEventListener('resize', handleResize)
})

// 加载最近提交数据
const loadRecentSubmissions = async () => {
  try {
    // 先获取所有待审核的站点
    const { data: pendingSites, error: pendingError } = await supabase
      .from('sites')
      .select(
        `
        *,
        category:categories(name)
      `
      )
      .eq('status', 'pending')
      .order('submit_time', { ascending: false })

    if (pendingError) throw pendingError

    // 获取其他状态的站点
    const { data: otherSites, error: otherError } = await supabase
      .from('sites')
      .select(
        `
        *,
        category:categories(name)
      `
      )
      .neq('status', 'pending')
      .order('submit_time', { ascending: false })
      .limit(5)

    if (otherError) throw otherError

    // 合并数据，确保待审核的站点在前面
    const pendingCount = pendingSites?.length || 0
    const remainingSlots = 5 - pendingCount

    recentSubmissions.value = [
      ...(pendingSites || []),
      ...(otherSites || []).slice(0, remainingSlots > 0 ? remainingSlots : 0)
    ]
  } catch (error) {
    console.error('加载最近提交数据失败:', error)
  }
}

// 显示消息
const showMessage = (message, type = 'info') => {
  messageRef.value.addMessage(message, type)
}

// 修改编辑网站函数
const editSite = (site) => {
  try {
    // 跳转到网站管理页面并传递网站ID
    router.push({
      path: '/admin/sites',
      query: { edit: site.id }
    })
  } catch (error) {
    console.error('跳转失败:', error)
    showMessage('跳转失败: ' + error.message, 'error')
  }
}

// 修改处理图片错误函数
const handleImageError = (event) => {
  event.target.src = defaultIcon
  showMessage('图片加载失败，已使用默认图标', 'warning')
}
</script>
