-- 创建更新时间触发器函数
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc'::text, NOW());
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 创建 URL 验证函数
CREATE OR REPLACE FUNCTION is_valid_url(url TEXT)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN url ~ '^https?://[a-zA-Z0-9\-\.]+\.[a-zA-Z]{2,}(/\S*)?$';
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- 创建角色枚举类型
CREATE TYPE user_role AS ENUM ('admin', 'user');

-- 创建用户角色表
CREATE TABLE public.user_roles (
    id UUID REFERENCES auth.users ON DELETE CASCADE,
    role user_role NOT NULL DEFAULT 'user',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
    PRIMARY KEY (id)
);

-- 启用 RLS
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- 创建 RLS 策略
CREATE POLICY "允许所有用户查看角色"
    ON public.user_roles
    FOR SELECT
    TO authenticated, anon
    USING (true);

CREATE POLICY "允许触发器插入角色"
    ON public.user_roles
    FOR INSERT
    TO authenticated, anon
    WITH CHECK (true);

CREATE POLICY "允许管理员修改角色"
    ON public.user_roles
    FOR UPDATE
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.user_roles
            WHERE id = auth.uid()
            AND role = 'admin'
        )
    );

-- 创建新用户自动设置角色的触发器函数
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
    first_user BOOLEAN;
    user_role_id UUID;
BEGIN
    -- 检查是否是第一个用户
    SELECT COUNT(*) = 0 INTO first_user FROM public.user_roles;
    
    -- 设置用户角色
    BEGIN
        INSERT INTO public.user_roles (id, role)
        VALUES (
            NEW.id,
            CASE 
                WHEN first_user THEN 'admin'::user_role
                ELSE 'user'::user_role
            END
        )
        RETURNING id INTO user_role_id;
    EXCEPTION
        WHEN OTHERS THEN
            -- 不要抛出异常，让用户创建继续
    END;
    
    RETURN NEW;
EXCEPTION
    WHEN OTHERS THEN
        RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 创建触发器
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user();

-- 创建分类表
CREATE TABLE categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    icon VARCHAR(50),
    order_index INTEGER NOT NULL DEFAULT 0,
    status VARCHAR(20) NOT NULL DEFAULT 'active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT categories_name_length CHECK (length(name) >= 2 AND length(name) <= 255),
    CONSTRAINT categories_description_length CHECK (description IS NULL OR length(description) <= 1000),
    CONSTRAINT categories_icon_length CHECK (icon IS NULL OR length(icon) <= 50)
);

-- 启用分类表 RLS
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

-- 创建分类表 RLS 策略
CREATE POLICY "允许所有用户查看分类"
    ON public.categories
    FOR SELECT
    TO authenticated, anon
    USING (true);

CREATE POLICY "允许管理员管理分类"
    ON public.categories
    FOR ALL
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.user_roles
            WHERE id = auth.uid()
            AND role = 'admin'
        )
    );

-- 创建分类表索引和约束
CREATE INDEX idx_categories_order ON categories(order_index);
CREATE INDEX idx_categories_status ON categories(status);
ALTER TABLE categories ADD CONSTRAINT categories_status_check 
    CHECK (status IN ('active', 'inactive'));
ALTER TABLE categories ADD CONSTRAINT categories_name_unique UNIQUE (name);
CREATE TRIGGER set_categories_updated_at
    BEFORE UPDATE ON categories
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- 创建站点表
CREATE TABLE sites (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    url VARCHAR(2048) NOT NULL,
    description TEXT,
    favicon_url VARCHAR(2048),
    category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'pending',
    visits INTEGER NOT NULL DEFAULT 0,
    submit_time TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
    review_time TIMESTAMP WITH TIME ZONE,
    review_comment TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    CONSTRAINT sites_name_length CHECK (length(name) >= 2 AND length(name) <= 255),
    CONSTRAINT sites_description_length CHECK (description IS NULL OR length(description) <= 1000),
    CONSTRAINT sites_url_check CHECK (is_valid_url(url)),
    CONSTRAINT sites_favicon_url_check CHECK (favicon_url IS NULL OR is_valid_url(favicon_url))
);

-- 启用站点表 RLS
ALTER TABLE public.sites ENABLE ROW LEVEL SECURITY;

-- 创建站点表 RLS 策略
CREATE POLICY "允许所有用户查看已批准的站点"
    ON public.sites
    FOR SELECT
    TO authenticated, anon
    USING (status = 'approved');

CREATE POLICY "允许所有用户提交新站点"
    ON public.sites
    FOR INSERT
    TO authenticated, anon
    WITH CHECK (true);

