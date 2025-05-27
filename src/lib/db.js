import { supabase, adminClient } from './supabase'

// 站点相关操作
export const siteApi = {
  // 创建站点
  async create(site) {
    const { data, error } = await supabase.from('sites').insert(site).select().single()
    if (error) throw error
    return data
  },

  // 获取所有站点
  async getAll() {
    const { data, error } = await supabase.from('sites').select('*')
    if (error) throw error
    return data
  },

  // 获取单个站点
  async getById(id) {
    const { data, error } = await supabase
      .from('sites')
      .select('*, categories(*), tags(*)')
      .eq('id', id)
      .single()
    if (error) throw error
    return data
  },

  // 更新站点
  async update(id, site) {
    const { data, error } = await supabase.from('sites').update(site).eq('id', id).select().single()
    if (error) throw error
    return data
  },

  // 删除站点
  async delete(id) {
    const { error } = await supabase.from('sites').delete().eq('id', id)
    if (error) throw error
  },

  // 获取所有站点（包含标签）
  async getAllWithTags() {
    const { data, error } = await supabase.from('sites').select(`
        *,
        tags:site_tags(
          tag:tags(
            id,
            name
          )
        )
      `)
    if (error) throw error
    return data.map((site) => ({
      ...site,
      tags: site.tags.map((t) => t.tag)
    }))
  }
}

// 分类相关操作
export const categoryApi = {
  // 创建分类
  async create(category) {
    // 获取当前最大的 order_index
    const { data: maxOrder } = await supabase
      .from('categories')
      .select('order_index')
      .order('order_index', { ascending: false })
      .limit(1)
      .single()

    // 设置新的 order_index
    const newCategory = {
      ...category,
      order_index: (maxOrder?.order_index || 0) + 1
    }

    const { data, error } = await supabase.from('categories').insert(newCategory).select().single()
    if (error) throw error
    return data
  },

  // 获取所有分类，按 order_index 排序
  async getAll() {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .order('order_index', { ascending: true })
    if (error) throw error
    return data
  },

  // 更新分类
  async update(id, category) {
    const { data, error } = await supabase
      .from('categories')
      .update(category)
      .eq('id', id)
      .select()
      .single()
    if (error) throw error
    return data
  },

  // 删除分类
  async delete(id) {
    const { error } = await supabase.from('categories').delete().eq('id', id)
    if (error) throw error
  }
}

// 标签相关操作
export const tagApi = {
  // 创建标签
  async create(tag) {
    const { data, error } = await supabase.from('tags').insert(tag).select().single()
    if (error) throw error
    return data
  },

  // 获取所有标签
  async getAll() {
    const { data, error } = await supabase.from('tags').select('*')
    if (error) throw error
    return data
  },

  // 更新标签
  async update(id, tag) {
    const { data, error } = await supabase.from('tags').update(tag).eq('id', id).select().single()
    if (error) throw error
    return data
  },

  // 删除标签
  async delete(id) {
    const { error } = await supabase.from('tags').delete().eq('id', id)
    if (error) throw error
  },

  // 根据名称获取标签
  async getByName(name) {
    const { data, error } = await supabase.from('tags').select().eq('name', name).single()
    if (error && error.code !== 'PGRST116') throw error
    return data
  },

  // 创建标签（如果不存在）
  async createIfNotExists(name) {
    let tag = await this.getByName(name)
    if (!tag) {
      tag = await this.create({ name })
    }
    return tag
  }
}

// 站点-分类关联操作
export const siteCategoryApi = {
  // 添加站点分类
  async add(siteId, categoryId) {
    const { error } = await supabase
      .from('site_categories')
      .insert({ site_id: siteId, category_id: categoryId })
    if (error) throw error
  },

  // 移除站点分类
  async remove(siteId, categoryId) {
    const { error } = await supabase
      .from('site_categories')
      .delete()
      .eq('site_id', siteId)
      .eq('category_id', categoryId)
    if (error) throw error
  }
}

