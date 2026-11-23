// ============================================================================
// Sistema de Notificaciones Activas Tipo WhatsApp para RutaLink Barranca
// Incluye: Web Notifications API + Sintetizador Web Audio API (Chime / Timbre)
// ============================================================================

class NotificationService {
  private audioCtx: AudioContext | null = null;
  private hasRequestedPermission = false;

  constructor() {
    if (typeof window !== 'undefined') {
      // Intentar inicializar AudioContext al primer toque del usuario
      const initAudio = () => {
        try {
          if (!this.audioCtx) {
            const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
            if (AudioContextClass) {
              this.audioCtx = new AudioContextClass();
            }
          }
          if (this.audioCtx && this.audioCtx.state === 'suspended') {
            this.audioCtx.resume();
          }
        } catch {
          // Ignorar si el navegador bloquea audio antes de interacción
        }
      };

      window.addEventListener('click', initAudio, { once: true });
      window.addEventListener('touchstart', initAudio, { once: true });
    }
  }

  // Solicitar permiso nativo al usuario para notificaciones de escritorio / móvil
  public async requestPermission(): Promise<boolean> {
    if (typeof window === 'undefined' || !('Notification' in window)) {
      return false;
    }

    try {
      if (Notification.permission === 'granted') {
        return true;
      }
      if (Notification.permission !== 'denied') {
        const permission = await Notification.requestPermission();
        return permission === 'granted';
      }
    } catch (e) {
      console.warn('[NotificationService] Error solicitando permisos:', e);
    }
    return false;
  }

  // Sintetizador Web Audio API: campanilla suave de 2 notas (tipo WhatsApp / Slack)
  public playChime(type: 'message' | 'alert' | 'ride_request' | 'dropoff' = 'message') {
    try {
      if (typeof window === 'undefined') return;

      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContextClass) return;

      if (!this.audioCtx || this.audioCtx.state === 'closed') {
        this.audioCtx = new AudioContextClass();
      }

      if (this.audioCtx.state === 'suspended') {
        this.audioCtx.resume();
      }

      const now = this.audioCtx.currentTime;

      if (type === 'message') {
        // Tono doble de mensaje WhatsApp: Mi (659.25Hz) seguido de Sol# (830.61Hz)
        const osc1 = this.audioCtx.createOscillator();
        const gain1 = this.audioCtx.createGain();
        osc1.type = 'sine';
        osc1.frequency.setValueAtTime(659.25, now);
        gain1.gain.setValueAtTime(0.2, now);
        gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.18);
        osc1.connect(gain1);
        gain1.connect(this.audioCtx.destination);
        osc1.start(now);
        osc1.stop(now + 0.18);

        const osc2 = this.audioCtx.createOscillator();
        const gain2 = this.audioCtx.createGain();
        osc2.type = 'sine';
        osc2.frequency.setValueAtTime(830.61, now + 0.12);
        gain2.gain.setValueAtTime(0.25, now + 0.12);
        gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
        osc2.connect(gain2);
        gain2.connect(this.audioCtx.destination);
        osc2.start(now + 0.12);
        osc2.stop(now + 0.35);
      } else if (type === 'ride_request' || type === 'alert') {
        // Timbre de llamada / carrera entrante: 3 notas ascendentes alegres
        const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
        notes.forEach((freq, idx) => {
          if (!this.audioCtx) return;
          const osc = this.audioCtx.createOscillator();
          const gain = this.audioCtx.createGain();
          const noteStart = now + idx * 0.1;
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(freq, noteStart);
          gain.gain.setValueAtTime(0.3, noteStart);
          gain.gain.exponentialRampToValueAtTime(0.001, noteStart + 0.22);
          osc.connect(gain);
          gain.connect(this.audioCtx.destination);
          osc.start(noteStart);
          osc.stop(noteStart + 0.22);
        });
      } else if (type === 'dropoff') {
        // Timbre de bajada de autobús (Ding Dong clásico)
        const osc1 = this.audioCtx.createOscillator();
        const gain1 = this.audioCtx.createGain();
        osc1.type = 'sine';
        osc1.frequency.setValueAtTime(880, now); // La5
        gain1.gain.setValueAtTime(0.35, now);
        gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.4);
        osc1.connect(gain1);
        gain1.connect(this.audioCtx.destination);
        osc1.start(now);
        osc1.stop(now + 0.4);

        const osc2 = this.audioCtx.createOscillator();
        const gain2 = this.audioCtx.createGain();
        osc2.type = 'sine';
        osc2.frequency.setValueAtTime(587.33, now + 0.25); // Re5
        gain2.gain.setValueAtTime(0.3, now + 0.25);
        gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.7);
        osc2.connect(gain2);
        gain2.connect(this.audioCtx.destination);
        osc2.start(now + 0.25);
        osc2.stop(now + 0.7);
      }
    } catch (e) {
      console.warn('[NotificationService] Audio chime fallback:', e);
    }
  }

  // Disparar notificación activa (Sonido + Notificación del Navegador + Vibración táctil)
  public notify(options: {
    title: string;
    body: string;
    type?: 'message' | 'alert' | 'ride_request' | 'dropoff';
    tag?: string;
    data?: any;
    onClick?: () => void;
  }) {
    const { title, body, type = 'message', tag, onClick } = options;

    // 1. Reproducir sonido sin latencia
    this.playChime(type);

    // 2. Vibración táctil en móviles (patrón háptico estilo WhatsApp)
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      try {
        if (type === 'ride_request') {
          navigator.vibrate([100, 50, 100, 50, 200]);
        } else {
          navigator.vibrate([80, 40, 80]);
        }
      } catch {
        // Silenciar fallos de vibración
      }
    }

    // 3. Notificación nativa del Sistema Operativo si la ventana no está enfocada
    if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
      try {
        const notif = new Notification(title, {
          body,
          icon: '/favicon.ico',
          badge: '/favicon.ico',
          tag: tag || `rutalink-${Date.now()}`
        });

        notif.onclick = () => {
          window.focus();
          notif.close();
          if (onClick) onClick();
        };

        // Cerrar automáticamente a los 7 segundos
        setTimeout(() => notif.close(), 7000);
      } catch (e) {
        console.warn('[NotificationService] Native Notification error:', e);
      }
    }
  }
}

export const notificationService = new NotificationService();