CREATE POLICY "允许管理员管理所有站点"
    ON public.sites
    FOR ALL
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.user_roles
            WHERE id = auth.uid()
            AND role = 'admin'
        )
    );

-- 创建站点表索引和约束
CREATE INDEX idx_sites_status ON sites(status);
CREATE INDEX idx_sites_category ON sites(category_id);
ALTER TABLE sites ADD CONSTRAINT sites_status_check 
    CHECK (status IN ('pending', 'approved', 'rejected'));
CREATE TRIGGER update_sites_updated_at
    BEFORE UPDATE ON sites
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- 创建标签表
CREATE TABLE tags (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    CONSTRAINT tags_name_length CHECK (length(name) >= 2 AND length(name) <= 50)
);

-- 启用标签表 RLS
ALTER TABLE public.tags ENABLE ROW LEVEL SECURITY;

-- 创建标签表 RLS 策略
CREATE POLICY "允许所有用户查看标签"
    ON public.tags
    FOR SELECT
    TO authenticated, anon
    USING (true);

CREATE POLICY "允许管理员管理标签"
    ON public.tags
    FOR ALL
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.user_roles
            WHERE id = auth.uid()
            AND role = 'admin'
        )
    );

-- 创建站点-标签关联表
CREATE TABLE site_tags (
    site_id UUID REFERENCES sites(id) ON DELETE CASCADE,
    tag_id UUID REFERENCES tags(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    PRIMARY KEY (site_id, tag_id)
);

-- 启用站点-标签关联表 RLS
ALTER TABLE public.site_tags ENABLE ROW LEVEL SECURITY;

-- 创建站点-标签关联表 RLS 策略
CREATE POLICY "允许所有用户查看站点标签关联"
    ON public.site_tags
    FOR SELECT
    TO authenticated, anon
    USING (true);

CREATE POLICY "允许管理员管理站点标签关联"
    ON public.site_tags
    FOR ALL
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.user_roles
            WHERE id = auth.uid()
            AND role = 'admin'
        )
    );

-- 创建分类-站点排序表
CREATE TABLE category_site_orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    category_id UUID NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
    site_id UUID NOT NULL REFERENCES sites(id) ON DELETE CASCADE,
    order_index INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(category_id, site_id)
);

-- 启用分类-站点排序表 RLS
ALTER TABLE public.category_site_orders ENABLE ROW LEVEL SECURITY;

-- 创建分类-站点排序表 RLS 策略
CREATE POLICY "允许所有用户查看分类站点排序"
    ON public.category_site_orders
    FOR SELECT
    TO authenticated, anon
    USING (true);

CREATE POLICY "允许管理员管理分类站点排序"
    ON public.category_site_orders
    FOR ALL
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.user_roles
            WHERE id = auth.uid()
            AND role = 'admin'
        )
    );

-- 创建分类-站点排序表索引和触发器
CREATE INDEX idx_category_site_orders_category ON category_site_orders(category_id);
CREATE INDEX idx_category_site_orders_site ON category_site_orders(site_id);
CREATE INDEX idx_category_site_orders_order ON category_site_orders(order_index);
CREATE TRIGGER set_category_site_orders_updated_at
    BEFORE UPDATE ON category_site_orders
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- 创建友链表
CREATE TABLE friend_links (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    url VARCHAR(2048) NOT NULL,
    description TEXT,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    favicon_url VARCHAR(2048),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    CONSTRAINT friend_links_name_length CHECK (length(name) >= 2 AND length(name) <= 255),
    CONSTRAINT friend_links_description_length CHECK (description IS NULL OR length(description) <= 1000),
    CONSTRAINT friend_links_url_check CHECK (is_valid_url(url)),
    CONSTRAINT friend_links_favicon_url_check CHECK (favicon_url IS NULL OR is_valid_url(favicon_url))
);

-- 启用友链表 RLS
ALTER TABLE public.friend_links ENABLE ROW LEVEL SECURITY;

-- 创建友链表 RLS 策略
CREATE POLICY "允许所有用户查看已批准的友链"
    ON public.friend_links
    FOR SELECT
    TO authenticated, anon
    USING (status = 'approved');

CREATE POLICY "允许所有用户提交新友链"
    ON public.friend_links
    FOR INSERT
    TO authenticated, anon
    WITH CHECK (true);

CREATE POLICY "允许管理员管理所有友链"
    ON public.friend_links
    FOR ALL
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.user_roles
            WHERE id = auth.uid()
            AND role = 'admin'
        )
    );

