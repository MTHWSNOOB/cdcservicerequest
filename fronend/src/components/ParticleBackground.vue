<template>
  <div class="particle-wrapper">
    <!-- Soft Gradient Backdrop elements handled globally now, just canvas here -->
    <!-- Interactive Canvas -->
    <canvas ref="canvas" class="particle-canvas"></canvas>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'

const canvas = ref(null)
let ctx = null
let animId = null
let particles = []

// Engineering theme configuration
const CONFIG = {
  particleCount: 60,
  baseRadius: 1.5,
  maxVelocity: 0.25,
  connectionDistance: 180,
  mouseConnectionDistance: 220,
  nodeColor: 'rgba(139, 92, 246, 0.4)',
  lineColor: 'rgba(139, 92, 246, 0.1)',
  mouseLineColor: 'rgba(0, 242, 254, 0.25)',
  mouseRepelRadius: 80,
  mouseRepelForce: 0.05
}

const MOUSE = { x: -1000, y: -1000 }

class Particle {
  constructor(w, h) {
    this.x = Math.random() * w
    this.y = Math.random() * h
    this.vx = (Math.random() - 0.5) * CONFIG.maxVelocity * 2
    this.vy = (Math.random() - 0.5) * CONFIG.maxVelocity * 2
    this.baseX = this.x
    this.baseY = this.y
    this.radius = Math.random() * 1 + CONFIG.baseRadius
    this.w = w
    this.h = h
  }

  update() {
    // Basic Movement
    this.x += this.vx
    this.y += this.vy

    // Bounce off walls
    if (this.x <= 0 || this.x >= this.w) this.vx *= -1
    if (this.y <= 0 || this.y >= this.h) this.vy *= -1

    // Mouse Interaction (Repel)
    const dx = this.x - MOUSE.x
    const dy = this.y - MOUSE.y
    const distance = Math.sqrt(dx * dx + dy * dy)

    if (distance < CONFIG.mouseRepelRadius) {
      const forceX = dx / distance
      const forceY = dy / distance
      const forceMultiplier = (CONFIG.mouseRepelRadius - distance) / CONFIG.mouseRepelRadius
      
      this.x += forceX * forceMultiplier * CONFIG.mouseRepelForce * 50
      this.y += forceY * forceMultiplier * CONFIG.mouseRepelForce * 50
    }
  }

  draw(ctx) {
    ctx.beginPath()
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2)
    ctx.fillStyle = CONFIG.nodeColor
    ctx.fill()
    
    // Draw outer glow/ring for a softer feel
    ctx.beginPath()
    ctx.arc(this.x, this.y, this.radius + 2, 0, Math.PI * 2)
    ctx.strokeStyle = 'rgba(139, 92, 246, 0.15)'
    ctx.lineWidth = 0.5
    ctx.stroke()
  }
}

function init() {
  const c = canvas.value
  if (!c) return
  ctx = c.getContext('2d')
  resize()
  
  particles = []
  const count = Math.floor((c.width * c.height) / 15000) // Responsive count based on screen size
  const actualCount = Math.min(Math.max(count, 40), 120) // Clamp between 40 and 120
  
  for (let i = 0; i < actualCount; i++) {
    particles.push(new Particle(c.width, c.height))
  }
  
  animate()
}

function resize() {
  const c = canvas.value
  if (!c) return
  c.width = window.innerWidth
  c.height = window.innerHeight
  // Re-bound particles if screen shrinks
  particles.forEach(p => { 
    p.w = c.width
    p.h = c.height
    if (p.x > c.width) p.x = c.width
    if (p.y > c.height) p.y = c.height
  })
}

function drawConnections() {
  // Connect particles to each other
  for (let i = 0; i < particles.length; i++) {
    for (let j = i + 1; j < particles.length; j++) {
      const dx = particles[i].x - particles[j].x
      const dy = particles[i].y - particles[j].y
      const dist = Math.sqrt(dx * dx + dy * dy)

      if (dist < CONFIG.connectionDistance) {
        const opacity = 1 - (dist / CONFIG.connectionDistance)
        ctx.beginPath()
        ctx.moveTo(particles[i].x, particles[i].y)
        ctx.lineTo(particles[j].x, particles[j].y)
        ctx.strokeStyle = `rgba(139, 92, 246, ${opacity * 0.15})`
        ctx.lineWidth = 0.8
        ctx.stroke()
      }
    }

    // Connect particles to mouse
    const mdx = particles[i].x - MOUSE.x
    const mdy = particles[i].y - MOUSE.y
    const mDist = Math.sqrt(mdx * mdx + mdy * mdy)

    if (mDist < CONFIG.mouseConnectionDistance) {
      const mOpacity = 1 - (mDist / CONFIG.mouseConnectionDistance)
      ctx.beginPath()
      ctx.moveTo(particles[i].x, particles[i].y)
      ctx.lineTo(MOUSE.x, MOUSE.y)
      ctx.strokeStyle = `rgba(0, 242, 254, ${mOpacity * 0.3})`
      ctx.lineWidth = 1.2
      ctx.stroke()
    }
  }
}

function animate() {
  const c = canvas.value
  if (!c || !ctx) return
  ctx.clearRect(0, 0, c.width, c.height)

  particles.forEach(p => {
    p.update()
    p.draw(ctx)
  })

  drawConnections()

  animId = requestAnimationFrame(animate)
}

function handleMouse(e) {
  MOUSE.x = e.clientX
  MOUSE.y = e.clientY
}

function handleMouseLeave() {
  // Move mouse out of frame so lines break
  MOUSE.x = -1000
  MOUSE.y = -1000
}

onMounted(() => {
  init()
  window.addEventListener('resize', resize)
  window.addEventListener('mousemove', handleMouse)
  document.body.addEventListener('mouseleave', handleMouseLeave)
})

onUnmounted(() => {
  cancelAnimationFrame(animId)
  window.removeEventListener('resize', resize)
  window.removeEventListener('mousemove', handleMouse)
  document.body.removeEventListener('mouseleave', handleMouseLeave)
})
</script>

<style scoped>
.particle-wrapper {
  position: fixed;
  inset: 0;
  z-index: 0;
  pointer-events: none;
}

.particle-canvas {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
}
</style>
