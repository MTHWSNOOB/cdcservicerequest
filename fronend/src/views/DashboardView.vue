<template>
  <div class="dashboard-view animate-float-in">
    <header class="view-header">
      <div class="header-main">
        <h1 class="font-display text-primary-glow">Dashboard</h1>
        <p class="text-secondary fs-08">Service Overview</p>
      </div>
      <div class="header-stats hide-mobile">
        <div class="mini-tag">Connected</div>
      </div>
    </header>

    <!-- Stat Cards -->
    <div class="stats-grid mb-32">
      <div v-for="(stat, index) in displayStats" :key="index" class="stat-card glass-panel futuristic-panel" :class="'delay-' + (index + 1)">
        <div class="scan-line"></div>
        <div class="stat-header">
          <div class="stat-icon-wrap glow-pulse" :style="{ borderColor: stat.color, background: `${stat.color}15`, boxShadow: `0 0 15px ${stat.color}30` }">
            <component :is="stat.icon" class="icon" :size="24" :style="{ color: stat.color }" />
          </div>
          <p class="stat-label">{{ stat.label }}</p>
        </div>
        <div class="stat-main">
          <h3 class="stat-value font-display" :style="{ color: stat.color }">
            {{ index === 0 ? animatedStats.totalUsers : index === 1 ? animatedStats.newRequests : index === 2 ? animatedStats.pendingRequests : animatedStats.unreadCount }}
          </h3>
          <div class="stat-trend" :class="stat.trend > 0 ? 'up' : 'down'">
            {{ stat.trend > 0 ? '↗' : '↘' }} {{ Math.abs(stat.trend) }}%
          </div>
        </div>
        <div class="stat-visual-bar">
          <div class="bar-fill animated-bar" :style="{ width: '70%', background: `linear-gradient(90deg, ${stat.color}50, ${stat.color})` }"></div>
        </div>
      </div>
    </div>

    <!-- Main Dashboard Content -->
    <div class="dashboard-grid">
      <!-- Left Column -->
      <div class="left-col flex-col gap-32" style="display: flex; flex-direction: column; gap: 32px; min-width: 0;">
        <!-- Chart Area -->
        <div class="chart-container glass-panel animate-float-in delay-3">
          <div class="panel-header">
            <h2 class="font-display text-secondary">Request Volume (7 Days)</h2>
            <div class="panel-actions">
              <span class="live-tag">Live</span>
            </div>
          </div>
          <div class="chart-wrapper">
            <Line v-if="chartData.datasets[0].data.length" :data="chartData" :options="chartOptions" />
          </div>
        </div>

        <div class="chart-container glass-panel animate-float-in delay-4">
          <div class="panel-header">
            <h2 class="font-display text-secondary">Distrubution by Category</h2>
          </div>
          <div class="chart-wrapper doughnut-wrap">
            <Doughnut v-if="distributionData.datasets[0].data.length" :data="distributionData" :options="distributionOptions" />
          </div>
        </div>

        <!-- Third Panel Row: Tech Ranking / Top Admins -->
        <div v-if="authStore.isAdmin" class="tech-ranking-panel glass-panel animate-float-in delay-7">
          <div class="panel-header mb-16">
            <h2 class="font-display text-accent-primary">Top Performing Technicians</h2>
            <span class="fs-08 text-secondary">Based on Average Stars</span>
          </div>
          <div class="ranking-grid">
            <div v-for="(admin, idx) in topAdmins" :key="admin.name" class="ranking-card" :class="'rank-' + (idx + 1)">
              <div class="rank-badge">{{ idx + 1 }}</div>
              <div class="admin-details">
                <h4 class="font-display">{{ admin.name }}</h4>
                <div class="stars-display">
                  <Star v-for="n in 5" :key="'star-' + n" :size="14" class="star" :class="{ 'filled': n <= Math.round(admin.avgRating) }" :fill="n <= Math.round(admin.avgRating) ? 'currentColor' : 'none'" />
                  <span class="rating-text fs-08 ms-4 text-secondary">({{ admin.avgRating.toFixed(1) }})</span>
                </div>
              </div>
              <div class="stats-mini fs-08">
                <div><span class="text-secondary">Jobs: </span><span class="text-primary fw-600">{{ admin.completedJobs }}</span></div>
                <div><span class="text-secondary">Rated: </span><span class="text-accent-secondary fw-600">{{ admin.ratedJobs }}</span></div>
              </div>
            </div>
            
            <div v-if="topAdmins.length === 0" class="text-secondary fs-08 text-center w-100 py-16">
              No sufficient rating data to rank technicians.
            </div>
          </div>
        </div>
      </div>

      <!-- Secondary Panel -->
      <div class="secondary-panel flex-col gap-24" style="display: flex; flex-direction: column; gap: 24px; min-width: 0;">
        <!-- Efficiency Gauge Status -->
        <div class="status-panel glass-panel animate-float-in delay-4">
          <div class="panel-header">
            <h2 class="font-display text-secondary">{{ authStore.isAdmin ? 'Service Rating' : 'System Efficiency' }}</h2>
          </div>
          <div class="gauge-container">
            <div class="precision-gauge">
              <svg viewBox="0 0 100 100" class="gauge-svg">
                <circle cx="50" cy="50" r="42" class="gauge-base" />
                <circle cx="50" cy="50" r="42" class="gauge-progress" stroke-dasharray="264" :stroke-dashoffset="authStore.isAdmin && adminAnalytics.avgRating ? 264 - (264 * (adminAnalytics.avgRating / 5)) : (authStore.isAdmin ? 264 : 40)" />
                <circle cx="50" cy="50" r="48" class="gauge-orbit" />
              </svg>
              <div class="gauge-content">
                <span class="percent font-display">{{ authStore.isAdmin ? (adminAnalytics.avgRating || 'N/A') : '98.4' }}</span>
                <span class="unit fw-600">{{ authStore.isAdmin ? 'STARS' : 'SYS_VAL' }}</span>
              </div>
            </div>
            <div class="metrics-grid">
              <div class="m-card">
                <span class="m-title">{{ authStore.isAdmin ? 'COMPLETED' : 'THERMAL' }}</span>
                <span class="m-data">{{ authStore.isAdmin ? adminAnalytics.totalCompleted : '42°C' }}</span>
              </div>
              <div class="m-card">
                <span class="m-title">{{ authStore.isAdmin ? 'RATED' : 'LOAD' }}</span>
                <span class="m-data">{{ authStore.isAdmin ? adminAnalytics.totalRated : '1.2 PHz' }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Recent Protocols -->
        <div class="activity-panel glass-panel animate-float-in delay-5">
          <div class="panel-header">
            <h2 class="font-display text-primary-glow">Active Requests</h2>
            <router-link to="/requests" class="fs-08 text-secondary fw-500 hover-glow">View Ledger</router-link>
          </div>
          <div class="mission-list">
            <div v-for="req in recentRequests" :key="req.id" class="mission-item">
              <div class="m-node" :class="req.status.toLowerCase()"></div>
              <div class="m-text">
                <span class="m-title">{{ req.title }}</span>
                <span class="m-meta">#{{ req.id.substring(0,8) }}</span>
              </div>
              <span class="m-time fs-08 text-secondary">{{ formatTime(req.createdAt) }}</span>
            </div>
          </div>
        </div>

        <!-- System Logs -->
        <!-- System Logs / Recent Feedbacks -->
        <div class="activity-panel glass-panel animate-float-in delay-6">
          <div class="panel-header">
            <h2 class="font-display" :class="authStore.isAdmin ? 'text-primary-glow' : 'text-secondary'">
              {{ authStore.isAdmin ? 'Recent Feedbacks' : 'Recent Activity' }}
            </h2>
          </div>
          
          <div v-if="authStore.isAdmin" class="terminal-logs scroll-y" style="max-height: 250px;">
            <div v-for="fb in recentFeedbacks" :key="fb.id" class="feedback-item">
              <div class="fb-header">
                <span class="fb-user fs-08 text-secondary">[{{ formatTime(fb.updatedAt) }}] {{ fb.requester }}</span>
                <div class="fb-stars">
                  <Star v-for="n in 5" :key="n" :size="14" class="star" :class="{ 'filled': n <= fb.rating }" :fill="n <= fb.rating ? 'currentColor' : 'none'" />
                </div>
              </div>
              <p class="fb-text text-primary fs-09 mt-4 fw-500">"{{ fb.feedback || 'No written feedback provided.' }}"</p>
            </div>
            
            <div v-if="recentFeedbacks.length === 0" class="text-center text-secondary fs-08 mt-16">
              No service feedbacks yet.
            </div>
          </div>
          
          <div v-else class="terminal-logs">
            <div v-for="(log, i) in recentLogs" :key="i" class="terminal-line">
              <span class="t-time fs-08 text-secondary fw-500">[{{ log.time }}]</span>
              <span class="t-msg fs-09 text-primary">{{ log.msg }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { 
  Chart as ChartJS, 
  Title, 
  Tooltip, 
  Legend, 
  LineElement, 
  LinearScale, 
  PointElement, 
  CategoryScale,
  ArcElement,
  Filler
} from 'chart.js'
import { Line, Doughnut } from 'vue-chartjs'
import { useToastStore } from '../stores/toastStore'
import { Activity, Clock, FileText, CheckCircle, Shield, TrendingUp, AlertTriangle, Play, Star, Users, BellRing, Layers, Mail, Hourglass, Settings as SettingsIcon } from 'lucide-vue-next'
import { useUserStore } from '../stores/userStore'
import { useRequestStore } from '../stores/requestStore'
import { useAuthStore } from '../stores/authStore'
import { useNotificationStore } from '../stores/notificationStore'

ChartJS.register(Title, Tooltip, Legend, LineElement, LinearScale, PointElement, CategoryScale, ArcElement, Filler)

const userStore = useUserStore()
const requestStore = useRequestStore()
const authStore = useAuthStore()
const notificationStore = useNotificationStore()

// --- Futuristic Animation Logic ---
const animatedStats = ref({
  totalUsers: 0,
  newRequests: 0,
  pendingRequests: 0,
  unreadCount: 0,
  performance: 0,
  completed: 0,
  rated: 0
})

const animateValue = (key, target, duration = 1500) => {
  const start = animatedStats.value[key] || 0
  const startTime = performance.now()
  
  const update = (timestamp) => {
    const elapsed = timestamp - startTime
    const progress = Math.min(elapsed / duration, 1)
    const easeOutQuart = 1 - Math.pow(1 - progress, 4)
    
    animatedStats.value[key] = Math.floor(start + (target - start) * easeOutQuart)
    
    if (progress < 1) {
      requestAnimationFrame(update)
    } else {
      animatedStats.value[key] = target
    }
  }
  
  requestAnimationFrame(update)
}

onMounted(async () => {
  await requestStore.fetchRequests()
  if (authStore.isAdmin) {
    await userStore.fetchUsers()
  }
  
  // Trigger Count-Up
  setTimeout(() => {
    if (authStore.isAdmin) {
      animateValue('totalUsers', userStore.totalUsers)
      const newReqs = requestStore.requests.filter(r => r.status === 'NEW').length
      animateValue('newRequests', newReqs)
      const pending = requestStore.requests.filter(r => ['NEW', 'RECEIVED', 'IN_PROGRESS'].includes(r.status)).length
      animateValue('pendingRequests', pending)
      animateValue('unreadCount', notificationStore.unreadCount)
      animateValue('performance', adminAnalytics.value.avgRating || 0)
    } else {
      const myReqs = requestStore.requests
      animateValue('totalUsers', myReqs.length) // Using 'totalUsers' as a generic slot for 'My Requests'
      const pending = myReqs.filter(r => ['NEW', 'RECEIVED'].includes(r.status)).length
      animateValue('newRequests', pending)
      const active = myReqs.filter(r => r.status === 'IN_PROGRESS').length
      animateValue('pendingRequests', active)
      const completed = myReqs.filter(r => r.status === 'COMPLETED').length
      animateValue('unreadCount', completed)
    }
  }, 200)
})

const recentRequests = computed(() => {
  return requestStore.requests.slice(0, 4)
})

const formatTime = (dateStr) => {
  if (!dateStr) return '--:--'
  const date = new Date(dateStr)
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })
}