-- 创建友链表更新时间触发器
CREATE TRIGGER set_updated_at
    BEFORE UPDATE ON friend_links
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- 创建站点访问统计表
CREATE TABLE site_visits (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    site_id UUID REFERENCES sites(id) ON DELETE CASCADE,
    visit_time TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 启用站点访问统计表 RLS
ALTER TABLE public.site_visits ENABLE ROW LEVEL SECURITY;

-- 创建站点访问统计表 RLS 策略
CREATE POLICY "允许所有用户查看访问统计"
    ON public.site_visits
    FOR SELECT
    TO authenticated, anon
    USING (true);

CREATE POLICY "允许所有用户记录访问"
    ON public.site_visits
    FOR INSERT
    TO authenticated, anon
    WITH CHECK (true);

-- 创建站点访问统计表索引
CREATE INDEX idx_site_visits_site ON site_visits(site_id);
CREATE INDEX idx_site_visits_time ON site_visits(visit_time);

-- 创建更新站点访问次数的函数
CREATE OR REPLACE FUNCTION update_site_visits_count()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE sites
    SET visits = visits + 1
    WHERE id = NEW.site_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 创建更新站点访问次数的触发器
CREATE TRIGGER update_site_visits_count_trigger
    AFTER INSERT ON site_visits
    FOR EACH ROW
    EXECUTE FUNCTION update_site_visits_count();

-- 创建重新排序分类下站点的存储过程
CREATE OR REPLACE FUNCTION reorder_category_sites(p_category_id UUID, p_site_ids UUID[])
RETURNS void AS $$
DECLARE
    site_id UUID;
    order_index INTEGER := 1;
BEGIN
    -- 删除该分类下所有现有的排序记录
    DELETE FROM category_site_orders WHERE category_id = p_category_id;
    
    -- 按照传入的站点ID数组顺序重新创建排序记录
    FOREACH site_id IN ARRAY p_site_ids
    LOOP
        INSERT INTO category_site_orders (category_id, site_id, order_index)
        VALUES (p_category_id, site_id, order_index);
        order_index := order_index + 1;
    END LOOP;
END;
$$ LANGUAGE plpgsql;

-- 创建头像存储桶
INSERT INTO storage.buckets (id, name, public) VALUES ('avatars', 'avatars', true);

-- 设置头像存储桶的访问策略
CREATE POLICY "允许所有用户查看头像"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'avatars');

CREATE POLICY "允许用户管理自己的头像"
ON storage.objects FOR ALL
TO authenticated
USING (
  bucket_id = 'avatars' AND
  name LIKE auth.uid() || '-%'
);

-- 允许管理员管理所有头像
CREATE POLICY "允许管理员管理所有头像"
ON storage.objects FOR ALL
TO authenticated
USING (
  bucket_id = 'avatars' AND
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE id = auth.uid()
    AND role = 'admin'
  )
);

-- 创建网站图标存储桶
INSERT INTO storage.buckets (id, name, public) VALUES ('site-icons', 'site-icons', true);

-- 设置网站图标存储桶的访问策略
CREATE POLICY "允许所有用户查看网站图标"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'site-icons');

CREATE POLICY "允许管理员管理网站图标"
ON storage.objects FOR ALL
TO authenticated
USING (
  bucket_id = 'site-icons' AND
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE id = auth.uid()
    AND role = 'admin'
  )
);

-- 仪表盘统计函数
-- 1. 收录网站数量（已批准的站点）
CREATE OR REPLACE FUNCTION get_approved_sites_count()
RETURNS INTEGER AS $$
BEGIN
    RETURN (SELECT COUNT(*) FROM sites WHERE status = 'approved');
END;
$$ LANGUAGE plpgsql;

-- 2. 访问次数（所有站点的访问次数总和）
CREATE OR REPLACE FUNCTION get_total_visits()
RETURNS INTEGER AS $$
BEGIN
    RETURN (SELECT COALESCE(SUM(visits), 0) FROM sites);
END;
$$ LANGUAGE plpgsql;

-- 3. 分类数量（活跃分类）
CREATE OR REPLACE FUNCTION get_active_categories_count()
RETURNS INTEGER AS $$
BEGIN
    RETURN (SELECT COUNT(*) FROM categories WHERE status = 'active');
END;
$$ LANGUAGE plpgsql;

-- 4. 用户数量（所有用户）
CREATE OR REPLACE FUNCTION get_total_users_count()
RETURNS INTEGER AS $$
BEGIN
    RETURN (SELECT COUNT(*) FROM auth.users);
END;
$$ LANGUAGE plpgsql;

