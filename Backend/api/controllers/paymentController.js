<<<<<<< HEAD
export async function getCards(req, res) {
  const userId = req.user.id;
  const db = req.app.get('db');
  const cards = await db.collection('cards').find({ userId }).toArray();
  res.json(cards);
}

export async function addCard(req, res) {
  const userId = req.user.id;
  const { type, last4 } = req.body;
  const db = req.app.get('db');
  await db.collection('cards').insertOne({ userId, type, last4 });
  res.status(201).json({ message: 'Tarjeta agregada' });
}

export async function deleteCard(req, res) {
  const userId = req.user.id;
  const { cardId } = req.params;
  const db = req.app.get('db');
  await db.collection('cards').deleteOne({ _id: cardId, userId });
  res.status(200).json({ message: 'Tarjeta eliminada' });
=======
export async function getCards(req, res) {
  const userId = req.user.id;
  const db = req.app.get('db');
  const cards = await db.collection('cards').find({ userId }).toArray();
  res.json(cards);
}

export async function addCard(req, res) {
  const userId = req.user.id;
  const { type, last4 } = req.body;
  const db = req.app.get('db');
  await db.collection('cards').insertOne({ userId, type, last4 });
  res.status(201).json({ message: 'Tarjeta agregada' });
}

export async function deleteCard(req, res) {
  const userId = req.user.id;
  const { cardId } = req.params;
  const db = req.app.get('db');
  await db.collection('cards').deleteOne({ _id: cardId, userId });
  res.status(200).json({ message: 'Tarjeta eliminada' });
>>>>>>> c6cd8408e916d3b9e06962cd004552a3bafe1093
}