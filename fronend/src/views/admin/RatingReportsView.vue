<template>
  <div class="rating-reports-view animate-float-in">
    <header class="view-header">
      <div class="header-main">
        <h1 class="font-display text-primary-glow">Service Excellence Reports</h1>
        <p class="text-secondary fs-08">Monitoring service quality and technical performance</p>
      </div>
      <button class="btn-primary export-btn flex items-center gap-8" @click="generatePDF" :disabled="isExporting">
        <DownloadCloud :size="18" />
        {{ isExporting ? 'Encrypting...' : 'Export Briefing' }}
      </button>
    </header>

    <!-- Overall Summary -->
    <div class="stats-mini-grid mb-32">
      <div class="mini-stat glass-panel futuristic-panel">
        <div class="scan-line"></div>
        <div class="stat-m-header">Global Average Rating</div>
        <div class="stat-main flex items-center gap-12">
          <div class="stat-m-body text-primary-glow">{{ globalAvgRating.toFixed(1) }}</div>
          <div class="stars-row">
            <Star v-for="n in 5" :key="n" :size="14" class="star" :class="{ 'filled': n <= Math.round(globalAvgRating) }" :fill="n <= Math.round(globalAvgRating) ? 'currentColor' : 'none'" />
          </div>
        </div>
        <div class="stat-progress"><div class="stat-fill" :style="{ width: (globalAvgRating / 5 * 100) + '%', background: 'var(--accent-primary)' }"></div></div>
      </div>
      
      <div class="mini-stat glass-panel futuristic-panel">
        <div class="scan-line"></div>
        <div class="stat-m-header">Total Rated Requests</div>
        <div class="stat-m-body text-secondary-glow">{{ ratedRequests.length }}</div>
        <div class="stat-progress"><div class="stat-fill" style="width: 100%; background: var(--accent-secondary)"></div></div>
      </div>

      <div class="mini-stat glass-panel futuristic-panel">
        <div class="scan-line"></div>
        <div class="stat-m-header">User Satisfaction Rate</div>
        <div class="stat-m-body text-success">{{ satisfactionRate }}%</div>
        <div class="stat-progress"><div class="stat-fill" :style="{ width: satisfactionRate + '%', background: '#10b981' }"></div></div>
      </div>
    </div>

    <!-- Staff Rankings Section -->
    <div class="section-container mb-48">
      <div class="section-header flex items-center justify-between mb-24">
        <h2 class="font-display text-primary-glow fs-12 flex items-center gap-12">
          <Award :size="20" class="text-primary" /> Technical Staff Performance
        </h2>
      </div>

      <div class="ranking-grid">
        <div v-for="(staff, index) in staffRankings" :key="staff.name" class="rank-card glass-panel futuristic-panel" :class="{ 'top-performer': index === 0 }">
           <div class="scan-line"></div>
           <div class="rank-badge" v-if="index < 3">#{{ index + 1 }}</div>
           <div class="staff-info">
             <div class="staff-name font-display fw-600 text-primary">{{ staff.name }}</div>
             <div class="staff-stats flex items-center gap-16 mt-8">
               <span class="fs-07 text-secondary">{{ staff.count }} Tasks Finished</span>
               <div class="stat-divider"></div>
               <span class="fs-07 text-primary-glow fw-700">Avg: {{ staff.avg.toFixed(1) }} / 5.0</span>
             </div>
           </div>
           <div class="staff-visual-rating">
              <div class="stars-row">
                <Star v-for="n in 5" :key="n" :size="16" class="star" :class="{ 'filled': n <= Math.round(staff.avg) }" :fill="n <= Math.round(staff.avg) ? 'currentColor' : 'none'" />
              </div>
           </div>
        </div>
      </div>
    </div>

    <!-- Detailed Feedback Log -->
    <div class="section-container">
      <div class="section-header mb-24">
        <h2 class="font-display text-primary-glow fs-12 flex items-center gap-12">
          <MessageSquare :size="20" class="text-secondary" /> Detailed Feedback Log
        </h2>
      </div>

      <div class="hud-table-container glass-panel">
        <table class="hud-table">
          <thead>
            <tr>
              <th><span class="th-label">Ticket</span></th>
              <th><span class="th-label">Assigned To</span></th>
              <th><span class="th-label">Rating</span></th>
              <th><span class="th-label">Feedback</span></th>
              <th class="text-right"><span class="th-label">Date</span></th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="req in ratedRequests" :key="req.id" class="hud-row">
              <td style="width: 150px;">
                <span class="node-badge">#{{ String(req.id).substring(0, 8).toUpperCase() }}</span>
              </td>
              <td>
                <span class="text-secondary fs-08">{{ req.assignedAdmins || 'N/A' }}</span>
              </td>
              <td>
                <div class="stars-row">
                  <Star v-for="n in 5" :key="n" :size="12" class="star" :class="{ 'filled': n <= req.rating }" :fill="n <= req.rating ? 'currentColor' : 'none'" />
                </div>
              </td>
              <td class="feedback-cell">
                <p class="text-primary fs-09 italic">{{ req.feedback || 'No comments provided.' }}</p>
                <span class="text-muted fs-07">Subject: {{ req.title }}</span>
              </td>
              <td class="text-right">
                <span class="text-secondary fs-08">{{ formatDate(req.updatedAt) }}</span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { useAdminStore } from '../../stores/adminStore'
