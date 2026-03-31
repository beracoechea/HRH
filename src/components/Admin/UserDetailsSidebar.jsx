import React, { useState } from 'react';
import { 
    FiX, FiUser, FiMail, FiShield, FiFileText, 
    FiCheckCircle, FiInfo, FiEdit, FiUpload, FiDownload, FiTrash2, FiRefreshCw, FiActivity,
    FiDollarSign, FiCalendar
} from 'react-icons/fi';
import { CREDIT_STEPS } from '../../constants/creditSteps';
import { formatMoney } from '../../utils/creditCalculations';
import { useAdminUserActions } from '../../pages/hooks/useAdminUserActions';
import { StatusModal } from '../Common/StatusModal';
import '../../assets/styles/UserDetailsSidebar.css';

export const UserDetailsSidebar = ({ isOpen, user, creditos = [], citas = [], onUpdateRole, onClose }) => {
  const [activeTab, setActiveTab] = useState('kyc');
  const [editingRole, setEditingRole] = useState(false);
  const fileInputRef = React.useRef();

  const { uploadUserDoc, uploading, actionStatus, closeActionStatus } = useAdminUserActions(onUpdateRole);

  if (!user) return null;

  // Filtrar datos específicos de este usuario
  const userCreditos = creditos.filter(c => c.usuario_id === user.id);
  const userCitas = citas.filter(c => c.usuario_id === user.id);
  
  // Crédito activo para la fase (último creado)
  const lastCredit = userCreditos[0]; 

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    const docName = prompt("Nombre del documento (ej: Comprobante de ingresos):", file.name);
    if (docName) {
        await uploadUserDoc(user.id, file, docName);
    }
    e.target.value = '';
  };

  const getRoleClass = (rol) => {
    const roles = {
      admin: 'role-admin',
      aprobador: 'role-aprobador',
      tesorero: 'role-tesorero',
      marketing: 'role-marketing',
      cliente: 'role-cliente'
    };
    return roles[rol?.toLowerCase()] || 'role-cliente';
  };

  const formatFecha = (ts) => {
    if (!ts) return 'N/A';
    const date = ts.toDate ? ts.toDate() : new Date(ts);
    return date.toLocaleDateString();
  };

  return (
    <>
      <div className={`sidebar-overlay ${isOpen ? 'active' : ''}`} onClick={onClose} />
      
      <div className={`user-details-sidebar ${isOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <div className="user-profile-header">
            <div className="sidebar-avatar">
              {user.email?.charAt(0).toUpperCase()}
            </div>
            <div className="user-header-text">
              <h3>{user.nombre || 'Usuario HRH'}</h3>
              <p>{user.email}</p>
            </div>
          </div>
          <button className="btn-close-sidebar" onClick={onClose}><FiX /></button>
        </div>

        <div className="sidebar-tabs">
          <button 
            className={`tab-item ${activeTab === 'kyc' ? 'active' : ''}`} 
            onClick={() => setActiveTab('kyc')}
          >
            KYC
          </button>
          <button 
            className={`tab-item ${activeTab === 'creditos' ? 'active' : ''}`} 
            onClick={() => setActiveTab('creditos')}
          >
            Créditos
          </button>
          <button 
            className={`tab-item ${activeTab === 'citas' ? 'active' : ''}`} 
            onClick={() => setActiveTab('citas')}
          >
            Citas
          </button>
          <button 
            className={`tab-item ${activeTab === 'expediente' ? 'active' : ''}`} 
            onClick={() => setActiveTab('expediente')}
          >
            Archivos
          </button>
          <button 
            className={`tab-item ${activeTab === 'proceso' ? 'active' : ''}`} 
            onClick={() => setActiveTab('proceso')}
          >
            Fase
          </button>
        </div>

        <div className="sidebar-body">
          {activeTab === 'kyc' && (
            <div className="tab-pane animate-fade">
              <section className="info-section">
                <div className="section-title">
                  <FiShield /> <span>Permisos y Rol</span>
                  {!editingRole && <button onClick={() => setEditingRole(true)} className="btn-edit-mini"><FiEdit /></button>}
                </div>
                <div className="role-management-box">
                  {editingRole ? (
                    <div className="role-edit-group">
                      <select 
                        defaultValue={user.rol || 'cliente'}
                        className="select-role-sidebar"
                        onChange={(e) => {
                          onUpdateRole(user.id, user.email, e.target.value);
                          setEditingRole(false);
                        }}
                      >
                        <option value="cliente">Cliente</option>
                        <option value="marketing">Marketing</option>
                        <option value="tesorero">Tesorero</option>
                        <option value="aprobador">Aprobador</option>
                        <option value="admin">Administrador</option>
                      </select>
                      <button onClick={() => setEditingRole(false)} className="btn-cancel-edit">Cancelar</button>
                    </div>
                  ) : (
                    <span className={`role-badge-sidebar ${getRoleClass(user.rol)}`}>
                      {(user.rol || 'cliente').toUpperCase()}
                    </span>
                  )}
                </div>
              </section>

              <section className="info-section">
                <div className="section-title"><FiUser /> <span>Datos del Cliente</span></div>
                <div className="data-grid">
                  <div className="data-item">
                    <label>Teléfono</label>
                    <span>{user.telefono || 'No registrado'}</span>
                  </div>
                  <div className="data-item">
                    <label>ID Usuario</label>
                    <code className="code-id">{user.id}</code>
                  </div>
                </div>
              </section>

              {user.kyc && (
                <section className="info-section kyc-data">
                  <div className="section-title"><FiCheckCircle color="var(--primary-color)" /> <span>Información KYC</span></div>
                  <div className="kyc-details">
                    <div className="data-item full">
                      <label>Tipo de Crédito Interesado</label>
                      <span className="kyc-value">{user.kyc.tipoCredito || 'Desconocido'}</span>
                    </div>
                    <div className="data-item">
                      <label>Ingresos Mensuales</label>
                      <span className="kyc-value">{formatMoney(user.kyc.ingresos)}</span>
                    </div>
                    <div className="data-item">
                      <label>Estatus Laboral</label>
                      <span className="kyc-value">{user.kyc.estatusLaboral || 'No definido'}</span>
                    </div>
                  </div>
                </section>
              )}
            </div>
          )}

          {activeTab === 'creditos' && (
            <div className="tab-pane animate-fade">
              <div className="sidebar-list-header">
                <h4>Historial de Créditos ({userCreditos.length})</h4>
              </div>
              <div className="sidebar-list">
                {userCreditos.length > 0 ? (
                  userCreditos.map(c => (
                    <div key={c.id} className="sidebar-list-item">
                      <div className="item-main">
                        <span className="item-title">{c.tipo_credito}</span>
                        <span className="item-amount">{formatMoney(c.monto_solicitado)}</span>
                      </div>
                      <div className="item-footer">
                        <span className={`item-badge ${c.estado}`}>{c.estado}</span>
                        <span className="item-date">{formatFecha(c.createdAt)}</span>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="empty-state">No hay créditos registrados.</p>
                )}
              </div>
            </div>
          )}

          {activeTab === 'citas' && (
            <div className="tab-pane animate-fade">
              <div className="sidebar-list-header">
                <h4>Citas Solicitadas ({userCitas.length})</h4>
              </div>
              <div className="sidebar-list">
                {userCitas.length > 0 ? (
                  userCitas.map(cita => (
                    <div key={cita.id} className="sidebar-list-item">
                      <div className="item-main">
                        <span className="item-title">{cita.motivo || 'Cita de Asesoría'}</span>
                        <span className={`item-badge ${cita.estatus}`}>{cita.estatus}</span>
                      </div>
                      <div className="item-footer">
                        <span className="item-date">{cita.fecha} - {cita.hora}</span>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="empty-state">No hay citas registradas.</p>
                )}
              </div>
            </div>
          )}

          {activeTab === 'expediente' && (
            <div className="tab-pane animate-fade">
              <div className="expediente-header">
                <h4>Expediente Digital</h4>
                <button 
                  className="btn-add-file"
                  disabled={uploading}
                  onClick={() => fileInputRef.current.click()}
                >
                  {uploading ? <FiRefreshCw className="spinner" /> : <FiUpload />} 
                  {uploading ? 'Subiendo...' : 'Añadir Archivo'}
                </button>
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  style={{ display: 'none' }} 
                  onChange={handleFileChange} 
                />
              </div>

              <div className="doc-list-sidebar">
                <h5 className="sub-section-title">Documentos de Perfil</h5>
                {user.expediente?.length > 0 ? (
                  user.expediente.map((doc, idx) => (
                    <div key={idx} className="doc-file-item">
                      <div className="doc-file-info">
                        <FiFileText className="icon-doc" />
                        <div className="doc-file-meta">
                          <span className="doc-name">{doc.nombre}</span>
                          <span className={`doc-status ${doc.estatus?.toLowerCase()}`}>{doc.estatus}</span>
                        </div>
                      </div>
                      <div className="doc-file-actions">
                        {doc.url && <a href={doc.url} target="_blank" rel="noopener noreferrer"><FiDownload /></a>}
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="empty-state-mini">Sin documentos de perfil.</p>
                )}

                {lastCredit && lastCredit.expediente && (
                  <>
                    <h5 className="sub-section-title" style={{ marginTop: '1.5rem' }}>Documentos del Último Crédito</h5>
                    {lastCredit.expediente.map((doc, idx) => (
                      <div key={idx} className="doc-file-item">
                        <div className="doc-file-info">
                          <FiFileText className="icon-doc credit-doc" />
                          <div className="doc-file-meta">
                            <span className="doc-name">{doc.nombre || doc.tipo_documento}</span>
                            <span className={`doc-status ${doc.estatus?.toLowerCase()}`}>{doc.estatus}</span>
                          </div>
                        </div>
                        <div className="doc-file-actions">
                          {doc.url && <a href={doc.url} target="_blank" rel="noopener noreferrer"><FiDownload /></a>}
                        </div>
                      </div>
                    ))}
                  </>
                )}
              </div>
            </div>
          )}

          {activeTab === 'proceso' && (
            <div className="tab-pane animate-fade">
              <div className="process-info-box" style={{ marginBottom: '1rem', padding: '1rem', background: 'var(--highlight)', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <FiActivity />
                <div style={{ flex: 1 }}>
                    <span style={{ fontSize: '0.9rem', fontWeight: 600, display: 'block' }}>Ciclo de Vida (8 Pasos)</span>
                    <small>Gestiona el avance del crédito</small>
                </div>
              </div>

              {/* Selector de Fase Directo */}
              <div className="phase-selector-admin" style={{ marginBottom: '2rem' }}>
                <label style={{ fontSize: '0.8rem', fontWeight: 700, marginBottom: '8px', display: 'block' }}>FORZAR CAMBIO DE FASE:</label>
                <select 
                    className="select-role-sidebar"
                    value={user.faseActual || (lastCredit?.fase) || 1}
                    onChange={(e) => {
                        onUpdateRole(user.id, user.email, user.rol, e.target.value);
                    }}
                >
                    {CREDIT_STEPS.map(s => (
                        <option key={s.id} value={s.id}>Paso {s.id}: {s.label}</option>
                    ))}
                </select>
              </div>

              <div className="mini-stepper">
                {CREDIT_STEPS.map((step) => {
                    const currentFase = user.faseActual || (lastCredit?.fase) || 1;
                    const isCompleted = currentFase > step.id;
                    const isActive = currentFase === step.id;
                    return (
                        <div key={step.id} className={`mini-step ${isCompleted ? 'completed' : ''} ${isActive ? 'active' : ''}`}>
                            <div className="mini-step-icon">
                                {isCompleted ? <FiCheckCircle /> : step.icon}
                            </div>
                            <div className="mini-step-text">
                                <span className="mini-step-label">{step.label}</span>
                                {isActive && <p className="mini-step-desc">{step.description}</p>}
                            </div>
                        </div>
                    );
                })}
              </div>
            </div>
          )}
        </div>

        <div className="sidebar-footer">
          <button className="btn-close-full" onClick={onClose}>Cerrar Detalle</button>
        </div>
      </div>

      <StatusModal 
        isOpen={actionStatus.open}
        type={actionStatus.type}
        message={actionStatus.message}
        onClose={closeActionStatus}
      />
    </>
  );
};
