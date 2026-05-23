/**
 * Saf HTML5 Canvas ve JavaScript tabanlı mikro konfeti efekti.
 * Herhangi bir dış kütüphane gerektirmez ve ultra hızlı çalışır.
 */
export function triggerConfetti() {
  const canvas = document.createElement("canvas")
  canvas.style.position = "fixed"
  canvas.style.top = "0"
  canvas.style.left = "0"
  canvas.style.width = "100%"
  canvas.style.height = "100%"
  canvas.style.pointerEvents = "none"
  canvas.style.zIndex = "9999"
  document.body.appendChild(canvas)

  const ctx = canvas.getContext("2d")
  if (!ctx) return

  let width = (canvas.width = window.innerWidth)
  let height = (canvas.height = window.innerHeight)

  window.addEventListener("resize", () => {
    width = canvas.width = window.innerWidth
    height = canvas.height = window.innerHeight
  })

  const colors = ["#6366f1", "#a855f7", "#ec4899", "#3b82f6", "#eab308", "#10b981"]
  const particles: any[] = []

  // 100 tane konfeti tanesi üret
  for (let i = 0; i < 100; i++) {
    particles.push({
      x: Math.random() * width,
      y: Math.random() * height - height, // Ekranın üstünden başlasınlar
      r: Math.random() * 6 + 4,
      d: Math.random() * width,
      color: colors[Math.floor(Math.random() * colors.length)],
      tilt: Math.random() * 10 - 5,
      tiltAngleIncremental: Math.random() * 0.07 + 0.02,
      tiltAngle: 0,
      speed: Math.random() * 3 + 2
    })
  }

  let animationFrameId: number

  function draw() {
    ctx!.clearRect(0, 0, width, height)

    let remaining = 0
    particles.forEach((p) => {
      p.tiltAngle += p.tiltAngleIncremental
      p.y += p.speed
      p.x += Math.sin(p.tiltAngle) * 0.5
      p.tilt = Math.sin(p.tiltAngle - p.r / 2) * 5

      if (p.y <= height) remaining++

      ctx!.beginPath()
      ctx!.lineWidth = p.r
      ctx!.strokeStyle = p.color
      ctx!.moveTo(p.x + p.tilt + p.r / 2, p.y)
      ctx!.lineTo(p.x + p.tilt, p.y + p.tilt + p.r / 2)
      ctx!.stroke()
    })

    if (remaining > 0) {
      animationFrameId = requestAnimationFrame(draw)
    } else {
      document.body.removeChild(canvas)
    }
  }

  draw()

  // Floating XP Kazanımı Görsel Efekti
  const floatingXp = document.createElement("div")
  floatingXp.innerText = "+30 XP Gelişim Puanı!"
  floatingXp.style.position = "fixed"
  floatingXp.style.bottom = "20%"
  floatingXp.style.left = "50%"
  floatingXp.style.transform = "translateX(-50%)"
  floatingXp.style.background = "linear-gradient(to right, #6366f1, #a855f7)"
  floatingXp.style.color = "white"
  floatingXp.style.padding = "10px 24px"
  floatingXp.style.borderRadius = "9999px"
  floatingXp.style.fontSize = "14px"
  floatingXp.style.fontWeight = "900"
  floatingXp.style.boxShadow = "0 10px 25px -5px rgba(99, 102, 241, 0.4)"
  floatingXp.style.zIndex = "10000"
  floatingXp.style.pointerEvents = "none"
  floatingXp.style.transition = "all 1s cubic-bezier(0.25, 1, 0.5, 1)"
  floatingXp.style.opacity = "0"
  floatingXp.style.marginTop = "20px"
  document.body.appendChild(floatingXp)

  // Animasyonu başlat
  setTimeout(() => {
    floatingXp.style.opacity = "1"
    floatingXp.style.transform = "translateX(-50%) translateY(-100px) scale(1.1)"
  }, 50)

  // 2 saniye sonra sil
  setTimeout(() => {
    floatingXp.style.opacity = "0"
    setTimeout(() => {
      if (document.body.contains(floatingXp)) {
        document.body.removeChild(floatingXp)
      }
    }, 1000)
  }, 2000)
}
