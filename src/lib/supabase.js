// Supabase客户端配置文件
import { createClient } from '@supabase/supabase-js'

// 从环境变量获取配置
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY
const supabaseServiceRoleKey = import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY

// 创建普通用户客户端实例
const supabaseInstance = createClient(supabaseUrl, supabaseAnonKey)

// 创建管理员权限客户端实例
const adminInstance = createClient(supabaseUrl, supabaseServiceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

// 导出客户端实例
export const supabase = supabaseInstance
export const adminClient = adminInstance
