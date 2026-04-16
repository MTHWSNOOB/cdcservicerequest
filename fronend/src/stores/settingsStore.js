import { defineStore } from 'pinia'
import { ref, watch } from 'vue'

export const useSettingsStore = defineStore('settings', () => {
    // Tones: 'sci-fi', 'classic', 'deep', 'none'
    const notificationTone = ref(localStorage.getItem('notificationTone') || 'sci-fi')

    watch(notificationTone, (newVal) => {
        localStorage.setItem('notificationTone', newVal)
    })

    const playTone = (customTone = null) => {
        const toneToPlay = customTone || notificationTone.value
        if (toneToPlay === 'none') return

        const audioCtx = new (window.AudioContext || window.webkitAudioContext)()
        const oscillator = audioCtx.createOscillator()
        const gainNode = audioCtx.createGain()

        oscillator.connect(gainNode)
        gainNode.connect(audioCtx.destination)

        if (toneToPlay === 'sci-fi') {
            oscillator.type = 'sine'
            oscillator.frequency.setValueAtTime(800, audioCtx.currentTime)
            oscillator.frequency.exponentialRampToValueAtTime(1200, audioCtx.currentTime + 0.1)
            gainNode.gain.setValueAtTime(0, audioCtx.currentTime)
            gainNode.gain.linearRampToValueAtTime(0.5, audioCtx.currentTime + 0.05)
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.3)
            oscillator.start(audioCtx.currentTime)
            oscillator.stop(audioCtx.currentTime + 0.3)
        } else if (toneToPlay === 'classic') {
            oscillator.type = 'triangle'
            oscillator.frequency.setValueAtTime(600, audioCtx.currentTime)
            gainNode.gain.setValueAtTime(0, audioCtx.currentTime)
            gainNode.gain.linearRampToValueAtTime(0.3, audioCtx.currentTime + 0.05)
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.2)
            oscillator.start(audioCtx.currentTime)
            oscillator.stop(audioCtx.currentTime + 0.2)
        } else if (toneToPlay === 'deep') {
            oscillator.type = 'sawtooth'
            oscillator.frequency.setValueAtTime(150, audioCtx.currentTime)
            gainNode.gain.setValueAtTime(0, audioCtx.currentTime)
            gainNode.gain.linearRampToValueAtTime(0.4, audioCtx.currentTime + 0.1)
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.4)
            oscillator.start(audioCtx.currentTime)
            oscillator.stop(audioCtx.currentTime + 0.4)
        }

        setTimeout(() => {
            audioCtx.close().catch(() => { })
        }, 500)
    }

    return {
        notificationTone,
        playTone
    }
})
