'use strict';

const PackModel = require('../../models/Pack');
const { IPackRepository } = require('../../domain/repositories/IPackRepository');

/**
 * PackRepositoryMongo — Mongoose implementation of IPackRepository.
 */
class PackRepositoryMongo extends IPackRepository {
  /**
   * Find a pack with its product items fully populated (stock included).
   * @param {string} id
   * @returns {Promise<object|null>}
   */
  async findById(id) {
    return PackModel.findById(id).populate('items.product', 'name price stock');
  }
}

module.exports = { PackRepositoryMongo };
