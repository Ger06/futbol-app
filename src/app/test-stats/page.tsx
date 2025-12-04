import { StatsPanel, StatsPanelCompact } from '@/matches/components'

/**
 * Página de prueba temporal para testear los componentes de estadísticas
 *
 * Acceder a: http://localhost:3000/test-stats
 *
 * Esta página debe eliminarse después del testing
 */
export default function TestStatsPage() {
  return (
    <div className="container mx-auto py-8 px-4 space-y-8">
      <div>
        <h1 className="text-2xl font-bold mb-2">Test: Componentes de Estadísticas</h1>
        <p className="text-gray-600 text-sm mb-6">
          Prueba de los componentes StatsPanel y StatsPanelCompact
        </p>
      </div>

      <div className="space-y-8">
        <div>
          <h2 className="text-lg font-semibold mb-3">Test 1: StatsPanel (Match ID 2)</h2>
          <StatsPanel matchId={2} matchStatus="FT" />
        </div>

        <div>
          <h2 className="text-lg font-semibold mb-3">Test 2: StatsPanelCompact (Match ID 2)</h2>
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <StatsPanelCompact matchId={2} matchStatus="FT" />
          </div>
        </div>

        <div>
          <h2 className="text-lg font-semibold mb-3">Test 3: Match ID 999 (No existe - Error handling)</h2>
          <StatsPanel matchId={999} />
        </div>
      </div>

      <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded">
        <h3 className="font-semibold text-blue-900 mb-2">Instrucciones de testing:</h3>
        <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
          <li>Test 1 debe mostrar el panel completo de estadísticas con título</li>
          <li>Test 2 debe mostrar la versión compacta sin título</li>
          <li>Test 3 debe mostrar un mensaje de error amigable</li>
          <li>Verificar estados de carga (skeleton)</li>
          <li>Verificar que los valores se muestran correctamente en barras y tarjetas</li>
          <li>Verificar que no hay errores en la consola del navegador</li>
        </ul>
      </div>
    </div>
  )
}
