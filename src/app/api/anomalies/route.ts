import { NextResponse } from 'next/server'
import {
  Anomaly,
  ThreatLevel,
  AnomalyStatus,
  anomaliesArraySchema,
} from '@/shared/types/anomaly'

/**
 * Mock data - список духов (ёкаев) для мониторинга
 * Содержит 10 духов с разными параметрами
 */
export const mockAnomalies: Anomaly[] = [
  {
    id: '1',
    name: 'Kitsune',
    threatLevel: ThreatLevel.HIGH,
    location: 'Shibuya District',
    status: AnomalyStatus.ACTIVE,
  },
  {
    id: '2',
    name: 'Tengu',
    threatLevel: ThreatLevel.CRITICAL,
    location: 'Mount Takao',
    status: AnomalyStatus.ACTIVE,
  },
  {
    id: '3',
    name: 'Kappa',
    threatLevel: ThreatLevel.MEDIUM,
    location: 'Sumida River',
    status: AnomalyStatus.ACTIVE,
  },
  {
    id: '4',
    name: 'Oni',
    threatLevel: ThreatLevel.CRITICAL,
    location: 'Asakusa Temple',
    status: AnomalyStatus.ACTIVE,
  },
  {
    id: '5',
    name: 'Yurei',
    threatLevel: ThreatLevel.LOW,
    location: 'Yanaka Cemetery',
    status: AnomalyStatus.CAPTURED,
  },
  {
    id: '6',
    name: 'Tanuki',
    threatLevel: ThreatLevel.LOW,
    location: 'Ueno Park',
    status: AnomalyStatus.ACTIVE,
  },
  {
    id: '7',
    name: 'Jorōgumo',
    threatLevel: ThreatLevel.HIGH,
    location: 'Akihabara',
    status: AnomalyStatus.ACTIVE,
  },
  {
    id: '8',
    name: 'Nue',
    threatLevel: ThreatLevel.MEDIUM,
    location: 'Shinjuku Station',
    status: AnomalyStatus.ACTIVE,
  },
  {
    id: '9',
    name: 'Rokurokubi',
    threatLevel: ThreatLevel.LOW,
    location: 'Harajuku',
    status: AnomalyStatus.CAPTURED,
  },
  {
    id: '10',
    name: 'Gashadokuro',
    threatLevel: ThreatLevel.CRITICAL,
    location: 'Tokyo Tower',
    status: AnomalyStatus.ACTIVE,
  },
]

/**
 * GET /api/anomalies
 * Возвращает список всех аномалий (духов)
 */
export async function GET() {
  try {
    // Валидация данных через Zod перед отправкой
    const validatedData = anomaliesArraySchema.parse(mockAnomalies)

    return NextResponse.json({
      success: true,
      data: validatedData,
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
