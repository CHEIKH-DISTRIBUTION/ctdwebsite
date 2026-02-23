const Joi = require('joi');

// Validation pour l'inscription
exports.validateRegister = (req, res, next) => {
  const schema = Joi.object({
    name: Joi.string().min(2).max(50).required().messages({
      'string.min': 'Le nom doit contenir au moins 2 caractères',
      'string.max': 'Le nom ne peut pas dépasser 50 caractères',
      'any.required': 'Le nom est requis'
    }),
    email: Joi.string().email().required().messages({
      'string.email': 'Veuillez entrer un email valide',
      'any.required': 'L\'email est requis'
    }),
    password: Joi.string().min(8).required().messages({
      'string.min': 'Le mot de passe doit contenir au moins 8 caractères',
      'any.required': 'Le mot de passe est requis'
    }),
    phone: Joi.string().pattern(/^(\+221|221)?[0-9]{9}$/).required().messages({
      'string.pattern.base': 'Veuillez entrer un numéro de téléphone sénégalais valide',
      'any.required': 'Le numéro de téléphone est requis'
    }),
    address: Joi.object({
      street: Joi.string().allow(''),
      city: Joi.string().allow(''),
      region: Joi.string().allow(''),
      postalCode: Joi.string().allow('')
    }).optional(),
    // CAPTCHA — Cloudflare Turnstile response token
    'cf-turnstile-response': Joi.string().optional().allow('')
  });

  const { error } = schema.validate(req.body);
  if (error) {
    return res.status(400).json({
      success: false,
      message: error.details[0].message
    });
  }
  next();
};

// Validation pour la connexion
exports.validateLogin = (req, res, next) => {
  const schema = Joi.object({
    email: Joi.string().email().required().messages({
      'string.email': 'Veuillez entrer un email valide',
      'any.required': 'L\'email est requis'
    }),
    password: Joi.string().required().messages({
      'any.required': 'Le mot de passe est requis'
    }),
    'cf-turnstile-response': Joi.string().optional().allow('')
  });

  const { error } = schema.validate(req.body);
  if (error) {
    return res.status(400).json({
      success: false,
      message: error.details[0].message
    });
  }
  next();
};

// Validation pour les produits
exports.validateProduct = (req, res, next) => {
  const schema = Joi.object({
    name: Joi.string().min(2).max(100).required(),
    description: Joi.string().max(500).required(),
    price: Joi.number().min(0).required(),
    category: Joi.string().valid('Alimentaire', 'Hygiène', 'Électroménager', 'Vêtements').required(),
    stock: Joi.number().min(0).required(),
    minStock: Joi.number().min(0).optional(),
    sku: Joi.string().required(),
    brand: Joi.string().optional(),
    weight: Joi.object({
      value: Joi.number().min(0),
      unit: Joi.string().valid('kg', 'g', 'l', 'ml')
    }).optional(),
    isActive: Joi.boolean().truthy('true', '1').falsy('false', '0').optional(),
    isFeatured: Joi.boolean().truthy('true', '1').falsy('false', '0').optional(),
    tags: Joi.array().items(Joi.string()).single().optional(),
    seoTitle: Joi.string().optional(),
    seoDescription: Joi.string().optional()
  });

  const { error } = schema.validate(req.body);
  if (error) {
    return res.status(400).json({
      success: false,
      message: error.details[0].message
    });
  }
  next();
};

