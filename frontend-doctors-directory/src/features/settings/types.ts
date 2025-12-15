export interface SiteSettings {
  site_name?: string
  site_name_en?: string | null
  support_email?: string | null
  support_phone?: string | null
  site_logo_url?: string | null
  footer_description?: string | null
  footer_description_en?: string | null
  newsletter_title?: string | null
  newsletter_title_en?: string | null
  newsletter_description?: string | null
  newsletter_description_en?: string | null
  newsletter_placeholder?: string | null
  newsletter_placeholder_en?: string | null
  social_links?: Partial<Record<'facebook' | 'instagram' | 'linkedin', string>> | null
  footer_links?: Array<{
    id?: string
    label?: string
    label_en?: string
    href: string
  }> | null
  static_pages?: Array<{
    slug: string
    title?: string
    title_en?: string
    body?: string
    body_en?: string
  }> | null
}

export interface AdminSiteSettings extends SiteSettings {
  site_logo_path?: string | null
}
