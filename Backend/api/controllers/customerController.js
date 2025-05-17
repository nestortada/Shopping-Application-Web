import { ObjectId } from 'mongodb';

/**
 * Get favorites for the current customer
 */
export async function getFavorites(req, res) {
  try {
    const userId = req.user.id;
    const db = req.app.get('db');
    
    // Get favorites from the database
    const favorites = await db.collection('favorites')
      .find({ userId })
      .toArray();

    // Return the favorites
    res.status(200).json(favorites);
  } catch (err) {
    console.error('Error getting favorites:', err);
    res.status(500).json({ message: 'Error getting favorites' });
  }
}

/**
 * Add a product to favorites
 */
export async function addToFavorites(req, res) {
  try {
    const userId = req.user.id;
    const { productId } = req.body;

    if (!productId) {
      return res.status(400).json({ message: 'Product ID is required' });
    }

    const db = req.app.get('db');
    
    // Check if already in favorites
    const existing = await db.collection('favorites').findOne({
      userId,
      productId
    });

    if (existing) {
      return res.status(200).json({ message: 'Product already in favorites' });
    }

    // Get product details to store in favorites
    let product = null;
    
    try {
      // Attempt to convert string ID to ObjectId if it's a valid MongoDB ID
      const objectId = ObjectId.isValid(productId) ? new ObjectId(productId) : null;
      
      // Try to find the product in the products collection if using MongoDB
      product = await db.collection('products').findOne({ 
        $or: [
          { _id: objectId }, 
          { id: productId }
        ]
      });
    } catch (err) {
      console.log('Error finding product, will store just the ID:', err);
    }

    // Add to favorites with available product data or just the ID
    const favorite = {
      userId,
      productId,
      product: product || { id: productId },
      createdAt: new Date()
    };

    await db.collection('favorites').insertOne(favorite);
    res.status(201).json({ message: 'Product added to favorites', favorite });
  } catch (err) {
    console.error('Error adding to favorites:', err);
    res.status(500).json({ message: 'Error adding to favorites' });
  }
}

/**
 * Remove a product from favorites
 */
export async function removeFromFavorites(req, res) {
  try {
    const userId = req.user.id;
    const { productId } = req.params;

    if (!productId) {
      return res.status(400).json({ message: 'Product ID is required' });
    }

    const db = req.app.get('db');
    
    const result = await db.collection('favorites').deleteOne({
      userId,
      productId
    });

    if (result.deletedCount === 0) {
      return res.status(404).json({ message: 'Favorite not found' });
    }

    res.status(200).json({ message: 'Product removed from favorites' });
  } catch (err) {
    console.error('Error removing from favorites:', err);
    res.status(500).json({ message: 'Error removing from favorites' });
  }
}
