-- 数据库初始数据

-- 初始化分类数据
INSERT INTO categories (name, description, icon, order_index, status) VALUES
('技术博客', '分享技术经验和知识的博客', 'code', 1, 'active'),
('设计资源', 'UI/UX设计相关资源', 'palette', 2, 'active'),
('工具导航', '实用的在线工具集合', 'tools', 3, 'active'),
('学习资源', '编程学习相关资源', 'book', 4, 'active'),
('开源项目', '优秀的开源项目推荐', 'github', 5, 'active');

-- 初始化标签数据
INSERT INTO tags (name) VALUES
('前端'),
('后端'),
('全栈'),
('UI设计'),
('UX设计'),
('工具'),
('教程'),
('开源'),
('AI'),
('数据库');

-- 初始化站点数据
INSERT INTO sites (name, url, description, category_id, status, visits) VALUES
('掘金', 'https://juejin.cn', '掘金是一个帮助开发者成长的社区', 
 (SELECT id FROM categories WHERE name = '技术博客'), 'approved', 1000),
('Dribbble', 'https://dribbble.com', '全球最大的设计师作品分享平台', 
 (SELECT id FROM categories WHERE name = '设计资源'), 'approved', 800),
('CodePen', 'https://codepen.io', '在线代码编辑器，前端开发者的游乐场', 
 (SELECT id FROM categories WHERE name = '工具导航'), 'approved', 1200),
('MDN Web Docs', 'https://developer.mozilla.org', 'Mozilla的Web技术文档', 
 (SELECT id FROM categories WHERE name = '学习资源'), 'approved', 2000),
('GitHub', 'https://github.com', '全球最大的代码托管平台', 
 (SELECT id FROM categories WHERE name = '开源项目'), 'approved', 3000);

-- 初始化站点-标签关联数据
INSERT INTO site_tags (site_id, tag_id) VALUES
((SELECT id FROM sites WHERE name = '掘金'), (SELECT id FROM tags WHERE name = '前端')),
((SELECT id FROM sites WHERE name = '掘金'), (SELECT id FROM tags WHERE name = '后端')),
((SELECT id FROM sites WHERE name = 'Dribbble'), (SELECT id FROM tags WHERE name = 'UI设计')),
((SELECT id FROM sites WHERE name = 'Dribbble'), (SELECT id FROM tags WHERE name = 'UX设计')),
((SELECT id FROM sites WHERE name = 'CodePen'), (SELECT id FROM tags WHERE name = '前端')),
((SELECT id FROM sites WHERE name = 'CodePen'), (SELECT id FROM tags WHERE name = '工具')),
((SELECT id FROM sites WHERE name = 'MDN Web Docs'), (SELECT id FROM tags WHERE name = '教程')),
((SELECT id FROM sites WHERE name = 'MDN Web Docs'), (SELECT id FROM tags WHERE name = '前端')),
((SELECT id FROM sites WHERE name = 'GitHub'), (SELECT id FROM tags WHERE name = '开源')),
((SELECT id FROM sites WHERE name = 'GitHub'), (SELECT id FROM tags WHERE name = '工具'));

-- 初始化友情链接数据
INSERT INTO friend_links (name, url, description, status) VALUES
('Vue.js', 'https://vuejs.org', '渐进式JavaScript框架', 'approved'),
('React', 'https://reactjs.org', '用于构建用户界面的JavaScript库', 'approved'),
('Next.js', 'https://nextjs.org', 'React框架', 'approved'),
('Tailwind CSS', 'https://tailwindcss.com', '实用优先的CSS框架', 'approved'),
('TypeScript', 'https://www.typescriptlang.org', 'JavaScript的超集', 'approved');

-- 初始化站点访问记录数据
INSERT INTO site_visits (site_id, ip_address, user_agent, visit_time) VALUES
((SELECT id FROM sites WHERE name = '掘金'), '192.168.1.1', 'Mozilla/5.0', NOW() - INTERVAL '1 day'),
((SELECT id FROM sites WHERE name = 'Dribbble'), '192.168.1.2', 'Chrome/91.0', NOW() - INTERVAL '2 days'),
((SELECT id FROM sites WHERE name = 'CodePen'), '192.168.1.3', 'Firefox/89.0', NOW() - INTERVAL '3 days'),
((SELECT id FROM sites WHERE name = 'MDN Web Docs'), '192.168.1.4', 'Safari/14.0', NOW() - INTERVAL '4 days'),
((SELECT id FROM sites WHERE name = 'GitHub'), '192.168.1.5', 'Edge/91.0', NOW() - INTERVAL '5 days');

-- 初始化分类-站点排序数据
DO $$
BEGIN
    -- 技术博客分类排序
    PERFORM reorder_category_sites(
        (SELECT id FROM categories WHERE name = '技术博客'),
        ARRAY[
            (SELECT id FROM sites WHERE name = '掘金'),
            (SELECT id FROM sites WHERE name = 'MDN Web Docs')
        ]
    );

    -- 设计资源分类排序
    PERFORM reorder_category_sites(
        (SELECT id FROM categories WHERE name = '设计资源'),
        ARRAY[
            (SELECT id FROM sites WHERE name = 'Dribbble')
        ]
    );

    -- 工具导航分类排序
    PERFORM reorder_category_sites(
        (SELECT id FROM categories WHERE name = '工具导航'),
        ARRAY[
            (SELECT id FROM sites WHERE name = 'CodePen')
        ]
    );

    -- 开源项目分类排序
    PERFORM reorder_category_sites(
        (SELECT id FROM categories WHERE name = '开源项目'),
        ARRAY[
            (SELECT id FROM sites WHERE name = 'GitHub')
        ]
    );
END $$; 