// src/hooks/useBlogs.js
import { useState, useEffect } from 'react';
import { BlogService } from '../../service/BlogService';
import { useFirestoreOperation } from './core/useFirestoreOperation';

const blogService = new BlogService();

export const useBlogs = () => {
  const [blogs, setBlogs] = useState([]);
  const { loading, status, setStatus, execute } = useFirestoreOperation();

  // Suscripción en tiempo real para la tabla
  useEffect(() => {
    const unsubscribe = blogService.subscribeToAll(setBlogs);
    return () => unsubscribe();
  }, []);

  const saveBlog = async (formData, id = null) => {
    return await execute(async () => {
      if (id) {
        return await blogService.update(id, formData);
      } else {
        return await blogService.create(formData);
      }
    });
  };

  const closeStatus = () => setStatus(prev => ({ ...prev, open: false }));

  return { blogs, loading, status, saveBlog, closeStatus };
};