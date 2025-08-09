<template>
  <transition name="fade">
    <div class="overlay" v-if="active">
      <div class="loader">
        <div class="sweep"></div>

        <!-- faster, precessing rings -->
        <div class="ringWrap w1"><div class="ring r1"></div></div>
        <div class="ringWrap w2"><div class="ring r2"></div></div>
        <div class="ringWrap w3"><div class="ring r3"></div></div>

        <div class="core"></div>

        <!-- tilted 3D orbits with faster spin -->
        <div class="orbit o1"><span class="dot"></span></div>
        <div class="orbit o2"><span class="dot"></span></div>
        <div class="orbit o3"><span class="dot"></span></div>
      </div>
      <div class="label">Scanning…</div>
    </div>
  </transition>
</template>

<script setup lang="ts">
defineProps<{ active: boolean }>()
</script>

<style scoped>
/* overlay fade */
.fade-enter-active, .fade-leave-active { transition: opacity .2s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }

.overlay{
  position: fixed; inset: 0;
  display: grid; place-items: center;
  background: radial-gradient(900px 300px at 50% -10%, rgba(0,194,255,.10), transparent),
              rgba(8,12,16,.58);
  backdrop-filter: blur(6px);
  z-index: 2000;
}

/* bigger overall loader gyro rotation */
.loader{
  position: relative;
  width: 200px; height: 200px;
  transform-style: preserve-3d;
  animation: gyro 1.8s ease-in-out infinite;
  filter: drop-shadow(0 14px 32px rgba(0,0,0,.38));
}

/* central hex "shield" (scaled up) */
.core{
  position:absolute; inset: 60px;
  background: linear-gradient(135deg, var(--pri), var(--sec));
  clip-path: polygon(25% 6.7%, 75% 6.7%, 100% 50%, 75% 93.3%, 25% 93.3%, 0% 50%);
  border: 1px solid #1e2a37;
  box-shadow: inset 0 0 20px rgba(0,0,0,.35);
  animation: pulse 1.1s ease-in-out infinite;
}

/* concentric rings in 3D precession (scaled up) */
.ringWrap{
  position:absolute; inset:0; margin:auto;
  transform-style: preserve-3d;
  animation: precess 2.8s linear infinite;
}
.w1{ transform: rotateX(16deg) rotateZ(0deg); }
.w2{ transform: rotateX(28deg) rotateZ(18deg); animation-duration: 2.2s; }
.w3{ transform: rotateX(36deg) rotateZ(-14deg); animation-duration: 1.8s; }

.ring{
  position:absolute; inset: 0; margin:auto;
  border-radius: 50%;
  border: 1px solid rgba(106,142,174,.28);
  box-shadow:
    0 0 0 1px rgba(0,0,0,.35) inset,
    0 0 28px rgba(0,226,168,.10);
  animation: breathe 1.2s ease-in-out infinite;
}
.r1{ width: 190px; height:190px; }
.r2{ width: 164px; height:164px; }
.r3{ width: 136px; height:136px; }

/* conic radar sweep, faster */
.sweep{
  position:absolute; inset: 5px; margin:auto;
  width: 190px; height:190px; border-radius:50%;
  background:
    conic-gradient(from 0deg,
      rgba(0,226,168,0) 0deg,
      rgba(0,226,168,.55) 24deg,
      rgba(0,194,255,.32) 42deg,
      rgba(0,226,168,0) 72deg);
  -webkit-mask: radial-gradient(circle at 50% 50%, transparent 34%, black 35%, black 60%, transparent 61%);
          mask: radial-gradient(circle at 50% 50%, transparent 34%, black 35%, black 60%, transparent 61%);
  mix-blend-mode: screen;
  filter: blur(.15px);
  animation: spin 0.9s linear infinite;
}

/* 3D orbits (tilted) with faster spin; scaled up */
.orbit{
  position:absolute; inset: 0; margin:auto;
  border-radius: 50%;
  transform-style: preserve-3d;
}
.o1{ width: 188px; height:188px; animation: spin3d 1.4s linear infinite; }
.o2{ width: 162px; height:162px; animation: spin3d 1.1s linear infinite reverse; }
.o3{ width: 136px; height:136px; animation: spin3d 0.9s linear infinite; }

.dot{
  position: absolute; top: 50%; left: 100%;
  width: 10px; height: 10px; border-radius: 50%;
  background: radial-gradient(circle, #fff, var(--sec) 40%, transparent 70%);
  transform: translate(-50%, -50%);
  box-shadow:
    -18px 0 16px -8px rgba(0,194,255,.50),
    0 0 20px rgba(0,226,168,.40);
  animation: fadeTrail 0.8s ease-in-out infinite;
}

/* Animations */
@keyframes spin { to { transform: rotate(360deg) } }
@keyframes spin3d { from { transform: rotateX(24deg) rotateZ(0deg) } to { transform: rotateX(24deg) rotateZ(360deg) } }
@keyframes gyro {
  0%   { transform: perspective(900px) rotateX(10deg) rotateY(-14deg) rotateZ(-8deg) }
  50%  { transform: perspective(900px) rotateX(28deg) rotateY(18deg)  rotateZ(-2deg) translateY(-2px) }
  100% { transform: perspective(900px) rotateX(10deg) rotateY(-14deg) rotateZ(-8deg) }
}
@keyframes pulse { 50% { transform: translateZ(10px) scale(1.035); filter: brightness(1.12) } }
@keyframes breathe { 50% { opacity: .6; transform: scale(.982) } }
@keyframes fadeTrail { 50% { opacity: .65 } }
@keyframes precess { to { transform: rotateX(var(--rx, 24deg)) rotateZ(var(--rz, 0deg)) rotateY(360deg) } }

.label{
  margin-top: 18px;
  color: #b9c4d0;
  font-weight: 600;
  letter-spacing:.3px;
}
</style>
