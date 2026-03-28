import { supabase } from './client'

function normalizeString(value) {
  if (value === undefined || value === null) return null

  const trimmed = String(value).trim()
  return trimmed === '' ? null : trimmed
}

function normalizeSeoPayload(payload) {
  return {
    page_type: payload.page_type,
    entity_id: String(payload.entity_id),

    meta_title: normalizeString(payload.meta_title),
    meta_description: normalizeString(payload.meta_description),
    slug: normalizeString(payload.slug),
    canonical_url: normalizeString(payload.canonical_url),

    og_title: normalizeString(payload.og_title),
    og_description: normalizeString(payload.og_description),
    og_image: normalizeString(payload.og_image),

    robots_index: Boolean(payload.robots_index),
    robots_follow: Boolean(payload.robots_follow),

    focus_keyword: normalizeString(payload.focus_keyword),
    schema_type: normalizeString(payload.schema_type),
    custom_schema_json: payload.custom_schema_json || null,
  }
}

export async function getSeoEntry(pageType, entityId) {
  const { data, error } = await supabase
    .from('seo_entries')
    .select('*')
    .eq('page_type', pageType)
    .eq('entity_id', String(entityId))
    .maybeSingle()

  if (error) throw error
  return data
}

export async function upsertSeoEntry(payload) {
  const normalized = normalizeSeoPayload(payload)

  const { data, error } = await supabase
    .from('seo_entries')
    .upsert(normalized, {
      onConflict: 'page_type,entity_id',
    })
    .select()
    .single()

  if (error) throw error
  return data
}

export async function deleteSeoEntry(pageType, entityId) {
  const { error } = await supabase
    .from('seo_entries')
    .delete()
    .eq('page_type', pageType)
    .eq('entity_id', String(entityId))

  if (error) throw error
  return true
}

export async function listSeoEntries(pageType) {
  let query = supabase
    .from('seo_entries')
    .select('*')
    .order('updated_at', { ascending: false })

  if (pageType) {
    query = query.eq('page_type', pageType)
  }

  const { data, error } = await query

  if (error) throw error
  return data || []
}