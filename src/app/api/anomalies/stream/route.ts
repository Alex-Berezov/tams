import { ThreatLevel } from '@/shared/types/anomaly'
import { mockAnomalies } from '../route'

/**
 * GET /api/anomalies/stream
 * Server-Sent Events endpoint для real-time обновлений
 *
 * Каждые 5 секунд случайный дух меняет уровень угрозы
 */
export async function GET() {
  const encoder = new TextEncoder()
  let intervalId: NodeJS.Timeout | null = null
  let isClosed = false

  const stream = new ReadableStream({
    start(controller) {
      // Отправляем начальное сообщение о подключении
      const connectMessage = `data: ${JSON.stringify({
        type: 'connected',
        message: 'SSE connection established',
      })}\n\n`
      controller.enqueue(encoder.encode(connectMessage))

      // Интервал для отправки обновлений каждые 5 секунд
      intervalId = setInterval(() => {
        // Проверяем, не закрыт ли поток
        if (isClosed) {
          if (intervalId) {
            clearInterval(intervalId)
            intervalId = null
          }
          return
        }

        try {
          // Выбираем случайного активного духа
          const activeAnomalies = mockAnomalies.filter(
            (a) => a.status === 'active'
          )

          if (activeAnomalies.length === 0) {
            // Все духи пойманы, отправляем информационное сообщение
            const noActiveMessage = `data: ${JSON.stringify({
              type: 'info',
              message: 'No active anomalies to update',
            })}\n\n`
            controller.enqueue(encoder.encode(noActiveMessage))
            return
          }

          const randomIndex = Math.floor(Math.random() * activeAnomalies.length)
          const selectedAnomaly = activeAnomalies[randomIndex]

          // Выбираем новый случайный уровень угрозы (отличный от текущего)
          const threatLevels = Object.values(ThreatLevel)
          const availableLevels = threatLevels.filter(
            (level) => level !== selectedAnomaly.threatLevel
          )
          const newThreatLevel =
            availableLevels[Math.floor(Math.random() * availableLevels.length)]

          // Обновляем уровень угрозы в моковых данных
          const anomalyIndex = mockAnomalies.findIndex(
            (a) => a.id === selectedAnomaly.id
          )
          if (anomalyIndex !== -1) {
            mockAnomalies[anomalyIndex] = {
              ...mockAnomalies[anomalyIndex],
              threatLevel: newThreatLevel,
            }
          }

          // Формируем и отправляем SSE событие
          const event = {
            type: 'threat_level_change',
            anomalyId: selectedAnomaly.id,
            newThreatLevel: newThreatLevel,
            anomalyName: selectedAnomaly.name,
            previousThreatLevel: selectedAnomaly.threatLevel,
          }

          const message = `data: ${JSON.stringify(event)}\n\n`
          controller.enqueue(encoder.encode(message))
        } catch {
          // Игнорируем ошибки записи в закрытый поток
        }
      }, 5000)
    },
    cancel() {
      // Вызывается при отмене потока клиентом
      isClosed = true
      if (intervalId) {
        clearInterval(intervalId)
        intervalId = null
      }
      console.log('SSE connection closed by client')
    },
  })

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      Connection: 'keep-alive',
      'X-Accel-Buffering': 'no', // Для Nginx
    },
  })
}