const displayStats = computed(() => {
  if (authStore.isAdmin) {
    const pendingCount = requestStore.requests.filter(r => 
      ['NEW', 'RECEIVED', 'IN_PROGRESS'].includes(r.status)
    ).length

    const newRequestCount = requestStore.requests.filter(r => r.status === 'NEW').length

    return [
      { label: 'Total Staff', value: userStore.totalUsers, icon: Users, color: 'var(--accent-primary)', trend: 12 },
      { label: 'New Requests', value: newRequestCount, icon: BellRing, color: '#ff9800', trend: newRequestCount > 0 ? newRequestCount : 0 },
      { label: 'Pending Requests', value: pendingCount, icon: Layers, color: 'var(--accent-secondary)', trend: -5 },
      { label: 'Notifications', value: notificationStore.unreadCount, icon: Mail, color: 'var(--accent-blue)', trend: notificationStore.unreadCount > 0 ? notificationStore.unreadCount : 0 }
    ]
  } else {
    const myRequests = requestStore.requests
    const pendingCount = myRequests.filter(r => ['NEW', 'RECEIVED'].includes(r.status)).length
    const activeCount = myRequests.filter(r => r.status === 'IN_PROGRESS').length
    const completedCount = myRequests.filter(r => r.status === 'COMPLETED').length
    
    return [
      { label: 'My Requests', value: myRequests.length, icon: FileText, color: 'var(--accent-primary)', trend: 0 },
      { label: 'In Queue', value: pendingCount, icon: Hourglass, color: 'var(--accent-secondary)', trend: 0 },
      { label: 'In Progress', value: activeCount, icon: SettingsIcon, color: 'var(--accent-blue)', trend: 0 },
      { label: 'Completed', value: completedCount, icon: CheckCircle, color: 'var(--accent-success)', trend: 0 }
    ]
  }
})

