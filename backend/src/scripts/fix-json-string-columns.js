/**
 * Migration Script: Fix Double-Encoded JSON Strings
 * 
 * This script fixes address and metadata columns in the tenants table
 * that may have been stored as JSON strings instead of proper JSON objects.
 * 
 * Run with: node src/scripts/fix-json-string-columns.js
 */

const { sequelize } = require('../config/db');
const { Tenant } = require('../modules/tenants/tenant.model');
const logger = require('../utils/logger');

async function fixJsonStringColumns() {
  try {
    logger.info('Starting JSON string migration...');
    
    // Fetch all tenants
    const tenants = await Tenant.findAll();
    let fixedCount = 0;
    
    for (const tenant of tenants) {
      let needsUpdate = false;
      const updates = {};
      
      // Check if address is a string that needs parsing
      if (tenant.address && typeof tenant.address === 'string') {
        try {
          updates.address = JSON.parse(tenant.address);
          needsUpdate = true;
          logger.info(`Tenant ${tenant.id}: Will fix address column`);
        } catch (error) {
          logger.warn(`Tenant ${tenant.id}: Could not parse address: ${error.message}`);
          // Set to null if it can't be parsed
          updates.address = null;
          needsUpdate = true;
        }
      }
      
      // Check if metadata is a string that needs parsing
      if (tenant.metadata && typeof tenant.metadata === 'string') {
        try {
          updates.metadata = JSON.parse(tenant.metadata);
          needsUpdate = true;
          logger.info(`Tenant ${tenant.id}: Will fix metadata column`);
        } catch (error) {
          logger.warn(`Tenant ${tenant.id}: Could not parse metadata: ${error.message}`);
          updates.metadata = null;
          needsUpdate = true;
        }
      }
      
      // Update the tenant if needed
      if (needsUpdate) {
        await tenant.update(updates);
        fixedCount++;
        logger.info(`Tenant ${tenant.id}: Fixed JSON columns`);
      }
    }
    
    logger.info(`Migration complete. Fixed ${fixedCount} tenant(s) out of ${tenants.length}`);
    
    return {
      success: true,
      totalTenants: tenants.length,
      fixedTenants: fixedCount,
    };
  } catch (error) {
    logger.error('Migration failed:', error);
    throw error;
  }
}

// Run the migration if called directly
if (require.main === module) {
  (async () => {
    try {
      const result = await fixJsonStringColumns();
      console.log('\n✅ Migration Results:');
      console.log(`   Total tenants: ${result.totalTenants}`);
      console.log(`   Fixed tenants: ${result.fixedTenants}`);
      console.log('\n');
      process.exit(0);
    } catch (error) {
      console.error('\n❌ Migration failed:', error.message);
      process.exit(1);
    }
  })();
}

module.exports = { fixJsonStringColumns };
