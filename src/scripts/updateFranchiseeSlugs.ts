
/**
 * This script can be used to update existing franchisee records with slugs.
 * It can be run manually from the console or as part of a migration process.
 */

import { supabase } from "@/integrations/supabase/client";
import { generateSlug, ensureUniqueSlug } from "@/utils/slugUtils";

export const updateFranchiseeSlugs = async () => {
  try {
    // Get all franchisees without a slug
    const { data: franchisees, error } = await supabase
      .from('franchisees')
      .select('id, user_id, company_name')
      .is('slug', null);
    
    if (error) {
      console.error("Error fetching franchisees:", error);
      return;
    }
    
    console.log(`Found ${franchisees?.length || 0} franchisees without slugs`);
    
    // Update each franchisee with a unique slug
    for (const franchisee of franchisees || []) {
      if (!franchisee.company_name) continue;
      
      const baseSlug = generateSlug(franchisee.company_name);
      const uniqueSlug = await ensureUniqueSlug(baseSlug);
      
      const { error: updateError } = await supabase
        .from('franchisees')
        .update({ slug: uniqueSlug })
        .eq('id', franchisee.id);
      
      if (updateError) {
        console.error(`Error updating franchisee ${franchisee.id}:`, updateError);
      } else {
        console.log(`Updated franchisee ${franchisee.id} with slug: ${uniqueSlug}`);
      }
    }
    
    console.log("Slug update completed");
  } catch (error) {
    console.error("Error updating franchisee slugs:", error);
  }
};

// This function can be run from the console to update all existing franchisees without slugs
window.updateSlugs = updateFranchiseeSlugs;

