# 📋 План тестирования T.A.M.S

## 🎯 Обзор проекта

**Tokyo Anomaly Monitoring System** - SPA на Next.js (App Router) с FSD архитектурой:

- **Shared** - UI компоненты, типы, утилиты, API клиент
- **Entities** - AnomalyCard
- **Features** - capture-anomaly (optimistic update), realtime-updates (SSE)
- **Widgets** - AnomalyList
- **API Routes** - `/api/anomalies`, `/api/anomalies/[id]/capture`, `/api/anomalies/stream`

---

## 🧪 Стратегия тестирования

| Уровень         | Что тестируем                                                         | Инструменты                    |
| --------------- | --------------------------------------------------------------------- | ------------------------------ |
| **Unit**        | Утилиты, helpers, Zod схемы                                           | Vitest                         |
| **Component**   | UI компоненты (Badge, Button, Card, Toast)                            | Vitest + React Testing Library |
| **Integration** | Hooks (useCaptureAnomaly, useAnomalyStream), AnomalyCard, AnomalyList | Vitest + RTL + MSW             |
| **API**         | Route Handlers                                                        | Vitest                         |

---

## 📦 Итерации

### ✅ Итерация 1: Настройка тестовой среды

- [x] Установка зависимостей (vitest, @testing-library/react, msw, jsdom)
- [x] Конфигурация `vitest.config.ts`
- [x] Setup файлы (test setup, mocks)
- [x] Настройка path aliases для тестов
- [x] Пример теста для проверки работоспособности

**Статус:** ✅ Завершено

**Примечания:**

- Используется `happy-dom` вместо `jsdom` для лучшей совместимости с ESM
- Тестовое окружение настроено и работает корректно
- Пример тестов в `src/shared/config/tests/example.test.tsx`

---

### ✅ Итерация 2: Unit тесты - Shared Layer

#### 2.1 Zod схемы (`src/shared/types/anomaly.ts`)

- [x] `threatLevelSchema` - валидация всех уровней угрозы
- [x] `anomalyStatusSchema` - валидация статусов
- [x] `anomalySchema` - валидная/невалидная аномалия
- [x] `anomaliesArraySchema` - массив аномалий
- [x] `captureAnomalyResponseSchema` - success/error responses
- [x] `threatLevelChangeEventSchema` - SSE события

#### 2.2 Helper функции (`src/shared/lib/anomaly-helpers.ts`)

- [x] `getThreatLevelBadgeVariant()` - маппинг threatLevel → badge variant
- [x] `getStatusBadgeVariant()` - маппинг status → badge variant
- [x] `formatThreatLevel()` - форматирование уровня угрозы
- [x] `formatAnomalyStatus()` - форматирование статуса

#### 2.3 API Client (`src/shared/api/client.ts`)

- [x] `ApiError` class
- [x] `apiClient()` - success, error, timeout
- [x] `get()` helper
- [x] `post()` helper

**Статус:** ✅ Завершено

**Результаты:**

- ✅ 22 теста для Zod схем
- ✅ 18 тестов для helper функций
- ✅ 18 тестов для API клиента
- **Итого: 58 unit тестов, все проходят**

---

### ✅ Итерация 3: Component тесты - Shared UI

#### 3.1 Badge (`src/shared/ui/Badge`)

- [x] Рендер с разными variants
- [x] Рендер children
- [x] Применение className

#### 3.2 Button (`src/shared/ui/Button`)

- [x] Рендер variants (primary, danger)
- [x] Loading state (spinner)
- [x] Disabled state
- [x] Click handler
- [x] Custom className

#### 3.3 Card (`src/shared/ui/Card`)

- [x] Card рендер
- [x] CardHeader рендер
- [x] CardContent рендер
- [x] CardFooter рендер
- [x] Композиция компонентов

#### 3.4 Toast (`src/shared/ui/Toast`)

- [x] Toast рендер с разными типами
- [x] Auto-dismiss
- [x] Manual close
- [x] ToastProvider context
- [x] useToast hook

**Статус:** ✅ Завершено

**Результаты:**

- ✅ 14 тестов для Badge
- ✅ 21 тест для Button
- ✅ 22 теста для Card
- ✅ 16 тестов для Toast
- **Итого: 73 component теста, все проходят**

**Примечания:**

- Используется `fireEvent` вместо `userEvent` для избежания таймаутов
- CSS модули тестируются через `className.toContain(styles.X)`
- Fake timers для тестирования auto-dismiss функциональности

---

### ✅ Итерация 4: Entity тесты - AnomalyCard

#### 4.1 AnomalyCard (`src/entities/anomaly/ui/AnomalyCard`)

- [x] Рендер данных аномалии (name, location, threatLevel, status)
- [x] Badge для threatLevel
- [x] Badge для status
- [x] Кнопка "Capture" для активных
- [x] Кнопка "Captured" (disabled) для пойманных
- [x] Loading state при isCapturing
- [x] onCapture callback
- [x] CSS классы по threatLevel

**Статус:** ✅ Завершено

**Результаты:**