// 站点-标签关联操作
export const siteTagApi = {
  // 添加站点标签
  async add(siteId, tagId) {
    const { error } = await supabase.from('site_tags').insert({ site_id: siteId, tag_id: tagId })
    if (error) throw error
  },

  // 移除站点标签
  async remove(siteId, tagId) {
    const { error } = await supabase
      .from('site_tags')
      .delete()
      .eq('site_id', siteId)
      .eq('tag_id', tagId)
    if (error) throw error
  },

  // 获取站点的所有标签
  async getBySiteId(siteId) {
    const { data, error } = await supabase
      .from('site_tags')
      .select('tag:tags(*)')
      .eq('site_id', siteId)
    if (error) throw error
    return data.map((st) => st.tag)
  },

  // 更新站点的标签
  async updateSiteTags(siteId, tagNames) {
    // 1. 获取现有标签
    const existingTags = await this.getBySiteId(siteId)

    // 2. 删除不再需要的标签关联
    for (const tag of existingTags) {
      if (!tagNames.includes(tag.name)) {
        await this.remove(siteId, tag.id)
      }
    }

    // 3. 添加新的标签关联
    for (const tagName of tagNames) {
      const tag = await tagApi.createIfNotExists(tagName)
      // 检查是否已存在关联
      const existingTag = existingTags.find((t) => t.id === tag.id)
      if (!existingTag) {
        await this.add(siteId, tag.id)
      }
    }
  }
}

// 分类-站点排序相关操作
export const categorySiteOrderApi = {
  // 获取分类下所有站点的排序
  async getByCategoryId(categoryId) {
    const { data, error } = await supabase
      .from('category_site_orders')
      .select('*, site:sites(*)')
      .eq('category_id', categoryId)
      .order('order_index', { ascending: true })
    if (error) throw error
    return data
  },

  // 获取站点的排序信息
  async getBySiteId(siteId) {
    const { data, error } = await supabase
      .from('category_site_orders')
      .select('*, category:categories(*)')
      .eq('site_id', siteId)
    if (error) throw error
    return data
  },

  // 设置站点的排序
  async setOrder(categoryId, siteId, orderIndex) {
    const { data, error } = await supabase
      .from('category_site_orders')
      .upsert({
        category_id: categoryId,
        site_id: siteId,
        order_index: orderIndex
      })
      .select()
      .single()
    if (error) throw error
    return data
  },

  // 更新站点的排序
  async updateOrder(categoryId, siteId, newOrderIndex) {
    const { data, error } = await supabase
      .from('category_site_orders')
      .update({ order_index: newOrderIndex })
      .eq('category_id', categoryId)
      .eq('site_id', siteId)
      .select()
      .single()
    if (error) throw error
    return data
  },

  // 删除站点的排序记录
  async delete(categoryId, siteId) {
    const { error } = await supabase
      .from('category_site_orders')
      .delete()
      .eq('category_id', categoryId)
      .eq('site_id', siteId)
    if (error) throw error
  },

  // 重新排序分类下的所有站点
  async reorderCategorySites(categoryId, siteIds) {
    // 使用事务来确保数据一致性
    const { error } = await supabase.rpc('reorder_category_sites', {
      p_category_id: categoryId,
      p_site_ids: siteIds
    })
    if (error) throw error
  }
}