import { useRequestStore } from '../../stores/requestStore'
import { Star, Award, MessageSquare, DownloadCloud } from 'lucide-vue-next'
import jsPDF from 'jspdf'
import 'jspdf-autotable'

const requestStore = useRequestStore()
const adminStore = useAdminStore()

onMounted(async () => {
  await requestStore.fetchRequests({ status: 'COMPLETED', limit: 1000 })
})

const ratedRequests = computed(() => {
  return requestStore.requests
    .filter(r => r.status === 'COMPLETED' && r.rating)
    .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
})

const globalAvgRating = computed(() => {
  if (ratedRequests.value.length === 0) return 0
  const total = ratedRequests.value.reduce((acc, curr) => acc + curr.rating, 0)
  return total / ratedRequests.value.length
})

const satisfactionRate = computed(() => {
  if (ratedRequests.value.length === 0) return 0
  const highRatings = ratedRequests.value.filter(r => r.rating >= 4).length
  return Math.round((highRatings / ratedRequests.value.length) * 100)
})

const staffRankings = computed(() => {
  const staffMap = {}
  
  ratedRequests.value.forEach(req => {
    if (!req.assignedAdmins) return
    
    const names = req.assignedAdmins.split(', ')
    names.forEach(name => {
      const trimmedName = name.trim()
      if (!trimmedName) return
      
      if (!staffMap[trimmedName]) {
        staffMap[trimmedName] = { name: trimmedName, total: 0, count: 0 }
      }
      staffMap[trimmedName].total += req.rating
      staffMap[trimmedName].count += 1
    })
  })
  
  return Object.values(staffMap)
    .map(s => ({ ...s, avg: s.total / s.count }))
    .sort((a, b) => b.avg - a.avg || b.count - a.count)
})

const formatDate = (dateString) => {
  if (!dateString) return 'N/A'
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  })
}

