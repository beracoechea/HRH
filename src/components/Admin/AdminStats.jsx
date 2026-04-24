import React, { useMemo } from 'react';
import { 
  FiTrendingUp, FiCheckCircle, FiPieChart, 
  FiCalendar, FiDollarSign, FiActivity, FiBarChart2, FiLayers,
  FiRefreshCw, FiDatabase
} from 'react-icons/fi';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, 
  ResponsiveContainer, PieChart, Pie, Cell, Legend, AreaChart, Area
} from 'recharts';
import '../../assets/styles/AdminStats.css';
import { normalizeCreditData, getExpectedMonthlyPayment } from '../../utils/creditNormalization';

import { ProcessTimeline } from './ProcessTimeline';

export const AdminStats = ({ creditos = [], usuarios = [], citas = [], ingresosReales = [] }) => {
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(false);

  const metrics = useMemo(() => {
    // ... (existing metrics logic stays the same)
    
    const tieneDatos = Array.isArray(ingresosReales) && ingresosReales.length > 0;
    
    // 2. Cálculos Financieros
    const activos = creditos.filter(c => c.estado === 'activo' || c.estado === 'atrasado');
    
    // Los pagos son dinámicos - Calculamos lo esperado para el MES ACTUAL basándonos en la amortización
    const totals = activos.reduce((acc, curr) => {
        const projection = getExpectedMonthlyPayment(curr);
        return {
            q1: acc.q1 + projection.q1,
            q2: acc.q2 + projection.q2,
            faseA: acc.faseA + projection.faseA,
            faseB: acc.faseB + projection.faseB
        };
    }, { q1: 0, q2: 0, faseA: 0, faseB: 0 });

    const totalQ1Val = totals.q1;
    const totalQ2Val = totals.q2;
    const mensualidadesVal = totalQ1Val + totalQ2Val;
    
    // Totales nominales para referencia en tarjetas
    const totalFaseA = totals.faseA;
    const totalFaseB = totals.faseB;
    
    const dataIngresos = tieneDatos 
      ? ingresosReales.map(item => ({
          mes: item.mes,
          monto: Number(item.monto) || 0,
          estimado: mensualidadesVal // Línea de referencia del objetivo mensual actual
        }))
      : [];

    const totalPrestadoVal = creditos
        .filter(c => c.estado === 'activo' || c.estado === 'finalizado' || c.estado === 'atrasado')
        .reduce((acc, curr) => acc + parseFloat(curr.monto_solicitado || 0), 0);

    const totalRecaudadoVal = creditos.reduce((acc, curr) => acc + (Number(curr.pagado) || 0), 0);

    // 3. Distribución por Categoría 
    const personalCount = creditos.filter(c => parseFloat(c.monto_solicitado) <= 50000 && (c.estado === 'activo' || c.estado === 'atrasado')).length;
    const autoCount = creditos.filter(c => parseFloat(c.monto_solicitado) > 50000 && (c.estado === 'activo' || c.estado === 'atrasado')).length;

    // 4. Estatus Operativo (Bar Chart)
    const estadosData = [
      { name: 'Activos', value: activos.length, color: '#10b981' },
      { name: 'Pendientes', value: creditos.filter(c => c.estado === 'pendiente').length, color: '#f59e0b' },
      { name: 'Finalizados', value: creditos.filter(c => c.estado === 'finalizado').length, color: '#3b82f6' },
      { name: 'Rechazados', value: creditos.filter(c => c.estado === 'rechazado').length, color: '#ef4444' },
    ];

    return {
      totalPrestado: totalPrestadoVal,
      mensualidadesEstimadas: mensualidadesVal,
      totalQ1: totalQ1Val,
      totalQ2: totalQ2Val,
      totalRecaudado: totalRecaudadoVal,
      totalFaseA,
      totalFaseB,
      tasaAprobacion: creditos.length > 0 ? ((activos.length / creditos.length) * 100).toFixed(1) : 0,
      carteraData: [
        { name: 'Personal', value: personalCount, color: '#159082' },
        { name: 'Automotriz', value: autoCount, color: '#094c5b' },
      ],
      historialIngresos: dataIngresos,
      estadosData
    };
  }, [creditos, ingresosReales]);

  return (
    <div className="admin-stats-container animate-fade">
      <div className="stats-header">
        <div>
          <h1>Análisis de Cartera y Recaudación</h1>
          <p>Métricas consolidadas basadas en pagos reales.</p>
        </div>
        <div className="header-actions" style={{ display: 'flex', gap: '10px' }}>
          <div className="quick-badge" onClick={() => setIsSidebarOpen(true)} style={{ cursor: 'pointer' }}>
            <FiActivity /> Ver Línea de Tiempo
          </div>
        </div>
      </div>

      <div className="stats-grid">
        <div className="stat-card gold">
          <div className="stat-icon"><FiTrendingUp /></div>
          <div className="stat-content">
            <span className="stat-label">Capital Activo</span>
            <h2 className="stat-value">${metrics.totalPrestado.toLocaleString()}</h2>
            <small>Dinero en circulación</small>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon emerald"><FiDollarSign /></div>
          <div className="stat-content">
            <span className="stat-label">Recaudación Proyectada</span>
            <h2 className="stat-value">${metrics.mensualidadesEstimadas.toLocaleString()}</h2>
            <div className="stat-sub-grid">
              <small title="Suma de cuotas Fase A">Fase A: ${metrics.totalFaseA.toLocaleString()}</small>
              <small title="Suma de cuotas Fase B">Fase B: ${metrics.totalFaseB.toLocaleString()}</small>
            </div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon blue"><FiCheckCircle /></div>
          <div className="stat-content">
            <span className="stat-label">Expedientes</span>
            <h2 className="stat-value">{creditos.length}</h2>
            <small>{usuarios.length} clientes totales</small>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon orange"><FiCalendar /></div>
          <div className="stat-content">
            <span className="stat-label">Citas del Sistema</span>
            <h2 className="stat-value">{citas.length}</h2>
            <small>Histórico total</small>
          </div>
        </div>
      </div>

      <div className="charts-main-grid">
        {/* GRÁFICO DE ÁREA - FLUJO DE INGRESOS */}
        <div className="chart-card full-width">
          <div className="chart-header-group">
            <h3><FiBarChart2 /> Flujo de Ingresos Mensuales Registrados</h3>
            <p className="chart-subtitle">Histórico de cobranza real recibida vía tesorería</p>
          </div>
          
          {metrics.historialIngresos.length === 0 ? (
            <div className="no-data-placeholder">
              <FiDollarSign className="placeholder-icon" />
              <p>No hay registros de pagos recientes para generar la gráfica.</p>
              <small>Los nuevos abonos registrados aparecerán aquí en tiempo real.</small>
            </div>
          ) : (
            <div style={{ width: '100%', height: 300, minHeight: 300 }}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={metrics.historialIngresos}>
                  <defs>
                    <linearGradient id="colorMonto" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#159082" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#159082" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis 
                    dataKey="mes" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{fill: '#64748b', fontSize: 12}} 
                  />
                  <YAxis 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{fill: '#64748b', fontSize: 12}}
                    tickFormatter={(value) => `$${value}`}
                  />
                  <Tooltip 
                    formatter={(value) => [`$${value.toLocaleString()}`, 'Recaudado']}
                    contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px rgba(0,0,0,0.1)'}} 
                  />
                  <Area 
                    type="monotone" 
                    dataKey="estimado" 
                    stroke="#94a3b8" 
                    strokeDasharray="5 5"
                    fill="transparent"
                    strokeWidth={2} 
                    name="Meta Proyectada"
                  />
                  <Area 
                    type="monotone" 
                    dataKey="monto" 
                    stroke="#159082" 
                    fillOpacity={1} 
                    fill="url(#colorMonto)" 
                    strokeWidth={3} 
                    name="Recaudado Real"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* --- BLOQUE DE RESUMEN BAJO LA GRÁFICA --- */}
          <div className="chart-summary-footer">
            <div className="summary-item">
              <div className="summary-info">
                <span className="summary-label">Proyección Quincenal (Q1 / Q2)</span>
                <span className="summary-monto">${metrics.totalQ1.toLocaleString()} / ${metrics.totalQ2.toLocaleString()}</span>
              </div>
              <small>Monto esperado para cada periodo de corte</small>
            </div>
            
            <div className="summary-divider"></div>

            <div className="summary-item main">
              <div className="summary-info">
                <span className="summary-label">Pagos Realizados Totales</span>
                <span className="summary-monto highlight">${metrics.totalRecaudado.toLocaleString()}</span>
              </div>
              <small>Suma histórica de cobranza confirmada</small>
            </div>
          </div>
        </div>

        {/* PIE CHART - COMPOSICIÓN */}
        <div className="chart-card">
          <h3><FiPieChart /> Composición de Cartera</h3>
          <div style={{ width: '100%', height: 250 }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie 
                  data={metrics.carteraData} 
                  innerRadius={60} 
                  outerRadius={80} 
                  paddingAngle={5} 
                  dataKey="value"
                >
                  {metrics.carteraData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend verticalAlign="bottom" height={36}/>
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* BAR CHART - ESTATUS */}
        <div className="chart-card">
          <h3><FiLayers /> Estatus Operativo</h3>
          <div style={{ width: '100%', height: 250, minHeight: 250, minWidth: 0 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart layout="vertical" data={metrics.estadosData} margin={{ left: 20 }}>
                <XAxis type="number" hide />
                <YAxis 
                  dataKey="name" 
                  type="category" 
                  axisLine={false} 
                  tickLine={false} 
                  width={80} 
                  tick={{fontSize: 12}}
                />
                <Tooltip cursor={{fill: 'transparent'}} />
                <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={20}>
                  {metrics.estadosData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* RENDERIZADO DEL SIDEBAR */}
      <ProcessTimeline 
        creditos={creditos} 
        isOpen={isSidebarOpen} 
        onClose={() => setIsSidebarOpen(false)} 
      />
    </div>
  );
};