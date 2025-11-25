# ⚽ Fútbol App - Sitio Web de Resultados y Estadísticas

Sitio web moderno de fútbol con resultados en tiempo real, fixtures, tablas de posiciones, estadísticas detalladas y videos de goles. Cubre las principales competiciones: Champions League, Premier League, La Liga, Serie A, Liga Profesional Argentina, Brasileirão y MLS.

## 🚀 Características

- ✅ **Fixtures**: Calendario de partidos por liga y fecha
- ✅ **Resultados en tiempo real**: Actualización cada 15-30 segundos
- ✅ **Tablas de posiciones**: Standings actualizadas con estadísticas
- ✅ **Goles y tarjetas**: Detalles de cada evento del partido
- ✅ **Videos de goles**: Highlights integrados desde Scorebat
- ✅ **Estadísticas avanzadas**: Top goleadores, asistencias, tarjetas
- ✅ **Diseño responsive**: Mobile-first, adaptado a todos los dispositivos
- ✅ **Analytics**: Google Analytics 4 integrado
- ✅ **Performance optimizado**: Cache multinivel (Redis + SWR)

## 📦 Stack Tecnológico

### Frontend
- **Next.js 14+** con App Router y React Server Components
- **React 18+** con TypeScript
- **Tailwind CSS** para estilos
- **SWR** para data fetching con cache

### Backend
- **Next.js API Routes** (Node.js integrado)
- **Prisma ORM** con PostgreSQL
- **TypeScript** para type-safety

### Base de Datos
- **Neon PostgreSQL** (serverless)
- **Upstash Redis** para cache

### APIs Externas
- **API-Football** - Datos de partidos, posiciones, estadísticas
- **Scorebat API** - Videos de goles y highlights (gratuito)

### Hosting & Analytics
- **Vercel** - Hosting y deploy automático
- **Google Analytics 4** - Tracking y analytics

## 🏗️ Arquitectura

```
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── api/               # API Routes (Backend)
│   │   ├── fixtures/          # Página de fixtures
│   │   ├── results/           # Página de resultados
│   │   ├── standings/         # Página de posiciones
│   │   └── statistics/        # Página de estadísticas
│   │
│   ├── matches/               # Dominio: Partidos
│   │   ├── components/        # Componentes de partidos
│   │   ├── types/             # Tipos TypeScript
│   │   └── hooks/             # Custom hooks
│   │
│   ├── teams/                 # Dominio: Equipos
│   ├── leagues/               # Dominio: Ligas
│   ├── players/               # Dominio: Jugadores
│   │
│   └── shared/                # Código compartido
│       ├── components/        # Componentes UI reutilizables
│       ├── lib/               # Clientes (Prisma, Redis, APIs)
│       └── utils/             # Utilidades
│
├── prisma/
│   └── schema.prisma          # Esquema de base de datos
│
└── public/                    # Assets estáticos
```

### Screaming Architecture por Dominios

El proyecto usa **Screaming Architecture** organizando el código por dominios del negocio (matches, teams, leagues, players) en lugar de por capas técnicas. Cada dominio contiene sus propios components, types y hooks, haciendo el código más mantenible y escalable.

## 🗄️ Esquema de Base de Datos

```prisma
League    → Ligas configuradas (7 competiciones)
Team      → Equipos
Match     → Partidos (fixtures + resultados)
Goal      → Goles con jugador y minuto
Card      → Tarjetas amarillas/rojas
ApiLog    → Logs de llamadas a APIs
```

## 🚀 Setup e Instalación

### Prerrequisitos

