
import { supabase } from "@/integrations/supabase/client";

/**
 * Converts a string to a URL-friendly slug
 * @param text The text to convert to a slug
 * @returns A URL-friendly slug
 */
export const generateSlug = (text: string): string => {
  if (!text) return '';
  
  return text
    .toLowerCase()
    .replace(/\s+/g, '-')           // Replace spaces with dashes
    .replace(/[^\w\-]+/g, '')       // Remove all non-word characters
    .replace(/\-\-+/g, '-')         // Replace multiple dashes with single dash
    .replace(/^-+/, '')             // Trim dashes from start
    .replace(/-+$/, '');            // Trim dashes from end
};

/**
 * Ensures a slug is unique by appending a number if necessary
 * @param baseSlug The initial slug to check
 * @returns A unique slug that doesn't exist in the database
 */
export const ensureUniqueSlug = async (baseSlug: string): Promise<string> => {
  let slug = baseSlug;
  let counter = 0;
  let isUnique = false;
  
  while (!isUnique) {
    const currentSlug = counter === 0 ? slug : `${slug}-${counter}`;
    
    // Check if slug already exists in franchisees table
    const { data, error } = await supabase
      .from('franchisees')
      .select('id')
      .eq('slug', currentSlug)
      .single();
    
    if (error || !data) {
      // Slug is unique
      isUnique = true;
      slug = currentSlug;
    } else {
      // Increment counter and try again
      counter++;
    }
  }
  
  return slug;
};

/**
 * Gets franchisee ID from a slug
 * @param slug The slug to look up
 * @returns The franchisee ID (not user_id) associated with the slug
 */
export const getFranchiseeIdFromSlug = async (slug: string): Promise<string | null> => {
  try {
    console.log(`[slugUtils] Resolving slug to franchisee ID: ${slug}`);
    console.log(`[slugUtils] Environment: ${window.location.hostname}`);
    
    const startTime = Date.now();
    const { data, error } = await supabase
      .from('franchisees')
      .select('id')  // Changed from user_id to id
      .eq('slug', slug)
      .single();
    
    const endTime = Date.now();
    console.log(`[slugUtils] Query took ${endTime - startTime}ms`);
    
    if (error) {
      console.error(`[slugUtils] Error getting franchisee ID from slug:`, {
        slug,
        error: error.message,
        code: error.code,
        details: error.details,
        hint: error.hint
      });
      return null;
    }
    
    if (!data) {
      console.warn(`[slugUtils] No data returned for slug: ${slug}`);
      return null;
    }
    
    console.log(`[slugUtils] Resolved franchisee ID: ${data.id}`);
    return data.id;
  } catch (error) {
    console.error(`[slugUtils] Exception in getFranchiseeIdFromSlug:`, {
      slug,
      error: error instanceof Error ? error.message : error,
      stack: error instanceof Error ? error.stack : undefined
    });
    return null;
  }
};

/**
 * Gets slug from a franchisee ID
 * @param franchiseeId The franchisee ID to look up
 * @returns The slug associated with the franchisee ID
 */
export const getSlugFromFranchiseeId = async (franchiseeId: string): Promise<string | null> => {
  try {
    console.log(`[slugUtils] Getting slug from franchisee ID: ${franchiseeId}`);
    
    const { data, error } = await supabase
      .from('franchisees')
      .select('slug')
      .eq('id', franchiseeId)  // Changed from user_id to id for consistency
      .single();
    
    if (error || !data || !data.slug) {
      console.error(`[slugUtils] Error getting slug from franchisee ID:`, {
        franchiseeId,
        error: error?.message,
        data
      });
      return null;
    }
    
    console.log(`[slugUtils] Found slug: ${data.slug}`);
    return data.slug;
  } catch (error) {
    console.error(`[slugUtils] Exception in getSlugFromFranchiseeId:`, {
      franchiseeId,
      error: error instanceof Error ? error.message : error
    });
    return null;
  }
};
