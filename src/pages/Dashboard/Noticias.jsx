import React from 'react';
import { FiCalendar, FiUser, FiArrowRight, FiInfo, FiFilter } from 'react-icons/fi';
import { usePublicBlogs } from '../hooks/usePublicBlogs';
import '../../assets/styles/Noticias.css';
import { FooterSection } from './components/FooterSection';

export const Noticias = () => {
    const { 
        loading, 
        activeCategory, 
        setActiveCategory, 
        categories, 
        filteredBlogs 
    } = usePublicBlogs();

    if (loading) return (
        <div className="loader-container">
            <div className="spinner-brand"></div>
            <p>Cargando educación financiera...</p>
        </div>
    );

    return (
        <div className="noticias-page">
            <header className="noticias-header">
                <h1>Centro de Noticias</h1>                
                
                {/* FILTROS POR CATEGORÍA */}
                <div className="filter-wrapper">
                    <FiFilter className="filter-icon" />
                    <div className="filter-container">
                        {categories.map(cat => (
                            <button 
                                key={cat}
                                className={`filter-btn ${activeCategory === cat ? 'active' : ''}`}
                                onClick={() => setActiveCategory(cat)}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>
                </div>
            </header>

            {filteredBlogs.length > 0 ? (
                <div className="noticias-grid">
                    {filteredBlogs.map(blog => (
                        <article key={blog.id} className="news-card">
                            <div className="news-image-container">
                                <img 
                                    src={blog.imagen_url || 'https://via.placeholder.com/400x250?text=CrediGO+News'} 
                                    alt={blog.titulo} 
                                />
                                <div className="news-badge">{blog.categoria}</div>
                            </div>
                            
                            <div className="news-body">
                                <div className="news-meta">
                                    <span className="meta-item">
                                        <FiCalendar /> {new Date(blog.fecha_publicacion).toLocaleDateString()}
                                    </span>
                                    <span className="meta-item">
                                        <FiUser /> {blog.subido_por || 'Redacción CrediGO'}
                                    </span>
                                </div>
                                
                                <h2>{blog.titulo}</h2>
                                <p>{blog.descripcion?.substring(0, 110)}...</p>
                                
                                {blog.link_consulta && (
                                    <a 
                                        href={blog.link_consulta} 
                                        target="_blank" 
                                        rel="noopener noreferrer" 
                                        className="news-cta"
                                    >
                                        Seguir leyendo <FiArrowRight className="cta-icon" />
                                    </a>
                                )}
                            </div>
                        </article>
                    ))}
                </div>
            ) : (
                <div className="no-news-container">
                    <FiInfo size={48} color="var(--secondary-color)" />
                    <h3>No hay noticias en esta categoría</h3>
                    <p>Prueba seleccionando otra categoría o vuelve más tarde.</p>
                    <button className="reset-btn" onClick={() => setActiveCategory('Todas')}>
                        Ver todas
                    </button>
                </div>
            )}

            <FooterSection />
        </div>
    );
};