- Node.js 18+
- npm o yarn
- Cuenta en [Neon.tech](https://neon.tech) (PostgreSQL gratis)
- Cuenta en [Upstash](https://upstash.com) (Redis gratis)
- API Key de [API-Football](https://www.api-football.com)
- Propiedad de [Google Analytics 4](https://analytics.google.com)

### Instalación

1. **Clonar el repositorio**
```bash
git clone https://github.com/tu-usuario/futbol-app.git
cd futbol-app
```

2. **Instalar dependencias**
```bash
npm install
```

3. **Configurar variables de entorno**

Copia `.env.example` a `.env.local` y completa las variables:

```bash
cp .env.example .env.local
```

Edita `.env.local`:

```env
# Base de Datos (Neon PostgreSQL)
DATABASE_URL="postgresql://user:password@host/database?sslmode=require"

# API-Football
API_FOOTBALL_KEY="tu-api-key-aqui"
API_FOOTBALL_BASE_URL="https://v3.football.api-sports.io"

# Upstash Redis
UPSTASH_REDIS_REST_URL="https://your-redis.upstash.io"
UPSTASH_REDIS_REST_TOKEN="tu-token-aqui"

# Google Analytics 4
NEXT_PUBLIC_GA_MEASUREMENT_ID="G-XXXXXXXXXX"
```

4. **Configurar la base de datos**

```bash
# Generar cliente de Prisma
npx prisma generate

# Crear las tablas en la base de datos
npx prisma db push

# (Opcional) Seed con ligas iniciales
npm run seed
```

5. **Ejecutar en desarrollo**

```bash
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000) en tu navegador.

## 📋 Scripts Disponibles

```bash
npm run dev          # Servidor de desarrollo
npm run build        # Build para producción
npm run start        # Servidor de producción
npm run lint         # Linter
npm run type-check   # Verificar tipos TypeScript
npm run prisma:generate   # Generar cliente Prisma
npm run prisma:push       # Push schema a DB
npm run prisma:studio     # Abrir Prisma Studio
```

## 🌍 Deploy a Producción

### Deploy en Vercel (Recomendado)

1. Push tu código a GitHub
2. Conecta tu repositorio en [Vercel](https://vercel.com)
3. Configura las variables de entorno en Vercel
4. Deploy automático

### Variables de entorno en Vercel

Ve a Settings → Environment Variables y agrega:
- `DATABASE_URL`
- `API_FOOTBALL_KEY`
- `API_FOOTBALL_BASE_URL`
- `UPSTASH_REDIS_REST_URL`
- `UPSTASH_REDIS_REST_TOKEN`
- `NEXT_PUBLIC_GA_MEASUREMENT_ID`
- `NEXT_PUBLIC_SITE_NAME`
- `NEXT_PUBLIC_SITE_URL`

## 💰 Costos Mensuales

| Servicio | Plan | Costo |
|----------|------|-------|
| Vercel | Hobby | $0 |
| Neon PostgreSQL | Free | $0 |
| API-Football | Basic | $19 USD |
| Scorebat | Free | $0 |
| Upstash Redis | Free | $0 |
| Google Analytics 4 | Free | $0 |
| **TOTAL** | | **$19 USD/mes** |

## 🎨 Ligas Configuradas

El sitio cubre las siguientes competiciones:

1. **UEFA Champions League** (Europa)
2. **Premier League** (Inglaterra)
3. **La Liga** (España)
4. **Serie A** (Italia)
5. **Liga Profesional Argentina**
6. **Brasileirão Serie A** (Brasil)
7. **Major League Soccer - MLS** (Estados Unidos)

### Agregar nuevas ligas

1. Agrega el ID de la liga en `src/shared/lib/api-football.ts`:
```typescript
export const LEAGUE_IDS = {
  // ... existentes
  NUEVA_LIGA: 123,  // ID de API-Football
}
```

2. Inserta en la base de datos:
```typescript
await prisma.league.create({
  data: {
    apiId: 123,
    name: "Nueva Liga",
    country: "País",
    season: 2024,
    active: true
  }
})
```

## 📊 Estrategia de Cache

Para optimizar el uso de la API (límite: 100 requests/min):

| Tipo de dato | TTL | Motivo |
|--------------|-----|--------|
| Partidos en vivo | 30 seg | Actualización frecuente |
| Fixtures futuros | 24 horas | Cambian poco |
| Resultados finalizados | 30 días | Inmutables |
| Posiciones | 1 hora | Cambian por jornada |
| Estadísticas | 6 horas | Cambios lentos |

## 🔧 Troubleshooting

### Error: No se puede conectar a la base de datos
- Verifica que `DATABASE_URL` esté correcta en `.env.local`
- Asegúrate de que tu IP esté permitida en Neon

### Error: API-Football 401 Unauthorized
- Verifica que `API_FOOTBALL_KEY` sea correcta
- Revisa que no hayas excedido el límite de requests

### Error: Prisma Client no generado
```bash
npx prisma generate
```

### Limpiar cache de Redis
```typescript
// En consola de Upstash o mediante código
await redis.flushall()
```

## 📈 Analytics y Monitoreo

### Google Analytics 4
- Dashboard en [analytics.google.com](https://analytics.google.com)
- Eventos personalizados configurados:
  - `view_match` - Ver detalle de partido
  - `play_video` - Reproducir video de gol
  - `filter_league` - Filtrar por liga
  - `change_date` - Cambiar fecha en fixtures

### Vercel Analytics
- Performance metrics en el dashboard de Vercel
- Web Vitals automáticos

### Logs de API
Revisa el uso de API-Football en tu base de datos:
```sql
SELECT endpoint, COUNT(*), AVG(responseTime)
FROM ApiLog
WHERE createdAt >= NOW() - INTERVAL '1 day'
GROUP BY endpoint;
```

## 🤝 Contribuir

Las contribuciones son bienvenidas:

1. Fork el proyecto
2. Crea una rama (`git checkout -b feature/nueva-feature`)
3. Commit tus cambios (`git commit -m 'Add nueva feature'`)
4. Push a la rama (`git push origin feature/nueva-feature`)
5. Abre un Pull Request

## 📝 Licencia

Este proyecto está bajo la licencia MIT. Ver archivo `LICENSE` para más detalles.

## 🔗 Links Útiles

- [Next.js Documentation](https://nextjs.org/docs)
- [Prisma Documentation](https://www.prisma.io/docs)
- [API-Football Docs](https://www.api-football.com/documentation-v3)
- [Scorebat API Docs](https://www.scorebat.com/video-api/)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [SWR Documentation](https://swr.vercel.app)

## 🙋 Soporte

Si tienes preguntas o necesitas ayuda:
- Abre un [Issue](https://github.com/tu-usuario/futbol-app/issues)
- Consulta la [Wiki](https://github.com/tu-usuario/futbol-app/wiki)

---

Hecho con ⚽ y ❤️