// 用户相关操作
export const userApi = {
  // 获取所有用户
  async getUsers() {
    const { data: users, error: usersError } = await adminClient.auth.admin.listUsers()
    if (usersError) throw usersError

    // 获取所有用户的角色信息
    const { data: userRoles, error: rolesError } = await supabase
      .from('user_roles')
      .select('id, role')
    if (rolesError) throw rolesError

    // 创建用户ID到角色的映射
    const roleMap = userRoles.reduce((map, ur) => {
      map[ur.id] = ur.role
      return map
    }, {})

    // 转换用户数据格式
    const formattedUsers = users.users.map((user) => ({
      id: user.id,
      email: user.email,
      username: user.user_metadata?.username || user.email,
      role: roleMap[user.id] || 'user',
      status: user.email_confirmed_at && !user.banned && !user.deleted_at ? 'active' : 'inactive',
      avatar_url: user.user_metadata?.avatar_url,
      last_login: user.last_sign_in_at,
      created_at: user.created_at
    }))

    return { data: formattedUsers }
  },

  // 更新用户
  async updateUser(id, userData) {
    // 如果要更新邮箱，先检查是否已存在
    if (userData.email) {
      const {
        data: { users },
        error: checkError
      } = await adminClient.auth.admin.listUsers()
      if (checkError) throw checkError

      const existingUser = users.find((u) => u.email === userData.email && u.id !== id)

      if (existingUser) {
        throw new Error('该邮箱已被其他用户使用')
      }
    }

    // 更新用户基本信息
    const updateData = {
      email: userData.email,
      user_metadata: {
        username: userData.username
      }
    }

    if (userData.password) {
      updateData.password = userData.password
    }

    const { data: updatedUser, error: updateError } = await adminClient.auth.admin.updateUserById(
      id,
      updateData
    )

    if (updateError) throw updateError

    // 更新用户角色
    if (userData.role) {
      const { error: roleError } = await supabase.from('user_roles').upsert({
        id: id,
        role: userData.role,
        updated_at: new Date().toISOString()
      })

      if (roleError) throw roleError
    }

    return updatedUser
  },

  // 删除用户
  async deleteUser(id) {
    // 首先删除用户角色关联
    const { error: roleError } = await supabase.from('user_roles').delete().eq('id', id)

    if (roleError) throw roleError

    // 然后删除用户
    const { error: userError } = await adminClient.auth.admin.deleteUser(id)
    if (userError) throw userError
  },

  // 上传头像
  async uploadAvatar(userId, file) {
    // 获取用户信息以获取邮箱
    const {
      data: { users },
      error: userError
    } = await adminClient.auth.admin.listUsers()
    if (userError) throw userError

    const user = users.find((u) => u.id === userId)
    if (!user) throw new Error('用户不存在')

    // 生成文件名（使用用户ID和时间戳）
    const fileExt = file.name.split('.').pop()
    const fileName = `${userId}-${Date.now()}.${fileExt}`

    // 上传文件到Supabase Storage
    const { error: uploadError } = await supabase.storage.from('avatars').upload(fileName, file, {
      cacheControl: '3600',
      upsert: true
    })

    if (uploadError) throw uploadError

    // 获取文件URL
    const {
      data: { publicUrl }
    } = supabase.storage.from('avatars').getPublicUrl(fileName)

    // 更新用户元数据
    const { data: updatedUser, error: updateError } = await adminClient.auth.admin.updateUserById(
      userId,
      {
        user_metadata: {
          avatar_url: publicUrl
        }
      }
    )

    if (updateError) throw updateError

    return { data: updatedUser }
  },

  // 删除头像
  async deleteAvatar(userId) {
    // 获取用户信息
    const {
      data: { users },
      error: userError
    } = await adminClient.auth.admin.listUsers()
    if (userError) throw userError

    const user = users.find((u) => u.id === userId)
    if (!user) throw new Error('用户不存在')

    // 如果有头像，从Storage中删除
    if (user.user_metadata?.avatar_url) {
      const avatarUrl = user.user_metadata.avatar_url
      const filePath = avatarUrl.split('/').pop()

      const { error: deleteError } = await supabase.storage
        .from('public')
        .remove([`avatars/${filePath}`])

      if (deleteError) throw deleteError
    }

    // 更新用户元数据，移除头像URL
    const { data: updatedUser, error: updateError } = await adminClient.auth.admin.updateUserById(
      userId,
      {
        user_metadata: {
          ...user.user_metadata,
          avatar_url: null
        }
      }
    )

    if (updateError) throw updateError

    return { data: updatedUser }
  }
}

// 访问记录相关操作
export const visitApi = {
  // 记录访问
  async recordVisit(siteId) {
    const { data, error } = await supabase
      .from('site_visits')
      .insert({
        site_id: siteId,
        ip_address: null, // 由数据库触发器处理
        user_agent: navigator.userAgent
      })
      .select()
      .single()
    if (error) throw error
    return data
  }
}

// 友链相关操作
export const friendLinkApi = {
  // 创建友链
  async create(friendLink) {
    const { data, error } = await supabase.from('friend_links').insert(friendLink).select().single()
    if (error) throw error
    return data
  },

  // 获取所有友链
  async getAll() {
    const { data, error } = await supabase
      .from('friend_links')
      .select('*')
      .order('created_at', { ascending: false })
    if (error) throw error
    return data
  },

  // 获取单个友链
  async getById(id) {
    const { data, error } = await supabase.from('friend_links').select('*').eq('id', id).single()
    if (error) throw error
    return data
  },

  // 更新友链
  async update(id, friendLink) {
    const { data, error } = await supabase
      .from('friend_links')
      .update(friendLink)
      .eq('id', id)
      .select()
      .single()
    if (error) throw error
    return data
  },

  // 删除友链
  async delete(id) {
    const { error } = await supabase.from('friend_links').delete().eq('id', id)
    if (error) throw error
  }
}
