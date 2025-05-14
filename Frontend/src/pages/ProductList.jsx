// src/pages/ProductList.jsx
import React, { useEffect, useState } from 'react';
import { db } from '../firebase/firebaseConfig';
import { collection, getDocs } from 'firebase/firestore';

const ProductList = () => {
  const [productos, setProductos] = useState([]);

  useEffect(() => {
    const fetchProductos = async () => {
      try {
        const snapshot = await getDocs(collection(db, "productos"));
        const lista = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setProductos(lista);
      } catch (error) {
        console.error("Error al obtener productos:", error);
      }
    };

    fetchProductos();
  }, []);

  return (
    <div style={{ padding: 20 }}>
      <h2>Lista de Productos</h2>
      {productos.length === 0 && <p>No hay productos todavía.</p>}
      {productos.map(p => (
        <div key={p.id} style={{ border: "1px solid #ccc", marginBottom: 16, padding: 12, borderRadius: 6 }}>
          <h3>{p.nombre}</h3>
          {p.imagenURL && <img src={p.imagenURL} alt={p.nombre} style={{ width: 150, height: 'auto', marginBottom: 10 }} />}
          <p><strong>Ingredientes:</strong> {p.ingredientes}</p>
          <p>{p.descripcion}</p>
        </div>
      ))}
    </div>
  );
};

export default ProductList;
