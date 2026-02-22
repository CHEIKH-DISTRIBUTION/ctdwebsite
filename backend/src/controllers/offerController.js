const Offer = require('../models/Offer');

// @desc    Obtenir toutes les offres actives
// @route   GET /api/offers
// @access  Public
exports.getOffers = async (req, res) => {
  try {
    const filter = { isActive: true };
    if (req.query.all === 'true') delete filter.isActive; // Admin view

    const offers = await Offer.find(filter).sort({ validUntil: 1 });

    res.status(200).json({
      success: true,
      count: offers.length,
      data: { offers },
    });
  } catch (error) {
    console.error('Erreur récupération offres:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
};

// @desc    Obtenir une offre
// @route   GET /api/offers/:id
// @access  Public
exports.getOffer = async (req, res) => {
  try {
    const offer = await Offer.findById(req.params.id);
    if (!offer) {
      return res.status(404).json({ success: false, message: 'Offre introuvable' });
    }
    res.status(200).json({ success: true, data: { offer } });
  } catch (error) {
    console.error('Erreur récupération offre:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
};

// @desc    Créer une offre
// @route   POST /api/offers
// @access  Private/Admin
exports.createOffer = async (req, res) => {
  try {
    const offer = await Offer.create({ ...req.body, createdBy: req.user.id });
    res.status(201).json({
      success: true,
      message: 'Offre créée avec succès',
      data: { offer },
    });
  } catch (error) {
    console.error('Erreur création offre:', error);
    if (error.name === 'ValidationError') {
      const message = Object.values(error.errors).map((e) => e.message).join(', ');
      return res.status(400).json({ success: false, message });
    }
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
};

// @desc    Mettre à jour une offre
// @route   PUT /api/offers/:id
// @access  Private/Admin
exports.updateOffer = async (req, res) => {
  try {
    const offer = await Offer.findByIdAndUpdate(req.params.id, req.body, {
      new:            true,
      runValidators:  true,
    });
    if (!offer) {
      return res.status(404).json({ success: false, message: 'Offre introuvable' });
    }
    res.status(200).json({
      success: true,
      message: 'Offre mise à jour',
      data: { offer },
    });
  } catch (error) {
    console.error('Erreur mise à jour offre:', error);
    if (error.name === 'ValidationError') {
      const message = Object.values(error.errors).map((e) => e.message).join(', ');
      return res.status(400).json({ success: false, message });
    }
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
};

// @desc    Supprimer une offre
// @route   DELETE /api/offers/:id
// @access  Private/Admin
exports.deleteOffer = async (req, res) => {
  try {
    const offer = await Offer.findByIdAndDelete(req.params.id);
    if (!offer) {
      return res.status(404).json({ success: false, message: 'Offre introuvable' });
    }
    res.status(200).json({ success: true, message: 'Offre supprimée' });
  } catch (error) {
    console.error('Erreur suppression offre:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
};
