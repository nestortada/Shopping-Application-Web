/**
 * Valida la disponibilidad de productos para un pedido
 */
export async function validateOrder(req, res) {
  try {
    const { items } = req.body;
    const { email, role } = req.user;
    
    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: 'Formato de pedido inválido' });
    }

    // Verificar si el usuario es de tipo POS
    if (!email.endsWith('@sabanapos.edu.co') || role !== 'Perfil POS') {
      return res.status(403).json({ message: 'No autorizado para validar pedidos' });
    }

    // Obtener el nombre de la colección basado en el email del POS
    const collectionName = email.split('@')[0];
    
    // Importamos Firebase Admin en el controlador
    const admin = require('firebase-admin');
    
    // Inicializamos Firebase Admin si aún no lo está
    if (!admin.apps.length) {
      admin.initializeApp({
    credential: admin.credential.cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n')
    }),
    databaseURL: process.env.FIREBASE_DATABASE_URL
    });
    }
    
    const firestore = admin.firestore();
    
    let outOfStockItems = [];
    
    // Comprobar cada producto en Firebase
    for (const item of items) {
      try {
        // Buscar el producto en la colección del usuario POS
        const productRef = firestore.collection(collectionName).doc(item.id);
        const productDoc = await productRef.get();
        
        if (!productDoc.exists) {
          outOfStockItems.push(item.name);
          continue;
        }
        
        const productData = productDoc.data();
        
        // Verificar si hay suficiente stock
        if (!productData.stock || productData.stock < item.quantity) {
          outOfStockItems.push(item.name);
        }
      } catch (error) {
        console.error(`Error al verificar el producto ${item.name}:`, error);
        outOfStockItems.push(item.name);
      }
    }
    
    if (outOfStockItems.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Productos sin stock suficiente',
        outOfStockItems
      });
    }
    
    // Si todos los productos están disponibles, actualizar el stock en Firebase
    const batch = firestore.batch();
    
    for (const item of items) {
      const productRef = firestore.collection(collectionName).doc(item.id);
      const productDoc = await productRef.get();
      const productData = productDoc.data();
      
      batch.update(productRef, {
        stock: productData.stock - item.quantity
      });
    }
    
    await batch.commit();
    
    return res.status(200).json({
      success: true,
      message: 'Pedido validado con éxito'
    });
    
  } catch (err) {
    console.error('Error en validateOrder:', err);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
}