const generatePDF = () => {
  isExporting.value = true
  try {
    const doc = new jsPDF()
    const pageWidth = doc.internal.pageSize.getWidth()
    
    // Theme Colors
    const primaryStr = '#00f2fe'
    const secondaryStr = '#8b5cf6'
    const bgStr = '#0a0f19'
    const textStr = '#e2e8f0'

    // Header rect
    doc.setFillColor(bgStr)
    doc.rect(0, 0, pageWidth, 40, 'F')
    
    // Add glowing line effect (simulated with multiple thin lines)
    doc.setDrawColor(secondaryStr)
    doc.setLineWidth(1)
    doc.line(0, 38, pageWidth, 38)
    doc.setDrawColor(primaryStr)
    doc.setLineWidth(0.5)
    doc.line(0, 39, pageWidth, 39)

    doc.setTextColor(primaryStr)
    doc.setFontSize(22)
    doc.setFont('helvetica', 'bold')
    doc.text('CDH SYSTEM BRIEFING', 14, 20)

    doc.setTextColor(textStr)
    doc.setFontSize(10)
    doc.setFont('helvetica', 'normal')
    doc.text('CLASSIFIED: SERVICE EXCELLENCE REPORT', 14, 28)
    
    doc.setFontSize(8)
    doc.setTextColor(primaryStr)
    doc.text(`EXTRACTED: ${new Date().toISOString()}`, pageWidth - 14, 28, { align: 'right' })

    // Summary Section
    doc.setTextColor(0, 0, 0) // Reset to black for main body text if desired, or keep white if background is dark. AutoTable handles its own.
    
    let yPos = 50
    doc.setFontSize(14)
    doc.setFont('helvetica', 'bold')
    doc.text('I. EXECUTIVE SUMMARY', 14, yPos)
    
    yPos += 10
    doc.setFontSize(10)
    doc.setFont('helvetica', 'normal')
    doc.text(`Global Average Rating: ${globalAvgRating.value.toFixed(1)} / 5.0`, 20, yPos)
    yPos += 7
    doc.text(`Total Rated Operations: ${ratedRequests.value.length}`, 20, yPos)
    yPos += 7
    doc.text(`User Satisfaction Metric: ${satisfactionRate.value}%`, 20, yPos)

    // Staff Rankings
    yPos += 15
    doc.setFontSize(14)
    doc.setFont('helvetica', 'bold')
    doc.text('II. TECHNICAL OPERATIVES', 14, yPos)
    
    const staffData = staffRankings.value.map((s, i) => [
      `#${i + 1}`,
      s.name.toUpperCase(),
      s.count.toString(),
      s.avg.toFixed(1)
    ])

    doc.autoTable({
      startY: yPos + 5,
      head: [['RANK', 'OPERATIVE', 'TASKS COMPLETED', 'AVG RATING']],
      body: staffData,
      theme: 'grid',
      headStyles: { fillColor: [139, 92, 246], textColor: 255, fontStyle: 'bold' },
      bodyStyles: { textColor: 50 },
      alternateRowStyles: { fillColor: [245, 245, 250] },
      margin: { left: 14, right: 14 }
    })

    // Feedback Log
    const finalY = doc.lastAutoTable.finalY || yPos + 30
    doc.setFontSize(14)
    doc.setFont('helvetica', 'bold')
    doc.text('III. FEEDBACK DECRYPT', 14, finalY + 15)

    const feedbackData = ratedRequests.value.slice(0, 20).map(req => [
      `REQ-${req.id.substring(0,6)}`,
      req.assignedAdmins || 'N/A',
      `${req.rating}/5`,
      req.feedback || 'NO DATA'
    ])

    doc.autoTable({
      startY: finalY + 20,
      head: [['ID', 'ASSIGNED', 'RATING', 'FEEDBACK']],
      body: feedbackData,
      theme: 'plain',
      headStyles: { fillColor: [10, 15, 25], textColor: [0, 242, 254], fontStyle: 'bold' },
      bodyStyles: { textColor: 40, borderBottomWidth: 0.1, borderBottomColor: [200, 200, 200] },
      columnStyles: { 3: { cellWidth: 80 } },
      margin: { left: 14, right: 14 }
    })

    doc.save(`CDH-Briefing-${new Date().toISOString().split('T')[0]}.pdf`)
  } catch (error) {
    console.error('PDF Generation failed:', error)
  } finally {
    setTimeout(() => {
      isExporting.value = false
    }, 1000)
  }
}
</script>

<style scoped>
.rating-reports-view {
  display: flex;
  flex-direction: column;
  gap: 32px;
}

.view-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
  padding-bottom: 24px;
}

.stats-mini-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 20px;
}

.mini-stat {
  padding: 24px;
  position: relative;
  overflow: hidden;
}

.stat-m-header {
  font-size: 0.7rem;
  font-weight: 600;
  color: var(--text-secondary);
  letter-spacing: 1px;
  text-transform: uppercase;
  margin-bottom: 12px;
}

