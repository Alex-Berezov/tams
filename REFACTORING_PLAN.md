# План рефакторинга TAMS по CODE_STYLE.md

## Цель

Привести все компоненты проекта в соответствие с CODE_STYLE.md

---

## Итерация 1: Shared UI компоненты

### 1.1 Button.tsx

- [x] Добавить `import type { FC, ReactNode, ButtonHTMLAttributes } from 'react'`
- [x] Заменить `React.FC` → `FC`
- [x] Заменить `React.ReactNode` → `ReactNode`
- [x] Заменить `React.ButtonHTMLAttributes` → `ButtonHTMLAttributes`
- [x] Перенести деструктуризацию props в тело функции
- [x] Добавить JSDoc комментарий

### 1.2 Card.tsx

- [x] Добавить `import type { FC, ReactNode } from 'react'`
- [x] Заменить `React.FC` → `FC`
- [x] Заменить `React.ReactNode` → `ReactNode`
- [x] Добавить JSDoc комментарии для каждого компонента

### 1.3 Badge.tsx

- [x] Добавить `import type { FC, ReactNode } from 'react'`
- [x] Заменить `React.FC` → `FC`
- [x] Заменить `React.ReactNode` → `ReactNode`
- [x] Перенести деструктуризацию props в тело функции (3 параметра)
- [x] Добавить JSDoc комментарий

### 1.4 Toast.tsx

- [x] Добавить `import type { FC } from 'react'`
- [x] Заменить `React.FC` → `FC`
- [x] Перенести деструктуризацию props в тело функции (5 параметров)
- [x] Заменить `function getIcon()` → `const getIcon = (): string =>`
- [x] Добавить JSDoc комментарий

### 1.5 ToastProvider.tsx

- [x] Добавить `import type { FC } from 'react'` (ReactNode уже импортирован)
- [x] Заменить `React.FC` → `FC`
- [x] Добавить JSDoc комментарий

---

## Итерация 2: Entities + Widgets

### 2.1 AnomalyCard.tsx

- [x] Добавить `import type { FC } from 'react'`
- [x] Заменить `React.FC` → `FC`
- [x] Перенести деструктуризацию props в тело функции (3 параметра)
- [x] Добавить JSDoc комментарий

### 2.2 AnomalyList.tsx

- [x] Добавить `import type { FC } from 'react'`
- [x] Заменить `React.FC` → `FC`
- [x] Заменить `async function` → `const ... = async`
- [x] Перевести комментарии на английский

### 2.3 NotificationContainer.tsx

- [x] Добавить `import type { FC } from 'react'` (ReactNode уже импортирован)
- [x] Заменить все `React.FC` → `FC`
- [x] Заменить `function getIcon()` → `const getIcon = (): ReactNode =>`
- [x] Перенести деструктуризацию props в тело функций где нужно
- [x] Перевести все комментарии на английский

---

## Итерация 3: Shared helpers + API

### 3.1 anomaly-helpers.ts

- [x] Заменить `export function getThreatLevelBadgeVariant()` → `export const getThreatLevelBadgeVariant = (): BadgeVariant =>`
- [x] Заменить `export function getStatusBadgeVariant()` → `export const getStatusBadgeVariant = (): BadgeVariant =>`
- [x] Заменить `export function formatThreatLevel()` → `export const formatThreatLevel = (): string =>`
- [x] Заменить `export function formatAnomalyStatus()` → `export const formatAnomalyStatus = (): string =>`

### 3.2 client.ts

- [x] Заменить `export async function apiClient()` → `export const apiClient = async (): Promise<T> =>`
- [x] Заменить `export function get()` → `export const get = (): Promise<T> =>`
- [x] Заменить `export function post()` → `export const post = (): Promise<T> =>`

---

## Проверка после каждой итерации

После каждой итерации выполнить:

```bash
npm run dev
```

Убедиться что:

- [ ] Приложение запускается без ошибок
- [ ] Страница /monitoring загружается
- [ ] Кнопка Capture работает
- [ ] SSE обновления приходят

---

## Статус выполнения

| Итерация | Файлы                                           | Статус       |
| -------- | ----------------------------------------------- | ------------ |
| 1        | Button, Card, Badge, Toast, ToastProvider       | ✅ Выполнено |
| 2        | AnomalyCard, AnomalyList, NotificationContainer | ✅ Выполнено |
| 3        | anomaly-helpers, client                         | ✅ Выполнено |
| 4        | NotificationContainer декомпозиция              | ✅ Выполнено |

---

## Примечания

- ✅ **Декомпозиция NotificationContainer.tsx** выполнена:
  - `types.ts` — типы и интерфейсы (~70 строк)
  - `context.ts` — контекст и хук (~20 строк)
  - `NotificationIcons.tsx` — SVG иконки (~90 строк)
  - `NotificationItem.tsx` — компонент уведомления (~60 строк)
  - `NotificationContainer.tsx` — основной провайдер (~125 строк)
- Все изменения стилистические, функциональность не меняется
- При возникновении ошибок TypeScript — исправлять сразу