-- 5. 今日新增数据统计函数
CREATE OR REPLACE FUNCTION get_today_new_sites_count()
RETURNS INTEGER AS $$
BEGIN
    RETURN (
        SELECT COUNT(*)
        FROM sites
        WHERE DATE(created_at) = CURRENT_DATE
    );
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION get_today_new_visits_count()
RETURNS INTEGER AS $$
BEGIN
    RETURN (
        SELECT COUNT(*)
        FROM site_visits
        WHERE DATE(visit_time) = CURRENT_DATE
    );
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION get_today_new_categories_count()
RETURNS INTEGER AS $$
BEGIN
    RETURN (
        SELECT COUNT(*)
        FROM categories
        WHERE DATE(created_at) = CURRENT_DATE
    );
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION get_today_new_users_count()
RETURNS INTEGER AS $$
BEGIN
    RETURN (
        SELECT COUNT(*)
        FROM auth.users
        WHERE DATE(created_at) = CURRENT_DATE
    );
END;
$$ LANGUAGE plpgsql;

-- 获取热门站点数据（七日热度）
CREATE OR REPLACE FUNCTION get_hot_sites_seven_days()
RETURNS TABLE (
    site_id UUID,
    site_name VARCHAR,
    seven_day_heat NUMERIC
) AS $$
BEGIN
    RETURN QUERY
    WITH daily_visits AS (
        SELECT 
            s.id as site_id,
            s.name as site_name,
            DATE(v.visit_time) as visit_date,
            COUNT(*) as visit_count
        FROM sites s
        LEFT JOIN site_visits v ON s.id = v.site_id
        WHERE v.visit_time >= CURRENT_DATE - INTERVAL '7 days'
        GROUP BY s.id, s.name, DATE(v.visit_time)
    ),
    weighted_visits AS (
        SELECT 
            daily_visits.site_id,
            daily_visits.site_name,
            SUM(
                daily_visits.visit_count * 
                CASE 
                    WHEN daily_visits.visit_date = CURRENT_DATE THEN 1.0
                    WHEN daily_visits.visit_date = CURRENT_DATE - INTERVAL '1 day' THEN 0.9
                    WHEN daily_visits.visit_date = CURRENT_DATE - INTERVAL '2 days' THEN 0.8
                    WHEN daily_visits.visit_date = CURRENT_DATE - INTERVAL '3 days' THEN 0.7
                    WHEN daily_visits.visit_date = CURRENT_DATE - INTERVAL '4 days' THEN 0.6
                    WHEN daily_visits.visit_date = CURRENT_DATE - INTERVAL '5 days' THEN 0.5
                    WHEN daily_visits.visit_date = CURRENT_DATE - INTERVAL '6 days' THEN 0.4
                END
            ) as seven_day_heat
        FROM daily_visits
        GROUP BY daily_visits.site_id, daily_visits.site_name
    )
    SELECT 
        weighted_visits.site_id,
        weighted_visits.site_name,
        COALESCE(weighted_visits.seven_day_heat, 0) as seven_day_heat
    FROM weighted_visits
    ORDER BY weighted_visits.seven_day_heat DESC
    LIMIT 10;
END;
$$ LANGUAGE plpgsql;

-- 获取热门站点数据（总计热度）
CREATE OR REPLACE FUNCTION get_hot_sites_total()
RETURNS TABLE (
    site_id UUID,
    site_name VARCHAR,
    total_heat NUMERIC
) AS $$
BEGIN
    RETURN QUERY
    WITH daily_visits AS (
        SELECT 
            s.id as site_id,
            s.name as site_name,
            DATE(v.visit_time) as visit_date,
            COUNT(*) as visit_count
        FROM sites s
        LEFT JOIN site_visits v ON s.id = v.site_id
        GROUP BY s.id, s.name, DATE(v.visit_time)
    ),
    weighted_visits AS (
        SELECT 
            daily_visits.site_id,
            daily_visits.site_name,
            SUM(
                daily_visits.visit_count * 
                POWER(0.999, EXTRACT(EPOCH FROM (CURRENT_DATE - daily_visits.visit_date)) / 86400)
            ) as total_heat
        FROM daily_visits
        GROUP BY daily_visits.site_id, daily_visits.site_name
    )
    SELECT 
        weighted_visits.site_id,
        weighted_visits.site_name,
        COALESCE(weighted_visits.total_heat, 0) as total_heat
    FROM weighted_visits
    ORDER BY weighted_visits.total_heat DESC
    LIMIT 10;
END;
$$ LANGUAGE plpgsql;