.stat-m-body {
  font-size: 2.2rem;
  font-weight: 800;
  line-height: 1;
}

.stat-progress {
  height: 4px;
  background: rgba(255, 255, 255, 0.05);
  width: 100%;
  margin-top: 20px;
  border-radius: 99px;
  overflow: hidden;
}

.stat-fill {
  height: 100%;
  transition: width 1s cubic-bezier(0.17, 0.67, 0.37, 0.99);
}

.stars-row {
  display: flex;
  gap: 2px;
  color: rgba(255, 255, 255, 0.1);
}

.stars-row .star.filled {
  color: #f59e0b;
  filter: drop-shadow(0 0 5px rgba(245, 158, 11, 0.4));
}

/* Ranking Grid */
.ranking-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  gap: 16px;
}

.rank-card {
  padding: 24px 32px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  position: relative;
  overflow: hidden;
}

.stat-divider {
  width: 1px;
  height: 12px;
  background: rgba(255, 255, 255, 0.1);
}

.gap-16 { gap: 16px; }

.top-performer {
  border-color: rgba(139, 92, 246, 0.5) !important;
  background: linear-gradient(135deg, rgba(139, 92, 246, 0.1) 0%, transparent 100%) !important;
}

.rank-badge {
  position: absolute;
  top: -10px;
  right: -10px;
  width: 30px;
  height: 30px;
  background: var(--accent-primary);
  color: #000;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 800;
  font-size: 0.8rem;
  box-shadow: 0 0 15px var(--accent-primary-glow);
  z-index: 5;
}

.staff-name {
  font-size: 1.1rem;
  letter-spacing: -0.3px;
}

/* Table Styles */
.feedback-cell {
  max-width: 400px;
}

.node-badge {
  font-size: 0.7rem;
  font-family: var(--font-mono);
  background: rgba(139, 92, 246, 0.1);
  color: var(--accent-primary);
  padding: 4px 10px;
  border-radius: 4px;
  border: 1px solid rgba(139, 92, 246, 0.2);
}

/* Futuristic Props */
.futuristic-panel {
  position: relative;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.futuristic-panel:hover {
  transform: translateY(-5px);
  box-shadow: 0 15px 30px rgba(0, 0, 0, 0.3);
  border-color: rgba(139, 92, 246, 0.4);
}

.scan-line {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 2px;
  background: linear-gradient(90deg, transparent, var(--accent-primary-glow), transparent);
  animation: scan 4s linear infinite;
  opacity: 0.3;
  pointer-events: none;
}

@keyframes scan {
  0% { transform: translateY(-100%); }
  100% { transform: translateY(500%); }
}

.text-primary-glow {
  color: var(--accent-primary);
  text-shadow: 0 0 10px var(--accent-primary-glow);
}

.text-secondary-glow {
  color: var(--accent-secondary);
  text-shadow: 0 0 10px var(--accent-secondary-glow);
}

.text-success { color: #10b981; }

.fs-12 { font-size: 1.25rem; }
.italic { font-style: italic; }

.hud-table-container {
  overflow: hidden;
  border-radius: var(--radius-lg);
}

.hud-table {
  width: 100%;
  border-collapse: collapse;
}

.hud-row {
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
  transition: background 0.2s;
}

.hud-row:hover {
  background: rgba(255, 255, 255, 0.02);
}

.hud-table th, .hud-table td {
  padding: 18px 24px;
  text-align: left;
}

.th-label {
  font-size: 0.7rem;
  font-weight: 600;
  color: var(--text-secondary);
  text-transform: uppercase;
  letter-spacing: 1px;
}

@media (max-width: 768px) {
  .view-header { flex-direction: column; align-items: flex-start; gap: 16px; }
  .export-btn { width: 100%; justify-content: center; }
  .stats-mini-grid { grid-template-columns: 1fr; }
  .ranking-grid { grid-template-columns: 1fr; }
  .feedback-cell { max-width: 200px; }
}
</style>
