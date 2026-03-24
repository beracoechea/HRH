import React, { useState } from 'react';
import { 
    FiSave, FiEye, FiEyeOff, FiLink, FiImage, FiSettings, 
    FiUser, FiExternalLink, FiPlus, FiList, FiEdit, FiCalendar, FiType
} from 'react-icons/fi';
import { useBlogs } from '../hooks/useBlogs';
import { StatusModal } from '../../components/Common/StatusModal';
import '../../assets/styles/PageConfig.css';

export const PageConfig = () => {
    const [activeTab, setActiveTab] = useState('list'); // 'list' o 'form'
    const [editingId, setEditingId] = useState(null);
    const { blogs, status, saveBlog, closeStatus } = useBlogs();

    const [formData, setFormData] = useState({
        titulo: '', 
        categoria: 'Finanzas', 
        fecha_publicacion: '',
        subido_por: '', 
        descripcion: '', 
        link_consulta: '',
        imagen_url: '', 
        activa: true
    });

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData({ ...formData, [name]: type === 'checkbox' ? checked : value });
    };

    const handleEdit = (blog) => {
        setFormData({
            ...blog,
            fecha_publicacion: blog.fecha_publicacion ? blog.fecha_publicacion.split('T')[0] : ''
        });
        setEditingId(blog.id);
        setActiveTab('form');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const success = await saveBlog(formData, editingId);
        if (success) {
            resetForm();
            setTimeout(() => setActiveTab('list'), 1800);
        }
    };

    const resetForm = () => {
        setEditingId(null);
        setFormData({ 
            titulo: '', categoria: 'Finanzas', fecha_publicacion: '', 
            subido_por: '', descripcion: '', link_consulta: '', 
            imagen_url: '', activa: true 
        });
    };

    return (
        <div className="config-container">
            <header className="config-header">
                <div className="header-title">
                    <FiSettings className="main-icon" />
                    <div>
                        <h1>Gestión de Contenido</h1>
                        <p>Administra los blogs y noticias de la plataforma</p>
                    </div>
                </div>
                <div className="tab-buttons">
                    <button 
                        className={activeTab === 'list' ? 'active' : ''} 
                        onClick={() => setActiveTab('list')}
                    >
                        <FiList /> Listado
                    </button>
                    <button 
                        className={activeTab === 'form' ? 'active' : ''} 
                        onClick={() => { resetForm(); setActiveTab('form'); }}
                    >
                        <FiPlus /> {editingId ? 'Editando' : 'Nuevo Blog'}
                    </button>
                </div>
            </header>

            {activeTab === 'list' ? (
                <div className="blogs-table-container animate-fade">
                    <table className="admin-table">
                        <thead>
                            <tr>
                                <th>Título</th>
                                <th>Categoría</th>
                                <th>Autor</th>
                                <th>Estado</th>
                                <th>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {blogs.length > 0 ? blogs.map(blog => (
                                <tr key={blog.id}>
                                    <td className="td-title">{blog.titulo}</td>
                                    <td><span className="table-badge">{blog.categoria}</span></td>
                                    <td>{blog.subido_por || 'Admin'}</td>
                                    <td>
                                        {blog.activa ? 
                                            <span className="status-pill online"><FiEye /> Público</span> : 
                                            <span className="status-pill offline"><FiEyeOff /> Borrador</span>
                                        }
                                    </td>
                                    <td className="table-actions">
                                        <button onClick={() => handleEdit(blog)} className="btn-edit">
                                            <FiEdit />
                                        </button>
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan="5" style={{ textAlign: 'center', padding: '2rem', color: '#64748b' }}>
                                        No hay publicaciones disponibles.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            ) : (
                <div className="config-grid animate-fade">
                    <form className="blog-form" onSubmit={handleSubmit}>
                        <h2>{editingId ? 'Modificar Publicación' : 'Crear Nueva Noticia'}</h2>
                        
                        <div className="input-group">
                            <label><FiType /> Título</label>
                            <input 
                                name="titulo" 
                                value={formData.titulo} 
                                onChange={handleChange} 
                                required 
                                placeholder="Ej: Guía de ahorro 2026" 
                            />
                        </div>

                        <div className="form-row three-cols">
                            <div className="input-group">
                                <label>Categoría</label>
                                <select name="categoria" value={formData.categoria} onChange={handleChange}>
                                    <option value="Finanzas">Finanzas</option>
                                    <option value="Noticias">Noticias</option>
                                    <option value="Tutorial">Tutorial</option>
                                    <option value="Institucional">Institucional</option>
                                </select>
                            </div>
                            <div className="input-group">
                                <label><FiCalendar /> Fecha</label>
                                <input 
                                    type="date" 
                                    name="fecha_publicacion" 
                                    value={formData.fecha_publicacion} 
                                    onChange={handleChange} 
                                    required 
                                />
                            </div>
                            <div className="input-group">
                                <label><FiUser /> Autor</label>
                                <input 
                                    name="subido_por" 
                                    value={formData.subido_por} 
                                    onChange={handleChange} 
                                    placeholder="Nombre" 
                                />
                            </div>
                        </div>

                        <div className="form-row">
                            <div className="input-group">
                                <label><FiImage /> URL Imagen de Portada</label>
                                <input 
                                    name="imagen_url" 
                                    value={formData.imagen_url} 
                                    onChange={handleChange} 
                                    placeholder="https://images.unsplash.com/..." 
                                />
                            </div>
                            <div className="input-group">
                                <label><FiLink /> Link de Consulta</label>
                                <input 
                                    name="link_consulta" 
                                    value={formData.link_consulta} 
                                    onChange={handleChange} 
                                    placeholder="https://ejemplo.com/noticia" 
                                />
                            </div>
                        </div>

                        <div className="input-group">
                            <label>Descripción del Contenido</label>
                            <textarea 
                                name="descripcion" 
                                value={formData.descripcion} 
                                onChange={handleChange} 
                                rows="5" 
                                placeholder="Escribe aquí el cuerpo de la noticia..."
                            ></textarea>
                        </div>

                        <div className="form-footer">
                            <div className="checkbox-group">
                                <label className="switch">
                                    <input 
                                        type="checkbox" 
                                        name="activa" 
                                        checked={formData.activa} 
                                        onChange={handleChange} 
                                    />
                                    <span className="slider"></span>
                                </label>
                                <span className="switch-label">
                                    {formData.activa ? "Publicación Activa" : "Borrador (Oculto)"}
                                </span>
                            </div>
                            <button type="submit" className="save-blog-btn">
                                <FiSave /> {editingId ? 'Guardar Cambios' : 'Publicar Ahora'}
                            </button>
                        </div>
                    </form>

                    <div className="preview-container">
                        <div className="sticky-preview">
                            <h3>Vista Previa del Cliente</h3>
                            <div className="blog-preview-card">
                                <div className="preview-badge">{formData.categoria}</div>
                                {formData.imagen_url ? (
                                    <img src={formData.imagen_url} alt="Portada" className="preview-img" />
                                ) : (
                                    <div className="no-image">
                                        <FiImage size={40} /> 
                                        <p>Sin imagen seleccionada</p>
                                    </div>
                                )}
                                <div className="preview-content">
                                    <small className="preview-date">
                                        {formData.fecha_publicacion || 'AAAA-MM-DD'}
                                    </small>
                                    <h3>{formData.titulo || 'Título de ejemplo'}</h3>
                                    <p>
                                        {formData.descripcion || 'Aquí se verá el resumen de tu contenido una vez que empieces a escribir...'}
                                    </p>
                                    <div className="preview-footer-info">
                                        <span><FiUser /> {formData.subido_por || 'Autor'}</span>
                                        {formData.link_consulta && (
                                            <div className="preview-link-btn">
                                                Ver noticia <FiExternalLink />
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <StatusModal 
                isOpen={status.open} 
                type={status.type} 
                message={status.message} 
                onClose={closeStatus} 
            />
        </div>
    );
};