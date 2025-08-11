import prisma from '../../lib/prisma';

export default async function handler(req, res) {
  const method = req.method;

  try {
    if (method === 'GET') {
      const { q } = req.query;
      const where = q
        ? { OR: [{ name: { contains: q, mode: 'insensitive' } }] }
        : {};

      const debts = await prisma.debt.findMany({
        where,
        orderBy: { createdAt: 'desc' }
      });

      res.status(200).json(debts);
    } else if (method === 'POST') {
      const { name, amount, dueDate } = req.body;
      if (!name || !amount || !dueDate) {
        return res.status(400).json({ error: 'Missing fields' });
      }

      const newDebt = await prisma.debt.create({
        data: { name, amount: parseFloat(amount), dueDate: new Date(dueDate) }
      });

      res.status(201).json(newDebt);
    } else if (method === 'DELETE') {
      const { id } = req.query;
      if (!id) return res.status(400).json({ error: 'Missing id' });

      await prisma.debt.delete({ where: { id: Number(id) } });
      res.status(200).json({ message: 'Deleted' });
    } else if (method === 'PUT') {
      const { id, name, amount, dueDate } = req.body;
      if (!id) return res.status(400).json({ error: 'Missing id' });

      const updated = await prisma.debt.update({
        where: { id: Number(id) },
        data: {
          name,
          amount: amount !== undefined ? parseFloat(amount) : undefined,
          dueDate: dueDate ? new Date(dueDate) : undefined
        }
      });

      res.status(200).json(updated);
    } else {
      res.setHeader('Allow', 'GET,POST,DELETE,PUT');
      res.status(405).end(`Method ${method} Not Allowed`);
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
}