-- 创建获取仪表盘统计数据的存储过程
CREATE OR REPLACE FUNCTION get_dashboard_stats(today_date DATE, yesterday_date DATE)
RETURNS TABLE (
    total_sites BIGINT,
    total_visits BIGINT,
    total_categories BIGINT,
    total_users BIGINT,
    today_sites BIGINT,
    today_visits BIGINT,
    today_categories BIGINT,
    today_users BIGINT,
    yesterday_sites BIGINT,
    yesterday_visits BIGINT,
    yesterday_categories BIGINT,
    yesterday_users BIGINT
) AS $$
BEGIN
    RETURN QUERY
    WITH stats AS (
        -- 获取总数统计
        SELECT
            (SELECT COUNT(*) FROM sites WHERE status = 'approved') as total_sites,
            (SELECT COUNT(*) FROM site_visits) as total_visits,
            (SELECT COUNT(*) FROM categories WHERE status = 'active') as total_categories,
            (SELECT COUNT(*) FROM user_roles) as total_users,
            
            -- 获取今日统计
            (SELECT COUNT(*) FROM sites WHERE status = 'approved' AND DATE(created_at AT TIME ZONE 'UTC') = today_date) as today_sites,
            (SELECT COUNT(*) FROM site_visits WHERE DATE(visit_time AT TIME ZONE 'UTC') = today_date) as today_visits,
            (SELECT COUNT(*) FROM categories WHERE status = 'active' AND DATE(created_at AT TIME ZONE 'UTC') = today_date) as today_categories,
            (SELECT COUNT(*) FROM user_roles WHERE DATE(created_at AT TIME ZONE 'UTC') = today_date) as today_users,
            
            -- 获取昨日统计
            (SELECT COUNT(*) FROM sites WHERE status = 'approved' AND DATE(created_at AT TIME ZONE 'UTC') = yesterday_date) as yesterday_sites,
            (SELECT COUNT(*) FROM site_visits WHERE DATE(visit_time AT TIME ZONE 'UTC') = yesterday_date) as yesterday_visits,
            (SELECT COUNT(*) FROM categories WHERE status = 'active' AND DATE(created_at AT TIME ZONE 'UTC') = yesterday_date) as yesterday_categories,
            (SELECT COUNT(*) FROM user_roles WHERE DATE(created_at AT TIME ZONE 'UTC') = yesterday_date) as yesterday_users
    )
    SELECT * FROM stats;
END;
$$ LANGUAGE plpgsql;

-- 授予所有必要的权限
GRANT USAGE ON SCHEMA public TO authenticated, anon;
GRANT ALL ON public.user_roles TO authenticated, anon;
GRANT ALL ON public.categories TO authenticated, anon;
GRANT ALL ON public.sites TO authenticated, anon;
GRANT ALL ON public.tags TO authenticated, anon;
GRANT ALL ON public.site_tags TO authenticated, anon;
GRANT ALL ON public.category_site_orders TO authenticated, anon;
GRANT ALL ON public.friend_links TO authenticated, anon;
GRANT ALL ON public.site_visits TO authenticated, anon;
GRANT USAGE ON TYPE public.user_role TO authenticated, anon;
GRANT EXECUTE ON FUNCTION public.handle_new_user() TO authenticated, anon;
GRANT EXECUTE ON FUNCTION public.update_site_visits_count() TO authenticated, anon;
GRANT EXECUTE ON FUNCTION public.reorder_category_sites(UUID, UUID[]) TO authenticated, anon;
GRANT EXECUTE ON FUNCTION public.get_approved_sites_count() TO authenticated, anon;
GRANT EXECUTE ON FUNCTION public.get_total_visits() TO authenticated, anon;
GRANT EXECUTE ON FUNCTION public.get_active_categories_count() TO authenticated, anon;
GRANT EXECUTE ON FUNCTION public.get_total_users_count() TO authenticated, anon;
GRANT EXECUTE ON FUNCTION public.get_today_new_sites_count() TO authenticated, anon;
GRANT EXECUTE ON FUNCTION public.get_today_new_visits_count() TO authenticated, anon;
GRANT EXECUTE ON FUNCTION public.get_today_new_categories_count() TO authenticated, anon;
GRANT EXECUTE ON FUNCTION public.get_today_new_users_count() TO authenticated, anon;
GRANT EXECUTE ON FUNCTION public.get_hot_sites_seven_days() TO authenticated, anon;
GRANT EXECUTE ON FUNCTION public.get_hot_sites_total() TO authenticated, anon;
GRANT EXECUTE ON FUNCTION get_dashboard_stats(DATE, DATE) TO authenticated, anon;
