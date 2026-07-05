import { Router } from 'express';
import { sql } from '../db.js';

export const cartRouter = Router();

cartRouter.get('/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const cartItems = await sql`SELECT id, user_id, product_id, quantity, date_added FROM carts WHERE user_id = ${userId}`;
    res.json(cartItems);
  } catch (error) {
    console.error('[cartRouter] Error fetching cart items:', error);
    res.status(500).json({ message: 'Failed to fetch cart items' });
  }
});

cartRouter.post('/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const { productId, quantity } = req.body;
    if (!productId || !quantity) {
      return res.status(400).json({ message: 'Product ID and quantity are required' });
    }
    const newCartItem = await sql`
      INSERT INTO carts (user_id, product_id, quantity, date_added)
      VALUES (${userId}, ${productId}, ${quantity}, ${new Date().toISOString()})
      ON CONFLICT (user_id, product_id) DO UPDATE SET quantity = carts.quantity + ${quantity}
      RETURNING id, user_id, product_id, quantity, date_added
    `;
    res.status(201).json(newCartItem[0]);
  } catch (error) {
    console.error('[cartRouter] Error adding item to cart:', error);
    res.status(500).json({ message: 'Failed to add item to cart' });
  }
});

cartRouter.delete('/:userId/:productId', async (req, res) => {
  try {
    const { userId, productId } = req.params;
    const deletedItem = await sql`
      DELETE FROM carts
      WHERE user_id = ${userId} AND product_id = ${productId}
      RETURNING id
    `;
    if (deletedItem.length === 0) {
      return res.status(404).json({ message: 'Cart item not found' });
    }
    res.status(204).send(); // No content
  } catch (error) {
    console.error('[cartRouter] Error removing item from cart:', error);
    res.status(500).json({ message: 'Failed to remove item from cart' });
  }
});
