import { NextRequest, NextResponse } from 'next/server'
import { AnomalyStatus, anomalySchema } from '@/shared/types/anomaly'
import { mockAnomalies } from '../../route'

/**
 * POST /api/anomalies/[id]/capture
 * Захват духа (аномалии)
 *
 * С вероятностью 30% возвращает ошибку для тестирования rollback
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  // Поиск аномалии по ID
  const anomalyIndex = mockAnomalies.findIndex((a) => a.id === id)

  if (anomalyIndex === -1) {
    return NextResponse.json(
      {
        success: false,
        error: `Anomaly with id "${id}" not found`,
      },
      { status: 404 }
    )
  }

  const anomaly = mockAnomalies[anomalyIndex]

  // Проверка, не пойман ли уже дух
  if (anomaly.status === AnomalyStatus.CAPTURED) {
    return NextResponse.json(
      {
        success: false,
        error: `Anomaly "${anomaly.name}" is already captured`,
      },
      { status: 400 }
    )
  }

  // 30% вероятность ошибки для тестирования optimistic update rollback
  const shouldFail = Math.random() < 0.3

  if (shouldFail) {
    return NextResponse.json(
      {
        success: false,
        error: `Capture failed! ${anomaly.name} escaped during the capture attempt`,
      },
      { status: 500 }
    )
  }

  // Успешный захват - обновляем статус
  mockAnomalies[anomalyIndex] = {
    ...anomaly,
    status: AnomalyStatus.CAPTURED,
  }

  // Валидация обновлённой аномалии через Zod
  try {
    const validatedAnomaly = anomalySchema.parse(mockAnomalies[anomalyIndex])

    return NextResponse.json({
      success: true,
      anomaly: validatedAnomaly,
    })
  } catch (error) {
    console.error('Validation error:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error: data validation failed',
      },
      { status: 500 }
    )
  }
}