const recentLogs = ref([
  { time: '14:42:01', msg: 'System status verified.' },
  { time: '14:35:55', msg: 'Connection synchronized.' },
  { time: '14:12:30', msg: 'Access point secured.' },
  { time: '13:55:12', msg: 'Archival complete.' }
])

const recentFeedbacks = computed(() => {
  return requestStore.requests
    .filter(r => r.status === 'COMPLETED' && r.rating)
    .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
    .slice(0, 5)
})

const topAdmins = computed(() => {
  if (!authStore.isAdmin) return []
  
  const adminStats = {}
  
  // Group by assigned admin
  requestStore.requests.forEach(req => {
    if (req.status === 'COMPLETED' && req.assignedAdmins) {
      const admins = req.assignedAdmins.split(', ')
      admins.forEach(adminName => {
        if (!adminStats[adminName]) {
          adminStats[adminName] = { name: adminName, completedJobs: 0, ratedJobs: 0, totalStars: 0 }
        }
        
        adminStats[adminName].completedJobs++
        if (req.rating) {
          adminStats[adminName].ratedJobs++
          adminStats[adminName].totalStars += req.rating
        }
      })
    }
  })
  
  // Calculate average and sort
  return Object.values(adminStats)
    .filter(stat => stat.ratedJobs > 0) // Only rank those with ratings
    .map(stat => ({
      ...stat,
      avgRating: stat.totalStars / stat.ratedJobs
    }))
    .sort((a, b) => {
      // Sort by rating first, then by number of completed jobs if tie
      if (b.avgRating === a.avgRating) return b.completedJobs - a.completedJobs
      return b.avgRating - a.avgRating
    })
    .slice(0, 3) // Top 3
})

