import React, { useMemo } from 'react';
import { 
  FiTrendingUp, FiCheckCircle, FiPieChart, 
  FiCalendar, FiDollarSign, FiActivity, FiBarChart2, FiLayers
} from 'react-icons/fi';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, 
  ResponsiveContainer, PieChart, Pie, Cell, Legend, AreaChart, Area
} from 'recharts';
import '../../assets/styles/AdminStats.css';

import { ProcessTimeline } from './ProcessTimeline';

export const AdminStats = ({ creditos = [], usuarios = [], citas = [], ingresosReales = [] }) => {
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(false);

  const metrics = useMemo(() => {
    // ... (existing metrics logic stays the same)
    
    const tieneDatos = Array.isArray(ingresosReales) && ingresosReales.length > 0;
    
    const dataIngresos = tieneDatos 
      ? ingresosReales.map(item => ({
          mes: item.mes,
          monto: Number(item.monto) || 0
        }))
      : [];

    // 2. Cálculos Financieros
    const activos = creditos.filter(c => c.estado === 'activo');
    
    const totalPrestadoVal = creditos
        .filter(c => c.estado === 'activo' || c.estado === 'finalizado')
        .reduce((acc, curr) => acc + parseFloat(curr.monto_solicitado || 0), 0);

    const mensualidadesVal = activos
        .reduce((acc, curr) => acc + parseFloat(curr.pago_mensual_ano1 || 0), 0);

    // 3. Distribución por Categoría 
    const personalCount = creditos.filter(c => parseFloat(c.monto_solicitado) <= 50000 && c.estado === 'activo').length;
    const autoCount = creditos.filter(c => parseFloat(c.monto_solicitado) > 50000 && c.estado === 'activo').length;

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
        <div className="quick-badge" onClick={() => setIsSidebarOpen(true)} style={{ cursor: 'pointer' }}>
          <FiActivity /> Ver Línea de Tiempo
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
            <small>Expectativa mensual</small>
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
          <h3><FiBarChart2 /> Flujo de Ingresos Mensuales Registrados</h3>
          
          {metrics.historialIngresos.length === 0 ? (
            <div className="no-data-placeholder">
              <p>No hay registros de pagos en los últimos 6 meses</p>
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
                    contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px rgba(0,0,0,0.1)'}} 
                  />
                  <Area 
                    type="monotone" 
                    dataKey="monto" 
                    stroke="#159082" 
                    fillOpacity={1} 
                    fill="url(#colorMonto)" 
                    strokeWidth={3} 
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}
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