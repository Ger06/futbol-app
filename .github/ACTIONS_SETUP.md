# GitHub Actions - Configuración

Este documento explica cómo configurar y usar las GitHub Actions para actualizar automáticamente los datos de la aplicación de fútbol.

## Workflows Disponibles

### 1. Update Football Fixtures (`update-fixtures.yml`)

Actualiza automáticamente los datos de partidos de fútbol todos los días.

**Características:**
- ✅ Ejecución automática diaria a las 6:00 AM UTC
- ✅ Ejecución manual desde GitHub Actions UI
- ✅ Actualiza solo datos recientes (ayer, hoy, mañana)
- ✅ Commit automático si hay cambios
- ✅ Optimizado para consumir menos API calls

**Qué hace:**
1. Obtiene fixtures de las últimas 24 horas y próximas 24 horas
2. Actualiza estados de partidos en vivo o finalizados
3. Añade nuevos partidos programados
4. Actualiza goles y estadísticas
5. Hace commit y push si detecta cambios

## Configuración de Secrets

Para que los workflows funcionen correctamente, necesitas configurar los siguientes secrets en GitHub:

### Secrets Requeridos

1. **`DATABASE_URL`** (Requerido)
   - URL de conexión a tu base de datos Postgres/Neon
   - Ejemplo: `postgresql://user:password@host:5432/database`
   - Se usa para: Conexión a la base de datos y ejecución de Prisma

2. **`API_FOOTBALL_KEY`** (Requerido)
   - Tu API key de API-Football (https://www.api-football.com/)
   - Se usa para: Obtener datos actualizados de partidos

### Cómo agregar secrets en GitHub

1. Ve a tu repositorio en GitHub
2. Click en **Settings** → **Secrets and variables** → **Actions**
3. Click en **New repository secret**
4. Agrega cada secret con su nombre y valor correspondiente

## Uso Manual

### Ejecutar el workflow manualmente

1. Ve a la pestaña **Actions** en tu repositorio
2. Selecciona el workflow **"Update Football Fixtures"**
3. Click en **Run workflow**
4. Selecciona la rama (normalmente `main`)
5. Click en **Run workflow**

### Ejecutar el script localmente

```bash
# Actualización diaria (ayer, hoy, mañana)
npx tsx scripts/update-daily-fixtures.ts

# Actualización completa de temporada (más lento)
npx tsx scripts/seed-fixtures.ts
```

## Horarios de Ejecución

El workflow se ejecuta automáticamente:
- **Diariamente a las 6:00 AM UTC** (2:00 AM Argentina, 3:00 AM Brasil)

Puedes cambiar el horario editando el cron en `.github/workflows/update-fixtures.yml`:

```yaml
schedule:
  - cron: '0 6 * * *'  # Minuto Hora Día Mes DíaDeLaSemana
```

Ejemplos de cron:
- `'0 */6 * * *'` - Cada 6 horas
- `'0 8,20 * * *'` - A las 8:00 AM y 8:00 PM
- `'0 6 * * 1-5'` - A las 6:00 AM de lunes a viernes

## Monitoreo

### Ver logs de ejecución

1. Ve a **Actions** en tu repositorio
2. Click en el workflow que quieres ver
3. Click en la ejecución específica
4. Expande los pasos para ver logs detallados

### Notificaciones

GitHub te enviará notificaciones por email si un workflow falla. Puedes configurar esto en:
**Settings** → **Notifications** → **Actions**

## Scripts Disponibles

### `update-daily-fixtures.ts`
- **Propósito**: Actualización diaria optimizada
- **Datos**: Últimas 24h + próximas 24h
- **Uso**: Recomendado para GitHub Actions
- **API Calls**: ~3 por ejecución

### `seed-fixtures.ts`
- **Propósito**: Carga inicial / actualización completa
- **Datos**: Temporada completa de todas las ligas
- **Uso**: Configuración inicial o recarga completa
- **API Calls**: ~9 por ejecución (una por liga)

## Ligas Soportadas

Las siguientes ligas están configuradas para actualización automática:

- 🏆 UEFA Champions League
- 🏴󐁧󐁢󐁥󐁮󐁧󐁿 Premier League (Inglaterra)
- 🇪🇸 La Liga (España)
- 🇮🇹 Serie A (Italia)
- 🇦🇷 Liga Profesional Argentina
- 🇧🇷 Brasileirão Serie A
- 🇩🇪 Bundesliga (Alemania)
- 🇺🇸 MLS (Estados Unidos)
- 🇫🇷 Ligue 1 (Francia)

## Troubleshooting

### El workflow falla con "DATABASE_URL is not set"
→ Asegúrate de haber configurado el secret `DATABASE_URL` en GitHub

### El workflow falla con "API-Football error: 401"
→ Verifica que el secret `API_FOOTBALL_KEY` sea válido

### No se están haciendo commits automáticos
→ Verifica que haya cambios reales en los datos. El workflow solo hace commit si detecta cambios.

### Error de rate limiting de API-Football
→ El script incluye delays de 1 segundo entre requests. Si necesitas más, ajusta `DELAY_BETWEEN_REQUESTS` en el script.

## Costos y Límites

### GitHub Actions
- **Free tier**: 2,000 minutos/mes para repositorios públicos
- Este workflow usa ~2-3 minutos por ejecución
- Ejecuciones diarias: ~60-90 minutos/mes

### API-Football
- Verifica tu plan en https://www.api-football.com/
- El script diario hace ~3 API calls por ejecución
- ~90 API calls por mes con ejecución diaria