const adminAnalytics = computed(() => {
  if (!authStore.isAdmin) return { avgRating: 0, totalCompleted: 0, totalRated: 0 }
  
  const completed = requestStore.requests.filter(r => r.status === 'COMPLETED' && r.rating)
  let avgRating = 0
  if (completed.length > 0) {
    avgRating = (completed.reduce((acc, curr) => acc + curr.rating, 0) / completed.length).toFixed(1)
  }

  return {
    avgRating: Number(avgRating),
    totalCompleted: requestStore.requests.filter(r => r.status === 'COMPLETED').length,
    totalRated: completed.length
  }
})

const distributionData = computed(() => {
  const typeCounts = {}
  requestStore.requests.forEach(r => {
    const type = r.requestType?.name || 'Uncategorized'
    typeCounts[type] = (typeCounts[type] || 0) + 1
  })

  const labels = Object.keys(typeCounts)
  const data = Object.values(typeCounts)

  return {
    labels,
    datasets: [
      {
        data,
        backgroundColor: [
          'rgba(139, 92, 246, 0.6)',
          'rgba(6, 182, 212, 0.6)',
          'rgba(245, 158, 11, 0.6)',
          'rgba(16, 185, 129, 0.6)',
          'rgba(244, 63, 94, 0.6)'
        ],
        borderColor: 'rgba(255, 255, 255, 0.1)',
        borderWidth: 1,
        hoverOffset: 15
      }
    ]
  }
})

const distributionOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'right',
      labels: {
        color: '#94a3b8',
        font: { family: 'monospace', size: 10 },
        padding: 20,
        usePointStyle: true
      }
    }
  }
}

const chartData = computed(() => {
  const last7Days = Array.from({length: 7}, (_, i) => {
    const d = new Date()
    d.setDate(d.getDate() - (6 - i))
    return d.toISOString().split('T')[0]
  })

  const counts = last7Days.map(dateStr => {
    return requestStore.requests.filter(r => r.createdAt && r.createdAt.startsWith(dateStr)).length
  })

  return {
    labels: last7Days.map(d => {
      const date = new Date(d)
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' })
    }),
    datasets: [
      {
        label: 'Requests',
        backgroundColor: (context) => {
          const chart = context.chart
          const { ctx, chartArea } = chart
          if (!chartArea) return null
          const gradient = ctx.createLinearGradient(0, chartArea.bottom, 0, chartArea.top)
          gradient.addColorStop(0, 'rgba(139, 92, 246, 0)')
          gradient.addColorStop(1, 'rgba(139, 92, 246, 0.3)')
          return gradient
        },
        borderColor: '#8b5cf6',
        borderWidth: 3,
        pointBackgroundColor: '#8b5cf6',
        pointBorderColor: '#fff',
        pointHoverBackgroundColor: '#fff',
        pointHoverBorderColor: '#8b5cf6',
        pointRadius: 4,
        pointHoverRadius: 6,
        data: counts,
        fill: true,
        tension: 0.4
      }
    ]
  }
})

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: { 
    legend: { display: false },
    tooltip: {
      backgroundColor: 'rgba(10, 15, 25, 0.9)',
      titleFont: { family: 'monospace' },
      bodyFont: { family: 'monospace' },
      borderColor: 'rgba(255, 255, 255, 0.1)',
      borderWidth: 1,
      padding: 12,
      displayColors: false
    }
  },
  scales: {
    y: { 
      beginAtZero: true,
      grid: { color: 'rgba(255, 255, 255, 0.05)', drawBorder: false }, 
      ticks: { color: '#64748b', font: { family: 'monospace', size: 10 }, stepSize: 1 } 
    },
    x: { 
      grid: { display: false, drawBorder: false }, 
      ticks: { color: '#64748b', font: { family: 'monospace', size: 10 } } 
    }
  }
}
</script>

<style scoped>
.dashboard-view {
  display: flex;
  flex-direction: column;
  gap: 32px;
}

.view-header {
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
  padding-bottom: 24px;
}

.view-header h1 {
  font-size: 1.5rem;
  letter-spacing: -0.5px;
}

.mini-tag {
  font-size: 0.7rem;
  font-weight: 600;
  color: var(--accent-primary);
  background: var(--accent-primary-glow);
  border: 1px solid var(--accent-primary);
  padding: 4px 12px;
  border-radius: 999px; /* Pill */
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
}

.stat-card {
  padding: 16px 20px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  min-height: 120px;
}

.stat-header {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 24px;
}

.stat-icon-wrap {
  width: 48px;
  height: 48px;
  border: 1px solid;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
}

.stat-label {
  font-size: 0.8rem;
  font-weight: 600;
  color: var(--text-secondary);
  letter-spacing: 0.5px;
}

.stat-main {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
}

.stat-value {
  font-size: 1.75rem;
  letter-spacing: -1px;
}

.stat-trend {
  font-size: 0.85rem;
  font-weight: 600;
  padding: 4px 10px;
  border-radius: 999px; /* Pill */
}

.stat-trend.up { background: rgba(16, 185, 129, 0.1); color: var(--accent-success); }
.stat-trend.down { background: rgba(244, 63, 94, 0.1); color: var(--accent-danger); }

.stat-visual-bar {
  height: 2px;
  background: rgba(255, 255, 255, 0.05);
  margin-top: 16px;
}

.bar-fill { height: 100%; }

.dashboard-grid {
  display: grid;
  grid-template-columns: 1fr 340px;
  gap: 32px;
  align-items: start;
}

