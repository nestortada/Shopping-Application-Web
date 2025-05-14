// src/pages/AddProduct.jsx
import React, { useState } from 'react';
import { db, storage } from '../firebase/firebaseConfig';
import { collection, addDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

const AddProduct = () => {
  const [nombre, setNombre] = useState('');
  const [ingredientes, setIngredientes] = useState('');
  const [imagen, setImagen] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!imagen) {
      alert("Por favor selecciona una imagen.");
      return;
    }

    try {
      // 1. Subir imagen al Storage
      const imgRef = ref(storage, `productos/${imagen.name}`);
      await uploadBytes(imgRef, imagen);
      const imageURL = await getDownloadURL(imgRef);

      // 2. Guardar datos en Firestore
      await addDoc(collection(db, "productos"), {
        nombre,
        ingredientes,
        imagenURL: imageURL,
      });

      alert("Producto guardado correctamente.");
      setNombre('');
      setIngredientes('');
      setImagen(null);
    } catch (error) {
      console.error("Error al guardar producto:", error);
      alert("Hubo un error al guardar el producto.");
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ maxWidth: 400, margin: 'auto', display: 'flex', flexDirection: 'column', gap: 10 }}>
      <h2>Agregar producto</h2>
      <input type="text" placeholder="Nombre" value={nombre} onChange={e => setNombre(e.target.value)} required />
      <input type="text" placeholder="Ingredientes" value={ingredientes} onChange={e => setIngredientes(e.target.value)} required />
      <input type="file" accept="image/*" onChange={e => setImagen(e.target.files[0])} required />
      <button type="submit">Guardar producto</button>
    </form>
  );
};

export default AddProduct;