- ✅ 6 тестов для рендера данных аномалии
- ✅ 5 тестов для Badge компонентов
- ✅ 5 тестов для кнопки Capture (активные)
- ✅ 4 теста для кнопки Captured (пойманные)
- ✅ 5 тестов для Loading state
- ✅ 6 тестов для CSS классов по threat level
- ✅ 4 теста для структуры компонента
- ✅ 4 теста для Edge cases
- **Итого: 37 тестов, все проходят**

**Примечания:**

- Тесты покрывают все варианты threat levels (low, medium, high, critical)
- Проверяется корректность маппинга статусов в Badge variants
- Тестируется optimistic UI при isCapturing
- Проверяется корректная обработка множественных элементов с одинаковым текстом

---

### ✅ Итерация 5: Feature тесты - Capture Anomaly

#### 5.1 useCaptureAnomaly hook (`src/features/capture-anomaly/model`)

- [x] Успешный capture (mutate → success)
- [x] Optimistic update (UI обновляется мгновенно)
- [x] Rollback при ошибке API
- [x] Toast notification на success
- [x] Toast notification на error
- [x] Query invalidation

**Статус:** ✅ Завершено

**Результаты:**

- ✅ 19 тестов, все проходят
- ✅ Покрытие: successful capture (3), optimistic updates (3), error handling & rollback (4), query invalidation (2), loading states (2), multiple mutations (2), edge cases (3)

---

### ✅ Итерация 6: Feature тесты - Realtime Updates

#### 6.1 useAnomalyStream hook (`src/features/realtime-updates/model`)

- [x] SSE подключение
- [x] Обработка threat_level_change события
- [x] Обновление query cache
- [x] Callback onThreatLevelChange
- [x] Reconnection logic
- [x] Cleanup при unmount

**Статус:** ✅ Завершено

**Результаты:**

- ✅ 18 тестов, все проходят
- ✅ Покрытие: SSE connection (4), threat level events (6), callback (2), reconnection (2), disconnect (2), edge cases (3)

---

### ✅ Итерация 7: Widget тесты - AnomalyList

#### 7.1 AnomalyList (`src/widgets/anomaly-list/ui/AnomalyList`)

- [x] Loading state
- [x] Error state
- [x] Empty state
- [x] Рендер списка карточек
- [x] Stats (active/captured count)
- [x] Retry button
- [x] Capture integration

**Статус:** ✅ Завершено

**Результаты:**

- ✅ 30 тестов, все проходят
- ✅ Покрытие: loading state (3), error state (5), empty state (3), rendering (4), stats (4), capture integration (7), grid layout (2), edge cases (3)

---

### ✅ Итерация 8: API Route тесты

#### 8.1 GET /api/anomalies

- [x] Возвращает массив аномалий
- [x] Zod валидация данных

#### 8.2 POST /api/anomalies/[id]/capture

- [x] Успешный capture
- [x] 404 - anomaly not found
- [x] 400 - already captured
- [x] 500 - random failure (30%)

#### 8.3 GET /api/anomalies/stream

- [x] SSE headers
- [x] Connection message
- [x] Threat level change events

**Статус:** ✅ Завершено

**Результаты:**

- ✅ 7 тестов для GET /api/anomalies
- ✅ 13 тестов для POST /api/anomalies/[id]/capture
- ✅ 10 тестов для GET /api/anomalies/stream
- **Итого: 30 тестов, все проходят**

---

## 📊 Прогресс

| Итерация              | Тесты       | Статус |
| --------------------- | ----------- | ------ |
| 1. Настройка среды    | 2           | ✅     |
| 2. Shared Unit        | 58          | ✅     |
| 3. Shared UI          | 73          | ✅     |
| 4. AnomalyCard        | 37          | ✅     |
| 5. Capture Feature    | 19          | ✅     |
| 6. Realtime Feature   | 18          | ✅     |
| 7. AnomalyList Widget | 30          | ✅     |
| 8. API Routes         | 30          | ✅     |
| **Всего**             | **267/267** | ✅     |

---

## 📝 Заметки

_Здесь можно добавлять заметки по ходу работы_

---

## 🚀 Текущая задача

**Все итерации завершены!** ✅

**Результат:** 267/267 тестов успешно проходят

---

## 🎉 Итоговая статистика

- **Всего тестов:** 267
- **Успешно:** 267 (100%)
- **Файлов с тестами:** 15
- **Время выполнения:** ~3-8 секунд

### Покрытие по слоям:

1. **Shared Layer:** 149 тестов

   - Unit тесты (Zod, helpers, API client): 58
   - UI компоненты (Badge, Button, Card, Toast): 73
   - Тестовая среда: 2

2. **Entity Layer:** 37 тестов

   - AnomalyCard компонент

3. **Feature Layer:** 37 тестов

   - Capture Anomaly hook: 19
   - Realtime Updates hook: 18

4. **Widget Layer:** 30 тестов

   - AnomalyList компонент

5. **API Layer:** 30 тестов
   - GET /api/anomalies: 7
   - POST /api/anomalies/[id]/capture: 13
   - GET /api/anomalies/stream (SSE): 10

Готов к деплою! 🚀
