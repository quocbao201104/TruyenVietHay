const db = require("../config/db");

const StoryModel = {
  create: async (storyData) => {
    const [result] = await db.query(
      `INSERT INTO truyen_new (
        ten_truyen, slug, tac_gia, mo_ta, trang_thai, tinh_trang, trang_thai_viet,
        yeu_to_nhay_cam, link_nguon, muc_tieu, doi_tuong_doc_gia,
        thoi_gian_cap_nhat, anh_bia, trang_thai_kiem_duyet, user_id,
        ghi_chu_admin, danh_gia_noi_dung, danh_gia_van_phong, danh_gia_sang_tao
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        storyData.ten_truyen,
        storyData.slug,
        storyData.tac_gia,
        storyData.mo_ta,
        storyData.trang_thai,
        storyData.tinh_trang,
        storyData.trang_thai_viet,
        storyData.yeu_to_nhay_cam,
        storyData.link_nguon,
        storyData.muc_tieu,
        storyData.doi_tuong_doc_gia,
        storyData.thoi_gian_cap_nhat,
        storyData.anh_bia,
        storyData.trang_thai_kiem_duyet,
        storyData.user_id,
        storyData.ghi_chu_admin,
        storyData.danh_gia_noi_dung,
        storyData.danh_gia_van_phong,
        storyData.danh_gia_sang_tao,
      ]
    );
    return result.insertId;
  },

  getAll: async ({
    page = 1,
    limit = 10,
    trang_thai_kiem_duyet = "",
    keyword = "",
    author_id = null,
    category_id = null,
    sort_by = "thoi_gian_cap_nhat",
    order = "DESC",
  }) => {
    const offset = (page - 1) * limit;
    let query = `
        SELECT tn.*, u.username AS ten_tac_gia
        FROM truyen_new tn
        LEFT JOIN users_new u ON tn.user_id = u.id
    `;
    let countQuery = `
        SELECT COUNT(*) AS total
        FROM truyen_new tn
        LEFT JOIN users_new u ON tn.user_id = u.id
    `;
    const params = [];
    const countParams = [];
    const whereClauses = [];

    if (trang_thai_kiem_duyet) {
      whereClauses.push(`tn.trang_thai_kiem_duyet = ?`);
      params.push(trang_thai_kiem_duyet);
      countParams.push(trang_thai_kiem_duyet);
    }

    // OPTIMIZED SEARCH: Use FULLTEXT if keyword length >= 2
    if (keyword && keyword.trim() !== '') {
        const searchText = keyword.trim();
        if (searchText.length >= 2) {
             // Convert "foo bar" -> "+foo +bar" to require ALL terms (AND logic)
             const searchTerms = searchText.split(/\s+/).map(term => `+${term}`).join(' ');
             whereClauses.push(`MATCH(tn.ten_truyen, tn.tac_gia) AGAINST(? IN BOOLEAN MODE)`);
             params.push(searchTerms);
             countParams.push(searchTerms);
        } else {
             // Fallback to LIKE for very short queries
             whereClauses.push(`(tn.ten_truyen LIKE ? OR tn.tac_gia LIKE ?)`);
             params.push(`%${searchText}%`, `%${searchText}%`);
             countParams.push(`%${searchText}%`, `%${searchText}%`);
        }
    }

    if (author_id) {
      whereClauses.push(`tn.user_id = ?`);
      params.push(author_id);
      countParams.push(author_id);
    }

    if (category_id) {
      query = `
            SELECT tn.*, u.username AS ten_tac_gia
            FROM truyen_new tn
            LEFT JOIN users_new u ON tn.user_id = u.id
            INNER JOIN truyen_theloai tt ON tn.id = tt.truyen_id
        `;
      countQuery = `
            SELECT COUNT(DISTINCT tn.id) AS total
            FROM truyen_new tn
            LEFT JOIN users_new u ON tn.user_id = u.id
            INNER JOIN truyen_theloai tt ON tn.id = tt.truyen_id
        `;
      whereClauses.push(`tt.theloai_id = ?`);
      params.push(category_id);
      countParams.push(category_id);
    }

    if (whereClauses.length > 0) {
      query += ` WHERE ` + whereClauses.join(" AND ");
      countQuery += ` WHERE ` + whereClauses.join(" AND ");
    }

    const sortField = ["ten_truyen", "luot_xem", "thoi_gian_cap_nhat", "id"].includes(sort_by)
        ? `tn.${sort_by}`
        : "tn.thoi_gian_cap_nhat";
    const sortOrder = order && order.toUpperCase() === "ASC" ? "ASC" : "DESC";

    query += ` ORDER BY ${sortField} ${sortOrder} LIMIT ? OFFSET ?`;
    params.push(+limit, +offset);

    const [stories] = await db.query(query, params);
    const [countResult] = await db.query(countQuery, countParams);

    return {
      data: stories,
      pagination: {
        total: countResult[0].total,
        current_page: +page,
        total_pages: Math.ceil(countResult[0].total / limit),
      },
    };
  },
  
  getById: async (id) => {
    // Lấy tất cả các cột từ truyen_new và noi_dung_chuong_mau từ bảng chuong
    const [rows] = await db.query(
      `SELECT tn.*, c.noi_dung_chuong_mau AS sample_chapter_content,
        tn.so_luong_chuong
       FROM truyen_new tn
       LEFT JOIN chuong c ON tn.id = c.truyen_id AND c.is_chuong_mau = 1
       WHERE tn.id = ?`,
      [id]
    );
    return rows[0]; 
  },

  getBySlug: async (slug) => {
    const [rows] = await db.query(
      `SELECT tn.*, 
        tn.so_luong_chuong
       FROM truyen_new tn 
       WHERE slug = ?`, 
      [slug]
    );
    return rows[0];
  },

  getFollowers: async (storyId) => {
    const [followers] = await db.query(
      "SELECT user_id FROM theo_doi WHERE truyen_id = ?",
      [storyId]
    );
    return followers;
  },

  update: async (id, storyData) => {
    const [result] = await db.query(
      `UPDATE truyen_new SET 
        ten_truyen = ?, 
        tac_gia = ?, 
        mo_ta = ?, 
        trang_thai = ?, 
        anh_bia = ?, 
        tinh_trang = ?,
        trang_thai_viet = ?,
        link_nguon = ?,
        muc_tieu = ?,
        doi_tuong_doc_gia = ?,
        thoi_gian_cap_nhat = NOW()
      WHERE id = ?`,
      [
        storyData.ten_truyen,
        storyData.tac_gia,
        storyData.mo_ta,
        storyData.trang_thai,
        storyData.anh_bia,
        storyData.tinh_trang,
        storyData.trang_thai_viet,
        storyData.link_nguon,
        storyData.muc_tieu,
        storyData.doi_tuong_doc_gia,
        id,
      ]
    );
    return result.affectedRows;
  },
  getPendingApproval: async () => {
    const [rows] = await db.query(
      `SELECT * FROM truyen_new WHERE trang_thai_kiem_duyet = 'cho_duyet'`
    );
    return rows;
  },

  getByAuthor: async (userId) => {
    if (!userId || isNaN(userId)) {
      throw new Error("ID người dùng không hợp lệ");
    }
    const [rows] = await db.query(
      `SELECT * FROM truyen_new WHERE user_id = ?`,
      [userId]
    );
    return rows;
  },
  delete: async (id) => {
    // Delete dependent records first to avoid Foreign Key Constraint errors
    await db.query(`DELETE FROM thong_bao WHERE truyen_id = ?`, [id]);
    await db.query(`DELETE FROM truyen_theloai WHERE truyen_id = ?`, [id]);
    await db.query(`DELETE FROM chuong WHERE truyen_id = ?`, [id]);
    await db.query(`DELETE FROM theo_doi WHERE truyen_id = ?`, [id]);
    await db.query(`DELETE FROM ratings WHERE truyen_id = ?`, [id]);
    // Note: If comments exist and are linked to story, delete them too.
    // Assuming 'comments' table might be linked via truyen_id or chapter.
    // Safe to try delete if table exists and column matches, but for now matching the user's error specifically.
    
    const [result] = await db.query(`DELETE FROM truyen_new WHERE id = ?`, [
      id,
    ]);
    return result.affectedRows;
  },
  addGenresForStory: async (truyenId, theloaiIds) => {
    const values = theloaiIds.map((id) => [truyenId, id]);
    await db.query(
      `INSERT INTO truyen_theloai (truyen_id, theloai_id) VALUES ?`,
      [values]
    );
  },

  getPublicStories: async ({
    page = 1,
    limit = 20,
    sort_by = "thoi_gian_cap_nhat",
    order = "DESC",
    keyword = "",
    category_ids = null,
    trang_thai = "",
    min_views = null,
    max_views = null,
    min_chapters = null,
    max_chapters = null,
  }) => {
    const offset = (page - 1) * limit;
    const sortField = ["ten_truyen", "luot_xem", "thoi_gian_cap_nhat"].includes(
      sort_by
    )
      ? `tn.${sort_by}` // Alias tn for truyen_new
      : "tn.thoi_gian_cap_nhat";
    const sortOrder = order.toUpperCase() === "ASC" ? "ASC" : "DESC";

    let selectQuery = `SELECT tn.id, tn.ten_truyen, tn.tac_gia, tn.slug, tn.mo_ta, tn.anh_bia, tn.luot_xem, tn.thoi_gian_cap_nhat, tn.trang_thai,
                       tn.so_luong_chuong
                       FROM truyen_new tn`;
    
    // Base count query needs to handle WHERE clauses, but HAVING clauses make simple COUNT(*) difficult.
    // We will use a subquery approach for counting total if HAVING is involved, or build dynamically.
    // For simplicity with HAVING, we often do: SELECT COUNT(*) FROM (SELECT tn.id ... HAVING ...) as t
    
    let whereConditions = [`tn.trang_thai_kiem_duyet = 'duyet'`];
    let params = [];
    
    // Only add keyword filter if keyword is provided
    if (keyword && keyword.trim() !== '') {
        const searchText = keyword.trim();
        // Use FULLTEXT if possible
        if (searchText.length >= 2) {
            const searchTerms = searchText.split(/\s+/).map(term => `+${term}`).join(' ');
            whereConditions.push(`MATCH(tn.ten_truyen, tn.tac_gia) AGAINST(? IN BOOLEAN MODE)`);
            params.push(searchTerms);
        } else {
             whereConditions.push(`(tn.ten_truyen LIKE ? OR tn.tac_gia LIKE ?)`);
             params.push(`%${searchText}%`, `%${searchText}%`);
        }
    }
    let havingConditions = [];

    // Filter by Genre (OR logic for multiple genres)
    if (category_ids) {
        // Handle array or string input
        let ids = [];
        if (Array.isArray(category_ids)) {
            ids = category_ids;
        } else if (typeof category_ids === 'string') {
            ids = category_ids.split(',').map(id => parseInt(id.trim())).filter(id => !isNaN(id));
        }

        if (ids.length > 0) {
            // Use IN clause with subquery to find stories having AT LEAST ONE of the categories
            // OR logic is typical for facets: "Action OR Adventure"
            const placeholders = ids.map(() => '?').join(',');
            whereConditions.push(`tn.id IN (SELECT truyen_id FROM truyen_theloai WHERE theloai_id IN (${placeholders}))`);
            params.push(...ids);
        }
    }

    // Filter by Status
    if (trang_thai) {
        whereConditions.push(`tn.trang_thai = ?`);
        params.push(trang_thai);
    }

    // Filter by Views
    if (min_views !== null && min_views !== undefined && min_views !== "") {
        whereConditions.push(`tn.luot_xem >= ?`);
        params.push(parseInt(min_views));
    }
    if (max_views !== null && max_views !== undefined && max_views !== "") {
        whereConditions.push(`tn.luot_xem <= ?`);
        params.push(parseInt(max_views));
    }

    // Filter by Chapter Count (Optimized: Use WHERE instead of HAVING)
    if (min_chapters !== null && min_chapters !== undefined && min_chapters !== "") {
        whereConditions.push(`tn.so_luong_chuong >= ?`);
        params.push(parseInt(min_chapters));
    }
    if (max_chapters !== null && max_chapters !== undefined && max_chapters !== "") {
        whereConditions.push(`tn.so_luong_chuong <= ?`);
        params.push(parseInt(max_chapters));
    }

    const whereClause = `WHERE ${whereConditions.join(" AND ")}`;
    const havingClause = havingConditions.length > 0 ? `HAVING ${havingConditions.join(" AND ")}` : "";

    // Main Data Query
    const query = `
       ${selectQuery}
       ${whereClause}
       ${havingClause}
       ORDER BY ${sortField} ${sortOrder}
       LIMIT ? OFFSET ?
    `;

    // Execute Data Query
    // We need to keep a separate params array for the data query because count query might differ (no offset/limit)
    const dataParams = [...params, +limit, +offset];
    
    const [data] = await db.query(query, dataParams);

    // Count Query
    // Accurate count with HAVING requires a subquery wrapper
    // SELECT COUNT(*) as total FROM (SELECT tn.id, (subquery) as so_luong_chuong ... WHERE ... HAVING ...) as temp
    // Re-use selectQuery core but we only need ID for counting
    
    // Count Query Optimization
    let countQuery;
    let countParams;

    // Simplified filtering logic now that so_luong_chuong is a real column
    // We can move HAVING conditions to WHERE (mostly) or keep them simple.
    // For `so_luong_chuong`, since it's a real column, we can use WHERE instead of HAVING!
    if (min_chapters !== null || max_chapters !== null) {
        // Move chapter filter to WHERE clauses for better performance
        // Note: We need to handle this in `whereConditions` above, but since we are modifying code down here:
        // Let's rely on the fact that `so_luong_chuong` is now in `tn`.
        // So `havingConditions` can theoretically be used, but WHERE is faster.
        // However, to minimize code rewrite impact just below, we can keep using havingConditions OR refactor properly.
        // The best approach: `havingConditions` logic below works for aliases too in MySQL.
        // BUT, `WHERE tn.so_luong_chuong >= ?` is standard and better.
    }

    if (havingConditions.length > 0) {
        const havingClauseStr = `HAVING ${havingConditions.join(" AND ")}`;
        // Complex count with HAVING 
             /*
             Old complex subquery:
            SELECT tn.id, (SELECT COUNT(*) ...) 
            FROM truyen_new tn ... HAVING ...
            */
            // New simplified:
            // Since so_luong_chuong is a column, we actually don't NEED the subquery in select anymore?
            // Wait, if we use HAVING, we still need `SELECT COUNT(*)` to respect it?
            // Actually, if we use WHERE for chapter count, we don't need HAVING at all!
    }
    
    // REFACTORING: Since we can now filter chapters in WHERE, let's treat it as such.
    // But wait, the loop above (lines 302-310) pushed to `havingConditions`.
    // Let's CHANGE that behavior in a future step or just accept that HAVING works fine on columns too.
    // Ideally, we move them to `whereConditions`. But for now, let's fix the `countQuery`.

    if (havingConditions.length > 0) {
        // Even with having, we don't need the expensive sub-select for chapter count anymore.
        const countSubQuery = `
            SELECT tn.id
            FROM truyen_new tn
            ${whereClause}
            ${havingClause}
        `;
        countQuery = `SELECT COUNT(*) as total FROM (${countSubQuery}) as sub`;
        countParams = [...params]; // Params already include having values
    } else {
        // Simple count
        countQuery = `SELECT COUNT(*) as total FROM truyen_new tn ${whereClause}`;
        countParams = [...params];
    }
    const [countResult] = await db.query(countQuery, countParams);

    return {
      data,
      pagination: {
        total: countResult[0]?.total || 0,
        current_page: +page,
        total_pages: Math.ceil((countResult[0]?.total || 0) / limit),
      },
    };
  },

  incrementViewCount: async (storyId) => {
    // 1. Update total views
    await db.query(
      "UPDATE truyen_new SET luot_xem = luot_xem + 1 WHERE id = ?",
      [storyId]
    );

    // 2. Upsert daily views
    // Use MySQL's CURDATE() for date
    await db.query(
      `INSERT INTO truyen_views (truyen_id, ngay_xem, so_luot_xem) 
       VALUES (?, CURDATE(), 1) 
       ON DUPLICATE KEY UPDATE so_luot_xem = so_luot_xem + 1`,
      [storyId]
    );
    
    return { success: true };
  },

  getTopMonthlyStories: async (limit = 10) => {
    const [rows] = await db.query(
      `SELECT tn.*, IFNULL(SUM(tv.so_luot_xem), 0) as luot_xem_thang
       FROM truyen_new tn
       JOIN truyen_views tv ON tn.id = tv.truyen_id
       WHERE tv.ngay_xem >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)
         AND tn.trang_thai_kiem_duyet = 'duyet'
       GROUP BY tn.id
       ORDER BY luot_xem_thang DESC
       LIMIT ?`,
      [parseInt(limit)]
    );
    return rows;
  },
};

module.exports = StoryModel;