@media (max-width: 1200px) {
  .dashboard-grid { grid-template-columns: 1fr; }
}

.chart-container {
  padding: 24px;
  min-height: 350px;
}

.doughnut-wrap {
  position: relative;
  height: 250px !important;
}

.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 32px;
}

.panel-header h2 {
  font-size: 0.9rem;
  font-weight: 600;
  letter-spacing: 0.5px;
}

.live-tag {
  font-size: 0.6rem;
  font-weight: 900;
  color: var(--accent-danger);
  display: flex;
  align-items: center;
  gap: 6px;
}

.live-tag::before {
  content: '';
  width: 6px;
  height: 6px;
  background: var(--accent-danger);
  border-radius: 50%;
  animation: pulse-red 1.5s infinite;
}

@keyframes pulse-red {
  0% { transform: scale(1); opacity: 1; }
  100% { transform: scale(3); opacity: 0; }
}

.status-panel, .activity-panel { padding: 24px; }

.gauge-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 32px;
}

.precision-gauge {
  position: relative;
  width: 180px;
  height: 180px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.gauge-svg { width: 100%; height: 100%; transform: rotate(-90deg); }
.gauge-base { fill: none; stroke: rgba(255, 255, 255, 0.05); stroke-width: 4; }
.gauge-progress {
  fill: none;
  stroke: var(--accent-primary);
  stroke-width: 4;
  stroke-linecap: square;
}

.gauge-orbit {
  fill: none;
  stroke: var(--accent-primary);
  stroke-width: 1;
  stroke-dasharray: 4 8;
  opacity: 0.2;
}

.gauge-content {
  position: absolute;
  text-align: center;
}

.gauge-content .percent { font-size: 2.22rem; color: var(--accent-primary); letter-spacing: -2px; }
.gauge-content .unit { font-size: 0.6rem; color: var(--text-muted); opacity: 0.6; }

.metrics-grid {
  width: 100%;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
}

.m-card {
  padding: 16px;
  background: rgba(0, 0, 0, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.05);
  text-align: center;
}

.m-card .m-title {
  display: block;
  font-size: 0.55rem;
  font-weight: 800;
  color: var(--text-muted);
  margin-bottom: 4px;
}

.m-card .m-data {
  font-family: var(--font-mono);
  font-size: 0.9rem;
  font-weight: 700;
  color: var(--text-primary);
}

.mission-list { display: flex; flex-direction: column; gap: 16px; }

.mission-item {
  display: flex;
  align-items: center;
  gap: 16px;
  padding-bottom: 16px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.03);
}

.m-node {
  width: 12px;
  height: 12px;
  background: var(--text-muted);
  border-radius: 50%;
}

.m-node.new { background: var(--accent-secondary); box-shadow: 0 0 10px var(--accent-secondary-glow); }
.m-node.in_progress { background: var(--accent-primary); box-shadow: 0 0 10px var(--accent-primary-glow); }
.m-node.completed { background: var(--accent-success); }

.m-text { flex: 1; display: flex; flex-direction: column; }
.m-title { font-size: 0.85rem; font-weight: 700; color: var(--text-primary); }
.m-meta { font-size: 0.6rem; color: var(--text-muted); }
.m-time { font-size: 0.7rem; color: var(--text-secondary); }