// Validation pour les commandes (avec packs)
exports.validateOrder = (req, res, next) => {
  const schema = Joi.object({
    products: Joi.array().items(
      Joi.object({
        product: Joi.string().hex().length(24).required()
          .messages({
            'string.hex': 'L\'ID produit doit être un identifiant valide',
            'string.length': 'L\'ID produit doit avoir 24 caractères',
            'any.required': 'L\'ID produit est requis pour chaque item'
          }),
        quantity: Joi.number().min(1).integer().required()
          .messages({
            'number.min': 'La quantité doit être au moins 1',
            'number.integer': 'La quantité doit être un entier',
            'any.required': 'La quantité est requise pour chaque produit'
          })
      })
    ).optional(),
    packs: Joi.array().items(
      Joi.object({
        pack: Joi.string().hex().length(24).required()
          .messages({
            'string.hex': 'L\'ID pack doit être un identifiant valide',
            'string.length': 'L\'ID pack doit avoir 24 caractères',
            'any.required': 'L\'ID pack est requis pour chaque pack'
          }),
        quantity: Joi.number().min(1).integer().required()
          .messages({
            'number.min': 'La quantité doit être au moins 1',
            'number.integer': 'La quantité doit être un entier',
            'any.required': 'La quantité est requise pour chaque pack'
          })
      })
    ).optional(),
    paymentMethod: Joi.string().valid('wave', 'orange_money', 'cash', 'bank_transfer').required()
      .messages({
        'any.only': 'Méthode de paiement invalide',
        'any.required': 'La méthode de paiement est requise'
      }),
    deliveryAddress: Joi.object({
      street: Joi.string().required()
        .messages({
          'any.required': 'La rue est requise'
        }),
      city: Joi.string().required()
        .messages({
          'any.required': 'La ville est requise'
        }),
      region: Joi.string().optional(),
      postalCode: Joi.string().optional(),
      instructions: Joi.string().max(200).optional()
        .messages({
          'string.max': 'Les instructions ne peuvent pas dépasser 200 caractères'
        }),
      coordinates: Joi.object({
        latitude: Joi.number().min(-90).max(90).required(),
        longitude: Joi.number().min(-180).max(180).required()
      }).optional()
    }).required(),
    contactInfo: Joi.object({
      phone: Joi.string().pattern(/^(\+221|221)?[0-9]{9}$/).required()
        .messages({
          'string.pattern.base': 'Veuillez entrer un numéro de téléphone sénégalais valide',
          'any.required': 'Le numéro de téléphone est requis'
        }),
      alternativePhone: Joi.string().pattern(/^(\+221|221)?[0-9]{9}$/).optional()
        .messages({
          'string.pattern.base': 'Veuillez entrer un numéro de téléphone sénégalais valide'
        }),
      email: Joi.string().email().optional()
        .messages({
          'string.email': 'Veuillez entrer un email valide'
        })
    }).required(),
    notes: Joi.object({
      customer: Joi.string().max(500).optional()
        .messages({
          'string.max': 'Les notes ne peuvent pas dépasser 500 caractères'
        })
    }).optional()
  }).or('products', 'packs') // Au moins un des deux (products ou packs) doit être présent
    .messages({
      'object.missing': 'La commande doit contenir au moins un produit ou un pack'
    });

  const { error } = schema.validate(req.body, {
    abortEarly: false, // Retourne toutes les erreurs, pas juste la première
    allowUnknown: false // Rejette les champs non définis dans le schéma
  });

  if (error) {
    const errors = error.details.map(detail => ({
      field: detail.context.label || detail.path.join('.'),
      message: detail.message
    }));

    return res.status(400).json({
      success: false,
      message: 'Validation error',
      errors
    });
  }

  // Validation supplémentaire : vérifier qu'on a au moins un item
  if ((!req.body.products || req.body.products.length === 0) && 
      (!req.body.packs || req.body.packs.length === 0)) {
    return res.status(400).json({
      success: false,
      message: 'La commande doit contenir au moins un produit ou un pack'
    });
  }

  next();
};

// Validation pour les packs
exports.validatePack = (req, res, next) => {
  const schema = Joi.object({
    name: Joi.string().min(2).max(100).required()
      .messages({
        'string.min': 'Le nom doit contenir au moins 2 caractères',
        'string.max': 'Le nom ne peut pas dépasser 100 caractères',
        'any.required': 'Le nom du pack est requis'
      }),
    description: Joi.string().max(500).optional()
      .messages({
        'string.max': 'La description ne peut pas dépasser 500 caractères'
      }),
    items: Joi.array().items(
      Joi.object({
        product: Joi.string().hex().length(24).required()
          .messages({
            'string.hex': 'L\'ID produit doit être un identifiant valide',
            'string.length': 'L\'ID produit doit avoir 24 caractères',
            'any.required': 'L\'ID produit est requis pour chaque item'
          }),
        quantity: Joi.number().min(1).integer().required()
          .messages({
            'number.min': 'La quantité doit être au moins 1',
            'number.integer': 'La quantité doit être un entier',
            'any.required': 'La quantité est requise pour chaque produit'
          })
      })
    ).min(1).required()
      .messages({
        'array.min': 'Le pack doit contenir au moins un produit',
        'any.required': 'Les produits du pack sont requis'
      }),
    originalPrice: Joi.number().min(0).optional()
      .messages({
        'number.min': 'Le prix original ne peut pas être négatif'
      }),
    price: Joi.number().min(0).required()
      .messages({
        'number.min': 'Le prix ne peut pas être négatif',
        'any.required': 'Le prix est requis'
      }),
    discount: Joi.number().min(0).max(100).optional()
      .messages({
        'number.min': 'La remise ne peut pas être négative',
        'number.max': 'La remise ne peut pas dépasser 100%'
      }),
    category: Joi.string().valid('alimentaire', 'hygiene', 'composite').default('composite')
      .messages({
        'any.only': 'Catégorie invalide'
      }),
    isFeatured: Joi.boolean().default(false),
    isActive: Joi.boolean().default(true),
    image: Joi.object({
      url: Joi.string().uri().required(),
      alt: Joi.string().optional()
    }).optional(),
    tags: Joi.array().items(Joi.string()).optional()
  });

  const { error } = schema.validate(req.body, {
    abortEarly: false
  });

  if (error) {
    const errors = error.details.map(detail => ({
      field: detail.context.label || detail.path.join('.'),
      message: detail.message
    }));

    return res.status(400).json({
      success: false,
      message: 'Validation error',
      errors
    });
  }

  next();
};
// Validation pour la demande de réinitialisation de mot de passe
exports.validateForgotPassword = (req, res, next) => {
  const schema = Joi.object({
    email: Joi.string().email().required().messages({
      'string.email': 'Veuillez entrer un email valide',
      'any.required': "L'email est requis"
    }),
    'cf-turnstile-response': Joi.string().optional().allow('')
  });

  const { error } = schema.validate(req.body);
  if (error) {
    return res.status(400).json({ success: false, message: error.details[0].message });
  }
  next();
};
