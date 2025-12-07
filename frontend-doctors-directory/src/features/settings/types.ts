export interface SiteSettings {
  site_name?: string
  site_name_en?: string | null
  support_email?: string | null
  support_phone?: string | null
  site_logo_url?: string | null
}

export interface AdminSiteSettings extends SiteSettings {
  site_logo_path?: string | null
}