.terminal-logs {
  background: rgba(0, 0, 0, 0.2);
  padding: 20px;
  border-radius: var(--radius-md);
  border: 1px solid rgba(255, 255, 255, 0.05);
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.terminal-line {
  font-size: 0.8rem;
  display: flex;
  gap: 12px;
}

.t-time { color: var(--accent-primary); opacity: 0.7; }
.t-msg { color: var(--text-secondary); }

.feedback-item { display: flex; flex-direction: column; padding: 12px 0; border-bottom: 1px dashed rgba(255, 255, 255, 0.1); }
.feedback-item:last-child { border-bottom: none; }
.fb-header { display: flex; justify-content: space-between; align-items: center; }
.fb-user { opacity: 0.8; }
.fb-stars .star, .stars-display .star { color: rgba(255, 255, 255, 0.1); font-size: 0.9rem; }
.fb-stars .star.filled, .stars-display .star.filled { color: #f59e0b; text-shadow: 0 0 5px rgba(245, 158, 11, 0.5); }
.fb-text { font-style: italic; opacity: 0.9; }

/* Technician Ranking */
.tech-ranking-panel { padding: 24px; }
.ranking-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 24px; }
.ranking-card { display: flex; align-items: center; gap: 16px; padding: 16px; background: rgba(0,0,0,0.2); border-radius: var(--radius-md); border: 1px solid rgba(255,255,255,0.08); position: relative; overflow: hidden; }
.rank-badge { position: absolute; top: -10px; right: -10px; width: 44px; height: 44px; background: rgba(255,255,255,0.1); display: flex; align-items: center; justify-content: center; font-family: var(--font-display); font-size: 1.2rem; transform: rotate(15deg); font-weight: 700; border-radius: var(--radius-md); }
.rank-1 .rank-badge { background: #f59e0b; color: #fff; box-shadow: 0 0 15px rgba(245, 158, 11, 0.4); }
.rank-2 .rank-badge { background: #94a3b8; color: #fff; box-shadow: 0 0 15px rgba(148, 163, 184, 0.4); }
.rank-3 .rank-badge { background: #b45309; color: #fff; box-shadow: 0 0 15px rgba(180, 83, 9, 0.4); }
.admin-details { flex: 1; display: flex; flex-direction: column; gap: 6px; }
.stats-mini { display: flex; flex-direction: column; gap: 4px; text-align: right; }
.w-100 { width: 100%; }
.py-16 { padding-top: 16px; padding-bottom: 16px; }
.mt-32 { margin-top: 32px; }
.ms-4 { margin-left: 4px; }
.mb-16 { margin-bottom: 16px; }

.hover-glow:hover { text-shadow: 0 0 8px var(--accent-primary-glow); color: var(--text-primary); }
.scroll-y { overflow-y: auto; }
.mt-4 { margin-top: 4px; }
.mt-16 { margin-top: 16px; }
.fs-08 { font-size: 0.8rem; }
.fs-07 { font-size: 0.7rem; }
.fs-06 { font-size: 0.6rem; }

/* ── Dashboard Mobile ── */
@media (max-width: 768px) {
  .stats-grid { grid-template-columns: 1fr 1fr !important; gap: 12px; }
  .stat-card { padding: 16px; }
  .dashboard-grid { gap: 20px; }
  .chart-container { height: 280px; padding: 16px; }
  .panel-header { margin-bottom: 16px; }
  .panel-header h2 { font-size: 0.65rem; }
  .status-panel, .activity-panel { padding: 16px !important; }
  .ranking-grid { gap: 10px; }
  .ranking-card { padding: 12px; gap: 12px; }
  .left-col { gap: 20px !important; }
}

@media (max-width: 480px) {
  .stats-grid { grid-template-columns: 1fr !important; }
  .chart-container { height: 220px; }
}

/* ── Futuristic Enhancements ── */
.futuristic-panel {
  position: relative;
  overflow: hidden;
  transition: all 0.4s cubic-bezier(0.165, 0.84, 0.44, 1);
}

.futuristic-panel:hover {
  transform: translateY(-5px) scale(1.02);
  border-color: rgba(255, 255, 255, 0.2);
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5), 0 0 20px rgba(139, 92, 246, 0.1);
}

.scan-line {
  position: absolute;
  top: 0;
  left: -100%;
  width: 50%;
  height: 100%;
  background: linear-gradient(
    90deg,
    transparent,
    rgba(255, 255, 255, 0.05),
    transparent
  );
  transform: skewX(-25deg);
  animation: scan 4s infinite linear;
  pointer-events: none;
}

@keyframes scan {
  0% { left: -100%; }
  100% { left: 200%; }
}

.glow-pulse {
  animation: pulse-glow 3s infinite ease-in-out;
}

@keyframes pulse-glow {
  0%, 100% { filter: brightness(1) drop-shadow(0 0 2px currentColor); }
  50% { filter: brightness(1.3) drop-shadow(0 0 10px currentColor); }
}

.animated-bar {
  animation: bar-load 2s cubic-bezier(0.165, 0.84, 0.44, 1) forwards;
  width: 0 !important;
}

@keyframes bar-load {
  from { width: 0; }
  to { width: 70%; }
}

.gauge-orbit {
  animation: rotate-gauge 20s infinite linear;
  transform-origin: center;
}

@keyframes rotate-gauge {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
</style>
