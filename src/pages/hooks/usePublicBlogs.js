// src/hooks/usePublicBlogs.js
import { useState, useEffect, useMemo } from 'react';
import { BlogService } from '../../service/BlogService';

const blogService = new BlogService();

export const usePublicBlogs = () => {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('Todas');

  useEffect(() => {
    blogService.getPublicBlogs()
      .then(setBlogs)
      .finally(() => setLoading(false));
  }, []);

  const categories = useMemo(() => 
    ['Todas', ...new Set(blogs.map(b => b.categoria))], 
  [blogs]);

  const filteredBlogs = useMemo(() => {
    if (activeCategory === 'Todas') return blogs;
    return blogs.filter(b => b.categoria === activeCategory);
  }, [blogs, activeCategory]);

  return { loading, activeCategory, setActiveCategory, categories, filteredBlogs };
};