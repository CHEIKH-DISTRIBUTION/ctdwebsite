'use strict';

/**
 * IPackRepository — persistence contract for Packs.
 */
class IPackRepository {
  /**
   * Find a pack by ID with its product items fully populated (including stock).
   * @param   {string} id
   * @returns {Promise<object|null>}
   */
  async findById(id) {
    throw new Error('IPackRepository.findById() not implemented');
  }
}

module.exports = { IPackRepository };
