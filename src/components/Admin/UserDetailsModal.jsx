import React, { useState, useEffect } from 'react';
import { 
    FiX, FiUser, FiMail, FiShield, FiFileText, 
    FiCheckCircle, FiInfo, FiEdit, FiUpload, FiDownload, FiRefreshCw, FiActivity,
    FiDollarSign, FiCalendar, FiMapPin, FiPhone, FiBriefcase, FiSave, FiPenTool
} from 'react-icons/fi';
import { CREDIT_STEPS } from '../../constants/creditSteps';
import { formatMoney } from '../../utils/creditCalculations';
import { useAdminUserActions } from '../../pages/hooks/useAdminUserActions';
import { StatusModal } from '../Common/StatusModal';
import '../../assets/styles/UserDetailsModal.css';

export const UserDetailsModal = ({ isOpen, user, creditos = [], citas = [], onUpdateRole, onClose }) => {
  const [activeTab, setActiveTab] = useState('kyc');
  const [editingKYC, setEditingKYC] = useState(false);
  const [editingRole, setEditingRole] = useState(false);
  const [kycForm, setKycForm] = useState({});
  const fileInputRef = React.useRef();
  const signatureInputRef = React.useRef();

  const { uploadUserDoc, updateUserKYC, updateUserPhase, uploading, actionStatus, closeActionStatus } = useAdminUserActions(onUpdateRole);

  useEffect(() => {
    if (user) {
      // Leer de user.kyc (campo denormalizado en el doc principal)
      // o de user directamente si el KYC aún no existe
      setKycForm(user.kyc || {
        nombreCompleto: user.nombre || '',
        telefono: user.telefono || '',
      });
    }
  }, [user]);

  if (!isOpen || !user) return null;

  // Filtrar datos específicos de este usuario
  const userCreditos = creditos.filter(c => c.usuario_id === user.id);
  const userCitas = citas.filter(c => c.usuario_id === user.id);
  
  // Crédito activo para la fase (último creado)
  const lastCredit = userCreditos[0]; 

  const handleFileChange = async (e, isSignature = false) => {
    const file = e.target.files[0];
    if (!file) return;
    
    const docName = prompt(isSignature ? "Nombre del documento a firmar:" : "Nombre del documento:", file.name);
    if (docName) {
        await uploadUserDoc(user.id, file, docName, isSignature);
    }
    e.target.value = '';
  };

  const handleKycChange = (e) => {
    const { name, value } = e.target;
    // No convertir a mayúsculas campos especiales
    const skipUppercase = ['telefono', 'fechaNacimiento', 'ingresos'];
    setKycForm(prev => ({ ...prev, [name]: skipUppercase.includes(name) ? value : value.toUpperCase() }));
  };

  const saveKycEdits = async () => {
    const success = await updateUserKYC(user.id, kycForm);
    if (success) setEditingKYC(false);
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
    <div className="modal-overlay active" onClick={onClose}>
      <div className="user-details-modal animate-pop" onClick={e => e.stopPropagation()}>
        <header className="modal-header">
          <div className="user-info-main">
            <div className="avatar-large">{user.email?.charAt(0).toUpperCase()}</div>
            <div className="user-meta">
              <h2>{user.nombre || 'Usuario HRH'}</h2>
              <span><FiMail /> {user.email}</span>
            </div>
          </div>
          <button className="btn-close-modal" onClick={onClose}><FiX /></button>
        </header>

        <nav className="modal-tabs">
          <button className={`tab-btn ${activeTab === 'kyc' ? 'active' : ''}`} onClick={() => setActiveTab('kyc')}><FiUser /> Perfil & KYC</button>
          <button className={`tab-btn ${activeTab === 'creditos' ? 'active' : ''}`} onClick={() => setActiveTab('creditos')}><FiDollarSign /> Créditos</button>
          <button className={`tab-btn ${activeTab === 'citas' ? 'active' : ''}`} onClick={() => setActiveTab('citas')}><FiCalendar /> Citas</button>
          <button className={`tab-btn ${activeTab === 'expediente' ? 'active' : ''}`} onClick={() => setActiveTab('expediente')}><FiFileText /> Expediente</button>
          <button className={`tab-btn ${activeTab === 'proceso' ? 'active' : ''}`} onClick={() => setActiveTab('proceso')}><FiActivity /> Estado Actual</button>
        </nav>

        <div className="modal-body">
          {activeTab === 'kyc' && (
            <div className="tab-pane animate-fade">
              <div className="kyc-grid-layout">
                {/* Columna Izquierda: Info Básica y Rol */}
                <div className="info-column">
                  <section className="modal-section">
                    <div className="section-title"><FiShield /> <span>Configuración de Usuario</span></div>
                    <div className="role-edit-box">
                       {editingRole ? (
                          <div className="inline-edit">
                            <select 
                              defaultValue={user.rol || 'cliente'}
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
                            <button onClick={() => setEditingRole(false)} className="btn-cancel">Cancelar</button>
                          </div>
                       ) : (
                         <div className="role-display">
                           <span className={`role-badge-large ${getRoleClass(user.rol)}`}>{(user.rol || 'cliente').toUpperCase()}</span>
                           <button onClick={() => setEditingRole(true)} className="btn-edit-round"><FiEdit /></button>
                         </div>
                       )}
                    </div>
                  </section>

                  <section className="modal-section">
                    <div className="section-title"><FiPhone /> <span>Contacto</span></div>
                    <div className="data-row">
                      <label>WhatsApp / Teléfono</label>
                      <p>{user.kyc?.telefono || user.telefono || 'Sin registro'}</p>
                    </div>
                    <div className="data-row">
                      <label>ID de Sistema</label>
                      <code className="system-id">{user.id}</code>
                    </div>
                  </section>
                </div>

                {/* Columna Derecha: Información KYC Detallada */}
                <div className="kyc-column">
                  <section className="modal-section kyc-full-details">
                    <div className="section-title">
                      <FiCheckCircle color="var(--primary-color)" /> 
                      <span>Detalles del KYC</span>
                      {!editingKYC ? (
                        <button className="btn-edit-text" onClick={() => setEditingKYC(true)}><FiEdit /> Editar Información</button>
                      ) : (
                        <button className="btn-save-text" onClick={saveKycEdits}><FiSave /> Guardar Cambios</button>
                      )}
                    </div>

                    <div className="kyc-form-grid">
                      <KycItem label="Nombre Completo" name="nombreCompleto" value={kycForm.nombreCompleto} editing={editingKYC} onChange={handleKycChange} icon={<FiUser />} />
                      <KycItem label="Teléfono / WhatsApp" name="telefono" value={kycForm.telefono} editing={editingKYC} type="tel" onChange={handleKycChange} icon={<FiPhone />} />
                      <KycItem label="CURP" name="curp" value={kycForm.curp} editing={editingKYC} onChange={handleKycChange} icon={<FiFileText />} />
                      <KycItem label="RFC" name="rfc" value={kycForm.rfc} editing={editingKYC} onChange={handleKycChange} icon={<FiFileText />} />
                      <KycItem label="Fecha Nac." name="fechaNacimiento" value={kycForm.fechaNacimiento} editing={editingKYC} type="date" onChange={handleKycChange} icon={<FiCalendar />} />
                      <KycItem label="Ingresos" name="ingresos" value={kycForm.ingresos} editing={editingKYC} type="number" onChange={handleKycChange} icon={<FiDollarSign />} isMoney />
                      <KycItem label="Ocupación" name="ocupacion" value={kycForm.ocupacion} editing={editingKYC} onChange={handleKycChange} icon={<FiBriefcase />} />
                      <KycItem label="Género" name="genero" value={kycForm.genero} editing={editingKYC} onChange={handleKycChange} icon={<FiUser />} />
                    </div>
                    <div className="kyc-full-width">
                      <label><FiMapPin /> Domicilio Completo</label>
                      {editingKYC ? (
                        <textarea name="domicilio" value={kycForm.domicilio} onChange={handleKycChange} rows="2" />
                      ) : (
                        <p className="val">{kycForm.domicilio || 'No especificado'}</p>
                      )}
                    </div>
                  </section>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'creditos' && (
            <div className="tab-pane animate-fade">
              <div className="credits-history-list">
                {userCreditos.length > 0 ? userCreditos.map(c => (
                  <div key={c.id} className="credit-card-mini">
                    <div className="cred-top">
                      <strong>{c.tipo_credito}</strong>
                      <span className={`status-pill ${c.estado}`}>{c.estado}</span>
                    </div>
                    <div className="cred-details">
                      <span>Monto: {formatMoney(c.monto_solicitado)}</span>
                      <span>Fecha: {formatFecha(c.createdAt)}</span>
                    </div>
                  </div>
                )) : <p className="empty-msg">No se han solicitado créditos.</p>}
              </div>
            </div>
          )}

          {activeTab === 'citas' && (
            <div className="tab-pane animate-fade">
              <div className="citas-history-list">
                {userCitas.length > 0 ? userCitas.map(cita => (
                  <div key={cita.id} className="cita-item">
                    <div className="cita-main">
                      <strong>{cita.motivo || 'Cita General'}</strong>
                      <span className={`status-pill ${cita.estatus}`}>{cita.estatus}</span>
                    </div>
                    <p>{cita.fecha} a las {cita.hora}</p>
                  </div>
                )) : <p className="empty-msg">No hay citas registradas.</p>}
              </div>
            </div>
          )}

          {activeTab === 'expediente' && (
            <div className="tab-pane animate-fade">
              <div className="expediente-actions">
                <button className="btn-action-primary" onClick={() => fileInputRef.current.click()} disabled={uploading}>
                  <FiUpload /> {uploading ? 'Subiendo...' : 'Añadir Documento'}
                </button>
                <button className="btn-action-outline" onClick={() => signatureInputRef.current.click()} disabled={uploading}>
                  <FiPenTool /> {uploading ? 'Procesando...' : 'Solicitar Firma'}
                </button>
                <input type="file" ref={fileInputRef} hidden onChange={(e) => handleFileChange(e, false)} />
                <input type="file" ref={signatureInputRef} hidden onChange={(e) => handleFileChange(e, true)} />
              </div>

              <div className="docs-container">
                <h4 className="sub-title">Documentos del Usuario</h4>
                <div className="docs-list">
                   {user.expediente?.map((doc, idx) => (
                     <DocRow key={idx} doc={doc} />
                   )) || <p className="empty-mini">Sin archivos en el perfil.</p>}
                </div>

                {lastCredit && (
                  <>
                    <h4 className="sub-title mt">Documentos del Crédito ({lastCredit.id.slice(-6)})</h4>
                    <div className="docs-list">
                      {lastCredit.expediente?.map((doc, idx) => (
                        <DocRow key={idx} doc={doc} />
                      ))}
                    </div>
                  </>
                )}
              </div>
            </div>
          )}

          {activeTab === 'proceso' && (
            <div className="tab-pane animate-fade">
               <div className="process-header-modal">
                 <FiActivity />
                 <div>
                   <h4>Progreso de Solicitud</h4>
                   <p>Gestión del flujo de 8 pasos</p>
                 </div>
               </div>

               <div className="phase-control">
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', width: '100%' }}>
                    {lastCredit && (lastCredit.fase || 1) < 8 && (
                      <button 
                        className="btn-action-primary" 
                        onClick={() => updateUserPhase(lastCredit.id, (lastCredit.fase || 1) + 1)}
                        style={{ justifyContent: 'center' }}
                      >
                        Validar y Avanzar a Etapa {(lastCredit.fase || 1) + 1}
                      </button>
                    )}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <label>MODIFICAR FASE:</label>
                      <select 
                        value={lastCredit?.fase || 1}
                        onChange={(e) => lastCredit ? updateUserPhase(lastCredit.id, Number(e.target.value)) : null}
                        disabled={!lastCredit}
                      >
                        {CREDIT_STEPS.map(s => <option key={s.id} value={s.id}>Paso {s.id}: {s.label}</option>)}
                      </select>
                    </div>
                  </div>
               </div>

               <div className="stepper-visual">
                  {CREDIT_STEPS.map(step => {
                    const current = lastCredit?.fase || 1;
                    const done = current > step.id;
                    const active = current === step.id;
                    return (
                      <div key={step.id} className={`step-item ${done ? 'done' : ''} ${active ? 'active' : ''}`}>
                        <div className="step-circle">{done ? <FiCheckCircle /> : step.id}</div>
                        <div className="step-content">
                          <span className="step-name">{step.label}</span>
                          {active && <p className="step-desc">{step.description}</p>}
                        </div>
                      </div>
                    );
                  })}
               </div>
            </div>
          )}
        </div>

        <footer className="modal-footer">
          <button className="btn-close-full" onClick={onClose}>Finalizar Revisión</button>
        </footer>
      </div>

      <StatusModal 
        isOpen={actionStatus.open}
        type={actionStatus.type}
        message={actionStatus.message}
        onClose={closeActionStatus}
      />
    </div>
  );
};

const KycItem = ({ label, name, value, editing, type="text", onChange, icon, isMoney }) => (
  <div className="kyc-item">
    <label>{icon} {label}</label>
    {editing ? (
      <input type={type} name={name} value={value || ''} onChange={onChange} />
    ) : (
      <p className="val">{isMoney ? formatMoney(value) : (value || '---')}</p>
    )}
  </div>
);

const DocRow = ({ doc }) => (
  <div className="doc-row">
    <div className="doc-info-mini">
      <FiFileText className={`doc-icon ${doc.requiere_firma ? 'signature-req' : ''}`} />
      <div>
        <span className="name">{doc.nombre}</span>
        <span className={`status ${doc.estatus?.toLowerCase().replace(' ', '_')}`}>{doc.estatus}</span>
      </div>
    </div>
    <div className="doc-actions">
       {doc.url && <a href={doc.url} target="_blank" rel="noopener noreferrer" className="btn-view"><FiDownload /></a>}
    </div>
  </div>
);
