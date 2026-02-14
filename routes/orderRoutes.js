// ═══════════════════════════════════════════════════════════════════════════════
// MODIFICATION BACKEND RECOMMANDÉE — routes/orderRoutes.js
// Protéger GET /api/orders et PUT /api/orders/:id avec authenticateAdmin
// ═══════════════════════════════════════════════════════════════════════════════
//
// Remplacez votre fichier routes/orderRoutes.js par le contenu ci-dessous :

const express = require('express')
const router = express.Router()
const Order = require('../models/Order')
const { authenticateAdmin } = require('../middleware/auth')

// POST /api/orders — Créer une commande (PUBLIC : le client passe commande)
router.post('/', async (req, res) => {
  try {
    const { customerInfo, items, total } = req.body

    // Validation basique
    if (!customerInfo || !items || !total) {
      return res.status(400).json({ message: 'Données de commande incomplètes' })
    }

    const order = new Order({
      customerInfo,
      items,
      total,
      status: 'confirmé',
    })

    await order.save()
    res.status(201).json(order)
  } catch (err) {
    console.error('Erreur création commande:', err)
    res.status(500).json({ message: 'Erreur serveur', error: err.message })
  }
})

// GET /api/orders — Lister toutes les commandes (ADMIN uniquement)
router.get('/', authenticateAdmin, async (req, res) => {
  try {
    const orders = await Order.find()
      .populate('items.product', 'name brand images')
      .sort({ createdAt: -1 })
    res.json(orders)
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur', error: err.message })
  }
})

// GET /api/orders/:id — Détail d'une commande (ADMIN uniquement)
router.get('/:id', authenticateAdmin, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('items.product', 'name brand images')
    if (!order) return res.status(404).json({ message: 'Commande introuvable' })
    res.json(order)
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur', error: err.message })
  }
})

// PUT /api/orders/:id — Mettre à jour le statut (ADMIN uniquement)
router.put('/:id', authenticateAdmin, async (req, res) => {
  try {
    const { status } = req.body
    const validStatuses = ['confirmé', 'en livraison', 'livré', 'retour']

    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: 'Statut invalide' })
    }

    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true, runValidators: true }
    )

    if (!order) return res.status(404).json({ message: 'Commande introuvable' })
    res.json(order)
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur', error: err.message })
  }
})

module.exports = router

// ═══════════════════════════════════════════════════════════════════════════════
// MODIFICATION routes/adminRoutes.js — S'assurer que les stats sont correctes
// ═══════════════════════════════════════════════════════════════════════════════
//
// Voici également le contenu recommandé pour routes/adminRoutes.js :
//
// const express = require('express')
// const router = express.Router()
// const Order = require('../models/Order')
// const { authenticateAdmin } = require('../middleware/auth')
//
// // GET /api/admin/stats
// router.get('/stats', authenticateAdmin, async (req, res) => {
//   try {
//     const [totalOrders, confirmedOrders, inDeliveryOrders, deliveredOrders, returnOrders] =
//       await Promise.all([
//         Order.countDocuments(),
//         Order.countDocuments({ status: 'confirmé' }),
//         Order.countDocuments({ status: 'en livraison' }),
//         Order.countDocuments({ status: 'livré' }),
//         Order.countDocuments({ status: 'retour' }),
//       ])
//
//     const revenueAgg = await Order.aggregate([
//       { $match: { status: 'livré' } },
//       { $group: { _id: null, total: { $sum: '$total' } } },
//     ])
//     const totalRevenue = revenueAgg[0]?.total || 0
//
//     res.json({
//       totalOrders,
//       confirmedOrders,
//       inDeliveryOrders,
//       deliveredOrders,
//       returnOrders,
//       totalRevenue,
//     })
//   } catch (err) {
//     res.status(500).json({ message: 'Erreur serveur', error: err.message })
//   }
// })
//
// // POST /api/admin/stats/reset — Supprimer les commandes livrées et retournées
// router.post('/stats/reset', authenticateAdmin, async (req, res) => {
//   try {
//     const result = await Order.deleteMany({ status: { $in: ['livré', 'retour'] } })
//     res.json({ message: `${result.deletedCount} commande(s) supprimée(s)`, deletedCount: result.deletedCount })
//   } catch (err) {
//     res.status(500).json({ message: 'Erreur serveur', error: err.message })
//   }
// })
//
// module.exports = router