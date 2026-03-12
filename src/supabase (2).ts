import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://dsbqflgrdcbwwsishqnq.supabase.co'
const supabaseKey = 'sb_publishable_9wepCD-Eo4FDNPhZ-iAb6A_9fzEOCN_'

export const supabase = createClient(supabaseUrl, supabaseKey)